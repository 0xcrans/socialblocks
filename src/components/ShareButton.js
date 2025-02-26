import React, { useState } from 'react';

const ShareButton = ({ blockHeight }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${blockHeight}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="share-button"
      aria-label="Share post"
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </button>
  );
};

export default ShareButton; 
