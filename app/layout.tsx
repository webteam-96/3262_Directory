import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "District 3020 - Digital Directory",
  description: "Rotary District 3020 Digital Directory 2025-26",
  icons: { icon: "/assets/images/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          crossOrigin="anonymous"
        />
        <link href="/assets/css/font-awesome-all.css" rel="stylesheet" />
        <link href="/assets/css/flaticon.css" rel="stylesheet" />
        <link href="/assets/css/bootstrap.css" rel="stylesheet" />
        <link href="/assets/css/animate.css" rel="stylesheet" />
        <link href="/assets/css/color.css" rel="stylesheet" />
        <link href="/assets/css/style.css" rel="stylesheet" />
        <link href="/assets/css/responsive.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
