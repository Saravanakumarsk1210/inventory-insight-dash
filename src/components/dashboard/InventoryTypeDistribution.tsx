
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { formatCurrency } from "@/utils/formatters";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface InventoryTypeDistributionProps {
  data: InventoryItem[];
}

export function InventoryTypeDistribution({ data }: InventoryTypeDistributionProps) {
  // Function to categorize products by type
  const categorizeProducts = (items: InventoryItem[]) => {
    const categoryMap = new Map<string, { count: number, value: number }>();
    
    // Extract product categories based on name patterns
    items.forEach(item => {
      let category = "Other";
      const name = item.particulars.toLowerCase();
      
      if (name.includes("tablet")) {
        category = "Tablets";
      } else if (name.includes("capsule")) {
        category = "Capsules";
      } else if (name.includes("injection") || name.includes("inj")) {
        category = "Injections";
      } else if (name.includes("drops") || name.includes("suspension") || name.includes("oral")) {
        category = "Oral Liquids";
      }
      
      const current = categoryMap.get(category) || { count: 0, value: 0 };
      const itemValue = typeof item.value === 'number' ? item.value : parseFloat(item.value as string) || 0;
      
      categoryMap.set(category, {
        count: current.count + 1,
        value: current.value + itemValue
      });
    });
    
    // Convert to array for chart
    return Array.from(categoryMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      value: stats.value
    }));
  };
  
  const productCategories = categorizeProducts(data);
  
  const COLORS = ['#6366F1', '#14B8A6', '#F59E0B', '#8B5CF6', '#64748B'];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{payload[0].name}: {payload[0].payload.name}</p>
          <p>{payload[0].payload.count} items</p>
          <p className="text-pharma-blue">{formatCurrency(payload[0].payload.value)}</p>
        </div>
      );
    }
  
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ fontSize: '11px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={productCategories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {productCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
