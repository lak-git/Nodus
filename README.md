# Nodus : Disaster Response System

Nodus is an offline-first disaster response platform built for natural disaster scenarios like landslides and floods. It combines a field responder Progressive Web App ("Nodus") and a command dashboard so first responders can log incidents in a complete connectivity blackout, store them safely on-device, and automatically sync them to headquarters once any network access returns—ensuring zero data loss across the entire response lifecycle.

*Nodus stands for 'connection' in Latin. The very thing we strive for in the dire situation incident responders are in*

---

## Features

- Offline-first Progressive Web App optimized for mobile field responders**
- Online/offline login with persistent authentication and cached Supabase session
- Secure on-device incident storage using IndexedDB (via Dexie) for full offline/airplane‑mode operation
- Offline incident logging with GPS auto-capture and cached coordinates
- Local pending queue with robust statuses (local/pending/syncing/synced/failed)
- Automatic incident synchronization when connectivity returns, including image upload to Supabase Storage
- Field responder home with:
  - "Create Incident" flow
  - Pending reports view for unsynced incidents
  - "My Reports" list of synced incidents
- Dashboard heatmap of incidents using Leaflet + leaflet.heat
- Dashboard weather overlays (precipitation, clouds, temperature, wind) via OpenWeatherMap tiles
- Severity-aware incident markers and color-coded density gradient on the map
- Nearby incident alerts for responders with mini-map previews
- Connectivity banner that clearly indicates online/offline state and sync behavior
- Admin-ready Command Dashboard with:
  - Live map visualization of active operations
  - Split views for Active vs Resolved incidents
  - Filter controls by incident type, severity, and date range
  - Incident tables with selection and a detailed side panel
  - Real-time updates from Supabase (Postgres changes)
- Voice-assisted reporting:
  - Speech-to-text capture for field notes
  - Automatic extraction of incident type and severity from spoken descriptions
- Photo capture with on-device compression before upload to save bandwidth
- PWA install support with a custom install prompt hook
- Role-aware data access and account approvals screen for admin workflows

---

## Technology Stack

- React 19 with TypeScript
- Vite 7
- Tailwind CSS 4, shadcn/ui, and Radix 
- Supabase
- IndexedDB via Dexie 
- React Router for routing between field and command experiences
- React Leaflet, Leaflet, and leaflet.heat
- OpenStreetMap and OpenWeatherMap

---

## Contributors

- [Lakindu Perera (Technical/Team Lead)](https://linkedin.com/in/lakindu-h-perera) | [GitHub](https://github.com/lak-git)
- [Stefan Shabbir (Developer)](https://linkedin.com/in/stefan-shabbir) | [GitHub](https://github.com/stefanshabbir)
- [Manojram Ragu (Developer)](https://linkedin.com/in/manojram-ragu) | [GitHub](https://github.com/ManojramRagu)
- [Saviskar Thiruchelvam (Developer)](https://linkedin.com/in/saviskar-thiruchelvam-44bb201b7) | [GitHub](https://github.com/Saviskar)
- [Jahani Rathugamage (UI/UX | QA)](https://linkedin.com/in/jahanir) | [GitHub](https://github.com/jahanirathugamage)