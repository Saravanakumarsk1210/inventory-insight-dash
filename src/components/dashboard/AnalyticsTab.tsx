import { useMemo } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart,
  Area, Scatter, ScatterChart, ZAxis
} from "recharts";
import { 
  Lightbulb, TrendingUp, AlertTriangle, Calendar, 
  ArrowUp, ArrowDown, Clock, BarChart3, Activity, 
  Search, Filter, BadgeDollarSign, Package2, PieChart as PieChartIcon
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateDaysUntilExpiry, getExpiryStatus, formatCurrency } from "@/utils/formatters";

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
  
  // NEW: Stock levels comparison (current vs minimum)
  const stockLevelComparison = useMemo(() => {
    // Get top products by quantity
    const topProductsByQuantity = [...data]
      .sort((a, b) => {
        const quantityA = typeof a.quantity === 'number' 
          ? a.quantity 
          : parseInt(a.quantity.toString().match(/\d+/)?.[0] || '0');
          
        const quantityB = typeof b.quantity === 'number' 
          ? b.quantity 
          : parseInt(b.quantity.toString().match(/\d+/)?.[0] || '0');
          
        return quantityB - quantityA;
      })
      .slice(0, 10);
    
    // Generate comparison data with simulated minimum stock thresholds
    return topProductsByQuantity.map(item => {
      const currentStock = typeof item.quantity === 'number' 
        ? item.quantity 
        : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0');
      
      // Simulated minimum stock threshold (would come from real data in production)
      const minimumStock = Math.round(currentStock * (0.3 + Math.random() * 0.4));
      
      // Simulated average monthly sales
      const monthlySales = Math.round(minimumStock * (0.5 + Math.random() * 0.5));
      
      // Calculate reorder status
      const stockStatus = currentStock < minimumStock ? 'low' : 'adequate';
      
      return {
        name: item.particulars,
        currentStock,
        minimumStock,
        monthlySales,
        stockStatus,
        stockDifference: currentStock - minimumStock,
        runoutTime: Math.round(currentStock / (monthlySales || 1)) // in months
      };
    });
  }, [data]);
  
  // NEW: Expiring products list
  const expiryAlerts = useMemo(() => {
    return data
      .map(item => {
        const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
        const status = getExpiryStatus(daysUntilExpiry);
        
        return {
          product: item.particulars,
          batchNumber: item.particularId,
          expiryDate: item.expiryDate,
          daysUntilExpiry,
          status,
          quantity: typeof item.quantity === 'number' 
            ? item.quantity 
            : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0')
        };
      })
      .filter(item => item.status === 'expired' || item.status === 'expiring-soon')
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
      .slice(0, 6);
  }, [data]);
  
  // NEW: Product performance analysis
  const productPerformance = useMemo(() => {
    const productMap: Record<string, { 
      totalValue: number, 
      totalQuantity: number,
      averageTurnover: number,
      salesVelocity: number 
    }> = {};
    
    // Group items by product name and calculate metrics
    data.forEach(item => {
      const productName = item.particulars.split(' - ')[0];
      const value = typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()) || 0;
      const quantity = typeof item.quantity === 'number' 
        ? item.quantity 
        : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0');
        
      if (!productMap[productName]) {
        // Simulate sales velocity and turnover with random values
        productMap[productName] = {
          totalValue: 0,
          totalQuantity: 0,
          // Simulated metrics (would be real in production)
          averageTurnover: Math.round(Math.random() * 20) + 5, // days
          salesVelocity: Math.round(Math.random() * 100) + 10  // units per month
        };
      }
      
      productMap[productName].totalValue += value;
      productMap[productName].totalQuantity += quantity;
    });
    
    // Convert to array and calculate performance categories
    return Object.entries(productMap)
      .map(([name, metrics]) => {
        // Create a performance score based on value, quantity, turnover, and sales velocity
        const valueScore = metrics.totalValue / 10000; // normalized by ₹10,000
        const quantityScore = metrics.totalQuantity / 1000; // normalized by 1,000 units
        const turnoverScore = 30 / metrics.averageTurnover; // faster turnover = higher score
        const velocityScore = metrics.salesVelocity / 50; // normalized by 50 units per month
        
        // Weighted performance score
        const performanceScore = (valueScore * 0.4) + (quantityScore * 0.1) + 
                                (turnoverScore * 0.2) + (velocityScore * 0.3);
        
        // Classify products
        let performance: 'high' | 'medium' | 'low';
        if (performanceScore > 2) performance = 'high';
        else if (performanceScore > 1) performance = 'medium';
        else performance = 'low';
        
        return {
          name,
          totalValue: metrics.totalValue,
          totalQuantity: metrics.totalQuantity,
          averageTurnover: metrics.averageTurnover,
          salesVelocity: metrics.salesVelocity,
          performanceScore,
          performance
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }, [data]);
  
  // NEW: Advanced demand forecasting with multiple ML models
  const demandForecast = useMemo(() => {
    // Simulate multiple ML model forecasts for a top product
    const topProduct = productPerformance[0];
    if (!topProduct) return null;
    
    const currentMonth = new Date().getMonth();
    const baselineSales = topProduct.salesVelocity;
    
    // Generate 6-month forecast using different simulated models
    const forecastMonths = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(0, (currentMonth + i) % 12).toLocaleString('default', { month: 'short' });
      
      // Seasonal factor (higher in winter months)
      const seasonalFactor = (currentMonth + i) % 12 >= 9 || (currentMonth + i) % 12 <= 2 ? 1.2 : 1.0;
      
      // Different model predictions
      // 1. Moving average model (less responsive to seasonal changes)
      const movingAvgPrediction = Math.round(baselineSales * (1 + (i * 0.03)) * (0.9 + Math.random() * 0.2));
      
      // 2. ARIMA-like model (more responsive to seasonal changes)
      const arimaPrediction = Math.round(baselineSales * (1 + (i * 0.04)) * seasonalFactor * (0.85 + Math.random() * 0.3));
      
      // 3. ML-based model (most sophisticated with multiple factors)
      const mlPrediction = Math.round(baselineSales * (1 + (i * 0.05)) * seasonalFactor * 
        // Add simulated external factors like market trends, holidays, etc.
        (1 + (Math.sin(i) * 0.15)) * (0.9 + Math.random() * 0.2));
      
      // Ensemble model (weighted average of the three models)
      const ensemblePrediction = Math.round((movingAvgPrediction * 0.25) + 
                                         (arimaPrediction * 0.35) + 
                                         (mlPrediction * 0.4));
      
      forecastMonths.push({
        month,
        movingAvg: movingAvgPrediction,
        arima: arimaPrediction,
        ml: mlPrediction,
        ensemble: ensemblePrediction
      });
    }
    
    return {
      productName: topProduct.name,
      currentSales: baselineSales,
      forecastAccuracy: Math.round(70 + Math.random() * 15), // simulated accuracy percentage
      forecastData: forecastMonths
    };
  }, [productPerformance]);

  // COLORS for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  const EXPIRY_COLORS = {
    'expired': '#f87171', // red
    'expiring-soon': '#fcd34d', // amber
    'good': '#4ade80', // green
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advanced Analytics</h2>
      <p className="text-muted-foreground">
        Machine learning powered insights for inventory optimization and decision making
      </p>
      
      {/* NEW: Stock Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Stock Overview
          </CardTitle>
          <CardDescription>
            Comparing current stock versus minimum required levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stockLevelComparison}
                  margin={{ top: 5, right: 30, left: 20, bottom: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={120} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentStock" name="Current Stock" fill="#8884d8" />
                  <Bar dataKey="minimumStock" name="Minimum Required" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">Reorder Status</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Runout</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockLevelComparison.filter(item => item.stockStatus === 'low').map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}</TableCell>
                          <TableCell>
                            <Badge variant={item.stockStatus === 'low' ? 'destructive' : 'outline'}>
                              {item.stockStatus === 'low' ? 'Low Stock' : 'Adequate'}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.runoutTime} mo.</TableCell>
                        </TableRow>
                      ))}
                      {stockLevelComparison.filter(item => item.stockStatus === 'low').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No products with low stock found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sales Forecasting Section (Enhanced with multiple models) */}
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
      
      {/* NEW: Advanced Demand Forecasting with Multiple ML Models */}
      {demandForecast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Dynamic Demand Forecasting
            </CardTitle>
            <CardDescription>
              Multi-model ML forecast for {demandForecast.productName} (Accuracy: {demandForecast.forecastAccuracy}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={demandForecast.forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="movingAvg" name="Moving Average Model" stroke="#8884d8" strokeWidth={1} />
                    <Line type="monotone" dataKey="arima" name="ARIMA Model" stroke="#82ca9d" strokeWidth={1} />
                    <Line type="monotone" dataKey="ml" name="ML Model" stroke="#ffc658" strokeWidth={1} />
                    <Line type="monotone" dataKey="ensemble" name="Ensemble Model (Recommended)" stroke="#ff8042" strokeWidth={2} activeDot={{ r: 8 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Stock Runout Prediction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Current Monthly Sales:</span>
                        <span className="text-xl font-bold">{demandForecast.currentSales} units</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Predicted Peak Month:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">
                            {demandForecast.forecastData.reduce((max, item) => 
                              item.ensemble > max.value ? {month: item.month, value: item.ensemble} : max, 
                              {month: '', value: 0}
                            ).month}
                          </span>
                          <ArrowUp className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">6-Month Growth Trend:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">
                            {Math.round(((demandForecast.forecastData[5].ensemble / demandForecast.forecastData[0].ensemble) - 1) * 100)}%
                          </span>
                          {demandForecast.forecastData[5].ensemble > demandForecast.forecastData[0].ensemble ? (
                            <ArrowUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDown className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button size="sm" className="w-full">View Detailed Analysis</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* NEW: Expiry Risk Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Expiry Risk Monitor
          </CardTitle>
          <CardDescription>
            Timeline showing products by expiry date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="daysUntilExpiry" 
                    name="Days Until Expiry"
                    domain={[-30, 180]}
                    label={{ value: 'Days Until Expiry', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="quantity" 
                    name="Quantity"
                    label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} 
                  />
                  <ZAxis range={[60, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border p-2 rounded-md shadow-md">
                            <p className="font-medium">{data.product}</p>
                            <p>Batch: {data.batchNumber}</p>
                            <p>Expires: {data.expiryDate}</p>
                            <p>Days left: <span className={
                              data.status === 'expired' ? 'text-red-500 font-bold' : 
                              data.status === 'expiring-soon' ? 'text-amber-500 font-bold' : 'text-green-500'
                            }>{data.daysUntilExpiry}</span></p>
                            <p>Quantity: {data.quantity}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    name="Expiry Risk"
                    data={expiryAlerts.concat(
                      data
                      .map(item => {
                        const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
                        if (daysUntilExpiry > 180) return null;
                        const status = getExpiryStatus(daysUntilExpiry);
                        
                        return {
                          product: item.particulars,
                          batchNumber: item.particularId,
                          expiryDate: item.expiryDate,
                          daysUntilExpiry,
                          status,
                          quantity: typeof item.quantity === 'number' 
                            ? item.quantity 
                            : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0')
                        };
                      })
                      .filter(Boolean)
                      .slice(0, 30) // Limit to 30 items for performance
                    )}
                    fill={(entry) => EXPIRY_COLORS[entry.status as keyof typeof EXPIRY_COLORS] || '#000'}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <Card className="h-[300px] overflow-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4 text-red-500" />
                  Expiring Soon Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {expiryAlerts.map((item, i) => (
                    <div key={i} className="p-3 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{item.product}</div>
                          <div className="text-xs text-muted-foreground">{item.batchNumber}</div>
                        </div>
                        <Badge variant={item.status === 'expired' ? 'destructive' : 'outline'} className={item.status === 'expiring-soon' ? 'bg-amber-100 hover:bg-amber-100/80 text-amber-800 border-amber-200' : ''}>
                          {item.status === 'expired' ? 'Expired' : `${item.daysUntilExpiry} days left`}
                        </Badge>
                      </div>
                      
                      {item.status === 'expired' && (
                        <div className="mt-2 text-xs bg-red-50 text-red-700 p-1 rounded flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Consider discounting or disposal
                        </div>
                      )}
                      
                      {item.status === 'expiring-soon' && item.daysUntilExpiry < 60 && (
                        <div className="mt-2 text-xs bg-amber-50 text-amber-700 p-1 rounded flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1" /> Suggestion: Apply 10% discount
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Best & Worst Performing Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-green-500" />
            Product Performance Analysis
          </CardTitle>
          <CardDescription>
            Identifying best-selling and slow-moving inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium mb-3 flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                Top Performing Products
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Turnover</TableHead>
                    <TableHead>Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPerformance
                    .filter(product => product.performance === 'high')
                    .slice(0, 5)
                    .map((product, i) => (
