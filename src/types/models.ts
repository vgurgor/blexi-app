export interface IUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'manager' | 'user';
  tenant_id: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  person_id?: string;
  person?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  permissions?: string[];
  last_login?: string;
  email_verified_at?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPerson {
  id: string;
  tenantId: string;
  name: string;
  tcNo: string;
  phone: string;
  email?: string;
  birthDate: string;
  address?: string;
  city?: string;
  profilePhotoPath?: string;
  profilePhotoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface IAccountTransaction {
  id: string;
  guestId: string;
  transactionType: number;
  transactionTypeLabel: string;
  modelType: string;
  modelId: string;
  amount: number;
  movementType: number;
  movementTypeLabel: string;
  effectiveAmount: number;
  description: string;
  createdAt: string;
}

export interface IAccountTransactionSummary {
  guestId: string;
  balance: number;
  transactionsCount: number;
  totalCharged: number;
  totalPaid: number;
  typeBreakdown: Record<string, number>;
  lastTransactionDate: string;
}

export interface ICompany {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxNumber: string;
  taxOffice: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  aparts_count?: number;
  aparts?: Array<{
    id: number;
    firm_id: number;
    name: string;
    address: string;
    gender_type: string;
    opening_date: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface IApartment {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  companyId: string;
  genderType: 'MALE' | 'FEMALE' | 'MIXED';
  openingDate: string;
  status: 'active' | 'inactive';
  roomsCount?: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IRoom {
  id: string;
  apart_id: string;
  room_number: string;
  floor: number;
  capacity: number;
  room_type: 'STANDARD' | 'SUITE' | 'DELUXE';
  status: 'active' | 'inactive' | 'maintenance';
  beds_count?: number;
  beds?: IBed[];
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IBed {
  id: string;
  name: string;
  roomId: string;
  bed_number: string;
  bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  guest_id?: string | null;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryItem {
  id: string;
  tenant_id: string;
  assignable_type?: string;
  assignable_id?: string;
  item_type: 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration';
  status: 'in_use' | 'in_storage' | 'maintenance' | 'disposed';
  tracking_number: string;
  brand: string;
  model: string;
  purchase_date: string;
  warranty_end?: string;
  location?: 'apartment' | 'room' | 'bed';
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFeature {
  id: string;
  name: string;
  code: string;
  type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
  category: 'apartment' | 'room' | 'bed';
  createdAt: string;
  updatedAt: string;
}

export interface ISeason {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IProductCategory {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: string;
  categoryId: string;
  category?: IProductCategory;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ITaxType {
  id: string;
  name: string;
  taxCode: string;
  percentage: number;
  priority: number;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IPrice {
  id: string;
  apartId: string;
  apart?: {
    id: string;
    name: string;
  };
  seasonCode: string;
  season?: {
    code: string;
    name: string;
  };
  productId: string;
  product?: {
    id: string;
    name: string;
    categoryId: string;
    category?: {
      id: string;
      name: string;
    };
  };
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  taxes?: Array<{
    id: string;
    taxTypeId: string;
    name: string;
    percentage: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ICurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isDefault: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IExchangeRate {
  id: string;
  baseCurrency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
  targetCurrency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
  rate: number;
  effectiveDate: string;
  source: 'manual' | 'api' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentTypeCategory {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentType {
  id: string;
  categoryId: string;
  category?: IPaymentTypeCategory;
  name: string;
  bankName?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IDiscountCategory {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IDiscountRule {
  id: string;
  tenantId: string;
  discountCategoryId: string;
  discountCategory?: IDiscountCategory;
  productId?: string;
  product?: IProduct;
  productCategoryId?: string;
  productCategory?: IProductCategory;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPrice?: number;
  maxPrice?: number;
  minNights?: number;
  maxNights?: number;
  priority: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ISeasonRegistration {
  id: string;
  tenantId: string;
  guestId: string;
  apartId: string;
  seasonCode: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'active' | 'cancelled' | 'completed';
  notes?: string;
  depositAmount?: number;
  createdAt: string;
  updatedAt: string;
  guest?: {
    id: string;
    personId: string;
    guestType: string;
    professionDepartment?: string;
  };
  apart?: {
    id: string;
    name: string;
    address?: string;
    genderType: string;
  };
  season?: {
    id: string;
    name: string;
    code: string;
    status: 'active' | 'inactive';
  };
}

export interface ISeasonRegistrationProduct {
  id: string;
  tenantId: string;
  seasonRegistrationId: string;
  productId: string;
  priceId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  registration?: ISeasonRegistration;
  product?: {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    category?: {
      id: string;
      name: string;
    }
  };
  price?: {
    id: string;
    apartId: string;
    seasonCode: string;
    productId: string;
    price: number;
    currency: string;
  };
}

export interface ISeasonRegistrationProductDiscount {
  id: string;
  tenantId: string;
  seasonRegistrationProductId: string;
  discountRuleId: string;
  discountType: 'percentage' | 'fixed';
  discountRate?: number;
  discountAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  discountRule?: IDiscountRule;
  seasonRegistrationProduct?: ISeasonRegistrationProduct;
}

export interface IGuest {
  id: string;
  tenantId: string;
  personId: string;
  guestType: 'STUDENT' | 'EMPLOYEE' | 'OTHER';
  professionDepartment?: string;
  emergencyContact?: string;
  notes?: string;
  lastAccessDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  person?: {
    id: string;
    name: string;
    tcNo: string;
    phone: string;
    email?: string;
    birthDate: string;
  };
  guardians?: IGuardian[];
}

export interface IGuardian {
  id: string;
  tenantId: string;
  personId: string;
  guestId: string;
  relationship: string;
  isSelf: boolean;
  isEmergencyContact: boolean;
  validFrom: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  person?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface IGuardianHistory {
  id: string;
  tenantId: string;
  guestId: string;
  guardianId: string;
  validFrom: string;
  validTo: string;
  changeReason: string;
  createdAt: string;
  createdBy: string;
  guardian?: IGuardian;
  guest?: {
    id: string;
    personId: string;
    person?: {
      name: string;
    };
  };
}

export interface IAccessLog {
  id: string;
  actionType: 'CHECK_IN' | 'CHECK_OUT';
  location?: string;
  timestamp: string;
  notes?: string;
  person: {
    id: string;
    name: string;
    tcNo: string;
    phone: string;
    email?: string;
  };
  guest?: {
    id: string;
    guestType: string;
    status: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface IAccessMetrics {
  totalVisits: number;
  visitsByDate: {
    checkIns: Record<string, number>;
    checkOuts: Record<string, number>;
  };
  averageDurationMinutes: number;
  peakHours: Record<string, number>;
  mostActiveGuests?: Array<{
    id: string;
    name: string;
    visitCount: number;
  }>;
}

export interface IDocumentType {
  id: string;
  name: string;
  description?: string;
  templatePath?: string;
  requiredFields?: string[];
  isSystem: boolean;
  validityPeriod?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDocument {
  id: string;
  tenantId: string;
  ownerId: string;
  documentType: IDocumentType;
  type: 'UPLOADED' | 'SYSTEM_GENERATED';
  documentName: string;
  filePath: string;
  uploadDate: string;
  validUntil?: string;
  metadata?: Record<string, any>;
  status: 'active' | 'verified' | 'expired' | 'invalid';
  version?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoiceTitle {
  id: string;
  tenantId: string;
  seasonRegistrationId: string;
  titleType: 'corporate' | 'individual';
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  identityNumber?: string;
  firstName?: string;
  lastName?: string;
  address: string;
  phone: string;
  email?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentPlan {
  id: string;
  seasonRegistrationProductId: string;
  plannedPaymentTypeId: string;
  plannedPaymentType?: {
    id: string;
    name: string;
    bankName?: string;
    description?: string;
    status: string;
  };
  plannedAmount: number;
  plannedDate: string;
  isDeposit: boolean;
  depositRefundStatus?: 'not_refunded' | 'partially_refunded' | 'fully_refunded';
  status: 'planned' | 'paid' | 'partial_paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDepositDeduction {
  id: string;
  seasonRegistrationId: string;
  amount: number;
  reason: string;
  description?: string;
  evidencePhotoPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDepositSummary {
  depositAmount: number;
  totalDeductions: number;
  refundableAmount: number;
  deductionCount: number;
}

export interface IPayment {
  id: string;
  paymentPlanId: string;
  paymentTypeId: string;
  paymentType?: {
    id: string;
    name: string;
    bankName?: string;
    description?: string;
  };
  amount: number;
  paymentDate: string;
  approvalCode?: string;
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  seasonRegistrationId: string;
  invoiceTitleId: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  status: 'draft' | 'issued' | 'canceled';
  integrationStatus: 'pending' | 'sent' | 'error';
  integrationId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  details?: IInvoiceDetail[];
}

export interface IInvoiceDetail {
  id: string;
  invoiceId: string;
  seasonRegistrationProductId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  taxDetails?: IInvoiceTaxDetail[];
}

export interface IInvoiceTaxDetail {
  id: string;
  invoiceDetailId: string;
  taxTypeId: string;
  taxRate: number;
  taxAmount: number;
  createdAt: string;
  updatedAt: string;
}