import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
}

export function Seo({ title, description, canonical }: SeoProps) {
  useEffect(() => {
    // Title tag
    document.title = title;

    // Meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    // Canonical link
    const href = canonical || window.location.href;
    let link = Array.from(document.getElementsByTagName('link')).find(l => l.rel === 'canonical');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [title, description, canonical]);

  return null;
}
