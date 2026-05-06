import { prisma } from "../lib/prisma";
import { seedDatabase } from "../lib/seed-database";

seedDatabase()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
