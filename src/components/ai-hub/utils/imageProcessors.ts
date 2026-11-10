// Convert Blob/File to Data URL
export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

// Extract image URL from raw HTML string (dragged or copied from web pages)
export const extractImageUrlFromHtml = (html: string): string | null => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match && match[1] ? match[1] : null;
};

// Convert web image URL to Base64 Data URL (supports CORS, Canvas, and proxy fallbacks)
export const convertUrlToBase64 = async (url: string): Promise<string> => {
  if (url.startsWith('data:image/')) return url;

  // Strategy 1: Direct fetch with CORS
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.type.startsWith('image/') || blob.size > 0) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Image element + Canvas
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context failed'));
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
    return dataUrl;
  } catch {
    // Continue to proxy strategy
  }

  // Strategy 3: CORS proxy fallback
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      return await blobToDataUrl(blob);
    }
  } catch {
    // Proxy failed
  }

  // Fallback to raw URL if conversion fails
  return url;
};

