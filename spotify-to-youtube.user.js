// ==UserScript==
// @name         Spotify to YouTube Search
// @namespace    https://github.com/NightMean/Spotify-To-Youtube-Search
// @version      1.0.0
// @description  Attaches an always-visible YouTube search button directly to Spotify's + button.
// @author       NightMean
// @match        https://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://raw.githubusercontent.com/NightMean/Spotify-To-Youtube-Search/main/spotify-to-youtube.user.js
// @downloadURL  https://raw.githubusercontent.com/NightMean/Spotify-To-Youtube-Search/main/spotify-to-youtube.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // SVG icon for YouTube (YouTube play logo)
    const YOUTUBE_SVG = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" style="display: block; vertical-align: middle;">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    `;

    // Inject custom CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .s2yt-btn {
            background: transparent;
            border: none;
            color: var(--text-subdued, #b3b3b3);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            margin: 0 4px;
            border-radius: 50%;
            transition: color 0.15s ease, transform 0.15s ease, opacity 0.15s ease, background-color 0.15s ease;
            outline: none;
            vertical-align: middle;
            -webkit-tap-highlight-color: transparent;
        }

        .s2yt-btn:hover {
            color: #FF0000 !important;
            transform: scale(1.15);
            background-color: rgba(255, 255, 255, 0.1);
        }

        .s2yt-btn:active {
            transform: scale(0.95);
        }

        /* Tracklist row + button wrapper: Always visible container for YouTube icon with zero layout shift */
        .s2yt-add-wrapper {
            position: relative !important;
            overflow: visible !important;
            opacity: 1 !important;
            visibility: visible !important;
        }

        /* Spotify's + SVG icon inside addBtn obeys hover (hidden by default, shown on row hover) */
        [data-testid="tracklist-row"]:not(:hover) .s2yt-add-wrapper > svg {
            opacity: 0 !important;
            transition: opacity 0.15s ease;
        }

        [data-testid="tracklist-row"]:hover .s2yt-add-wrapper > svg {
            opacity: 1 !important;
        }

        /* YouTube button: ALWAYS VISIBLE, spaced 40px to the left of + button (centered in gap, zero + shift) */
        .s2yt-btn-row {
            position: absolute;
            right: calc(100% + 40px);
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            padding: 0;
            margin: 0;
            border-radius: 50%;
            opacity: 0.85 !important;
            visibility: visible !important;
            pointer-events: auto;
            z-index: 10;
        }

        .s2yt-btn-row:hover {
            opacity: 1 !important;
            color: #FF0000 !important;
            transform: translateY(-50%) scale(1.15) !important;
        }
    `;
    document.head.appendChild(style);

    /**
     * Language-independent check if the user is currently logged into Spotify.
     */
    function isUserLoggedIn() {
        if (document.querySelector('[data-testid="login-button"]') ||
            document.querySelector('[data-testid="signup-button"]') ||
            document.querySelector('a[href*="/login"]')) {
            return false;
        }
        return true;
    }

    /**
     * Creates a YouTube search URL for artist and track title.
     */
    function createYouTubeSearchUrl(artist, title) {
        const cleanArtist = (artist || '').trim();
        const cleanTitle = (title || '').trim();
        const query = `${cleanArtist} ${cleanTitle}`.trim();
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }

    /**
     * Opens YouTube search in a new tab.
     */
    function openYouTubeSearch(artist, title, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const url = createYouTubeSearchUrl(artist, title);
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    /**
     * Helper to create a YouTube button element (uses span if inside another button for HTML5 compliance).
     */
    function createYouTubeButton(getMetadataFn, extraClass = '', isSpan = false) {
        const btn = document.createElement(isSpan ? 'span' : 'button');
        if (!isSpan) {
            btn.type = 'button';
        } else {
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
        }
        btn.className = `s2yt-btn ${extraClass}`.trim();
        btn.innerHTML = YOUTUBE_SVG;
        btn.title = 'Search on YouTube';
        btn.setAttribute('aria-label', 'Search on YouTube');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const { artist, title } = getMetadataFn();
            openYouTubeSearch(artist, title, e);
        });

        return btn;
    }

    /**
     * 1. PROCESS NOW PLAYING BAR (Bottom Player Widget)
     */
    function processNowPlayingBar() {
        if (!isUserLoggedIn()) {
            document.querySelectorAll('.s2yt-now-playing').forEach(el => el.remove());
            return;
        }

        const widget = document.querySelector('[data-testid="now-playing-widget"]') ||
            document.querySelector('[data-testid="now-playing-bar"]') ||
            document.querySelector('.now-playing-bar');

        if (!widget) return;

        const existingBtns = widget.querySelectorAll('.s2yt-now-playing');
        if (existingBtns.length > 0) {
            for (let i = 1; i < existingBtns.length; i++) {
                existingBtns[i].remove();
            }
            return;
        }

        const targetContainer = widget.querySelector('[data-testid="track-info"]') ||
            widget.querySelector('.now-playing-bar__left') ||
            widget;

        const btn = createYouTubeButton(() => getNowPlayingMetadata(widget), 's2yt-now-playing');

        const saveButton = widget.querySelector('[data-testid="add-button"]') ||
            widget.querySelector('button[aria-label*="Save"]') ||
            widget.querySelector('button[aria-label*="Uložiť"]') ||
            widget.querySelector('button[aria-label*="Add"]') ||
            widget.querySelector('button[aria-label*="Pridať"]');

        if (saveButton && saveButton.parentNode) {
            saveButton.parentNode.insertBefore(btn, saveButton.nextSibling);
        } else {
            targetContainer.appendChild(btn);
        }
    }

    /**
     * Extract metadata from Now Playing bar widget.
     */
    function getNowPlayingMetadata(widget) {
        const titleEl = widget.querySelector('[data-testid="context-item-link"]') ||
            widget.querySelector('[data-testid="now-playing-widget"] a[href*="/track/"]') ||
            widget.querySelector('[data-testid="now-playing-widget"] a[href*="/album/"]') ||
            widget.querySelector('a[data-testid="now-playing-link"]');

        const title = titleEl ? titleEl.textContent.trim() : '';

        const artistEls = widget.querySelectorAll('[data-testid="context-item-author"] a, [data-testid="now-playing-widget"] a[href*="/artist/"]');
        let artist = '';
        if (artistEls.length > 0) {
            artist = Array.from(artistEls).map(el => el.textContent.trim()).filter(Boolean).join(', ');
        } else {
            const fallbackArtistEl = widget.querySelector('[data-testid="context-item-author"]') || widget.querySelector('.artist-name');
            artist = fallbackArtistEl ? fallbackArtistEl.textContent.trim() : '';
        }

        return { artist, title };
    }

    /**
     * 2. PROCESS TRACKLIST ROWS (Playlists, Albums, Search, Artist Top Tracks)
     */
    function processTracklistRows() {
        const rows = document.querySelectorAll('[data-testid="tracklist-row"]');

        rows.forEach(row => {
            const addBtn = row.querySelector('[data-testid="add-button"]') ||
                row.querySelector('button[aria-label*="Save"]') ||
                row.querySelector('button[aria-label*="Uložiť"]') ||
                row.querySelector('button[aria-label*="Add"]') ||
                row.querySelector('button[aria-label*="Pridať"]') ||
                row.querySelector('button[aria-label*="knižnic"]') ||
                row.querySelector('button[aria-label*="library"]');

            if (!addBtn) return;

            // Skip if addBtn already has our YouTube button
            if (addBtn.querySelector('.s2yt-btn-row')) return;

            addBtn.classList.add('s2yt-add-wrapper');

            // Create span button (valid HTML5 inside button element)
            const btn = createYouTubeButton(() => getTracklistRowMetadata(row), 's2yt-btn-row', true);
            addBtn.appendChild(btn);
        });
    }

    /**
     * Extract metadata from a tracklist row cleanly at click time.
     */
    function getTracklistRowMetadata(row) {
        const titleEl = row.querySelector('[data-testid="internal-track-link"]') ||
            row.querySelector('a[href*="/track/"]') ||
            row.querySelector('.standalone-ellipsis-one-line') ||
            row.querySelector('div[dir="auto"]');

        let title = titleEl ? titleEl.textContent.trim() : '';

        // Clean up video/audio prefixes like "Hudobné video • "
        title = title.replace(/^(Hudobné video|Music video|Audio)\s*•\s*/i, '').trim();

        const artistEls = row.querySelectorAll('a[href*="/artist/"]');
        let artist = '';
        if (artistEls.length > 0) {
            artist = Array.from(artistEls).map(el => el.textContent.trim()).filter(Boolean).join(', ');
        } else {
            const secondaryTextEl = row.querySelector('span[dir="auto"]:not(:first-child)');
            artist = secondaryTextEl ? secondaryTextEl.textContent.trim() : '';
        }

        return { artist, title };
    }

    /**
     * Main scan function.
     */
    let scanTimeout = null;
    function scanSpotifyUI() {
        processNowPlayingBar();
        processTracklistRows();
    }

    function debouncedScan() {
        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(scanSpotifyUI, 200);
    }

    // Initial execution
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scanSpotifyUI);
    } else {
        scanSpotifyUI();
    }

    // Observe dynamic SPA changes
    const observer = new MutationObserver(debouncedScan);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
