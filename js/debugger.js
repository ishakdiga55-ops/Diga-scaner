(function() {
  var box = document.getElementById('eagleEye');
  var content = document.getElementById('eagleEyeContent');
  if(!box || !content) return;

  function logError(msg) {
    box.style.display = 'block';
    var div = document.createElement('div');
    div.style.borderBottom = '1px solid rgba(255,255,255,0.3)';
    div.style.padding = '4px 0';
    div.textContent = '❌ ' + msg;
    content.appendChild(div);
  }
  window.onerror = function(msg, url, line, col, error) {
    logError('JS Error: ' + msg + ' | Line: ' + line + ' | File: ' + url.split('/').pop());
    return false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    logError('Promise Error: ' + (e.reason ? (e.reason.message || e.reason) : 'Unknown'));
  });
  window.addEventListener('error', function(e) {
    if (e.target && (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'IMG')) {
      logError('Failed to load: ' + e.target.tagName + ' -> ' + (e.target.src || e.target.href));
    }
  }, true);
  window.addEventListener('load', function() {
    setTimeout(function() {
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
        if (!link.sheet) logError('CSS Failed: ' + link.href.split('/').pop());
      });
    }, 1000);
  });
})();
