import { useState, useRef, type ChangeEvent } from 'react';
import { uploadMedia } from '@/lib/supabase';

interface ImageUploadFieldProps {
  label: string;
  currentUrl?: string;
  folder?: string;
  onUploaded: (url: string) => void;
  hint?: string;
  isAvatar?: boolean;
}

export default function ImageUploadField({
  label,
  currentUrl,
  folder = 'uploads',
  onUploaded,
  hint = 'Click or drag an image here (PNG, JPG, SVG, WebP)',
  isAvatar = false,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setError(null);

    try {
      const publicUrl = await uploadMedia(file, folder);
      setPreview(publicUrl);
      onUploaded(publicUrl);
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const message = err instanceof Error ? err.message : 'Upload failed. Check Supabase storage bucket setup.';
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {preview ? (
        isAvatar ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
            <div
              style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(226, 229, 233, 0.4)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                background: '#12141a',
                marginBottom: '10px',
              }}
            >
              <img
                src={preview}
                alt="Instagram profile avatar preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Profile Picture'}
            </button>
            <span style={{ fontSize: '0.75rem', color: '#8b929e', marginTop: '6px' }}>
              Round Instagram avatar preview
            </span>
          </div>
        ) : (
          <div className="image-preview-wrapper" style={{ height: '140px', position: 'relative' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              className="btn-ghost"
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                background: 'rgba(0,0,0,0.8)',
              }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Replace Image'}
            </button>
          </div>
        )
      ) : (
        <div className="image-upload-box" onClick={() => fileInputRef.current?.click()}>
          <div style={{ color: '#aeb4bd', marginBottom: '4px' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{ margin: '0 auto 6px' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {uploading ? 'Uploading to Supabase...' : 'Choose or Drop Image'}
            </div>
          </div>
          <div className="form-hint">{hint}</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '6px' }}>{error}</p>}
    </div>
  );
}
