import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'papicture',
    short_name: 'papicture',
    description:
      'One selfie, sized correctly for Philippine IDs, visas and work profiles.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f1ec',
    theme_color: '#22489c',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
