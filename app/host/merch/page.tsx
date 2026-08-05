"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Boxes, DollarSign, ExternalLink, PackageCheck, Plus, Search, ShoppingBag } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Tab = "catalog" | "orders";

export default function HostMerchPage() {
  const workspace = useQuery(api.merch.getOrganizerWorkspace, {});
  const updateFulfillment = useMutation(api.merch.updateFulfillment);
  const [tab, setTab] = useState<Tab>("catalog");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (workspace?.products ?? []).filter((product) => !query || `${product.name} ${product.eventName} ${product.sku ?? ""}`.toLowerCase().includes(query));
  }, [search, workspace]);
  const orders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (workspace?.orders ?? []).filter((order) => !query || `${order.buyerName ?? ""} ${order.buyerEmail ?? ""} ${order._id}`.toLowerCase().includes(query));
  }, [search, workspace]);

  async function setFulfillment(orderId: Id<"merchOrders">, fulfillmentStatus: "processing" | "ready_for_pickup" | "shipped" | "fulfilled") {
    setUpdating(orderId);
    try { await updateFulfillment({ orderId, fulfillmentStatus }); } finally { setUpdating(null); }
  }

  return <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Commerce operations</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Merch</h2><p className="mt-2 text-sm text-zinc-500">Manage products, inventory, orders, and fulfillment.</p></div><Link href="/host/merch/create" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-5 text-xs font-black hover:brightness-110"><Plus className="h-4 w-4" /> Create product</Link></div>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><Metric label="Products" value={workspace?.summary.products ?? 0} icon={ShoppingBag} /><Metric label="Published" value={workspace?.summary.published ?? 0} icon={ExternalLink} accent="text-emerald-400" /><Metric label="Inventory" value={workspace?.summary.inventory ?? 0} icon={Boxes} accent="text-orange-400" /><Metric label="Orders" value={workspace?.summary.orders ?? 0} icon={PackageCheck} /><Metric label="Net revenue" value={currency(workspace?.summary.revenue ?? 0)} icon={DollarSign} accent="text-emerald-400" /><Metric label="Est. profit" value={currency(workspace?.summary.profit ?? 0)} icon={DollarSign} accent="text-violet-400" /></section>

    <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035]">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2">{(["catalog", "orders"] as Tab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`min-h-11 rounded-xl px-5 text-xs font-black capitalize ${tab === item ? "bg-white text-black" : "border border-white/[0.08] text-zinc-500"}`}>{item}{item === "orders" && workspace?.summary.unfulfilled ? ` (${workspace.summary.unfulfilled})` : ""}</button>)}</div><label className="relative block w-full max-w-md"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${tab}`} className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-700" /></label></div>
      {workspace === undefined ? <Loading /> : tab === "catalog" ? products.length ? <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => {
        const stock = product.variants.length ? product.variants.reduce((sum, variant) => sum + Math.max(0, variant.inventory - variant.reserved - variant.sold), 0) : product.inventory ?? 0;
        const margin = product.unitCost === undefined ? null : product.price - product.unitCost;
        return <article key={product._id} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25"><div className="aspect-[16/8] bg-white/[0.04]">{product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ShoppingBag className="h-9 w-9 text-zinc-800" /></div>}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black">{product.name}</p><p className="mt-1 truncate text-xs text-zinc-600">{product.eventName} · {product.sku ?? "No SKU"}</p></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${product.status === "published" || product.isActive ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[0.05] text-zinc-500"}`}>{product.status ?? (product.isActive ? "published" : "draft")}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><Mini label="Price" value={currency(product.price)} /><Mini label="Stock" value={String(stock)} /><Mini label="Margin" value={margin === null ? "—" : currency(margin)} /></div><div className="mt-4 flex items-center justify-between"><p className="text-[10px] text-zinc-600">{product.variants.length} variant{product.variants.length === 1 ? "" : "s"} · {product.fulfillmentMethod ?? "pickup"}</p><Link href={`/host/events/${product.eventId}/merch/${product._id}/edit`} className="text-xs font-black text-violet-300 hover:text-orange-300">Edit →</Link></div></div></article>;
      })}</div> : <Empty title="No products found" text="Create your first fully managed merch product." /> : orders.length ? <div className="divide-y divide-white/[0.06]">{orders.map((order) => <article key={order._id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center"><div><p className="text-sm font-black">Order #{String(order._id).slice(-8).toUpperCase()}</p><p className="mt-1 text-xs text-zinc-600">{order.buyerName || "Customer"} · {order.buyerEmail || order.userId}</p></div><div className="text-sm lg:text-right"><p className="font-black text-orange-300">{currency(order.total)}</p><p className="mt-1 text-[10px] uppercase text-zinc-600">{order.quantity} item{order.quantity === 1 ? "" : "s"} · {order.fulfillmentStatus ?? "unfulfilled"}</p></div><select disabled={updating === order._id} value={order.fulfillmentStatus ?? "unfulfilled"} onChange={(event) => void setFulfillment(order._id, event.target.value as "processing" | "ready_for_pickup" | "shipped" | "fulfilled")} className="min-h-11 rounded-xl border border-white/[0.08] bg-[#0d0b13] px-3 text-xs font-bold"><option value="unfulfilled" disabled>Unfulfilled</option><option value="processing">Processing</option><option value="ready_for_pickup">Ready for pickup</option><option value="shipped">Shipped</option><option value="fulfilled">Fulfilled</option></select><Link href={`/host/merch/orders/${order._id}`} className="text-xs font-black text-violet-300">Details →</Link></article>)}</div> : <Empty title="No merch orders yet" text="Paid customer orders will appear here for fulfillment." />}
    </section>
  </div>;
}

function Metric({ label, value, icon: Icon, accent = "text-violet-400" }: { label: string; value: string | number; icon: typeof ShoppingBag; accent?: string }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold text-zinc-500">{label}</p><Icon className={`h-4 w-4 ${accent}`} /></div><p className="mt-3 text-2xl font-black">{typeof value === "number" ? value.toLocaleString() : value}</p></div>; }
function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/[0.035] p-2"><p className="text-[9px] uppercase text-zinc-700">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
function Loading() { return <div className="grid animate-pulse gap-4 p-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-white/[0.04]" />)}</div>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="px-6 py-16 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-zinc-700" /><p className="mt-4 text-sm font-black">{title}</p><p className="mt-1 text-xs text-zinc-600">{text}</p></div>; }
function currency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
