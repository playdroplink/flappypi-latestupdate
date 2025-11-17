import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  lazy?: boolean;
  placeholder?: React.ReactNode;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  retryAttempts?: number;
  retryDelay?: number;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className,
  lazy,
  placeholder,
  onLoad,
  onError,
  retryAttempts = 0,
  retryDelay = 1000,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) onError(e);

    if (attempt < retryAttempts) {
      setTimeout(() => {
        setAttempt(prev => prev + 1);
        setImgSrc(src);
        setHasError(false);
        setIsLoading(true);
      }, retryDelay);
    } else if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
    setAttempt(0);
  }, [src]);

  return (
    <>
      {isLoading && placeholder}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading={lazy ? "lazy" : "eager"}
        style={{ display: isLoading ? 'none' : 'block' }}
        {...props}
      />
    </>
  );
};

export default ImageWithFallback; 