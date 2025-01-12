import type { Metadata } from "next";
import { Space_Grotesk, Orbitron } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';
import '@solana/wallet-adapter-react-ui/styles.css';
import SocialLinks from '@/components/SocialLinks';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: "Kanna AI Lottery - PumpFun",
  description: "La primera agente AI que ofrece una plataforma de loterías en Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${orbitron.variable}`}>
      <body className="font-space-grotesk">
        <Providers>
          <SocialLinks />
          {children}
        </Providers>
      </body>
    </html>
  );
}
