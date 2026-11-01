// prisma/seed.ts
import { PrismaClient, Role, TicketPriority, TicketStatus, MessageType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de la base de datos...");

  // Limpiar datos existentes
  await prisma.ticketMessage.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // Crear Grupos
  const groupSoporteIT = await prisma.group.create({
    data: {
      name: "Soporte TI Nivel 1",
      description: "Atención de hardware, puestos de trabajo y accesos básicos.",
    },
  });

  const groupInfraestructura = await prisma.group.create({
    data: {
      name: "Infraestructura & Servidores",
      description: "Redes, servidores cloud, VPNs y bases de datos.",
    },
  });

  const groupDesarrollo = await prisma.group.create({
    data: {
      name: "Desarrollo de Software",
      description: "Bugs, integraciones API y desarrollo de nuevas funcionalidades.",
    },
  });

  // Crear Usuarios
  const adminUser = await prisma.user.create({
    data: {
      name: "Administrador Global",
      email: "admin@empresa.com",
      password: hashedPassword,
      role: Role.ADMIN,
      groups: {
        connect: [{ id: groupSoporteIT.id }, { id: groupInfraestructura.id }],
      },
    },
  });

  const userIT = await prisma.user.create({
    data: {
      name: "Carlos Técnico TI",
      email: "carlos.ti@empresa.com",
      password: hashedPassword,
      role: Role.USER,
      groups: {
        connect: [{ id: groupSoporteIT.id }],
      },
    },
  });

  const userDev = await prisma.user.create({
    data: {
      name: "Elena Desarrolladora",
      email: "elena.dev@empresa.com",
      password: hashedPassword,
      role: Role.USER,
      groups: {
        connect: [{ id: groupDesarrollo.id }],
      },
    },
  });

  // Crear Ticket de prueba
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Fallo en conexión VPN tras actualización",
      description: "Varios colaboradores no pueden autenticarse con el túnel IPsec desde la sede norte.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      groupId: groupInfraestructura.id,
      createdById: userIT.id,
      assignedToId: adminUser.id,
    },
  });

  // Mensajes de chat
  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id,
        senderId: userIT.id,
        content: "Ticket creado tras reporte masivo de usuarios.",
        type: MessageType.SYSTEM,
      },
      {
        ticketId: ticket1.id,
        senderId: userIT.id,
        content: "El ticket fue derivado del Grupo Soporte TI al Grupo Infraestructura por Carlos Técnico TI. Motivo: Requiere revisión de certificados en el concentrador.",
        type: MessageType.SYSTEM,
      },
      {
        ticketId: ticket1.id,
        senderId: adminUser.id,
        content: "Revisando configuración de certificados en el firewall principal. Emitiremos un fix en 30 minutos.",
        type: MessageType.USER,
      },
    ],
  });

  console.log("Seed completado exitosamente:");
  console.log("Admin: admin@empresa.com / Password123!");
  console.log("Técnico TI: carlos.ti@empresa.com / Password123!");
  console.log("Desarrolladora: elena.dev@empresa.com / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
