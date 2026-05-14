# Chrome Web Store Listing Draft

## Extension name

Instagram Native Video Controls

## Short description

Shows Chrome's native HTML5 video controls on Instagram videos when you hover them.

## Detailed description

Instagram Native Video Controls adds Chrome's built-in HTML5 video controls to Instagram videos while your pointer is over them. It makes it easier to scrub through videos, pause or play precisely, and adjust volume with the browser's normal video UI.

The extension only runs on instagram.com. It does not call external services, does not inject ads, and does not collect or transmit personal data. Volume and mute are saved locally in the Instagram page's browser storage so new videos can reuse your last setting.

## Single purpose

Show native Chrome HTML5 video controls on Instagram videos.

## Privacy answers

- Data collection: No user data is collected or transmitted by the extension.
- Remote code: No remote code is loaded or executed.
- Permissions justification: The extension uses a content script that runs only on `https://www.instagram.com/*` and `https://instagram.com/*` so it can find Instagram `<video>` elements and enable native controls.
- Privacy policy: Host the contents of [`PRIVACY.md`](PRIVACY.md) on a public URL and add that URL in the Chrome Web Store Developer Dashboard if Chrome asks for one.

## Testing instructions

1. Install the extension.
2. Open `https://www.instagram.com/`.
3. Open a feed video, reel, or video post.
4. Hover the video.
5. Confirm the native Chrome control bar appears and can scrub, play or pause, and adjust volume.
6. Move the pointer away and confirm the controls hide after a short delay.
