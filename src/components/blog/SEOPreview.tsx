import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Share2, Monitor, Smartphone, Tablet } from 'lucide-react';

interface SEOPreviewProps {
  title: string;
  metaDescription: string;
  slug: string;
  featuredImage?: string;
}

export default function SEOPreview({ title, metaDescription, slug, featuredImage }: SEOPreviewProps) {
  const url = `https://willrefrimix.com/blog/${slug}`;
  const displayTitle = title || 'Título do Post';
  const displayDescription = metaDescription || 'Adicione uma descrição para melhorar o SEO...';
  const charCount = metaDescription.length;
  const charLimit = 160;
  const isOptimal = charCount >= 120 && charCount <= 160;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Preview SEO
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Veja como seu post aparecerá no Google e redes sociais
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          </TabsList>
          
          <TabsContent value="google" className="space-y-4">
            <div className="border rounded-lg p-4 bg-card">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">willrefrimix.com</span>
                  <span className="text-xs text-muted-foreground">›</span>
                  <span className="text-xs text-muted-foreground">blog</span>
                </div>
                <h3 className="text-xl text-primary hover:underline cursor-pointer line-clamp-1">
                  {displayTitle}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {displayDescription}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={charCount === 0 ? 'text-muted-foreground' : isOptimal ? 'text-green-600' : charCount > charLimit ? 'text-destructive' : 'text-yellow-600'}>
                  {charCount}/{charLimit} caracteres
                </span>
                {charCount > 0 && (
                  <span className="text-xs">
                    {isOptimal ? '✓ Tamanho ideal' : charCount > charLimit ? '⚠ Muito longo (será cortado)' : '⚠ Muito curto (ideal: 120-160)'}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="desktop" className="text-xs">
                  <Monitor className="h-3 w-3 mr-1" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="tablet" className="text-xs">
                  <Tablet className="h-3 w-3 mr-1" />
                  Tablet
                </TabsTrigger>
                <TabsTrigger value="mobile" className="text-xs">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="desktop">
                <div className="border rounded-lg overflow-hidden bg-card max-w-md mx-auto">
                  {featuredImage && (
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={featuredImage} 
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!featuredImage && (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Share2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-muted-foreground uppercase">willrefrimix.com</p>
                    <h3 className="font-semibold line-clamp-2">{displayTitle}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {displayDescription}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tablet">
                <div className="border rounded-lg overflow-hidden bg-card max-w-sm mx-auto">
                  {featuredImage && (
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={featuredImage} 
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!featuredImage && (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Share2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3 space-y-1.5">
                    <p className="text-xs text-muted-foreground uppercase">willrefrimix.com</p>
                    <h3 className="font-semibold text-sm line-clamp-2">{displayTitle}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {displayDescription}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mobile">
                <div className="border rounded-lg overflow-hidden bg-card max-w-xs mx-auto">
                  {featuredImage && (
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={featuredImage} 
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!featuredImage && (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Share2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-2.5 space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase">willrefrimix.com</p>
                    <h3 className="font-semibold text-xs line-clamp-2">{displayTitle}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {displayDescription}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground text-center">
              * Preview aproximado para Facebook, LinkedIn e Twitter/X
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
