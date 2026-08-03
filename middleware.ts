import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/host(.*)",
  "/admin(.*)",
  "/create-event(.*)",
  "/my-tickets(.*)",
  "/saved-events(.*)",
  "/events/(.*)/checkout(.*)",
  "/events/(.*)/add-merch(.*)",
  "/events/(.*)/edit(.*)",
  "/events/(.*)/generate-flyer(.*)",
  "/events/(.*)/tickets(.*)",
  "/api/ai(.*)",
  "/api/boost(.*)",
  "/api/stripe/ticket-checkout(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
