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

    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }

    // Canonical URL
    if (url) {
      setLinkTag('canonical', url);
    }

    // Open Graph tags (Facebook, LinkedIn)
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'article', true);
    setMetaTag('og:locale', 'pt_BR', true);
    setMetaTag('og:site_name', 'WillRefriMix - HVAC-R Brasil', true);
    if (url) setMetaTag('og:url', url, true);
    if (image) {
      setMetaTag('og:image', image, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
      setMetaTag('og:image:alt', title, true);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:site', '@willrefrimix');
    if (image) {
      setMetaTag('twitter:image', image);
      setMetaTag('twitter:image:alt', title);
    }

    // Article meta tags
    if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
    if (author) setMetaTag('article:author', author, true);
    if (category) setMetaTag('article:section', category, true);
    setMetaTag('article:publisher', 'https://willrefrimix.com', true);

    // Additional SEO meta tags
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('googlebot', 'index, follow');
    setMetaTag('bingbot', 'index, follow');

    // Schema.org JSON-LD for BlogPosting
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: description,
      url: url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      ...(image && { 
        image: {
          '@type': 'ImageObject',
          url: image,
          width: 1200,
          height: 630
        }
      }),
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime }),
      ...(author && { 
        author: { 
          '@type': 'Person', 
          name: author,
          url: 'https://willrefrimix.com'
        } 
      }),
      publisher: {
        '@type': 'Organization',
        name: 'WillRefriMix',
        url: 'https://willrefrimix.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://willrefrimix.com/logo.png'
        }
      },
      ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
      inLanguage: 'pt-BR',
      ...(category && { articleSection: category })
    };

    // Organization Schema for brand
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'WillRefriMix',
      url: 'https://willrefrimix.com',
      logo: 'https://willrefrimix.com/logo.png',
      description: 'Especialistas em ar-condicionado, HVAC-R, VRF e sistemas Daikin no Brasil',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'Portuguese'
      },
      sameAs: [
        'https://www.facebook.com/willrefrimix',
        'https://www.instagram.com/willrefrimix',
        'https://www.linkedin.com/company/willrefrimix'
      ]
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://willrefrimix.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://willrefrimix.com/blog'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: url
        }
      ]
    };

    // Combine all schemas
    const combinedSchema = {
      '@context': 'https://schema.org',
      '@graph': [schema, organizationSchema, breadcrumbSchema]
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(combinedSchema);

    return () => {
      // Cleanup on unmount
      document.title = 'WillRefriMix - Especialistas em Ar-Condicionado e HVAC-R';
    };
  }, [title, description, keywords, image, url, publishedTime, modifiedTime, author, category]);

  return null;
}
