# Instagram Native Video Controls

A userscript that turns on the browser's built-in HTML5 video controls on [Instagram](https://www.instagram.com/) feeds and reels, so you can scrub, pause, and change volume the same way as on a normal web video.

## What it does

Instagram often layers custom UI over `<video>` elements and may disable native `controls`, which makes precise seeking and volume changes awkward. This userscript:

- Enables native `controls` on the video under your pointer.
- Raises the active video in the stacking order and temporarily sets overlapping ancestors to `pointer-events: none` so clicks reach the control bar.
- Stops pointer/click events on the video from bubbling in the capture phase, so Instagram's handlers are less likely to swallow control interactions.
- Remembers **volume** locally in Instagram's page storage (key: `tm-instagram-native-video-controls-volume`) and reapplies it to newly focused videos.
- Leaves Instagram's own bottom-right mute/unmute button available by hiding this script's native mute button and yielding that relative corner zone back to Instagram.

When the pointer leaves the video, controls are turned off again after a short delay so the page behaves more like stock Instagram when you are not hovering a clip.

## Requirements

- A browser userscript manager such as Tampermonkey, Violentmonkey, or Greasemonkey.

## Installation

1. Install a userscript manager for your browser.
2. Add [`instagram-video-controls.user.js`](instagram-video-controls.user.js) to the manager.
3. Reload Instagram.
4. Move the pointer over a playing video; the native control bar should appear at the bottom of that video.

## Usage

- **Hover** a video to show native controls; **move away** to hide them after a brief delay.
- Use the scrubber, play/pause, and volume as usual. Volume persists across visits for the same origin.
- Move to the bottom-right corner of the video to use Instagram's own mute/unmute button.

## Files

| File | Purpose |
|------|---------|
| `instagram-video-controls.user.js` | Userscript that enables native video controls on Instagram. |
| `LICENSE` | MIT license text. |

## Notes and limitations

- Instagram changes their DOM and behavior often; the script may need updates if overlays or event handling change.
- Only `https://www.instagram.com/*` and `https://instagram.com/*` are affected.
- The userscript does not call external APIs, load remote code, or collect/transmit personal data.

## License

This project is licensed under the [MIT License](LICENSE).
