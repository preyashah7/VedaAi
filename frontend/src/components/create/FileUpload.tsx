'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  selectedFileName: string | null;
  onFileSelected: (fileName: string, fileContent: string) => void;
}

const readTextFile = async (file: File): Promise<string> => {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }

  return file.name;
};

export const FileUpload = ({ selectedFileName, onFileSelected }: FileUploadProps): JSX.Element => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      const content = await readTextFile(file);
      onFileSelected(file.name, content);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
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
          <p className="mt-1 text-sm text-veda-label">PNG, PDF, MP4, SVG, WEBP</p>
        </div>
        <button
          type="button"
          onClick={open}
          className="rounded-full border border-[#E5E5E5] px-5 py-2 text-sm font-medium text-veda-dark transition hover:bg-[#FAFAF7]"
        >
          Browse Files
        </button>
        <p className="text-xs text-veda-label">Upload images of your preferred document/image</p>
        {selectedFileName ? (
          <div className="rounded-full bg-[#FAFAF7] px-4 py-2 text-sm text-veda-dark">{selectedFileName}</div>
        ) : null}
      </div>
    </div>
  );
};
