"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { SpendingInsight, DashboardStats, BudgetComparison } from '@/types';

interface InsightsPanelProps {
  stats: DashboardStats;
  budgetComparisons: BudgetComparison[];
}

export function InsightsPanel({ stats, budgetComparisons }: InsightsPanelProps) {
  const generateInsights = (): SpendingInsight[] => {
    const insights: SpendingInsight[] = [];

    // Budget-related insights
    const overBudgetCategories = budgetComparisons.filter(b => b.status === 'over');
    const nearBudgetCategories = budgetComparisons.filter(b => b.status === 'near');

    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Budget Exceeded',
        description: `You've exceeded your budget in ${overBudgetCategories.length} ${
          overBudgetCategories.length === 1 ? 'category' : 'categories'
        }: ${overBudgetCategories.map(c => c.category).join(', ')}.`,
        action: 'Review spending in these categories'
      });
    }

    if (nearBudgetCategories.length > 0) {
      insights.push({
        type: 'tip',
        title: 'Approaching Budget Limit',
        description: `You're near your budget limit in ${nearBudgetCategories.map(c => c.category).join(', ')}.`,
        action: 'Monitor these categories closely'
      });
    }

    // Spending pattern insights
    if (stats.categoryBreakdown.length > 0) {
      const topCategory = stats.categoryBreakdown[0];
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'tip',
          title: 'High Concentration in One Category',
          description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your expenses.`,
          action: 'Consider diversifying your spending or reviewing this category'
        });
      }
    }

    // Income vs Expenses
    if (stats.netAmount < 0) {
      insights.push({
        type: 'warning',
        title: 'Spending Exceeds Income',
        description: `Your total expenses exceed income by $${Math.abs(stats.netAmount).toFixed(0)}.`,
        action: 'Consider reducing expenses or increasing income'
      });
    } else if (stats.netAmount > 0) {
      insights.push({
        type: 'success',
        title: 'Positive Balance',
        description: `Great job! You have a positive balance of $${stats.netAmount.toFixed(0)}.`,
        action: 'Consider saving or investing this surplus'
      });
    }

    // Monthly trend insights
    if (stats.monthlyData.length >= 2) {
      const lastMonth = stats.monthlyData[stats.monthlyData.length - 1];
      const previousMonth = stats.monthlyData[stats.monthlyData.length - 2];
      
      if (lastMonth.expenses > previousMonth.expenses * 1.2) {
        insights.push({
          type: 'warning',
          title: 'Increased Spending',
          description: `Your expenses increased by ${(((lastMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100).toFixed(1)}% last month.`,
          action: 'Review recent transactions for unusual spending'
        });
      }
    }

    // If no specific insights, provide general tips
    if (insights.length === 0) {
      insights.push({
        type: 'tip',
        title: 'Stay on Track',
        description: 'Your finances look healthy! Keep tracking your expenses and reviewing your budgets regularly.',
        action: 'Consider setting new financial goals'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const getInsightIcon = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'tip':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm mb-2">{insight.description}</p>
                    {insight.action && (
                      <p className="text-xs font-medium opacity-80">
                        💡 {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-lg font-semibold">
                {stats.categoryBreakdown.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Categories
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-lg font-semibold">
                {budgetComparisons.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Budgets
              </div>
            </div>
          </div>
          
          {stats.categoryBreakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Top Spending Category</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stats.categoryBreakdown[0].color }}
                  />
                  <span className="text-sm">{stats.categoryBreakdown[0].category}</span>
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(stats.categoryBreakdown[0].amount)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}