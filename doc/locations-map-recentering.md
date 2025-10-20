# Locations Map Recentering Fix

**Date**: 2025-10-20  
**Feature**: Frontend – Locations page map

---

## Symptom

When the "Lieux" page loaded, the Leaflet map repeatedly jumped between the
user's geolocated position and a midpoint toward Brussels. The browser console
logged `Tiles loaded successfully` each time the viewport shifted, hinting that
tile refreshes were involved.

## Root Cause

Two behaviors compounded the problem:

1. **Locate control kept updating the view** – The Leaflet `locate` control was
   configured with `flyTo` enabled and kept requesting location updates. Each
   successful geolocation call tried to adjust the map, even after the app had
   already aligned the view with the nearest location.
2. **Map reinitialization race** – `scheduleMapRefresh()` could re-run `initMap()`
   while the map was still being hydrated. The freshly created map used the
   latest `userPosition` snapshot for its `center` value. Because this work
   happened around tile loading, the map viewport appeared to "bounce"
  between Brussels (default center) and the user's coordinates.

## Fix

- Added a `mapInitialized` flag so `initMap()` executes only once per component
  lifecycle, preventing late re-creation of the map container.
- Updated the locate control options to disable automatic viewport changes:
  `flyTo: false`, `keepCurrentZoomLevel: true`, and `setView: false`.
- After the first successful geolocation (`handleLocateSuccess`), the code now
  calls `locateControl.stop()` to avoid further automatic adjustments. Manual
  background refreshes still run, but the viewport remains stable.

Together, these changes remove the unwanted midpoint jump while preserving the
ability to highlight the nearest location and display the user position.
