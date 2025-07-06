import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  date: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
  }
}, {
  timestamps: true
});

// Index for better query performance
TransactionSchema.index({ date: -1, category: 1 });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);