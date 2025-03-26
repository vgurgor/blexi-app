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