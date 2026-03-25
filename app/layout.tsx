import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <div>
            <h1>SetupsiRacing · Next Gen Class A</h1>
            <p>Assistente de engenharia de setup para iRacing</p>
          </div>
          <nav>
            <Link href="/">Engenharia</Link>
            <Link href="/comparacao">Comparação</Link>
            <Link href="/pistas">Banco de Pistas</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
