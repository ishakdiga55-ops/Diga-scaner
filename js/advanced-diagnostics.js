/* ============================================
   CheckDiga Pro — Advanced Diagnostics UI
   ============================================ */

(async function boot() {
  try {
    const diagnostics = await import('./diagnostics/index.js');
    const { diagnose } = diagnostics;

    function readLastFaults() {
      try {
        const hist = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
        if (!hist.length) return [];
        return (hist[0].faults || []).map(f => f.code).filter(Boolean);
      } catch (e) {
        return [];
      }
    }

    function readLiveData() {
      const parse = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const v = parseFloat(el.textContent);
        return isNaN(v) ? null : v;
      };
      return {
        rpm: parse('gauge-rpm'),
        speed: parse('gauge-speed'),
        coolant: parse('gauge-coolant'),
        fuelLevel: parse('gauge-fuel')
      };
    }

    function getSourceLabel() {
      const status = document.getElementById('connection-status');
      if (!status) return 'unknown';
      const txt = status.textContent.trim();
      if (txt.includes('تجريبي')) return 'demo';
      if (txt.includes('متصل')) return 'real';
      return 'unknown';
    }

    function injectButton() {
      if (document.getElementById('btnAdvancedDiagnosis')) return;

      const scanAllBtn = document.getElementById('btnScanAll');
      if (!scanAllBtn) {
        setTimeout(injectButton, 500);
        return;
      }

      const section = scanAllBtn.closest('.bg-gray-800');
      if (!section) {
        setTimeout(injectButton, 500);
        return;
      }

      const btn = document.createElement('button');
      btn.id = 'btnAdvancedDiagnosis';
      btn.className = 'w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold mt-3 flex items-center justify-center gap-2';
      btn.innerHTML = '🔬 تحليل متقدم <span class="text-[10px] opacity-80">(90 قاعدة)</span>';
      btn.onclick = runAdvancedDiagnosis;

      section.appendChild(btn);
      console.log('[Advanced] Button injected ✅');
    }

    function runAdvancedDiagnosis() {
      const codes = readLastFaults();
      const live = readLiveData();

      if (!codes.length) {
        showModal(buildEmptyReport());
        return;
      }

      try {
        const report = diagnose({
          codes,
          live,
          vehicle: { source: getSourceLabel() }
        });
        showModal(buildReportHTML(report));
      } catch (e) {
        console.error('[Advanced] Analysis error:', e);
        showModal(`
          <div class="text-center py-8">
            <div class="text-5xl mb-3">❌</div>
            <div class="font-bold text-lg mb-2">خطأ في التحليل</div>
            <p class="text-red-400 text-sm">${e.message}</p>
          </div>
        `);
      }
    }

    function showModal(html) {
      let modal = document.getElementById('advancedReportModal');

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'advancedReportModal';
        modal.className = 'hidden fixed inset-0 bg-black/80 z-50 p-4 overflow-y-auto';
        modal.innerHTML = `
          <div class="max-w-3xl mx-auto mt-6 bg-gray-800 rounded-2xl p-5 relative">
            <button id="closeAdvancedReport" class="absolute top-3 right-3 bg-red-600 text-white w-8 h-8 rounded-full text-sm font-bold z-10">×</button>
            <div id="advancedReportContent" class="pt-2"></div>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeAdvancedReport').onclick = () => modal.classList.add('hidden');
        modal.onclick = (e) => {
          if (e.target.id === 'advancedReportModal') modal.classList.add('hidden');
        };
      }

      document.getElementById('advancedReportContent').innerHTML = html;
      modal.classList.remove('hidden');
      modal.scrollTop = 0;
    }

    function buildEmptyReport() {
      return `
        <div class="text-center py-8">
          <div class="text-5xl mb-3">📋</div>
          <div class="font-bold text-lg mb-2">لا توجد نتائج</div>
          <p class="text-gray-400 text-sm">قم بإجراء "فحص المحرك" أو "فحص الكل" أولاً</p>
          <p class="text-gray-500 text-xs mt-2">ثم اضغط "تحليل متقدم"</p>
        </div>
      `;
    }

    function buildReportHTML(report) {
      const s = report.summary;
      const health = report.health;
      const safety = report.safety;

      const healthColors = {
        excellent: 'from-green-500 to-emerald-600',
        good: 'from-emerald-500 to-green-600',
        fair: 'from-amber-500 to-orange-600',
        poor: 'from-red-500 to-rose-600',
        critical: 'from-red-600 to-rose-700'
      };
      const healthGrad = healthColors[health.level] || 'from-gray-500 to-gray-600';

      const safetyColors = {
        safe: 'bg-green-600',
        warn: 'bg-amber-600',
        stop: 'bg-red-600'
      };
      const safetyBg = safetyColors[s.status] || 'bg-gray-600';

      let html = '';

      html += `
        <div class="text-center mb-5 pb-4 border-b border-gray-700">
          <div class="text-xs text-gray-400 mb-1">تقرير التحليل المتقدم</div>
          <div class="text-lg font-bold">CheckDiga Pro 🔬</div>
        </div>
      `;

      if (safety.warnings.length > 0) {
        html += `<div class="${safetyBg} text-white p-4 rounded-2xl mb-4">
          <div class="font-bold text-sm mb-2 flex items-center gap-2">
            <span>${s.status === 'stop' ? '🛑' : '⚠️'}</span>
            <span>${safety.summary.message}</span>
          </div>`;
        safety.warnings.slice(0, 3).forEach(w => {
          html += `<div class="bg-black/20 rounded-lg p-2 mt-2">
            <div class="text-xs font-bold">${w.icon} ${w.title}</div>
            <div class="text-[11px] opacity-90 mt-1">${w.action}</div>
          </div>`;
        });
        html += `</div>`;
      }

      html += `
        <div class="bg-gradient-to-l ${healthGrad} rounded-2xl p-4 text-white mb-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-xs opacity-90">مؤشر صحة السيارة</div>
              <div class="text-2xl font-bold mt-1">${health.score}<span class="text-sm opacity-80">/100</span></div>
            </div>
            <div class="text-4xl font-bold">${health.level === 'excellent' ? '✓' : health.level === 'good' ? '👍' : '⚠️'}</div>
          </div>
        </div>
      `;

      if (report.rootCause) {
        html += `
          <div class="bg-purple-900/30 border border-purple-700/50 rounded-2xl p-4 mb-4">
            <div class="font-bold text-purple-300 text-sm mb-2">🎯 السبب الجذري المحتمل</div>
            <div class="text-sm mb-2">النظام: <b>${report.rootCause.systemName}</b></div>
            <div class="text-xs text-gray-400">${report.rootCause.relatedCount} قاعدة مرتبطة</div>
          </div>
        `;
      }

      if (report.cost.max > 0 || report.time > 0) {
        html += `
          <div class="grid grid-cols-2 gap-2 mb-4">
            <div class="bg-gray-900 rounded-xl p-3 text-center">
              <div class="text-xs text-gray-400 mb-1">💰 التكلفة التقديرية</div>
              <div class="font-bold text-sm">$${report.cost.min} - $${report.cost.max}</div>
            </div>
            <div class="bg-gray-900 rounded-xl p-3 text-center">
              <div class="text-xs text-gray-400 mb-1">⏱️ الوقت المتوقع</div>
              <div class="font-bold text-sm">${report.time} ساعات</div>
            </div>
          </div>
        `;
      }

      if (report.diagnoses.length > 0) {
        html += `<div class="mb-3"><div class="font-bold text-sm mb-3">🔍 التشخيصات (${report.diagnoses.length})</div>`;

        report.diagnoses.forEach((d, i) => {
          const priorityColors = {
            critical: '#dc2626',
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
          };
          const pc = priorityColors[d.priority] || '#64748b';

          html += `
            <div class="bg-gray-900 rounded-xl p-4 mb-3" style="border-right: 4px solid ${pc}">
              <div class="flex justify-between items-start mb-2 gap-2">
                <div class="font-bold text-sm">#${i + 1} ${d.title}</div>
                <span class="text-[10px] px-2 py-1 rounded-full text-white font-bold whitespace-nowrap" style="background: ${pc}">${d.priority}</span>
              </div>
              ${d.titleEn ? `<div class="text-[10px] text-gray-500 mb-2" dir="ltr">${d.titleEn}</div>` : ''}
              ${d.matchedCodes && d.matchedCodes.length ? `
                <div class="flex flex-wrap gap-1 mb-2">
                  ${d.matchedCodes.map(c => `<span class="text-[10px] font-mono bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">${c}</span>`).join('')}
                </div>
              ` : ''}
              ${d.causes && d.causes.length ? `
                <div class="text-xs text-gray-300 mb-2">
                  <div class="font-bold text-[11px] mb-1">الأسباب المحتملة:</div>
                  <ul class="space-y-0.5">
                    ${d.causes.slice(0, 3).map(c => `<li>• ${c.cause} <span class="text-gray-500">(${Math.round(c.prob * 100)}%)</span></li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${d.actions && d.actions.length ? `
                <div class="text-xs text-blue-300 bg-blue-900/20 rounded p-2">
                  <div class="font-bold text-[11px] mb-1">خطوات الفحص:</div>
                  <ul class="space-y-0.5">
                    ${d.actions.slice(0, 3).map(a => `<li>• ${a}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <div class="flex justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-800">
                <span>${d.diyPossible ? '✅ يمكن DIY' : '👨‍🔧 يحتاج مختص'}</span>
                <span>${d.estimatedTime || '?'} ساعات</span>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      if (report.fusion.patterns && report.fusion.patterns.length > 0) {
        html += `
          <div class="bg-cyan-900/30 border border-cyan-700/50 rounded-2xl p-4 mb-4">
            <div class="font-bold text-cyan-300 text-sm mb-3">🔗 أنماط مكتشفة من البيانات الحية</div>
            ${report.fusion.patterns.map(p => `
              <div class="bg-black/30 rounded-lg p-3 mb-2">
                <div class="flex justify-between items-start gap-2 mb-1">
                  <div class="font-bold text-xs">${p.title}</div>
                  <span class="text-[9px] px-2 py-0.5 rounded-full bg-cyan-600 text-white font-bold">${Math.round(p.confidence * 100)}%</span>
                </div>
                <div class="text-[11px] text-gray-300 mb-1">${p.analysis}</div>
                <div class="text-[10px] text-cyan-400">→ ${p.action}</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (report.fusion.insights && report.fusion.insights.length > 0) {
        html += `
          <div class="bg-gray-900 rounded-2xl p-4 mb-4">
            <div class="font-bold text-sm mb-3">📊 قراءات مباشرة</div>
            <div class="space-y-1">
              ${report.fusion.insights.map(i => {
                const colors = {
                  normal: 'text-green-400',
                  warning: 'text-amber-400',
                  danger: 'text-red-400',
                  cold: 'text-blue-400',
                  off: 'text-gray-500',
                  stopped: 'text-gray-500'
                };
                return `<div class="flex justify-between text-xs">
                  <span class="${colors[i.status] || 'text-gray-400'}">${i.message}</span>
                  <span class="font-mono text-gray-400">${i.metric}: ${i.value}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      }

      html += `
        <div class="text-center text-[10px] text-gray-500 mt-4 pt-3 border-t border-gray-700">
          تم تحليل ${report.input.codes.length} كود بناءً على ${report.matchesCount} قاعدة
          <br>آخر تحديث: ${new Date(report.input.timestamp).toLocaleString('ar')}
        </div>
      `;

      return html;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectButton);
    } else {
      injectButton();
    }

    setTimeout(injectButton, 2000);
    setTimeout(injectButton, 5000);

    console.log('[Advanced Diagnostics] Module loaded ✅');

  } catch (error) {
    console.error('[Advanced] Load error:', error);
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:8px;font-size:11px;z-index:99999;direction:ltr;text-align:left;word-break:break-all';
    div.textContent = '❌ ADVANCED ERROR: ' + (error && error.message ? error.message : String(error));
    document.body.appendChild(div);
  }
})();
