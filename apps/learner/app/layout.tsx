import type { Metadata } from "next";
import "./globals.css";
import AppBar from "../components/AppBar";
import WalletProvider from "../providers/WalletProvider";

export const metadata: Metadata = {
  title: "Roadmap DAO - Learner Portal",
  description: "Discover and enroll in expert-curated Web3 learning roadmaps",
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
