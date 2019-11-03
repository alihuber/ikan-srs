importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.routing.registerRoute(/\.js$/, new workbox.strategies.NetworkFirst());

workbox.precaching.precacheAndRoute([
  {
    "url": "main.css",
    "revision": "1db4b3c05fe8d0e0a4d2be9178d75d1c"
  },
  {
    "url": "main.html",
    "revision": "24e88c8441b57b07d42087f576dbfabd"
  },
  {
    "url": "main.js",
    "revision": "43298ffae3a22cbf71bfa2f3e7eb7ef4"
  }
]);

workbox.routing.registerRoute(
  // Cache CSS files.
  /\.css$/,
  // Use cache but update in the background.
  new workbox.strategies.StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: 'css-cache',
  })
);
