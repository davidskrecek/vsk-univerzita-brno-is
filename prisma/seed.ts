import "dotenv/config";
import { PrismaClient, Sport } from "@prisma/client";
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
    create: { name: "superadmin" },
  });

  const editorRole = await prisma.editorRole.upsert({
    where: { name: "editor" },
    update: {},
    create: { name: "editor" },
  });

  const sportManagerRole = await prisma.editorRole.upsert({
    where: { name: "sport_manager" },
    update: {},
    create: { name: "sport_manager" },
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

  const sportsMap: Record<string, Sport> = {};

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
    update: { editorRoleId: superadminRole.id, permissions: { all: true } },
    create: { personnelId: adminP.id, passwordHash: commonHash, editorRoleId: superadminRole.id, permissions: { all: true } },
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

    const managerPerms = { 
      "users:manage": true, 
      "posts:write": true, 
      "posts:full": true, 
      "events:write": true, 
      "events:full": true 
    };

    await prisma.editor.upsert({
      where: { personnelId: p.id },
      update: { editorRoleId: sportManagerRole.id, permissions: managerPerms },
      create: { 
        personnelId: p.id, 
        passwordHash: commonHash, 
        editorRoleId: sportManagerRole.id,
        permissions: managerPerms,
        managedSports: { create: [{ sportId: sportsMap[m.sport].id }] }
      },
    });
  }

  // Editors
  const editors = [
    { firstName: "David", lastName: "Skřeček", email: "davidskrecek@gmail.com", sport: "Atletika", perms: { "posts:write": true, "events:write": true } },
    { firstName: "Lucie", lastName: "Bílá", email: "lucie.editor@vsk.cz", sport: "Tenis", perms: { "posts:write": true, "events:write": true } },
    { 
      firstName: "Martin", 
      lastName: "Specifický", 
      email: "special.editor@vsk.cz", 
      sport: "Atletika", 
      perms: { "posts:write": true, "posts:full": true, "events:write": true } // CAN DELETE POSTS BUT NOT EVENTS
    },
    { firstName: "Jan", lastName: "Nováček", email: "novacek@vsk.cz", sport: "Atletika", perms: { "posts:write": true, "events:write": true } },
  ];

  for (const e of editors) {
    const p = await prisma.personnel.upsert({
      where: { email: e.email },
      update: { isActive: true, sportId: sportsMap[e.sport].id },
      create: { firstName: e.firstName, lastName: e.lastName, email: e.email, sportId: sportsMap[e.sport].id, isActive: true },
    });

    await prisma.editor.upsert({
      where: { personnelId: p.id },
      update: { editorRoleId: editorRole.id, permissions: e.perms },
      create: { 
        personnelId: p.id, 
        passwordHash: commonHash, 
        editorRoleId: editorRole.id,
        permissions: e.perms,
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
  const eSpecial = editors[2].email;  // Martin Specifický
  const eNovacek = editors[3].email;  // Jan Nováček

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
        title: "Tréninkový kemp 2026",
        excerpt: "Kemp zaměřený na sprint a techniku startu.",
        content: "Detaily najdete v členské sekci. Uzávěrka přihlášek je v pondělí.",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        authorPersonnelId: personnelMap[eSpecial],
        sportId: sportsMap["Atletika"].id,
        title: "Příspěvek Martina Specifického",
        excerpt: "Ukázka obsahu autora s právem pouze na vlastní úpravy a smazání.",
        content: "Tento článek byl vytvořen pro otestování speciálních oprávnění role 'special_editor'.",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        authorPersonnelId: personnelMap[eNovacek],
        sportId: sportsMap["Atletika"].id,
        title: "Novinky z dorostu",
        excerpt: "Dvě naše dorostenky splnily limity na MČR.",
        content: "Skvělá práce celé mládežnické sekce pod vedením trenéra Jirky.",
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
        authorPersonnelId: personnelMap[eAtletika],
        sportId: sportsMap["Atletika"].id,
        title: "Atletický trénink - Veřejnost",
        description: "Otevřený trénink pro širokou veřejnost se zájmem o členství.",
        startTime: new Date("2026-06-01T16:00:00"),
        endTime: new Date("2026-06-01T18:00:00"),
        location: "Stadion Pod Palackého vrchem",
        eventType: "training",
        isPublic: true,
      },
      {
        authorPersonnelId: personnelMap[eSpecial],
        sportId: sportsMap["Atletika"].id,
        title: "Mistrovství moravy a slezska",
        description: "Omezený přístup - Martin Specifický autor.",
        startTime: new Date("2026-06-10T08:00:00"),
        endTime: new Date("2026-06-10T18:00:00"),
        location: "Ostrava",
        eventType: "match",
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
