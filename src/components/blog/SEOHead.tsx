import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  publishedTime,
  modifiedTime,
  author,
  category,
}: SEOHeadProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'article', true);
    if (url) setMetaTag('og:url', url, true);
    if (image) setMetaTag('og:image', image, true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    if (image) setMetaTag('twitter:image', image);

    // Article meta tags
    if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
    if (author) setMetaTag('article:author', author, true);
    if (category) setMetaTag('article:section', category, true);
    keywords.forEach(keyword => {
      setMetaTag('article:tag', keyword, true);
    });

    // Schema.org JSON-LD
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: description,
      ...(image && { image: image }),
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime }),
      ...(author && { author: { '@type': 'Person', name: author } }),
      ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

    return () => {
      // Cleanup on unmount
      document.title = 'WillRefriMix';
    };
  }, [title, description, keywords, image, url, publishedTime, modifiedTime, author, category]);

  return null;
}
