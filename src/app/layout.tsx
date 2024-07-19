import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hackers App",
  description: "Aplicación web del equipo Hackers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/images/favicon.png" sizes="any" />
      </head>
      <NextUIProvider>
        <body className={inter.className}>
          {children}
          <footer>
            <p>© 2024 Hackers | Desarrollador por: <a href="https://github.com/ivanGuerreroDev" target="_blank">Ivan Guerrero</a></p>
          </footer>
        </body>
      </NextUIProvider>
    </html>
  );
}
