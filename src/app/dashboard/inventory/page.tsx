import { syncCurrentUser } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const dbUser = await syncCurrentUser();
  if (!dbUser) redirect('/');

  const isManager = dbUser.role === 'ENG_MGR' || dbUser.role === 'HOU';

  // Fetch all equipment for catalogue display
  const equipment = await prisma.equipment.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  });

  // Fetch PENDING checkouts (managers need to approve/reject)
  const pendingCheckouts = isManager
    ? await prisma.equipmentCheckout.findMany({
        where: { status: 'PENDING' },
        include: {
          requester: { select: { name: true, email: true } },
          equipment: { select: { name: true, category: true } }
        },
        orderBy: { createdAt: 'asc' }
      })
    : [];

  // Fetch APPROVED checkouts (gear that's out — can be returned)
  // Managers see all; staff see only their own
  const activeCheckouts = await prisma.equipmentCheckout.findMany({
    where: {
      status: 'APPROVED',
      ...(isManager ? {} : { requesterId: dbUser.id })
    },
    include: {
      requester: { select: { name: true, email: true } },
      equipment: { select: { name: true, category: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Serialize dates to strings for client component boundary
  const serializedEquipment = equipment.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  const serializedCheckouts = pendingCheckouts.map(c => ({
    ...c,
    expectedReturnDate: c.expectedReturnDate.toISOString(),
    actualReturnDate: c.actualReturnDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const serializedActiveCheckouts = activeCheckouts.map(c => ({
    ...c,
    expectedReturnDate: c.expectedReturnDate.toISOString(),
    actualReturnDate: c.actualReturnDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <svg className="w-10 h-10 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory Management </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
              {isManager
                ? 'Manage equipment inventory and approve checkout requests.'
                : 'Browse available equipment and request a checkout.'}
            </p>
          </div>
        </div>
      </div>

      <InventoryClient
        equipment={serializedEquipment as any}
        pendingCheckouts={serializedCheckouts as any}
        activeCheckouts={serializedActiveCheckouts as any}
        isManager={isManager}
      />
    </div>
  );
}
