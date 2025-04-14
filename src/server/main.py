
import os
import base64
import pickle
import pandas as pd
import google.generativeai as genai
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import base64

# Define constants
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
TOKEN_FILE = 'token.pickle'
CREDENTIALS_FILE = 'client_secret.json'
INVENTORY_FILE = 'TRADING PRODUCT DETAILS AS ON 05.02.2025 (2) (1).csv'
MIN_STOCK_FILE = 'TRADING PRODUCT MINIMUM ORDER STOCK 05.02.2025 (2).csv'
RECIPIENT_EMAIL = 'narmadhar@student.tce.edu'  # Replace with actual email

# Configure Google AI Studio API
genai.configure(api_key="AIzaSyAfEF0sTg_NWTDxBhWb_qphGY1uwENp_1M")  # Replace with your API key

# Authenticate Gmail
def authenticate_gmail():
    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=8080)

        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

# Process inventory data - specifically for Tally CSV exports
def process_inventory_data():
    try:
        # Read files as raw text to handle Tally's specific format
        with open(INVENTORY_FILE, 'r') as f:
            inventory_lines = f.readlines()
        
        with open(MIN_STOCK_FILE, 'r') as f:
            min_stock_lines = f.readlines()
        
        # Process inventory data
        inventory_data = {}
        current_product = None
        
        # Find the line containing column headers in inventory file
        header_index = 0
        for i, line in enumerate(inventory_lines):
            if "Particulars" in line and "Quantity" in line and "Rate" in line and "Value" in line:
                header_index = i
                break
        
        # Process inventory lines
        for line in inventory_lines[header_index+1:]:
            # Split the line by comma
            parts = line.strip().split(',')
            # Check if it's a product line (not a batch or empty line)
            if len(parts) > 0 and parts[0] and "Mfg Date" not in line and "Finished Goods" not in line:
                # This is likely a product line
                product_name = parts[0].strip()
                if product_name:
                    current_product = product_name
                
                # Look for quantity
                if len(parts) >= 5 and parts[4]:
                    qty_str = parts[4].strip()
                    try:
                        # Handle different quantity formats
                        if 'unit' in qty_str:
                            qty = float(qty_str.split(' unit')[0])
                        elif 'amp' in qty_str.lower():
                            qty = float(qty_str.split(' amp')[0])
                        elif 'vial' in qty_str.lower():
                            qty = float(qty_str.split(' Vial')[0])
                        else:
                            try:
                                qty = float(qty_str)
                            except ValueError:
                                qty = 0
                                
                        inventory_data[current_product] = qty
                    except Exception as e:
                        print(f"Error processing quantity for {current_product}: {e}")
        
        print(f"Processed {len(inventory_data)} inventory items")
        
        # Process minimum stock data
        low_stock_items = []
        
        # Find the header row in min stock file
        min_header_index = 0
        for i, line in enumerate(min_stock_lines):
            if "S.NO" in line and "PRODUCTS NAME" in line and "MINIMUM STOCK" in line:
                min_header_index = i
                break
        
        # Process minimum stock lines
        for line in min_stock_lines[min_header_index+1:]:
            parts = line.strip().split(',')
            if len(parts) < 6:
                continue
            
            # Skip empty rows
            if not parts[0].strip():
                continue
            
            try:
                sno = parts[0].strip()
                product_name = parts[1].strip() if len(parts) > 1 else ""
                packing = parts[2].strip() if len(parts) > 2 else ""
                monthly_avg = parts[3].strip() if len(parts) > 3 else "0"
                min_stock_str = parts[5].strip() if len(parts) > 5 else "0"
                
                # Skip if no product name
                if not product_name:
                    continue
                
                # Parse minimum stock quantity
                min_stock = 0
                if min_stock_str:
                    for unit in ['BOT', 'BOX', 'AMP', 'INJ', 'VIAL', 'TUBE']:
                        if unit in min_stock_str:
                            try:
                                min_stock = int(min_stock_str.split(' ' + unit)[0])
                            except ValueError:
                                min_stock = 0
                            break
                
                # Find matching inventory item
                found = False
                current_stock = 0
                
                for inv_product, qty in inventory_data.items():
                    # Normalize product names for comparison
                    norm_inv_product = inv_product.lower().replace('-', ' ').strip()
                    norm_product_name = product_name.lower().replace('-', ' ').strip()
                    
                    # Check if the product names match
                    if norm_product_name in norm_inv_product:
                        found = True
                        current_stock = qty
                        break
                
                # Check if stock is below minimum
                if found and current_stock < min_stock:
                    low_stock_items.append({
                        'product': product_name,
                        'packing': packing,
                        'current_stock': current_stock,
                        'minimum_required': min_stock,
                        'monthly_avg_sales': monthly_avg,
                        'shortage': min_stock - current_stock
                    })
                elif not found and min_stock > 0:
                    # Product not found in inventory - consider as zero stock
                    low_stock_items.append({
                        'product': product_name,
                        'packing': packing,
                        'current_stock': 0,
                        'minimum_required': min_stock,
                        'monthly_avg_sales': monthly_avg,
                        'shortage': min_stock
                    })
            except Exception as e:
                print(f"Error processing min stock line: {line.strip()} - {e}")
        
        print(f"Found {len(low_stock_items)} items below minimum stock level")
        return low_stock_items
        
    except Exception as e:
        print(f"Error processing inventory data: {e}")
        import traceback
        traceback.print_exc()
        return []

