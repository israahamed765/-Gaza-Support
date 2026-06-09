import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ImageCarouselProps {
  images?: string[];
  imageUrls?: string[];
  fallbackImage?: string;
  alt?: string;
}

// Helper to auto-detect if the string is an image or video
export function getMediaType(url: string): 'image' | 'video' {
  if (!url) return 'image';
  if (url.startsWith('data:video/')) return 'video';
  if (url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/)) return 'video';
  if (url.includes('video/')) return 'video';
  return 'image';
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  imageUrls, 
  fallbackImage, 
  alt = "Post attachment" 
}) => {
  // Merge both inputs for absolute safety
  const merged = [
    ...(images || []),
    ...(imageUrls || [])
  ].filter(u => u && u.trim() !== '');

  const finalImages = merged;
  
  if (finalImages.length === 0 && fallbackImage) {
    finalImages.push(fallbackImage);
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? finalImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === finalImages.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (finalImages.length === 0) {
    return (
      <div className="relative h-48 sm:h-60 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center p-4">
        No media file attached
      </div>
    );
  }

  if (finalImages.length <= 1) {
    const isVideo = getMediaType(finalImages[0]) === 'video';
    return (
      <div className="relative h-48 sm:h-60 w-full bg-slate-950 shrink-0 overflow-hidden flex items-center justify-center">
        {isVideo ? (
          <video
            src={finalImages[0]}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={finalImages[0]}
            alt={alt}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </div>
    );
  }

  const activeMedia = finalImages[currentIndex];
  const isVideo = getMediaType(activeMedia) === 'video';

  return (
    <div 
      className="relative h-48 sm:h-60 w-full bg-slate-950 shrink-0 overflow-hidden flex items-center justify-center group select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      id="multi_image_slider"
    >
      {/* Active Slide Media Component */}
      {isVideo ? (
        <video
          key={activeMedia} // Key ensures video tags reloads and plays from the start on index change
          src={activeMedia}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        />
      ) : (
        <img
          src={activeMedia}
          alt={`${alt} - ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-all duration-350"
          loading="lazy"
        />
      )}

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/85 transition opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 active:scale-95 cursor-pointer z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/85 transition opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 active:scale-95 cursor-pointer z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 h-5" />
      </button>

      {/* Slide Counter Badge */}
      <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs font-mono z-10 flex items-center gap-1">
        {isVideo && <Play className="w-2.5 h-2.5 fill-white text-white rotate-0" />}
        <span>{currentIndex + 1} / {finalImages.length}</span>
      </div>

      {/* Indicators Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {finalImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx ? 'bg-white w-3 sm:w-4' : 'bg-white/55 hover:bg-white/90'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
