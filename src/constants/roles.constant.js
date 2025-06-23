const ROLES = Object.freeze({
    USER: "USER", // Base platform user

    // 🔐 System-level roles
    SYSTEM: "SYSTEM", // Internal system operations
    SUPER_ADMIN: "SUPER_ADMIN", // Full access to the SaaS platform
    SAAS_SUPPORT: "SAAS_SUPPORT", // SaaS support team
    BOT: "BOT", // Automated background tasks and services

    // 🏬 Store operations
    ADMIN: "ADMIN", // Full control of the store/tenant
    EMPLOYEE: "EMPLOYEE", // General store employee
    STORE_MANAGER: "STORE_MANAGER", // Oversees store day-to-day
    CUSTOMER_SUPPORT: "CUSTOMER_SUPPORT", // Resolves customer issues
    SALES_EXECUTIVE: "SALES_EXECUTIVE", // Engages customers and drives sales
    PACKER: "PACKER", // Packs products for delivery
    DELIVERY_AGENT: "DELIVERY_AGENT", // Delivers orders to customers

    // 📦 Warehouse roles
    WAREHOUSE: "WAREHOUSE",
    WAREHOUSE_OWNER: "WAREHOUSE_OWNER", // Owns and oversees warehouse operations
    WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER", // Manages daily warehouse activities
    WAREHOUSE_STAFF: "WAREHOUSE_STAFF", // Handles manual tasks in warehouse
    STOCK_CONTROLLER: "STOCK_CONTROLLER", // Manages stock movement & records
    INVENTORY_AUDITOR: "INVENTORY_AUDITOR", // Audits warehouse inventory

    // 🛒 Supplier & procurement
    SUPPLIER: "SUPPLIER", // External vendor providing plants/products
    PROCUREMENT_OFFICER: "PROCUREMENT_OFFICER", // Orders and manages procurement
    SUPPLY_CHAIN_MANAGER: "SUPPLY_CHAIN_MANAGER", // Oversees the supply chain
    VENDOR_RELATIONS_EXECUTIVE: "VENDOR_RELATIONS_EXECUTIVE", // Manages supplier relationships

    // 📣 Marketing & content
    MARKETING_MANAGER: "MARKETING_MANAGER", // Leads marketing strategy
    DIGITAL_MARKETER: "DIGITAL_MARKETER", // Executes online marketing campaigns
    CONTENT_CREATOR: "CONTENT_CREATOR", // Designs visuals and written content
    SEO_SPECIALIST: "SEO_SPECIALIST", // Improves organic search visibility
    SOCIAL_MEDIA_EXECUTIVE: "SOCIAL_MEDIA_EXECUTIVE", // Manages social platforms
    BRAND_MANAGER: "BRAND_MANAGER", // Maintains brand identity and messaging

    // 💳 Finance & accounting
    FINANCE_MANAGER: "FINANCE_MANAGER", // Leads financial planning and strategy
    ACCOUNTANT: "ACCOUNTANT", // Maintains ledgers and financial statements
    BILLING_EXECUTIVE: "BILLING_EXECUTIVE", // Prepares and processes bills
    PAYMENT_COLLECTION_OFFICER: "PAYMENT_COLLECTION_OFFICER", // Ensures payments are collected

    // 👨‍💻 Technical & product
    IT_ADMIN: "IT_ADMIN", // Manages IT infrastructure and security
    DEVELOPER: "DEVELOPER", // Builds and maintains software systems
    QA_ENGINEER: "QA_ENGINEER", // Tests and assures software quality
    PRODUCT_MANAGER: "PRODUCT_MANAGER", // Defines product requirements and roadmap
    UI_UX_DESIGNER: "UI_UX_DESIGNER", // Designs user interfaces and experience
    DEVOPS_ENGINEER: "DEVOPS_ENGINEER", // Handles CI/CD and deployment pipelines
    DATA_ANALYST: "DATA_ANALYST", // Analyzes data and business metrics

    // 🧍 Customer roles
    CUSTOMER: "CUSTOMER", // Retail user purchasing for personal use
    WHOLESALE_CUSTOMER: "WHOLESALE_CUSTOMER", // Buys in bulk for resale or business
    RETAIL_CUSTOMER: "RETAIL_CUSTOMER", // Purchases standard quantities for household

    // 🌍 Regional & audit
    KEY_AREA_MANAGER: "KEY_AREA_MANAGER", // Oversees key regional operations
    AUDITOR: "AUDITOR", // Examines operations for compliance and accuracy
    AREA_SALES_MANAGER: "AREA_SALES_MANAGER", // Manages sales team in a region
    CITY_MANAGER: "CITY_MANAGER", // Leads city-level performance
    FIELD_AGENT: "FIELD_AGENT" // On-ground workforce member for data, surveys, visits
});

