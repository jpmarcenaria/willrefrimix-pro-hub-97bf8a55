interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  category?: string;
}

export function generateArticleSchema(options: ArticleSchemaOptions) {
  const {
    title,
    description,
    url,
    image,
    publishedTime,
    modifiedTime,
    author,
    keywords = [],
    category,
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      },
    }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
        url: 'https://willrefrimix.com',
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: 'WillRefriMix',
      url: 'https://willrefrimix.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://willrefrimix.com/logo.png',
      },
    },
    ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
    inLanguage: 'pt-BR',
    ...(category && { articleSection: category }),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WillRefriMix',
    url: 'https://willrefrimix.com',
    logo: 'https://willrefrimix.com/logo.png',
    description: 'Especialistas em ar-condicionado, HVAC-R, VRF e sistemas Daikin no Brasil',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
    sameAs: [
      'https://www.facebook.com/willrefrimix',
      'https://www.instagram.com/willrefrimix',
      'https://www.linkedin.com/company/willrefrimix',
    ],
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WillRefriMix',
    url: 'https://willrefrimix.com',
    description: 'Especialistas em ar-condicionado, HVAC-R, VRF e sistemas Daikin no Brasil',
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://willrefrimix.com/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function combineSchemas(...schemas: any[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

export function injectSchema(schema: any) {
  let scriptTag = document.querySelector('script[type="application/ld+json"]');
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(schema);
}
