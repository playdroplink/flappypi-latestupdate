// User Photo Storage Service
// Handles user photo uploads, storage, and management

export interface UserPhoto {
  id: string;
  username: string;
  photoData: string; // Base64 encoded image
  photoUrl?: string; // Optional cloud URL
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: UserPhoto;
  error?: string;
}

class UserPhotoService {
  private readonly STORAGE_KEY = 'flappypi-user-photos';
  private readonly MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Upload and store a user photo
   */
  async uploadPhoto(file: File, username: string): Promise<PhotoUploadResult> {
    try {
      // Validate file
      const validation = this.validatePhotoFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Convert to base64
      const photoData = await this.fileToBase64(file);
      
      // Create photo object
      const photo: UserPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        photoData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store photo
      await this.storePhoto(photo);

      return { success: true, photo };
    } catch (error) {
      console.error('Photo upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Photo upload failed' 
      };
    }
  }

  /**
   * Get user photo by username
   */
  async getUserPhoto(username: string): Promise<UserPhoto | null> {
    try {
      const photos = this.getAllPhotos();
      return photos.find(photo => photo.username === username) || null;
    } catch (error) {
      console.error('Failed to get user photo:', error);
      return null;
    }
  }

  /**
   * Update user photo
   */
  async updatePhoto(username: string, file: File): Promise<PhotoUploadResult> {
    try {
      // Validate file
      const validation = this.validatePhotoFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Convert to base64
      const photoData = await this.fileToBase64(file);
      
      // Get existing photo
      const existingPhoto = await this.getUserPhoto(username);
      
      if (existingPhoto) {
        // Update existing photo
        existingPhoto.photoData = photoData;
        existingPhoto.updatedAt = new Date();
        await this.storePhoto(existingPhoto);
        return { success: true, photo: existingPhoto };
      } else {
        // Create new photo
        return await this.uploadPhoto(file, username);
      }
    } catch (error) {
      console.error('Photo update failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Photo update failed' 
      };
    }
  }

  /**
   * Delete user photo
   */
  async deletePhoto(username: string): Promise<boolean> {
    try {
      const photos = this.getAllPhotos();
      const filteredPhotos = photos.filter(photo => photo.username !== username);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPhotos));
      return true;
    } catch (error) {
      console.error('Failed to delete photo:', error);
      return false;
    }
  }

  /**
   * Get all stored photos
   */
  getAllPhotos(): UserPhoto[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const photos = JSON.parse(stored);
      return Array.isArray(photos) ? photos : [];
    } catch (error) {
      console.error('Failed to get photos:', error);
      return [];
    }
  }

  /**
   * Clear all photos (for logout)
   */
  clearAllPhotos(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear photos:', error);
    }
  }

  /**
   * Validate photo file
   */
  private validatePhotoFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_PHOTO_SIZE) {
      return { 
        valid: false, 
        error: `File size too large. Maximum size is ${this.MAX_PHOTO_SIZE / 1024 / 1024}MB` 
      };
    }

    // Check file type
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      return { 
        valid: false, 
        error: `Unsupported file type. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Store photo in localStorage
   */
  private async storePhoto(photo: UserPhoto): Promise<void> {
    try {
      const photos = this.getAllPhotos();
      
      // Remove existing photo for this user
      const filteredPhotos = photos.filter(p => p.username !== photo.username);
      
      // Add new photo
      filteredPhotos.push(photo);
      
      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPhotos));
    } catch (error) {
      console.error('Failed to store photo:', error);
      throw error;
    }
  }

  /**
   * Compress image to reduce size
   */
  async compressImage(file: File, maxWidth: number = 300, maxHeight: number = 300): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          0.8 // Quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { totalPhotos: number; totalSize: number; maxSize: number } {
    const photos = this.getAllPhotos();
    const totalSize = photos.reduce((size, photo) => {
      return size + (photo.photoData.length * 0.75); // Approximate base64 size
    }, 0);
    
    return {
      totalPhotos: photos.length,
      totalSize: Math.round(totalSize / 1024), // KB
      maxSize: 50 * 1024 // 50MB limit
    };
  }
}

// Export singleton instance
export const userPhotoService = new UserPhotoService();

// Export types
export type { UserPhoto, PhotoUploadResult }; 