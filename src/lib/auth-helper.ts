import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Debug: verificar se há cookies
    const cookies = request.headers.get("cookie");
    console.log("🍪 Cookies recebidos:", cookies ? "SIM" : "NÃO");

    // Tentar via getToken com configuração específica
    const token = await getToken({
      req: request,
      secret:
        process.env.NEXTAUTH_SECRET ||
        "dev-secret-key-for-local-development-consistent",
    });
    console.log("🔑 Token decodificado:", token ? "SIM" : "NÃO");

    if (token?.id) {
      console.log("✅ Usuário autenticado via token:", token.id);
      return {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
      };
    }

    console.log("❌ Usuário não autenticado");
    return null;
  } catch (error) {
    console.error("💥 Erro na autenticação:", error);
    return null;
  }
}
