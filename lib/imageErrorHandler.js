export const handleImageError = (e, fallbackText = 'BMV') => {
  const svgFallback = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#10B981"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="white" 
        font-size="40" 
        font-weight="bold"
        font-family="Arial, sans-serif"
      >${fallbackText}</text>
    </svg>
  `)}`;
  
  e.target.src = svgFallback;
  e.target.onerror = null; // Prevent infinite loop
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

export const getImageWithFallback = async (primarySrc, fallbackSrc) => {
  try {
    await preloadImage(primarySrc);
    return primarySrc;
  } catch {
    try {
      await preloadImage(fallbackSrc);
      return fallbackSrc;
    } catch {
      return null;
    }
  }
};
