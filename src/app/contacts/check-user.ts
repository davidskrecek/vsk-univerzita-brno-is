import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  
  const email = "davidskrecek@gmail.com";
  
  console.log(`Checking user: ${email}...`);
  
  const editor = await prisma.editor.findFirst({
    where: { personnel: { email } },
    include: { personnel: true }
  });

  if (!editor) {
    console.error("❌ User NOT found in database!");
    const all = await prisma.personnel.findMany({ select: { email: true } });
    console.log("Available emails:", all.map(a => a.email).join(", "));
    return;
  }

  console.log("✅ User found!");
  const password = "Heslo123!";
  const isValid = await bcrypt.compare(password, editor.passwordHash);
  
  console.log(`Test comparison for 'Heslo123!': ${isValid ? "MATCHES" : "DOES NOT MATCH"}`);
  
  if (!isValid) {
      console.log("Regenerating hash for this session...");
      const newHash = await bcrypt.hash(password, 12);
      await prisma.editor.update({
          where: { personnelId: editor.personnelId },
          data: { passwordHash: newHash, failedLoginAttempts: 0, lockedUntil: null }
      });
      console.log("✅ Password reset to 'Heslo123!' successfully.");
  } else {
      // Just in case it was locked
      await prisma.editor.update({
          where: { personnelId: editor.personnelId },
          data: { failedLoginAttempts: 0, lockedUntil: null }
      });
      console.log("✅ User was found and is not locked.");
  }

  await prisma.$disconnect();
}

main();

