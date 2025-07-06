"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Budget, BudgetComparison } from '@/types';
import { getCategoryColor } from '@/lib/constants';
import { format } from 'date-fns';

interface BudgetTrackerProps {
  budgets: Budget[];
  budgetComparisons: BudgetComparison[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function BudgetTracker({ 
  budgets, 
  budgetComparisons, 
  onEdit, 
  onDelete, 
  isLoading 
}: BudgetTrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy');
  };

  const getStatusIcon = (status: BudgetComparison['status']) => {
    switch (status) {
      case 'under':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'near':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'over':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 75) return 'bg-green-500';
    if (percentage <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No budgets set</p>
            <p className="text-sm">Create your first budget to track spending</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Progress */}
      {budgetComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress (Current Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetComparisons.map((comparison) => (
                <div key={comparison.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: getCategoryColor(comparison.category) }}
                      />
                      <span className="font-medium">{comparison.category}</span>
                      {getStatusIcon(comparison.status)}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(comparison.spent)} / {formatCurrency(comparison.budgeted)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {comparison.remaining >= 0 ? 'Remaining' : 'Over by'}: {formatCurrency(Math.abs(comparison.remaining))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={Math.min(comparison.percentage, 100)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{comparison.percentage.toFixed(1)}% used</span>
                      <span className={
                        comparison.status === 'over' ? 'text-red-600' : 
                        comparison.status === 'near' ? 'text-yellow-600' : 'text-green-600'
                      }>
                        {comparison.status === 'over' ? 'Over budget' : 
                         comparison.status === 'near' ? 'Near limit' : 'On track'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div 
                key={budget._id} 
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Category Color Indicator */}
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: getCategoryColor(budget.category) }}
                  />
                  
                  {/* Budget Details */}
                  <div className="flex-1">
                    <div className="font-medium">{budget.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatMonth(budget.month)}
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(budget.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Spent: {formatCurrency(budget.spent)}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(budget)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(budget._id)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}