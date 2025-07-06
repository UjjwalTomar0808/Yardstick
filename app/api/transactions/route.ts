import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { TransactionInput, ApiResponse, Transaction as TransactionType } from '@/types';

export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 }).lean();
    
    const formattedTransactions = transactions.map(tx => ({
      ...tx,
      _id: tx._id.toString()
    }));

    return NextResponse.json<ApiResponse<TransactionType[]>>({
      success: true,
      data: formattedTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
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

    const transaction = new Transaction({
      amount: Number(body.amount),
      date: body.date,
      description: body.description.trim(),
      category: body.category,
      type: body.type || 'expense'
    });

    await transaction.save();

    return NextResponse.json<ApiResponse<TransactionType>>({
      success: true,
      data: {
        ...transaction.toObject(),
        _id: transaction._id.toString()
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}