
import React from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart,
  Area, Scatter, ScatterChart, ZAxis, Brush, ReferenceLine
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AnalyticsTabProps {
  data: InventoryItem[];
}

export function AnalyticsTab({ data }: AnalyticsTabProps) {
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

      {/* Reorder Plan - Changed to Table */}
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

      {/* Product Insights - Changed to Table with Filters */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Product Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Product Type</label>
              <select className="w-full p-2 border rounded">
                <option value="">All Types</option>
                <option value="tablet">Tablets</option>
                <option value="injection">Injections</option>
                <option value="syrup">Syrups</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Stock Status</label>
              <select className="w-full p-2 border rounded">
                <option value="">All Status</option>
                <option value="low">Low Stock</option>
                <option value="normal">Normal</option>
                <option value="excess">Excess</option>
              </select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.particulars}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{typeof item.value === 'number' ? 
                    item.value.toLocaleString() : 
                    parseFloat(item.value as string).toLocaleString()}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