# Generate email content using Google AI Studio
def generate_stock_alert_email(low_stock_items):
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    # Create a table of low stock items
    items_table = "| Product | Packing | Current Stock | Minimum Required | Monthly Avg Sales | Shortage |\n"
    items_table += "|---------|---------|---------------|------------------|-------------------|----------|\n"
    
    for item in low_stock_items:
        items_table += f"| {item['product']} | {item['packing']} | {item['current_stock']} | {item['minimum_required']} | {item['monthly_avg_sales']} | {item['shortage']} |\n"
    
    prompt = f"""
    Write a professional email alert about low inventory items that need to be ordered immediately for Pharmafabrikon.
    Include the following information in a clear, structured format:
    
    1. A brief introduction explaining this is an automated inventory alert
    2. The number of items below minimum stock level ({len(low_stock_items)})
    3. This table of items that need ordering:
    
    {items_table}
    
    4. A polite request to place orders soon to avoid stockouts
    5. A note that this is an automated email from the inventory management system
    """
    
    response = model.generate_content(prompt)
    return response.text.strip()

def create_message(to, subject, body):
    message = MIMEMultipart("alternative")
    message["to"] = to
    message["subject"] = subject

    # Plain text part for compatibility
    text_part = MIMEText(body, "plain")

    # Extract the markdown table part and convert to HTML table
    lines = body.splitlines()
    html_lines = []
    in_table = False

    for line in lines:
        if line.strip().startswith("|") and line.strip().endswith("|"):
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if not in_table:
                html_lines.append("<table border='1' cellpadding='6' cellspacing='0' style='border-collapse: collapse;'>")
                html_lines.append("<thead><tr>" + "".join(f"<th>{cell}</th>" for cell in cells) + "</tr></thead><tbody>")
                in_table = True
            else:
                # Ignore separator line
                if "---" in line:
                    continue
                html_lines.append("<tr>" + "".join(f"<td>{cell}</td>" for cell in cells) + "</tr>")
        else:
            if in_table:
                html_lines.append("</tbody></table>")
                in_table = False
            html_lines.append(f"<p>{line}</p>")

    if in_table:
        html_lines.append("</tbody></table>")

    html_body = "<html><body>" + "\n".join(html_lines) + """
    <p style="color: gray; font-size: small;">This is an automated email from the Pharmafabrikon Inventory Management System.</p>
    </body></html>
    """

    html_part = MIMEText(html_body, "html")

    # Attach both versions
    message.attach(text_part)
    message.attach(html_part)

    return {
        'raw': base64.urlsafe_b64encode(message.as_bytes()).decode()
    }

# Send email via Gmail API
def send_email(service, to, subject, body):
    message = create_message(to, subject, body)
    try:
        sent_message = service.users().messages().send(userId='me', body=message).execute()
        print(f"Email sent to {to}! Message ID: {sent_message['id']}")
        return True
    except Exception as e:
        print(f"Error sending email to {to}: {e}")
        return False

# Main function
def main():
    # Process inventory data to find low stock items
    low_stock_items = process_inventory_data()
    
    # If there are no low stock items, exit
    if not low_stock_items:
        print("All inventory items are at or above minimum stock levels. No alerts needed.")
        return
    
    # Authenticate with Gmail
    creds = authenticate_gmail()
    service = build('gmail', 'v1', credentials=creds)
    
    # Generate AI-powered email content
    body = generate_stock_alert_email(low_stock_items)
    subject = f"URGENT: Low Stock Alert - {len(low_stock_items)} Items Below Minimum Level"
    
    # Send email
    success = send_email(service, RECIPIENT_EMAIL, subject, body)
    
    if success:
        print(f"Stock alert email sent successfully for {len(low_stock_items)} items.")
    else:
        print("Failed to send stock alert email.")

if __name__ == '__main__':
    main()
