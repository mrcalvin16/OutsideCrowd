"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const budgetCategories = ["Venue","DJ","Security","Restrooms","Marketing","Staff","Food","Decor","Misc"];

export default function BudgetPlanner({ eventId }: any) {
  const { user } = useUser();
  const items = useQuery(api.budget.getItems, { eventId }) || [];
  const addBudgetItem = useMutation(api.budget.addItem);
  const deleteBudgetItem = useMutation(api.budget.deleteItem);

  const [item, setItem] = useState({
    name: "",
    amount: "",
    type: "expense",
    notes: "",
  });

  const addItem = async () => {
    if (!user || !item.name || !item.amount) return;

    await addBudgetItem({
      eventId,
      userId: user.id,
      name: item.name,
      amount: Number(item.amount),
      type: item.type as "expense" | "income",
      notes: item.notes,
    });

    setItem({ name: "", amount: "", type: "expense", notes: "" });
  };

  const income = items.filter((i:any) => i.type === "income").reduce((s:number, i:any) => s + i.amount, 0);
  const expenses = items.filter((i:any) => i.type === "expense").reduce((s:number, i:any) => s + i.amount, 0);
  const balance = income - expenses;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 mt-10">
      <h2 className="text-2xl font-black mb-4">Event Budget Planner</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black rounded-xl p-4"><p className="text-zinc-500 text-sm">Income</p><p className="text-2xl font-black text-green-400">${income}</p></div>
        <div className="bg-black rounded-xl p-4"><p className="text-zinc-500 text-sm">Expenses</p><p className="text-2xl font-black text-red-400">${expenses}</p></div>
        <div className="bg-black rounded-xl p-4"><p className="text-zinc-500 text-sm">Balance</p><p className="text-2xl font-black">${balance}</p></div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-3">
        <select
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          className="bg-zinc-900 border border-white/10 rounded-xl p-3"
        >
          <option value="">Select category</option>
          {budgetCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input value={item.amount} onChange={(e) => setItem({ ...item, amount: e.target.value })} placeholder="Amount" type="number" className="bg-zinc-900 border border-white/10 rounded-xl p-3" />
        <select value={item.type} onChange={(e) => setItem({ ...item, type: e.target.value })} className="bg-zinc-900 border border-white/10 rounded-xl p-3">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button onClick={addItem} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">Add Item</button>
      </div>

      <textarea value={item.notes} onChange={(e) => setItem({ ...item, notes: e.target.value })} placeholder="Notes..." className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 mb-5" />

      <div className="space-y-3">
        {items.map((i:any) => (
          <div key={i._id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex justify-between">
            <div><p className="font-bold">{i.name}</p><p className="text-sm text-zinc-400">{i.notes}</p></div>
            <div className="text-right">
              <p className={i.type === "income" ? "text-green-400 font-black" : "text-red-400 font-black"}>
                {i.type === "income" ? "+" : "-"}${i.amount}
              </p>
              <button onClick={() => deleteBudgetItem({ itemId: i._id })} className="text-xs text-zinc-500 hover:text-red-400 mt-2">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
