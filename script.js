const presets = {
  paystack: { maxKB: 500, maxW: 1500, q: 0.55 },
  kuda: { maxKB: 1000, maxW: 1900, q: 0.7 },
  gtb: { maxKB: 2000, maxW: 2400, q: 0.85 }
};

let frontImg = null, backImg = null, frontFile = null, backFile = null;

// ==========================================
// 🎨 THEME ENGINE (Bound to Window)
// ==========================================
if (localStorage.theme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

window.toggleTheme = function() {
  if (document.documentElement.getAttribute('data-theme') === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.theme = 'light';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.theme = 'dark';
  }
};

// ==========================================
// 📦 MODALS + INTERACTION (Bound to Window)
// ==========================================
window.openModal = function(id) {
  document.getElementById(id).style.display = 'flex';
};

window.closeModal = function(id) {
  document.getElementById(id).style.display = 'none';
};

window.dismissBanner = function() {
  document.getElementById('installBanner').style.display = 'none';
  localStorage.dismissBanner = 'true';
};

window.onclick = e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
};

// ==========================================
// 📥 FILE UPLOAD PIPELINE
// ==========================================
['front', 'back'].forEach(id => {
  const fileInput = document.getElementById(id);
  if (!fileInput) return;

  fileInput.onchange = e => {
    const file = e.target.files[0];
    
    // Fix: Clear previous state explicitly if user clears selection
    if (!file) {
      if (id === 'front') { frontImg = null; frontFile = null; } 
      else { backImg = null; backFile = null; }
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      alert('File too large. Max 15MB per image.');
      e.target.value = '';
      return;
    }
    
    if (id === 'front') frontFile = file; else backFile = file;

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        if (id === 'front') {
          frontImg = img;
          document.getElementById('previewFront').src = ev.target.result;
          document.getElementById('previewFront').style.display = 'block';
          document.querySelector(`[for=${id}]`).classList.add('active');
        } else {
          backImg = img;
          document.getElementById('previewBack').src = ev.target.result;
          document.getElementById('previewBack').style.display = 'block';
          document.querySelector(`[for=${id}]`).classList.add('active');
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
});

// ==========================================
// ⚡ CORE COMPRESSION PIPELINE (Bound to Window)
// ==========================================
window.process = function() {
  if (!frontImg) {
    document.getElementById('result').innerHTML = '<div class="alert err">❌ Upload front side first</div>';
    return;
  }
  
  const res = document.getElementById('result');
  res.innerHTML = '<div class="alert warn">⏳ Optimizing...</div>';
  
  const preset = presets[document.getElementById('preset').value];
  const cleanMode = document.getElementById('cleanMode').checked;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let w = Math.min(preset.maxW, frontImg.width);
  let h1 = Math.round(frontImg.height * w / frontImg.width);
  // Evaluates state against active image constraints
  let h2 = backImg ? Math.round(backImg.height * w / backImg.width) + 24 : 0;
  
  canvas.width = w;
  canvas.height = h1 + h2;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, canvas.height);

  // Apply clean mode normalization filters
  ctx.filter = cleanMode ? 'grayscale(100%) contrast(1.2) brightness(1.08)' : 'none';

  ctx.drawImage(frontImg, 0, 0, w, h1);
  if (backImg) {
    ctx.drawImage(backImg, 0, h1 + 24, w, h2 - 24);
  }

  // Strip destructive operational state filters for the UI layers
  ctx.filter = 'none';

  // Legal-Compliance Watermarking
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = '14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Optimized by Paper2Digital - Not a verified document', w / 2, canvas.height - 15);

  canvas.toBlob(blob => {
    const size = (blob.size / 1024).toFixed(1);
    const originalSize = (((frontFile?.size || 0) + (backFile?.size || 0)) / 1024).toFixed(1);
    const saved = originalSize > 0 ? (originalSize - size).toFixed(1) : 0;
    const savedPct = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;

    // Reset container contents thoroughly before construction
    res.innerHTML = '';

    if (Number(size) <= preset.maxKB) {
      res.innerHTML = `<div class="alert ok">✅ Success! ${size}KB / ${preset.maxKB}KB limit</div>`;
    } else {
      res.innerHTML = `<div class="alert warn">⚠️ ${size}KB exceeds ${preset.maxKB}KB. Try smaller photo.</div>`;
    }

    if (originalSize > 0 && saved > 0) {
      res.innerHTML += `<div style="margin-top:12px;font-size:0.9rem;color:var(--muted);text-align:center">
        <strong>Before:</strong> ${originalSize}KB → <strong>After:</strong> ${size}KB
        <span style="color:var(--orange);font-weight:700"> (-${saved}KB, ${savedPct}% smaller)</span>
      </div>`;
    }

    const url = URL.createObjectURL(blob);
    document.getElementById('output').src = url;
    document.getElementById('output').style.display = 'block';

    const dl = document.createElement('a');
    dl.href = url;
    dl.download = `paper2digital_optimized.jpg`;
    dl.className = 'download';
    dl.innerHTML = '<span class="material-icons-outlined">download</span> Download Optimized Image';
    res.appendChild(dl);
  }, 'image/jpeg', preset.q);
};

// ==========================================
// 📱 PWA APP INSTALL LIFECYCLE HANDLERS
// ==========================================
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const bannerBtn = document.getElementById('bannerInstallBtn');
const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

if (!isStandalone && !localStorage.dismissBanner) {
  setTimeout(() => {
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'flex';
  }, 3000);
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!isStandalone) {
    if (installBtn) installBtn.style.display = 'flex';
    if (bannerBtn) bannerBtn.style.display = 'inline-flex';
  }
});

[installBtn, bannerBtn].forEach(btn => {
  btn?.addEventListener('click', async () => {
    if (isIOS && !isStandalone) {
      window.openModal('iosInstallModal');
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
    if (document.getElementById('installBanner')) document.getElementById('installBanner').style.display = 'none';
  });
});

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.style.display = 'none';
  if (document.getElementById('installBanner')) document.getElementById('installBanner').style.display = 'none';
  deferredPrompt = null;
});

if (isIOS && !isStandalone) {
  if (installBtn) installBtn.style.display = 'flex';
  if (bannerBtn) bannerBtn.style.display = 'inline-flex';
}

// ==========================================
// 📡 NETWORK STATUS & OFFLINE AD FALLBACKS
// ==========================================
function syncAdLayoutStatus() {
  const fallbacks = document.querySelectorAll('.offline-fallback-banner');
  const liveAds = document.querySelectorAll('.adsbygoogle');

  if (!navigator.onLine) {
    liveAds.forEach(ad => ad.style.display = 'none');
    fallbacks.forEach(fb => fb.style.display = 'flex');
  } else {
    liveAds.forEach(ad => ad.style.display = 'block');
    fallbacks.forEach(fb => fb.style.display = 'none');
  }
}

window.addEventListener('online', syncAdLayoutStatus);
window.addEventListener('offline', syncAdLayoutStatus);
document.addEventListener('DOMContentLoaded', syncAdLayoutStatus);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('[SW Registration Error]', err);
    });
  });
}
