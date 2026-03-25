'use client';

export default function PhotoImg({
  src,
  alt,
  size = 120,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  const isPlaceholder =
    !src ||
    src.includes('photoplaceholder') ||
    src.includes('profile_pic') ||
    src.includes('dummy');

  const imgSrc = isPlaceholder ? '/blank-profile.webp' : src!;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/blank-profile.webp';
      }}
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: 4,
        border: '1px solid #ddd',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}
