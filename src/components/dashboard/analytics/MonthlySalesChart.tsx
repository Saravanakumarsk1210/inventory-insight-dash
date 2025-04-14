
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from "recharts";

interface MonthlySalesChartProps {
  data: {
    month: string;
    sales: number;
    stock?: number;
  }[];
}

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
            {data[0]?.stock !== undefined && 
              <Line type="monotone" dataKey="stock" stroke="#82ca9d" name="Stock" />
            }
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
