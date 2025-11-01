import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Buthpitiya M.V Learning Management System - Online education platform for students and teachers" />
        <meta name="keywords" content="LMS, Education, School, Buthpitiya, Sri Lanka" />
        <meta name="author" content="Buthpitiya M.V" />
        <meta name="theme-color" content="#10B981" />
        
        {/* Favicon */}
        <link rel="icon" href="https://i.imgur.com/c7EilDV.png" />
        <link rel="apple-touch-icon" href="https://i.imgur.com/c7EilDV.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
