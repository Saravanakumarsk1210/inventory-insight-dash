
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Search, 
  SlidersHorizontal,
  AlertCircle
} from "lucide-react";
import { InventoryItem } from "@/data/inventoryData";
import { formatCurrency, formatDate, calculateDaysUntilExpiry, getExpiryStatus } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InventoryTableProps {
  data: InventoryItem[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'asc' | 'desc' } | null>(null);
  
  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.particularId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort data based on sortConfig
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    // Handle string vs number comparison
    let comparison = 0;
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      comparison = aString.localeCompare(bString);
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
  
  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof InventoryItem) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Items</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="w-[250px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => requestSort('particulars')}>
                  Sort by Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort('expiryDate')}>
                  Sort by Expiry Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort('value')}>
                  Sort by Value
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort('quantity')}>
                  Sort by Quantity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px] cursor-pointer" onClick={() => requestSort('particulars')}>
                  Product {getSortIndicator('particulars')}
                </TableHead>
                <TableHead className="w-[100px] cursor-pointer" onClick={() => requestSort('particularId')}>
                  ID {getSortIndicator('particularId')}
                </TableHead>
                <TableHead className="w-[120px] cursor-pointer" onClick={() => requestSort('expiryDate')}>
                  Expiry {getSortIndicator('expiryDate')}
                </TableHead>
                <TableHead className="w-[80px] text-right cursor-pointer" onClick={() => requestSort('quantity')}>
                  Qty {getSortIndicator('quantity')}
                </TableHead>
                <TableHead className="w-[80px] text-right cursor-pointer" onClick={() => requestSort('rate')}>
                  Rate {getSortIndicator('rate')}
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => requestSort('value')}>
                  Value {getSortIndicator('value')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => {
                const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
                const expiryStatus = getExpiryStatus(daysUntilExpiry);
                
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="font-medium">
                      {item.particulars}
                    </TableCell>
                    <TableCell>{item.particularId}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span>{formatDate(item.expiryDate)}</span>
                        {expiryStatus === 'expired' || expiryStatus === 'expiring-soon' ? (
                          <AlertCircle className="ml-1 h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                      {expiryStatus === 'expired' && (
                        <Badge variant="destructive" className="mt-1 text-[10px]">Expired</Badge>
                      )}
                      {expiryStatus === 'expiring-soon' && (
                        <Badge variant="outline" className="mt-1 text-[10px] border-amber-500 text-amber-500">Expiring Soon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{typeof item.rate === 'number' ? item.rate.toFixed(2) : item.rate}</TableCell>
                    <TableCell className="text-right font-medium">
                      {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4 text-xs text-muted-foreground">
          Showing {filteredData.length} of {data.length} items
        </div>
      </CardContent>
    </Card>
  );
}
