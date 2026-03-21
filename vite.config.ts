// Assume this is the content of vite.config.ts with modified shortcuts
module.exports = {
  // ... other configurations ...
  pwa: {
    shortcuts: [
      { src: 'icon-192x192.png', type: 'image/png' },
      { src: 'icon-512x512.png', type: 'image/png' },
      // Add other icon objects here with the type property
    ],
  },
};