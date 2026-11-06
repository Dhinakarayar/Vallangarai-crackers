import React, { useState } from 'react';
import { Bill, ShopSettings } from '../types';
import { formatWhatsAppBill, formatSmsBill, getWhatsAppUrl, getSmsUrl } from '../services/whatsapp';
import { Check, Copy, ExternalLink, MessageCircle, Phone, X, Sparkles } from 'lucide-react';

interface DigitalReceiptModalProps {
  bill: Bill | null;
  settings: ShopSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  bill,
  settings,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  if (!isOpen || !bill) return null;

  const whatsappText = formatWhatsAppBill(bill, settings);
  const smsText = formatSmsBill(bill, settings);
  const whatsappUrl = getWhatsAppUrl(bill.customerPhone, whatsappText);
  const smsUrl = getSmsUrl(bill.customerPhone, smsText);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySms = () => {
    navigator.clipboard.writeText(smsText);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Digital Bill & WhatsApp Share</h3>
              <p className="text-xs text-amber-100 font-medium">Invoice #{bill.invoiceNumber} (Non-GST)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-slate-200 text-sm">
          {/* Action Bar */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-3 rounded-xl transition-all shadow-lg shadow-emerald-950/40 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-medium py-2.5 px-3 rounded-xl transition-all text-center"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Message!' : 'Copy WA Text'}</span>
            </button>
          </div>

          {/* SMS Bar */}
          <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl text-xs">
            <div className="flex items-center space-x-2 truncate">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300 truncate">
                Customer: <strong className="text-white">{bill.customerPhone}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={smsUrl}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
              >
                Send SMS
              </a>
              <button
                onClick={handleCopySms}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded"
              >
                {copiedSms ? 'Copied' : 'Copy SMS'}
              </button>
            </div>
          </div>

          {/* Receipt Preview Paper Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-300 shadow-inner">
            <div className="text-center border-b border-dashed border-slate-700 pb-3 mb-3">
              <div className="font-bold text-amber-400 text-sm uppercase tracking-wide">
                {settings.shopName}
              </div>
              <div className="text-slate-400 text-[11px]">{settings.tagline}</div>
              <div className="text-slate-500 text-[10px]">{settings.address}</div>
              <div className="text-slate-400 text-[10px] mt-1">Ph: +91 {settings.phone}</div>
              <div className="mt-2 text-emerald-400 font-bold text-[11px] tracking-wider uppercase">
                Digital Cash Bill (Non-GST)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
              <div>
                <span className="text-slate-500">Invoice: </span>
                <span className="text-white font-semibold">#{bill.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Date: </span>
                <span className="text-white">{bill.date}</span>
              </div>
              <div>
                <span className="text-slate-500">Customer: </span>
                <span className="text-white">{bill.customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Mobile: </span>
                <span className="text-white">{bill.customerPhone}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-b border-dashed border-slate-700 py-2.5 my-2">
              <div className="flex justify-between font-bold text-slate-400 mb-1 text-[10px] uppercase">
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Total</span>
              </div>
              <div className="space-y-1.5">
                {bill.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="w-1/2 pr-1">
                      <div className="text-white font-medium truncate">{item.productName}</div>
                      <div className="text-[10px] text-slate-500">{item.category}</div>
                    </div>
                    <div className="w-1/4 text-center text-slate-400">
                      {item.quantity} {item.unit} x ₹{item.price}
                    </div>
                    <div className="w-1/4 text-right text-amber-300 font-semibold">
                      ₹{item.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Festive Discount:</span>
                  <span>-₹{bill.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                <span className="text-amber-400">GRAND TOTAL:</span>
                <span className="text-amber-400 text-base">₹{bill.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Payment Mode:</span>
                <span className="text-slate-300">{bill.paymentMode}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-slate-800 text-center text-[10px] text-slate-400">
              <p>{settings.whatsappFooter}</p>
              <p className="mt-1 text-slate-500">Digital Bill - Save Trees & Celebrate Safely!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
