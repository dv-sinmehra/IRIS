# Design brief — IRIS redesign

## User-selected direction
The user requested a minimalist white-background theme, no color-coded visual language, big rounded buttons, high-resolution imagery and larger elements. The homepage should not open on graphs or statistics; a prominent button should take visitors to a separate page inside the site where the risk data lives. This direction is authoritative.

## Design system

**Design movement.** A restrained editorial field atlas: clean modern web typography paired with expansive monochrome cyclone photography, intentional empty space and simple navigator-like controls. The result should feel composed and human, not like a generated analytics template.

**Core principles.** Start with purpose and atmosphere rather than metrics; keep all risk numbers, maps and analytical visuals on a dedicated dashboard route; give the hero one unmistakable next step; make type and controls comfortably large; use clear hierarchy and direct language; preserve the explicit simulated-data warning where the dashboard is shown.

**Color philosophy.** A deliberately non-color-coded palette only: warm white canvas, paper-white surfaces, near-black typography, charcoal for primary actions and a small range of neutral grays for rules, borders, map layers, captions and secondary states. Do not use cyan, coral, amber, red, green or blue as risk/status color cues. Distinguish dashboard states with labels, shapes, stroke weights and neutral tonal contrast.

**Layout paradigm.** Spacious white editorial landing page with a straightforward wordmark header, oversized headline and generous two-column opening with one large panoramic image. Use wide margins and a few large, rounded controls. Place the interactive risk intelligence interface at `/dashboard`; preserve the existing functional modules. The dashboard may be denser than the landing page but should use bigger panels and readable type on the same white, monochrome system.

**Signature elements.** Large grayscale satellite-style cyclone image with natural storm-eye detail; large rounded black-on-white “Explore the risk dashboard” button; open whitespace; distinct landing/dashboard navigation; a handful of editorial planning-story cards rather than homepage metrics. The existing cyclone-eye / protected-coast symbol should be simplified to a black-and-white mark.

**Interaction philosophy.** Primary hero button and dashboard navigation move to a separate in-site page at `/dashboard`; browser back returns home. Add simple large-button tabs to explore evacuation, infrastructure hardening and pre-arranged liquidity without showing dashboard numbers on the landing page. Keep the existing scenario controls and analytical modules available on the dashboard only. Expose readable data provenance, reliability and actual calculation steps within the dashboard.

**Animation.** The user supplied React Bits DomeGallery and TargetCursor guidance. Use drag rotation, image enlargement, and an understated pointer-target effect on the homepage only. Preserve a visible native pointer, support keyboard activation, disable TargetCursor for touch and reduced-motion contexts, and honor `prefers-reduced-motion` for gallery transitions. No pulsing hazard effects or flashing.

**Typography system.** A large, editorial display face (system serif) for the main statement; crisp system sans for body and controls; body text and clickable labels larger than the original interface; use tabular numerals only on the dashboard.

**Brand essence.** See the risk before it reaches shore; preparedness with clarity and care.

**Brand voice.** Direct, calm and human. Avoid alarmist language, visual noise and the appearance of a generic AI control panel. Be direct that the current numbers are hand-authored demo examples, not live observations or reliable forecasts.

**Wordmark/logo.** Preserve the recognizable cyclone-eye and protected-coast metaphor, now rendered as broad black and gray shapes on a full-bleed white square. Use the same monochrome asset in header, favicon and project branding.

**Signature brand color.** None: the requested signature treatment is black on white, supported only by neutral grays.

## Requested interaction and image update — 30 September 2026
Replace the prior hero image URL, which currently resolves to the SPA shell instead of image bytes, with the exact high-resolution Managed Storage URL reserved by the image tool for the cyclone hero. Add four separate generated grayscale coastal-preparedness photographs using their exact reserved Managed Storage URLs in the draggable DomeGallery. Do not invent local files or use imagery as if it were live satellite evidence. The image tool reports the URLs are placeholders until generation completes; continue building without polling them. The homepage shows a caption identifying all five scenes as conceptual illustrations, not GEE observations, real events or data.

Keep the user-selected white, all-grayscale editorial direction. Integrate the supplied TargetCursor on desktop homepage targets as a restrained bracket-following flourish, but do not hide the native cursor; disable it on touch and reduced-motion contexts. The gallery remains operable by keyboard, and its transitions honor `prefers-reduced-motion`. Do not add colorful status encoding, metrics to the landing hero, or a faux-live data feed.

The dashboard receives a large, clear “Data & calculations” entry point and a calm, readable explanation of the demo’s source, reliability, processing, exact formulas and outputs. Its controls and small-screen layouts use responsive grids with generous padding and deliberate line wrapping. Notifications/profile become honest local demo popovers. Preserve the static SPA and its strict simulation-only/unsent boundary.