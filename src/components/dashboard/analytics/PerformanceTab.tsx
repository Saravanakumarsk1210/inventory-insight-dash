
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Box } from "lucide-react";

interface PerformanceTabProps {
  uniqueProductNames: string[];
}

export function PerformanceTab({ uniqueProductNames }: PerformanceTabProps) {
  return (
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
  );
}
