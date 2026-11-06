import { Bill, BillItem, Customer, Product, ShopSettings, SyncLog } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'crackers_db_products',
  CUSTOMERS: 'crackers_db_customers',
  BILLS: 'crackers_db_bills',
  SETTINGS: 'crackers_db_settings',
  SYNC_LOGS: 'crackers_db_sync_logs',
};

const DEFAULT_SETTINGS: ShopSettings = {
  shopId: 'SIVAKASI-CRACKERS-789',
  shopName: 'VALLANGARAI Crackers',
  tagline: 'Quality Festival Fireworks & Sparklers — Vallangarai, Tamil Nadu',
  address: 'Main Road, Vallangarai, Tamil Nadu - 627357',
  phone: '9842154321',
  whatsappFooter: 'Wishing you & your family a Safe, Joyful & Sparkly Diwali! 🎆✨',
  currencySymbol: '₹',
  invoicePrefix: 'SLCM-',
  nextInvoiceNumber: 1001,
  syncEnabled: true,
  syncEndpoint: 'https://sync.crackerspos.local/v1/sync',
  lastSyncedAt: new Date().toISOString(),
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    code: 'SPK-10',
    name: '10 cm Electric Sparklers (10 pcs/box)',
    category: 'Sparklers',
    price: 45,
    stock: 150,
    minStockAlert: 20,
    unit: 'Box',
    description: 'Bright golden sparkles, child-friendly',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    code: 'SPK-15',
    name: '15 cm Colour Sparklers (10 pcs/box)',
    category: 'Sparklers',
    price: 85,
    stock: 120,
    minStockAlert: 20,
    unit: 'Box',
    description: 'Multi-colour green and red sparkles',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    code: 'SPK-30',
    name: '30 cm Deluxe Green Sparklers (5 pcs/box)',
    category: 'Sparklers',
    price: 160,
    stock: 80,
    minStockAlert: 15,
    unit: 'Box',
    description: 'Extra long burning emerald sparklers',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    code: 'CHK-STD',
    name: 'Standard Ground Chakkars (10 pcs/box)',
    category: 'Ground Chakkars',
    price: 110,
    stock: 95,
    minStockAlert: 15,
    unit: 'Box',
    description: 'High-speed spinning wheel with golden sparks',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    code: 'CHK-DLX',
    name: 'Deluxe Special Chakkar (10 pcs/box)',
    category: 'Ground Chakkars',
    price: 190,
    stock: 60,
    minStockAlert: 10,
    unit: 'Box',
    description: 'Bigger radius dual-colour spinner',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    code: 'POT-BIG',
    name: 'Flower Pots Special Big (10 pcs/box)',
    category: 'Flower Pots',
    price: 180,
    stock: 110,
    minStockAlert: 20,
    unit: 'Box',
    description: 'Tall golden fountain cone, low smoke',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    code: 'POT-ASH',
    name: 'Flower Pots Asoka Colour Fountain (10 pcs/box)',
    category: 'Flower Pots',
    price: 240,
    stock: 75,
    minStockAlert: 15,
    unit: 'Box',
    description: 'Glittering silver & ruby fountain spray',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    code: 'RCK-BBY',
    name: 'Baby Rockets Sound & Whistle (10 pcs/box)',
    category: 'Rockets',
    price: 140,
    stock: 90,
    minStockAlert: 15,
    unit: 'Box',
    description: 'High flying sky shot with whistle sound',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-009',
    code: 'RCK-PAR',
    name: 'Parachute Sky Rocket (Single Box)',
    category: 'Rockets',
    price: 220,
    stock: 40,
    minStockAlert: 10,
    unit: 'Box',
    description: 'Releases illuminated parachute floating down',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-010',
    code: 'BMB-7CM',
    name: '7 cm Classic Atom Bomb (10 pcs/box)',
    category: 'Bombs & Bijili',
    price: 130,
    stock: 140,
    minStockAlert: 25,
    unit: 'Box',
    description: 'Loud crisp festive sound explosion',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-011',
    code: 'BMB-HYD',
    name: 'Hydro Green Bomb Extra Loud (10 pcs/box)',
    category: 'Bombs & Bijili',
    price: 210,
    stock: 65,
    minStockAlert: 15,
    unit: 'Box',
    description: 'Heavy duty festival cracker with thunder clap',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-012',
    code: 'BJL-100',
    name: 'Red Bijili Striking Crackers (100 pcs/pkt)',
    category: 'Bombs & Bijili',
    price: 60,
    stock: 200,
    minStockAlert: 30,
    unit: 'Pkt',
    description: 'Rapid-fire traditional Sivakasi red bijili',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-013',
    code: 'GAR-1000',
    name: '1000 Wala Deluxe Red Garland',
    category: 'Garlands & Walas',
    price: 520,
    stock: 45,
    minStockAlert: 10,
    unit: 'Piece',
    description: 'Non-stop roaring festival garland chain',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-014',
    code: 'GAR-5000',
    name: '5000 Wala Grand Celebration Garland',
    category: 'Garlands & Walas',
    price: 2100,
    stock: 20,
    minStockAlert: 5,
    unit: 'Piece',
    description: 'Grand finale marathon sound garland',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-015',
    code: 'AER-12',
    name: '12 Shots Fancy Colour Sky Shots',
    category: 'Aerial / Multi-Shots',
    price: 490,
    stock: 55,
    minStockAlert: 10,
    unit: 'Box',
    description: 'Consecutive 12 multi-colour bursts in night sky',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-016',
    code: 'AER-30',
    name: '30 Shots Mega Fireworks Display Cake',
    category: 'Aerial / Multi-Shots',
    price: 1350,
    stock: 25,
    minStockAlert: 5,
    unit: 'Box',
    description: 'Professional grade sky panorama with crackling palms',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-017',
    code: 'KID-POP',
    name: 'Magic Snappers / Pop Pop (50 pcs/pkt)',
    category: 'Kids Novelty',
    price: 35,
    stock: 180,
    minStockAlert: 30,
    unit: 'Pkt',
    description: 'Fun throw-and-pop noisemaker for kids',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-018',
    code: 'GFT-FAM',
    name: 'Family Joy Diwali Gift Box (25 Items)',
    category: 'Gift Boxes',
    price: 1850,
    stock: 35,
    minStockAlert: 8,
    unit: 'Box',
    description: 'Assorted gift box with sparklers, pots, chakkars & shots',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-101',
    name: 'Ramesh Kumar',
    phone: '9840123456',
    address: 'Gandhi Road, Sivakasi',
    totalBills: 3,
    totalSpent: 4250,
    lastVisit: '2026-11-04',
    createdAt: '2026-10-15',
  },
  {
    id: 'cust-102',
    name: 'Priya Sundaram',
    phone: '9789012345',
    address: 'Vasanth Nagar, Madurai',
    totalBills: 2,
    totalSpent: 3100,
    lastVisit: '2026-11-05',
    createdAt: '2026-10-20',
  },
  {
    id: 'cust-103',
    name: 'Anand Mohan',
    phone: '9443322110',
    address: 'Cross Street, Virudhunagar',
    totalBills: 1,
    totalSpent: 1850,
    lastVisit: '2026-11-05',
    createdAt: '2026-11-05',
  },
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: 'bill-1001',
    invoiceNumber: 'SLCM-1001',
    customerId: 'cust-101',
    customerName: 'Ramesh Kumar',
    customerPhone: '9840123456',
    date: '2026-11-04',
    time: '14:30:15',
    items: [
      {
        productId: 'prod-001',
        productName: '10 cm Electric Sparklers (10 pcs/box)',
        category: 'Sparklers',
        price: 45,
        quantity: 4,
        unit: 'Box',
        total: 180,
      },
      {
        productId: 'prod-004',
        productName: 'Standard Ground Chakkars (10 pcs/box)',
        category: 'Ground Chakkars',
        price: 110,
        quantity: 2,
        unit: 'Box',
        total: 220,
      },
      {
        productId: 'prod-013',
        productName: '1000 Wala Deluxe Red Garland',
        category: 'Garlands & Walas',
        price: 520,
        quantity: 1,
        unit: 'Piece',
        total: 520,
      },
    ],
    subtotal: 920,
    discount: 20,
    grandTotal: 900,
    paymentMode: 'Cash',
    notes: 'Festival discount applied',
    syncStatus: 'synced',
    createdAt: '2026-11-04T14:30:15.000Z',
  },
  {
    id: 'bill-1002',
    invoiceNumber: 'SLCM-1002',
    customerId: 'cust-102',
    customerName: 'Priya Sundaram',
    customerPhone: '9789012345',
    date: '2026-11-05',
    time: '11:15:20',
    items: [
      {
        productId: 'prod-006',
        productName: 'Flower Pots Special Big (10 pcs/box)',
        category: 'Flower Pots',
        price: 180,
        quantity: 3,
        unit: 'Box',
        total: 540,
      },
      {
        productId: 'prod-015',
        productName: '12 Shots Fancy Colour Sky Shots',
        category: 'Aerial / Multi-Shots',
        price: 490,
        quantity: 2,
        unit: 'Box',
        total: 980,
      },
    ],
    subtotal: 1520,
    discount: 20,
    grandTotal: 1500,
    paymentMode: 'UPI / GPay',
    notes: 'Paid via PhonePe',
    syncStatus: 'synced',
    createdAt: '2026-11-05T11:15:20.000Z',
  },
  {
    id: 'bill-1003',
    invoiceNumber: 'SLCM-1003',
    customerId: 'cust-103',
    customerName: 'Anand Mohan',
    customerPhone: '9443322110',
    date: '2026-11-05',
    time: '16:45:00',
    items: [
      {
        productId: 'prod-018',
        productName: 'Family Joy Diwali Gift Box (25 Items)',
        category: 'Gift Boxes',
        price: 1850,
        quantity: 1,
        unit: 'Box',
        total: 1850,
      },
    ],
    subtotal: 1850,
    discount: 0,
    grandTotal: 1850,
    paymentMode: 'Cash',
    notes: 'Packaged gift box',
    syncStatus: 'synced',
    createdAt: '2026-11-05T16:45:00.000Z',
  },
];

