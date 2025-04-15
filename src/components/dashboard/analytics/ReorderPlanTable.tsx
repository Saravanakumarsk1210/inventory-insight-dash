
import React, { useMemo } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";

interface ReorderPlanTableProps {
  data: InventoryItem[];
}

interface ProductStockData {
  name: string;
  currentStock: number;
  minimumStock: number;
  orderQuantity: number;
  batchCount: number;
}

export function ReorderPlanTable({ data }: ReorderPlanTableProps) {
  const reorderProducts = useMemo(() => {
    const productMap = new Map<string, ProductStockData>();
    
    // Group data by product name
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
          orderQuantity: 0,
          batchCount: 0
        });
      }
      
      const productData = productMap.get(productName)!;
      productData.currentStock += quantity;
      productData.batchCount += 1;
      
      // Use the highest minimum stock value found
      if (item.minimumStock && item.minimumStock > productData.minimumStock) {
        productData.minimumStock = item.minimumStock;
      }
    });
    
    // Calculate order quantity and filter products that need reordering
    return Array.from(productMap.values())
      .map(product => {
        // If current stock is below minimum, calculate how much to order
        // Add 30% buffer to minimum stock for safety
        const safetyBuffer = Math.ceil(product.minimumStock * 0.3);
        const idealStock = product.minimumStock + safetyBuffer;
        
        let orderQuantity = 0;
        if (product.currentStock < product.minimumStock) {
          orderQuantity = idealStock - product.currentStock;
        }
        
        return {
          ...product,
          orderQuantity
        };
      })
      .filter(product => product.orderQuantity > 0)
      .sort((a, b) => b.orderQuantity - a.orderQuantity);
  }, [data]);

  return (
    <div>
      {reorderProducts.length > 0 ? (
        <>
          <div className="flex items-center mb-3 text-blue-500 gap-1">
            <ShoppingCart size={18} />
            <span className="font-medium">
              {reorderProducts.length} {reorderProducts.length === 1 ? 'product' : 'products'} need reordering
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Minimum</TableHead>
                <TableHead className="text-right">Order Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reorderProducts.map((product) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right text-red-500 font-medium">
                    {product.currentStock}
                  </TableCell>
                  <TableCell className="text-right">{product.minimumStock}</TableCell>
                  <TableCell className="text-right text-blue-600 font-medium">
                    {product.orderQuantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          No products currently need reordering.
        </div>
      )}
    </div>
  );
}
