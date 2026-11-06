import { Bill, ShopSettings } from '../types';

export function formatWhatsAppBill(bill: Bill, settings: ShopSettings): string {
  const line = '━━━━━━━━━━━━━━━━━━━━━━';
  const dashed = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈';

  let text = `✨ *${settings.shopName.toUpperCase()}* ✨\n`;
  if (settings.tagline) {
    text += `_${settings.tagline}_\n`;
  }
  text += `${settings.address}\n`;
  text += `📞 Helpline: +91 ${settings.phone}\n`;
  text += `${line}\n`;
  text += `🧾 *DIGITAL CASH BILL / MEMO*\n`;
  text += `*Invoice No:* #${bill.invoiceNumber}\n`;
  text += `*Date & Time:* ${bill.date} | ${bill.time}\n`;
  text += `*Customer:* ${bill.customerName}\n`;
  if (bill.customerPhone && bill.customerPhone !== 'N/A') {
    text += `*Mobile:* +91 ${bill.customerPhone}\n`;
  }
  text += `${dashed}\n`;
  text += `*ITEMS PURCHASED:*\n`;

  bill.items.forEach((item, index) => {
    text += `\n${index + 1}. *${item.productName}*\n`;
    text += `   Qty: ${item.quantity} ${item.unit} × ${settings.currencySymbol}${item.price} = *${settings.currencySymbol}${item.total.toLocaleString('en-IN')}*\n`;
  });

  text += `${dashed}\n`;
  text += `*Subtotal:* ${settings.currencySymbol}${bill.subtotal.toLocaleString('en-IN')}\n`;
  if (bill.discount > 0) {
    text += `*Festive Discount:* -${settings.currencySymbol}${bill.discount.toLocaleString('en-IN')}\n`;
  }
  text += `💰 *GRAND TOTAL:* *${settings.currencySymbol}${bill.grandTotal.toLocaleString('en-IN')}*\n`;
  text += `*Payment Mode:* ${bill.paymentMode}\n`;
  text += `${line}\n`;
  text += `${settings.whatsappFooter}\n`;
  text += `⚠️ *Safety Note:* Please supervise children and burst crackers only in open spaces! 🎆`;

  return text;
}

export function formatSmsBill(bill: Bill, settings: ShopSettings): string {
  let text = `${settings.shopName} Bill #${bill.invoiceNumber} Date:${bill.date}. Items: ${bill.items.length}. Total: ${settings.currencySymbol}${bill.grandTotal}. Paid via: ${bill.paymentMode}. Happy & Safe Diwali! Helpline: ${settings.phone}`;
  return text;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  // Clean phone number: remove non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  // Default to 91 country code if 10 digits
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encoded = encodeURIComponent(text);
  if (fullPhone) {
    return `https://wa.me/${fullPhone}?text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function getSmsUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(text);
  return `sms:${cleanPhone}?body=${encoded}`;
}
