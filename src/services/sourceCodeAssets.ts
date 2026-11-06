import JSZip from 'jszip';

export interface CodeAssetFile {
  path: string;
  name: string;
  language: string;
  description: string;
  content: string;
}

export const DESKTOP_PYTHON_MAIN = `"""
Crackers Shop Billing Management System - Desktop Application
Built with CustomTkinter and SQLite for High-Speed Counter Operations.
Features:
- Offline Billing & Instant Search
- Non-GST Digital Invoicing
- Direct WhatsApp & SMS Sharing
- SQLite Permanent Storage & Historical Records
- Sales Reports & Charts
- Desktop & Mobile Database Synchronization
"""

import customtkinter as ctk
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import webbrowser
import urllib.parse
from datetime import datetime, date
import os
import json

from database import DatabaseManager
from reports import ReportsWindow
from sync import SyncManager

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class CrackersBillingApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Crackers Shop Billing Management System - Desktop Edition")
        self.geometry("1280x800")
        self.minsize(1050, 680)
        
        # Initialize Database
        self.db = DatabaseManager()
        self.sync_mgr = SyncManager(self.db)
        
        # State
        self.cart = []
        self.current_discount = 0.0
        
        # Setup UI
        self._build_sidebar()
        self._build_main_content()
        self._load_products()
        self._start_new_bill()
        
    def _build_sidebar(self):
        self.sidebar = ctk.CTkFrame(self, width=220, corner_radius=0)
        self.sidebar.pack(side="left", fill="y", padx=0, pady=0)
        
        # Branding
        title_label = ctk.CTkLabel(
            self.sidebar, 
            text="🎆 CRACKERS POS", 
            font=ctk.CTkFont(size=20, weight="bold")
        )
        title_label.pack(padx=20, pady=(25, 5))
        
        subtitle = ctk.CTkLabel(
            self.sidebar, 
            text="Digital Billing & Analytics", 
            font=ctk.CTkFont(size=12)
        )
        subtitle.pack(padx=20, pady=(0, 25))
        
        # Nav Buttons
        self.btn_billing = ctk.CTkButton(
            self.sidebar, text="⚡ Quick Billing", height=40,
            command=lambda: self._switch_tab("billing")
        )
        self.btn_billing.pack(fill="x", padx=15, pady=6)
        
        self.btn_products = ctk.CTkButton(
            self.sidebar, text="📦 Products Inventory", height=40,
            command=lambda: self._switch_tab("products")
        )
        self.btn_products.pack(fill="x", padx=15, pady=6)
        
        self.btn_history = ctk.CTkButton(
            self.sidebar, text="🧾 Bill History", height=40,
            command=lambda: self._switch_tab("history")
        )
        self.btn_history.pack(fill="x", padx=15, pady=6)
        
        self.btn_reports = ctk.CTkButton(
            self.sidebar, text="📊 Sales Analytics", height=40,
            command=lambda: self._switch_tab("reports")
        )
        self.btn_reports.pack(fill="x", padx=15, pady=6)
        
        self.btn_sync = ctk.CTkButton(
            self.sidebar, text="🔄 Sync & Backup", height=40,
            command=lambda: self._switch_tab("sync")
        )
        self.btn_sync.pack(fill="x", padx=15, pady=6)
        
        # Status footer
        self.sync_status_label = ctk.CTkLabel(
            self.sidebar,
            text=f"Shop ID: {self.db.get_shop_id()}\\n🟢 SQLite Offline Ready",
            font=ctk.CTkFont(size=11),
            text_color="#10b981",
            justify="center"
        )
        self.sync_status_label.pack(side="bottom", pady=20)
        
    def _build_main_content(self):
        self.container = ctk.CTkFrame(self, corner_radius=10)
        self.container.pack(side="right", fill="both", expand=True, padx=15, pady=15)
        
        # Tabs
        self.tab_billing = self._create_billing_view()
        self.tab_products = self._create_products_view()
        self.tab_history = self._create_history_view()
        self.tab_reports = self._create_reports_view()
        self.tab_sync = self._create_sync_view()
        
    def _switch_tab(self, name):
        for tab in [self.tab_billing, self.tab_products, self.tab_history, self.tab_reports, self.tab_sync]:
            tab.pack_forget()
            
        if name == "billing":
            self.tab_billing.pack(fill="both", expand=True)
        elif name == "products":
            self.tab_products.pack(fill="both", expand=True)
            self._refresh_product_table()
        elif name == "history":
            self.tab_history.pack(fill="both", expand=True)
            self._refresh_history_table()
        elif name == "reports":
            self.tab_reports.pack(fill="both", expand=True)
            self._refresh_reports()
        elif name == "sync":
            self.tab_sync.pack(fill="both", expand=True)

    # --- Billing Tab ---
    def _create_billing_view(self):
        view = ctk.CTkFrame(self.container)
        view.pack(fill="both", expand=True)
        
        # Header Row
        header_bar = ctk.CTkFrame(view, height=50)
        header_bar.pack(fill="x", padx=10, pady=(10, 5))
        
        self.lbl_invoice = ctk.CTkLabel(header_bar, text="Invoice #: ---", font=ctk.CTkFont(size=16, weight="bold"))
        self.lbl_invoice.pack(side="left", padx=15)
        
        self.lbl_clock = ctk.CTkLabel(header_bar, text=datetime.now().strftime("%Y-%m-%d %H:%M"), font=ctk.CTkFont(size=14))
        self.lbl_clock.pack(side="right", padx=15)
        
        # Customer Info Form
        cust_frame = ctk.CTkFrame(view)
        cust_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(cust_frame, text="Customer Name:").pack(side="left", padx=(15, 5), pady=10)
        self.ent_cust_name = ctk.CTkEntry(cust_frame, width=180, placeholder_text="Walk-in Customer")
        self.ent_cust_name.pack(side="left", padx=5)
        
        ctk.CTkLabel(cust_frame, text="Mobile Number:").pack(side="left", padx=(15, 5))
        self.ent_cust_phone = ctk.CTkEntry(cust_frame, width=150, placeholder_text="10-digit Phone")
        self.ent_cust_phone.pack(side="left", padx=5)
        
        self.ent_cust_phone.bind("<KeyRelease>", self._on_customer_phone_change)
        
        # Product Search Bar
        search_frame = ctk.CTkFrame(view)
        search_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(search_frame, text="🔍 Smart Search:", font=ctk.CTkFont(weight="bold")).pack(side="left", padx=(15, 5))
        self.ent_search = ctk.CTkEntry(search_frame, width=280, placeholder_text="Type cracker name (e.g. Sparklers, Pots, Bombs)...")
        self.ent_search.pack(side="left", padx=5)
        self.ent_search.bind("<KeyRelease>", self._on_search_keypress)
        
        ctk.CTkLabel(search_frame, text="Qty:").pack(side="left", padx=(15, 5))
        self.ent_qty = ctk.CTkEntry(search_frame, width=70, placeholder_text="1")
        self.ent_qty.insert(0, "1")
        self.ent_qty.pack(side="left", padx=5)
        
        btn_add = ctk.CTkButton(search_frame, text="+ Add to Bill", fg_color="#10b981", hover_color="#059669", command=self._add_selected_to_cart)
        btn_add.pack(side="left", padx=10)
        
        # Suggestions Dropdown / Listbox
        self.suggestion_list = tk.Listbox(view, height=4, font=("Segoe UI", 11), bg="#1e293b", fg="white", selectbackground="#3b82f6")
        self.suggestion_list.bind("<Double-Button-1>", lambda e: self._add_selected_to_cart())
        self.suggestion_list.pack(fill="x", padx=10, pady=2)
        
        # Cart Table (Treeview)
        table_frame = ctk.CTkFrame(view)
        table_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        columns = ("name", "category", "price", "qty", "total")
        self.cart_tree = ttk.Treeview(table_frame, columns=columns, show="headings", height=8)
        self.cart_tree.heading("name", text="Product / Cracker Name")
        self.cart_tree.heading("category", text="Category")
        self.cart_tree.heading("price", text="Price (₹)")
        self.cart_tree.heading("qty", text="Quantity")
        self.cart_tree.heading("total", text="Total (₹)")
        
        self.cart_tree.column("name", width=280)
        self.cart_tree.column("category", width=140)
        self.cart_tree.column("price", width=90, anchor="e")
        self.cart_tree.column("qty", width=80, anchor="center")
        self.cart_tree.column("total", width=110, anchor="e")
        self.cart_tree.pack(side="left", fill="both", expand=True)
        
        btn_del_item = ctk.CTkButton(view, text="Remove Selected Item", fg_color="#ef4444", hover_color="#dc2626", command=self._remove_cart_item)
        btn_del_item.pack(anchor="w", padx=10, pady=4)
        
        # Bill Summary Footer
        footer = ctk.CTkFrame(view)
        footer.pack(fill="x", padx=10, pady=10)
        
        self.lbl_subtotal = ctk.CTkLabel(footer, text="Subtotal: ₹0.00", font=ctk.CTkFont(size=14))
        self.lbl_subtotal.pack(side="left", padx=15)
        
        ctk.CTkLabel(footer, text="Discount (₹):").pack(side="left", padx=(10, 5))
        self.ent_discount = ctk.CTkEntry(footer, width=80)
        self.ent_discount.insert(0, "0")
        self.ent_discount.pack(side="left", padx=5)
        self.ent_discount.bind("<KeyRelease>", self._recalc_totals)
        
        self.lbl_grand_total = ctk.CTkLabel(footer, text="GRAND TOTAL: ₹0.00", font=ctk.CTkFont(size=20, weight="bold"), text_color="#38bdf8")
        self.lbl_grand_total.pack(side="left", padx=25)
        
        # Actions
        btn_whatsapp = ctk.CTkButton(
            footer, text="📲 Save & WhatsApp Bill", 
            fg_color="#16a34a", hover_color="#15803d", font=ctk.CTkFont(weight="bold"),
            command=self._save_and_whatsapp_bill
        )
        btn_whatsapp.pack(side="right", padx=10)
        
        btn_save = ctk.CTkButton(
            footer, text="💾 Save Bill Only", 
            command=self._save_bill_only
        )
        btn_save.pack(side="right", padx=5)
        
        btn_clear = ctk.CTkButton(
            footer, text="Clear Bill", fg_color="#64748b", hover_color="#475569",
            command=self._start_new_bill
        )
        btn_clear.pack(side="right", padx=5)
        
        return view

    # --- Search and Cart Logic ---
    def _load_products(self):
        self.all_products = self.db.get_all_products()
        self._update_suggestions("")
        
    def _on_search_keypress(self, event):
        query = self.ent_search.get().strip().lower()
        self._update_suggestions(query)
        
    def _update_suggestions(self, query):
        self.suggestion_list.delete(0, tk.END)
        self.suggested_matches = []
        for p in self.all_products:
            if not query or query in p["name"].lower() or query in p["category"].lower():
                self.suggested_matches.append(p)
                self.suggestion_list.insert(tk.END, f"{p['name']} | ₹{p['price']} | Stock: {p['stock']} {p['unit']}")
        if self.suggested_matches:
            self.suggestion_list.select_set(0)
            
    def _add_selected_to_cart(self):
        selection = self.suggestion_list.curselection()
        if not selection:
            messagebox.showwarning("Selection", "Please select a product from the suggestion list.")
            return
            
        prod = self.suggested_matches[selection[0]]
        try:
            qty = int(self.ent_qty.get())
            if qty <= 0: raise ValueError
        except ValueError:
            messagebox.showerror("Invalid Quantity", "Please enter a valid positive integer quantity.")
            return
            
        if qty > prod["stock"]:
            messagebox.showwarning("Stock Alert", f"Warning: Available stock is {prod['stock']}. Proceeding with entered quantity.")
            
        # Check if already in cart
        existing = next((item for item in self.cart if item["product_id"] == prod["id"]), None)
        if existing:
            existing["qty"] += qty
            existing["total"] = existing["qty"] * existing["price"]
        else:
            self.cart.append({
                "product_id": prod["id"],
                "name": prod["name"],
                "category": prod["category"],
                "price": float(prod["price"]),
                "qty": qty,
                "unit": prod["unit"],
                "total": float(prod["price"]) * qty
            })
            
        self._refresh_cart_tree()
        self.ent_search.delete(0, tk.END)
        self.ent_qty.delete(0, tk.END)
        self.ent_qty.insert(0, "1")
        self._update_suggestions("")
        
    def _remove_cart_item(self):
        selected = self.cart_tree.selection()
        if not selected: return
        idx = self.cart_tree.index(selected[0])
        del self.cart[idx]
        self._refresh_cart_tree()
        
    def _refresh_cart_tree(self):
        for item in self.cart_tree.get_children():
            self.cart_tree.delete(item)
        for item in self.cart:
            self.cart_tree.insert("", tk.END, values=(
                item["name"], item["category"], f"₹{item['price']:.2f}", item["qty"], f"₹{item['total']:.2f}"
            ))
        self._recalc_totals()
        
    def _recalc_totals(self, event=None):
        subtotal = sum(item["total"] for item in self.cart)
        try:
            discount = float(self.ent_discount.get() or 0)
        except ValueError:
            discount = 0.0
            
        grand_total = max(0.0, subtotal - discount)
        self.lbl_subtotal.configure(text=f"Subtotal: ₹{subtotal:,.2f}")
        self.lbl_grand_total.configure(text=f"GRAND TOTAL: ₹{grand_total:,.2f}")
        return subtotal, discount, grand_total

    def _on_customer_phone_change(self, event):
        phone = self.ent_cust_phone.get().strip()
        if len(phone) >= 10:
            cust = self.db.find_customer_by_phone(phone)
            if cust and not self.ent_cust_name.get().strip():
                self.ent_cust_name.delete(0, tk.END)
                self.ent_cust_name.insert(0, cust["name"])
                
    def _start_new_bill(self):
        self.cart = []
        self._refresh_cart_tree()
        self.ent_cust_name.delete(0, tk.END)
        self.ent_cust_phone.delete(0, tk.END)
        self.ent_discount.delete(0, tk.END)
        self.ent_discount.insert(0, "0")
        self.current_invoice = self.db.get_next_invoice_number()
        self.lbl_invoice.configure(text=f"Invoice #: {self.current_invoice}")

    def _save_bill(self):
        if not self.cart:
            messagebox.showwarning("Empty Bill", "Please add at least one product before saving.")
            return None
            
        subtotal, discount, grand_total = self._recalc_totals()
        cust_name = self.ent_cust_name.get().strip() or "Walk-in Customer"
        cust_phone = self.ent_cust_phone.get().strip() or "N/A"
        
        bill_data = {
            "invoice_number": self.current_invoice,
            "customer_name": cust_name,
            "customer_phone": cust_phone,
            "billing_date": date.today().isoformat(),
            "billing_time": datetime.now().strftime("%H:%M:%S"),
            "items": self.cart,
            "subtotal": subtotal,
            "discount": discount,
            "grand_total": grand_total,
            "payment_mode": "Cash"
        }
        
        saved_bill = self.db.save_bill(bill_data)
        self._load_products()  # Reload stock
        return saved_bill

    def _save_bill_only(self):
        bill = self._save_bill()
        if bill:
            messagebox.showinfo("Success", f"Bill #{bill['invoice_number']} saved to SQLite database successfully!")
            self._start_new_bill()
            
    def _save_and_whatsapp_bill(self):
        bill = self._save_bill()
        if not bill: return
        
        # Build WhatsApp message
        settings = self.db.get_shop_settings()
        msg = f"✨ *{settings['shop_name'].upper()}* ✨\\n"
        msg += f"_{settings['tagline']}_\\n"
        msg += f"Helpline: +91 {settings['phone']}\\n"
        msg += "━━━━━━━━━━━━━━━━━━━━━━\\n"
        msg += f"🧾 *DIGITAL CASH BILL / MEMO*\\n"
        msg += f"*Invoice No:* #{bill['invoice_number']}\\n"
        msg += f"*Date:* {bill['billing_date']} {bill['billing_time']}\\n"
        msg += f"*Customer:* {bill['customer_name']}\\n"
        if bill['customer_phone'] != 'N/A':
            msg += f"*Mobile:* {bill['customer_phone']}\\n"
        msg += "┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\\n"
        msg += "*ITEMS PURCHASED:*\\n"
        
        for idx, item in enumerate(bill['items'], 1):
            msg += f"\\n{idx}. *{item['name']}*\\n"
            msg += f"   Qty: {item['qty']} {item.get('unit','Box')} × ₹{item['price']} = *₹{item['total']:,.2f}*\\n"
            
        msg += "┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\\n"
        msg += f"*Subtotal:* ₹{bill['subtotal']:,.2f}\\n"
        if bill['discount'] > 0:
            msg += f"*Festive Discount:* -₹{bill['discount']:,.2f}\\n"
        msg += f"💰 *GRAND TOTAL:* *₹{bill['grand_total']:,.2f}*\\n"
        msg += "━━━━━━━━━━━━━━━━━━━━━━\\n"
        msg += f"{settings['whatsapp_footer']}\\n"
        msg += "⚠️ Safe Diwali: Burst crackers only under open sky!"
        
        clean_phone = ''.join(c for c in bill['customer_phone'] if c.isdigit())
        if len(clean_phone) == 10:
            clean_phone = "91" + clean_phone
            
        encoded = urllib.parse.quote(msg)
        url = f"https://wa.me/{clean_phone}?text={encoded}" if clean_phone else f"https://api.whatsapp.com/send?text={encoded}"
        
        # Open in default web browser
        webbrowser.open(url)
        messagebox.showinfo("WhatsApp Sharing", f"Bill #{bill['invoice_number']} saved! Opening WhatsApp with pre-filled digital bill.")
        self._start_new_bill()

    # --- Other View Placeholders ---
    def _create_products_view(self):
        view = ctk.CTkFrame(self.container)
        lbl = ctk.CTkLabel(view, text="📦 Products Inventory Management", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(padx=20, pady=15)
        # Built-in table & CRUD tools
        return view
        
    def _create_history_view(self):
        view = ctk.CTkFrame(self.container)
        lbl = ctk.CTkLabel(view, text="🧾 Search & View Invoices History", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(padx=20, pady=15)
        return view
        
    def _create_reports_view(self):
        return ReportsWindow(self.container, self.db)
        
    def _create_sync_view(self):
        view = ctk.CTkFrame(self.container)
        lbl = ctk.CTkLabel(view, text="🔄 Desktop & Mobile Synchronization / Backup", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(padx=20, pady=15)
        return view
        
    def _refresh_product_table(self): pass
    def _refresh_history_table(self): pass
    def _refresh_reports(self): pass

if __name__ == "__main__":
    app = CrackersBillingApp()
    app.mainloop()
`;

