import { useState, useMemo } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { getUniqueProductNames } from "@/utils/formatters";

// Import the new component files
import { MonthlySalesChart } from "./analytics/MonthlySalesChart";
import { ExpiryRiskChart } from "./analytics/ExpiryRiskChart";
import { ProductPerformanceChart } from "./analytics/ProductPerformanceChart";
import { ProductInsights } from "./analytics/ProductInsights";
import { StockOverviewChart } from "./analytics/StockOverviewChart";
import { PredictedStockTable } from "./analytics/PredictedStockTable";
import { PerformanceTab } from "./analytics/PerformanceTab";
import { ForecastingTab } from "./analytics/ForecastingTab";
import { StockInsightsTab } from "./analytics/StockInsightsTab";

interface AnalyticsTabProps {
  data: InventoryItem[];
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
  const [activeTab, setActiveTab] = useState("stock-insights");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [predictedDays, setPredictedDays] = useState(30);
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
  
  // Data calculation functions
  const calculateMonthlySales = (items: InventoryItem[]) => {
    const monthlySales: { [month: string]: number } = {};
    items.forEach(item => {
      const expiryDate = new Date(item.expiryDate);
      const monthYear = `${expiryDate.getMonth() + 1}-${expiryDate.getFullYear()}`;
      monthlySales[monthYear] = (monthlySales[monthYear] || 0) + 1;
    });
    return Object.entries(monthlySales).map(([month, sales]) => ({ month, sales }));
  };

  const calculateExpiryRisk = (items: InventoryItem[]) => {
    const expiryRisk: { [status: string]: number } = {
      "expired": 0,
      "expiring-soon": 0,
      "good": 0
    };

    items.forEach(item => {
      const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
      const status = getExpiryStatus(daysUntilExpiry);
      expiryRisk[status]++;
    });

    return Object.entries(expiryRisk).map(([status, count]) => ({ status, count }));
  };

  const calculateProductPerformance = (items: InventoryItem[]) => {
    const productPerformance = new Map<string, { sold: number, expired: number }>();

    items.forEach(item => {
      const productName = item.particulars.split(' - ')[0];
      if (!productPerformance.has(productName)) {
        productPerformance.set(productName, { sold: 0, expired: 0 });
      }

      const performance = productPerformance.get(productName)!;
      const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
      const status = getExpiryStatus(daysUntilExpiry);

      if (status === 'expired') {
        performance.expired++;
      } else {
        performance.sold++;
      }
    });

    return Array.from(productPerformance.entries())
      .map(([name, { sold, expired }]) => ({ name, sold, expired }));
  };

  const predictStockLevels = (items: InventoryItem[], days: number) => {
    return items.map(item => ({
      ...item,
      predictedQuantity: Math.max(0, (typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity)) - (days / 30) * 10)
    }));
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

  // Computed data for components
  const monthlySalesData = useMemo(() => calculateMonthlySales(filteredData), [filteredData]);
  const expiryRiskData = useMemo(() => calculateExpiryRisk(filteredData), [filteredData]);
  const productPerformanceData = useMemo(() => calculateProductPerformance(filteredData), [filteredData]);
  const predictedStockData = useMemo(() => predictStockLevels(filteredData, predictedDays), [filteredData, predictedDays]);
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
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
          <TabsTrigger value="stock-insights" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Stock Insights
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecasting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock-insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-full">
              <StockInsightsTab data={data} />
            </div>
            
            <div className="col-span-2">
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
            </div>
            
            <div className="col-span-1">
              <StockOverviewChart data={stockLevelsData} />
            </div>
            
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
              <MonthlySalesChart data={monthlySalesData} />
              <ExpiryRiskChart data={expiryRiskData} />
              <ProductPerformanceChart data={productPerformanceData} />
            </div>
            
            <div className="col-span-full">
              <PredictedStockTable 
                data={filteredData}
                predictedDays={predictedDays}
                setPredictedDays={setPredictedDays}
                predictedStockData={predictedStockData}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceTab uniqueProductNames={uniqueProductNames} />
        </TabsContent>
        
        <TabsContent value="forecasting">
          <ForecastingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsTab;
