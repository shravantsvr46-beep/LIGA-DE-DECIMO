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

export const metadata = {
  title: "LIGA DE DÉCIMO | Inter-Branch Football League",
  description: "Official portal for the inter-branch college football league. Real-time standings, fixture results, and all-time branch statistics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname.includes('onrender.com')) {
                window.location.replace('https://liga-de-decimo.vercel.app/');
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black text-neutral-100 font-sans min-h-screen selection:bg-neutral-800 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
