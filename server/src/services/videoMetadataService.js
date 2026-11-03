/**
 * Video Metadata Service
 * Safely parses, validates, and fetches public metadata for social video links
 * Supported platforms: YouTube, Instagram, Facebook, and generic public video providers.
 * 
 * Security: Strictly validates URLs to avoid SSRF by only permitting approved platform domains.
 */

const ALLOWED_PLATFORMS = {
  YOUTUBE: 'YOUTUBE',
  INSTAGRAM: 'INSTAGRAM',
  FACEBOOK: 'FACEBOOK',
  OTHER: 'OTHER',
};

/**
 * Validates and identifies the platform and normalized ID/data from a URL.
 */
export function identifyVideoPlatform(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL must be a non-empty string' };
  }

  const trimmed = rawUrl.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Only allow HTTP/HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only http:// and https:// URLs are permitted' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. YouTube
  // youtube.com, www.youtube.com, m.youtube.com, youtu.be, youtube-nocookie.com
  if (
    hostname === 'youtube.com' ||
    hostname === 'www.youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'music.youtube.com' ||
    hostname === 'youtu.be'
  ) {
    let videoId = null;

    if (hostname === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0];
    } else if (parsed.pathname.startsWith('/embed/')) {
      videoId = parsed.pathname.split('/')[2];
    } else if (parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/')[2];
    } else if (parsed.pathname.startsWith('/live/')) {
      videoId = parsed.pathname.split('/')[2];
    } else {
      videoId = parsed.searchParams.get('v');
    }

    // Clean videoId (e.g. remove query strings or trailing characters)
    if (videoId) {
      videoId = videoId.split('?')[0].split('&')[0];
    }

    if (videoId && /^[\w-]{10,12}$/.test(videoId)) {
      return {
        isValid: true,
        platform: ALLOWED_PLATFORMS.YOUTUBE,
        platformId: videoId,
        canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }

    // General YouTube link
    return {
      isValid: true,
      platform: ALLOWED_PLATFORMS.YOUTUBE,
      canonicalUrl: trimmed,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      thumbnailUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
    };
  }

  // 2. Instagram
  // instagram.com, www.instagram.com
  if (hostname === 'instagram.com' || hostname === 'www.instagram.com') {
    // Matches /reel/ID, /p/ID, /tv/ID
    const match = parsed.pathname.match(/\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
    const shortcode = match ? match[2] : null;

    return {
      isValid: true,
      platform: ALLOWED_PLATFORMS.INSTAGRAM,
      platformId: shortcode,
      canonicalUrl: shortcode
        ? `https://www.instagram.com/reel/${shortcode}/`
        : trimmed,
      embedUrl: shortcode
        ? `https://www.instagram.com/p/${shortcode}/embed/`
        : null,
      thumbnailUrl: null, // Instagram requires access token for direct CDN images
    };
  }

  // 3. Facebook
  // facebook.com, www.facebook.com, fb.watch
  if (
    hostname === 'facebook.com' ||
    hostname === 'www.facebook.com' ||
    hostname === 'm.facebook.com' ||
    hostname === 'web.facebook.com' ||
    hostname === 'fb.watch'
  ) {
    return {
      isValid: true,
      platform: ALLOWED_PLATFORMS.FACEBOOK,
      canonicalUrl: trimmed,
      embedUrl: null,
      thumbnailUrl: null,
    };
  }

  // 4. Other safe platforms (Vimeo, LinkedIn, Twitter/X, TikTok, etc.)
  const supportedOther = ['vimeo.com', 'www.vimeo.com', 'linkedin.com', 'www.linkedin.com', 'x.com', 'twitter.com'];
  if (supportedOther.some(dom => hostname === dom || hostname.endsWith('.' + dom))) {
    return {
      isValid: true,
      platform: ALLOWED_PLATFORMS.OTHER,
      canonicalUrl: trimmed,
      embedUrl: null,
      thumbnailUrl: null,
    };
  }

  // Disallowed domains to prevent SSRF
  return {
    isValid: false,
    error: 'Unsupported platform domain. Please use YouTube, Instagram, Facebook, or verified public video links.',
  };
}

/**
 * Fetches public oEmbed / official metadata for a validated video URL.
 * Never throws an unhandled error; gracefully returns available data or error info.
 */
