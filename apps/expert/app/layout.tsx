import type { Metadata } from "next";
import "./globals.css";
import AppBar from "../components/AppBar";
import WalletProvider from "../providers/WalletProvider";

export const metadata: Metadata = {
  title: "Roadmap DAO - Expert Portal",
  description: "Create and manage learning roadmaps for Web3 technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <WalletProvider>
          <AppBar />
          <main className="pt-4">
            {children}
          </main>
          </WalletProvider>
      </body>
    </html>
  );
}




