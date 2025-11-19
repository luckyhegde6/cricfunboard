// app/api/auth/[...nextauth]/route.ts
/**
 * NextAuth route handler for Next.js App Router.
 * Exports named handlers for GET and POST so Next.js recognizes them as route methods.
 *
 * Requirements:
 * - npm install next-auth @auth/mongodb-adapter mongodb bcrypt
 * - lib/mongo-client.ts should export a default Promise<MongoClient>
 *
 * Note: this file intentionally does NOT default-export NextAuth.
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongo-client";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";

export const runtime = "nodejs"; // ensure Node runtime (not edge)

// Await a connected MongoClient (adapter expects an actual MongoClient)
const mongoClient = await clientPromise;

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("NEXTAUTH_SECRET not set. Set this in .env.local for production.");
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(mongoClient),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const db = mongoClient.db();
        const usersCol = db.collection("users");
        const user = await usersCol.findOne({ email: credentials.email });
        if (!user) return null;
        const passwordHash = user.passwordHash || user.password || null;
        if (!passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, passwordHash);
        if (!ok) return null;
        return { id: user._id.toString(), email: user.email, role: user.role || "user" } as any;
      },
    }),
    // Add other providers (Google/GitHub) here if desired
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role ?? (token as any).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      (session.user as any).id = token.sub;
      (session.user as any).role = (token as any).role ?? "user";
      return session;
    },
  },
  pages: {
    // signIn: "/auth/signin", // optional custom page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create one NextAuth handler and export it as named method handlers
const handler = NextAuth(authOptions);

// Export named handlers so the App Router recognizes HTTP methods.
// NextAuth returns a function that can be used as a Route Handler.
export { handler as GET, handler as POST };