// 🗂 Department mappings
const DEPARTMENTS = Object.freeze({
    // 🔐 System
    [ROLES.SYSTEM]: "SYSTEM", // Internal system jobs
    [ROLES.SUPER_ADMIN]: "SAAS ADMIN", // Full SaaS control
    [ROLES.SAAS_SUPPORT]: "SAAS SUPPORT", // Platform-level support team
    [ROLES.BOT]: "AUTOMATION", // Auto-tasks, jobs, scripts

    // 🏬 Store
    [ROLES.ADMIN]: "STORE OPERATIONS", // Top-level store admin
    [ROLES.EMPLOYEE]: "STORE OPERATIONS", // Store staff
    [ROLES.STORE_MANAGER]: "STORE OPERATIONS", // Handles store staff, inventory, orders
    [ROLES.CUSTOMER_SUPPORT]: "SUPPORT", // Handles support tickets
    [ROLES.SALES_EXECUTIVE]: "SALES", // On-floor or CRM-based sales
    [ROLES.PACKER]: "LOGISTICS", // Order packaging
    [ROLES.DELIVERY_AGENT]: "LOGISTICS", // Delivery to customer doorstep

    // 📦 Warehouse
    [ROLES.WAREHOUSE_OWNER]: "WAREHOUSE", // Owns warehouse infra
    [ROLES.WAREHOUSE_MANAGER]: "WAREHOUSE", // Manages inward/outward stock
    [ROLES.WAREHOUSE_STAFF]: "WAREHOUSE", // Supports operations inside warehouse
    [ROLES.STOCK_CONTROLLER]: "WAREHOUSE", // Tracks quantities and alerts
    [ROLES.INVENTORY_AUDITOR]: "WAREHOUSE", // Periodic stock audits

    // 🛒 Supplier & Procurement
    [ROLES.SUPPLIER]: "SUPPLIER", // External vendor
    [ROLES.PROCUREMENT_OFFICER]: "PROCUREMENT", // Places POs
    [ROLES.SUPPLY_CHAIN_MANAGER]: "PROCUREMENT", // End-to-end supply ops
    [ROLES.VENDOR_RELATIONS_EXECUTIVE]: "PROCUREMENT", // Handles daily communication with suppliers

    // 📣 Marketing
    [ROLES.MARKETING_MANAGER]: "MARKETING", // Owns marketing strategy
    [ROLES.DIGITAL_MARKETER]: "MARKETING", // Runs ads, campaigns
    [ROLES.CONTENT_CREATOR]: "MARKETING", // Creates visuals, text, videos
    [ROLES.SEO_SPECIALIST]: "MARKETING", // Optimizes visibility on search
    [ROLES.SOCIAL_MEDIA_EXECUTIVE]: "MARKETING", // Manages Instagram, etc.
    [ROLES.BRAND_MANAGER]: "MARKETING", // Tone, theme, brand hygiene

    // 💳 Finance
    [ROLES.FINANCE_MANAGER]: "FINANCE", // Manages overall budget
    [ROLES.ACCOUNTANT]: "FINANCE", // Books and ledgers
    [ROLES.BILLING_EXECUTIVE]: "FINANCE", // Generates customer invoices
    [ROLES.PAYMENT_COLLECTION_OFFICER]: "FINANCE", // Follows up on dues

    // 👨‍💻 Tech
    [ROLES.IT_ADMIN]: "TECH", // Infra, downtime, networking
    [ROLES.DEVELOPER]: "TECH", // Code warriors
    [ROLES.QA_ENGINEER]: "TECH", // Bug catchers
    [ROLES.PRODUCT_MANAGER]: "TECH", // Business-logic + roadmap
    [ROLES.UI_UX_DESIGNER]: "TECH", // Experience designers
    [ROLES.DEVOPS_ENGINEER]: "TECH", // Cloud, CI/CD
    [ROLES.DATA_ANALYST]: "TECH", // Analyzes trends, logs, patterns

    // 🧍 Customers
    [ROLES.CUSTOMER]: "CUSTOMER", // Personal user
    [ROLES.WHOLESALE_CUSTOMER]: "CUSTOMER", // Bulk buyer
    [ROLES.RETAIL_CUSTOMER]: "CUSTOMER", // Normal B2C buyer

    // 🌍 Regional
    [ROLES.KEY_AREA_MANAGER]: "REGIONAL MANAGEMENT", // Controls regional clusters
    [ROLES.AUDITOR]: "AUDIT", // Audits logs, ops, payments
    [ROLES.AREA_SALES_MANAGER]: "REGIONAL SALES", // Covers area-wise targets
    [ROLES.CITY_MANAGER]: "REGIONAL SALES", // Urban zone lead
    [ROLES.FIELD_AGENT]: "FIELD OPERATIONS" // Ground surveyors, delivery helpers
});

