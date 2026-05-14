# Instagram Native Video Controls

A Chrome extension that turns on the browser's built-in HTML5 video controls on [Instagram](https://www.instagram.com/) feeds and reels, so you can scrub, pause, and change volume the same way as on a normal web video.

## What it does

Instagram often layers custom UI over `<video>` elements and may disable native `controls`, which makes precise seeking and volume changes awkward. This extension:

- Enables native `controls` on the video under your pointer.
- Raises the active video in the stacking order and temporarily sets overlapping ancestors to `pointer-events: none` so clicks reach the control bar.
- Stops pointer/click events on the video from bubbling in the capture phase, so Instagram’s handlers are less likely to swallow control interactions.
- Remembers **volume** and **mute** locally in Instagram's page storage (key: `tm-instagram-native-video-controls-volume`) and reapplies them to newly focused videos.

When the pointer leaves the video, controls are turned off again after a short delay so the page behaves more like stock Instagram when you are not hovering a clip.

## Requirements

- **Google Chrome** or another Chromium-based browser that supports Manifest V3 extensions.

## Local installation

### Chrome extension

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the [`extension`](extension) folder from this repo.
5. Reload Instagram. Move the pointer over a playing video; the native control bar should appear at the bottom of that video.

### Userscript

If you prefer using a userscript manager such as Tampermonkey, Violentmonkey, or Greasemonkey, install [`instagram-video-controls.user.js`](instagram-video-controls.user.js) directly instead of loading the Chrome extension.

## Build a Chrome Web Store package

```sh
npm run validate
npm run package
```

The publishable ZIP is written to `dist/instagram-native-video-controls.zip`. The ZIP contains the `extension` folder contents at the package root, which is what the Chrome Web Store expects.

## Usage

- **Hover** a video to show native controls; **move away** to hide them after a brief delay.
- Use the scrubber, play/pause, and volume as usual. Volume and mute persist across visits for the same origin.

## Files

| File | Purpose |
|------|---------|
| `extension/manifest.json` | Manifest V3 extension metadata and Instagram content-script match rules. |
| `extension/content.js` | Chrome extension content script that enables native video controls. |
| `extension/icons/` | Extension icons used by Chrome and the Chrome Web Store package. |
| `scripts/validate-extension.mjs` | Basic local manifest/package sanity check. |
| `scripts/package-extension.mjs` | Creates the publishable ZIP in `dist/`. |
| `STORE-LISTING.md` | Draft Chrome Web Store listing text and privacy answers. |
| `PRIVACY.md` | Privacy policy draft to host and link from the Chrome Web Store listing if needed. |
| `instagram-video-controls.user.js` | Userscript version for people who prefer a userscript manager instead of the Chrome extension. |

## Notes and limitations

- Instagram changes their DOM and behavior often; the script may need updates if overlays or event handling change.
- Only the URLs matched in the extension manifest are affected (`www.instagram.com` and `instagram.com`).
- The extension does not call external APIs, load remote code, or collect/transmit personal data.

## License

This project is licensed under the [MIT License](LICENSE).
