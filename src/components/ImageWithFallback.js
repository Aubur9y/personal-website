import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? fallbackSrc : src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
    />
  );
} 