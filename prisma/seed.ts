import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const superadmin = await prisma.editorRole.upsert({
    where: { name: "superadmin" },
    update: {},
    create: { name: "superadmin", permissions: { all: true } },
  });

  const sportManager = await prisma.editorRole.upsert({
    where: { name: "sport_manager" },
    update: {},
    create: {
      name: "sport_manager",
      permissions: { posts: ["create", "update"], events: ["create", "update"] },
    },
  });

  await prisma.editorRole.upsert({
    where: { name: "viewer" },
    update: {},
    create: { name: "viewer", permissions: { posts: ["read"], events: ["read"] } },
  });

  const atletika = await prisma.sport.upsert({
    where: { name: "Atletika" },
    update: {},
    create: { name: "Atletika", isCompetitive: true, description: "Oddíl atletiky VSK Univerzita Brno." },
  });

  const tenis = await prisma.sport.upsert({
    where: { name: "Tenis" },
    update: {},
    create: { name: "Tenis", isCompetitive: false, description: "Rekreační tenisový oddíl." },
  });

  const adminPersonnel = await prisma.personnel.upsert({
    where: { email: "admin@vsk.cz" },
    update: {},
    create: { firstName: "Adam", lastName: "Novák", email: "admin@vsk.cz", isActive: true },
  });

  const adminHash = await bcrypt.hash("Admin1234!", 12);
  await prisma.editor.upsert({
    where: { personnelId: adminPersonnel.id },
    update: {},
    create: {
      personnelId: adminPersonnel.id,
      passwordHash: adminHash,
      editorRoleId: superadmin.id,
      managedSportId: null,
    },
  });

  const trainerPersonnel = await prisma.personnel.upsert({
    where: { email: "trener.atletika@vsk.cz" },
    update: {},
    create: {
      firstName: "Petr",
      lastName: "Dvořák",
      email: "trener.atletika@vsk.cz",
      phone: "+420 777 111 222",
      sportId: atletika.id,
      isActive: true,
    },
  });

  await prisma.trainer.upsert({
    where: { personnelId: trainerPersonnel.id },
    update: {},
    create: { personnelId: trainerPersonnel.id, category: "I. třída" },
  });

  const trainerHash = await bcrypt.hash("Trener1234!", 12);
  await prisma.editor.upsert({
    where: { personnelId: trainerPersonnel.id },
    update: {},
    create: {
      personnelId: trainerPersonnel.id,
      passwordHash: trainerHash,
      editorRoleId: sportManager.id,
      managedSportId: atletika.id,
    },
  });

  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      {
        authorPersonnelId: trainerPersonnel.id,
        sportId: atletika.id,
        title: "Příprava na ligovou sezónu 2026",
        excerpt: "Nastartujte sezónu s námi – přidejte se k tréninkovému kempu v Brně.",
        content: "Podrobnosti o zimní přípravě a plánovaném kempu v Brně. Kemp se koná 15.–20. března.",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        authorPersonnelId: adminPersonnel.id,
        sportId: tenis.id,
        title: "Otevírací hodiny tenisových kurtů – jaro 2026",
        excerpt: "Kurty jsou od dubna opět k dispozici pro členy klubu.",
        content: "Rezervace přes online systém, otevírací doba 8–22 h. Nezapomeňte si přinést průkaz člena.",
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        authorPersonnelId: trainerPersonnel.id,
        sportId: atletika.id,
        title: "Oblastní přebor – Brno 2026",
        description: "Závodní den pro všechny věkové kategorie.",
        startTime: new Date("2026-05-10T09:00:00"),
        endTime: new Date("2026-05-10T17:00:00"),
        location: "Atletický stadion Rožnovského, Brno",
        eventType: "match",
        isPublic: true,
      },
      {
        authorPersonnelId: adminPersonnel.id,
        sportId: tenis.id,
        title: "Tenisový turnaj členů",
        description: "Neformální turnaj pro registrované členy klubu.",
        startTime: new Date("2026-05-24T10:00:00"),
        endTime: new Date("2026-05-24T16:00:00"),
        location: "Tenisové kurty VSK, Brno",
        eventType: "meeting",
        isPublic: true,
      },
    ],
  });

  await prisma.$disconnect();
  console.log("Seed done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
