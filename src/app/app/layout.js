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
  title: "അൻത ഫീഹിം-മീലാദ് ഫെസ്റ്റ് -25",
  description: "മദ്റസത്തുൽ ബദ്‌രിയ്യ, കോയ്യോട് - അൻത ഫീഹിം - മീലാദ് ഫെസ്റ്റ് -25",
  icons: {
    icon: [
      { url: "/image/favicon.ico", sizes: "any" },
      { url: "/image/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/image/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: {
      url: "/image/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  manifest: "/site.webmanifest",
  themeColor: "#1e3a8a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "അൻത ഫീഹിം-മീലാദ് ഫെസ്റ്റ് -25",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better SEO and mobile experience */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}