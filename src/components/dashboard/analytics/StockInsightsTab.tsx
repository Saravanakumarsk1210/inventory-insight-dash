
import React from "react";
import { InventoryItem } from "@/data/inventoryData";
import { StockLevelComparison } from "../StockLevelComparison";
import { StockLevelTable } from "../StockLevelTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Warehouse, ShoppingCart, AlertCircle, TrendingUp } from "lucide-react";

interface StockInsightsTabProps {
  data: InventoryItem[];
}

export function StockInsightsTab({ data }: StockInsightsTabProps) {
  // Calculate insights about the stock levels
  const stockInsights = React.useMemo(() => {
    const productMap = new Map<string, {
      name: string;
      currentStock: number;
      minimumStock: number;
      gap: number;
    }>();
    
    data.forEach(item => {
      const productName = item.particulars.split(' - ')[0];
      
      // Parse quantity
      let quantity = 0;
      if (typeof item.quantity === 'number') {
        quantity = item.quantity;
      } else {
        const matches = item.quantity.match(/^(\d+)/);
        if (matches && matches[1]) {
          quantity = parseInt(matches[1]);
        }
      }
      
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          name: productName,
          currentStock: 0,
          minimumStock: item.minimumStock || 0,
          gap: 0
        });
      }
      
      const productData = productMap.get(productName)!;
      productData.currentStock += quantity;
      
      if (item.minimumStock && item.minimumStock > productData.minimumStock) {
        productData.minimumStock = item.minimumStock;
      }
    });
    
    // Calculate insights
    const productStocks = Array.from(productMap.values()).map(product => {
      return {
        ...product,
        gap: product.currentStock - product.minimumStock
      };
    });
    
    const belowMinimumCount = productStocks.filter(p => p.gap < 0).length;
    const criticalCount = productStocks.filter(p => p.gap >= 0 && p.gap < p.minimumStock * 0.25).length;
    const healthyCount = productStocks.filter(p => p.gap >= p.minimumStock * 0.25).length;
    
    const mostCritical = [...productStocks]
      .filter(p => p.gap < 0)
      .sort((a, b) => a.gap - b.gap)
      .slice(0, 3)
      .map(p => p.name);
    
    return {
      belowMinimumCount,
      criticalCount,
      healthyCount,
      mostCritical,
      totalProducts: productStocks.length
    };
    
  }, [data]);
  
  return (
    <div className="space-y-6">
      {/* Insights Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stockInsights.belowMinimumCount > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Stock Alert</AlertTitle>
            <AlertDescription>
              {stockInsights.belowMinimumCount} products are below minimum stock threshold. 
              Most critical: {stockInsights.mostCritical.join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
        <Alert className="border-indigo-200 bg-indigo-50">
          <Warehouse className="h-4 w-4 text-indigo-500" />
          <AlertTitle>Stock Summary</AlertTitle>
          <AlertDescription>
            {stockInsights.healthyCount} products at healthy levels, 
            {stockInsights.criticalCount} approaching minimum threshold, 
            and {stockInsights.belowMinimumCount} below minimum.
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stock Level Comparison Chart */}
        <StockLevelComparison data={data} />
        
        {/* Right: Stock Level Details Table */}
        <StockLevelTable data={data} />
      </div>
    </div>
  );
}
