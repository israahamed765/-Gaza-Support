import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images?: string[];
  fallbackImage: string;
  alt: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, fallbackImage, alt }) => {
  const finalImages = images && images.length > 0 
    ? images.filter(u => u && u.trim() !== '') 
    : [];
  
  if (finalImages.length === 0) {
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

  if (finalImages.length <= 1) {
    return (
      <div className="relative h-48 sm:h-60 w-full bg-slate-50 shrink-0 overflow-hidden flex items-center justify-center">
        <img
          src={finalImages[0]}
          alt={alt}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div 
      className="relative h-48 sm:h-60 w-full bg-slate-950/5 shrink-0 overflow-hidden flex items-center justify-center group select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      id="multi_image_slider"
    >
      {/* Active Slide Image */}
      <img
        src={finalImages[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-contain transition-all duration-300"
        loading="lazy"
      />

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 active:scale-95 cursor-pointer z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 active:scale-95 cursor-pointer z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 h-5" />
      </button>

      {/* Slide Counter Badge */}
      <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs font-mono z-10">
        {currentIndex + 1} / {finalImages.length}
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
              currentIndex === idx ? 'bg-white w-3 sm:w-4' : 'bg-white/50 hover:bg-white/85'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
