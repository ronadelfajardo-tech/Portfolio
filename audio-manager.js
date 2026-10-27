/*
 * Word Quest audio manager
 * ------------------------
 * Real, local audio files (offline-friendly in browsers and the Windows app).
 * Music starts only after a mouse, touch, or keyboard interaction: modern
 * browsers will not autoplay audio when a page loads.
 * Keep all audio paths here so new songs/sounds are easy to substitute.
 */
(() => {
  "use strict";
  const MUSIC = {
    menu: "audio/music/menu.mp3",
    gameplay: "audio/music/gameplay.mp3"
  };
  const EFFECTS = {
    found: "audio/sfx/found.wav",
    mistake: "audio/sfx/mistake.wav",
    win: "audio/sfx/win.wav",
    lose: "audio/sfx/lose.wav",
    power: "audio/sfx/power.wav",
    coin: "audio/sfx/coin.wav",
    ui: "audio/sfx/ui.wav"
  };
  const LEVELS = { ui: 0.24, found: 0.88, mistake: 0.68, win: 0.9, lose: 0.78, power: 0.85, coin: 0.8 };

  const clamp = v => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
  const settings = {
    masterEnabled: true,
    musicEnabled: true,
    effectsEnabled: true,
    musicVolume: 0.42,
    effectsVolume: 0.72
  };
  let unlocked = false;
  let requestedScene = "menu";
  let activeScene = null;
  let activeMusic = null;

  // Create music tracks lazily. Audio() is available in WebView2 and browsers.
  const tracks = {};
  function loadTrack(name) {
    if (tracks[name]) return tracks[name];
    if (typeof Audio === "undefined") return null;
    const track = new Audio(MUSIC[name]);
    track.loop = true;
    track.preload = "auto";
    track.volume = 0;
    tracks[name] = track;
    return track;
  }
  function safePlay(track) {
    try {
      const playing = track.play();
      if (playing && typeof playing.catch === "function") playing.catch(() => {});
    } catch { /* A missing device or unavailable codec must not break gameplay. */ }
  }
  function syncMusic() {
    const shouldPlay = unlocked && settings.masterEnabled && settings.musicEnabled &&
      settings.musicVolume > 0 && !document.hidden;
    const desired = shouldPlay ? requestedScene : null;
    if (activeMusic && activeScene !== desired) {
      activeMusic.pause();
      try { activeMusic.currentTime = 0; } catch {}
      activeMusic = null;
      activeScene = null;
    }
    if (!desired) return;
    const track = loadTrack(desired);
    if (!track) return;
    track.volume = clamp(settings.musicVolume);
    if (activeScene !== desired) {
      activeMusic = track;
      activeScene = desired;
      safePlay(track);
    } else if (track.paused) {
      safePlay(track);
    }
  }

  function configure(options = {}) {
    for (const k of ["masterEnabled", "musicEnabled", "effectsEnabled"]) {
      if (typeof options[k] === "boolean") settings[k] = options[k];
    }
    for (const k of ["musicVolume", "effectsVolume"]) {
      if (typeof options[k] === "number") settings[k] = clamp(options[k]);
    }
    syncMusic();
  }
  function setScene(name) {
    requestedScene = MUSIC[name] ? name : "menu";
    syncMusic();
  }
  function playEffect(name) {
    if (!EFFECTS[name] || !settings.masterEnabled || !settings.effectsEnabled ||
        settings.effectsVolume <= 0 || typeof Audio === "undefined") return;
    try {
      const effect = new Audio(EFFECTS[name]);
      effect.volume = clamp(settings.effectsVolume * (LEVELS[name] ?? 0.8));
      effect.preload = "auto";
      safePlay(effect);
    } catch { /* Sound is optional; never interrupt a word search. */ }
  }
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    syncMusic();
  }
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
  document.addEventListener("visibilitychange", syncMusic);
  window.addEventListener("pagehide", () => {
    if (activeMusic) activeMusic.pause();
  });
  window.addEventListener("pageshow", syncMusic);

  window.WordQuestAudio = { configure, setScene, playEffect };
})();
