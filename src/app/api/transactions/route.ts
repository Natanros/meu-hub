import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → Listar todas
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

// POST → Criar
export async function POST(request: Request) {
  const body = await request.json();
  const {
    type,
    category,
    amount,
    description,
    date,
    metaId,
    installments,
    recurrence,
    recurrenceCount,
  } = body;

  const transaction = await prisma.transaction.create({
    data: {
      type,
      category,
      amount,
      description,
      date: new Date(date),
      metaId: metaId || null,
      installments: installments ? Number(installments) : null,
      recurrence: recurrence || null,
      recurrenceCount: recurrenceCount ? Number(recurrenceCount) : null,
    },
  });

  return NextResponse.json(transaction);
}
