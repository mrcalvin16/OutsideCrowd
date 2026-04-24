import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <SignIn />
    </main>
  );
}
