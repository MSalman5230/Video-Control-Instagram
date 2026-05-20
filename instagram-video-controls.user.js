// ==UserScript==
// @name         Instagram Native Video Controls
// @namespace    https://instagram.com/
// @version      2.0.2
// @description  Force Chrome's native HTML5 video controls to work on Instagram videos.
// @author       You
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "tm-instagram-native-video-controls-style";
  const ACTIVE_VIDEO_CLASS = "tm-igvc-native-active";
  const CLICK_THROUGH_CLASS = "tm-igvc-click-through";
  const VOLUME_STORAGE_KEY = "tm-instagram-native-video-controls-volume";
  const INSTAGRAM_MUTE_SAFE_ZONE_WIDTH_RATIO = 0.12;
  const INSTAGRAM_MUTE_SAFE_ZONE_HEIGHT_RATIO = 0.1;
  const INSTAGRAM_MUTE_SAFE_ZONE_MIN_SIZE = 56;
  const INSTAGRAM_MUTE_SAFE_ZONE_MAX_WIDTH = 96;
  const INSTAGRAM_MUTE_SAFE_ZONE_MAX_HEIGHT = 128;

  let activeVideo = null;
  let hideTimer = null;
  let isPointerOverVideo = false;

  const originalControls = new WeakMap();
  const clickThroughElements = new Set();
  const savedVolumeApplied = new WeakSet();

  function createStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      video.${ACTIVE_VIDEO_CLASS} {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 2147483646 !important;
      }

      .${CLICK_THROUGH_CLASS} {
        pointer-events: none !important;
      }

      video.${ACTIVE_VIDEO_CLASS}::-webkit-media-controls-mute-button {
        display: none !important;
      }
    `;

    document.documentElement.append(style);
  }

  function rememberOriginalControls(video) {
    if (!originalControls.has(video)) {
      originalControls.set(video, video.controls);
    }
  }

  function getVideoAtPoint(clientX, clientY) {
    return Array.from(document.querySelectorAll("video")).find((video) => {
      const rect = video.getBoundingClientRect();

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });
  }

  function restoreClickThroughElements() {
    for (const element of clickThroughElements) {
      element.classList.remove(CLICK_THROUGH_CLASS);
    }

    clickThroughElements.clear();
  }

  function markClickThrough(element, video) {
    let current = element;

    while (
      current instanceof Element &&
      current !== document.body &&
      current !== document.documentElement &&
      current !== video &&
      !current.contains(video)
    ) {
      current.classList.add(CLICK_THROUGH_CLASS);
      clickThroughElements.add(current);
      current = current.parentElement;
    }
  }

  function makeCoveringElementsClickThrough(video) {
    const rect = video.getBoundingClientRect();
    const samplePoints = [
      [rect.left + rect.width * 0.5, rect.bottom - 16],
      [rect.left + rect.width * 0.25, rect.bottom - 16],
      [rect.left + rect.width * 0.75, rect.bottom - 16],
      [rect.left + rect.width * 0.5, rect.bottom - 44],
      [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5],
    ];

    restoreClickThroughElements();

    for (const [x, y] of samplePoints) {
      for (const element of document.elementsFromPoint(x, y)) {
        if (element === video || element.contains(video)) break;
        if (!(element instanceof Element)) continue;
        if (video.contains(element)) continue;

        markClickThrough(element, video);
      }
    }
  }

  function stopInstagramVideoEvent(event) {
    event.stopPropagation();
  }

  function loadSavedVolumeSetting() {
    try {
      const savedValue = JSON.parse(localStorage.getItem(VOLUME_STORAGE_KEY));
      const volumePercent = Number(savedValue?.volumePercent);

      if (!Number.isFinite(volumePercent)) return null;

      return {
        volumePercent: Math.min(100, Math.max(0, volumePercent)),
      };
    } catch {
      return null;
    }
  }

  function saveVolumeSetting(video) {
    const volumePercent = Math.round(video.volume * 100);

    try {
      localStorage.setItem(
        VOLUME_STORAGE_KEY,
        JSON.stringify({
          volumePercent,
        }),
      );
    } catch {
      // Ignore storage failures so video controls keep working.
    }
  }

  function applySavedVolumeSetting(video) {
    if (savedVolumeApplied.has(video)) return;

    const savedValue = loadSavedVolumeSetting();
    savedVolumeApplied.add(video);

    if (!savedValue) return;

    video.volume = savedValue.volumePercent / 100;
  }

  function handleVolumeChange(event) {
    if (event.currentTarget instanceof HTMLVideoElement) {
      saveVolumeSetting(event.currentTarget);
    }
  }

  function enableNativeControls(video) {
    rememberOriginalControls(video);
    applySavedVolumeSetting(video);

    video.classList.add(ACTIVE_VIDEO_CLASS);
    video.controls = true;
    video.setAttribute("controls", "");
    video.addEventListener("click", stopInstagramVideoEvent, true);
    video.addEventListener("pointerdown", stopInstagramVideoEvent, true);
    video.addEventListener("pointerup", stopInstagramVideoEvent, true);
    video.addEventListener("volumechange", handleVolumeChange);
    makeCoveringElementsClickThrough(video);
  }

  function restoreNativeControls(video) {
    video.classList.remove(ACTIVE_VIDEO_CLASS);
    video.removeEventListener("click", stopInstagramVideoEvent, true);
    video.removeEventListener("pointerdown", stopInstagramVideoEvent, true);
    video.removeEventListener("pointerup", stopInstagramVideoEvent, true);
    video.removeEventListener("volumechange", handleVolumeChange);
    restoreClickThroughElements();

    if (!originalControls.get(video)) {
      video.controls = false;
      video.removeAttribute("controls");
    }
  }

  function activateVideo(video) {
    window.clearTimeout(hideTimer);

    if (activeVideo && activeVideo !== video) {
      restoreNativeControls(activeVideo);
    }

    activeVideo = video;
    enableNativeControls(video);
  }

  function deactivateVideo() {
    if (!activeVideo) return;

    restoreNativeControls(activeVideo);
    activeVideo = null;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getInstagramMuteSafeZone(video) {
    const rect = video.getBoundingClientRect();
    const width = clamp(
      rect.width * INSTAGRAM_MUTE_SAFE_ZONE_WIDTH_RATIO,
      INSTAGRAM_MUTE_SAFE_ZONE_MIN_SIZE,
      INSTAGRAM_MUTE_SAFE_ZONE_MAX_WIDTH,
    );
    const height = clamp(
      rect.height * INSTAGRAM_MUTE_SAFE_ZONE_HEIGHT_RATIO,
      INSTAGRAM_MUTE_SAFE_ZONE_MIN_SIZE,
      INSTAGRAM_MUTE_SAFE_ZONE_MAX_HEIGHT,
    );

    return {
      left: rect.right - width,
      right: rect.right,
      top: rect.bottom - height,
      bottom: rect.bottom,
    };
  }

  function isInInstagramMuteSafeZone(video, clientX, clientY) {
    const zone = getInstagramMuteSafeZone(video);

    return (
      clientX >= zone.left &&
      clientX <= zone.right &&
      clientY >= zone.top &&
      clientY <= zone.bottom
    );
  }

  function scheduleDeactivateVideo() {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!isPointerOverVideo) {
        deactivateVideo();
      }
    }, 700);
  }

  function handlePointerMove(event) {
    const video = getVideoAtPoint(event.clientX, event.clientY);

    if (video) {
      if (isInInstagramMuteSafeZone(video, event.clientX, event.clientY)) {
        isPointerOverVideo = false;
        deactivateVideo();
        return;
      }

      isPointerOverVideo = true;
      activateVideo(video);
      return;
    }

    isPointerOverVideo = false;
    scheduleDeactivateVideo();
  }

  createStyles();
  document.addEventListener("pointermove", handlePointerMove, true);
})();
