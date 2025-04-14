
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProductPerformanceChartProps {
  data: {
    name: string;
    sold: number;
    expired: number;
  }[];
}

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  const sortedData = [...data].sort((a, b) => b.sold - a.sold);
  const top5Products = sortedData.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Performing Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5Products}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sold" fill="#82ca9d" name="Sold" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
