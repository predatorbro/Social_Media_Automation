import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { saveSignIn } from "@/app/actions/auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/", // Redirect to home page for sign in
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await saveSignIn(user.email!, user.name!);
        return true;
      } catch (error) {
        console.error("Error in custom signIn:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
})

export { handler as GET, handler as POST }
