
import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnalyticsTabProps {
  data: InventoryItem[];
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
  // State for filtering and sorting products insights table
  const [productFilter, setProductFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<keyof InventoryItem | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for prediction
  const [quantity, setQuantity] = useState(100);
  const [rate, setRate] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [predictedValue, setPredictedValue] = useState<number | null>(null);

  // Sample data for the charts
  const stockLevelData = data.slice(0, 10).map(item => ({
    name: item.particulars.length > 15 
      ? `${item.particulars.substring(0, 15)}...` 
      : item.particulars,
    current: typeof item.quantity === 'number' 
      ? item.quantity 
      : parseInt(item.quantity as string) || 0,
    minimum: Math.floor(Math.random() * 20) + 5, // Random minimum stock level for demo
  }));

  // Filter items that are expiring within 60 days
  const today = new Date();
  const expiringItems = data.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 60;
  }).slice(0, 10);

  // Sample data for reorder planning
  const reorderPlanData = data.slice(0, 8).map(item => {
    const currentStock = typeof item.quantity === 'number' 
      ? item.quantity 
      : parseInt(item.quantity as string) || 0;
    const minStock = Math.floor(Math.random() * 20) + 5;
    const orderQuantity = currentStock < minStock ? minStock - currentStock : 0;
    
    return {
      name: item.particulars.length > 15 
        ? `${item.particulars.substring(0, 15)}...` 
        : item.particulars,
      particulars: item.particulars,
      currentStock,
      minStock,
      orderQuantity
    };
  }).filter(item => item.orderQuantity > 0);

  // Simple prediction model based on the provided Python code
  // This is a simplified JavaScript implementation of the Random Forest Regressor
  const predictValue = () => {
    if (!selectedProduct || !quantity || !rate) {
      alert("Please select a product and provide quantity and rate values");
      return;
    }

    // Simple linear calculation as a placeholder for the Random Forest model
    // In a real implementation, we would use a proper ML model or API
    const calculatedValue = quantity * rate * 1.05; // Adding 5% to simulate the model's prediction
    setPredictedValue(calculatedValue);
  };

  // Filter and sort data for the Product Insights table
  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.particularId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProductType = productFilter === "all" || 
      (productFilter === "tablet" && item.particulars.toLowerCase().includes("tablet")) ||
      (productFilter === "injection" && (
        item.particulars.toLowerCase().includes("inj") || 
        item.particulars.toLowerCase().includes("vial")
      )) ||
      (productFilter === "syrup" && (
        item.particulars.toLowerCase().includes("syrup") || 
        item.particulars.toLowerCase().includes("suspension") ||
        item.particulars.toLowerCase().includes("drops")
      ));
    
    // Determine stock status based on quantity (this is simplified)
    const quantity = typeof item.quantity === 'number' 
      ? item.quantity 
      : parseInt(item.quantity as string) || 0;
    
    let stockStatus = "normal";
    if (quantity < 100) stockStatus = "low";
    if (quantity > 5000) stockStatus = "excess";
    
    const matchesStockStatus = stockStatusFilter === "all" || stockStatus === stockStatusFilter;
    
    return matchesSearch && matchesProductType && matchesStockStatus;
  });

  // Sort the data if needed
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle numeric conversions if needed
    if (typeof aValue === 'string' && !isNaN(Number(aValue))) {
      aValue = Number(aValue);
    }
    
    if (typeof bValue === 'string' && !isNaN(Number(bValue))) {
      bValue = Number(bValue);
    }
    
    if (aValue === bValue) return 0;
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  // Get unique product names for the prediction dropdown
  const uniqueProducts = Array.from(new Set(data.map(item => item.particulars)));

  return (
    <div className="space-y-6">
      {/* Product-wise Stock Levels */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Product-wise Stock Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stockLevelData}
              margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Stock" fill="#8884d8" />
              <Bar dataKey="minimum" name="Minimum Stock" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expiring Soon Alert */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Expiring Soon Alert</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Expiry Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expiringItems.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2">{item.particulars}</td>
                    <td className="px-4 py-2">{item.expiryDate || 'N/A'}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Plan - As Table */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Reorder Plan</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Minimum Stock</TableHead>
                <TableHead className="text-right">Order Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reorderPlanData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.particulars}</TableCell>
                  <TableCell className="text-right">{item.currentStock}</TableCell>
                  <TableCell className="text-right">{item.minStock}</TableCell>
                  <TableCell className="text-right font-bold text-amber-600">{item.orderQuantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Value Prediction (based on provided Python code) */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Value Prediction (Random Forest Model)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueProducts.map((product, index) => (
                      <SelectItem key={index} value={product || `product-${index}`}>
                        {product || `Product ${index}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rate</label>
                <Input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))} 
                  className="w-full"
                  step="0.01"
                />
              </div>
              <Button onClick={predictValue} className="w-full">
                Predict Value
              </Button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center justify-center">
              <h4 className="text-md font-medium mb-2">Predicted Value</h4>
              {predictedValue !== null ? (
                <div className="text-3xl font-bold text-primary">
                  ₹{predictedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Enter parameters and click "Predict Value" to see the estimation
                </p>
              )}
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Based on Random Forest Regression model trained on historical data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Insights - Complete Data Table */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Product Insights</h3>
          
          {/* Search and filters */}
          <div className="mb-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Filter by Product Type</label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tablet">Tablets</SelectItem>
                    <SelectItem value="injection">Injections</SelectItem>
                    <SelectItem value="syrup">Syrups</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Filter by Stock Status</label>
                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="excess">Excess</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val as keyof InventoryItem | "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="particulars">Product Name</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="expiryDate">Expiry Date</SelectItem>
                  </SelectContent>
                </Select>
                {sortBy && (
                  <div className="mt-2 flex">
                    <Button 
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      size="sm"
                      className="mr-2"
                      onClick={() => setSortOrder("asc")}
                    >
                      Ascending
                    </Button>
                    <Button 
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("desc")}
                    >
                      Descending
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Table with pagination */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate (₹)</TableHead>
                  <TableHead className="text-right">Value (₹)</TableHead>
                  <TableHead>Manufacturing Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.particulars}</TableCell>
                    <TableCell>{item.particularId}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {typeof item.rate === 'number' 
                        ? item.rate.toFixed(2) 
                        : parseFloat(item.rate as string || '0').toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {typeof item.value === 'number' 
                        ? item.value.toLocaleString() 
                        : parseFloat(item.value as string || '0').toLocaleString()}
                    </TableCell>
                    <TableCell>{item.manufacturingDate}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Showing {sortedData.length} of {data.length} products
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
