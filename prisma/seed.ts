import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // 1. Roles
  const superadminRole = await prisma.editorRole.upsert({
    where: { name: "superadmin" },
    update: {},
    create: { name: "superadmin", permissions: { all: true } },
  });

  const editorRole = await prisma.editorRole.upsert({
    where: { name: "editor" },
    update: {},
    create: {
      name: "editor",
      permissions: { posts: ["create", "update"], events: ["create", "update"] },
    },
  });

  const sportManagerRole = await prisma.editorRole.upsert({
    where: { name: "sport_manager" },
    update: {},
    create: {
      name: "sport_manager",
      permissions: { all: true },
    },
  });

  const viewerRole = await prisma.editorRole.upsert({
    where: { name: "viewer" },
    update: {},
    create: { name: "viewer", permissions: { posts: ["read"], events: ["read"] } },
  });

  // 2. Sports
  const competitiveSports = [
    "Atletika", "Basketbal", "Cheerleaders", "Florbal", "Lyžování", 
    "Moderní gymnastika", "Plavání", "Šachy", "Skoky do vody", 
    "Softball", "Stolní tenis", "Synchronizované plavání", "Volejbal"
  ];

  const nonCompetitiveSports = [
    "Aikibudo", "Basketbal (rekreační)", "ČASPV", "Kanoistika", 
    "Šerm", "Sportovní aerobik", "Tenis", "Turistika"
  ];

  const sportsMap: Record<string, any> = {};

  for (const name of competitiveSports) {
    sportsMap[name] = await prisma.sport.upsert({
      where: { name },
      update: { isCompetitive: true },
      create: { name, isCompetitive: true, description: `Oddíl ${name.toLowerCase()} VSK Univerzita Brno.` },
    });
  }

  for (const name of nonCompetitiveSports) {
    sportsMap[name] = await prisma.sport.upsert({
      where: { name },
      update: { isCompetitive: false },
      create: { name, isCompetitive: false, description: `Rekreační oddíl ${name.toLowerCase()}.` },
    });
  }

  // 3. Personnel & Editors
  const commonHash = await bcrypt.hash("Heslo123!", 12);

  // Superadmin
  const adminP = await prisma.personnel.upsert({
    where: { email: "admin@vsk.cz" },
    update: { isActive: true },
    create: { firstName: "Adam", lastName: "Novák", email: "admin@vsk.cz", isActive: true },
  });

  await prisma.editor.upsert({
    where: { personnelId: adminP.id },
    update: { editorRoleId: superadminRole.id },
    create: { personnelId: adminP.id, passwordHash: commonHash, editorRoleId: superadminRole.id },
  });

  // Sport Managers
  const managers = [
    { firstName: "Petr", lastName: "Dvořák", email: "manager.atletika@vsk.cz", sport: "Atletika" },
    { firstName: "Jana", lastName: "Svobodová", email: "manager.plavani@vsk.cz", sport: "Plavání" },
    { firstName: "Marek", lastName: "Kučera", email: "manager.volejbal@vsk.cz", sport: "Volejbal" },
  ];

  for (const m of managers) {
    const p = await prisma.personnel.upsert({
      where: { email: m.email },
      update: { isActive: true, sportId: sportsMap[m.sport].id },
      create: { firstName: m.firstName, lastName: m.lastName, email: m.email, sportId: sportsMap[m.sport].id, isActive: true },
    });

    await prisma.editor.upsert({
      where: { personnelId: p.id },
      update: { editorRoleId: sportManagerRole.id },
      create: { 
        personnelId: p.id, 
        passwordHash: commonHash, 
        editorRoleId: sportManagerRole.id,
        managedSports: { create: [{ sportId: sportsMap[m.sport].id }] }
      },
    });
  }

  // Editors
  const editors = [
    { firstName: "David", lastName: "Skřeček", email: "davidskrecek@gmail.com", sport: "Atletika" },
    { firstName: "Lucie", lastName: "Bílá", email: "lucie.editor@vsk.cz", sport: "Tenis" },
  ];

  for (const e of editors) {
    const p = await prisma.personnel.upsert({
      where: { email: e.email },
      update: { isActive: true, sportId: sportsMap[e.sport].id },
      create: { firstName: e.firstName, lastName: e.lastName, email: e.email, sportId: sportsMap[e.sport].id, isActive: true },
    });

    await prisma.editor.upsert({
      where: { personnelId: p.id },
      update: { editorRoleId: editorRole.id },
      create: { 
        personnelId: p.id, 
        passwordHash: commonHash, 
        editorRoleId: editorRole.id,
        managedSports: { create: [{ sportId: sportsMap[e.sport].id }] }
      },
    });
  }

  // Trainers & Regular Personnel
  const trainers = [
    { firstName: "Ivan", lastName: "Hrozný", email: "ivan@vsk.cz", sport: "Aikibudo", category: "Mistr" },
    { firstName: "Eva", lastName: "Zátopková", email: "eva@vsk.cz", sport: "Atletika", category: "II. třída" },
    { firstName: "Tomáš", lastName: "Rosický", email: "tomas@vsk.cz", sport: "Florbal", category: "Licence B" },
  ];

  for (const t of trainers) {
    const p = await prisma.personnel.upsert({
      where: { email: t.email },
      update: { isActive: true, sportId: sportsMap[t.sport].id },
      create: { firstName: t.firstName, lastName: t.lastName, email: t.email, sportId: sportsMap[t.sport].id, isActive: true },
    });

    await prisma.trainer.upsert({
      where: { personnelId: p.id },
      update: { category: t.category },
      create: { personnelId: p.id, category: t.category },
    });
  }

  // 4. Posts & Events
  console.log("Creating posts and events...");

  // Get some IDs for reference
  const pAtletika = managers[0].email; // Petr Dvořák
  const pPlavani = managers[1].email; // Jana Svobodová
  const eAtletika = editors[0].email; // David Skřeček

  const personnelMap: Record<string, number> = {};
  const allP = await prisma.personnel.findMany();
  allP.forEach(p => personnelMap[p.email] = p.id);

  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      {
        authorPersonnelId: personnelMap[pAtletika],
        sportId: sportsMap["Atletika"].id,
        title: "Přebory Jihomoravského kraje",
        excerpt: "Velký úspěch našich atletů na krajských přeborech.",
        content: "Naši atleti vybojovali celkem 12 medailí, z toho 5 zlatých. Gratulujeme!",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        authorPersonnelId: personnelMap[eAtletika],
        sportId: sportsMap["Atletika"].id,
        title: "Nové tréninkové hodiny",
        excerpt: "Od příštího týdne měníme časy tréninků přípravky.",
        content: "Tréninky budou nově začínat v 15:30 místo 16:00.",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        authorPersonnelId: personnelMap[pPlavani],
        sportId: sportsMap["Plavání"].id,
        title: "Závody v Olomouci",
        excerpt: "Výsledky z víkendových závodů v Olomouci.",
        content: "Všichni naši plavci si vylepšili osobní rekordy.",
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        authorPersonnelId: personnelMap[pAtletika],
        sportId: sportsMap["Atletika"].id,
        title: "Soustředění Nymburk",
        description: "Intenzivní příprava na sezónu.",
        startTime: new Date("2026-04-10T09:00:00"),
        endTime: new Date("2026-04-17T17:00:00"),
        location: "SC Nymburk",
        eventType: "other",
        isPublic: true,
      },
      {
        authorPersonnelId: personnelMap[pPlavani],
        sportId: sportsMap["Plavání"].id,
        title: "Mistrovství ČR v plavání",
        description: "Hlavní vrchol sezóny pro kategorii dospělých.",
        startTime: new Date("2026-06-15T08:00:00"),
        endTime: new Date("2026-06-18T20:00:00"),
        location: "Podolí, Praha",
        eventType: "match",
        isPublic: true,
      },
    ],
  });

  await prisma.$disconnect();
  console.log("Seeding complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
