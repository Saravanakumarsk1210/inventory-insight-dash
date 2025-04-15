
import React, { useMemo } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface ExpiringItemsListProps {
  data: InventoryItem[];
}

export function ExpiringItemsList({ data }: ExpiringItemsListProps) {
  const expiringItems = useMemo(() => {
    return data
      .map(item => {
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...item,
          daysUntilExpiry
        };
      })
      .filter(item => item.daysUntilExpiry > 0 && item.daysUntilExpiry < 90)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
      .slice(0, 10); // Show top 10 items expiring soonest
  }, [data]);

  return (
    <div>
      {expiringItems.length > 0 ? (
        <>
          <div className="flex items-center mb-3 text-amber-500 gap-1">
            <AlertTriangle size={18} />
            <span className="font-medium">
              {expiringItems.length} {expiringItems.length === 1 ? 'item' : 'items'} expiring soon
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringItems.map((item) => (
                <TableRow key={item.particularId}>
                  <TableCell className="font-medium">{item.particulars}</TableCell>
                  <TableCell>{item.particularId}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    item.daysUntilExpiry < 30 ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {item.daysUntilExpiry} days
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          No items are expiring soon.
        </div>
      )}
    </div>
  );
}
