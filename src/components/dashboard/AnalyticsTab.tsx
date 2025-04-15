import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart,
  Area, Scatter, ScatterChart, ZAxis, Brush, ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { formatCurrency, calculateDaysUntilExpiry, getExpiryStatus, getUniqueProductNames } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Filter, Package2, Zap, TrendingUp, Calendar, AlertTriangle, 
  ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Search,
  BarChart3, Box, LineChart as LineChartIcon
} from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockInsightsTab } from "./StockInsightsTab";
import { StockLevelComparison } from "./StockLevelComparison";
import { StockLevelTable } from "./StockLevelTable";

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

  const renderMonthlySalesChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales vs Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderExpiryRiskChart = () => {
    const EXPIRY_COLORS = {
      "expired": "#ef4444",
      "expiring-soon": "#f97316", 
      "good": "#10b981"
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expiry Risk Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="count"
                data={expiryRiskData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {expiryRiskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EXPIRY_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          {expiryRiskData.find(item => item.status === "expiring-soon" && item.count > 0) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Suggestion
              </h4>
              <p className="text-sm mt-1">
                Consider applying discounts on {expiryRiskData.find(item => item.status === "expiring-soon")?.count} products 
                nearing expiry to boost sales.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProductPerformanceChart = () => {
    const sortedData = [...productPerformanceData].sort((a, b) => b.sold - a.sold);
    const top5Products = sortedData.slice(0, 5);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Best Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top5Products}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sold" fill="#82ca9d" name="Sold" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderProductInsights = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Product Insights
          </div>
          <div className="flex space-x-2">
            <div className="relative w-[180px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8 pr-4 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {uniqueProductNames.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Expiry status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                <SelectItem value="good">Good</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedProduct ? (
          <div>
            <div className="bg-slate-50 p-4 rounded-md mb-4">
              <h3 className="text-lg font-semibold">{selectedProduct}</h3>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Batches</p>
                  <p className="text-xl font-medium">{selectedProductData?.batches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-xl font-medium">{selectedProductData?.totalQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-medium">{formatCurrency(selectedProductData?.totalValue || 0)}</p>
                </div>
              </div>
              
              <Button variant="outline" className="mt-4" onClick={() => setSelectedProduct(null)}>
                View All Products
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProductData?.items.map((item) => (
                  <TableRow key={item.particularId}>
                    <TableCell>{item.particularId}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Threshold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockLevelsData.map((product) => {
                const isLowStock = product.stock <= product.minThreshold;
                
                return (
                  <TableRow 
                    key={product.name}
                    className={isLowStock ? "bg-red-50" : ""}
                    onClick={() => setSelectedProduct(product.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.batches}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.minThreshold}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                        {isLowStock ? (
                          <>
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            Low Stock
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Sufficient
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderStockOverviewChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockLevelsData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#82ca9d" name="Current Stock" />
            <Bar dataKey="minThreshold" fill="#ff7373" name="Min Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderPredictedStockTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Predicted Stock Levels</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="mb-4">
          <label htmlFor="predictionDays" className="block text-sm font-medium text-gray-700 mb-2">
            Prediction Horizon: {predictedDays} days
          </label>
          <Slider
            id="predictionDays"
            defaultValue={[30]}
            value={[predictedDays]}
            max={365}
            step={7}
            onValueChange={(value) => setPredictedDays(value[0])}
            className="max-w-md"
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Current Quantity</TableHead>
              <TableHead>Predicted Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictedStockData.map(item => {
              const currentQty = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
              const predictedQty = item.predictedQuantity || 0;
              const isRunningOut = predictedQty <= 0;
              
              return (
                <TableRow key={item.particularId}>
                  <TableCell>{item.particulars}</TableCell>
                  <TableCell>{currentQty}</TableCell>
                  <TableCell>{predictedQty.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={isRunningOut ? "text-red-600 font-medium" : "text-green-600"}>
                      {isRunningOut ? "Stock Out Risk" : "Sufficient"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

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

        <TabsContent value="stock-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StockInsightsTab data={data} className="col-span-full" />
            
            <StockLevelComparison data={data} />
            
            <StockLevelTable data={data} />
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Select products to view their performance metrics and analytics.
                </p>
                
                <div className="flex mt-4 space-x-4">
                  <Select>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueProductNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button>View Performance</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Select a product to view performance analysis</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center">
                  <Box className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No product selected</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="forecasting">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ML Models</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Use our ML models to predict stock levels and optimize your inventory.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Zap className="h-5 w-5 mr-2 text-purple-500" />
                      <h4 className="font-medium">XGBoost Stock Prediction</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Predicts future stock levels based on historical consumption patterns.
                    </p>
                    <Button onClick={() => alert('Running XGBoost model...')}>
                      Run Prediction
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                      <h4 className="font-medium">ARIMA Forecasting</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Time series analysis to forecast demand patterns and trends.
                    </p>
                    <Button onClick={() => alert('Running ARIMA model...')}>
                      Run Forecast
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Run a forecast model to view predictions</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No forecast data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsTab;
