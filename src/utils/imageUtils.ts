// Image utilities for share functionality
import html2canvas from 'html2canvas';

export interface ImageProcessingOptions {
  scale?: number;
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string | null;
}

export interface ClipboardResult {
  success: boolean;
  method: 'image' | 'dataUrl' | 'failed';
  message: string;
}

/**
 * Enhanced image processing with better CORS support
 */
export async function processElementToImage(
  element: HTMLElement, 
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    scale = 2,
    quality = 0.9,
    width,
    height,
    backgroundColor = null
  } = options;

  try {
    // Ensure element is visible and properly sized
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    console.log('📐 Element dimensions:', {
      width: rect.width,
      height: rect.height,
      scale,
      targetWidth: width || rect.width * scale,
      targetHeight: height || rect.height * scale
    });

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      logging: false,
      width: width || rect.width,
      height: height || rect.height,
      // Enhanced CORS settings
      foreignObjectRendering: false,
      removeContainer: true,
      // Better image handling
      imageTimeout: 15000,
      // Ensure full capture
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Add crossOrigin to all images in the cloned document
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (!img.crossOrigin) {
            img.crossOrigin = 'anonymous';
          }
        });
        
        // Ensure the cloned element is properly positioned
        const clonedElement = clonedDoc.querySelector(`[data-html2canvas-clone]`) || 
                            clonedDoc.querySelector(element.tagName.toLowerCase());
        if (clonedElement && clonedElement instanceof HTMLElement) {
          clonedElement.style.position = 'relative';
          clonedElement.style.top = '0';
          clonedElement.style.left = '0';
        }
      }
    });

    const dataUrl = canvas.toDataURL('image/png', quality);
    
    console.log('✅ Image processing completed successfully');
    console.log('📊 Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('📊 Data URL length:', dataUrl.length, 'characters');
    
    return dataUrl;
  } catch (error) {
    console.error('❌ Failed to process element to image:', error);
    console.error('🔍 Element details:', {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      visible: element.offsetWidth > 0 && element.offsetHeight > 0
    });
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Enhanced clipboard operations with fallbacks
 */
export async function copyImageToClipboard(
  dataUrl: string
): Promise<ClipboardResult> {
  try {
    // Check if modern clipboard API is available
    if (!navigator.clipboard) {
      return {
        success: false,
        method: 'failed',
        message: 'Clipboard API not supported'
      };
    }

    // Try to copy as image first (modern browsers)
    if (window.ClipboardItem) {
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch image data');
        }
        
        const blob = await response.blob();
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        return {
          success: true,
          method: 'image',
          message: 'Image copied to clipboard successfully'
        };
      } catch (imageError) {
        console.warn('⚠️ Image clipboard failed, falling back to data URL:', imageError);
      }
    }

    // Fallback to copying data URL as text
    await navigator.clipboard.writeText(dataUrl);
    
    return {
      success: true,
      method: 'dataUrl',
      message: 'Image data URL copied to clipboard'
    };

  } catch (error) {
    console.error('❌ Clipboard operation failed:', error);
    return {
      success: false,
      method: 'failed',
      message: `Clipboard operation failed: ${error.message}`
    };
  }
}

/**
 * Download image with enhanced error handling
 */
export function downloadImage(dataUrl: string, filename?: string): void {
  try {
    const link = document.createElement('a');
    link.download = filename || `flappy-pi-score-${Date.now()}.png`;
    link.href = dataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Image downloaded successfully');
  } catch (error) {
    console.error('❌ Failed to download image:', error);
    throw new Error(`Download failed: ${error.message}`);
  }
}

/**
 * Preload images with CORS support
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    img.src = src;
  });
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(sources: string[]): Promise<void> {
  const promises = sources.map(src => preloadImage(src).catch(error => {
    console.warn(`⚠️ Failed to preload image: ${src}`, error);
  }));
  
  await Promise.all(promises);
  console.log('✅ Image preloading completed');
}

/**
 * Create a blob URL from data URL
 */
export async function dataUrlToBlobUrl(dataUrl: string): Promise<string> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('❌ Failed to convert data URL to blob URL:', error);
    throw error;
  }
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export function revokeBlobUrl(blobUrl: string): void {
  try {
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn('⚠️ Failed to revoke blob URL:', error);
  }
}

/**
 * Check if browser supports modern clipboard features
 */
export function getClipboardSupport(): {
  clipboard: boolean;
  clipboardItem: boolean;
  imageSupport: boolean;
} {
  return {
    clipboard: !!navigator.clipboard,
    clipboardItem: !!window.ClipboardItem,
    imageSupport: !!(navigator.clipboard && window.ClipboardItem)
  };
}

/**
 * Get browser capabilities for image sharing
 */
export function getImageSharingCapabilities(): {
  download: boolean;
  clipboard: boolean;
  share: boolean;
  piGallery: boolean;
} {
  const isPiBrowser = typeof window !== 'undefined' && (
    window.Pi || 
    navigator.userAgent.toLowerCase().includes('pibrowser') || 
    navigator.userAgent.toLowerCase().includes('pi browser') ||
    navigator.userAgent.toLowerCase().includes('pi-browser')
  );

  return {
    download: true, // Always supported
    clipboard: !!navigator.clipboard,
    share: !!navigator.share,
    piGallery: !!(window.Pi && typeof window.Pi.saveImageToGallery === 'function') && isPiBrowser
  };
}

/**
 * Save image to Pi Gallery (Pi Browser specific)
 */
export async function saveToPiGallery(dataUrl: string): Promise<boolean> {
  try {
    if (!window.Pi || typeof window.Pi.saveImageToGallery !== 'function') {
      throw new Error('Pi Gallery not available');
    }

    await window.Pi.saveImageToGallery(dataUrl);
    console.log('✅ Image saved to Pi Gallery successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to save to Pi Gallery:', error);
    return false;
  }
}

/**
 * Enhanced share image function with Pi Browser support
 */
export async function shareImage(
  element: HTMLElement | string,
  title: string = 'Flappy Pi Score'
): Promise<boolean> {
  try {
    let dataUrl: string;
    
    if (typeof element === 'string') {
      dataUrl = element;
    } else {
      dataUrl = await processElementToImage(element, {
        scale: 2,
        quality: 0.9
      });
    }

    // Check if we're in Pi Browser and Pi Gallery is available
    if (window.Pi && typeof window.Pi.saveImageToGallery === 'function') {
      const saved = await saveToPiGallery(dataUrl);
      if (saved) {
        return true;
      }
    }

    // Fallback to native sharing
    if (!navigator.share) {
      throw new Error('Native sharing not supported');
    }

    await navigator.share({
      title,
      url: dataUrl,
      text: 'Check out my Flappy Pi score!'
    });

    console.log('✅ Image shared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to share image:', error);
    return false;
  }
} 