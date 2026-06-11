import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromToday(days: number, hour = 9, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await prisma.subObjectiu.deleteMany();
  await prisma.objectiu.deleteMany();
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

  const objectiuFisic = await prisma.objectiu.create({
    data: {
      titol: "Correr 5 km sense aturar-me",
      descripcio: "Entrenament progressiu 3 dies per setmana",
      dataInici: daysFromToday(-14, 8),
      dataFinal: daysFromToday(30, 20),
      categoria: "FISIC",
      estat: "EN_PROGRES",
      progress: 40,
      subtasques: {
        create: [
          { titol: "Completar setmana 1 d'entrenament", completat: true },
          { titol: "Arribar a 3 km continus", completat: true },
          { titol: "Provar 4 km amb ritme estable", completat: false },
          { titol: "Assolir 5 km", completat: false },
        ],
      },
    },
  });

  await prisma.objectiu.create({
    data: {
      titol: "Llegir 12 llibres aquest any",
      descripcio: "1 llibre al mes com a mínim",
      dataInici: new Date(new Date().getFullYear(), 0, 1),
      dataFinal: new Date(new Date().getFullYear(), 11, 31),
      categoria: "MENTAL",
      estat: "EN_PROGRES",
      progress: 25,
      subtasques: {
        create: [
          { titol: "Gener — Atomic Habits", completat: true },
          { titol: "Febrer — Deep Work", completat: true },
          { titol: "Març — El poder del ara", completat: true },
          { titol: "Abril — Pensar ràpid, pensar a poc", completat: false },
        ],
      },
    },
  });

  await prisma.objectiu.create({
    data: {
      titol: "Fons d'emergència de 3.000 €",
      descripcio: "Reserva per imprevistos",
      dataInici: daysFromToday(-60, 9),
      dataFinal: daysFromToday(90, 9),
      categoria: "DINERS",
      estat: "EN_PROGRES",
      progress: 65,
    },
  });

  await prisma.objectiu.create({
    data: {
      titol: "Llançar el portfolio personal",
      dataInici: daysFromToday(-30, 10),
      dataFinal: daysFromToday(45, 18),
      categoria: "TREBALL",
      estat: "COMPLETAT",
      progress: 100,
      subtasques: {
        create: [
          { titol: "Dissenyar la home", completat: true },
          { titol: "Implementar amb Next.js", completat: true },
          { titol: "Publicar a Vercel", completat: true },
        ],
      },
    },
  });

  void objectiuFisic;

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
