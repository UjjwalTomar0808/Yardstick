import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { name: 'Food & Dining', color: '#e74c3c', icon: 'Utensils' },
  { name: 'Transportation', color: '#3498db', icon: 'Car' },
  { name: 'Shopping', color: '#9b59b6', icon: 'ShoppingCart' },
  { name: 'Entertainment', color: '#f39c12', icon: 'Gamepad2' },
  { name: 'Healthcare', color: '#2ecc71', icon: 'Heart' },
  { name: 'Housing', color: '#34495e', icon: 'Home' },
  { name: 'Education', color: '#16a085', icon: 'GraduationCap' },
  { name: 'Personal Care', color: '#e67e22', icon: 'Coffee' },
  { name: 'Travel', color: '#8e44ad', icon: 'Plane' },
  { name: 'Gifts & Donations', color: '#c0392b', icon: 'Gift' },
  { name: 'Clothing', color: '#d35400', icon: 'Shirt' },
  { name: 'Income', color: '#27ae60', icon: 'DollarSign' },
  { name: 'Other', color: '#7f8c8d', icon: 'DollarSign' }
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(cat => cat.name !== 'Income');
export const INCOME_CATEGORIES = [CATEGORIES.find(cat => cat.name === 'Income')!];

export const getCategoryColor = (categoryName: string): string => {
  return CATEGORIES.find(cat => cat.name === categoryName)?.color || '#7f8c8d';
};

export const getCategoryIcon = (categoryName: string): string => {
  return CATEGORIES.find(cat => cat.name === categoryName)?.icon || 'DollarSign';
};