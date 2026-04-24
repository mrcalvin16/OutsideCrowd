import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SellerDashboard from "@/components/SellerDashboard";

export default function SellerPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <SellerDashboard />;
}
