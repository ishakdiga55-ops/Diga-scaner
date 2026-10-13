(async function test(){
  const files = [
    './diagnostics/rules.js',
    './diagnostics/engine.js',
    './diagnostics/safety.js',
    './diagnostics/fusion.js',
    './diagnostics/index.js'
  ];
  
  let offset = 0;
  for (const f of files) {
    try {
      await import(f);
      console.log('✅ OK:', f);
    } catch(e) {
      console.error('❌ FAIL:', f, '-', e.message);
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;top:' + offset + 'px;left:0;right:0;background:#dc2626;color:white;padding:10px;z-index:99999;font-size:12px;direction:ltr;font-family:monospace;word-break:break-all';
      d.textContent = '❌ BROKEN: ' + f + ' — ' + e.message;
      document.body.appendChild(d);
      offset += 50;
    }
  }
})();
