import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { ApiResponse, DashboardStats, CategoryBreakdown, MonthlyData } from '@/types';
import { getCategoryColor } from '@/lib/constants';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all transactions
    const transactions = await Transaction.find().sort({ date: -1 });
    
    // Calculate totals
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    
    // Category breakdown for expenses
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(transaction => {
      categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
    });
    
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: getCategoryColor(category)
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Monthly data for the last 6 months
    const monthlyTotals: Record<string, { expenses: number; income: number }> = {};
    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { expenses: 0, income: 0 };
      }
      
      if (transaction.type === 'expense') {
        monthlyTotals[month].expenses += transaction.amount;
      } else {
        monthlyTotals[month].income += transaction.amount;
      }
    });
    
    const monthlyData: MonthlyData[] = Object.entries(monthlyTotals)
      .map(([month, data]) => ({
        month,
        expenses: data.expenses,
        income: data.income,
        net: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
    
    const dashboardStats: DashboardStats = {
      totalExpenses,
      totalIncome,
      netAmount,
      transactionCount: transactions.length,
      categoryBreakdown,
      monthlyData
    };
    
    return NextResponse.json<ApiResponse<DashboardStats>>({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}