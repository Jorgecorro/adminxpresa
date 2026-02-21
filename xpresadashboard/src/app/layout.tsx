import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xpresa Dashboard Admin",
  description: "Panel de administración de Xpresa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 overflow-hidden`}>
        <div className="flex h-screen bg-slate-950">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-slate-950 px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
