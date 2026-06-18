import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  title: "RYDEX - smart Vehicles Booking Platform",
  description: "RYDEX ek modern multi-vendor vehicle booking platform h jahan users assaani se Carrois_Gothic,bikes aur commercial vehicles book kr skte handleBuildComplete. Secure login , verified owners aur transparent pricing ke sath RYDEX mobility ko simple aur reliable banata Habibi. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}  <ToastContainer position="top-right" autoClose={3000} /></body>
    </html>
  );
}
