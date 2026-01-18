import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency-Key header is required" },
        { status: 400 },
      );
    }

    const existingExpense = await Expense.findOne({ idempotencyKey });
    if (existingExpense) {
      return NextResponse.json(existingExpense, { status: 200 });
    }

    const body = await request.json();
    const { amount, category, description, date } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    const amountCents = Math.round(Number(amount) * 100);

    const expense = await Expense.create({
      amountCents,
      category,
      description,
      date: new Date(date),
      idempotencyKey,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    if (error.code === 11000) {
      const existing = await Expense.findOne({
        idempotencyKey: request.headers.get("Idempotency-Key"),
      });
      return NextResponse.json(existing, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const sortDate = searchParams.get("sort_date");

    const query: any = {};
    if (category) {
      query.category = category;
    }

    const sort: any = {};
    if (sortDate === "desc" || !sortDate) {
      sort.date = -1;
    } else {
      sort.date = 1;
    }

    sort.createdAt = -1;

    const expenses = await Expense.find(query).sort(sort);

    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
