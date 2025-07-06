import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Budget } from '@/lib/models/Budget';
import { Transaction } from '@/lib/models/Transaction';
import { BudgetInput, ApiResponse, Budget as BudgetType } from '@/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
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

    // Check if another budget exists for this category and month
    const existingBudget = await Budget.findOne({
      category: body.category,
      month: body.month,
      _id: { $ne: id }
    });

    if (existingBudget) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Budget already exists for this category and month' },
        { status: 409 }
      );
    }

    // Calculate current spending
    const startDate = `${body.month}-01`;
    const endDate = `${body.month}-31`;
    
    const expenses = await Transaction.find({
      category: body.category,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    });

    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const budget = await Budget.findByIdAndUpdate(
      id,
      {
        category: body.category,
        amount: Number(body.amount),
        month: body.month,
        spent
      },
      { new: true }
    );

    if (!budget) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<BudgetType>>({
      success: true,
      data: {
        ...budget.toObject(),
        _id: budget._id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const budget = await Budget.findByIdAndDelete(id);
    
    if (!budget) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<BudgetType>>({
      success: true,
      data: {
        ...budget.toObject(),
        _id: budget._id.toString()
      }
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}