
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { formatCurrency } from "@/utils/formatters";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ProductValueChartProps {
  data: InventoryItem[];
}

export function ProductValueChart({ data }: ProductValueChartProps) {
  // Function to get top products by value
  const getTopProductsByValue = (items: InventoryItem[], count: number) => {
    // Group similar products and sum their values
    const productValueMap = new Map<string, number>();
    
    items.forEach(item => {
      const productName = item.particulars.split(' - ')[0]; // Get base product name
      const currentValue = productValueMap.get(productName) || 0;
      const itemValue = typeof item.value === 'number' ? item.value : parseFloat(item.value as string) || 0;
      productValueMap.set(productName, currentValue + itemValue);
    });
    
    // Convert to array and sort by value
    const productValues = Array.from(productValueMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
    
    return productValues;
  };
  
  const topProducts = getTopProductsByValue(data, 7);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-pharma-blue">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
  
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products by Value</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={topProducts}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => value.length > 13 ? `${value.substring(0, 13)}...` : value}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              tickFormatter={(value) => `₹${(value / 1000)}k`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              name="Value" 
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
