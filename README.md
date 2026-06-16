# Paper2Digital---ID-Image-Optimizer

Paper2Digital is a lightweight, privacy-first Progressive Web App (PWA) designed to compress, filter, and stitch front and back ID images for seamless bank and payment gateway uploads (e.g., Paystack, Kuda, GTBank). 

The entire process runs **100% client-side** in the user's browser. No data, personal identification information, or images ever leave the device.

---

## ✨ Features

* **Zero-Server Architecture:** Complete privacy compliance (NDPR). Image scaling, canvas drawing, and filtering happen purely in local memory.
* **Platform Presets:** Quick configuration drops matching structural strict limits:
    * *Paystack Style:* Max 500KB (Optimized scale)
    * *Kuda Style:* Max 1MB
    * *Bank Style:* Max 2MB
* **Clean Mode Engine:** Built-in canvas preprocessing pixel manipulation to neutralize yellow overhead lighting and harsh shadows on documents.
* **Complete PWA Capability:** Fully installable asset system with Service Worker integration for total offline functionality.
* **True Adaptive UI:** Built-in automatic dark mode toggle and iPhone safe-area notch layouts.
* **Compliance Protection:** Outputs are cleanly stamped with an anti-fraud watermark: *"Not a verified document"*.

---

## 🛠️ File Structure

```text
├── index.html         # Application markup, semantic structure & modals
├── style.css          # Design system, variable mappings & media queries
├── script.js          # Core image processing, PWA install handlers & workflow
├── sw.js              # Service Worker managing stale asset caching logic
├── manifest.json      # Web app manifest declaration profiles
├── robots.txt         # Search crawler directions
├── sitemap.xml        # Static search navigation indexes
├── favicon.svg        # Scalable application logo vector
├── icon-192.png       # Android PWA home screen asset icon
└── icon-512.png       # Android PWA splash screen loading asset icon
