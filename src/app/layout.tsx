"use client";
 
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syncmultiplatforms.vercel.app';
  const siteName = 'Sync - AI Social Media Management';
  const description = 'AI-powered social media management platform for creators, influencers, and brands. Generate platform-optimized content, manage multiple accounts, and save 10+ hours per week with intelligent automation.';
  const keywords = 'social media management, AI content creation, social media automation, Instagram management, Twitter tools, LinkedIn marketing, content scheduling, AI writing, social media analytics';

  return (
    <html lang="en">
      <head>
        {/* Basic Meta Tags */}
        <title>{siteName} - AI-Powered Social Media Management</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Sync Platform" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteName} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${siteUrl}/favic/android-chrome-512x512.png`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}/favic/android-chrome-512x512.png`} />

        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="application-name" content={siteName} />

        {/* Favicon Links */}
        <link rel="icon" type="image/x-icon" href="/favic/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favic/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favic/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favic/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favic/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favic/android-chrome-512x512.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": siteName,
              "description": description,
              "url": siteUrl,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free tier available"
              },
              "creator": {
                "@type": "Organization",
                "name": "Sync Platform"
              },
              "featureList": [
                "AI-powered content generation",
                "Multi-platform social media management",
                "Automated posting and scheduling",
                "Analytics and performance tracking",
                "AI image generation",
                "Content calendar management"
              ],
              "screenshot": `${siteUrl}/favic/android-chrome-512x512.png`
            })
          }}
        />

        {/* Additional Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sync Platform",
              "url": siteUrl,
              "logo": `${siteUrl}/favic/android-chrome-512x512.png`,
              "description": description,
              "foundingDate": "2024",
              "sameAs": [
                // Add social media URLs here when available
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ThemeProvider defaultTheme="light" storageKey="socialflow-ui-theme">
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
