# RadioStream

A radio streaming web app with YouTube Music-style interface.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Screenshot

![Screenshot](placeholder.png)

> TODO: Add your screenshot here

## Features

- 30,000+ radio stations from radio-browser.info
- Dark/Light theme toggle
- Search by name, country, or genre
- Favorites with localStorage
- Sidebar navigation with genre filters
- Active card highlight with equalizer animation
- Ripple click effect on station cards
- Loading skeleton placeholder
- Player glow effect when playing
- Keyboard shortcuts
- PWA support (offline)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/radiotube.git
cd radiotube
```

2. Open `index.html` in your browser

Or use a local server:
```bash
python -m http.server 8000
# or
npx serve .
```

## Usage

1. Click a station to start playing
2. Use the search bar to find stations by name, country, or genre
3. Click the star icon to add stations to favorites
4. Toggle dark/light mode with the theme button
5. Use sidebar to browse by genre

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
│   ├── app.js              # Main entry & state
│   ├── api.js              # API calls
│   ├── player.js           # Audio player
│   ├── ui.js               # UI rendering
│   ├── favorites.js        # Favorites logic
│   ├── theme.js            # Theme toggle
│   └── keyboard.js         # Keyboard shortcuts
├── icons/
│   ├── icon-192.svg        # PWA icon
│   └── icon-512.svg        # PWA icon
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
- YouTube Music - UI inspiration
