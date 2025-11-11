import { useState, useRef, type MouseEvent } from 'react';
import { ZoomIn, X } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageZoom = ({ src, alt, className = '' }: ImageZoomProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showZoomModal, setShowZoomModal] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !isZoomed) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const openModal = () => {
    setShowZoomModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowZoomModal(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <div
        ref={imgRef}
        className={`relative overflow-hidden cursor-zoom-in group ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={openModal}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{
            transform: isZoomed ? `scale(2) translate(-${position.x / 2}%, -${position.y / 2}%)` : 'scale(1)',
            transformOrigin: `${position.x}% ${position.y}%`
          }}
        />
        
        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      {/* Full Screen Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors z-10"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-7xl max-h-[90vh] overflow-auto">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 text-sm text-gray-700">
            Nhấp chuột để đóng hoặc cuộn để phóng to
          </div>
        </div>
      )}
    </>
  );
};

export default ImageZoom;
