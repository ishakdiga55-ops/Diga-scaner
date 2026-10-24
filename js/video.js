(function(){
  var btn = document.getElementById('watchDemoBtn');
  var modal = document.getElementById('videoModal');
  var closeBtn = document.getElementById('closeVideoBtn');
  var video = document.getElementById('demoVideo');
  if (!btn || !modal) return;

  btn.onclick = function () {
    modal.classList.remove('hidden');
    try { video.currentTime = 0; video.play(); } catch (_) {}
  };

  function close() {
    modal.classList.add('hidden');
    try { video.pause(); video.currentTime = 0; } catch (_) {}
  }

  closeBtn.onclick = close;
  modal.onclick = function (e) { if (e.target.id === 'videoModal') close(); };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });

  // إصلاح زر ابدأ الآن بسبب قيود الأمان الجديدة
  var startBtn = document.getElementById('btnStartNow');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      document.getElementById('app').scrollIntoView({behavior:'smooth'});
    });
  }
})();
