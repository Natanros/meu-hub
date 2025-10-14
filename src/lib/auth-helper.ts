import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Debug: verificar se há cookies
    const cookies = request.headers.get("cookie");
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.log("🍪 Cookies recebidos:", cookies ? "SIM" : "NÃO");
      console.log("🌍 Ambiente:", process.env.NODE_ENV);
      console.log("🔗 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    }

    // Tentar via getToken com configuração específica
    const token = await getToken({
      req: request,
      secret:
        process.env.NEXTAUTH_SECRET ||
        "dev-secret-key-for-local-development-consistent",
      secureCookie: process.env.NODE_ENV === "production", // true em produção
    });

    if (isDev) {
      console.log("🔑 Token decodificado:", token ? "SIM" : "NÃO");
      if (!token && cookies) {
        console.log(
          "⚠️ Cookie presente mas token não decodificado - verifique NEXTAUTH_SECRET"
        );
      }
    }

    if (token?.id) {
      if (isDev) {
        console.log("✅ Usuário autenticado via token:", token.id);
      }
      return {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
      };
    }

    if (isDev) {
      console.log("❌ Usuário não autenticado");
    }
    return null;
  } catch (error) {
    console.error("💥 Erro na autenticação:", error);
    return null;
  }
}
