import { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, Eye, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostData {
  title: string;
  slug: string;
  summary: string;
  body: string;
  featured_image_url: string;
  youtube_url: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publish_at: string;
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
  
  const [formData, setFormData] = useState<PostData>({
    title: '',
    slug: '',
    summary: '',
    body: '',
    featured_image_url: '',
    youtube_url: '',
    tags: [],
    status: 'draft',
    publish_at: '',
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

  const fetchPost = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error fetching post',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin/posts');
    } else {
      setFormData({
        ...data,
        publish_at: data.publish_at ? new Date(data.publish_at).toISOString().slice(0, 16) : '',
      });
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Error uploading image',
        description: uploadError.message,
        variant: 'destructive',
      });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (isFeatured) {
        setFormData(prev => ({ ...prev, featured_image_url: publicUrl }));
      } else {
        setGalleryImages(prev => [...prev, { url: publicUrl, caption: '' }]);
      }

      toast({
        title: 'Image uploaded successfully',
      });
    }
    setUploading(false);
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

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!formData.title || !formData.body) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in title and body',
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

    const postData = {
      ...formData,
      status: status || formData.status,
      author_id: user?.id,
      publish_at: formData.publish_at || null,
      // Ensure slug exists when saving a new post
      slug: (formData.slug && formData.slug.trim().length > 0) ? formData.slug : generateSlug(formData.title),
    };

    let postId = id;

    if (isNew) {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error creating post',
          description: error.message,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      postId = data.id;
    } else {
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id);

      if (error) {
        toast({
          title: 'Error updating post',
          description: error.message,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
    }

    // Save gallery images
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

    toast({
      title: 'Post saved successfully',
    });

    setSaving(false);
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
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {formData.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
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
                <Label htmlFor="body">Content (Markdown) *</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="publish_at">Publish At</Label>
                  <Input
                    id="publish_at"
                    type="datetime-local"
                    value={formData.publish_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, publish_at: e.target.value }))}
                  />
                </div>
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
    </div>
  );
}
