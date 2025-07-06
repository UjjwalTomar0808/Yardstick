import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import { Budget } from '@/lib/models/Budget';
import { Transaction } from '@/lib/models/Transaction';
import { BudgetInput, ApiResponse, BudgetType } from '@/types';

interface BudgetDoc {
  _id: Types.ObjectId;
  category: string;
  amount: number;
  month: string;
  spent: number;
}

export async function GET() {
  try {
    await dbConnect();

    // Get budgets from DB with proper typing
    const budgets = await Budget.find()
      .sort({ month: -1, category: 1 })
      .lean<BudgetDoc[]>();

    // Convert _id from ObjectId to string
    const formattedBudgets: BudgetType[] = budgets.map((budget) => ({
      ...budget,
      _id: budget._id.toString(),
    }));

    return NextResponse.json<ApiResponse<BudgetType[]>>({
      success: true,
      data: formattedBudgets,
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body: BudgetInput = await req.json();

    // Validation
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.category || !body.month) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Category and month are required' },
        { status: 400 }
      );
    }

    // Check if budget already exists
    const existingBudget = await Budget.findOne({
      category: body.category,
      month: body.month,
    });

    if (existingBudget) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Budget already exists for this category and month' },
        { status: 409 }
      );
    }

    // Calculate spending for the category and month using proper date range
    const startDate = new Date(`${body.month}-01`);
    // Next month, but exclusive upper bound
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Transaction.find({
      category: body.category,
      type: 'expense',
      date: { $gte: startDate, $lt: endDate },
    });

    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const budget = new Budget({
      category: body.category,
      amount: Number(body.amount),
      month: body.month,
      spent,
    });

    await budget.save();

    return NextResponse.json<ApiResponse<BudgetType>>({
      success: true,
      data: {
        ...budget.toObject(),
        _id: budget._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
