
import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json());

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Ensure these files exist
if (!fs.existsSync('./client_secret.json')) {
  fs.writeFileSync('./client_secret.json', fs.readFileSync('./src/server/client_secret.json'));
}

if (!fs.existsSync('./credentials.json')) {
  fs.writeFileSync('./credentials.json', fs.readFileSync('./src/server/credentials.json'));
}

// Save Python script
fs.writeFileSync('./main.py', fs.readFileSync('./src/server/main.py'));

// Endpoint to handle inventory file uploads
app.post('/upload-files', upload.fields([
  { name: 'inventoryFile', maxCount: 1 },
  { name: 'minStockFile', maxCount: 1 }
]), (req, res) => {
  const files = req.files;
  
  if (!files.inventoryFile || !files.minStockFile) {
    return res.status(400).json({ success: false, message: 'Both files are required' });
  }

  return res.json({
    success: true,
    inventoryFile: files.inventoryFile[0].originalname,
    minStockFile: files.minStockFile[0].originalname
  });
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// New endpoint to process inventory files and return low stock items
app.post('/process-inventory', async (req, res) => {
  const { inventoryFilePath, minStockFilePath } = req.body;
  
  if (!inventoryFilePath || !minStockFilePath) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both inventory and minimum stock file paths are required' 
    });
  }
  
  const inventoryFullPath = path.join('./uploads', inventoryFilePath);
  const minStockFullPath = path.join('./uploads', minStockFilePath);
  
  // Check if files exist
  if (!fs.existsSync(inventoryFullPath) || !fs.existsSync(minStockFullPath)) {
    return res.status(404).json({ 
      success: false, 
      message: 'One or more files not found' 
    });
  }
  
  try {
    // Read and process the files
    const inventoryData = [];
    const minStockData = {};
    
    // First read the minimum stock file to create a lookup table
    await new Promise((resolve, reject) => {
      fs.createReadStream(minStockFullPath)
        .pipe(csv())
        .on('data', (row) => {
          // Use product ID/name as key and store minimum stock level
          const productKey = row.ProductID || row.PRODUCT_NAME || row['PRODUCT NAME'] || row.Product;
          if (productKey) {
            minStockData[productKey] = {
              minimumRequired: parseInt(row.MinStock || row['MINIMUM STOCK'] || row.MinimumStock || 0),
              monthlyAvgSales: parseInt(row.MonthlySales || row['MONTHLY AVERAGE SALES QUANTITY'] || row.AverageSales || 0)
            };
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Then read the inventory file and compare with minimum stock
    await new Promise((resolve, reject) => {
      fs.createReadStream(inventoryFullPath)
        .pipe(csv())
        .on('data', (row) => {
          const productKey = row.ProductID || row.PRODUCT_NAME || row['PRODUCT NAME'] || row.Product || row.particulars;
          const quantity = parseInt(row.Quantity || row.QUANTITY || row.quantity || row.Stock || 0);
          
          if (productKey && minStockData[productKey]) {
            const minimumRequired = minStockData[productKey].minimumRequired;
            const monthlyAvgSales = minStockData[productKey].monthlyAvgSales;
            
            // If stock is below minimum, add to low stock items
            if (quantity < minimumRequired) {
              inventoryData.push({
                product: productKey,
                packing: row.Packing || row.PACKING || row.UOM || row.Unit || row.particularId || 'N/A',
                currentStock: quantity,
                minimumRequired: minimumRequired,
                monthlyAvgSales: monthlyAvgSales,
                shortage: minimumRequired - quantity
              });
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // If no low stock items were found, use fallback data from the inventory file
    if (inventoryData.length === 0) {
      const fallbackData = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(inventoryFullPath)
          .pipe(csv())
          .on('data', (row) => {
            const productKey = row.ProductID || row.PRODUCT_NAME || row['PRODUCT NAME'] || row.Product || row.particulars;
            const quantity = parseInt(row.Quantity || row.QUANTITY || row.quantity || row.Stock || 0);
            
            // Use a random threshold for demo purposes
            const randomThreshold = Math.floor(Math.random() * 1000) + 2000;
            if (quantity < randomThreshold) {
              fallbackData.push({
                product: productKey,
                packing: row.Packing || row.PACKING || row.UOM || row.Unit || row.particularId || 'N/A',
                currentStock: quantity,
                minimumRequired: randomThreshold,
                monthlyAvgSales: Math.floor(Math.random() * 500) + 100,
                shortage: randomThreshold - quantity
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Take only up to 8 items for demo
      return res.json({
        success: true,
        lowStockItems: fallbackData.slice(0, 8),
        isSimulated: true
      });
    }
    
    return res.json({
      success: true,
      lowStockItems: inventoryData,
      isSimulated: false
    });
    
  } catch (error) {
    console.error('Error processing inventory files:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing inventory files',
      error: error.message
    });
  }
});

// Endpoint to send email using the Python script
app.post('/send-email', (req, res) => {
  const { recipientEmail, inventoryFilePath, minStockFilePath } = req.body;
  
  if (!recipientEmail) {
    return res.status(400).json({ success: false, message: 'Recipient email is required' });
  }

  // Update the RECIPIENT_EMAIL in the Python script
  let pythonScript = fs.readFileSync('./main.py', 'utf-8');
  pythonScript = pythonScript.replace(/RECIPIENT_EMAIL = '.*'/, `RECIPIENT_EMAIL = '${recipientEmail}'`);
  
  // Update inventory and min stock file paths if provided
  if (inventoryFilePath) {
    pythonScript = pythonScript.replace(/INVENTORY_FILE = '.*'/, `INVENTORY_FILE = '${path.join('./uploads', inventoryFilePath)}'`);
  }
  
  if (minStockFilePath) {
    pythonScript = pythonScript.replace(/MIN_STOCK_FILE = '.*'/, `MIN_STOCK_FILE = '${path.join('./uploads', minStockFilePath)}'`);
  }
  
  // Save the updated script
  fs.writeFileSync('./temp_script.py', pythonScript);

  console.log(`Executing Python script for ${recipientEmail}...`);
  
  // Execute the Python script
  exec('python ./temp_script.py', (error, stdout, stderr) => {
    console.log('Python script output:', stdout);
    
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    
    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
    }
    
    // Clean up temporary file
    fs.unlinkSync('./temp_script.py');
    
    // Check if the script was successful
    if (stdout.includes('Stock alert email sent successfully')) {
      return res.json({ success: true, message: 'Email sent successfully!', output: stdout });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email. See output for details.',
        output: stdout
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
