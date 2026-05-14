# Instagram Native Video Controls

A browser userscript that turns on the browser’s built-in HTML5 video controls on [Instagram](https://www.instagram.com/) feeds and reels, so you can scrub, pause, and change volume the same way as on a normal web video.

## What it does

Instagram often layers custom UI over `<video>` elements and may disable native `controls`, which makes precise seeking and volume changes awkward. This script:

- Enables native `controls` on the video under your pointer.
- Raises the active video in the stacking order and temporarily sets overlapping ancestors to `pointer-events: none` so clicks reach the control bar.
- Stops pointer/click events on the video from bubbling in the capture phase, so Instagram’s handlers are less likely to swallow control interactions.
- Remembers **volume** and **mute** in `localStorage` (key: `tm-instagram-native-video-controls-volume`) and reapplies them to newly focused videos.

When the pointer leaves the video, controls are turned off again after a short delay so the page behaves more like stock Instagram when you are not hovering a clip.

## Requirements

- **Chromium-based browser** (Chrome, Edge, Brave, etc.) — written and tested around Chrome-style native controls.
- A **userscript manager**, for example [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), or [Greasemonkey](https://www.greasespot.net/) (Firefox).

## Installation

1. Install a userscript extension for your browser.
2. Create a new script in the manager and paste the contents of [`instagram-video-controls.user.js`](instagram-video-controls.user.js), **or** open that file as a raw URL if you host the repo and use “Install from URL” if your manager supports it.
3. Save and confirm the script is **enabled** for `https://www.instagram.com/*` and `https://instagram.com/*`.
4. Reload Instagram. Move the pointer over a playing video; the native control bar should appear at the bottom of that video.

## Usage

- **Hover** a video to show native controls; **move away** to hide them after a brief delay.
- Use the scrubber, play/pause, and volume as usual. Volume and mute persist across visits for the same origin.

## Files

| File | Purpose |
|------|---------|
| `instagram-video-controls.user.js` | Userscript source (`@version` in the header is the release line). |

## Notes and limitations

- Instagram changes their DOM and behavior often; the script may need updates if overlays or event handling change.
- Only the URLs matched in the script header are affected (`www.instagram.com` and `instagram.com`).
- The script uses `@grant none` and does not call external APIs; all logic runs in the page context as injected by the userscript manager.

## License

This project is licensed under the [MIT License](LICENSE).
