'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import banner4 from 'assets/images/house-warming.png';
import banner6 from 'assets/images/leafs.png';
import banner2 from 'assets/images/pooja-items-mullai.png';
import banner5 from 'assets/images/temple-garland.png';
import banner3 from 'assets/images/veni-hari-dressing.png';
import banner1 from 'assets/images/wedding-garland.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const banners = [
  { src: banner1, url: 'search/wedding-collections' },
  { src: banner2, url: 'search/pooja-items' },
  { src: banner3, url: 'search/venihair-dressing' },
  { src: banner4, url: 'search/house-warming' },
  { src: banner5, url: 'search/temple-garlands' },
  { src: banner6, url: 'search/leafs' }
];

function Banner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handleBannerClick = () => {
    const currentBanner = banners[currentImageIndex];
    if (currentBanner) {
      window.open(currentBanner.url, '_blank');
    }
  };

  return (
    <div className="relative flex justify-center pt-2">
      <div className="relative w-11/12 overflow-hidden rounded-md" onClick={handleBannerClick}>
        <div
          className="flex w-full items-center transition-transform duration-1000"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="min-w-full">
              <Image
                src={banner.src}
                alt={`Banner Image ${index + 1}`}
                className="w-full cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        aria-label="Previous Image"
        className="absolute left-2 top-1/2 -translate-y-1/2 transform rounded-full bg-custom-green p-1 shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 hover:bg-custom-green sm:p-3"
        onClick={goToPrevImage}
      >
        <span>
          <ArrowLeftIcon className="h-3" />
        </span>
      </button>
      <button
        aria-label="Next Image"
        className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-custom-green p-1 shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 hover:bg-custom-green sm:p-3"
        onClick={goToNextImage}
      >
        <span>
          <ArrowRightIcon className="h-3" />
        </span>
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full opacity-70 ${currentImageIndex === index ? 'bg-custom-green' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Banner;
