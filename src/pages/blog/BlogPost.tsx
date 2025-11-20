import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, ArrowLeft, Youtube } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  title: string;
  summary: string;
  body: string;
  featured_image_url: string;
  youtube_url: string;
  tags: string[];
  publish_at: string | null;
  created_at: string;
  profiles: {
    name: string;
  } | null;
}

interface Image {
  url: string;
  caption: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    if (!slug) return;

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!postError && postData) {
      setPost(postData);

      // Fetch gallery images
      const { data: imagesData } = await supabase
        .from('images')
        .select('url, caption')
        .eq('post_id', postData.id)
        .order('display_order');

      if (imagesData) {
        setImages(imagesData);
      }
    }

    setLoading(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Post não encontrado</h1>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const embedUrl = post.youtube_url ? getYouTubeEmbedUrl(post.youtube_url) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao blog
            </Button>
          </Link>

          {post.featured_image_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {post.title}
            </h1>
            
            {post.summary && (
              <p className="text-xl text-muted-foreground">
                {post.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(
                    new Date(post.publish_at || post.created_at),
                    'dd MMMM yyyy'
                  )}
                </span>
              </div>
              {post.profiles?.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.profiles.name}</span>
                </div>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>

          {embedUrl && (
            <div className="my-12">
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Vídeo</h2>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={embedUrl}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6">Galeria de Imagens</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.caption || `Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <p className="text-sm text-muted-foreground text-center">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-12" />

          <div className="flex justify-center">
            <Link to="/blog">
              <Button size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ver mais artigos
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
