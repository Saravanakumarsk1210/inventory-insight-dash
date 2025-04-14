
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/data/inventoryData";
import { calculateDaysUntilExpiry, formatDate, getExpiryStatus } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ExpiryTimelineProps {
  data: InventoryItem[];
}

export function ExpiryTimeline({ data }: ExpiryTimelineProps) {
  // Calculate expiry information for all items
  const expiryInfo = data.map(item => {
    const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
    const status = getExpiryStatus(daysUntilExpiry);
    
    return {
      ...item,
      daysUntilExpiry,
      status
    };
  });
  
  // Sort by expiry date (closest first)
  const sortedItems = [...expiryInfo].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  
  // Take only the first 7 items for display
  const upcomingExpiryItems = sortedItems.slice(0, 7);
  
  // Count items by expiry status
  const expiredCount = expiryInfo.filter(item => item.status === 'expired').length;
  const expiringSoonCount = expiryInfo.filter(item => item.status === 'expiring-soon').length;
  const attentionCount = expiryInfo.filter(item => item.status === 'attention').length;
  const goodCount = expiryInfo.filter(item => item.status === 'good').length;
  
  const totalItems = data.length;
  
  const getColorForStatus = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-500';
      case 'expiring-soon': return 'bg-amber-500';
      case 'attention': return 'bg-pharma-blue';
      case 'good': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiry Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Expiry distribution */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>All Products Expiry Status</span>
              <span className="text-muted-foreground">{totalItems} items</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 flex overflow-hidden">
              <div 
                className="h-full bg-red-500" 
                style={{ width: `${(expiredCount / totalItems) * 100}%` }} 
                title={`Expired: ${expiredCount} items`}
              />
              <div 
                className="h-full bg-amber-500" 
                style={{ width: `${(expiringSoonCount / totalItems) * 100}%` }} 
                title={`Expiring Soon: ${expiringSoonCount} items`}
              />
              <div 
                className="h-full bg-pharma-blue" 
                style={{ width: `${(attentionCount / totalItems) * 100}%` }} 
                title={`Attention: ${attentionCount} items`}
              />
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${(goodCount / totalItems) * 100}%` }} 
                title={`Good: ${goodCount} items`}
              />
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-1"></div>
                <span>Expired: {expiredCount}</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-amber-500 rounded-full mr-1"></div>
                <span>&lt;90 days: {expiringSoonCount}</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-pharma-blue rounded-full mr-1"></div>
                <span>&lt;180 days: {attentionCount}</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                <span>Good: {goodCount}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-3">Upcoming Expirations</h4>
            <div className="space-y-3">
              {upcomingExpiryItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className={`h-2 w-2 rounded-full mr-2 ${getColorForStatus(item.status)}`}
                      />
                      <span className="text-sm truncate" title={item.particulars}>
                        {item.particulars.length > 25 ? `${item.particulars.substring(0, 25)}...` : item.particulars}
                      </span>
                    </div>
                    <Badge
                      variant={item.status === 'expired' ? 'destructive' : 'outline'}
                      className={`text-[10px] ${item.status === 'expiring-soon' ? 'border-amber-500 text-amber-500' : ''}`}
                    >
                      {item.status === 'expired' ? 'EXPIRED' : `${item.daysUntilExpiry} days`}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="mr-2">Batch: {item.particularId}</span>
                    <span>Expires: {formatDate(item.expiryDate)}</span>
                  </div>
                  <Progress 
                    value={item.status === 'good' ? 80 : item.status === 'attention' ? 60 : 
                           item.status === 'expiring-soon' ? 30 : 10} 
                    className={`h-1 ${getColorForStatus(item.status).replace('bg-', 'bg-opacity-20 ')} ${getColorForStatus(item.status)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