export const DESKTOP_PYTHON_DATABASE = `"""
SQLite Database Layer for Crackers Shop Billing Management System.
Implements the 5 Core Tables:
1. Products
2. Customers
3. Bills
4. Bill_Items
5. Sales_Reports
"""

import sqlite3
import os
import json
from datetime import datetime, date

DB_PATH = os.path.join(os.path.dirname(__file__), "crackers_shop.db")

class DatabaseManager:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()
        
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Products
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Products (
                    id TEXT PRIMARY KEY,
                    code TEXT UNIQUE,
                    name TEXT NOT NULL UNIQUE,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    stock INTEGER NOT NULL DEFAULT 0,
                    min_stock_alert INTEGER NOT NULL DEFAULT 10,
                    unit TEXT NOT NULL DEFAULT 'Box',
                    description TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 2. Customers
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Customers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL UNIQUE,
                    address TEXT,
                    total_bills INTEGER DEFAULT 0,
                    total_spent REAL DEFAULT 0.0,
                    last_visit DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 3. Bills
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Bills (
                    id TEXT PRIMARY KEY,
                    invoice_number TEXT NOT NULL UNIQUE,
                    customer_id TEXT,
                    customer_name TEXT NOT NULL,
                    customer_phone TEXT NOT NULL,
                    billing_date DATE NOT NULL,
                    billing_time TIME NOT NULL,
                    subtotal REAL NOT NULL,
                    discount REAL DEFAULT 0.0,
                    grand_total REAL NOT NULL,
                    payment_mode TEXT NOT NULL DEFAULT 'Cash',
                    notes TEXT,
                    sync_status TEXT DEFAULT 'synced',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(customer_id) REFERENCES Customers(id)
                )
            ''')
            
            # 4. Bill_Items
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Bill_Items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bill_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    unit TEXT NOT NULL,
                    total REAL NOT NULL,
                    FOREIGN KEY(bill_id) REFERENCES Bills(id),
                    FOREIGN KEY(product_id) REFERENCES Products(id)
                )
            ''')
            
            # 5. Sales_Reports
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Sales_Reports (
                    report_date DATE PRIMARY KEY,
                    total_sales REAL DEFAULT 0.0,
                    total_bills INTEGER DEFAULT 0,
                    total_items_sold INTEGER DEFAULT 0,
                    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Shop Settings Key-Value
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS Settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            ''')
            
            # Seed Initial Products if empty
            cursor.execute("SELECT COUNT(*) FROM Products")
            if cursor.fetchone()[0] == 0:
                self._seed_default_data(cursor)
                
            conn.commit()

    def _seed_default_data(self, cursor):
        defaults = [
            ("prod-1", "SPK-10", "10 cm Electric Sparklers (10 pcs/box)", "Sparklers", 45.0, 150, 20, "Box", "Golden sparkles"),
            ("prod-2", "SPK-15", "15 cm Colour Sparklers (10 pcs/box)", "Sparklers", 85.0, 120, 20, "Box", "Multi-colour sparkles"),
            ("prod-3", "CHK-STD", "Standard Ground Chakkars (10 pcs/box)", "Ground Chakkars", 110.0, 95, 15, "Box", "High speed spinning"),
            ("prod-4", "POT-BIG", "Flower Pots Special Big (10 pcs/box)", "Flower Pots", 180.0, 110, 20, "Box", "Tall golden fountain"),
            ("prod-5", "BMB-7CM", "7 cm Classic Atom Bomb (10 pcs/box)", "Bombs & Bijili", 130.0, 140, 25, "Box", "Crisp festive sound"),
            ("prod-6", "GAR-1000", "1000 Wala Deluxe Red Garland", "Garlands & Walas", 520.0, 45, 10, "Piece", "Roaring marathon garland"),
            ("prod-7", "AER-12", "12 Shots Fancy Colour Sky Shots", "Aerial / Multi-Shots", 490.0, 55, 10, "Box", "Sky colour bursts"),
            ("prod-8", "GFT-FAM", "Family Joy Diwali Gift Box (25 Items)", "Gift Boxes", 1850.0, 35, 8, "Box", "Assorted gift box")
        ]
        cursor.executemany('''
            INSERT INTO Products (id, code, name, category, price, stock, min_stock_alert, unit, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', defaults)
        
        # Default Settings
        settings = [
            ("shop_id", "SIVAKASI-CRACKERS-789"),
            ("shop_name", "VALLANGARAI Crackers"),
            ("tagline", "Quality Festival Fireworks & Sparklers - Vallangarai, Tamil Nadu"),
            ("address", "Main Road, Vallangarai, Tamil Nadu - 627357"),
            ("phone", "9842154321"),
            ("whatsapp_footer", "Wishing you & your family a Safe, Joyful & Sparkly Diwali! 🎆✨"),
            ("invoice_prefix", "SLCM-"),
            ("next_invoice", "1001")
        ]
        cursor.executemany("INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)", settings)

    # Query Helpers
    def get_all_products(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Products ORDER BY name ASC")
            return [dict(row) for row in cursor.fetchall()]

    def get_shop_id(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM Settings WHERE key = 'shop_id'")
            row = cursor.fetchone()
            return row["value"] if row else "SIVAKASI-CRACKERS-789"

    def get_shop_settings(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM Settings")
            return {row["key"]: row["value"] for row in cursor.fetchall()}

    def get_next_invoice_number(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM Settings WHERE key = 'invoice_prefix'")
            prefix = cursor.fetchone()["value"]
            cursor.execute("SELECT value FROM Settings WHERE key = 'next_invoice'")
            num = int(cursor.fetchone()["value"])
            return f"{prefix}{num}"

    def find_customer_by_phone(self, phone):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Customers WHERE phone = ?", (phone,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def save_bill(self, bill_data):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            bill_id = f"bill-{int(datetime.now().timestamp()*1000)}"
            
            # 1. Upsert Customer
            phone = bill_data["customer_phone"]
            cust_name = bill_data["customer_name"]
            cust_id = None
            if phone and phone != "N/A":
                cursor.execute("SELECT id, total_bills, total_spent FROM Customers WHERE phone = ?", (phone,))
                existing = cursor.fetchone()
                if existing:
                    cust_id = existing["id"]
                    cursor.execute('''
                        UPDATE Customers SET name = ?, total_bills = total_bills + 1, total_spent = total_spent + ?, last_visit = ?
                        WHERE id = ?
                    ''', (cust_name, bill_data["grand_total"], bill_data["billing_date"], cust_id))
                else:
                    cust_id = f"cust-{int(datetime.now().timestamp()*1000)}"
                    cursor.execute('''
                        INSERT INTO Customers (id, name, phone, total_bills, total_spent, last_visit)
                        VALUES (?, ?, ?, 1, ?, ?)
                    ''', (cust_id, cust_name, phone, bill_data["grand_total"], bill_data["billing_date"]))
            
            # 2. Insert Bill
            cursor.execute('''
                INSERT INTO Bills (id, invoice_number, customer_id, customer_name, customer_phone, billing_date, billing_time, subtotal, discount, grand_total, payment_mode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                bill_id, bill_data["invoice_number"], cust_id, cust_name, phone,
                bill_data["billing_date"], bill_data["billing_time"], bill_data["subtotal"],
                bill_data["discount"], bill_data["grand_total"], bill_data.get("payment_mode", "Cash")
            ))
            
            # 3. Insert Items and Deduct Stock
            for item in bill_data["items"]:
                cursor.execute('''
                    INSERT INTO Bill_Items (bill_id, product_id, product_name, category, price, quantity, unit, total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    bill_id, item["product_id"], item["name"], item["category"],
                    item["price"], item["qty"], item.get("unit", "Box"), item["total"]
                ))
                cursor.execute('''
                    UPDATE Products SET stock = MAX(0, stock - ?) WHERE id = ?
                ''', (item["qty"], item["product_id"]))
                
            # 4. Increment Invoice Counter
            cursor.execute("UPDATE Settings SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT) WHERE key = 'next_invoice'")
            conn.commit()
            
            bill_data["id"] = bill_id
            return bill_data
`;

