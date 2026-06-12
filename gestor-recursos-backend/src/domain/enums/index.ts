export enum UserRole {
    MANAGER = 'MANAGER',
    FINANCE = 'FINANCE',
    ADMIN = 'ADMIN',
  }
  
  export enum ResourceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    CANCELLED = 'CANCELLED',
  }
  
  export enum ExpirationStatus {
    GREEN = 'GREEN',
    AMBER = 'AMBER',
    RED = 'RED',
    EXPIRED = 'EXPIRED',
  }
  
  export enum PurchaseOrderStatus {
    PENDING = 'PENDING',
    COUPA_GENERATED = 'COUPA_GENERATED',
    SENT = 'SENT',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
  }
  
  export enum AlertType {
    EXPIRATION_AMBER = 'EXPIRATION_AMBER',
    EXPIRATION_RED = 'EXPIRATION_RED',
    EXPIRED = 'EXPIRED',
    PO_PENDING = 'PO_PENDING',
  }
  
  export enum AlertStatus {
    SENT = 'SENT',
    FAILED = 'FAILED',
    MOCKED = 'MOCKED',
  }