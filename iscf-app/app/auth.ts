import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })
  ],
 secret: process.env.NEXTAUTH_SECRET,  // Ensure this is passed
 debug: process.env.NODE_ENV === "development",  // For logging in dev
});

