import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === "development";

    // 1. Verificar cookies
    const cookies = request.headers.get("cookie");
    const hasCookie = !!cookies;

    if (isDev) {
      console.log("\n🔍 === DEBUG DE AUTENTICAÇÃO ===");
      console.log("🍪 Cookies recebidos:", hasCookie ? "SIM" : "NÃO");

      if (hasCookie) {
        // Mostrar quais cookies foram recebidos
        const cookieNames = cookies!
          .split(";")
          .map((c) => c.trim().split("=")[0]);
        console.log("📋 Cookies disponíveis:", cookieNames.join(", "));

        // Verificar se tem o cookie de sessão
        const hasSessionToken =
          cookies!.includes("next-auth.session-token") ||
          cookies!.includes("__Secure-next-auth.session-token");
        console.log(
          "🎫 Cookie de sessão presente:",
          hasSessionToken ? "SIM" : "NÃO"
        );
      }

      console.log("🌍 Ambiente:", process.env.NODE_ENV);
      console.log(
        "🔗 NEXTAUTH_URL:",
        process.env.NEXTAUTH_URL || "NÃO DEFINIDA"
      );
      console.log(
        "🔐 NEXTAUTH_SECRET:",
        process.env.NEXTAUTH_SECRET ? "DEFINIDO" : "NÃO DEFINIDO"
      );
    }

    // 2. Tentar decodificar o token
    const secret =
      process.env.NEXTAUTH_SECRET ||
      "dev-secret-key-for-local-development-consistent";
    const isProduction = process.env.NODE_ENV === "production";

    const token = await getToken({
      req: request,
      secret: secret,
      secureCookie: isProduction,
      // Tentar ambos os nomes de cookie
      cookieName: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
    });

    if (isDev) {
      console.log("🔑 Token decodificado:", token ? "SIM" : "NÃO");

      if (token) {
        console.log("✅ Dados do token:", {
          id: token.id,
          email: token.email,
          name: token.name,
          iat: token.iat
            ? new Date((token.iat as number) * 1000).toISOString()
            : "N/A",
          exp: token.exp
            ? new Date((token.exp as number) * 1000).toISOString()
            : "N/A",
        });
      } else if (hasCookie) {
        console.log("⚠️ PROBLEMA: Cookie presente mas token NÃO decodificado!");
        console.log("💡 Possíveis causas:");
        console.log("   1. NEXTAUTH_SECRET diferente entre login e validação");
        console.log("   2. Cookie name incorreto (verificar __Secure- prefix)");
        console.log("   3. Token expirado");
        console.log("   4. Cookie corrompido");
      }

      console.log("=================================\n");
    }

    // 3. Retornar usuário se token válido
    if (token?.id) {
      return {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
      };
    }

    return null;
  } catch (error) {
    console.error("💥 ERRO CRÍTICO na autenticação:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");
    return null;
  }
}
