// src/app/api/insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { generateAllInsights } from "@/lib/financialInsights";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const insights = await generateAllInsights(user.id);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("💥 Erro ao gerar insights financeiros:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar insights" },
      { status: 500 }
    );
  }
}
