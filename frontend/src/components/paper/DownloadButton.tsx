'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { useState } from 'react';
import type { RefObject } from 'react';

interface DownloadButtonProps {
  paperRef: RefObject<HTMLDivElement | null>;
  fileName: string;
}

export const DownloadButton = ({ paperRef, fileName }: DownloadButtonProps): JSX.Element => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (): Promise<void> => {
    if (!paperRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, imageHeight);
      if (imageHeight > pageHeight) {
        let remainingHeight = imageHeight - pageHeight;
        let position = -pageHeight;
        while (remainingHeight > 0) {
          pdf.addPage();
          pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
          remainingHeight -= pageHeight;
          position -= pageHeight;
        }
      }
      pdf.save(fileName);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-full bg-veda-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)]"
    >
      <Download size={16} />
      {isDownloading ? 'Preparing PDF...' : 'Download as PDF'}
    </button>
  );
};
