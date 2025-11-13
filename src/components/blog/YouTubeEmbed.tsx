import { Youtube } from 'lucide-react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export default function YouTubeEmbed({ url, title = 'YouTube video' }: YouTubeEmbedProps) {
  const getYouTubeEmbedUrl = (url: string) => {
    // Support various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
        <div className="text-center space-y-2">
          <Youtube className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">URL de vídeo inválida</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
