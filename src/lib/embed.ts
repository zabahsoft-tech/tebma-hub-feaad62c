/** Normalise a YouTube/Vimeo watch URL into an embeddable player URL. */
export function toEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^https:\/\/www\.youtube-nocookie\.com\/embed\//.test(url)) return url;
  if (/^https:\/\/player\.vimeo\.com\/video\//.test(url)) return url;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

/** YouTube's own thumbnail for an embed URL, when we have no uploaded poster. */
export function embedThumbnail(embedUrl: string): string | null {
  const yt = embedUrl.match(/youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]+)/);
  if (yt) return `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`;
  return null;
}
