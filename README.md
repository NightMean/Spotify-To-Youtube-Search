# Spotify Web to YouTube Search (Userscript)

A Tampermonkey / Violentmonkey / Greasemonkey userscript that automatically injects a **"Search on YouTube"** button into [Spotify Web Player](https://open.spotify.com).

It extracts the artist and track title and opens the corresponding search results on YouTube in a new tab, taking you straight to the official video or audio track.

---

## Features

- **Universal UI Coverage:**
  - **Main Entity Action Bar:** Injects a YouTube search button next to Play / Save `+` / Download buttons in the header action bar on Track, Album, Playlist, and Artist pages.
  - **Sticky Top Bar:** Displays the YouTube button in the sticky top navigation header when scrolling down.
  - **Now Playing Bar:** Injects a YouTube button next to track info & Save `+` button in the bottom player bar (when logged in).
  - **Tracklist Rows:** Injects buttons into track rows across Playlists, Albums, Artist Top Tracks, and Search results so you can search any song without playing it.
- **Always Visible & Clean Layout:** YouTube search button is always visible next to track rows with zero layout shift on Spotify's original `+` button.
- **Zero-Dependency & Fast:** Opens direct YouTube search queries without requiring API keys or third-party servers.

---

## Installation

1. Make sure you have a UserScript manager installed:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Click **[Install Here](https://raw.githubusercontent.com/NightMean/Spotify-To-Youtube-Search/main/spotify-to-youtube.user.js)**
3. Confirm the installation in your manager.

---

## How It Works

1. Clicking the YouTube search icon on any track row or bottom player widget extracts the artist name and track title live.
2. It constructs a search URL: `https://www.youtube.com/results?search_query=Artist+-+Title`.
3. It opens the search results in a new browser tab.

---

## Donations
To support me you can use link below:

<a href="https://www.buymeacoffee.com/nightmean" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="width: 200px !important;" ></a>

## License

This project is licensed under the **MIT** License.
