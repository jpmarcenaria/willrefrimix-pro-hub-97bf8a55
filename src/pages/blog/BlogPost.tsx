import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';
import ImageGallery from '@/components/blog/ImageGallery';
import SocialShare from '@/components/blog/SocialShare';
import SEOHead from '@/components/blog/SEOHead';

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  featured_image_url: string;
  youtube_url: string;
  tags: string[];
  keywords: string[];
  category: string;
  meta_title: string;
  meta_description: string;
  reading_time_minutes: number;
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.summary}
        keywords={post.keywords}
        image={post.featured_image_url}
        url={`https://willrefrimix.com/blog/${post.slug}`}
        publishedTime={post.publish_at || post.created_at}
        author={post.profiles?.name}
        category={post.category}
      />
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
                loading="lazy"
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
              {post.reading_time_minutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.reading_time_minutes} min de leitura</span>
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

          {post.youtube_url && (
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-4">Vídeo</h2>
              <YouTubeEmbed url={post.youtube_url} title={post.title} />
            </div>
          )}

          {images.length > 0 && (
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6">Galeria de Imagens</h2>
              <ImageGallery images={images} />
            </div>
          )}

          <Separator className="my-8" />
          
          <SocialShare 
            title={post.title} 
            url={`https://willrefrimix.com/blog/${post.slug}`} 
          />

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
