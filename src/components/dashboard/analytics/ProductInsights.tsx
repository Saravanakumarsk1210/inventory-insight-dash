
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { InventoryItem } from "@/data/inventoryData";

interface ProductInsightsProps {
  data: InventoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productFilter: string;
  setProductFilter: (filter: string) => void;
  expiryFilter: string;
  setExpiryFilter: (filter: string) => void;
  selectedProduct: string | null;
  setSelectedProduct: (product: string | null) => void;
  uniqueProductNames: string[];
  stockLevelsData: {
    name: string;
    stock: number;
    minThreshold: number;
    batches: number;
  }[];
  selectedProductData: {
    name: string;
    batches: number;
    totalQuantity: number;
    totalValue: number;
    items: InventoryItem[];
  } | null;
}

export function ProductInsights({ 
  data,
  searchQuery,
  setSearchQuery,
  productFilter,
  setProductFilter,
  expiryFilter,
  setExpiryFilter,
  selectedProduct,
  setSelectedProduct,
  uniqueProductNames,
  stockLevelsData,
  selectedProductData
}: ProductInsightsProps) {
  return (
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
}
