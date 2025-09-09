// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        if (
          credentials.username === process.env.ADMIN_USER &&
          credentials.password === process.env.ADMIN_PASS
        ) {
          return { id: "1", name: credentials.username };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
};
