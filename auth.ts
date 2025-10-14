import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "./src/lib/prisma";

// Gera um secret automaticamente se não estiver definido
const getNextAuthSecret = () => {
  // Sempre tentar usar a variável de ambiente primeiro
  if (process.env.NEXTAUTH_SECRET) {
    console.log("🔑 Usando NEXTAUTH_SECRET do ambiente");
    return process.env.NEXTAUTH_SECRET;
  }

  // Se não estiver definido, usar uma chave consistente
  const fallbackSecret = "dev-secret-key-for-local-development-consistent";
  console.log("⚠️ Usando secret de fallback");
  return fallbackSecret;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ❌ REMOVIDO: PrismaAdapter - conflita com JWT strategy
  // adapter: PrismaAdapter(prisma),
  secret: getNextAuthSecret(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Credenciais inválidas");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.password) {
            console.log("❌ Usuário não encontrado ou sem senha");
            return null;
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Senha inválida");
            return null;
          }

          console.log("✅ Login bem-sucedido:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("💥 Erro no authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Log apenas em dev
      if (process.env.NODE_ENV === "development") {
        console.log("🔐 JWT Callback - Token criado/atualizado:", {
          id: token.id,
          email: token.email,
          trigger,
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }

      // Log apenas em dev
      if (process.env.NODE_ENV === "development") {
        console.log("👤 Session Callback - Sessão criada:", {
          userId: session.user.id,
          email: session.user.email,
        });
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development", // Logs detalhados apenas em dev
});
