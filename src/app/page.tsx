import prisma from "@/lib/prisma";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

export default async function Home() {
  const users = await prisma.user.findMany();
  const bookings = await prisma.studioBooking.findMany();

  return (
    <main className="p-10 bg-[#f4f7f9] min-h-screen text-[#2C3E50]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#0A3A66]">Dove TV IT Portal</h1>
        
        {/* NEW CLERK SYNTAX HAPPENS HERE */}
        <div>
          <Show when="signed-out">
            <SignInButton mode="modal"><button className="bg-[#D32F2F] text-white px-4 py-2 rounded font-bold hover:bg-red-800 transition">Staff Login</button></SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-[#D32F2F]">System Status</h2>
        <p>Total Registered Users: <strong>{users.length}</strong></p>
        <p>Total Studio Bookings: <strong>{bookings.length}</strong></p>
      </div>
    </main>
  );
}