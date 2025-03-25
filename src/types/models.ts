export interface IUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  tenant_id: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  avatar?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICompany {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApartment {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  companyId: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IRoom {
  id: string;
  name: string;
  apartmentId: string;
  size: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IBed {
  id: string;
  name: string;
  roomId: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: 'apartment' | 'room' | 'bed';
  locationId: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFeature {
  id: string;
  name: string;
  category: 'apartment' | 'room' | 'bed';
  createdAt: string;
  updatedAt: string;
}