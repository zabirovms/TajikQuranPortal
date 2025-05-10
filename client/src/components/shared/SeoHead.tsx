import { Helmet } from 'react-helmet';
import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  structuredData?: object;
}

export default function SeoHead({
  title,
  description,
  canonicalUrl,
  imageUrl,
  type = 'website',
  structuredData
}: SeoHeadProps) {
  const siteName = 'Қуръони Тоҷикӣ';
  const fullUrl = canonicalUrl || window.location.href;
  const fullTitle = `${title} | ${siteName}`;
  const image = imageUrl || '/logo.png';

  // Add structured data to the page
  useEffect(() => {
    if (!structuredData) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [structuredData]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image || 'https://tajikquran.replit.app/logo.png'} />
      <meta property="og:image:alt" content="Қуръони Тоҷикӣ Logo" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || 'https://tajikquran.replit.app/logo.png'} />

      {/* Language and Locale */}
      <meta property="og:locale" content="tg_TJ" />
      <meta httpEquiv="content-language" content="tg" />
      <html lang="tg" />

      {/* Structured Data for Logo */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Қуръони Тоҷикӣ",
            "url": "https://tajikquran.replit.app",
            "logo": "https://tajikquran.replit.app/logo.png"
          }
        `}
      </script>
    </Helmet>
  );
}