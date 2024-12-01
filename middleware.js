export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/projects",
    "/projects/(.*)",
    "/quote/(.*)",
    "/quotes",
    "/admin/(.*)",
    "/account/(.*)",
  ],
};
