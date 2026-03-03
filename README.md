# OpenH11-UI — Modified VIA Web Application

A customized fork of the [VIA](https://usevia.app) web application, tailored for the **DOIO KBGM-H11 (OpenH11)** keyboard. This project is based on the original [the-via/app](https://github.com/the-via/app) repository.

> **Upstream base commit:** [`49a0a1a`](https://github.com/the-via/app/commit/49a0a1a) (Merge pull request #373 from plodah/keycap-theme-fix)

---

## Changes from Original VIA

Below is a summary of all modifications made on top of the upstream VIA codebase. These changes are organized by feature area.

### 1. OpenH11 Keyboard Definition & Native Injection

**Files:**
- `public/OpenH11Via.json` *(new)*
- `src/store/devicesThunks.ts`

**Description:**

- Added a VIA-compatible keyboard definition JSON for the OpenH11 (vendorId `0xD010`, productId `0x2202`, 3×10 matrix layout).
- Modified the `loadSupportedIds()` thunk to **natively inject** the OpenH11 definition at boot time. This means the OpenH11 keyboard is recognized automatically without needing to manually load a JSON file through the Design tab.
- The injection fetches `/OpenH11Via.json` with a cache-busting query parameter, registers it into `supportedIds`, pre-loads it into the Redux definition store, and persists it as a custom definition in IndexedDB.

### 2. Dedicated OpenH11 Pane (Default Landing Page)

**Files:**
- `src/components/panes/openh11.tsx` *(new)*
- `src/utils/pane-config.ts`
- `src/components/panes/configure.tsx`
- `src/components/two-string/canvas-router.tsx`
- `src/components/three-fiber/canvas-router.tsx`

**Description:**

- Created a new `OpenH11Pane` component that serves as the default landing page (`/` route), replacing the original Configure pane's route (moved to `/configure`).
- The OpenH11 pane includes:
  - The **layer control** bar with layer buttons and an inline layer name editor.
  - A **sync toggle** (🔄 icon) that, when enabled, automatically switches the displayed layer based on real-time hardware layer changes received via Raw HID.
  - Keyboard capture for fast key remapping (identical to the original Configure pane behavior).
- Refactored `configure.tsx`:
  - Exported `Loader`, `LoaderPane`, and a new `ConfigurePanels` component so they can be reused by the OpenH11 pane.
  - The original `ConfigureGrid` component remains for the `/configure` route.
- Updated both the 2D (`two-string/canvas-router.tsx`) and 3D (`three-fiber/canvas-router.tsx`) canvas routers to handle the new `/` (OpenH11) and `/configure` routes, adding a new keyboard render group at position 4 for the OpenH11 pane.

### 3. Custom Layer Naming

**Files:**
- `src/components/panes/configure-panes/layer-control.tsx`
- `src/store/settingsSlice.ts`
- `src/types/types.ts`

**Description:**

- Added an inline text input next to the layer buttons that allows users to **assign custom names to each layer** (e.g., "Djmax", "Rift Dancer", "MuseDash").
- Layer names are stored in the Redux `settings` slice under `layerNames`, keyed by `vendorProductId` (a persistent hardware identifier) and layer index. This ensures names **persist across WebHID reconnections**, even when the device path changes.
- Default layer names are pre-populated on first connect:
  | Layer | Default Name     |
  |-------|-----------------|
  | 0     | Djmax           |
  | 1     | Djmax Setup     |
  | 2     | Rift Dancer     |
  | 3     | Diva            |
  | 4     | RhythmDoctor    |
  | 5     | MuseDash        |
- Added the `layerNames` field to the `Settings` type definition.

### 4. Layer Name Display on Keyboard Canvas

**Files:**
- `src/components/two-string/keyboard-canvas.tsx`

**Description:**

- Added a **Layer HUD** below the keyboard canvas that displays the current layer index badge and the custom layer name.
- Styled with accent colors, glow effects, and bold typography for high visibility during gameplay.

### 5. Layer Names in Save/Load

**Files:**
- `src/components/panes/configure-panes/save-load.tsx`

**Description:**

- Extended the VIA save file format (`ViaSaveFile` type) with an optional `layerNames` field.
- When **saving** a layout, layer names for the current device are included in the exported JSON.
- When **loading** a layout, layer names from the file are restored into the Redux store.
- Changed the default save filename to `h11mod.json`.

### 6. Real-Time Layer Sync via Raw HID

**Files:**
- `src/shims/node-hid.ts`
- `src/components/panes/test.tsx`
- `src/components/panes/openh11.tsx`

**Description:**

- Modified the WebHID input report listener to intercept **Raw HID packets with command byte `0xFE`**. When received, the second byte is treated as the current layer index, and a `via-layer-update` custom DOM event is dispatched.
- The OpenH11 pane listens for this event and (when sync mode is enabled) automatically switches the displayed layer to match the hardware.
- Added an `ActiveLayerIndicator` component to the **Test pane** that shows the current hardware layer with a highlight animation on change.
- Added a resilience improvement: if the HID device is found to be closed when a `write()` is attempted, it will try to re-open the device before sending data.

### 7. Key Navigation Order Fix

**Files:**
- `src/utils/keyboard-rendering.ts`

**Description:**

- Changed `getNextKey()` to use the **logical order defined in the JSON layout** instead of the spatial traversal order. This makes fast-remap key navigation follow the natural key order defined in the keyboard definition, which is more intuitive for the OpenH11's non-standard physical layout.

### 8. Minor Code Style Changes

Across most modified files, import statements were reformatted from `{foo}` to `{ foo }` (added spaces inside curly braces). These are cosmetic changes and do not affect functionality.

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a WebHID-compatible browser (Chrome/Edge).

## Building

```bash
npm run build
```

## License

This project inherits the [GPLv3 license](./LICENSE) from the original VIA project.
