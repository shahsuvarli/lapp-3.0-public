import CredentialsProvider from "next-auth/providers/credentials";
import { connection } from "utils/db";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "mail@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { recordset } = await connection
          .request()
          .query(`select * from employees where email='${credentials?.email}'`);

        const user = recordset[0];
        if (user && credentials?.password == user.password) {
          return {
            id: user.employee_id,
            email: user.email,
            name: user.name + " " + user.surname,
            position: user.position,
            image: user.avatar,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }

      if (user) {
        token.expires = Date.now() + 60 * 24 * 10 * 60 * 1000; // 10 days expiration
      }

      // Check if the token is expired, and if so, return null
      if (Date.now() > token.expires) {
        return null;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.expires = new Date(Date.now() + 60 * 24 * 10 * 60 * 1000); // 10 days expiration

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
