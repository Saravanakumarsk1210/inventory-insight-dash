
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StockOverviewChartProps {
  data: {
    name: string;
    stock: number;
    minThreshold: number;
    batches: number;
  }[];
}

export function StockOverviewChart({ data }: StockOverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#82ca9d" name="Current Stock" />
            <Bar dataKey="minThreshold" fill="#ff7373" name="Min Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
