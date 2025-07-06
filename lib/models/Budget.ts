import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/ // Format: YYYY-MM
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure unique budget per category per month
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);