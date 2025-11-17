import React, { useState, useCallback } from 'react';
import { getFallbackImage, getSafeImageSrc, isValidImageFormat } from '@/utils/imageValidation';

interface ErrorFreeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  retryAttempts?: number;
  retryDelay?: number;
  showPlaceholder?: boolean;
  placeholder?: React.ReactNode;
}

const ErrorFreeImage: React.FC<ErrorFreeImageProps> = ({
  src,
  fallbackSrc = '/placeholder.svg',
  alt,
  className = '',
  onLoad,
  onError,
  retryAttempts = 2,
  retryDelay = 1000,
  showPlaceholder = true,
  placeholder,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(getSafeImageSrc(src));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleError = useCallback(() => {
    console.warn(`❌ Image failed to load: ${currentSrc} (attempt ${attempt + 1})`);
    
    if (onError) onError();

    if (attempt < retryAttempts) {
      // Retry with the same source
      setTimeout(() => {
        setAttempt(prev => prev + 1);
        setIsLoading(true);
        setHasError(false);
        // Force reload by adding timestamp
        setCurrentSrc(`${src}?retry=${Date.now()}`);
      }, retryDelay);
    } else if (!hasError) {
      // Use fallback image
      const safeFallback = fallbackSrc || getFallbackImage(src);
      console.log(`🔄 Using fallback image: ${safeFallback}`);
      setCurrentSrc(safeFallback);
      setHasError(true);
      setIsLoading(false);
    } else {
      // No more options, show placeholder
      console.error(`💥 All image loading attempts failed for: ${src}`);
      setIsLoading(false);
      setHasError(true);
    }
  }, [currentSrc, attempt, retryAttempts, retryDelay, hasError, fallbackSrc, onError, src]);

  const handleLoad = useCallback(() => {
    console.log(`✅ Image loaded successfully: ${currentSrc}`);
    setIsLoading(false);
    setImageLoaded(true);
    setHasError(false);
    if (onLoad) onLoad();
  }, [currentSrc, onLoad]);

  // Reset state when src changes
  React.useEffect(() => {
    const safeSrc = getSafeImageSrc(src);
    setCurrentSrc(safeSrc);
    setHasError(false);
    setIsLoading(true);
    setAttempt(0);
    setImageLoaded(false);
  }, [src]);

  // Default placeholder component
  const defaultPlaceholder = (
    <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`}>
      <div className="text-gray-400 text-xs text-center p-2">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600 mx-auto mb-2"></div>
        Loading...
      </div>
    </div>
  );

  // Error placeholder component
  const errorPlaceholder = (
    <div className={`flex items-center justify-center bg-gray-200 rounded ${className}`}>
      <div className="text-gray-500 text-xs text-center p-2">
        <div className="text-2xl mb-1">🖼️</div>
        <div>Image unavailable</div>
      </div>
    </div>
  );

  return (
    <>
      {isLoading && showPlaceholder && (placeholder || defaultPlaceholder)}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...props}
      />
      {hasError && !imageLoaded && showPlaceholder && errorPlaceholder}
    </>
  );
};

export default ErrorFreeImage;
