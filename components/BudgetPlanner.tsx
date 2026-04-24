"use client";

import { useState } from "react";

type BudgetItem = {
  name: string;
  amount: number;
  type: "expense" | "income";
  notes: string;
};

export default function BudgetPlanner() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [item, setItem] = useState<BudgetItem>({
    name: "",
    amount: 0,
    type: "expense",
    notes: "",
  });

  const addItem = () => {
    if (!item.name || !item.amount) return;
    setItems([...items, item]);
    setItem({ name: "", amount: 0, type: "expense", notes: "" });
  };

  const totalIncome = items
    .filter((i) => i.type === "income")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = items
    .filter((i) => i.type === "expense")
    .reduce((sum, i) => sum + i.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 mt-10">
      <h2 className="text-2xl font-black mb-4">Event Budget Planner</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Income</p>
          <p className="text-2xl font-black text-green-400">${totalIncome}</p>
        </div>
        <div className="bg-black rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Expenses</p>
          <p className="text-2xl font-black text-red-400">${totalExpenses}</p>
        </div>
        <div className="bg-black rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Balance</p>
          <p className={`text-2xl font-black ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${balance}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-5">
        <input
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          placeholder="Item name"
          className="bg-zinc-900 border border-white/10 rounded-xl p-3"
        />

        <input
          type="number"
          value={item.amount || ""}
          onChange={(e) => setItem({ ...item, amount: Number(e.target.value) })}
          placeholder="Amount"
          className="bg-zinc-900 border border-white/10 rounded-xl p-3"
        />

        <select
          value={item.type}
          onChange={(e) => setItem({ ...item, type: e.target.value as "expense" | "income" })}
          className="bg-zinc-900 border border-white/10 rounded-xl p-3"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <button onClick={addItem} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">
          Add Item
        </button>
      </div>

      <textarea
        value={item.notes}
        onChange={(e) => setItem({ ...item, notes: e.target.value })}
        placeholder="Notes about this budget item..."
        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 mb-5"
      />

      <div className="space-y-3">
        {items.map((i, index) => (
          <div key={index} className="bg-zinc-900 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{i.name}</p>
                <p className="text-sm text-zinc-400">{i.notes}</p>
              </div>
              <p className={i.type === "income" ? "text-green-400 font-black" : "text-red-400 font-black"}>
                {i.type === "income" ? "+" : "-"}${i.amount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
