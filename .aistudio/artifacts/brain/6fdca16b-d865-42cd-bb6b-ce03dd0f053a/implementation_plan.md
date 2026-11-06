# Shop Name & Branding Update: VALLANGARAI Crackers

Update the billing management system's primary branding, store metadata, digital receipt headers, and deliverable source code to reflect the new business identity: **VALLANGARAI Crackers**, located in **Vallangarai, Tamil Nadu**, while retaining existing invoice sequence numbers and offline database schemas.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed based on your preferences:
> - **Shop Name**: Updated to **VALLANGARAI Crackers**.
> - **Invoice Prefix & Shop ID**: Retained without resetting invoice numbers (`SLCM-` maintained to preserve existing ledger history).
> - **Address & Tagline**: Updated to **Main Road, Vallangarai, Tamil Nadu** with a dedicated festival fireworks tagline.

- **Confirmed Decision 1**: Keep current invoice prefix and update only the shop name.
- **Confirmed Decision 2**: Update shop address and tagline for Vallangarai, Tamil Nadu.

---

## 1. Overview & Core Concept

- **What It Does**: Rebrands the entire Crackers POS ecosystem—including the interactive Web Cashier, Android Mobile Emulator, WhatsApp invoice formatter, Python CustomTkinter Windows desktop codebase, Flutter Android codebase, and SQLite schema defaults—to **VALLANGARAI Crackers**.
- **Target Audience / Persona**: Cashiers, store owners, and retail managers running the counter at VALLANGARAI Crackers in Tamil Nadu during festival rushes.
- **Key Value**: Instant brand consistency across digital WhatsApp receipts sent to customers, mobile devices, and downloadable standalone desktop software.

---

## 2. User Experience & Visual Design

- **Header & Navigation**:
  - The primary application header wordmark will display **VALLANGARAI Crackers** alongside the "Non-GST POS" badge.
  - Tagline updated to: *"Quality Festival Fireworks & Direct Agency — Vallangarai, Tamil Nadu"*.
- **Digital WhatsApp & SMS Receipts**:
  - Store header on digital receipts will read: `✨ VALLANGARAI CRACKERS ✨`.
  - Address: `Main Road, Vallangarai, Tamil Nadu`.
  - Customer WhatsApp messages and printed digital previews will reflect the new identity immediately upon saving a bill.
- **Desktop & Mobile Consistency**:
  - Python desktop application (`desktop/main.py`) and Flutter Android screen (`billing_screen.dart`) headers updated to VALLANGARAI Crackers.
  - In-browser Android mobile preview bar synced to the new store name.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Immediate Storage Update**:
  - *Chosen Approach*: Update `DEFAULT_SETTINGS` in `db.ts` and migrate any existing stored shop settings in `localStorage` so existing users see the update immediately without having to manually reset the database.
  - *Why*: Prevents stale cached names from overriding the new brand name.
- **Decision 2: Deliverable Codebase Sync**:
  - *Chosen Approach*: Update all source code files in `sourceCodeAssets.ts` (`main.py`, `database.py`, `main.dart`, `billing_screen.dart`, `schema.sql`, `README.md`) so that when the user downloads the complete Project ZIP, it is 100% pre-configured with VALLANGARAI Crackers.
  - *Why*: Ensures zero manual find-and-replace is required when compiling the Windows `.exe` or Android `.apk`.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    VALLANGARAI CRACKERS                     │
│               Shop Settings & Data Architecture             │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐      ┌─────────────────┐     ┌────────────────┐
│  Desktop POS │      │ Android Mobile  │     │ WhatsApp Bill  │
│  Interface   │      │ Interface (PWA) │     │ Generator      │
└──────┬───────┘      └────────┬────────┘     └────────┬───────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
              ┌─────────────────────────────────┐
              │ SQLite / IndexedDB Store (db.ts)│
              │ - shopName: VALLANGARAI Crackers│
              │ - address: Vallangarai, TN      │
              │ - prefix: SLCM- (preserved)     │
              └────────────────┬────────────────┘
                               │
                               ▼
              ┌─────────────────────────────────┐
              │ Deliverables & ZIP Generator    │
              │ - Python Desktop (main.py)      │
              │ - Flutter Android (main.dart)   │
              │ - SQLite Schema (schema.sql)    │
              └─────────────────────────────────┘
```

### Proposed Execution Steps:
1. **Database & Settings Layer (`src/services/db.ts`)**:
   - Update `DEFAULT_SETTINGS` with `shopName: 'VALLANGARAI Crackers'`, `tagline: 'Quality Festival Fireworks & Sparklers — Vallangarai, Tamil Nadu'`, and `address: 'Main Road, Vallangarai, Tamil Nadu - 627357'`.
   - Update `db.init()` to ensure existing settings in `localStorage` reflect the new shop name.
2. **Deliverables & Source Code Assets (`src/services/sourceCodeAssets.ts`)**:
   - Update `DESKTOP_PYTHON_MAIN` and `DESKTOP_PYTHON_DATABASE` default store name and receipt templates to VALLANGARAI Crackers.
   - Update `FLUTTER_BILLING_SCREEN` and `FLUTTER_MAIN_DART` title and WhatsApp templates to VALLANGARAI Crackers.
   - Update `SQL_SCHEMA_CONTENT` and `README_INSTALL_INSTRUCTIONS`.
3. **Receipt Modal & UI Footers (`src/components/DigitalReceiptModal.tsx`, `src/App.tsx`)**:
   - Sync footer and digital preview labels.
4. **Verification**:
   - Run `compile_applet` and `lint_applet` to ensure clean build.
