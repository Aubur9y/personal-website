import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 移除 fetchPriority
  const { fetchPriority, ...restProps } = props;

  return (
    <div className="relative">
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        {...restProps}
        onError={() => setError(true)}
        onLoadingComplete={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
} 