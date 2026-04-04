'use client';
import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import styles from './ReceiptUploader.module.css';

interface ReceiptUploaderProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png', 'application/pdf'];

export default function ReceiptUploader({ onFileSelect, file }: ReceiptUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    if (!ACCEPTED.includes(f.type)) return 'Only JPG, PNG, or PDF files accepted.';
    if (f.size > MAX_SIZE) return 'File must be under 5MB.';
    return null;
  };

  const handleFile = (f: File) => {
    const err = validate(f);
    if (err) { setError(err); onFileSelect(null); }
    else { setError(null); onFileSelect(f); }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const triggerPicker = () => inputRef.current?.click();

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = file && file.type.startsWith('image/');

  if (file) {
    return (
      <div className={styles.preview}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={URL.createObjectURL(file)}
            alt="Receipt preview"
            className={styles.previewImg}
          />
        ) : (
          <div className={styles.fileIcon}>
            <FileText size={22} />
          </div>
        )}
        <div className={styles.previewInfo}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatSize(file.size)}</span>
        </div>
        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => { onFileSelect(null); setError(null); }}
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Single input — mobile OS shows native picker (gallery / files / camera) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleChange}
        className={styles.hiddenInput}
        aria-label="Upload payment receipt"
      />

      {/* Touch-first upload zone — large tap target for both desktop and mobile */}
      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={triggerPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && triggerPicker()}
        aria-label="Upload payment receipt"
      >
        <div className={styles.dropIcon}>
          <Upload size={26} strokeWidth={1.5} />
        </div>
        <p className={styles.dropTitle}>Tap to upload receipt</p>
        <p className={styles.dropSub}>
          <span className={styles.desktopHint}>Drag & drop or click · </span>
          JPG, PNG, PDF · max 5MB
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
