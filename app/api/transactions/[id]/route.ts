import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { TransactionInput, ApiResponse, Transaction as TransactionType } from '@/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body: TransactionInput = await req.json();
    
    // Validation
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (!body.date || !body.description?.trim() || !body.category) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      {
        amount: Number(body.amount),
        date: body.date,
        description: body.description.trim(),
        category: body.category,
        type: body.type || 'expense'
      },
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<TransactionType>>({
      success: true,
      data: {
        ...transaction.toObject(),
        _id: transaction._id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to update transaction' },
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
    
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<TransactionType>>({
      success: true,
      data: {
        ...transaction.toObject(),
        _id: transaction._id.toString()
      }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}