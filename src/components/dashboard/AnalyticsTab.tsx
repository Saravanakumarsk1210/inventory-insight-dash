
import { useMemo } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

interface AnalyticsTabProps {
  data: InventoryItem[];
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
  // ML-based Sales Forecasting (simulated)
  const salesForecast = useMemo(() => {
    // Group products by base name
    const productGroups: Record<string, InventoryItem[]> = {};
    data.forEach(item => {
      const baseName = item.particulars.split(' - ')[0];
      if (!productGroups[baseName]) {
        productGroups[baseName] = [];
      }
      productGroups[baseName].push(item);
    });

    // Get top products by value for forecasting
    const topProducts = Object.keys(productGroups)
      .map(name => {
        const items = productGroups[name];
        const totalValue = items.reduce((sum, item) => {
          return sum + (typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()) || 0);
        }, 0);
        return { name, totalValue };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Generate forecasted sales (simulated ML results)
    return topProducts.map(product => {
      // Simulate a trend with random variation (this would be ML-generated in real app)
      const currentMonth = new Date().getMonth();
      const forecastedValues = [];
      
      // Base value from product's total value
      const baseValue = product.totalValue / 100;
      
      // Generate a 6-month forecast with increasing trend and seasonal factors
      for (let i = 1; i <= 6; i++) {
        const month = (currentMonth + i) % 12;
        // Add seasonality (higher in winter months)
        const seasonalFactor = month >= 9 || month <= 2 ? 1.2 : 1.0;
        // Add growth trend
        const growthFactor = 1 + (i * 0.05);
        // Add some randomness
        const random = 0.8 + Math.random() * 0.4;
        
        const value = Math.round(baseValue * seasonalFactor * growthFactor * random);
        forecastedValues.push({
          month: new Date(0, month).toLocaleString('default', { month: 'short' }),
          value: value,
        });
      }

      return {
        name: product.name,
        forecast: forecastedValues,
        trend: forecastedValues[5].value > forecastedValues[0].value ? 'up' : 'down',
        changePercent: Math.round(((forecastedValues[5].value / forecastedValues[0].value) - 1) * 100)
      };
    });
  }, [data]);
  
  // ML-based Inventory Optimization Insights
  const inventoryInsights = useMemo(() => {
    // Simulate ML-based insights
    const insights = [];
    
    // Get products with potential overstocking
    const potentialOverstock = data
      .filter(item => {
        // Simple heuristic: high quantity + far from expiry
        const qty = typeof item.quantity === 'number' 
          ? item.quantity 
          : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0');
        
        const expiryParts = item.expiryDate.split('-');
        const expiryDate = new Date(
          parseInt(expiryParts[2]), 
          ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            .indexOf(expiryParts[1].toLowerCase().substring(0, 3)),
          parseInt(expiryParts[0])
        );
        
        const monthsToExpiry = (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return qty > 3000 && monthsToExpiry > 18;
      })
      .slice(0, 3);
    
    insights.push({
      type: 'overstocking',
      title: 'Potential Overstocking',
      products: potentialOverstock.map(item => ({
        name: item.particulars,
        quantity: typeof item.quantity === 'number' 
          ? item.quantity 
          : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0'),
        value: typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()) || 0
      })),
      recommendation: 'Consider reducing order quantities for these items to optimize inventory costs.'
    });
    
    // Potential stockout risk analysis
    const stockoutRisk = data
      .filter(item => {
        // Simple heuristic: low quantity + popular product
        const qty = typeof item.quantity === 'number' 
          ? item.quantity 
          : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0');
        
        const value = typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()) || 0;
        
        return qty < 650 && value > 20000;
      })
      .slice(0, 3);
    
    insights.push({
      type: 'stockout',
      title: 'Stockout Risk',
      products: stockoutRisk.map(item => ({
        name: item.particulars,
        quantity: typeof item.quantity === 'number' 
          ? item.quantity 
          : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0'),
        value: typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()) || 0
      })),
      recommendation: 'Place orders soon for these items to avoid potential stockouts.'
    });
    
    return insights;
  }, [data]);
  
  // Product categories distribution for strategic analysis
  const categoryDistribution = useMemo(() => {
    const categories: Record<string, { count: number, value: number }> = {};
    
    // Categorize products by type/family
    data.forEach(item => {
      // Extract product category (simplified for demo)
      let category;
      if (item.particulars.toLowerCase().includes('tablet')) {
        category = 'Tablets';
      } else if (item.particulars.toLowerCase().includes('capsule')) {
        category = 'Capsules';
      } else if (item.particulars.toLowerCase().includes('inj')) {
        category = 'Injections';
      } else if (item.particulars.toLowerCase().includes('suspension')) {
        category = 'Suspensions';
      } else if (item.particulars.toLowerCase().includes('drops')) {
        category = 'Drops';
      } else {
        category = 'Others';
      }
      
      if (!categories[category]) {
        categories[category] = { count: 0, value: 0 };
      }
      
      categories[category].count += 1;
      categories[category].value += typeof item.value === 'number' 
        ? item.value 
        : parseFloat(item.value.toString()) || 0;
    });
    
    // Convert to array for chart
    return Object.entries(categories).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value
    }));
  }, [data]);

  // COLORS for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advanced Analytics</h2>
      <p className="text-muted-foreground">
        Machine learning powered insights for inventory optimization and decision making
      </p>
      
      {/* Sales Forecasting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Sales Forecast - Next 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    allowDuplicatedCategory={false} 
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {salesForecast.map((product, index) => (
                    <Line
                      key={product.name}
                      data={product.forecast}
                      name={product.name}
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Trending Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesForecast.map((product) => (
                <div key={product.name} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.trend === 'up' ? 'Increasing' : 'Decreasing'} trend
                    </div>
                  </div>
                  <div className={`flex items-center ${product.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {product.trend === 'up' ? '+' : '-'}{Math.abs(product.changePercent)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Inventory Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {inventoryInsights.map((insight) => (
          <Card key={insight.type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {insight.type === 'overstocking' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                {insight.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {insight.products.map((product) => (
                    <div key={product.name} className="flex items-center justify-between border-b pb-2">
                      <div className="font-medium truncate max-w-[70%]">{product.name}</div>
                      <div className="text-sm">
                        QTY: {product.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} items`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value) => [`${parseInt(value).toLocaleString()} INR`, 'Value']} />
                  <Legend />
                  <Bar dataKey="value" name="Total Value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
