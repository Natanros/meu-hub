import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const metas = await prisma.meta.findMany();
  return NextResponse.json(metas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, valor } = body;
  const meta = await prisma.meta.create({
    data: { nome, valor: Number(valor) },
  });
  return NextResponse.json(meta);
}
