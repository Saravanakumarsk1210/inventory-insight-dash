
import { useState, useMemo } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUniqueProductNames } from "@/utils/formatters";
import { StockLevelComparison } from "./StockLevelComparison";
import { ProductInsights } from "./analytics/ProductInsights";
import { ExpiringItemsList } from "./analytics/ExpiringItemsList";
import { ReorderPlanTable } from "./analytics/ReorderPlanTable";

interface AnalyticsTabProps {
  data: InventoryItem[];
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const uniqueProductNames = useMemo(() => getUniqueProductNames(data), [data]);
  
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (productFilter !== "all") {
        const productName = item.particulars.split(" - ")[0].trim();
        if (productName !== productFilter) return false;
      }
      
      if (expiryFilter !== "all") {
        const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
        const status = getExpiryStatus(daysUntilExpiry);
        
        if (expiryFilter === "expired" && status !== "expired") return false;
        if (expiryFilter === "expiring-soon" && status !== "expiring-soon") return false;
        if (expiryFilter === "good" && status !== "good") return false;
      }
      
      if (searchQuery) {
        return item.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.particularId.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  }, [data, productFilter, expiryFilter, searchQuery]);
  
  // Helper function for expiry calculations
  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (days: number) => {
    if (days < 0) return "expired";
    if (days < 90) return "expiring-soon";
    return "good";
  };

  const calculateStockLevels = (items: InventoryItem[]) => {
    const stockLevels = new Map<string, { total: number, count: number }>();
    
    items.forEach(item => {
      const productName = item.particulars.split(' - ')[0];
      if (!stockLevels.has(productName)) {
        stockLevels.set(productName, { total: 0, count: 0 });
      }
      
      const stockInfo = stockLevels.get(productName)!;
      
      let quantity = 0;
      if (typeof item.quantity === 'number') {
        quantity = item.quantity;
      } else {
        const matches = item.quantity.match(/^(\d+)/);
        if (matches && matches[1]) {
          quantity = parseInt(matches[1]);
        }
      }
      
      stockInfo.total += quantity;
      stockInfo.count += 1;
    });
    
    return Array.from(stockLevels.entries())
      .map(([name, { total, count }]) => ({ 
        name, 
        stock: total,
        minThreshold: Math.round(total * 0.2),
        batches: count
      }));
  };

  // Computed data for components
  const stockLevelsData = useMemo(() => calculateStockLevels(filteredData), [filteredData]);
  
  const selectedProductData = useMemo(() => {
    if (!selectedProduct) return null;
    
    const productItems = filteredData.filter(item => 
      item.particulars.split(' - ')[0] === selectedProduct
    );
    
    const batches = productItems.length;
    let totalQuantity = 0;
    let totalValue = 0;
    
    productItems.forEach(item => {
      if (typeof item.quantity === 'number') {
        totalQuantity += item.quantity;
      } else {
        const matches = item.quantity.match(/^(\d+)/);
        if (matches && matches[1]) {
          totalQuantity += parseInt(matches[1]);
        }
      }
      
      if (typeof item.value === 'number') {
        totalValue += item.value;
      } else if (typeof item.value === 'string') {
        totalValue += parseFloat(item.value) || 0;
      }
    });
    
    return {
      name: selectedProduct,
      batches,
      totalQuantity,
      totalValue,
      items: productItems
    };
  }, [selectedProduct, filteredData]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Product-wise Stock Levels */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Product-wise Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <StockLevelComparison data={data} />
          </CardContent>
        </Card>

        {/* 2. Expiring Soon Alert */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expiring Soon Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpiringItemsList data={data} />
          </CardContent>
        </Card>

        {/* 3. Reorder Plan */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Reorder Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ReorderPlanTable data={data} />
          </CardContent>
        </Card>

        {/* 4. Product Insights */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Product Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductInsights 
              data={filteredData}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              productFilter={productFilter}
              setProductFilter={setProductFilter}
              expiryFilter={expiryFilter}
              setExpiryFilter={setExpiryFilter}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              uniqueProductNames={uniqueProductNames}
              stockLevelsData={stockLevelsData}
              selectedProductData={selectedProductData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsTab;
