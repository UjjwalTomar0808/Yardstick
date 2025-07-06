"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Tag, CalendarIcon, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { BudgetInput, Budget } from '@/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface BudgetFormProps {
  onSubmit: (budget: BudgetInput) => Promise<void>;
  onCancel?: () => void;
  editingBudget?: Budget | null;
  isLoading?: boolean;
}

export function BudgetForm({ onSubmit, onCancel, editingBudget, isLoading }: BudgetFormProps) {
  const [formData, setFormData] = useState<BudgetInput>(() => {
    if (editingBudget) {
      return {
        category: editingBudget.category,
        amount: editingBudget.amount,
        month: editingBudget.month
      };
    }
    return {
      category: '',
      amount: 0,
      month: format(new Date(), 'yyyy-MM')
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editingBudget ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {editingBudget ? 'Edit Budget' : 'Create New Budget'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, category: value }));
                  if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                }}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }} 
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={formData.amount || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Month */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Month
              </label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, month: e.target.value }));
                  if (errors.month) setErrors(prev => ({ ...prev, month: '' }));
                }}
                className={errors.month ? 'border-red-500' : ''}
              />
              {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : (editingBudget ? 'Update Budget' : 'Create Budget')}
            </Button>
            {(editingBudget || onCancel) && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}