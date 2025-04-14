
interface EmailSendResponse {
  success: boolean;
  message: string;
  output?: string;
}

interface FileUploadResponse {
  success: boolean;
  inventoryFile?: string;
  minStockFile?: string;
  message?: string;
}

// API URL for the backend server
const API_URL = 'http://localhost:3001';

// Function to upload inventory and minimum stock files
export const uploadInventoryFiles = async (
  inventoryFile: File,
  minStockFile: File
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('inventoryFile', inventoryFile);
    formData.append('minStockFile', minStockFile);

    const response = await fetch(`${API_URL}/upload-files`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading files:', error);
    return {
      success: false,
      message: 'Failed to upload files. Please try again.',
    };
  }
};

// Function to send email alert
export const sendEmailAlert = async (
  recipientEmail: string,
  inventoryFilePath?: string,
  minStockFilePath?: string
): Promise<EmailSendResponse> => {
  try {
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail,
        inventoryFilePath,
        minStockFilePath,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to connect to the email server. Please try again.',
    };
  }
};
