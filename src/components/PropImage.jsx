import { useState } from 'react';
import { Placeholder } from './Placeholder';

export function PropImage({ src, alt = "Foto del apartamento", style, className, priority = false }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <Placeholder label={alt} style={style} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        display: "block",
        ...style,
      }}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