export async function fetchVideoMetadata(rawUrl) {
  const check = identifyVideoPlatform(rawUrl);
  if (!check.isValid) {
    return {
      success: false,
      error: check.error,
    };
  }

  const result = {
    platform: check.platform,
    originalUrl: check.canonicalUrl || rawUrl.trim(),
    title: '',
    description: '',
    thumbnailUrl: check.thumbnailUrl || '',
    duration: '',
    metadataFetched: false,
    provider: check.platform,
    message: '',
  };

  // 1. YouTube Metadata Fetching
  if (check.platform === ALLOWED_PLATFORMS.YOUTUBE) {
    // If YouTube Data API v3 key is provided in server environment
    if (process.env.YOUTUBE_API_KEY && check.platformId) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${check.platformId}&key=${process.env.YOUTUBE_API_KEY}`;
        const resp = await fetch(apiUrl, { headers: { 'User-Agent': 'I2S-VideoManager/1.0' } });
        if (resp.ok) {
          const data = await resp.json();
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            result.title = item.snippet?.title || '';
            result.description = item.snippet?.description || '';
            result.thumbnailUrl =
              item.snippet?.thumbnails?.maxres?.url ||
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.medium?.url ||
              check.thumbnailUrl;

            // Parse ISO 8601 duration (e.g. PT14M20S)
            if (item.contentDetails?.duration) {
              result.duration = formatIsoDuration(item.contentDetails.duration);
            }

            result.metadataFetched = true;
            result.message = 'Metadata fetched successfully via official YouTube API.';
            return { success: true, metadata: result };
          }
        }
      } catch (err) {
        // Fall back to oEmbed
      }
    }

    // Public YouTube oEmbed endpoint (no API key required, reliable & official)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(result.originalUrl)}&format=json`;
      const resp = await fetch(oembedUrl, {
        headers: { 'User-Agent': 'I2S-VideoManager/1.0' },
      });

      if (resp.ok) {
        const odata = await resp.json();
        result.title = odata.title || '';
        result.thumbnailUrl = odata.thumbnail_url || check.thumbnailUrl || '';
        result.metadataFetched = true;
        result.message = 'Metadata populated via YouTube public endpoint.';
        return { success: true, metadata: result };
      }
    } catch (err) {
      // Fallback
    }

    // High quality thumbnail fallback using videoId
    if (check.thumbnailUrl) {
      result.thumbnailUrl = check.thumbnailUrl;
      result.message = 'Thumbnail populated. You may customize title & description.';
      return { success: true, metadata: result };
    }
  }

  // 2. Instagram Metadata Fetching
  if (check.platform === ALLOWED_PLATFORMS.INSTAGRAM) {
    // Official Facebook/Instagram Graph oEmbed requires app_id & client_token
    if (process.env.META_ACCESS_TOKEN || (process.env.META_APP_ID && process.env.META_APP_SECRET)) {
      const token = process.env.META_ACCESS_TOKEN || `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
      try {
        const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(result.originalUrl)}&access_token=${token}`;
        const resp = await fetch(oembedUrl);
        if (resp.ok) {
          const data = await resp.json();
          result.title = data.title || (data.author_name ? `Instagram Reel by ${data.author_name}` : 'Instagram Reel');
          result.thumbnailUrl = data.thumbnail_url || '';
          result.metadataFetched = true;
          result.message = 'Metadata populated via Meta Graph API.';
          return { success: true, metadata: result };
        }
      } catch (err) {
        // Fallback
      }
    }

    // Standard public fallback for Instagram
    result.title = check.platformId ? `Instagram Reel #${check.platformId}` : 'Instagram Video';
    result.message = 'Instagram public API requires Meta App credentials for automatic thumbnail retrieval. Please enter title, description, and thumbnail manually.';
    return { success: true, metadata: result };
  }

  // 3. Facebook Metadata Fetching
  if (check.platform === ALLOWED_PLATFORMS.FACEBOOK) {
    if (process.env.META_ACCESS_TOKEN || (process.env.META_APP_ID && process.env.META_APP_SECRET)) {
      const token = process.env.META_ACCESS_TOKEN || `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
      try {
        const oembedUrl = `https://graph.facebook.com/v19.0/oembed_video?url=${encodeURIComponent(result.originalUrl)}&access_token=${token}`;
        const resp = await fetch(oembedUrl);
        if (resp.ok) {
          const data = await resp.json();
          result.title = data.title || 'Facebook Video';
          result.thumbnailUrl = data.thumbnail_url || '';
          result.metadataFetched = true;
          result.message = 'Metadata populated via Facebook Graph API.';
          return { success: true, metadata: result };
        }
      } catch (e) {}
    }

    result.title = 'Facebook Video';
    result.message = 'Facebook requires Meta credentials for automatic metadata retrieval. You can fill in the details manually.';
    return { success: true, metadata: result };
  }

  // 4. Other / Generic
  result.message = 'Platform identified. Please enter video title and details manually.';
  return { success: true, metadata: result };
}

/**
 * Converts ISO 8601 duration (e.g., PT14M20S or PT1H2M30S) to MM:SS or HH:MM:SS format
 */
function formatIsoDuration(isoDuration) {
  if (!isoDuration || typeof isoDuration !== 'string') return '';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  const pad = (n) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
