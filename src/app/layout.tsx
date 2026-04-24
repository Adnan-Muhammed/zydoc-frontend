import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import localFont from 'next/font/local'


import "./globals.css";
import { ReduxProvider } from "../redux/provider"; // redux
import AuthHydrator from "../components/auth/AuthHydrator";





const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  display: 'swap',
})
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
})

export const metadata: Metadata = {
  title: "Zydoc - Online Healthcare Consultations",
  description: "Your trusted partner in healthcare. Modern technology, human care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jakarta.variable} ${geistMono.variable}`}>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ReduxProvider>
          <AuthHydrator>
            {children}
          </AuthHydrator>
        </ReduxProvider>
      </body>
    </html>
  );
}
