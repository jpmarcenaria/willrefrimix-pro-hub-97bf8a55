import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Upload, X, Image as ImageIcon, RefreshCw, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import SEOPreview from '@/components/blog/SEOPreview';
import ImageCropper from '@/components/admin/ImageCropper';
import DateTimePicker from '@/components/admin/DateTimePicker';

interface PostData {
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
  status: 'draft' | 'published' | 'scheduled';
  publish_at: string;
  reading_time_minutes: number;
}

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [cropImage, setCropImage] = useState<File | null>(null);
  const [isCropForFeatured, setIsCropForFeatured] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  
  const [formData, setFormData] = useState<PostData>({
    title: '',
    slug: '',
    summary: '',
    body: '',
    featured_image_url: '',
    youtube_url: '',
    tags: [],
    keywords: [],
    category: 'technical',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    publish_at: '',
    reading_time_minutes: 0,
  });

  const [galleryImages, setGalleryImages] = useState<Array<{
    id?: string;
    url: string;
    caption: string;
  }>>([]);

  useEffect(() => {
    if (!isNew && id) {
      fetchPost();
      fetchGalleryImages();
    }
  }, [id, isNew]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isNew || !formData.title) return;

    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, isNew]);

  const handleAutoSave = useCallback(async () => {
    if (!formData.title || !formData.body || isNew) return;
    
    setAutoSaving(true);
    setSyncStatus('saving');
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          body: formData.body,
          summary: formData.summary,
          category: formData.category as any,
          tags: formData.tags,
          keywords: formData.keywords,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
        })
        .eq('id', id);

      if (error) throw error;

      setLastSaved(new Date());
      setSyncStatus('synced');
    } catch (error) {
      console.error('Auto-save error:', error);
      setSyncStatus('error');
    } finally {
      setAutoSaving(false);
    }
  }, [formData, id, isNew]);

  const fetchPost = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      toast({
        title: 'Error fetching post',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin/posts');
      setLoading(false);
      return;
    }

    if (!data) {
      toast({
        title: 'Post not found or access denied',
        description: 'It may be a draft you do not own or the post does not exist.',
        variant: 'destructive',
      });
      navigate('/admin/posts');
      setLoading(false);
      return;
    }

    setFormData({
      ...data,
      keywords: data.keywords || [],
      category: (data.category as PostData['category']) || 'technical',
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      publish_at: data.publish_at ? new Date(data.publish_at).toISOString().slice(0, 16) : '',
    });
    setLoading(false);
  };

  const fetchGalleryImages = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('post_id', id)
      .order('display_order');

    if (!error && data) {
      setGalleryImages(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isNew ? generateSlug(title) : prev.slug,
    }));
  };

  const handleRegenerateSlug = () => {
    if (!formData.title) {
      toast({
        title: 'Título necessário',
        description: 'Adicione um título antes de gerar o slug',
        variant: 'destructive',
      });
      return;
    }
    
    const newSlug = generateSlug(formData.title);
    setFormData(prev => ({ ...prev, slug: newSlug }));
    toast({
      title: 'Slug regenerado',
      description: `Novo slug: ${newSlug}`,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Open cropper instead of direct upload
    setCropImage(file);
    setIsCropForFeatured(isFeatured);
    e.target.value = ''; // Reset input
  };

  const handleCropComplete = async (croppedFile: File) => {
    setUploading(true);
    setSaveProgress(0);
    setSaveProgress(10);
    const fileExt = croppedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setSaveProgress(30);
    const { error: uploadError, data } = await supabase.storage
      .from('blog-images')
      .upload(filePath, croppedFile);

    setSaveProgress(60);
    if (uploadError) {
      toast({
        title: 'Erro ao fazer upload',
        description: uploadError.message,
        variant: 'destructive',
      });
      setSyncStatus('error');
    } else {
      setSaveProgress(80);
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (isCropForFeatured) {
        setFormData(prev => ({ ...prev, featured_image_url: publicUrl }));
      } else {
        setGalleryImages(prev => [...prev, { url: publicUrl, caption: '' }]);
      }

      setSaveProgress(100);
      toast({
        title: '✓ Imagem enviada com sucesso',
        description: 'Imagem otimizada e pronta para uso',
      });
      setSyncStatus('synced');
    }
    setUploading(false);
    setCropImage(null);
    setSaveProgress(0);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      if (formData.keywords.length >= 8) {
        toast({
          title: 'Maximum keywords reached',
          description: 'You can add up to 8 keywords for optimal SEO',
          variant: 'destructive',
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!formData.title || !formData.body) {
      toast({
        title: '⚠ Campos obrigatórios faltando',
        description: 'Preencha título e conteúdo do post',
        variant: 'destructive',
      });
      return;
    }

    // SEO validation when publishing
    if ((status === 'published' || formData.status === 'published') && !formData.meta_description) {
      toast({
        title: 'Meta Description Required',
        description: 'Please add a meta description (120-160 characters) for better SEO before publishing',
        variant: 'destructive',
      });
      return;
    }

    if ((status === 'published' || formData.status === 'published') && formData.keywords.length < 5) {
      toast({
        title: 'SEO Keywords Recommended',
        description: 'Add at least 5 keywords for optimal SEO (currently: ' + formData.keywords.length + ')',
        variant: 'destructive',
      });
      return;
    }

    // Basic YouTube URL validation if provided
    const ytUrl = formData.youtube_url?.trim();
    if (ytUrl) {
      const isValidYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[^\s&]+/.test(ytUrl);
      if (!isValidYoutube) {
        toast({
          title: 'Invalid YouTube URL',
          description: 'Provide a valid YouTube link like https://www.youtube.com/watch?v=...',
          variant: 'destructive',
        });
        return;
      }
    }

    setSaving(true);
    setSyncStatus('saving');
    setSaveProgress(0);

    const postData: any = {
      ...formData,
      status: status || formData.status,
      author_id: user?.id,
      publish_at: formData.publish_at || null,
      meta_title: formData.meta_title || formData.title.slice(0, 60),
      meta_description: formData.meta_description || formData.summary?.slice(0, 160),
      slug: (formData.slug && formData.slug.trim().length > 0) ? formData.slug : generateSlug(formData.title),
    };

    let postId = id;

    setSaveProgress(40);
    if (isNew) {
      setSaveProgress(50);
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      setSaveProgress(70);
      if (error) {
        toast({
          title: '✗ Erro ao criar post',
          description: error.message,
          variant: 'destructive',
        });
        setSyncStatus('error');
        setSaving(false);
        setSaveProgress(0);
        return;
      }
      setSaveProgress(90);
      postId = data.id;
    } else {
      setSaveProgress(60);
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id);

      setSaveProgress(80);
      if (error) {
        toast({
          title: '✗ Erro ao atualizar post',
          description: error.message,
          variant: 'destructive',
        });
        setSyncStatus('error');
        setSaving(false);
        setSaveProgress(0);
        return;
      }
    }

    // Save gallery images
    setSaveProgress(90);
    for (const [index, image] of galleryImages.entries()) {
      if (!image.id) {
        await supabase.from('images').insert([{
          post_id: postId,
          url: image.url,
          caption: image.caption,
          display_order: index,
        }]);
      } else {
        await supabase.from('images')
          .update({
            caption: image.caption,
            display_order: index,
          })
          .eq('id', image.id);
      }
    }

    setSaveProgress(100);
    setLastSaved(new Date());
    setSyncStatus('synced');
    
    const finalStatus = status || formData.status;
    toast({
      title: '✓ Post salvo com sucesso',
      description: finalStatus === 'published' 
        ? 'Seu post está publicado e visível' 
        : formData.status === 'scheduled' 
        ? `Agendado para ${formData.publish_at ? new Date(formData.publish_at).toLocaleString() : ''}`
        : 'Salvo como rascunho',
    });

    setSaving(false);
    setSaveProgress(0);
    if (isNew) {
      navigate(`/admin/posts/${postId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/posts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isNew ? 'New Post' : 'Edit Post'}
          </h1>
          {!isNew && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {syncStatus === 'synced' && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Sincronizado
                </span>
              )}
              {syncStatus === 'saving' && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Erro ao salvar
                </span>
              )}
              {lastSaved && syncStatus === 'synced' && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/blog/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
          )}
          <Button onClick={() => handleSave('draft')} disabled={saving} variant="outline">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {formData.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {saveProgress > 0 && saveProgress < 100 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processando...</span>
            <span className="font-medium">{saveProgress}%</span>
          </div>
          <Progress value={saveProgress} className="h-2" />
        </div>
      )}

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  Title *
                  {formData.title && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {!formData.title && (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">Slug</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateSlug}
                    disabled={!formData.title}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Regenerar
                  </Button>
                </div>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL amigável gerada automaticamente do título
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the post"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body" className="flex items-center gap-2">
                  Content (Markdown) *
                  {formData.body && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {!formData.body && (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Write your post content in markdown..."
                  rows={15}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <SEOPreview
            title={formData.meta_title || formData.title}
            metaDescription={formData.meta_description}
            slug={formData.slug}
            featuredImage={formData.featured_image_url}
          />

          <Card>
            <CardHeader>
              <CardTitle>SEO Meta Tags</CardTitle>
              <p className="text-sm text-muted-foreground">
                Otimize seu conteúdo para motores de busca (Google, Bing) e redes sociais
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="Deixe vazio para usar o título do post"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_title.length}/60 caracteres (ideal: 50-60)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description *</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Descreva o conteúdo do post de forma atrativa (ideal: 120-160 caracteres)"
                  maxLength={160}
                  rows={3}
                />
                <div className="flex justify-between text-xs">
                  <span className={
                    formData.meta_description.length === 0 ? 'text-muted-foreground' :
                    formData.meta_description.length >= 120 && formData.meta_description.length <= 160 ? 'text-green-600' :
                    formData.meta_description.length > 160 ? 'text-destructive' :
                    'text-yellow-600'
                  }>
                    {formData.meta_description.length}/160 caracteres
                  </span>
                  {formData.meta_description.length > 0 && (
                    <span>
                      {formData.meta_description.length >= 120 && formData.meta_description.length <= 160 ? '✓ Tamanho ideal' :
                       formData.meta_description.length > 160 ? '⚠ Muito longo' :
                       '⚠ Muito curto (ideal: 120-160)'}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Adicione 5-8 palavras-chave relacionadas ao conteúdo (ex: VRF, Daikin, ar-condicionado, HVAC)
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar keyword SEO"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button 
                    type="button" 
                    onClick={addKeyword}
                    disabled={formData.keywords.length >= 8}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="gap-1">
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.keywords.length}/8 keywords
                  {formData.keywords.length < 5 && ' (recomendado: pelo menos 5)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="case-study">Caso de Estudo</SelectItem>
                    <SelectItem value="installation">Instalação</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="sustainability">Sustentabilidade</SelectItem>
                    <SelectItem value="industry-news">Notícias do Setor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas de SEO para HVAC-R</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Use palavras-chave naturalmente no texto</p>
              <p>✓ Foque em termos técnicos: VRF, inverter, BTU, HVAC, refrigeração</p>
              <p>✓ Mencione marcas líderes: Daikin, Carrier, Midea quando relevante</p>
              <p>✓ Inclua localização quando apropriado (Brasil, São Paulo, etc.)</p>
              <p>✓ Meta description deve ser atrativa e incluir call-to-action</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.featured_image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={formData.featured_image_url}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={uploading}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Caption"
                      value={image.caption}
                      onChange={(e) => {
                        const newImages = [...galleryImages];
                        newImages[index].caption = e.target.value;
                        setGalleryImages(newImages);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={uploading}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>YouTube Video</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtube_url}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'scheduled' && (
                <DateTimePicker
                  label="Data e Hora de Publicação"
                  value={formData.publish_at}
                  onChange={(value) => setFormData(prev => ({ ...prev, publish_at: value }))}
                />
              )}

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {cropImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ImageCropper
              file={cropImage}
              onCropComplete={handleCropComplete}
              onCancel={() => setCropImage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