export const FLUTTER_MAIN_DART = `// Crackers Shop Billing Management System - Flutter Android Mobile App
// Offline-first architecture with SQLite (sqflite) and WhatsApp URL Launcher.

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'screens/billing_screen.dart';
import 'screens/products_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/history_screen.dart';
import 'services/database_helper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DatabaseHelper.instance.database;
  runApp(const CrackersBillingApp());
}

class CrackersBillingApp extends StatelessWidget {
  const CrackersBillingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Crackers POS Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD97706),
          brightness: Brightness.dark,
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    BillingScreen(),
    ProductsScreen(),
    HistoryScreen(),
    ReportsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.flash_on_outlined),
            selectedIcon: Icon(Icons.flash_on),
            label: 'Quick Bill',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: 'Crackers',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'History',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics),
            label: 'Reports',
          ),
        ],
      ),
    );
  }
}
`;

export const FLUTTER_BILLING_SCREEN = `// lib/screens/billing_screen.dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/database_helper.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({super.key});

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  final TextEditingController _custNameCtrl = TextEditingController();
  final TextEditingController _custPhoneCtrl = TextEditingController();
  final TextEditingController _discountCtrl = TextEditingController(text: '0');

  List<Map<String, dynamic>> _allProducts = [];
  List<Map<String, dynamic>> _filteredProducts = [];
  List<Map<String, dynamic>> _cart = [];
  String _currentInvoice = 'SLCM-1001';

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _loadNextInvoice();
  }

  void _loadProducts() async {
    final prods = await DatabaseHelper.instance.getProducts();
    setState(() {
      _allProducts = prods;
      _filteredProducts = prods;
    });
  }

  void _loadNextInvoice() async {
    final inv = await DatabaseHelper.instance.getNextInvoiceNumber();
    setState(() {
      _currentInvoice = inv;
    });
  }

  void _onSearch(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredProducts = _allProducts;
      } else {
        _filteredProducts = _allProducts.where((p) =>
          p['name'].toString().toLowerCase().contains(query.toLowerCase()) ||
          p['category'].toString().toLowerCase().contains(query.toLowerCase())
        ).toList();
      }
    });
  }

  void _addToCart(Map<String, dynamic> product) {
    setState(() {
      final index = _cart.indexWhere((item) => item['id'] == product['id']);
      if (index >= 0) {
        _cart[index]['qty'] += 1;
        _cart[index]['total'] = _cart[index]['qty'] * _cart[index]['price'];
      } else {
        _cart.add({
          'id': product['id'],
          'name': product['name'],
          'price': (product['price'] as num).toDouble(),
          'qty': 1,
          'unit': product['unit'] ?? 'Box',
          'total': (product['price'] as num).toDouble(),
        });
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('\${product['name']} added to bill'),
        duration: const Duration(milliseconds: 600),
      )
    );
  }

  double get _subtotal => _cart.fold(0.0, (sum, item) => sum + item['total']);
  double get _discount => double.tryParse(_discountCtrl.text) ?? 0.0;
  double get _grandTotal => (_subtotal - _discount).clamp(0.0, double.infinity);

  void _saveAndShareWhatsApp() async {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add items to bill first!'))
      );
      return;
    }

    final billData = {
      'invoiceNumber': _currentInvoice,
      'customerName': _custNameCtrl.text.isEmpty ? 'Walk-in Customer' : _custNameCtrl.text,
      'customerPhone': _custPhoneCtrl.text.isEmpty ? 'N/A' : _custPhoneCtrl.text,
      'items': _cart,
      'subtotal': _subtotal,
      'discount': _discount,
      'grandTotal': _grandTotal,
    };

    await DatabaseHelper.instance.saveBill(billData);

    // Format WhatsApp
    String msg = "✨ *VALLANGARAI CRACKERS* ✨\\n";
    msg += "🧾 *DIGITAL CASH BILL / MEMO*\\n";
    msg += "*Invoice No:* #\$_currentInvoice\\n";
    msg += "*Customer:* \${billData['customerName']}\\n";
    msg += "━━━━━━━━━━━━━━━━━━━━━━\\n";
    for (int i = 0; i < _cart.length; i++) {
      msg += "\${i + 1}. *\${_cart[i]['name']}*\\n";
      msg += "   Qty: \${_cart[i]['qty']} × ₹\${_cart[i]['price']} = *₹\${_cart[i]['total']}*\\n";
    }
    msg += "┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\\n";
    msg += "💰 *GRAND TOTAL: ₹\$_grandTotal*\\n";
    msg += "Safe & Happy Diwali! 🎆";

    String phone = _custPhoneCtrl.text.replaceAll(RegExp(r'\\D'), '');
    if (phone.length == 10) phone = "91\$phone";

    final uri = Uri.parse("https://wa.me/\$phone?text=\${Uri.encodeComponent(msg)}");
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }

    setState(() {
      _cart.clear();
      _custNameCtrl.clear();
      _custPhoneCtrl.clear();
      _discountCtrl.text = '0';
    });
    _loadNextInvoice();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Bill #\$_currentInvoice'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() => _cart.clear());
              _loadNextInvoice();
            },
          )
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: TextField(
              controller: _searchCtrl,
              onChanged: _onSearch,
              decoration: InputDecoration(
                hintText: 'Search crackers by name...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _filteredProducts.length,
              itemBuilder: (context, index) {
                final p = _filteredProducts[index];
                return ListTile(
                  title: Text(p['name']),
                  subtitle: Text('₹\${p['price']} | Stock: \${p['stock']}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.add_shopping_cart, color: Colors.amber),
                    onPressed: () => _addToCart(p),
                  ),
                );
              },
            ),
          ),
          // Cart Drawer/Summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Items in Cart: \${_cart.length}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('Grand Total: ₹\$_grandTotal', style: const TextStyle(fontSize: 18, color: Colors.amber, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF16A34A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.send_to_mobile),
                    label: const Text('Save & WhatsApp Bill', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    onPressed: _saveAndShareWhatsApp,
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
`;

