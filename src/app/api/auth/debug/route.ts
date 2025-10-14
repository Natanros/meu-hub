import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Endpoint de diagnóstico de autenticação
 * Acesse: /api/auth/debug
 *
 * Este endpoint mostra TODOS os detalhes sobre a autenticação atual
 * IMPORTANTE: Remova em produção ou adicione proteção!
 */
export async function GET(request: NextRequest) {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const cookies = request.headers.get("cookie");

    // Parse dos cookies
    const cookieList = cookies
      ? cookies.split(";").map((c) => {
          const [name, ...valueParts] = c.trim().split("=");
          return { name, value: valueParts.join("=").substring(0, 20) + "..." };
        })
      : [];

    // Tentar decodificar token
    const secret =
      process.env.NEXTAUTH_SECRET ||
      "dev-secret-key-for-local-development-consistent";

    const token = await getToken({
      req: request,
      secret: secret,
      secureCookie: isProduction,
    });

    // Informações do ambiente
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ NÃO DEFINIDA",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
          ? "✅ DEFINIDO"
          : "❌ NÃO DEFINIDO",
        isProduction,
      },
      cookies: {
        hasCookies: !!cookies,
        totalCookies: cookieList.length,
        cookieList: cookieList,
        hasSessionToken:
          cookies?.includes("next-auth.session-token") ||
          cookies?.includes("__Secure-next-auth.session-token"),
        expectedCookieName: isProduction
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      },
      token: {
        isDecoded: !!token,
        hasId: !!token?.id,
        data: token
          ? {
              id: token.id,
              email: token.email,
              name: token.name,
              iat: token.iat
                ? new Date((token.iat as number) * 1000).toISOString()
                : null,
              exp: token.exp
                ? new Date((token.exp as number) * 1000).toISOString()
                : null,
            }
          : null,
      },
      diagnosis: {
        status: token?.id ? "✅ AUTENTICADO" : "❌ NÃO AUTENTICADO",
        problems: [] as string[],
      },
    };

    // Diagnóstico de problemas
    if (cookies && !token) {
      if (!process.env.NEXTAUTH_URL) {
        debugInfo.diagnosis.problems.push("NEXTAUTH_URL não está definida");
      }
      if (!process.env.NEXTAUTH_SECRET) {
        debugInfo.diagnosis.problems.push("NEXTAUTH_SECRET não está definida");
      }
      if (!debugInfo.cookies.hasSessionToken) {
        debugInfo.diagnosis.problems.push("Cookie de sessão não encontrado");
      } else {
        debugInfo.diagnosis.problems.push(
          "Cookie presente mas não pode ser decodificado - SECRET incorreto?"
        );
      }
    }

    if (!cookies) {
      debugInfo.diagnosis.problems.push(
        "Nenhum cookie foi enviado na requisição"
      );
    }

    return NextResponse.json(debugInfo, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao diagnosticar autenticação",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
