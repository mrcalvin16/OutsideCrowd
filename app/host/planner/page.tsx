"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Expense = {
  id: number;
  name: string;
  category: string;
  amount: string;
};

const expenseCategories = [
  "Venue",
  "Talent",
  "Marketing",
  "Security",
  "Staffing",
  "Production",
  "Decor",
  "Food & Beverage",
  "Merch",
  "Other",
];

export default function HostPlannerPage() {
  const [notes, setNotes] = useState("");
  const [todoText, setTodoText] = useState("");

  const [ticketPrice, setTicketPrice] = useState("35");
  const [projectedTickets, setProjectedTickets] = useState("100");
  const [platformFee, setPlatformFee] = useState("7");

  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Venue");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [todos, setTodos] = useState<Todo[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const projectedGross = Number(ticketPrice || 0) * Number(projectedTickets || 0);
  const projectedFees = projectedGross * (Number(platformFee || 0) / 100);
  const projectedNet = projectedGross - projectedFees;

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  }, [expenses]);

  const projectedProfit = projectedNet - totalExpenses;

  function addTodo() {
    if (!todoText.trim()) return;

    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: todoText.trim(),
        done: false,
      },
    ]);

    setTodoText("");
  }

  function addExpense() {
    if (!expenseName.trim() || !expenseAmount.trim()) return;

    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: expenseName.trim(),
        category: expenseCategory,
        amount: expenseAmount,
      },
    ]);

    setExpenseName("");
    setExpenseAmount("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black px-5 py-8 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-orange-500/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-white/10 blur-[150px]" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-300">
                OutsideCrowd Command Center
              </p>

              <h1 className="mt-3 text-5xl font-black tracking-tight">
                Budget Planner
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Plan expenses, project revenue, track tasks, and keep organizer notes in one place.
              </p>
            </div>

            <Link
              href="/host"
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black hover:border-orange-400/50"
            >
              Back to Host Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat title="Projected Gross" value={`$${projectedGross.toLocaleString()}`} />
          <Stat title="Platform Fees" value={`$${Math.round(projectedFees).toLocaleString()}`} />
          <Stat title="Expenses" value={`$${totalExpenses.toLocaleString()}`} />
          <Stat
            title="Projected Profit"
            value={`$${Math.round(projectedProfit).toLocaleString()}`}
            positive={projectedProfit >= 0}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black">Projected Revenue</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field
                label="Ticket Price"
                value={ticketPrice}
                setValue={setTicketPrice}
                type="number"
              />

              <Field
                label="Projected Tickets"
                value={projectedTickets}
                setValue={setProjectedTickets}
                type="number"
              />

              <Field
                label="Platform Fee %"
                value={platformFee}
                setValue={setPlatformFee}
                type="number"
              />
            </div>

            <div className="mt-6 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-5">
              <p className="text-sm font-bold text-orange-200">
                Estimated net revenue after platform fees
              </p>
              <p className="mt-2 text-5xl font-black">
                ${Math.round(projectedNet).toLocaleString()}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black">To-Do List</h2>

            <div className="mt-5 flex gap-3">
              <input
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Add task..."
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-400"
              />

              <button
                type="button"
                onClick={addTodo}
                className="rounded-2xl bg-white px-5 py-3 font-black text-black"
              >
                Add
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {todos.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">
                  No tasks yet.
                </p>
              ) : (
                todos.map((todo) => (
                  <button
                    key={todo.id}
                    type="button"
                    onClick={() =>
                      setTodos((prev) =>
                        prev.map((item) =>
                          item.id === todo.id ? { ...item, done: !item.done } : item
                        )
                      )
                    }
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black p-4 text-left"
                  >
                    <span
                      className={`h-5 w-5 rounded-full border ${
                        todo.done
                          ? "border-orange-400 bg-orange-400"
                          : "border-white/30"
                      }`}
                    />
                    <span className={todo.done ? "text-zinc-500 line-through" : ""}>
                      {todo.text}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black">Expense Tracking</h2>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_160px_auto]">
              <input
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Expense name"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-400"
              />

              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-400"
              >
                {expenseCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <input
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                type="number"
                min="0"
                placeholder="Amount"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-400"
              />

              <button
                type="button"
                onClick={addExpense}
                className="rounded-2xl bg-orange-500 px-5 py-3 font-black text-black"
              >
                Add
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {expenses.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">
                  No expenses added yet.
                </p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black p-4"
                  >
                    <div>
                      <p className="font-black">{expense.name}</p>
                      <p className="text-xs text-zinc-500">{expense.category}</p>
                    </div>

                    <p className="font-black text-orange-300">
                      ${Number(expense.amount || 0).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black">Planning Notes</h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vendor notes, staffing plans, marketing ideas, venue reminders, sponsor details..."
              className="mt-5 min-h-[370px] w-full rounded-3xl border border-white/10 bg-black p-5 leading-7 text-white outline-none focus:border-orange-400"
            />
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({
  title,
  value,
  positive = true,
}: {
  title: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <p className={`mt-3 text-3xl font-black ${positive ? "text-white" : "text-red-300"}`}>
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  type = "text",
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-400"
      />
    </div>
  );
}
