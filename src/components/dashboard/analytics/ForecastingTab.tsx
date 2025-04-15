
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp } from "lucide-react";

export function ForecastingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ML Models</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use our ML models to predict stock levels and optimize your inventory.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 mr-2 text-purple-500" />
                <h4 className="font-medium">XGBoost Stock Prediction</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Predicts future stock levels based on historical consumption patterns.
              </p>
              <Button onClick={() => alert('Running XGBoost model...')}>
                Run Prediction
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                <h4 className="font-medium">ARIMA Forecasting</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Time series analysis to forecast demand patterns and trends.
              </p>
              <Button onClick={() => alert('Running ARIMA model...')}>
                Run Forecast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Run a forecast model to view predictions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No forecast data available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
