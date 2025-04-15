
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { InventoryItem } from "@/data/inventoryData";

interface PredictedStockTableProps {
  data: InventoryItem[];
  predictedDays: number;
  setPredictedDays: (days: number) => void;
  predictedStockData: (InventoryItem & { predictedQuantity: number })[];
}

export function PredictedStockTable({ data, predictedDays, setPredictedDays, predictedStockData }: PredictedStockTableProps) {
  return (
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
}
