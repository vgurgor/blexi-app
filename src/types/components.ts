import { ReactNode } from 'react';
import { 
  IApartment, 
  IBed, 
  ICompany, 
  IFeature, 
  IInventoryItem, 
  IRoom 
} from './models';

export interface LayoutProps {
  children: ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

export interface CardProps<T> {
  data: T;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export type CompanyCardProps = CardProps<ICompany>;
export type ApartmentCardProps = CardProps<IApartment>;
export type RoomCardProps = CardProps<IRoom>;
export type BedCardProps = CardProps<IBed>;

export interface FormProps<T> {
  initialData?: Partial<T>;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
}

export interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  filters?: Record<string, any>;
  filterOptions?: Record<string, any[]>;
}