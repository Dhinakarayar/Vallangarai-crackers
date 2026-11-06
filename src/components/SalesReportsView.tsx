import React, { useState, useMemo } from 'react';
import { Bill, Product, ShopSettings } from '../types';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Layers,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

interface SalesReportsViewProps {
  bills: Bill[];
  products: Product[];
  settings: ShopSettings;
}

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'custom';

export const SalesReportsView: React.FC<SalesReportsViewProps> = ({
  bills,
  products,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('daily');
  const todayStr = new Date().toISOString().split('T')[0];

  // Custom date range state
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Compute date boundaries
  const filteredBills = useMemo(() => {
    const now = new Date();
    if (activeTab === 'daily') {
      return bills.filter((b) => b.date === todayStr);
    } else if (activeTab === 'weekly') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return bills.filter((b) => b.date >= sevenDaysAgo && b.date <= todayStr);
    } else if (activeTab === 'monthly') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return bills.filter((b) => b.date >= thirtyDaysAgo && b.date <= todayStr);
    } else {
      // Custom
      return bills.filter((b) => {
        if (!startDate && !endDate) return true;
        if (startDate && b.date < startDate) return false;
        if (endDate && b.date > endDate) return false;
        return true;
      });
    }
  }, [bills, activeTab, todayStr, startDate, endDate]);

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return filteredBills.reduce((acc, b) => acc + b.grandTotal, 0);
  }, [filteredBills]);

  const totalBillsCount = filteredBills.length;

  const totalCrackersSold = useMemo(() => {
    return filteredBills.reduce((acc, b) => {
      return acc + b.items.reduce((iAcc, item) => iAcc + item.quantity, 0);
    }, 0);
  }, [filteredBills]);

  const averageBillValue = totalBillsCount > 0 ? totalRevenue / totalBillsCount : 0;

  // Best-Selling Products Aggregate
  const productSalesMap = useMemo(() => {
    const map: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};

    filteredBills.forEach((b) => {
      b.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.productName,
            category: item.category,
            qty: 0,
            revenue: 0,
          };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.total;
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBills]);

  // Category Breakdown Aggregate
  const categorySalesMap = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredBills.forEach((b) => {
      b.items.forEach((item) => {
        catMap[item.category] = (catMap[item.category] || 0) + item.total;
      });
    });
    return Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  }, [filteredBills]);

  // Daily Chart Trend (last 7 days)
  const dailyTrend = useMemo(() => {
    const days: { date: string; label: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const dayBills = bills.filter((b) => b.date === dStr);
      const total = dayBills.reduce((acc, b) => acc + b.grandTotal, 0);
      days.push({
        date: dStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        total,
        count: dayBills.length,
      });
    }
    return days;
  }, [bills]);

  const maxDailyTrend = Math.max(...dailyTrend.map((d) => d.total), 1);

  // Export to CSV / Excel
  const exportToExcel = () => {
    let csv = `CRACKERS SHOP SALES REPORT - ${activeTab.toUpperCase()}\n`;
    csv += `Shop Name:,${settings.shopName}\n`;
    csv += `Generated On:,${new Date().toLocaleString()}\n`;
    csv += `Total Sales:,${settings.currencySymbol}${totalRevenue}\n`;
    csv += `Total Invoices:,${totalBillsCount}\n`;
    csv += `Total Crackers Sold:,${totalCrackersSold}\n\n`;

    csv += `INVOICE BREAKDOWN\n`;
    csv += `Invoice #,Date,Time,Customer,Phone,Items Count,Subtotal,Discount,Grand Total,Payment\n`;
    filteredBills.forEach((b) => {
      const itemsCount = b.items.reduce((acc, it) => acc + it.quantity, 0);
      csv += `"${b.invoiceNumber}","${b.date}","${b.time}","${b.customerName}","${b.customerPhone}",${itemsCount},${b.subtotal},${b.discount},${b.grandTotal},"${b.paymentMode}"\n`;
    });

    csv += `\nPRODUCT-WISE BEST SELLERS\n`;
    csv += `Product Name,Category,Units Sold,Total Revenue\n`;
    productSalesMap.forEach((p) => {
      csv += `"${p.name}","${p.category}",${p.qty},${p.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Crackers_Sales_Report_${activeTab}_${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Sales Reports & Business Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time daily, weekly, monthly, and custom period revenue breakdown with top-selling cracker insights.
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export to Excel (CSV)</span>
        </button>
      </div>

      {/* Report Period Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex space-x-1">
          {(
            [
              { key: 'daily', label: "Today's Sales" },
              { key: 'weekly', label: 'Last 7 Days' },
              { key: 'monthly', label: 'Last 30 Days' },
              { key: 'custom', label: 'Custom Range' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Controls */}
        {activeTab === 'custom' && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded-lg text-xs"
            />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-medium">Total Revenue</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {settings.currencySymbol}{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Non-GST Net Billing</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-medium">Invoices Generated</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {totalBillsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Completed Transactions
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-medium">Total Crackers Sold</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            {totalCrackersSold}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Units / Boxes Dispatched
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-xs font-medium">Average Bill Value</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {settings.currencySymbol}{Math.round(averageBillValue).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Per Customer Ticket
          </div>
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Daily Sales Trend Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>7-Day Sales Trend (₹)</span>
            </span>
            <span className="text-[11px] text-slate-400">Peak: ₹{maxDailyTrend.toLocaleString('en-IN')}</span>
          </div>

          <div className="h-44 flex items-end justify-between space-x-2 pt-4 px-2">
            {dailyTrend.map((day, idx) => {
              const heightPercent = Math.max(10, (day.total / maxDailyTrend) * 100);
              const isToday = day.date === todayStr;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{day.total}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      isToday
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-900/40'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                  <div className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {day.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Category Revenue Share</span>
            </span>
          </div>

          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {categorySalesMap.map(([cat, amt]) => {
              const share = totalRevenue > 0 ? (amt / totalRevenue) * 100 : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono text-amber-300">
                      ₹{amt.toLocaleString('en-IN')}{' '}
                      <span className="text-slate-500 text-[10px]">({Math.round(share)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {categorySalesMap.length === 0 && (
              <div className="py-10 text-center text-slate-500 text-xs">
                No category sales recorded in this period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top-Selling Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Top-Selling Crackers in Selected Period</span>
          </span>
          <span className="text-[11px] text-slate-400">Ranked by Total Revenue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {productSalesMap.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">{p.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-white">
                    {p.qty}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                    {settings.currencySymbol}{p.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {productSalesMap.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No sales recorded for this period.
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
