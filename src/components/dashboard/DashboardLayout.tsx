
import { useState, useMemo } from "react";
import { 
  Package2,
  Calendar,
  DollarSign,
  BadgePercent,
  Activity,
  Search,
  BarChart3,
  ShoppingCart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "./StatsCard";
import { InventoryTable } from "./InventoryTable";
import { ExpiryTimeline } from "./ExpiryTimeline";
import { ProductValueChart } from "./ProductValueChart";
import { InventoryTypeDistribution } from "./InventoryTypeDistribution";
import { InventoryItem, inventoryData } from "@/data/inventoryData";
import { formatCurrency, calculateDaysUntilExpiry, getExpiryStatus } from "@/utils/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from "./AnalyticsTab";
import { ReorderingTab } from "./ReorderingTab";

export function DashboardLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return inventoryData;
    
    return inventoryData.filter(item => 
      item.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.particularId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, inventoryData]);
  
  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalItems = filteredData.length;
    
    let totalValue = 0;
    let totalQuantity = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    let uniqueProducts = new Set();
    
    filteredData.forEach(item => {
      // Calculate total value
      if (typeof item.value === 'number') {
        totalValue += item.value;
      } else if (typeof item.value === 'string') {
        totalValue += parseFloat(item.value) || 0;
      }
      
      // Calculate total quantity (if numeric)
      if (typeof item.quantity === 'number') {
        totalQuantity += item.quantity;
      } else if (typeof item.quantity === 'string') {
        // Try to extract numeric part from strings like "5654 amp"
        const matches = item.quantity.match(/^(\d+)/);
        if (matches && matches[1]) {
          totalQuantity += parseInt(matches[1]);
        }
      }
      
      // Count expiring items
      const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
      const status = getExpiryStatus(daysUntilExpiry);
      
      if (status === 'expired') {
        expiredCount++;
      } else if (status === 'expiring-soon') {
        expiringCount++;
      }
      
      // Count unique products (base names)
      const productBaseName = item.particulars.split(' - ')[0];
      uniqueProducts.add(productBaseName);
    });
    
    return {
      totalValue,
      totalQuantity,
      totalItems,
      expiringCount,
      expiredCount,
      uniqueProductCount: uniqueProducts.size
    };
  }, [filteredData]);

  return (
    <div className="container py-6">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your pharmaceutical inventory status and metrics
          </p>
        </div>
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative max-w-sm md:max-w-md w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or batches..."
              className="pl-8 pr-4 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Inventory Value"
          value={formatCurrency(stats.totalValue)}
          icon={<DollarSign />}
        />
        <StatsCard
          title="Total Products"
          value={stats.uniqueProductCount}
          description={`${stats.totalItems} total items in inventory`}
          icon={<Package2 />}
        />
        <StatsCard
          title="Expiring Products"
          value={stats.expiringCount + stats.expiredCount}
          description={stats.expiredCount > 0 ? `${stats.expiredCount} items expired` : "Monitor expiring products"}
          icon={<Calendar />}
          className={stats.expiredCount > 0 ? "border-red-200 bg-red-50" : ""}
        />
      </div>
      
      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="w-full mb-6">
        <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reordering">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Reordering
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inventory table - spans 2 columns */}
            <InventoryTable data={filteredData} />
            
            {/* Sidebar content - 1 column */}
            <div className="space-y-6">
              <ExpiryTimeline data={filteredData} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <ProductValueChart data={filteredData} />
                <InventoryTypeDistribution data={filteredData} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsTab data={filteredData} />
        </TabsContent>
        
        {/* Reordering Tab */}
        <TabsContent value="reordering">
          <ReorderingTab data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
