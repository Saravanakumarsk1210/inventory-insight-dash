
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

interface ExpiryRiskChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

export function ExpiryRiskChart({ data }: ExpiryRiskChartProps) {
  const EXPIRY_COLORS = {
    "expired": "#ef4444",
    "expiring-soon": "#f97316", 
    "good": "#10b981"
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiry Risk Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="count"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={EXPIRY_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {data.find(item => item.status === "expiring-soon" && item.count > 0) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
              Suggestion
            </h4>
            <p className="text-sm mt-1">
              Consider applying discounts on {data.find(item => item.status === "expiring-soon")?.count} products 
              nearing expiry to boost sales.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
