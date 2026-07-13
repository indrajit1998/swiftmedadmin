import { EyeIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

/**
 * S3MediaViewer Component
 *
 * Fetches a presigned URL for a given S3 key and renders it as an image or a link.
 *
 * @param {string} s3Key - The S3 key stored in the database.
 * @param {string} label - Accessible label/alt text.
 * @param {string} mode - 'img' (default), 'link', or 'circular'.
 * @param {string} className - Optional CSS classes for the image/wrapper.
 */
const S3MediaViewer = ({ s3Key, label, mode = 'img', className = '' }) => {
  const [viewUrl, setViewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!s3Key) {
      setLoading(false);
      return;
    }

    const fetchUrl = async () => {
      try {
        // Fetch presigned URL from backend
        // Route: GET /api/media/view?s3Key=...
        const res = await api.get('/media/view', { params: { s3Key } });
        setViewUrl(res.data.viewUrl);
      } catch (err) {
        console.error('Error fetching presigned URL for key:', s3Key, err);
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [s3Key]);

  if (!s3Key) {
    return mode === 'link' ? (
      <span className="text-gray-500 text-sm italic">Not Uploaded</span>
    ) : (
      <div className={`${className} bg-gray-50 flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-200`}>
        No Image
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400 font-medium`}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 flex flex-col items-center justify-center text-[10px] text-red-500 border border-red-100 p-1 text-center`}>
        <span>Error</span>
        <span className="opacity-70 truncate w-full">{error}</span>
      </div>
    );
  }

  if (mode === 'link') {
    return (
      <a
        href={viewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors"
      >
        <EyeIcon className="h-4 w-4 mr-1.5" />
        {label || 'View Document'}
      </a>
    );
  }

  const isCircular = mode === 'circular';
  const imageClasses = `object-cover border border-gray-100 shadow-sm hover:opacity-90 transition-opacity ${className} ${
    isCircular ? 'rounded-full' : 'rounded-md'
  }`;

  return (
    <a href={viewUrl} target="_blank" rel="noopener noreferrer" className={`block ${isCircular ? 'flex justify-center' : ''}`}>
      <img src={viewUrl} alt={label || 'Media Content'} className={imageClasses} />
    </a>
  );
};

export default S3MediaViewer;
