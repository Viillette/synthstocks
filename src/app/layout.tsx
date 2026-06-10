import type { Metadata } from "next";
import "./globals.css";
import { TerminalProvider } from "./TerminalContext"; // Direct neighbor import

export const metadata: Metadata = {
  title: "SynthStocks",
  description: "Powered by AETRIS-AI Labs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TerminalProvider>
          {children}
        </TerminalProvider>
      </body>
    </html>
  );
}
