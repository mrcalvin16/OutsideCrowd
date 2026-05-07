import { redirect } from "next/navigation";

export default function CreateEventRedirectPage() {
  redirect("/host/create");
}