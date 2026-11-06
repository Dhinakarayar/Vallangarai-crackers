import React, { useState, useMemo } from 'react';
import { CrackerCategory, Product, ShopSettings } from '../types';
import { db } from '../services/db';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Flame,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  settings: ShopSettings;
  onProductsUpdated: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  onProductsUpdated,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<CrackerCategory>('Sparklers');
  const [price, setPrice] = useState<string>('50');
  const [stock, setStock] = useState<string>('50');
  const [minStockAlert, setMinStockAlert] = useState<string>('15');
  const [unit, setUnit] = useState<string>('Box');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categories: Array<CrackerCategory | 'All'> = [
    'All',
    'Sparklers',
    'Ground Chakkars',
    'Flower Pots',
    'Rockets',
    'Aerial / Multi-Shots',
    'Bombs & Bijili',
    'Garlands & Walas',
    'Gift Boxes',
    'Kids Novelty',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCode(`CRK-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Sparklers');
    setPrice('50');
    setStock('50');
    setMinStockAlert('15');
    setUnit('Box');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCode(p.code);
    setCategory(p.category);
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setMinStockAlert(p.minStockAlert.toString());
    setUnit(p.unit);
    setDescription(p.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);
    const numAlert = parseInt(minStockAlert, 10);

    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid price greater than zero.');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Please enter a valid non-negative stock quantity.');
      return;
    }

    const res = db.saveProduct({
      id: editingProduct?.id,
      name: name.trim(),
      code: code.trim() || `CRK-${Date.now().toString().slice(-4)}`,
      category,
      price: numPrice,
      stock: numStock,
      minStockAlert: isNaN(numAlert) ? 10 : numAlert,
      unit: unit.trim() || 'Box',
      description: description.trim() || undefined,
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setIsModalOpen(false);
    onProductsUpdated();
  };

  const handleDeleteProduct = (p: Product) => {
    if (window.confirm(`Are you sure you want to delete "${p.name}"? This cannot be undone.`)) {
      db.deleteProduct(p.id);
      onProductsUpdated();
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Cracker Inventory & Product Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage product pricing, categories, stock alerts, and prevent duplicate entries in SQLite database.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cracker name or code..."
            className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-7 flex items-center space-x-1.5 overflow-x-auto scrollbar-thin">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Stock Quantity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock <= p.minStockAlert;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {p.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                      {settings.currencySymbol}{p.price}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{p.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-white text-sm">
                        {p.stock}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">{p.unit}s</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center space-x-1 bg-red-950/70 border border-red-800 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center space-x-1 bg-yellow-950/70 border border-yellow-800 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock (&lt;{p.minStockAlert})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-emerald-950/70 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <CheckCircle className="w-3 h-3" />
                          <span>In Stock</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No cracker products match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Edit Cracker Product' : 'Add New Cracker Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="bg-red-950/80 border border-red-800 text-red-300 p-2.5 rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-medium block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 10 cm Electric Sparklers (10 pcs/box)"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Product Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SPK-10"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CrackerCategory)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Box / Pkt"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Sound level, sparkles color"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
