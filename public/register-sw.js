if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(reg) {
        console.log('SW registered', reg.scope);
      })
      .catch(function(err) {
        console.error('SW registration failed', err);
      });
  });
}