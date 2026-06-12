export interface Manager {
    id: number;
    name: string;
    email: string;
    country: string;
  }
  
  export interface Provider {
    id: number;
    name: string;
    country: string;
  }
  
  export interface Initiative {
    id: number;
    name: string;
    budgetUsd: number;
  }
  
  export interface Resource {
    id: number;
    consultantName: string;
    profile: string;
    country: string;
    currency: string;
    monthlyCostOriginal: number;
    monthlyCostUsd: number;
    exchangeRateToUsd: number;
    startDate: string;
    endDate: string;
    durationMonths: number;
    totalCostUsd: number;
    analystResponsible: string;
    observations: string;
    status: string;
    expirationStatus: 'GREEN' | 'AMBER' | 'RED' | 'EXPIRED';
    daysRemaining: number;
    provider: Provider;
    manager: Manager;
    mainInitiative: Initiative;
    managerId: number;
    providerId: number;
    mainInitiativeId: number;
  }
  
  export interface PurchaseOrder {
    id: number;
    resourceId: number;
    periodMonth: string;
    poNumber: string | null;
    status: POStatus;
    amountOriginal: number;
    currency: string;
    amountUsd: number;
    comments: string | null;
    resource?: Resource;
    provider?: Provider;
  }

  export type POStatus = 'PENDING' | 'COUPA_GENERATED' | 'SENT' | 'APPROVED' | 'CLOSED';

  export const PO_STATUS_OPTIONS: { value: POStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'COUPA_GENERATED', label: 'Coupa generado' },
    { value: 'SENT', label: 'OC enviada' },
    { value: 'APPROVED', label: 'Aprobada' },
    { value: 'CLOSED', label: 'Cerrada' },
  ];
  
  export interface DashboardSummary {
    totalResources: number;
    activeResources: number;
    expiringAmber: number;
    expiringRed: number;
    expired: number;
    monthlyCostUsd: number;
    totalCommittedUsd: number;
    pendingPurchaseOrders: number;
    visibleBudgetUsd?: number;
    availableBudgetUsd?: number;
    pendingPurchaseOrdersThisMonth?: number;
    expiringSoon: ExpiringSoonItem[];
    costByInitiative: CostByInitiative[];
    resourcesByCountry: ResourcesByCountry[];
  }
  
  export interface ExpiringSoonItem {
    id: number;
    consultantName: string;
    profile: string;
    endDate: string;
    daysRemaining: number;
    expirationStatus: string;
    managerName: string;
    monthlyCostUsd: number;
  }
  
  export interface CostByInitiative {
    initiativeId: number;
    initiativeName: string;
    totalCostUsd: number;
    resourceCount: number;
    budgetUsd?: number;
    availableUsd?: number;
    usagePercentage?: number;
  }
  
  export interface ResourcesByCountry {
    country: string;
    resourceCount: number;
    monthlyCostUsd: number;
  }
  
  export interface ExchangeRate {
    id: number;
    currency: string;
    country: string;
    rateToUsd: number;
    rateDate: string;
    source: string;
  }

  export interface CreateResourcePayload {
    consultantName: string;
    providerId: number;
    profile: string;
    country: string;
    currency: string;
    monthlyCostOriginal: number;
    exchangeRateToUsd: number;
    startDate: string;
    endDate: string;
    analystResponsible: string;
    managerId: number;
    mainInitiativeId: number;
    observations?: string;
  }

  export interface DemoUser {
    key: string;
    label: string;
    name: string;
    email: string;
    role: string;
    country: string;
    area: string;
    managerId: number | null;
    avatar: string;
  }

  export const DEMO_USERS: DemoUser[] = [
    {
      key: 'manager-peru',
      label: 'Manager Perú',
      name: 'Ariadna Guzmán',
      email: 'ariadnaguzman@belcorp.biz',
      role: 'MANAGER',
      country: 'Perú',
      area: 'Finance Platform Services',
      managerId: 1,
      avatar: 'AG',
    },
    {
      key: 'manager-colombia',
      label: 'Manager Colombia',
      name: 'Carlos Mendoza',
      email: 'cmendoza@belcorp.biz',
      role: 'MANAGER',
      country: 'Colombia',
      area: 'Finance Platform Services',
      managerId: 2,
      avatar: 'CM',
    },
    {
      key: 'manager-bolivia',
      label: 'Manager Bolivia',
      name: 'Luis Mamani',
      email: 'lmamani@belcorp.biz',
      role: 'MANAGER',
      country: 'Bolivia',
      area: 'Finance Platform Services',
      managerId: 3,
      avatar: 'LM',
    },
    {
      key: 'finance',
      label: 'Finance Lead',
      name: 'Patricia Vega',
      email: 'pvega@belcorp.biz',
      role: 'FINANCE',
      country: 'Regional',
      area: 'Finance Platform Services',
      managerId: null,
      avatar: 'PV',
    },
    {
      key: 'admin',
      label: 'Admin',
      name: 'Admin Sistema',
      email: 'admin@belcorp.biz',
      role: 'ADMIN',
      country: 'Regional',
      area: 'Finance Platform Services',
      managerId: null,
      avatar: 'AS',
    },
  ];

  export function getCurrentDemoUser(): DemoUser {
    const key = localStorage.getItem('demoUser') || 'manager-peru';
    return DEMO_USERS.find(u => u.key === key) ?? DEMO_USERS[0];
  }

  export type AlertType =
    | 'EXPIRATION_AMBER'
    | 'EXPIRATION_RED'
    | 'EXPIRED'
    | 'PO_PENDING';

  export type AlertStatus =
    | 'SENT'
    | 'FAILED'
    | 'MOCKED';

  export interface AlertNotification {
    id: number;
    resourceId?: number | null;
    purchaseOrderId?: number | null;
    managerId: number;
    alertType: AlertType;
    daysRemaining?: number | null;
    status: AlertStatus;
    message?: string | null;
    sentAt: string;
    resource?: Resource | null;
    purchaseOrder?: PurchaseOrder | null;
    manager?: Manager | null;
  }

  export interface AlertsSummary {
    total: number;
    expirationAmber: number;
    expirationRed: number;
    expired: number;
    poPending: number;
    mocked: number;
    failed: number;
  }

  export interface RunAlertValidationResponse {
    processedResources: number;
    processedPurchaseOrders: number;
    createdAlerts: number;
    skippedDuplicates: number;
    alertsByType: {
      EXPIRATION_AMBER: number;
      EXPIRATION_RED: number;
      EXPIRED: number;
      PO_PENDING: number;
    };
    mockedEmails: Array<{
      managerName: string;
      managerEmail: string;
      subject: string;
      message: string;
    }>;
  }