import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candidaturas | TrackFlow",
  description: "Gesti\u00f3n de candidaturas para apoyar la contrataci\u00f3n de los equipos de TrackFlow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="app-header">
          <div className="header-content">
            <Link className="brand" href="/">
              <Image className="brand-logo" src="/trackflow-logo.png" alt="TrackFlow" width={112} height={61} priority />
              <span className="brand-divider" aria-hidden="true">/</span>
              <span className="brand-team">People &amp; Talent</span>
            </Link>
            <span className="header-label">Gesti&oacute;n de candidaturas</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
