import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Crop, RotateCw, ZoomIn, Check, X } from 'lucide-react';

interface ImageCropperProps {
  file: File;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ file, onCropComplete, onCancel }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const handleCrop = async () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Set canvas size for optimal web display (max 1920px width)
    const maxWidth = 1920;
    const maxHeight = 1080;
    let width = img.naturalWidth * zoom;
    let height = img.naturalHeight * zoom;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    // Apply rotation and zoom
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: file.type });
        onCropComplete(croppedFile);
      }
    }, file.type, 0.9);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crop className="h-5 w-5" />
          Ajustar Imagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              Zoom: {zoom.toFixed(1)}x
            </Label>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={0.5}
              max={3}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Rotação: {rotation}°
            </Label>
            <Slider
              value={[rotation]}
              onValueChange={([value]) => setRotation(value)}
              min={0}
              max={360}
              step={15}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCrop} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          * Imagens serão otimizadas para web (máx. 1920px largura)
        </p>
      </CardContent>
    </Card>
  );
}
