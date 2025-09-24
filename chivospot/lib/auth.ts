import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const credentialsProvider = Credentials({
  name: "Credenciales",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Contraseña", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials.password) {
      return null;
    }

    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
    if (!user || !user.password) {
      return null;
    }

    const isValid = await compare(credentials.password, user.password);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [credentialsProvider],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
