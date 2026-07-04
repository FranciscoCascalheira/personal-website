import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Francisco Cascalheira",
    "software developer",
    "full-stack developer",
    "Porto",
    "FEUP",
    "React",
    "TypeScript",
    "Next.js",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

/* Set the theme before first paint to avoid a flash. Falls back to the
   system preference when the visitor has not chosen one. */
const themeScript = `
(function () {
  document.documentElement.classList.add('js');
  try {
    var stored = localStorage.getItem('theme');
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    document.documentElement.dataset.theme = stored || (mq.matches ? 'dark' : 'light');
    if (!stored && mq.addEventListener) {
      mq.addEventListener('change', function (e) {
        if (localStorage.getItem('theme')) return;
        document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
        window.dispatchEvent(new Event('themechange'));
      });
    }
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
