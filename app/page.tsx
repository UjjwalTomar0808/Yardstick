"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  BarChart3, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Moon, 
  Sun,
  Loader2 
} from 'lucide-react';

import { Dashboard } from '@/components/Dashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { BudgetForm } from '@/components/BudgetForm';
import { BudgetTracker } from '@/components/BudgetTracker';
import { InsightsPanel } from '@/components/InsightsPanel';

import { 
  Transaction, 
  TransactionInput, 
  Budget, 
  BudgetInput, 
  DashboardStats, 
  BudgetComparison,
  ApiResponse
} from '@/types';

export default function Home() {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalIncome: 0,
    netAmount: 0,
    transactionCount: 0,
    categoryBreakdown: [],
    monthlyData: []
  });
  const [budgetComparisons, setBudgetComparisons] = useState<BudgetComparison[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Theme management
  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Data fetching functions
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions');
      const data: ApiResponse<Transaction[]> = await response.json();
      
      if (data.success && data.data) {
        setTransactions(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch('/api/budgets');
      const data: ApiResponse<Budget[]> = await response.json();
      
      if (data.success && data.data) {
        setBudgets(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch budgets');
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data: ApiResponse<DashboardStats> = await response.json();
      
      if (data.success && data.data) {
        setDashboardStats(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  }, []);

  // Calculate budget comparisons
  const calculateBudgetComparisons = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    
    const comparisons: BudgetComparison[] = currentMonthBudgets.map(budget => {
      const spent = budget.spent;
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;
      
      let status: BudgetComparison['status'] = 'under';
      if (percentage >= 100) {
        status = 'over';
      } else if (percentage >= 80) {
        status = 'near';
      }
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        status
      };
    });
    
    setBudgetComparisons(comparisons);
  }, [budgets]);

  // Load initial data
  useEffect(() => {
    if (mounted) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchTransactions(),
            fetchBudgets(),
            fetchDashboardData()
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [mounted, fetchTransactions, fetchBudgets, fetchDashboardData]);

  // Update budget comparisons when budgets change
  useEffect(() => {
    calculateBudgetComparisons();
  }, [calculateBudgetComparisons]);

  // Transaction management
  const handleTransactionSubmit = async (transactionData: TransactionInput) => {
    setIsLoading(true);
    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction._id}`
        : '/api/transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      
      const data: ApiResponse<Transaction> = await response.json();
      
      if (data.success) {
        await Promise.all([fetchTransactions(), fetchDashboardData(), fetchBudgets()]);
        setEditingTransaction(null);
        toast.success(editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!');
      } else {
        throw new Error(data.error || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      const data: ApiResponse<Transaction> = await response.json();
      
      if (data.success) {
        await Promise.all([fetchTransactions(), fetchDashboardData(), fetchBudgets()]);
        toast.success('Transaction deleted successfully!');
      } else {
        throw new Error(data.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Budget management
  const handleBudgetSubmit = async (budgetData: BudgetInput) => {
    setIsLoading(true);
    try {
      const url = editingBudget 
        ? `/api/budgets/${editingBudget._id}`
        : '/api/budgets';
      
      const method = editingBudget ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });
      
      const data: ApiResponse<Budget> = await response.json();
      
      if (data.success) {
        await fetchBudgets();
        setEditingBudget(null);
        toast.success(editingBudget ? 'Budget updated successfully!' : 'Budget created successfully!');
      } else {
        throw new Error(data.error || 'Failed to save budget');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save budget');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      const data: ApiResponse<Budget> = await response.json();
      
      if (data.success) {
        await fetchBudgets();
        toast.success('Budget deleted successfully!');
      } else {
        throw new Error(data.error || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete budget');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Personal Finance Visualizer</h1>
                <p className="text-sm text-muted-foreground">Track, Budget, and Analyze Your Finances</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {isLoading && transactions.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Dashboard stats={dashboardStats} />
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransactionForm
                  onSubmit={handleTransactionSubmit}
                  onCancel={() => setEditingTransaction(null)}
                  editingTransaction={editingTransaction}
                  isLoading={isLoading}
                />
              </div>
              <div className="lg:col-span-2">
                <TransactionList
                  transactions={transactions}
                  onEdit={setEditingTransaction}
                  onDelete={handleTransactionDelete}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <BudgetForm
                  onSubmit={handleBudgetSubmit}
                  onCancel={() => setEditingBudget(null)}
                  editingBudget={editingBudget}
                  isLoading={isLoading}
                />
              </div>
              <div className="lg:col-span-2">
                <BudgetTracker
                  budgets={budgets}
                  budgetComparisons={budgetComparisons}
                  onEdit={setEditingBudget}
                  onDelete={handleBudgetDelete}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <InsightsPanel
              stats={dashboardStats}
              budgetComparisons={budgetComparisons}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}