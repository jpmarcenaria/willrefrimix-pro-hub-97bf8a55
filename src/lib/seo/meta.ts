interface MetaTagsOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
}

export function generateMetaTags(options: MetaTagsOptions) {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'article',
    publishedTime,
    modifiedTime,
    author,
    category,
  } = options;

  const siteName = 'WillRefriMix - HVAC-R Brasil';
  const defaultImage = 'https://willrefrimix.com/og-image.jpg';
  const finalImage = image || defaultImage;

  return {
    // Basic meta tags
    title: `${title} | ${siteName}`,
    description,
    keywords: keywords.join(', '),

    // Open Graph (Facebook, LinkedIn)
    'og:title': title,
    'og:description': description,
    'og:type': type,
    'og:url': url || '',
    'og:image': finalImage,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': title,
    'og:site_name': siteName,
    'og:locale': 'pt_BR',

    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': finalImage,
    'twitter:image:alt': title,
    'twitter:site': '@willrefrimix',

    // Article specific
    ...(type === 'article' && {
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:author': author,
      'article:section': category,
      'article:publisher': 'https://willrefrimix.com',
    }),

    // SEO
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    googlebot: 'index, follow',
    bingbot: 'index, follow',
  };
}

export function setMetaTags(tags: Record<string, string>) {
  Object.entries(tags).forEach(([key, value]) => {
    if (!value) return;

    const isProperty = key.startsWith('og:') || key.startsWith('article:');
    const attribute = isProperty ? 'property' : 'name';
    
    let meta = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', value);
  });
}

export function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}
