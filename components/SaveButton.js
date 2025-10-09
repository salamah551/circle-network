'use client';
import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';

export default function SaveButton({ itemType, itemId, size = 'md' }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [itemType, itemId]);

  const checkIfSaved = async () => {
    if (!itemType || !itemId) return;

    try {
      const response = await fetch(
        `/api/saved-items?itemType=${itemType}&itemId=${itemId}`
      );
      const data = await response.json();
      setIsSaved(data.isSaved || false);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!itemType || !itemId) return;

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `/api/saved-items?itemType=${itemType}&itemId=${itemId}`,
          { method: 'DELETE' }
        );
        const data = await response.json();
        setIsSaved(false);
      } else {
        // Save
        const response = await fetch('/api/saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemType, itemId })
        });
        const data = await response.json();
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleSave}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-lg transition-colors ${
        isSaved
          ? 'bg-amber-500 text-black hover:bg-amber-600'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
      } disabled:opacity-50`}
      title={isSaved ? 'Remove from saved' : 'Save for later'}
    >
      <Bookmark
        className={`${iconSizes[size]} ${isSaved ? 'fill-current' : ''}`}
      />
    </button>
  );
}