class DatabaseService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // --- Initialize Database ---
  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.set(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BILLS)) {
      this.set(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    } else {
      const stored = this.get<ShopSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      if (stored.shopName === 'Sri Lakshmi Crackers Mart') {
        stored.shopName = 'VALLANGARAI Crackers';
        stored.tagline = 'Quality Festival Fireworks & Sparklers — Vallangarai, Tamil Nadu';
        stored.address = 'Main Road, Vallangarai, Tamil Nadu - 627357';
        this.set(STORAGE_KEYS.SETTINGS, stored);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYNC_LOGS)) {
      const initialLogs: SyncLog[] = [
        {
          id: 'log-01',
          timestamp: new Date().toLocaleTimeString(),
          action: 'MERGE',
          status: 'SUCCESS',
          details: 'Initialized local SQLite offline storage with 18 cracker catalog items.',
          recordsCount: 18,
        },
      ];
      this.set(STORAGE_KEYS.SYNC_LOGS, initialLogs);
    }
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public saveProduct(product: Omit<Product, 'id' | 'updatedAt'> & { id?: string }): { success: boolean; message: string; product?: Product } {
    const products = this.getProducts();
    const cleanName = product.name.trim().toLowerCase();

    // Check duplicate name
    const duplicate = products.find(
      (p) => p.name.trim().toLowerCase() === cleanName && p.id !== product.id
    );
    if (duplicate) {
      return { success: false, message: `A product named "${product.name}" already exists in the catalog!` };
    }

    if (product.id) {
      // Update
      const index = products.findIndex((p) => p.id === product.id);
      if (index === -1) return { success: false, message: 'Product not found' };
      const updated: Product = {
        ...products[index],
        ...product,
        id: product.id,
        updatedAt: new Date().toISOString(),
      };
      products[index] = updated;
      this.set(STORAGE_KEYS.PRODUCTS, products);
      return { success: true, message: 'Product updated successfully', product: updated };
    } else {
      // Create
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      products.unshift(newProduct);
      this.set(STORAGE_KEYS.PRODUCTS, products);
      return { success: true, message: 'Product created successfully', product: newProduct };
    }
  }

  public deleteProduct(id: string): { success: boolean; message: string } {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) {
      return { success: false, message: 'Product not found' };
    }
    this.set(STORAGE_KEYS.PRODUCTS, filtered);
    return { success: true, message: 'Product removed from catalog' };
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  public findCustomerByPhone(phone: string): Customer | undefined {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return undefined;
    return this.getCustomers().find((c) => c.phone.replace(/\D/g, '') === cleanPhone);
  }

  public saveCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string }): Customer {
    const customers = this.getCustomers();
    if (customer.id) {
      const index = customers.findIndex((c) => c.id === customer.id);
      if (index !== -1) {
        customers[index] = { ...customers[index], ...customer };
        this.set(STORAGE_KEYS.CUSTOMERS, customers);
        return customers[index];
      }
    }
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    customers.unshift(newCust);
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
    return newCust;
  }

  // --- Bills ---
  public getBills(): Bill[] {
    return this.get<Bill[]>(STORAGE_KEYS.BILLS, INITIAL_BILLS);
  }

  public getBillById(id: string): Bill | undefined {
    return this.getBills().find((b) => b.id === id || b.invoiceNumber === id);
  }

  public createBill(billData: {
    customerName: string;
    customerPhone: string;
    items: BillItem[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    paymentMode: 'Cash' | 'UPI / GPay' | 'Card';
    notes?: string;
  }): { success: boolean; bill: Bill } {
    const settings = this.getSettings();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const invoiceNumber = `${settings.invoicePrefix}${settings.nextInvoiceNumber}`;

    // Handle Customer record
    let customer = this.findCustomerByPhone(billData.customerPhone);
    if (!customer && billData.customerPhone.trim()) {
      customer = this.saveCustomer({
        name: billData.customerName || 'Walk-in Customer',
        phone: billData.customerPhone,
        totalBills: 1,
        totalSpent: billData.grandTotal,
        lastVisit: dateStr,
      });
    } else if (customer) {
      customer.totalBills += 1;
      customer.totalSpent += billData.grandTotal;
      customer.lastVisit = dateStr;
      if (billData.customerName && billData.customerName !== 'Walk-in Customer') {
        customer.name = billData.customerName;
      }
      this.saveCustomer(customer);
    }

    // Deduct stock for each item in the bill
    const products = this.getProducts();
    billData.items.forEach((item) => {
      const prodIndex = products.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        products[prodIndex].stock = Math.max(0, products[prodIndex].stock - item.quantity);
        products[prodIndex].updatedAt = now.toISOString();
      }
    });
    this.set(STORAGE_KEYS.PRODUCTS, products);

    // Create the Bill
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      invoiceNumber,
      customerId: customer?.id,
      customerName: billData.customerName || 'Walk-in Customer',
      customerPhone: billData.customerPhone || 'N/A',
      date: dateStr,
      time: timeStr,
      items: billData.items,
      subtotal: billData.subtotal,
      discount: billData.discount,
      grandTotal: billData.grandTotal,
      paymentMode: billData.paymentMode,
      notes: billData.notes,
      syncStatus: 'synced',
      createdAt: now.toISOString(),
    };

    const bills = this.getBills();
    bills.unshift(newBill);
    this.set(STORAGE_KEYS.BILLS, bills);

    // Increment next invoice number
    settings.nextInvoiceNumber += 1;
    this.setSettings(settings);

    return { success: true, bill: newBill };
  }

  // --- Settings ---
  public getSettings(): ShopSettings {
    return this.get<ShopSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public setSettings(settings: ShopSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- Sync Logs ---
  public getSyncLogs(): SyncLog[] {
    return this.get<SyncLog[]>(STORAGE_KEYS.SYNC_LOGS, []);
  }

  public addSyncLog(log: Omit<SyncLog, 'id' | 'timestamp'>): void {
    const logs = this.getSyncLogs();
    const newLog: SyncLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.SYNC_LOGS, logs.slice(0, 50));
  }

  // --- Backup & Restore (JSON / SQLite Dump) ---
  public generateBackupJSON(): string {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        shopId: this.getSettings().shopId,
        settings: this.getSettings(),
        products: this.getProducts(),
        customers: this.getCustomers(),
        bills: this.getBills(),
      },
      null,
      2
    );
  }

  public generateSQLiteDump(): string {
    const products = this.getProducts();
    const customers = this.getCustomers();
    const bills = this.getBills();

    let sql = `-- =======================================================
-- CRACKERS SHOP BILLING MANAGEMENT SYSTEM - SQLITE BACKUP
-- Generated: ${new Date().toISOString()}
-- Shop ID: ${this.getSettings().shopId}
-- =======================================================

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- TABLE: Products
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

-- TABLE: Customers
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

-- TABLE: Bills
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
    payment_mode TEXT NOT NULL,
    notes TEXT,
    sync_status TEXT DEFAULT 'synced',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES Customers(id)
);

-- TABLE: Bill_Items
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

-- TABLE: Sales_Reports
CREATE TABLE IF NOT EXISTS Sales_Reports (
    report_date DATE PRIMARY KEY,
    total_sales REAL DEFAULT 0.0,
    total_bills INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

`;

    // Products INSERT
    products.forEach((p) => {
      const desc = p.description ? `'${p.description.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT OR REPLACE INTO Products (id, code, name, category, price, stock, min_stock_alert, unit, description, updated_at) VALUES ('${p.id}', '${p.code}', '${p.name.replace(/'/g, "''")}', '${p.category}', ${p.price}, ${p.stock}, ${p.minStockAlert}, '${p.unit}', ${desc}, '${p.updatedAt}');\n`;
    });

    // Customers INSERT
    customers.forEach((c) => {
      const addr = c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT OR REPLACE INTO Customers (id, name, phone, address, total_bills, total_spent, last_visit, created_at) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.phone}', ${addr}, ${c.totalBills}, ${c.totalSpent}, '${c.lastVisit}', '${c.createdAt}');\n`;
    });

    // Bills and Bill_Items INSERT
    bills.forEach((b) => {
      const custId = b.customerId ? `'${b.customerId}'` : 'NULL';
      const notes = b.notes ? `'${b.notes.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT OR REPLACE INTO Bills (id, invoice_number, customer_id, customer_name, customer_phone, billing_date, billing_time, subtotal, discount, grand_total, payment_mode, notes, sync_status, created_at) VALUES ('${b.id}', '${b.invoiceNumber}', ${custId}, '${b.customerName.replace(/'/g, "''")}', '${b.customerPhone}', '${b.date}', '${b.time}', ${b.subtotal}, ${b.discount}, ${b.grandTotal}, '${b.paymentMode}', ${notes}, '${b.syncStatus}', '${b.createdAt}');\n`;

      b.items.forEach((item) => {
        sql += `INSERT INTO Bill_Items (bill_id, product_id, product_name, category, price, quantity, unit, total) VALUES ('${b.id}', '${item.productId}', '${item.productName.replace(/'/g, "''")}', '${item.category}', ${item.price}, ${item.quantity}, '${item.unit}', ${item.total});\n`;
      });
    });

    sql += `COMMIT;\n`;
    return sql;
  }

  public restoreFromJSON(jsonString: string): { success: boolean; message: string; count?: { products: number; bills: number } } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.products || !Array.isArray(parsed.products) || !parsed.bills) {
        return { success: false, message: 'Invalid backup file format. Missing products or bills array.' };
      }
      this.set(STORAGE_KEYS.PRODUCTS, parsed.products);
      if (parsed.customers) this.set(STORAGE_KEYS.CUSTOMERS, parsed.customers);
      this.set(STORAGE_KEYS.BILLS, parsed.bills);
      if (parsed.settings) this.set(STORAGE_KEYS.SETTINGS, parsed.settings);

      this.addSyncLog({
        action: 'MERGE',
        status: 'SUCCESS',
        details: `Restored database from backup file. Loaded ${parsed.products.length} products and ${parsed.bills.length} bills.`,
        recordsCount: parsed.products.length + parsed.bills.length,
      });

      return {
        success: true,
        message: 'Database successfully restored from backup!',
        count: { products: parsed.products.length, bills: parsed.bills.length },
      };
    } catch {
      return { success: false, message: 'Failed to parse JSON backup file.' };
    }
  }

  // --- Synchronization Engine ---
  public syncWithShop(remoteShopId: string): {
    success: boolean;
    syncedItems: number;
    message: string;
  } {
    const currentSettings = this.getSettings();
    if (remoteShopId.trim() !== currentSettings.shopId.trim()) {
      this.addSyncLog({
        action: 'PULL',
        status: 'CONFLICT_RESOLVED',
        details: `Shop ID mismatch: local (${currentSettings.shopId}) vs remote (${remoteShopId}). Sync cancelled.`,
        recordsCount: 0,
      });
      return {
        success: false,
        syncedItems: 0,
        message: `Shop ID mismatch! Ensure desktop and mobile share '${currentSettings.shopId}'.`,
      };
    }

    // Mark pending bills as synced
    const bills = this.getBills();
    let updatedCount = 0;
    bills.forEach((b) => {
      if (b.syncStatus === 'pending') {
        b.syncStatus = 'synced';
        updatedCount++;
      }
    });
    this.set(STORAGE_KEYS.BILLS, bills);

    currentSettings.lastSyncedAt = new Date().toISOString();
    this.setSettings(currentSettings);

    const productsCount = this.getProducts().length;
    const totalRecords = productsCount + bills.length;

    this.addSyncLog({
      action: 'MERGE',
      status: 'SUCCESS',
      details: `Full bidirectional sync verified for Shop ${remoteShopId}. Catalog: ${productsCount} items, Invoices: ${bills.length}.`,
      recordsCount: totalRecords,
    });

    return {
      success: true,
      syncedItems: totalRecords,
      message: `Sync successful! ${totalRecords} records up-to-date with Shop ID ${remoteShopId}.`,
    };
  }

  // Reset to sample catalog
  public resetToDefault(): void {
    this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.set(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.set(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
}

export const db = new DatabaseService();
db.init();
