import React, { useState, useMemo } from 'react';
import { Bill, ShopSettings } from '../types';
import { formatWhatsAppBill, formatSmsBill, getWhatsAppUrl } from '../services/whatsapp';
import {
  Receipt,
  Search,
  MessageCircle,
  Copy,
  Eye,
  Calendar,
  Phone,
  User,
  CreditCard,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface BillHistoryViewProps {
  bills: Bill[];
  settings: ShopSettings;
  onOpenReceipt: (bill: Bill) => void;
}

export const BillHistoryView: React.FC<BillHistoryViewProps> = ({
  bills,
  settings,
  onOpenReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.invoiceNumber.toLowerCase().includes(q) ||
        b.customerPhone.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q);
      const matchesDate = !filterDate || b.date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [bills, searchTerm, filterDate]);

  const handleShareWhatsApp = (b: Bill) => {
    const text = formatWhatsAppBill(b, settings);
    const url = getWhatsAppUrl(b.customerPhone, text);
    window.open(url, '_blank');
  };

  const handleCopySMS = (b: Bill) => {
    const text = formatSmsBill(b, settings);
    navigator.clipboard.writeText(text);
    setCopiedInvoice(b.invoiceNumber);
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>Digital Bill History & Invoices</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search previous bills by invoice number or mobile, inspect full item breakdowns, and re-share via WhatsApp.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Total Saved Invoices: <strong className="text-white">{bills.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice number (e.g. SLCM-1001) or customer phone..."
            className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-4 relative flex items-center">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-8 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="absolute right-2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      #{b.invoiceNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <div>{b.date}</div>
                    <div className="text-[10px] text-slate-500">{b.time}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{b.customerName}</span>
                    </div>
                    {b.customerPhone && b.customerPhone !== 'N/A' && (
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{b.customerPhone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                      {b.items.reduce((acc, it) => acc + it.quantity, 0)} crackers ({b.items.length} types)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 text-[11px] text-slate-300">
                      <CreditCard className="w-3 h-3 text-slate-500" />
                      <span>{b.paymentMode}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-bold text-amber-300 text-sm">
                      {settings.currencySymbol}{b.grandTotal.toLocaleString('en-IN')}
                    </div>
                    {b.discount > 0 && (
                      <div className="text-[10px] text-emerald-400">
                        Saved: {settings.currencySymbol}{b.discount}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      SQLite
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* View Receipt */}
                      <button
                        onClick={() => onOpenReceipt(b)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="View Full Bill Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp Share */}
                      <button
                        onClick={() => handleShareWhatsApp(b)}
                        className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg transition-colors"
                        title="Send via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy SMS */}
                      <button
                        onClick={() => handleCopySMS(b)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                        title="Copy SMS format"
                      >
                        {copiedInvoice === b.invoiceNumber ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No bills found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
