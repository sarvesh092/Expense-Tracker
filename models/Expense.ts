import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
  amountCents: number;
  category: string;
  description: string;
  date: Date;
  idempotencyKey: string;
  createdAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  amountCents: {
    type: Number,
    required: [true, "Please provide an amount in cents"],
    min: [0, "Amount must be non-negative"],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, "Please provide a date"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "Please provide an idempotency key"],
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
