import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

type SizeVariant = string | { size: string; inventory: number };

function toNumber(value: number | string | undefined | null, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeSizeVariant(
  variant: SizeVariant,
  fallbackInventory = 999
): { size: string; inventory: number } {
  if (typeof variant === "string") {
    return {
      size: variant.toUpperCase(),
      inventory: fallbackInventory,
    };
  }

  return {
    size: variant.size,
    inventory: toNumber(variant.inventory, fallbackInventory),
  };
}

async function getUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You must be signed in.");
  }

  return identity.subject;
}

export const getMyCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    return await ctx.db
      .query("orderItems")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "cart")
      )
      .collect();
  },
});

export const addMerchToCart = mutation({
  args: {
    eventId: v.id("events"),
    merchId: v.id("merch"),
    quantity: v.optional(v.float64()),
    size: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const merch = await ctx.db.get(args.merchId);

    if (!merch) {
      throw new Error("Merch item not found.");
    }

    const quantity = args.quantity ?? 1;

    if (quantity <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    if (merch.sizes && merch.sizes.length > 0) {
      if (!args.size) {
        throw new Error("Please select a size.");
      }

      const fallbackInventory = toNumber(merch.inventory, 999);

      const normalizedSizes = merch.sizes.map((variant) =>
        normalizeSizeVariant(variant, fallbackInventory)
      );

      const selectedSize = normalizedSizes.find(
        (variant) =>
          variant.size.toLowerCase() === args.size!.toLowerCase()
      );

      if (!selectedSize) {
        throw new Error("Selected size is not available.");
      }

      if (selectedSize.inventory < quantity) {
        throw new Error(`${selectedSize.size} is sold out.`);
      }
    } else {
      const currentInventory = toNumber(merch.inventory, 0);

      if (currentInventory < quantity) {
        throw new Error("Item is sold out.");
      }
    }

    const existingItem = await ctx.db
      .query("orderItems")
      .withIndex("by_user_merch_status", (q) =>
        q
          .eq("userId", userId)
          .eq("merchId", args.merchId)
          .eq("status", "cart")
      )
      .first();

    if (existingItem && existingItem.size === args.size) {
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + quantity,
        updatedAt: Date.now(),
      });

      return existingItem._id;
    }

    return await ctx.db.insert("orderItems", {
      userId,
      eventId: args.eventId,
      merchId: args.merchId,
      size: args.size,
      quantity,
      price: merch.price ?? 0,
      status: "cart",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const removeCartItem = mutation({
  args: {
    orderItemId: v.id("orderItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const item = await ctx.db.get(args.orderItemId);

    if (!item) {
      throw new Error("Cart item not found.");
    }

    if (item.userId !== userId) {
      throw new Error("Not authorized.");
    }

    await ctx.db.delete(args.orderItemId);

    return { success: true };
  },
});

export const updateCartItemQuantity = mutation({
  args: {
    orderItemId: v.id("orderItems"),
    quantity: v.float64(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    if (args.quantity <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    const item = await ctx.db.get(args.orderItemId);

    if (!item) {
      throw new Error("Cart item not found.");
    }

    if (item.userId !== userId) {
      throw new Error("Not authorized.");
    }

    await ctx.db.patch(args.orderItemId, {
      quantity: args.quantity,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