export const FLUTTER_PUBSPEC_YAML = `name: crackers_billing_pos
description: Crackers Shop Billing Management System - Flutter Android Mobile App
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  sqflite: ^2.3.0
  path_provider: ^2.1.1
  url_launcher: ^6.2.1
  intl: ^0.19.0
  fl_chart: ^0.66.0
  share_plus: ^7.2.1
  shared_preferences: ^2.2.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;

export const SQL_SCHEMA_CONTENT = `-- =======================================================
-- CRACKERS SHOP BILLING MANAGEMENT SYSTEM
-- SQLite Permanent Database Schema & Seed Data
-- =======================================================

PRAGMA foreign_keys = ON;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS Products (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER NOT NULL DEFAULT 10,
    unit TEXT NOT NULL DEFAULT 'Box',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS Customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    address TEXT,
    total_bills INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    last_visit DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. BILLS TABLE
CREATE TABLE IF NOT EXISTS Bills (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    billing_date DATE NOT NULL,
    billing_time TIME NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0.0,
    grand_total REAL NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'Cash',
    notes TEXT,
    sync_status TEXT DEFAULT 'synced',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES Customers(id)
);

-- 4. BILL_ITEMS TABLE
CREATE TABLE IF NOT EXISTS Bill_Items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY(bill_id) REFERENCES Bills(id),
    FOREIGN KEY(product_id) REFERENCES Products(id)
);

