import XLSX from 'xlsx';
import path from 'path';

const data = [
  ['Name', 'Description', 'Price', 'Category', 'Stock', 'SKU', 'ImageURL'],
  ['Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 2999, 'Electronics', 50, 'WH-001', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
  ['Smart Watch Series 5', 'Fitness tracker with heart rate monitor and GPS', 4999, 'Wearables', 30, 'SW-005', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
  ['Leather Wallet', 'Genuine leather wallet with multiple card slots', 899, 'Accessories', 100, 'LW-012', 'https://images.unsplash.com/photo-1627123424574-724758594e93'],
  ['Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 3499, 'Computers', 25, 'MK-882', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae'],
  ['Modern Desk Lamp', 'Adjustable LED desk lamp with touch controls', 1299, 'Home Decor', 45, 'DL-04', 'https://images.unsplash.com/photo-1534073828943-f801091bb18c']
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');

const filePath = path.join(process.cwd(), 'sample_products.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Sample file created at: ${filePath}`);
