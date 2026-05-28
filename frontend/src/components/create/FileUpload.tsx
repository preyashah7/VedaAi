'use client';

import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const FileUpload = (): JSX.Element => {
  const uploadedFile = useAppStore((state) => state.uploadedFile);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    useAppStore.setState({ uploadedFile: file });
  }, []);

  const clearFile = useCallback(() => {
    useAppStore.setState({ uploadedFile: null });
  }, []);

  const fileSizeLabel = useMemo(() => {
    if (!uploadedFile) {
      return '';
    }

    const sizeKb = uploadedFile.size / 1024;
    return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKb))} KB`;
  }, [uploadedFile]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps()}
      className={[
        'rounded-2xl border-2 border-dashed p-6 text-center transition',
        isDragActive ? 'border-veda-red bg-[#FFF6F3]' : 'border-[#D9D9D9] bg-white',
      ].join(' ')}
    >
      <input {...getInputProps()} />
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FFF5EF] text-veda-red">
          <UploadCloud size={28} />
        </div>
        <div>
          <p className="text-base font-medium text-veda-dark">Choose a file or drag & drop it here</p>
          <p className="mt-1 text-sm text-veda-label">TXT or PDF documents only</p>
        </div>
        <button
          type="button"
          onClick={open}
          className="rounded-full border border-[#E5E5E5] px-5 py-2 text-sm font-medium text-veda-dark transition hover:bg-[#FAFAF7]"
        >
          Browse Files
        </button>
        <p className="text-xs text-veda-label">Upload a reference passage or worksheet for document-based question generation</p>
        {uploadedFile ? (
          <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5E5E5] bg-[#FAFAF7] px-4 py-3 text-left">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-veda-dark">{uploadedFile.name}</p>
              <p className="text-xs text-veda-label">{fileSizeLabel}</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-veda-label transition hover:bg-[#F0F0F0] hover:text-veda-dark"
              aria-label="Remove uploaded file"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
