# RadioStream

A radio streaming web app with modern dark theme interface.

![Version](https://img.shields.io/badge/version-6.9.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Screenshots

### Main View
![Main View](screenshots/main-view.png)

### Search
![Search](screenshots/search.png)

### Playlist Modal
![Playlist](screenshots/playlist-modal.png)

## Features

- 30,000+ radio stations from radio-browser.info
- Dark/Light theme toggle
- Search by name, country, or genre with instant suggestions
- Favorites with localStorage
- Custom playlists (create, rename, reorder, remove stations)
- Recently played stations (last 20)
- Share stations via Web Share API / copy link
- Deep link sharing (`?station={uuid}`)
- Now Playing banner on home view
- Sidebar navigation with genre filters
- Active card highlight with equalizer animation
- Skeleton loading placeholders
- Player with play/pause, skip, volume, mute
- Three-dot menu for extra actions
- Error handling with retry
- PWA support (installable)
- Responsive design (mobile → desktop)
- Keyboard shortcuts

## Installation

1. Clone the repository:
```bash
git clone https://github.com/syamsiridwan2-cpu/radiotube.git
cd radiotube
```

2. Open `index.html` in your browser

Or use a local server:
```bash
python -m http.server 8000
# or
npx serve .
```

## Live Demo

https://syamsiridwan2-cpu.github.io/radiotube/

## Usage

1. Click a station to start playing
2. Use the search bar to find stations by name, country, or genre
3. Click the heart icon to add stations to favorites
4. Create playlists and add stations to them
5. Share stations using the share button (📤)
6. Toggle dark/light mode with the theme button

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← | Previous station |
| → | Next station |
| F | Toggle favorite |
| Esc | Close sidebar |

## Project Structure

```
radiotube/
├── index.html              # Main HTML
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── base.css            # Reset & base styles
│   ├── header.css          # Header & search bar
│   ├── sidebar.css         # Sidebar navigation
│   ├── content.css         # Station grid & cards
│   ├── player.css          # Player bar
│   ├── animations.css      # Animations & effects
│   └── responsive.css      # Media queries
├── js/
│   └── app.js              # Main application (all logic)
├── icons/
│   ├── icon-192.svg        # PWA icon
│   └── icon-512.svg        # PWA icon
├── screenshots/            # App screenshots
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── README.md               # This file
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

## API

Powered by [radio-browser.info](https://www.radio-browser.info/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [radio-browser.info](https://www.radio-browser.info/) - Free radio station database
