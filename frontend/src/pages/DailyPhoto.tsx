import { useEffect, useState, useRef } from 'react';
import api from '@/services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { Camera, Upload, Flame, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyPhoto {
  id: string;
  url: string;
  date: string;
}

export default function DailyPhoto() {
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch_ = () => {
    setLoading(true);
    api.get<DailyPhoto[]>('/daily-photo')
      .then((res) => setPhotos(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      await api.post('/daily-photo', { image: preview });
      setPreview(null);
      fetch_();
    } catch {} finally { setUploading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetch_} />;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Daily Photo</h1>
          <p className="page-subtitle">Capture one moment every day</p>
        </div>
        <div className="streak-badge">
          <Flame className="h-3.5 w-3.5" />
          <span>{photos.length} day streak</span>
        </div>
      </div>

      {/* Upload area */}
      {preview ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6">
          <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg mb-4" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(null)} className="flex-1">Retake</Button>
            <Button onClick={upload} disabled={uploading} className="flex-1">
              {uploading ? 'Uploading...' : 'Save Photo'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full glass-card p-8 mb-6 flex flex-col items-center gap-3 hover:border-primary/30 transition-colors group"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">Take today's photo</p>
            <p className="text-sm text-muted-foreground">Tap to capture or upload from gallery</p>
          </div>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      {/* Gallery */}
      {photos.length === 0 ? (
        <EmptyState
          icon={<Camera className="h-8 w-8 text-muted-foreground" />}
          title="No photos yet"
          description="Start your daily photo streak today"
        />
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {photos.map((photo) => (
            <motion.button
              key={photo.id}
              onClick={() => setFullscreen(photo.url)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-lg overflow-hidden group relative"
            >
              <img src={photo.url} alt={photo.date} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                <Maximize2 className="h-5 w-5 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="absolute bottom-1 left-1 text-[10px] bg-foreground/50 text-background px-1.5 rounded">
                {photo.date}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen */}
      {fullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setFullscreen(null)}
        >
          <button className="absolute top-4 right-4 text-background">
            <X className="h-6 w-6" />
          </button>
          <img src={fullscreen} alt="Full" className="max-w-full max-h-full object-contain rounded-lg" />
        </motion.div>
      )}
    </div>
  );
}
