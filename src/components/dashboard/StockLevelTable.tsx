
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItem } from "@/data/inventoryData";
import { AlertTriangle, CheckCircle, AlertCircle, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockLevelTableProps {
  data: InventoryItem[];
}

type SortField = 'name' | 'currentStock' | 'minimumStock' | 'gap' | 'coverage';
type SortDirection = 'asc' | 'desc';

interface ProductStockDetail {
  name: string;
  currentStock: number;
  minimumStock: number;
  gap: number;
  monthlyAvgSales: number;
  coverage: number;
  status: 'danger' | 'warning' | 'good';
}

export function StockLevelTable({ data }: StockLevelTableProps) {
  const [sortField, setSortField] = useState<SortField>('gap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Process the data to get product-wise stock details
  const productStockDetails: ProductStockDetail[] = React.useMemo(() => {
    const productMap = new Map<string, ProductStockDetail>();
    
    data.forEach(item => {
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
          monthlyAvgSales: item.monthlyAvgSales || 0,
          coverage: 0,
          status: 'good'
        });
      }
      
      const productData = productMap.get(productName)!;
      productData.currentStock += quantity;
      
      // Use the highest values for minimum stock and monthly sales
      if (item.minimumStock && item.minimumStock > productData.minimumStock) {
        productData.minimumStock = item.minimumStock;
      }
      
      if (item.monthlyAvgSales && item.monthlyAvgSales > productData.monthlyAvgSales) {
        productData.monthlyAvgSales = item.monthlyAvgSales;
      }
    });
    
    // Calculate gap and status
    return Array.from(productMap.values())
      .map(product => {
        const gap = product.currentStock - product.minimumStock;
        let status: 'danger' | 'warning' | 'good' = 'good';
        
        if (gap < 0) {
          status = 'danger';
        } else if (gap < product.minimumStock * 0.25) {
          status = 'warning';
        }
        
        // Calculate inventory coverage in months
        const coverage = product.monthlyAvgSales > 0 
          ? product.currentStock / product.monthlyAvgSales 
          : 999; // Very high number if no monthly sales
        
        return {
          ...product,
          gap,
          coverage,
          status
        };
      });
  }, [data]);
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Apply sorting and filtering
  const sortedAndFilteredData = React.useMemo(() => {
    // Filter by search query
    let filtered = productStockDetails;
    if (searchQuery) {
      filtered = productStockDetails.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort data
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'currentStock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'minimumStock':
          comparison = a.minimumStock - b.minimumStock;
          break;
        case 'gap':
          comparison = a.gap - b.gap;
          break;
        case 'coverage':
          comparison = a.coverage - b.coverage;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [productStockDetails, sortField, sortDirection, searchQuery]);
  
  // Status indicators
  const getStatusIndicator = (status: 'danger' | 'warning' | 'good') => {
    switch (status) {
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stock Level Details</span>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="flex items-center font-semibold"
                  >
                    Product
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('currentStock')}
                    className="flex items-center font-semibold justify-end"
                  >
                    Current
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('minimumStock')}
                    className="flex items-center font-semibold justify-end"
                  >
                    Min
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('gap')}
                    className="flex items-center font-semibold justify-end"
                  >
                    Gap
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('coverage')}
                    className="flex items-center font-semibold justify-end"
                  >
                    Coverage
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[70px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.currentStock}</TableCell>
                  <TableCell className="text-right">{item.minimumStock}</TableCell>
                  <TableCell className={`text-right ${item.gap < 0 ? 'text-red-500 font-medium' : ''}`}>
                    {item.gap}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.coverage === 999 ? '∞' : `${item.coverage.toFixed(1)} mo`}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {getStatusIndicator(item.status)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
