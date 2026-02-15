import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Rabbit Stack",
  description: "AI Code Reviewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`antialiased font-sans`}
      > 
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#18181b",
                border: "1px solid #3f3f46",
                color: "#fafafa",
              },
            }}
            richColors
            closeButton
          />
        </ThemeProvider>
      </QueryProvider>
      </body>
    </html>
  );
}
