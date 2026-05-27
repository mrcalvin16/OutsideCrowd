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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("merch")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("merch")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.union(v.float64(), v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    inventory: v.optional(v.union(v.float64(), v.string())),
    sizes: v.optional(
      v.array(
        v.union(
          v.string(),
          v.object({
            size: v.string(),
            inventory: v.float64(),
          })
        )
      )
    ),
    featured: v.optional(v.boolean()),
    limitedDrop: v.optional(v.boolean()),
    pickupAtEvent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("merch", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    merchId: v.id("merch"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.union(v.float64(), v.string())),
    imageStorageId: v.optional(v.id("_storage")),
    inventory: v.optional(v.union(v.float64(), v.string())),
    sizes: v.optional(
      v.array(
        v.union(
          v.string(),
          v.object({
            size: v.string(),
            inventory: v.float64(),
          })
        )
      )
    ),
    featured: v.optional(v.boolean()),
    limitedDrop: v.optional(v.boolean()),
    pickupAtEvent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { merchId, ...updates } = args;
    await ctx.db.patch(merchId, updates);
    return merchId;
  },
});

export const remove = mutation({
  args: {
    merchId: v.id("merch"),
  },
  handler: async (ctx, args) => {
    const merch = await ctx.db.get(args.merchId);

    if (!merch) {
      throw new Error("Merch item not found.");
    }

    if (merch.imageStorageId) {
      await ctx.storage.delete(merch.imageStorageId);
    }

    await ctx.db.delete(args.merchId);

    return { success: true };
  },
});

export const decrementInventory = mutation({
  args: {
    merchId: v.id("merch"),
    size: v.optional(v.string()),
    quantity: v.float64(),
  },
  handler: async (ctx, args) => {
    const merch = await ctx.db.get(args.merchId);

    if (!merch) {
      throw new Error("Merch not found.");
    }

    const quantity = args.quantity;

    if (quantity <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    if (args.size && merch.sizes && merch.sizes.length > 0) {
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

      const updatedSizes = normalizedSizes.map((variant) => {
        if (variant.size.toLowerCase() !== args.size!.toLowerCase()) {
          return variant;
        }

        return {
          ...variant,
          inventory: variant.inventory - quantity,
        };
      });

      await ctx.db.patch(args.merchId, {
        sizes: updatedSizes,
      });

      return { success: true };
    }

    const currentInventory = toNumber(merch.inventory, 0);

    if (currentInventory < quantity) {
      throw new Error("Item is sold out.");
    }

    await ctx.db.patch(args.merchId, {
      inventory: currentInventory - quantity,
    });

    return { success: true };
  },
});
