'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [processedItems, setProcessedItems] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = () => {
    setIsUploading(false);
    setProgress(0);
    setTotalItems(0);
    setProcessedItems(0);
    abortControllerRef.current = null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting file upload:', file.name);
    setIsUploading(true);
    setProgress(0);
    setProcessedItems(0);
    setTotalItems(0);
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending request to /api/upload');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      console.log('Response received:', response.status);
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            console.log('Received data:', data);

            if (data.type === 'progress') {
              setProcessedItems(data.processed);
              setTotalItems(data.total);
              setProgress((data.processed / data.total) * 100);
            } else if (data.type === 'complete') {
              setProcessedItems(data.processed);
              setTotalItems(data.total);
              setProgress(100);
              toast.success(`Successfully processed ${data.processed} items`);
              setTimeout(resetState, 2000);
            } else if (data.type === 'error') {
              toast.error(data.error || 'Error uploading file');
              resetState();
            }
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Upload cancelled');
      } else {
        toast.error('Error uploading file');
      }
      resetState();
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload JSON File'}
        </Button>
        {isUploading && (
          <Button
            variant="destructive"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
      </div>
      {(isUploading || progress > 0) && (
        <div className="w-full max-w-md space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-gray-500">
            Processing {processedItems} of {totalItems} items
          </p>
        </div>
      )}
      <p className="text-sm text-gray-500">
        Upload a JSON file containing historical text data
      </p>
    </div>
  );
} 