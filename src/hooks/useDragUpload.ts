import { useState, useCallback } from 'react';

interface UseDragUploadProps {
  onUpload: (file: File) => void;
  accept?: string[];
}

export function useDragUpload({ onUpload, accept = ['image/*'] }: UseDragUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => 
      accept.some(type => 
        type.endsWith('*') 
          ? file.type.startsWith(type.slice(0, -1))
          : file.type === type
      )
    );

    if (imageFile) {
      onUpload(imageFile);
    }
  }, [onUpload, accept]);

  return {
    isDragging,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    }
  };
} 