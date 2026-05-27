export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://quiet-garfish-30.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
