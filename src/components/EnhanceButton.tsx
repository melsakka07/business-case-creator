import React from 'react';
import { Sparkles } from 'lucide-react';

interface EnhanceButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const EnhanceButton: React.FC<EnhanceButtonProps> = ({ onClick, loading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={loading ? "Processing enhancement..." : "Enhance with AI"}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 
                 text-indigo-600 hover:text-indigo-800 transition-colors duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      title="Enhance with AI"
    >
      <Sparkles 
        className={`w-5 h-5 ${loading ? 'animate-spin' : 'animate-pulse'}`} 
        aria-hidden="true"
      />
      {loading && <span className="sr-only">Loading...</span>}
    </button>
  );
};