const PLATFORM_ROLES = Object.freeze([
    ROLES.SUPER_ADMIN,
    ROLES.SAAS_SUPPORT,
    ROLES.SYSTEM,
    ROLES.BOT
]);

const STORE_ROLES = Object.freeze([
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
    ROLES.STORE_MANAGER,
    ROLES.SALES_EXECUTIVE,
    ROLES.CUSTOMER_SUPPORT,
    ROLES.PACKER,
    ROLES.DELIVERY_AGENT
]);

const WAREHOUSE_ROLES = Object.freeze([
    ROLES.WAREHOUSE_OWNER,
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF,
    ROLES.STOCK_CONTROLLER,
    ROLES.INVENTORY_AUDITOR
]);

const SUPPLIER_ROLES = Object.freeze([
    ROLES.SUPPLIER,
    ROLES.PROCUREMENT_OFFICER,
    ROLES.SUPPLY_CHAIN_MANAGER,
    ROLES.VENDOR_RELATIONS_EXECUTIVE
]);

const MARKETING_ROLES = Object.freeze([
    ROLES.MARKETING_MANAGER,
    ROLES.DIGITAL_MARKETER,
    ROLES.CONTENT_CREATOR,
    ROLES.SEO_SPECIALIST,
    ROLES.SOCIAL_MEDIA_EXECUTIVE,
    ROLES.BRAND_MANAGER
]);

const FINANCE_ROLES = Object.freeze([
    ROLES.FINANCE_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.BILLING_EXECUTIVE,
    ROLES.PAYMENT_COLLECTION_OFFICER
]);

const TECH_ROLES = Object.freeze([
    ROLES.IT_ADMIN,
    ROLES.DEVELOPER,
    ROLES.QA_ENGINEER,
    ROLES.PRODUCT_MANAGER,
    ROLES.UI_UX_DESIGNER,
    ROLES.DEVOPS_ENGINEER,
    ROLES.DATA_ANALYST
]);

const CUSTOMER_ROLES = Object.freeze([
    ROLES.CUSTOMER,
    ROLES.WHOLESALE_CUSTOMER,
    ROLES.RETAIL_CUSTOMER
]);

const REGIONAL_ROLES = Object.freeze([
    ROLES.KEY_AREA_MANAGER,
    ROLES.AREA_SALES_MANAGER,
    ROLES.CITY_MANAGER,
    ROLES.FIELD_AGENT
]);

const AUDIT_ROLES = Object.freeze([ROLES.AUDITOR]);

module.exports = {
    ROLES,
    DEPARTMENTS,
    PLATFORM_ROLES,
    STORE_ROLES,
    WAREHOUSE_ROLES,
    SUPPLIER_ROLES,
    MARKETING_ROLES,
    FINANCE_ROLES,
    TECH_ROLES,
    CUSTOMER_ROLES,
    REGIONAL_ROLES,
    AUDIT_ROLES
};
