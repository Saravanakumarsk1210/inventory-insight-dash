
import { useState } from "react";
import { InventoryItem } from "@/data/inventoryData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { AlertTriangle, Check, Info, Mail, RefreshCw, Upload, Server } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  sendEmailAlert, 
  uploadInventoryFiles, 
  checkServerStatus,
  processInventoryFiles
} from "@/services/emailService";

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
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [serverConnected, setServerConnected] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<{inventory?: string, minStock?: string}>({});
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

  // Check if backend server is running
  const handleCheckServerStatus = async () => {
    try {
      const response = await checkServerStatus();
      setServerConnected(response.isConnected);
      
      if (response.isConnected) {
        toast({
          title: "Server Connected",
          description: "Backend server is running and ready to process inventory data.",
          variant: "default",
        });
      } else {
        toast({
          title: "Server Not Available",
          description: "Backend server is not responding. Please start the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setServerConnected(false);
      toast({
        title: "Server Not Connected",
        description: "Backend server is not running. Please start the server with 'node server.js'",
        variant: "destructive",
      });
    }
  };

  // Upload files to the server
  const uploadFiles = async () => {
    if (!uploadedInventoryFile || !uploadedMinStockFile) {
      toast({
        title: "Files Required",
        description: "Please upload both inventory and minimum stock files.",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus("uploading");

    try {
      const response = await uploadInventoryFiles(uploadedInventoryFile, uploadedMinStockFile);
      
      if (response.success) {
        setUploadStatus("success");
        setUploadedFileNames({
          inventory: response.inventoryFile,
          minStock: response.minStockFile
        });
        
        toast({
          title: "Files Uploaded Successfully",
          description: "Your inventory files are ready for processing.",
          variant: "default",
        });
      } else {
        setUploadStatus("error");
        toast({
          title: "Upload Failed",
          description: response.message || "Failed to upload files.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setUploadStatus("error");
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading files.",
        variant: "destructive",
      });
    }
  };

  // Process inventory data - now uses uploaded files when available
  const processInventory = async () => {
    setIsProcessing(true);
    
    // Check if real files should be processed
    if (uploadStatus === "success" && serverConnected && uploadedFileNames.inventory && uploadedFileNames.minStock) {
      try {
        // Process the uploaded files using the backend
        const response = await processInventoryFiles(
          uploadedFileNames.inventory,
          uploadedFileNames.minStock
        );
        
        if (response.success) {
          setLowStockItems(response.lowStockItems);
          setLastUpdated(new Date().toLocaleString());
          
          toast({
            title: response.isSimulated ? "Simulated Data Used" : "Real Data Processed",
            description: `Found ${response.lowStockItems.length} items below minimum stock level.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Processing Failed",
            description: response.message || "Failed to process inventory files.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Processing Error",
          description: "An error occurred while processing inventory files.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Fallback to simulated data when files aren't uploaded or server isn't connected
      simulateProcessing();
    }
  };

  // Simulate processing (as fallback)
  const simulateProcessing = () => {
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
        title: "Simulated Data Used",
        description: `Found ${simulatedLowStock.length} items below minimum stock level. No real files were processed.`,
        variant: "default",
      });
    }, 2000);
  };

  // Send email alert - now connects to the Python script through the backend
  const handleSendEmailAlert = async () => {
    if (lowStockItems.length === 0) {
      toast({
        title: "No Low Stock Items",
        description: "There are no items below minimum stock level to report.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if recipient email is provided
    const recipientEmail = form.getValues().recipientEmail;
    if (!recipientEmail) {
      toast({
        title: "Email Address Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }

    // Show the email sending dialog
    setShowEmailDialog(true);
    setIsEmailSending(true);
    setEmailSendStatus("sending");
    
    try {
      // First stage - connecting to email service
      toast({
        title: "Connecting to Email Service",
        description: "Establishing connection to the email server...",
        variant: "default",
      });
      
      // Send the actual email using the backend service
      const response = await sendEmailAlert(
        recipientEmail,
        uploadedFileNames.inventory,
        uploadedFileNames.minStock
      );
      
      if (response.success) {
        setEmailSendStatus("success");
        toast({
          title: "Email Sent Successfully",
          description: `Alert email sent to ${recipientEmail}.`,
          variant: "default",
        });
      } else {
        setEmailSendStatus("error");
        toast({
          title: "Email Sending Failed",
          description: response.message || "Failed to send email alert.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setEmailSendStatus("error");
      toast({
        title: "Email Error",
        description: "An error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const closeEmailDialog = () => {
    setShowEmailDialog(false);
    setEmailSendStatus("idle");
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
        <div className="flex items-center gap-2">
          {serverConnected ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
              <Check className="h-3 w-3" /> Server Connected
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCheckServerStatus} className="text-xs">
              <Server className="h-3 w-3 mr-1" /> Check Server
            </Button>
          )}
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </div>
          )}
        </div>
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
                        <Input 
                          placeholder="recipient@example.com" 
                          type="email"
                          {...field} 
                          required
                        />
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
                  {uploadedInventoryFile && uploadedMinStockFile && (
                    <Button 
                      onClick={uploadFiles} 
                      disabled={uploadStatus === "uploading"}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {uploadStatus === "uploading" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload Files
                    </Button>
                  )}
                  
                  <Button 
                    onClick={processInventory} 
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Process Inventory Data
                  </Button>
                  
                  <Button 
                    onClick={handleSendEmailAlert} 
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

      {/* Email Sending Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={closeEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {emailSendStatus === "sending" ? "Sending Email Alert..." : 
               emailSendStatus === "success" ? "Email Alert Sent" : 
               emailSendStatus === "error" ? "Email Alert Failed" :
               "Email Status"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            {emailSendStatus === "sending" ? (
              <>
                <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
                <p>Sending email to {form.getValues().recipientEmail}...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a moment. The Python script is processing your data...
                </p>
              </>
            ) : emailSendStatus === "success" ? (
              <>
                <Check className="h-12 w-12 text-green-500" />
                <p>Email successfully sent!</p>
                <div className="text-sm text-muted-foreground text-center">
                  <p>The alert email has been sent to:</p>
                  <p className="font-medium mt-1">{form.getValues().recipientEmail}</p>
                </div>
              </>
            ) : emailSendStatus === "error" ? (
              <>
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p>Failed to send email</p>
                <p className="text-sm text-muted-foreground">
                  There was an error sending the email. Please check the server logs for details.
                </p>
              </>
            ) : null}
          </div>
          
          <DialogFooter>
            <Button onClick={closeEmailDialog}>
              {emailSendStatus === "success" ? "Close" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
