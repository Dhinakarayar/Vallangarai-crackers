import React, { useState, useMemo } from 'react';
import { Customer, ShopSettings } from '../types';
import { db } from '../services/db';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Plus,
  Calendar,
  IndianRupee,
  Receipt,
  X
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  settings: ShopSettings;
  onCustomersUpdated: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  onCustomersUpdated,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase().trim();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [customers, search]);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    db.saveCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      totalBills: 0,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    onCustomersUpdated();
  };

  const handleOpenWhatsApp = (c: Customer) => {
    const clean = c.phone.replace(/\D/g, '');
    const full = clean.length === 10 ? `91${clean}` : clean;
    const msg = encodeURIComponent(
      `Hello ${c.name}! ✨ Greetings from ${settings.shopName}! Thank you for your continued festival patronage. We have fresh Sivakasi crackers in stock. Visit us or order online!`
    );
    window.open(`https://wa.me/${full}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Customer Directory & Purchase History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-saved customer profiles, lifetime spends, and quick WhatsApp outreach.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, phone number, or locality..."
          className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Address / Area</th>
                <th className="py-3 px-4 text-center">Total Invoices</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-center">Last Visit</th>
                <th className="py-3 px-4 text-right">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    +91 {c.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {c.address || '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">
                    {c.totalBills}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                    {settings.currencySymbol}{c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">
                    {c.lastVisit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenWhatsApp(c)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-medium inline-flex items-center space-x-1 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No customers found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9840123456"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Address / Locality</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Main Bazaar Road, Sivakasi"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
