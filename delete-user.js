const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Change these to match the user you want to find/delete
const SEARCH_TERM = 'jaldhi'; // Can be email, mobile, or name

async function main() {
  console.log(`Searching for users matching "${SEARCH_TERM}"...`);
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: SEARCH_TERM, mode: 'insensitive' } },
        { firstName: { contains: SEARCH_TERM, mode: 'insensitive' } },
        { mobile: { contains: SEARCH_TERM } }
      ]
    }
  });

  if (users.length === 0) {
    console.log('No matching users found.');
    return;
  }

  console.log(`Found ${users.length} matching user(s):`);
  users.forEach(u => {
    console.log(`- ID: ${u.id} | Name: ${u.firstName} ${u.lastName} | Email: ${u.email} | Mobile: ${u.mobile}`);
  });

  console.log('\nDeleting matching user(s)...');
  const deleteResult = await prisma.user.deleteMany({
    where: {
      id: { in: users.map(u => u.id) }
    }
  });

  console.log(`Successfully deleted ${deleteResult.count} user record(s) and their cascading relations.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
