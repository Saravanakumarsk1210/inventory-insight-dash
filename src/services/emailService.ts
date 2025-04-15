
import axios from 'axios';

// Define the base URL for the server API
const API_URL = 'http://localhost:3001';

// Function to check server status
export const checkServerStatus = async () => {
  try {
    const response = await axios.get(API_URL);
    return { isConnected: true, data: response.data };
  } catch (error) {
    return { isConnected: false, error };
  }
};

// Function to upload inventory files
export const uploadInventoryFiles = async (inventoryFile: File, minStockFile: File) => {
  try {
    const formData = new FormData();
    formData.append('inventoryFile', inventoryFile);
    formData.append('minStockFile', minStockFile);
    
    const response = await axios.post(`${API_URL}/upload-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

// Function to process uploaded inventory files and get low stock items
export const processInventoryFiles = async (inventoryFilePath: string, minStockFilePath: string) => {
  try {
    const response = await axios.post(`${API_URL}/process-inventory`, {
      inventoryFilePath,
      minStockFilePath
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing inventory files:', error);
    throw error;
  }
};

// Function to send email alert
export const sendEmailAlert = async (recipientEmail: string, inventoryFilePath?: string, minStockFilePath?: string) => {
  try {
    const response = await axios.post(`${API_URL}/send-email`, {
      recipientEmail,
      inventoryFilePath,
      minStockFilePath
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending email alert:', error);
    throw error;
  }
};
