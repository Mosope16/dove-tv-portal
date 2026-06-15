import prisma from './src/lib/prisma';
async function run() {
  try {
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { name: 'Test' },
      create: { email: 'test@example.com', name: 'Test' }
    });
    console.log("SUCCESS");
  } catch(e) {
    console.error("ERROR:");
    console.error(e);
  }
}
run();
