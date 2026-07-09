/**
 * 🛰️ Tenora Labs - Product Lifecycle & Core Telemetry Engine
 * Asset Name: tenora-core.js
 * Target System: Paper2Digital Framework Hub
 */
(function() {
  // 1. Initialize Application Gating Parameters
  const tLabConfig = { databaseURL: "https://tenora-labs-default-rtdb.firebaseio.com" };
  if (!window.firebase) {
    console.warn("[Tenora Core] SDK dependencies missing. Initializing fail-safe mode.");
    return;
  }
  
  if (!firebase.apps.length) firebase.initializeApp(tLabConfig);
  const database = firebase.database();
  const targetRef = database.ref("labs/5734bd79-bdd1-4d9c-86be-5fb0a41c246d/products/paper2digital");

  // 2. Incremental Engagement Tracking Analytics
  targetRef.child("analytics/total_sessions").transaction(current => (current || 0) + 1);
  targetRef.child("analytics/last_active").set(new Date().toISOString());

  // 3. Hardened Crash Telemetry (Converted to a safe append stream via .push)
  window.addEventListener("error", function(event) {
    // Avoid tracking local/extension script pollution
    if (event.filename && !event.filename.includes(window.location.hostname) && !event.filename.includes("localhost")) {
      return; 
    }
    
    targetRef.child("incident_reports/crash_log").push({
      message: event.message || "Unknown runtime exception",
      file: event.filename ? event.filename.split("/").pop() : "unknown.js",
      line: event.lineno || 0,
      timestamp: new Date().toISOString()
    });
  });

  // 4. Runtime Intercept Gate Engine
  targetRef.on("value", (snap) => {
     const appData = snap.val();
     if (!appData) return;
     
     const status = appData.status || "Building";
     const isLocked = status === "Maintenance" || status === "Building";

     if (isLocked) {
       let gate = document.getElementById("tenora-maintenance-gate");
       if (!gate) {
         gate = document.createElement("div");
         gate.id = "tenora-maintenance-gate";
         gate.style = "position:fixed;inset:0;z-index:999999;background:#09090b;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;padding:20px;text-align:center;";
         
         const defaultNotice = status === "Building" 
           ? "Synchronizing micro-cluster runtimes and executing memory hot-reload. Back live in a moment."
           : "The system is undergoing routine security refactoring. Core systems will restore seamlessly shortly.";
           
         const announcement = appData.maintenance_message || defaultNotice;
         const headerIcon = status === "Building" ? "⚙️" : "🛠️";
         const bannerTitle = status === "Building" ? "Hot-Reload Compiling" : "Emergency Intercept";
         const badgeCode = status === "Building" ? "Status Code: Node Hot-Swapping" : "Status Code: Cluster Locked By Founder";

         gate.innerHTML = '<div style="background:#18181b;border:1px solid #27272a;padding:30px;border-radius:20px;max-width:440px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">' +
                            '<div style="font-size:40px;margin-bottom:15px;">' + headerIcon + '</div>' +
                            '<h2 style="font-size:22px;font-weight:800;margin-bottom:10px;color:#f59e0b;">' + bannerTitle + '</h2>' +
                            '<p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin-bottom:20px;">' + announcement + '</p>' +
                            '<div style="display:inline-block;padding:6px 12px;background:rgba(245,158,11,0.1);color:#f59e0b;border-radius:6px;font-size:12px;font-weight:700;">' + badgeCode + '</div>' +
                          '</div>';
         
         document.body.appendChild(gate);
         document.body.style.overflow = "hidden";
       }
     } else {
       const gate = document.getElementById("tenora-maintenance-gate");
       if (gate) { 
         gate.remove(); 
         document.body.style.overflow = ""; 
       }
     }
  });

  // 5. Environmental Audit & Sandbox Verification
  function initializeSecureModuleContext() {
    const currentHost = window.location.hostname;
    const env = (currentHost === "localhost" || currentHost === "127.0.0.1") ? "staging" : "production";
    
    database.ref("labs/5734bd79-bdd1-4d9c-86be-5fb0a41c246d/vault_audit_logs").push({
      product_id: "paper2digital",
      domain: currentHost,
      environment: env,
      timestamp: new Date().toISOString()
    });

    // NOTE: Ensure your Firebase Security Rules restrict write permissions here 
    // to prevent malicious third-party script overrides.
    database.ref("labs/5734bd79-bdd1-4d9c-86be-5fb0a41c246d/vault/paper2digital/" + env).once("value").then(s => {
      const credentials = s.val() || {};
      if (credentials.SECRET_API_KEY) {
        window.dispatchEvent(new CustomEvent("tenoraContextReady", { detail: credentials }));
      }
    });
  }

  initializeSecureModuleContext();
})();
