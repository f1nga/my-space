import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromToday(days: number, hour = 9, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await prisma.event.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: [
      {
        title: "Llegir documentacio de Next 16",
        description: "Revisar app router i server actions",
        status: "todo",
        position: 1024,
        dueDate: daysFromToday(2, 18),
      },
      {
        title: "Esbossar paleta de colors",
        description: "Definir tokens a globals.css",
        status: "todo",
        position: 2048,
      },
      {
        title: "Configurar Prisma amb SQLite",
        description: "Migracio inicial i seed",
        status: "doing",
        position: 1024,
      },
      {
        title: "Implementar Sidebar",
        status: "doing",
        position: 2048,
        dueDate: daysFromToday(1, 12),
      },
      {
        title: "Crear repositori al Git",
        status: "done",
        position: 1024,
      },
    ],
  });

  await prisma.note.createMany({
    data: [
      {
        title: "Idees per al disseny",
        content:
          "Aposta per un to fosc amb accents maragda. Cards amb ombres molt suaus i radis grans (rounded-2xl). Tipografia Geist per a tot.",
        pinned: true,
      },
      {
        title: "Recordatoris setmanals",
        content:
          "- Repassar tasques cada dilluns\n- Buidar notes velles cada divendres\n- Planificar setmana al calendari",
        pinned: false,
      },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Reunio amb el meu jo del futur",
        startsAt: daysFromToday(1, 10, 0),
        endsAt: daysFromToday(1, 11, 0),
        color: "emerald",
      },
      {
        title: "Sessio de revisio de notes",
        startsAt: daysFromToday(3, 18, 30),
        endsAt: daysFromToday(3, 19, 30),
        color: "violet",
      },
      {
        title: "Dia de descans",
        startsAt: daysFromToday(6, 0, 0),
        allDay: true,
        color: "amber",
      },
    ],
  });

  console.log("✔ Seed completat");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
