
import { useState } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { AlertTriangle, Check, Info, Mail, RefreshCw, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReorderingTabProps {
  data: InventoryItem[];
}

// Interface for the low stock item
interface LowStockItem {
  product: string;
  packing: string;
  currentStock: number;
  minimumRequired: number;
  monthlyAvgSales: string | number;
  shortage: number;
}

interface ReorderingFormValues {
  recipientEmail: string;
  inventoryFilePath: string;
  minStockFilePath: string;
}

export function ReorderingTab({ data }: ReorderingTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [uploadedInventoryFile, setUploadedInventoryFile] = useState<File | null>(null);
  const [uploadedMinStockFile, setUploadedMinStockFile] = useState<File | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ReorderingFormValues>({
    defaultValues: {
      recipientEmail: "",
      inventoryFilePath: "",
      minStockFilePath: "",
    },
  });

  // Handle inventory file upload
  const handleInventoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedInventoryFile(e.target.files[0]);
    }
  };

  // Handle minimum stock file upload
  const handleMinStockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedMinStockFile(e.target.files[0]);
    }
  };

  // Process inventory data - simulated functionality based on the Python code
  const processInventory = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Generate simulated low stock data based on the current inventory
      const simulatedLowStock: LowStockItem[] = data
        .filter(item => {
          // Example logic to identify items with low stock
          const quantity = typeof item.quantity === 'number' 
            ? item.quantity 
            : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0');
          
          // Random threshold for demo purposes
          const randomThreshold = Math.floor(Math.random() * 1000) + 2000;
          return quantity < randomThreshold;
        })
        .slice(0, 8) // Limit to 8 items for demo
        .map(item => {
          const quantity = typeof item.quantity === 'number' 
            ? item.quantity 
            : parseInt(item.quantity.toString().match(/\d+/)?.[0] || '0');
          
          const minimumRequired = Math.floor(Math.random() * 1000) + 2000;
          const shortage = minimumRequired - quantity;
          
          return {
            product: item.particulars,
            packing: item.particularId,
            currentStock: quantity,
            minimumRequired: minimumRequired,
            monthlyAvgSales: Math.floor(Math.random() * 500) + 100,
            shortage: shortage > 0 ? shortage : 0
          };
        });
      
      setLowStockItems(simulatedLowStock);
      setLastUpdated(new Date().toLocaleString());
      setIsProcessing(false);
      
      toast({
        title: "Inventory Processed",
        description: `Found ${simulatedLowStock.length} items below minimum stock level.`,
        variant: "default",
      });
    }, 2000);
  };

  // Send email alert - simulating the Python functionality
  const sendEmailAlert = () => {
    if (lowStockItems.length === 0) {
      toast({
        title: "No Low Stock Items",
        description: "There are no items below minimum stock level to report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsEmailSending(true);
    
    // Simulate email sending process
    setTimeout(() => {
      setIsEmailSending(false);
      
      toast({
        title: "Email Sent Successfully",
        description: `Alert email sent to ${form.getValues().recipientEmail || "the configured recipient"}.`,
        variant: "default",
      });
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Reordering</h2>
          <p className="text-muted-foreground">
            Monitor low stock items and generate reordering alerts
          </p>
        </div>
        {lastUpdated && (
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </div>
        )}
      </div>
      
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Reordering System Configuration
          </CardTitle>
          <CardDescription>
            Upload inventory data and configure alert settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Recipient Email</FormLabel>
                      <FormControl>
                        <Input placeholder="recipient@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inventoryFilePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Data File (CSV)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={handleInventoryFileUpload}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                          />
                          {uploadedInventoryFile && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minStockFilePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Levels File (CSV)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={handleMinStockFileUpload}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                          />
                          {uploadedMinStockFile && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex flex-col justify-center space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground mb-2">
                    This system integrates with your inventory data to:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Compare current stock with minimum required levels</li>
                    <li>Identify items that need to be reordered</li>
                    <li>Generate professional email alerts for purchasing</li>
                    <li>Track monthly sales and shortage quantities</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={processInventory} 
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Process Inventory Data
                  </Button>
                  
                  <Button 
                    onClick={sendEmailAlert} 
                    disabled={isEmailSending || lowStockItems.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isEmailSending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Send Alert Email
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      
      {/* Low Stock Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Items
          </CardTitle>
          <CardDescription>
            Items below minimum stock levels that need to be reordered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Packing</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Minimum Required</TableHead>
                  <TableHead>Monthly Avg Sales</TableHead>
                  <TableHead>Shortage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.packing}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{item.minimumRequired}</TableCell>
                    <TableCell>{item.monthlyAvgSales}</TableCell>
                    <TableCell className="text-red-500">{item.shortage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {isProcessing ? (
                  "Processing inventory data..."
                ) : (
                  "No low stock items detected or inventory data not processed yet."
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Email Preview */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Email Alert Preview</CardTitle>
            <CardDescription>Preview of the email that will be sent to the recipient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-md border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-bold">Subject: URGENT: Low Stock Alert - {lowStockItems.length} Items Below Minimum Level</p>
                  <p className="text-muted-foreground text-sm">To: {form.getValues().recipientEmail || "recipient@example.com"}</p>
                  <hr className="my-4" />
                </div>
                
                <p>Dear Inventory Manager,</p>
                
                <p>This is an automated alert from the Pharmafabrikon Inventory Management System. Our system has detected {lowStockItems.length} items that are currently below their minimum stock levels and require immediate attention.</p>
                
                <p className="font-bold mt-4 mb-2">Items Requiring Reordering:</p>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Shortage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.slice(0, 5).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>{item.minimumRequired}</TableCell>
                          <TableCell>{item.shortage}</TableCell>
                        </TableRow>
                      ))}
                      {lowStockItems.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            + {lowStockItems.length - 5} more items
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <p>Please place orders for these items as soon as possible to prevent stockouts and ensure uninterrupted operation.</p>
                
                <p className="mt-4">Thank you for your prompt attention to this matter.</p>
                
                <p>Best regards,<br />Pharmafabrikon Inventory Management System</p>
                
                <p className="text-xs text-muted-foreground mt-6">
                  This is an automated message - please do not reply directly to this email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
