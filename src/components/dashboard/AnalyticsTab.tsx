import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart,
  Area, Scatter, ScatterChart, ZAxis, Brush, ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { formatCurrency, calculateDaysUntilExpiry, getExpiryStatus } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Define colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const EXPIRY_COLORS = {
  "expired": "#ef4444",
  "expiring-soon": "#f97316",
  "good": "#10b981"
};

interface AnalyticsTabProps {
  data: InventoryItem[];
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [predictedDays, setPredictedDays] = useState(30);
  
  // Various data processing functions for charts
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
    // Simplified prediction: assume linear consumption
    return items.map(item => ({
      ...item,
      predictedQuantity: Math.max(0, (typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity)) - (days / 30) * 10)
    }));
  };

  // Processed data for charts
  const monthlySalesData = useMemo(() => calculateMonthlySales(data), [data]);
  const expiryRiskData = useMemo(() => calculateExpiryRisk(data), [data]);
  const productPerformanceData = useMemo(() => calculateProductPerformance(data), [data]);
  const predictedStockData = useMemo(() => predictStockLevels(data, predictedDays), [data, predictedDays]);

  // Chart rendering functions
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

  const renderExpiryRiskChart = () => (
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
      </CardContent>
    </Card>
  );

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

  const renderPredictedStockTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Predicted Stock Levels</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Current Quantity</TableHead>
              <TableHead>Predicted Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictedStockData.map(item => (
              <TableRow key={item.particularId}>
                <TableCell>{item.particulars}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.predictedQuantity?.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* ML Models Section */}
      <Card>
        <CardHeader>
          <CardTitle>ML Models</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Here you can use our ML models to predict stock levels and optimize your inventory.
          </p>
          <div className="mt-4">
            <div className="mb-4">
              <label htmlFor="predictionDays" className="block text-sm font-medium text-gray-700">
                Prediction Horizon (Days):
              </label>
              <Slider
                id="predictionDays"
                defaultValue={[30]}
                max={365}
                step={7}
                onValueChange={(value) => setPredictedDays(value[0])}
              />
              <p className="text-sm text-muted-foreground">
                Selected: {predictedDays} days
              </p>
            </div>
            <Button onClick={() => alert('Run Stock Prediction Model')}>
              Run Stock Prediction Model
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Stock Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A quick overview of your current stock levels.
          </p>
          {/* Add stock level charts or summaries here */}
        </CardContent>
      </Card>
      
      {/* Monthly Sales vs Stock Section */}
      {renderMonthlySalesChart()}
      
      {/* Product Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Insights into individual product performance.
          </p>
          {/* Add product-specific charts or summaries here */}
        </CardContent>
      </Card>
      
      {/* Expiry Risk Monitor */}
      {renderExpiryRiskChart()}
      
      {/* Best & Worst Performing Products */}
      {renderProductPerformanceChart()}

      {/* Predicted Stock Table */}
      {renderPredictedStockTable()}
    </div>
  );
}

export default AnalyticsTab;
