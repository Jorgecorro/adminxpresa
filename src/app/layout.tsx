import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "XpresaControl - Gestión de Pedidos Textiles",
    description: "Sistema de gestión de pedidos para fabricación textil",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
