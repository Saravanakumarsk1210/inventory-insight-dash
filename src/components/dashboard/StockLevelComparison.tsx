
import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";

interface StockLevelComparisonProps {
  data: InventoryItem[];
}

interface ProductStock {
  name: string;
  currentStock: number;
  minimumStock: number;
  gap: number;
  status: 'surplus' | 'critical' | 'danger';
}

export function StockLevelComparison({ data }: StockLevelComparisonProps) {
  const productStockData: ProductStock[] = useMemo(() => {
    // Aggregate data by product name to combine quantities of the same product
    const productMap = new Map<string, ProductStock>();
    
    data.forEach(item => {
      // Extract base product name
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
          gap: 0,
          status: 'surplus'
        });
      }
      
      const productData = productMap.get(productName)!;
      productData.currentStock += quantity;
      
      // Ensure minimumStock is set (use the highest if there are multiple items)
      if (item.minimumStock && item.minimumStock > productData.minimumStock) {
        productData.minimumStock = item.minimumStock;
      }
    });
    
    // Calculate gap and status for each product
    return Array.from(productMap.values()).map(product => {
      const gap = product.currentStock - product.minimumStock;
      let status: 'surplus' | 'critical' | 'danger' = 'surplus';
      
      if (gap < 0) {
        status = 'danger';
      } else if (gap < product.minimumStock * 0.25) {
        status = 'critical';
      }
      
      return {
        ...product,
        gap,
        status
      };
    }).sort((a, b) => (b.minimumStock / b.currentStock) - (a.minimumStock / a.currentStock));
  }, [data]);
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Product-wise Stock Levels vs Minimum Threshold</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart 
            data={productStockData.slice(0, 15)} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              tickFormatter={(value) => value.length > 16 ? `${value.slice(0, 16)}...` : value}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'minimumStock') return [`${value} (Minimum)`, 'Minimum Stock'];
                return [value, name === 'currentStock' ? 'Current Stock' : name];
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar dataKey="currentStock" name="Current Stock" barSize={20}>
              {productStockData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.status === 'danger' ? '#ef4444' : entry.status === 'critical' ? '#f97316' : '#10b981'} 
                />
              ))}
            </Bar>
            <Bar dataKey="minimumStock" name="Minimum Stock" fill="#6366f1" barSize={5} />
            <ReferenceLine x={0} stroke="#666" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
            <span className="text-sm">Below Minimum (Danger)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-sm mr-2"></div>
            <span className="text-sm">Near Minimum (Critical)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></div>
            <span className="text-sm">Above Minimum (Good)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-sm mr-2"></div>
            <span className="text-sm">Minimum Stock Level</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
