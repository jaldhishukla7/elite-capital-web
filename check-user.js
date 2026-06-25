const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mobile = '6354763027';
  console.log('Searching for user with mobile:', mobile);
  try {
    const user = await prisma.user.findUnique({ where: { mobile } });
    if (user) {
      console.log('User found:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isProfileComplete: user.isProfileComplete,
        passwordHash: user.passwordHash ? 'present' : 'missing'
      });
    } else {
      console.log('User NOT found with mobile:', mobile);
    }
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
