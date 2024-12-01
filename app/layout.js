import "./globals.css";
import ProviderWrapper from "utils/store/ProviderWrapper";

export const metadata = {
  title: "Lapp",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen flex flex-col justify-center">
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}