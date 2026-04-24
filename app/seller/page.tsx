import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SellerDashboard from "@/components/SellerDashboard";

export default async function SellerPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <SellerDashboard />;
}
