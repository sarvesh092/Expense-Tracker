"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { formatMoney } from "@/utils/formatMoney";

interface Expense {
  _id: string;
  amountCents: number;
  category: string;
  description: string;
  date: string;
  idempotencyKey: string;
  createdAt: string;
}

const CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Health",
  "Other",
];

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/expenses?sort_date=${sortOrder}`;
      if (filterCategory) {
        url += `&category=${encodeURIComponent(filterCategory)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, sortOrder]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          date,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create expense");
      }

      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory(CATEGORIES[0]);
      setIdempotencyKey(uuidv4());

      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  }, [expenses]);

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Expense Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Add Expense
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="What was this for?"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                Error: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2 px-4 rounded font-medium text-white transition-colors
                ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                }`}
            >
              {submitting ? "Saving..." : "Add Expense"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Idempotency Key: {idempotencyKey.slice(0, 8)}...
            </p>
          </form>
        </div>

        {/* List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Transactions
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="p-1 border border-gray-300 rounded text-sm bg-white"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filter:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-1 border border-gray-300 rounded text-sm bg-white"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total Expenses</span>
            <span className="text-2xl font-bold text-gray-800">
              {formatMoney(totalAmount)}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded border border-gray-100">
              No expenses found.
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="bg-white p-4 rounded shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="font-semibold text-gray-800">
                      {expense.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()} •{" "}
                      {expense.category}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 font-mono">
                    {formatMoney(expense.amountCents)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