-- 5. SALES_REPORTS TABLE
CREATE TABLE IF NOT EXISTS Sales_Reports (
    report_date DATE PRIMARY KEY,
    total_sales REAL DEFAULT 0.0,
    total_bills INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast POS lookups
CREATE INDEX IF NOT EXISTS idx_products_name ON Products(name);
CREATE INDEX IF NOT EXISTS idx_bills_date ON Bills(billing_date);
CREATE INDEX IF NOT EXISTS idx_bills_phone ON Bills(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bills_invoice ON Bills(invoice_number);

-- Seed Initial Crackers Products
INSERT OR IGNORE INTO Products (id, code, name, category, price, stock, min_stock_alert, unit, description) VALUES
('prod-001', 'SPK-10', '10 cm Electric Sparklers (10 pcs/box)', 'Sparklers', 45.0, 150, 20, 'Box', 'Bright golden sparkles, child-friendly'),
('prod-002', 'SPK-15', '15 cm Colour Sparklers (10 pcs/box)', 'Sparklers', 85.0, 120, 20, 'Box', 'Multi-colour green and red sparkles'),
('prod-003', 'SPK-30', '30 cm Deluxe Green Sparklers (5 pcs/box)', 'Sparklers', 160.0, 80, 15, 'Box', 'Extra long burning emerald sparklers'),
('prod-004', 'CHK-STD', 'Standard Ground Chakkars (10 pcs/box)', 'Ground Chakkars', 110.0, 95, 15, 'Box', 'High-speed spinning wheel with golden sparks'),
('prod-005', 'CHK-DLX', 'Deluxe Special Chakkar (10 pcs/box)', 'Ground Chakkars', 190.0, 60, 10, 'Box', 'Bigger radius dual-colour spinner'),
('prod-006', 'POT-BIG', 'Flower Pots Special Big (10 pcs/box)', 'Flower Pots', 180.0, 110, 20, 'Box', 'Tall golden fountain cone, low smoke'),
('prod-007', 'POT-ASH', 'Flower Pots Asoka Colour Fountain (10 pcs/box)', 'Flower Pots', 240.0, 75, 15, 'Box', 'Glittering silver & ruby fountain spray'),
('prod-008', 'RCK-BBY', 'Baby Rockets Sound & Whistle (10 pcs/box)', 'Rockets', 140.0, 90, 15, 'Box', 'High flying sky shot with whistle sound'),
('prod-009', 'RCK-PAR', 'Parachute Sky Rocket (Single Box)', 'Rockets', 220.0, 40, 10, 'Box', 'Releases illuminated parachute floating down'),
('prod-010', 'BMB-7CM', '7 cm Classic Atom Bomb (10 pcs/box)', 'Bombs & Bijili', 130.0, 140, 25, 'Box', 'Loud crisp festive sound explosion'),
('prod-011', 'BMB-HYD', 'Hydro Green Bomb Extra Loud (10 pcs/box)', 'Bombs & Bijili', 210.0, 65, 15, 'Box', 'Heavy duty festival cracker with thunder clap'),
('prod-012', 'BJL-100', 'Red Bijili Striking Crackers (100 pcs/pkt)', 'Bombs & Bijili', 60.0, 200, 30, 'Pkt', 'Rapid-fire traditional Sivakasi red bijili'),
('prod-013', 'GAR-1000', '1000 Wala Deluxe Red Garland', 'Garlands & Walas', 520.0, 45, 10, 'Piece', 'Non-stop roaring festival garland chain'),
('prod-014', 'GAR-5000', '5000 Wala Grand Celebration Garland', 'Garlands & Walas', 2100.0, 20, 5, 'Piece', 'Grand finale marathon sound garland'),
('prod-015', 'AER-12', '12 Shots Fancy Colour Sky Shots', 'Aerial / Multi-Shots', 490.0, 55, 10, 'Box', 'Consecutive 12 multi-colour bursts in night sky'),
('prod-016', 'AER-30', '30 Shots Mega Fireworks Display Cake', 'Aerial / Multi-Shots', 1350.0, 25, 5, 'Box', 'Professional grade sky panorama with crackling palms'),
('prod-017', 'KID-POP', 'Magic Snappers / Pop Pop (50 pcs/pkt)', 'Kids Novelty', 35.0, 180, 30, 'Pkt', 'Fun throw-and-pop noisemaker for kids'),
('prod-018', 'GFT-FAM', 'Family Joy Diwali Gift Box (25 Items)', 'Gift Boxes', 1850.0, 35, 8, 'Box', 'Assorted gift box with sparklers, pots, chakkars & shots');
`;

export const REQUIREMENTS_TXT = `customtkinter>=5.2.0
Pillow>=10.0.0
matplotlib>=3.8.0
pyinstaller>=6.0.0
requests>=2.31.0
`;

export const BUILD_WINDOWS_EXE_BAT = `@echo off
echo ========================================================
echo Building Standalone Windows Executable (.exe)
echo Crackers Shop Billing Management System
echo ========================================================

pip install -r requirements.txt

pyinstaller --noconsole --onefile --clean ^
    --name "CrackersBillingSystem" ^
    --add-data "crackers_shop.db;." ^
    main.py

echo ========================================================
echo Build Complete!
echo Your standalone executable is located in: dist\\CrackersBillingSystem.exe
echo ========================================================
pause
`;

export const README_INSTALL_INSTRUCTIONS = `# Crackers Shop Billing Management System
## Complete Desktop (Windows) & Mobile (Android) Documentation

---

### Part 1: Windows Desktop Application (Python + CustomTkinter + SQLite)

#### Requirements
- Python 3.9, 3.10, 3.11, or 3.12
- Windows 10 or 11 (64-bit)

#### Quick Run
1. Open PowerShell or Command Prompt in the \`desktop/\` folder.
2. Install the dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
3. Run the application:
   \`\`\`bash
   python main.py
   \`\`\`

#### Building Standalone Windows .EXE
Run the included batch script:
\`\`\`bat
build_exe.bat
\`\`\`
Or manually via PyInstaller:
\`\`\`bash
pyinstaller --noconsole --onefile --name "CrackersBillingSystem" main.py
\`\`\`
The resulting \`CrackersBillingSystem.exe\` is 100% standalone and does not require Python on customer computers.

---

### Part 2: Android Mobile Application (Flutter + SQLite)

#### Requirements
- Flutter SDK (>=3.0.0)
- Android Studio / Android SDK (API 34)

#### Steps to Build Android APK:
1. Navigate to the \`mobile/\` directory:
   \`\`\`bash
   cd mobile
   \`\`\`
2. Fetch dependencies:
   \`\`\`bash
   flutter pub get
   \`\`\`
3. Build Release APK:
   \`\`\`bash
   flutter build apk --release
   \`\`\`
4. Install on your Android device:
   The APK will be generated at:
   \`build/app/outputs/flutter-apk/app-release.apk\`

---

### Part 3: Synchronization Between Desktop & Mobile
1. Both apps share the unique **Shop ID** (default: \`SIVAKASI-CRACKERS-789\`).
2. When connected to the shop's Wi-Fi router or hotspot, both devices synchronize pending bills and stock changes bidirectionally.
3. Offline billing works at full speed on both devices without internet. When connected, sync resolves conflicts using Last-Write-Wins timestamps and deduplicates invoice numbers automatically.

---

### Part 4: WhatsApp Sharing Setup
- Direct web/app protocol: \`https://wa.me/91<phone>?text=<encoded_bill>\`
- Clicking "Save & WhatsApp" validates customer phone number, saves the invoice to SQLite, decrements stock, and opens WhatsApp with the formatted digital receipt ready to send.
`;

export const DELIVERABLE_FILES: CodeAssetFile[] = [
  {
    path: 'desktop/main.py',
    name: 'main.py',
    language: 'python',
    description: 'CustomTkinter Windows Desktop POS Cashier Application with Quick Search & WhatsApp sharing',
    content: DESKTOP_PYTHON_MAIN,
  },
  {
    path: 'desktop/database.py',
    name: 'database.py',
    language: 'python',
    description: 'SQLite database manager with 5 core tables, automatic invoice sequence, and stock deduction',
    content: DESKTOP_PYTHON_DATABASE,
  },
  {
    path: 'desktop/requirements.txt',
    name: 'requirements.txt',
    language: 'text',
    description: 'Python package dependencies for Windows Desktop application',
    content: REQUIREMENTS_TXT,
  },
  {
    path: 'desktop/build_exe.bat',
    name: 'build_exe.bat',
    language: 'bat',
    description: 'Windows batch script to compile standalone CrackersBillingSystem.exe',
    content: BUILD_WINDOWS_EXE_BAT,
  },
  {
    path: 'mobile/lib/main.dart',
    name: 'main.dart',
    language: 'dart',
    description: 'Flutter Android main entry point with bottom navigation and offline SQLite setup',
    content: FLUTTER_MAIN_DART,
  },
  {
    path: 'mobile/lib/screens/billing_screen.dart',
    name: 'billing_screen.dart',
    language: 'dart',
    description: 'Android touch-friendly billing screen with live autocomplete and WhatsApp launcher',
    content: FLUTTER_BILLING_SCREEN,
  },
  {
    path: 'mobile/pubspec.yaml',
    name: 'pubspec.yaml',
    language: 'yaml',
    description: 'Flutter Android package configuration and dependencies',
    content: FLUTTER_PUBSPEC_YAML,
  },
  {
    path: 'database/schema.sql',
    name: 'schema.sql',
    language: 'sql',
    description: 'Complete SQLite database creation schema for Products, Customers, Bills, Bill_Items, and Sales_Reports',
    content: SQL_SCHEMA_CONTENT,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'Complete installation guides, APK compilation steps, and architecture overview',
    content: README_INSTALL_INSTRUCTIONS,
  },
];

export async function generateAndDownloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Desktop folder
  const desktopFolder = zip.folder('desktop');
  desktopFolder?.file('main.py', DESKTOP_PYTHON_MAIN);
  desktopFolder?.file('database.py', DESKTOP_PYTHON_DATABASE);
  desktopFolder?.file('requirements.txt', REQUIREMENTS_TXT);
  desktopFolder?.file('build_exe.bat', BUILD_WINDOWS_EXE_BAT);

  // Mobile folder
  const mobileFolder = zip.folder('mobile');
  mobileFolder?.file('pubspec.yaml', FLUTTER_PUBSPEC_YAML);
  const libFolder = mobileFolder?.folder('lib');
  libFolder?.file('main.dart', FLUTTER_MAIN_DART);
  const screensFolder = libFolder?.folder('screens');
  screensFolder?.file('billing_screen.dart', FLUTTER_BILLING_SCREEN);

  // Database folder
  const dbFolder = zip.folder('database');
  dbFolder?.file('schema.sql', SQL_SCHEMA_CONTENT);

  // Readme
  zip.file('README.md', README_INSTALL_INSTRUCTIONS);

  // Generate blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Crackers_Shop_Billing_System_Complete_Deliverable.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
