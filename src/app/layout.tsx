

// src/app/layout.tsx 
import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { ReduxProvider } from "../redux/provider";
import { Toaster } from "react-hot-toast";

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Zydoc - Online Healthcare Consultations",
  description: "Connect with verified doctors online. Book appointments, get prescriptions, and manage your health with Zydoc — trusted by 50,000+ patients.",
  keywords: ["online doctor", "healthcare", "book appointment", "telemedicine", "find doctor"],
  openGraph: {
    title: "Zydoc - Online Healthcare Consultations",
    description: "Connect with verified doctors online. Trusted by 50,000+ patients.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jakarta.variable} ${geistMono.variable} ${geist.variable}`}>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ReduxProvider>
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}