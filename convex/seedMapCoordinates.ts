import { mutation } from "./_generated/server";

const coords = [
  { latitude: 29.9511, longitude: -90.0715, city: "New Orleans", state: "LA" },
  { latitude: 30.2752, longitude: -89.7812, city: "Slidell", state: "LA" },
  { latitude: 29.9510, longitude: -90.0679, city: "French Quarter", state: "LA" },
  { latitude: 29.9634, longitude: -90.0570, city: "Marigny", state: "LA" },
  { latitude: 29.9347, longitude: -90.1218, city: "Uptown", state: "LA" },
];

export const seedEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const point = coords[i % coords.length];

      await ctx.db.patch(event._id, {
        latitude: event.latitude ?? point.latitude,
        longitude: event.longitude ?? point.longitude,
        city: event.city || point.city,
        state: event.state || point.state,
        venueName: event.venueName || event.location || "Venue TBA",
      });
    }

    return {
      updated: events.length,
    };
  },
});
