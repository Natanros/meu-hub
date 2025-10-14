import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
  adapter: PrismaAdapter(prisma),
  secret: getNextAuthSecret(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
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
        secure: process.env.NODE_ENV === "production", // true em produção (HTTPS)
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development", // Logs detalhados apenas em dev
});
