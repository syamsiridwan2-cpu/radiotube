/**
 * APP.JS - v6.0.0
 * Modular radio streaming app
 * Fixed: favorites (use stationuuid), playlists, playing indicator
 */

const APP_VERSION = '6.6.2';
console.log('%c RadioStream v' + APP_VERSION, 'font-size:20px; font-weight:bold; color:#1a73e8;');

// ============================================================
//  STATE
// ============================================================
const state = {
    stations: [],
    currentIndex: -1,
    playingStationId: null,
    playingStationData: null,
    offset: 0,
    limit: 30,
    hasMore: true,
    isLoading: false,
    isPlaying: false,
    favorites: [],
    playlists: [],
    recentlyPlayed: [],
    currentView: 'home',
    currentGenre: null,
    _searchTimer: null,
    audio: null,
    stationGrid: null,
    statusMsg: null,
    loadMoreBtn: null,
    resultCount: null,
    contentTitle: null,
    searchInput: null,
    searchType: null,
    suggestions: null,
    volumeSlider: null,
    muteBtn: null,
    themeToggle: null,
    playBtn: null,
    prevBtn: null,
    nextBtn: null,
    sidebar: null,
    menuToggle: null,
    favoritesBtn: null,
    favCount: null,
    playerStationName: null,
    playerStationDetail: null,
    playerArt: null,
    progressFill: null,
    playerProgress: null,
    versionBadge: null,
};

function $(id) { return document.getElementById(id); }

function initDomReferences() {
    state.audio = $('audio');
    state.playerStationName = $('playerStationName');
    state.playerStationDetail = $('playerStationDetail');
    state.playerArt = $('playerArt');
    state.playBtn = $('playBtn');
    state.stationGrid = $('stationGrid');
    state.statusMsg = $('statusMsg');
    state.loadMoreBtn = $('loadMoreBtn');
    state.resultCount = $('resultCount');
    state.contentTitle = $('contentTitle');
    state.searchInput = $('searchInput');
    state.searchType = $('searchType');
    state.suggestions = $('suggestions');
    state.volumeSlider = $('volumeSlider');
    state.muteBtn = $('muteBtn');
    state.themeToggle = $('themeToggle');
    state.prevBtn = $('prevBtn');
    state.nextBtn = $('nextBtn');
    state.sidebar = $('sidebar');
    state.menuToggle = $('menuToggle');
    state.favoritesBtn = $('favoritesBtn');
    state.favCount = $('favCount');
    state.progressFill = $('progressFill');
    state.playerProgress = $('playerProgress');
    state.versionBadge = $('versionBadge');
}

// ============================================================
//  HELPERS
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
}

function stationUuid(st) {
    return st.stationuuid || st.id;
}

// ============================================================
//  TOAST
// ============================================================
function showToast(message) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
}

// ============================================================
//  FAVORITES
// ============================================================
function handleToggleFavorite(uuid) {
    console.log('[fav] toggle:', uuid);
    var idx = state.favorites.indexOf(uuid);
    if (idx > -1) {
        state.favorites.splice(idx, 1);
        console.log('[fav] removed');
    } else {
        state.favorites.push(uuid);
        console.log('[fav] added');
    }
    localStorage.setItem('radio_favorites_v2', JSON.stringify(state.favorites));
    state.favCount.textContent = state.favorites.length;
    console.log('[fav] saved:', state.favorites);

    var favBtn = $('toggleFavBtn');
    if (favBtn && state.playingStationId === uuid) {
        var isFav = state.favorites.indexOf(uuid) > -1;
        favBtn.classList.toggle('active', isFav);
        favBtn.textContent = isFav ? '\u2764\uFE0F' : '\u2B50';
    }

    renderCurrentStations();
}

function loadFavorites() {
    try {
        var data = localStorage.getItem('radio_favorites_v2');
        state.favorites = data ? JSON.parse(data) : [];
    } catch (e) {
        state.favorites = [];
    }
    state.favCount.textContent = state.favorites.length;
    console.log('[fav] loaded:', state.favorites);
}

// ============================================================
//  PLAYLISTS
// ============================================================
function loadPlaylists() {
    try {
        var data = localStorage.getItem('radio_playlists_v1');
        state.playlists = data ? JSON.parse(data) : [];
    } catch (e) {
        state.playlists = [];
    }
}

function savePlaylists() {
    localStorage.setItem('radio_playlists_v1', JSON.stringify(state.playlists));
}

// ============================================================
//  RECENTLY PLAYED
// ============================================================
function loadRecentlyPlayed() {
    try {
        var data = localStorage.getItem('radio_recently_played_v1');
        state.recentlyPlayed = data ? JSON.parse(data) : [];
    } catch (e) {
        state.recentlyPlayed = [];
    }
}

function saveRecentlyPlayed() {
    localStorage.setItem('radio_recently_played_v1', JSON.stringify(state.recentlyPlayed));
}

function addToRecentlyPlayed(station) {
    var uuid = stationUuid(station);
    state.recentlyPlayed = state.recentlyPlayed.filter(function(s) { return s.stationuuid !== uuid; });
    state.recentlyPlayed.unshift({
        stationuuid: uuid,
        name: station.name || 'Unknown',
        country: station.country || '',
        url: station.url,
        urlResolved: station.urlResolved,
        tags: station.tags || '',
        bitrate: station.bitrate || 0,
        language: station.language || ''
    });
    if (state.recentlyPlayed.length > 20) state.recentlyPlayed = state.recentlyPlayed.slice(0, 20);
    saveRecentlyPlayed();
    renderRecentlyPlayedBadge();
}

function renderRecentlyPlayedBadge() {
    var badge = $('recentlyPlayedCount');
    if (badge) badge.textContent = state.recentlyPlayed.length;
}

function createPlaylist(name) {
    var id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    var playlist = { id: id, name: name, stations: [], createdAt: new Date().toISOString() };
    state.playlists.push(playlist);
    savePlaylists();
    renderPlaylistSidebar();
    return playlist;
}

function addStationToPlaylist(playlistId, station) {
    var playlist = state.playlists.find(function(p) { return p.id === playlistId; });
    if (!playlist) return false;
    var uuid = stationUuid(station);
    if (playlist.stations.find(function(s) { return s.stationuuid === uuid; })) return false;
    playlist.stations.push({
        stationuuid: uuid,
        name: station.name || 'Unknown',
        country: station.country || '',
        url: station.url,
        urlResolved: station.urlResolved,
        tags: station.tags || '',
        bitrate: station.bitrate || 0
    });
    savePlaylists();
    renderPlaylistSidebar();
    return true;
}

function handleAddToPlaylist(station) {
    showPlaylistModal(station);
}

function renamePlaylist(playlistId) {
    var playlist = state.playlists.find(function(p) { return p.id === playlistId; });
    if (!playlist) return;
    var newName = prompt('Rename playlist:', playlist.name);
    if (newName && newName.trim()) {
        playlist.name = newName.trim();
        savePlaylists();
        renderPlaylistSidebar();
        if (state.currentView === 'playlist:' + playlistId) {
            state.contentTitle.textContent = newName.trim();
        }
        showToast('Playlist di-rename');
    }
}

function removeStationFromPlaylist(playlistId, stationUuid) {
    var playlist = state.playlists.find(function(p) { return p.id === playlistId; });
    if (!playlist) return;
    playlist.stations = playlist.stations.filter(function(s) { return s.stationuuid !== stationUuid; });
    savePlaylists();
    renderPlaylistSidebar();
    loadStations(true);
    showToast('Stasiun dihapus dari playlist');
}

function moveStationInPlaylist(playlistId, stationUuid, direction) {
    var playlist = state.playlists.find(function(p) { return p.id === playlistId; });
    if (!playlist) return;
    var idx = playlist.stations.findIndex(function(s) { return s.stationuuid === stationUuid; });
    if (idx < 0) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= playlist.stations.length) return;
    var temp = playlist.stations[idx];
    playlist.stations[idx] = playlist.stations[newIdx];
    playlist.stations[newIdx] = temp;
    savePlaylists();
    loadStations(true);
}

function renderPlaylistSidebar() {
    var container = $('playlistList');
    if (!container) return;

    if (state.playlists.length === 0) {
        container.innerHTML = '<p class="no-playlist-msg">Belum ada playlist</p>';
        return;
    }

    container.innerHTML = state.playlists.map(function(p) {
        return '<div class="sidebar-item playlist-sidebar-item ' + (state.currentView === 'playlist:' + p.id ? 'active' : '') + '" data-playlist-id="' + p.id + '">' +
            '<span class="item-icon">🎵</span>' +
            '<span class="playlist-name-text">' + escapeHtml(p.name) + '</span>' +
            '<span class="item-badge">' + p.stations.length + '</span>' +
            '<button class="playlist-rename-btn" data-playlist-id="' + p.id + '" aria-label="Rename" title="Rename">✏️</button>' +
            '<button class="playlist-delete-btn" data-playlist-id="' + p.id + '" aria-label="Hapus">✕</button>' +
        '</div>';
    }).join('');

    container.querySelectorAll('.playlist-sidebar-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.playlist-delete-btn') || e.target.closest('.playlist-rename-btn')) return;
            var playlistId = item.dataset.playlistId;
            state.currentView = 'playlist:' + playlistId;
            state.currentGenre = null;
            state.searchInput.value = '';
            loadStations(true);
            closeSidebar();
        });
    });

    container.querySelectorAll('.playlist-delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var playlistId = btn.dataset.playlistId;
            var playlist = state.playlists.find(function(p) { return p.id === playlistId; });
            if (confirm('Hapus playlist "' + playlist.name + '"?')) {
                state.playlists = state.playlists.filter(function(p) { return p.id !== playlistId; });
                savePlaylists();
                renderPlaylistSidebar();
                if (state.currentView === 'playlist:' + playlistId) {
                    state.currentView = 'home';
                    loadStations(true);
                }
            }
        });
    });

    container.querySelectorAll('.playlist-rename-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            renamePlaylist(btn.dataset.playlistId);
        });
    });
}

// ============================================================
//  PLAYLIST MODAL
// ============================================================
function showPlaylistModal(station) {
    var existing = $('playlistModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'playlistModal';
    modal.className = 'playlist-modal-overlay';

    var stationListHtml = '';
    if (state.playlists.length === 0) {
        stationListHtml = '<p class="no-playlists" style="text-align:center;color:var(--text-muted);padding:20px;">Belum ada playlist. Buat baru!</p>';
    } else {
        stationListHtml = state.playlists.map(function(p) {
            return '<div class="playlist-select-item" data-playlist-id="' + p.id + '" style="display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;transition:background 0.2s;">' +
                '<span style="font-size:1.2rem;">🎵</span>' +
                '<span style="flex:1;font-weight:500;">' + escapeHtml(p.name) + '</span>' +
                '<span style="font-size:0.8rem;color:var(--text-muted);">' + p.stations.length + ' lagu</span>' +
            '</div>';
        }).join('');
    }

    modal.innerHTML = '<div class="playlist-modal">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);">' +
            '<h3 style="font-size:1.1rem;font-weight:600;margin:0;">Tambah ke Playlist</h3>' +
            '<button class="playlist-modal-close" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-muted);padding:4px 8px;">✕</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;padding:16px 20px;background:var(--bg-hover);">' +
            '<span style="font-size:1.5rem;">📻</span>' +
            '<span style="font-weight:500;">' + escapeHtml(station.name) + '</span>' +
        '</div>' +
        '<div class="playlist-modal-list" style="max-height:250px;overflow-y:auto;padding:8px 0;">' +
            stationListHtml +
        '</div>' +
        '<div style="display:flex;gap:8px;padding:16px 20px;border-top:1px solid var(--border);">' +
            '<input type="text" id="newPlaylistNameInput" placeholder="Nama playlist baru..." maxlength="50" style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg-input);color:var(--text-primary);font-size:0.9rem;outline:none;" />' +
            '<button id="modalCreateBtn" style="padding:10px 20px;background:var(--accent);color:white;border:none;border-radius:6px;font-weight:500;cursor:pointer;">Buat</button>' +
        '</div>' +
    '</div>';

    document.body.appendChild(modal);

    modal.querySelector('.playlist-modal-close').addEventListener('click', function() { modal.remove(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

    modal.querySelectorAll('.playlist-select-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var playlistId = item.dataset.playlistId;
            var added = addStationToPlaylist(playlistId, station);
            if (added) {
                var pl = state.playlists.find(function(p) { return p.id === playlistId; });
                showToast('Ditambahkan ke "' + pl.name + '"');
            } else {
                showToast('Stasiun sudah ada di playlist');
            }
            modal.remove();
        });
    });

    var doCreate = function() {
        var input = $('newPlaylistNameInput');
        var name = input.value.trim();
        if (name) {
            var newPlaylist = createPlaylist(name);
            addStationToPlaylist(newPlaylist.id, station);
            showToast('Playlist "' + name + '" dibuat');
            modal.remove();
        }
    };

    $('modalCreateBtn').addEventListener('click', doCreate);
    $('newPlaylistNameInput').addEventListener('keydown', function(e) { if (e.key === 'Enter') doCreate(); });
    $('newPlaylistNameInput').focus();
}

// ============================================================
//  THEME
// ============================================================
function loadTheme() {
    var saved = localStorage.getItem('radio_theme_v2');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    return theme;
}

function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('radio_theme_v2', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    state.themeToggle.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
}

// ============================================================
//  API
// ============================================================
var API_BASE = 'https://de1.api.radio-browser.info/json';
var USER_AGENT = 'RadioStream/6.0.0';

async function apiFetchStations(params) {
    params = params || {};
    var query = params.query || '';
    var type = params.type || 'name';
    var limit = params.limit || 30;
    var offset = params.offset || 0;
    var tag = params.tag || null;

    var url = '';
    var base = API_BASE + '/stations';

    if (tag) {
        url = base + '/bytag/' + encodeURIComponent(tag);
    } else if (query.trim()) {
        var map = { name: 'byname', country: 'bycountry', tag: 'bytag' };
        url = base + '/' + (map[type] || 'byname') + '/' + encodeURIComponent(query.trim());
    } else {
        url = base;
    }

    var searchParams = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        order: 'clickcount',
        reverse: 'true',
        hidebroken: 'true',
    });

    try {
        var res = await fetch(url + '?' + searchParams, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch (err) {
        console.error('API error:', err);
        return [];
    }
}

async function apiFetchStationByUuid(uuid) {
    try {
        var res = await fetch(API_BASE + '/stations/byuuid/' + uuid, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return null;
        var data = await res.json();
        return (data && data.length) ? data[0] : null;
    } catch (e) { return null; }
}

async function apiFetchStationById(id) {
    try {
        var res = await fetch(API_BASE + '/stations/byid/' + id, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return null;
        var data = await res.json();
        return (data && data.length) ? data[0] : null;
    } catch (e) { return null; }
}

async function apiFetchSuggestions(query, type) {
    if (!query.trim() || query.length < 2) return [];
    try {
        var map = { name: 'byname', country: 'bycountry', tag: 'bytag' };
        var url = API_BASE + '/stations/' + (map[type] || 'byname') + '/' + encodeURIComponent(query.trim()) + '?limit=8&order=clickcount&reverse=true&hidebroken=true';
        var res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
}

function apiReportClick(stUuid) {
    if (!stUuid) return;
    fetch(API_BASE + '/url/' + encodeURIComponent(stUuid), {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT }
    }).catch(function() {});
}

// ============================================================
//  RENDER
// ============================================================
function renderCurrentStations() {
    renderStations(state.stations);
}

function renderStations(stations) {
    var grid = state.stationGrid;
    if (!stations || !stations.length) {
        grid.innerHTML = '';
        state.resultCount.textContent = '0 stasiun';
        return;
    }

    var emojis = ['🎵','🎶','🎧','📻','🎸','🎷','🎹','🥁','🎺','🎻','🪕','🎤'];
    var html = '';
    var isPlaylistView = state.currentView.startsWith('playlist:');
    var currentPlaylistId = isPlaylistView ? state.currentView.split(':')[1] : null;

    stations.forEach(function(st, idx) {
        var uuid = stationUuid(st);
        var isFav = state.favorites.indexOf(uuid) > -1;
        var tags = st.tags ? st.tags.split(',').slice(0, 4).map(function(t) { return t.trim(); }).filter(Boolean) : [];
        var name = st.name || 'Stasiun';
        var country = st.country || '\u2014';
        var isActive = state.playingStationId === uuid;
        var isPlaying = isActive && state.isPlaying;
        var emoji = emojis[idx % emojis.length];

        var playlistBtns = '';
        if (isPlaylistView) {
            playlistBtns =
                '<button class="pl-move-btn" data-uuid="' + uuid + '" data-dir="-1" aria-label="Naik" title="Naik">\u2191</button>' +
                '<button class="pl-move-btn" data-uuid="' + uuid + '" data-dir="1" aria-label="Turun" title="Turun">\u2193</button>' +
                '<button class="pl-remove-btn" data-uuid="' + uuid + '" aria-label="Hapus dari playlist" title="Hapus">\u2715</button>';
        }

        html += '<div class="station-card' + (isActive ? ' active' : '') + '" data-index="' + idx + '" data-uuid="' + uuid + '">' +
            '<button class="fav-btn' + (isFav ? ' active' : '') + '" data-uuid="' + uuid + '" aria-label="Favorit">' + (isFav ? '\u2764\uFE0F' : '\u2B50') + '</button>' +
            '<button class="share-btn" data-uuid="' + uuid + '" aria-label="Share" title="Share stasiun ini">\uD83D\uDCE4</button>' +
            (isPlaylistView ? playlistBtns : '<button class="add-playlist-btn" data-uuid="' + uuid + '" aria-label="Tambah ke Playlist" title="Tambah ke Playlist">📋</button>') +
            '<div class="card-art">' +
                emoji +
                '<div class="playing-overlay">' +
                    '<span class="play-icon">' + (isPlaying ? '\u23F8' : '\u25B6') + '</span>' +
                '</div>' +
                (isPlaying ? '<div class="eq-bars"><span></span><span></span><span></span><span></span></div>' : '') +
                '<div class="playing-indicator' + (isPlaying ? ' active' : '') + '">Now Playing</div>' +
            '</div>' +
            '<div class="card-name">' + escapeHtml(name) + '</div>' +
            '<div class="card-meta">' +
                '<span>' + escapeHtml(country) + '</span>' +
                (st.bitrate ? '<span>' + st.bitrate + ' kbps</span>' : '') +
            '</div>' +
            (tags.length ? '<div class="card-tags">' + tags.map(function(t) { return '<span>' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '') +
        '</div>';
    });

    grid.innerHTML = html;
    state.resultCount.textContent = stations.length + ' stasiun';

    grid.querySelectorAll('.station-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.fav-btn') || e.target.closest('.share-btn') || e.target.closest('.add-playlist-btn') || e.target.closest('.pl-remove-btn') || e.target.closest('.pl-move-btn')) return;
            var idx = parseInt(card.dataset.index);
            playStation(idx);
        });
    });

    grid.querySelectorAll('.fav-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('[fav] button clicked, uuid:', btn.dataset.uuid);
            handleToggleFavorite(btn.dataset.uuid);
        });
    });

    grid.querySelectorAll('.add-playlist-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var uuid = btn.dataset.uuid;
            var station = stations.find(function(s) { return stationUuid(s) === uuid; });
            if (station) handleAddToPlaylist(station);
        });
    });

    grid.querySelectorAll('.pl-remove-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentPlaylistId) removeStationFromPlaylist(currentPlaylistId, btn.dataset.uuid);
        });
    });

    grid.querySelectorAll('.pl-move-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentPlaylistId) moveStationInPlaylist(currentPlaylistId, btn.dataset.uuid, parseInt(btn.dataset.dir));
        });
    });

    grid.querySelectorAll('.share-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var station = stations.find(function(s) { return stationUuid(s) === btn.dataset.uuid; });
            if (station) shareStation(station);
        });
    });

    updateNowPlayingBanner();
}

function renderSuggestions(items) {
    var ul = state.suggestions;
    if (!items || !items.length) { ul.classList.remove('active'); return; }

    ul.innerHTML = items.map(function(st) {
        var uuid = stationUuid(st);
        var name = st.name || 'Stasiun';
        var country = st.country || '';
        var tags = st.tags ? st.tags.split(',').slice(0, 2).map(function(t) { return t.trim(); }).filter(Boolean).join(', ') : '';
        return '<div class="suggestion-item" data-uuid="' + uuid + '">' +
            '<span class="suggestion-icon">📻</span>' +
            '<div class="suggestion-content">' +
                '<div class="suggestion-name">' + escapeHtml(name) + '</div>' +
                '<div class="suggestion-meta">' + country + (tags ? ' \u00B7 ' + escapeHtml(tags) : '') + '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    ul.classList.add('active');

    ul.querySelectorAll('.suggestion-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var uuid = item.dataset.uuid;
            var existing = state.stations.find(function(s) { return stationUuid(s) === uuid; });
            if (existing) {
                playStation(state.stations.indexOf(existing));
            } else {
                apiFetchStationByUuid(uuid).then(function(st) {
                    if (st) {
                        state.stations = [st].concat(state.stations);
                        renderStations(state.stations);
                        playStation(0);
                    }
                });
            }
            ul.classList.remove('active');
            state.searchInput.value = item.querySelector('.suggestion-name').textContent || '';
        });
    });
}

function renderSkeleton(count) {
    var html = '';
    for (var i = 0; i < count; i++) {
        html += '<div class="station-card skeleton"><div class="card-art">\uD83C\uDFB5</div><div class="card-name">Loading...</div></div>';
    }
    state.stationGrid.innerHTML = html;
}

// ============================================================
//  NOW PLAYING BANNER
// ============================================================
function updateNowPlayingBanner() {
    var banner = $('nowPlayingBanner');
    if (!banner) return;

    var show = state.currentView === 'home' && state.playingStationId !== null;
    banner.classList.toggle('visible', show);

    if (!show) return;

    var station = state.playingStationData;
    if (!station) { banner.classList.remove('visible'); return; }

    $('npbArt').textContent = '\uD83D\uDCFB';
    $('npbName').textContent = station.name || 'Stasiun';
    var lang = Array.isArray(station.language) ? station.language.join(', ') : (station.language || '');
    $('npbDetail').textContent = [station.country, lang].filter(Boolean).join(' \u00B7 ') || 'Streaming';
    $('npbPlayBtn').textContent = state.isPlaying ? '\u23F8' : '\u25B6';
    $('npbEq').style.display = state.isPlaying ? 'flex' : 'none';
}

// ============================================================
//  ERROR HANDLING
// ============================================================
function getPlayErrorMessage(err) {
    var name = err.name || '';
    if (name === 'NotSupportedError') return 'Format stream tidak didukung browser ini';
    if (name === 'NotAllowedError') return 'Akses audio diblokir oleh browser';
    if (name === 'NotFoundError') return 'Stream tidak tersedia atau offline';
    if (name === 'MediaError') return 'Gagal memuat stream';
    return 'Gagal memutar. Stasiun mungkin sedang offline.';
}

function showPlayerError(msg) {
    var errorEl = $('playerStationError');
    var retryBtn = $('retryBtn');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }
    if (retryBtn) {
        retryBtn.style.display = 'inline-flex';
    }
    var detailEl = $('playerStationDetail');
    if (detailEl) detailEl.style.display = 'none';
}

function clearPlayerError() {
    var errorEl = $('playerStationError');
    var retryBtn = $('retryBtn');
    var detailEl = $('playerStationDetail');
    if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
    if (retryBtn) retryBtn.style.display = 'none';
    if (detailEl) detailEl.style.display = '';
}

function showPlayerLoading(station) {
    var detailEl = $('playerStationDetail');
    if (detailEl) {
        detailEl.textContent = 'Menyambungkan...';
        detailEl.style.display = '';
    }
}

// ============================================================
//  PLAYER
// ============================================================
function playStation(index) {
    var stations = state.stations;
    if (index < 0 || index >= stations.length) return;
    playStationByData(stations[index]);
}

function playStationByData(station) {
    var streamUrl = station.urlResolved || station.url;
    if (!streamUrl) {
        showToast('Stream URL tidak tersedia');
        return;
    }

    var uuid = stationUuid(station);
    state.playingStationId = uuid;
    state.playingStationData = station;
    var idx = state.stations.findIndex(function(s) { return stationUuid(s) === uuid; });
    state.currentIndex = idx >= 0 ? idx : 0;

    var audio = state.audio;
    audio.pause();
    audio.currentTime = 0;

    clearPlayerError();
    updatePlayerUI(station);
    showPlayerLoading(station);

    audio.src = streamUrl;
    audio.load();

    setTimeout(function() {
        audio.play().then(function() {
            state.isPlaying = true;
            state.playBtn.textContent = '\u23F8';
            clearPlayerError();
            updatePlayerUI(station);
            updatePlayerVisualState(true);
            renderStations(state.stations);
        }).catch(function(err) {
            if (err.name === 'AbortError') return;
            var msg = getPlayErrorMessage(err);
            showPlayerError(msg);
            state.isPlaying = false;
            state.playBtn.textContent = '\u25B6';
            showToast(msg);
            renderStations(state.stations);
        });
    }, 100);

    addToRecentlyPlayed(station);
    apiReportClick(stationUuid(station));
}

function togglePlay() {
    if (!state.playingStationId || !state.stations.length) {
        if (state.stations.length) playStation(0);
        return;
    }

    if (state.isPlaying) {
        state.audio.pause();
    } else {
        state.audio.play().catch(function() {});
    }
}

function playPrev() {
    if (!state.stations.length) return;
    var idx = state.currentIndex - 1;
    if (idx < 0) idx = state.stations.length - 1;
    playStation(idx);
}

function playNext() {
    if (!state.stations.length) return;
    var idx = state.currentIndex + 1;
    if (idx >= state.stations.length) idx = 0;
    playStation(idx);
}

function updatePlayerUI(station) {
    var favBtn = $('toggleFavBtn');

    if (station) {
        state.playerStationName.textContent = station.name || 'Stasiun';
        var lang = Array.isArray(station.language) ? station.language.join(', ') : (station.language || '');
        var detail = [station.country, lang].filter(Boolean).join(' \u2022 ');
        state.playerStationDetail.textContent = detail || 'Streaming';
        state.playBtn.textContent = '\u23F8';
        state.playerArt.textContent = '\uD83D\uDCFB';

        if (favBtn) {
            var uuid = stationUuid(station);
            var isFav = state.favorites.indexOf(uuid) > -1;
            favBtn.classList.toggle('active', isFav);
            favBtn.textContent = isFav ? '\u2764\uFE0F' : '\u2B50';
        }
    } else {
        state.playerStationName.textContent = 'Tidak ada yang diputar';
        state.playerStationDetail.textContent = 'Pilih stasiun untuk mulai mendengarkan';
        state.playBtn.textContent = '\u25B6';
        state.playerArt.textContent = '\uD83D\uDCFB';
        if (favBtn) { favBtn.classList.remove('active'); favBtn.textContent = '\u2B50'; }
    }
}

function updatePlayerVisualState(isPlaying) {
    var player = $('player');
    var playerArt = $('playerArt');
    if (player) player.classList.toggle('playing', isPlaying);
    if (playerArt) playerArt.classList.toggle('playing', isPlaying);
}

// ============================================================
//  VOLUME
// ============================================================
function setupVolume() {
    var audio = state.audio;
    var slider = state.volumeSlider;
    var muteBtn = state.muteBtn;

    audio.volume = parseFloat(slider.value);
    var muted = false;

    slider.addEventListener('input', function() {
        audio.volume = parseFloat(slider.value);
        if (audio.volume > 0) { muted = false; muteBtn.textContent = '\uD83D\uDD0A'; }
    });

    muteBtn.addEventListener('click', function() {
        muted = !muted;
        if (muted) { audio.volume = 0; slider.value = '0'; muteBtn.textContent = '\uD83D\uDD07'; }
        else { audio.volume = 0.8; slider.value = '0.8'; muteBtn.textContent = '\uD83D\uDD0A'; }
    });
}

// ============================================================
//  LOAD STATIONS
// ============================================================
async function loadStations(reset) {
    if (state.isLoading) return;
    state.isLoading = true;
    state.loadMoreBtn.disabled = true;

    if (reset) {
        state.offset = 0;
        state.stations = [];
        state.hasMore = true;
        state.statusMsg.textContent = 'Memuat...';
        renderSkeleton(6);
    }

    var query = state.searchInput.value;
    var type = state.searchType.value;
    var tag = state.currentGenre;

    var data = [];

    if (state.currentView === 'favorites') {
        var favStations = [];
        for (var i = 0; i < state.favorites.length; i++) {
            var favId = state.favorites[i];
            var st = await apiFetchStationByUuid(favId);
            if (!st && !isNaN(favId)) {
                st = await apiFetchStationById(favId);
            }
            if (st) favStations.push(st);
        }
        state.stations = favStations;
        data = favStations;
        state.contentTitle.textContent = 'Stasiun Favorit';
        state.hasMore = false;
    } else if (state.currentView === 'recent') {
        state.stations = state.recentlyPlayed.map(function(s) {
            return {
                stationuuid: s.stationuuid,
                name: s.name,
                country: s.country,
                url: s.url,
                urlResolved: s.urlResolved,
                tags: s.tags,
                bitrate: s.bitrate,
                language: s.language || ''
            };
        });
        data = state.stations;
        state.contentTitle.textContent = 'Terakhir Diputar';
        state.hasMore = false;
    } else if (state.currentView.startsWith('playlist:')) {
        var playlistId = state.currentView.split(':')[1];
        var playlist = state.playlists.find(function(p) { return p.id === playlistId; });
        if (playlist) {
            state.stations = playlist.stations.map(function(s) {
                return {
                    stationuuid: s.stationuuid,
                    name: s.name,
                    country: s.country,
                    url: s.url,
                    urlResolved: s.urlResolved,
                    tags: s.tags,
                    bitrate: s.bitrate
                };
            });
            data = state.stations;
            state.contentTitle.textContent = playlist.name;
        }
        state.hasMore = false;
    } else {
        try {
            data = await apiFetchStations({ query: query, type: type, limit: state.limit, offset: state.offset, tag: tag });
        } catch (e) {
            data = [];
        }
        if (data && data.length) {
            state.stations = reset ? data : state.stations.concat(data);
            state.hasMore = data.length === state.limit;
            state.offset += data.length;
        } else {
            if (reset) {
                state.stations = [];
                state.statusMsg.textContent = query.trim() ? 'Tidak ditemukan.' : 'Gagal memuat stasiun. Periksa koneksi internet.';
            }
            else state.hasMore = false;
        }
        if (tag) state.contentTitle.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        else if (query.trim()) state.contentTitle.textContent = 'Hasil: "' + query + '"';
        else state.contentTitle.textContent = 'Semua Stasiun';
    }

    renderStations(state.stations);

    state.isLoading = false;
    state.loadMoreBtn.disabled = false;
    state.loadMoreBtn.textContent = state.hasMore ? 'Muat Lebih Banyak' : 'Semua stasiun dimuat';

    if (!state.stations.length && state.currentView === 'favorites') state.statusMsg.textContent = 'Belum ada stasiun favorit.';
    else if (!state.stations.length && state.currentView === 'recent') state.statusMsg.textContent = 'Belum ada riwayat pemutaran.';
    else if (!state.stations.length && state.currentView.startsWith('playlist:')) state.statusMsg.textContent = 'Playlist kosong.';
    else if (!state.stations.length) state.statusMsg.textContent = 'Tidak ada stasiun.';
    else state.statusMsg.textContent = '';

    document.querySelectorAll('.sidebar-item[data-view]').forEach(function(el) {
        el.classList.toggle('active', el.dataset.view === state.currentView);
    });
}

// ============================================================
//  SIDEBAR
// ============================================================
function setupSidebar() {
    document.querySelectorAll('.sidebar-item[data-view]').forEach(function(item) {
        item.addEventListener('click', function() {
            state.currentView = item.dataset.view;
            state.currentGenre = null;
            state.searchInput.value = '';
            updateNowPlayingBanner();
            loadStations(true);
            closeSidebar();
        });
    });

    document.querySelectorAll('.sidebar-item[data-genre]').forEach(function(item) {
        item.addEventListener('click', function() {
            state.currentGenre = item.dataset.genre;
            state.currentView = 'home';
            state.searchInput.value = '';
            updateNowPlayingBanner();
            loadStations(true);
            closeSidebar();
        });
    });

    state.favoritesBtn.addEventListener('click', function() {
        state.currentView = 'favorites';
        state.currentGenre = null;
        state.searchInput.value = '';
        updateNowPlayingBanner();
        loadStations(true);
        closeSidebar();
    });

    $('logoLink').addEventListener('click', function(e) {
        e.preventDefault();
        state.currentView = 'home';
        state.currentGenre = null;
        state.searchInput.value = '';
        updateNowPlayingBanner();
        loadStations(true);
        closeSidebar();
    });

    state.menuToggle.addEventListener('click', function() {
        state.sidebar.classList.toggle('open');
        toggleBackdrop();
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && !state.sidebar.contains(e.target) && !state.menuToggle.contains(e.target)) closeSidebar();
    });
}

function closeSidebar() {
    state.sidebar.classList.remove('open');
    var backdrop = document.querySelector('.sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
}

function toggleBackdrop() {
    var backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.addEventListener('click', closeSidebar);
        document.body.appendChild(backdrop);
    }
    backdrop.classList.toggle('active', state.sidebar.classList.contains('open'));
}

// ============================================================
//  KEYBOARD
// ============================================================
function setupKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                playNext();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                playPrev();
                break;
            case 'f':
            case 'F':
                if (state.playingStationId) handleToggleFavorite(state.playingStationId);
                break;
            case 'Escape':
                closeSidebar();
                state.suggestions.classList.remove('active');
                break;
        }
    });
}

// ============================================================
//  SHARE STATION
// ============================================================
function shareStation(station) {
    var name = station.name || 'Radio Station';
    var url = station.urlResolved || station.url;
    var shareUrl = 'https://syamsiridwan2-cpu.github.io/radiotube/?station=' + encodeURIComponent(stationUuid(station));
    var shareData = {
        title: name,
        text: 'Dengarkan ' + name + ' di RadioStream!',
        url: shareUrl
    };

    if (navigator.share) {
        navigator.share(shareData).catch(function(err) {
            if (err.name !== 'AbortError') copyShareLink(shareUrl, name);
        });
    } else {
        copyShareLink(shareUrl, name);
    }
}

function copyShareLink(url, name) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
            showToast('Link disalin: ' + name, 'success');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Link disalin: ' + name, 'success');
    }
}

function handleStationDeepLink() {
    var params = new URLSearchParams(window.location.search);
    var stationId = params.get('station');
    if (stationId) {
        setTimeout(function() {
            apiFetchStationByUuid(stationId).then(function(st) {
                if (st) playStationByData(st);
            });
            window.history.replaceState({}, '', window.location.pathname);
        }, 1500);
    }
}

// ============================================================
//  INIT
// ============================================================
function init() {
    initDomReferences();
    loadTheme();
    loadFavorites();
    loadRecentlyPlayed();
    loadPlaylists();
    renderPlaylistSidebar();
    renderRecentlyPlayedBadge();
    setupVolume();
    setupSidebar();
    setupKeyboard();

    loadStations(true);

    $('createPlaylistBtn').addEventListener('click', function() {
        var name = prompt('Nama playlist baru:');
        if (name && name.trim()) {
            createPlaylist(name.trim());
            showToast('Playlist "' + name.trim() + '" dibuat');
        }
    });

    var suggestionTimeout = null;
    state.searchInput.addEventListener('input', function() {
        clearTimeout(suggestionTimeout);
        var query = state.searchInput.value;
        var type = state.searchType.value;

        suggestionTimeout = setTimeout(async function() {
            var results = await apiFetchSuggestions(query, type);
            renderSuggestions(results);
        }, 200);

        clearTimeout(state._searchTimer);
        state._searchTimer = setTimeout(function() {
            state.currentView = 'home';
            state.currentGenre = null;
            loadStations(true);
        }, 400);
    });

    state.searchType.addEventListener('click', function() {
        state.currentView = 'home';
        state.currentGenre = null;
        loadStations(true);
    });

    state.loadMoreBtn.addEventListener('click', function() {
        if (state.hasMore && state.currentView === 'home') loadStations(false);
    });

    state.playBtn.addEventListener('click', togglePlay);
    state.prevBtn.addEventListener('click', playPrev);
    state.nextBtn.addEventListener('click', playNext);

    $('retryBtn').addEventListener('click', function() {
        if (state.playingStationData) {
            clearPlayerError();
            playStationByData(state.playingStationData);
        }
    });

    $('addToPlaylistBtn').addEventListener('click', function() {
        if (state.playingStationId) {
            var station = state.stations.find(function(s) { return stationUuid(s) === state.playingStationId; });
            if (station) handleAddToPlaylist(station);
            else showToast('Pilih stasiun terlebih dahulu');
        } else showToast('Pilih stasiun terlebih dahulu');
    });

    $('toggleFavBtn').addEventListener('click', function() {
        if (state.playingStationId) handleToggleFavorite(state.playingStationId);
        else showToast('Pilih stasiun terlebih dahulu');
    });

    $('shareStationBtn').addEventListener('click', function() {
        if (state.playingStationData) shareStation(state.playingStationData);
        else showToast('Pilih stasiun terlebih dahulu');
    });

    state.themeToggle.addEventListener('click', toggleTheme);

    document.addEventListener('click', function(e) {
        if (!state.searchInput.contains(e.target) && !state.suggestions.contains(e.target)) {
            state.suggestions.classList.remove('active');
        }
    });

    state.audio.addEventListener('play', function() {
        state.isPlaying = true;
        state.playBtn.textContent = '\u23F8';
        updatePlayerVisualState(true);
        renderStations(state.stations);
    });

    state.audio.addEventListener('pause', function() {
        state.isPlaying = false;
        state.playBtn.textContent = '\u25B6';
        updatePlayerVisualState(false);
        renderStations(state.stations);
    });

    state.audio.addEventListener('ended', function() {
        state.isPlaying = false;
        state.playBtn.textContent = '\u25B6';
        updatePlayerVisualState(false);
        renderStations(state.stations);
    });

    state.audio.addEventListener('error', function() {
        if (!state.playingStationId) return;
        var msg = 'Gagal memutar stream. Coba stasiun lain.';
        showPlayerError(msg);
        state.isPlaying = false;
        state.playBtn.textContent = '\u25B6';
        updatePlayerVisualState(false);
        showToast(msg);
        renderStations(state.stations);
    });

    // Now Playing Banner play/pause button
    var npbPlayBtn = $('npbPlayBtn');
    if (npbPlayBtn) {
        npbPlayBtn.addEventListener('click', function() {
            togglePlay();
        });
    }

    state.versionBadge.addEventListener('click', function() {
        alert('RadioStream v' + APP_VERSION);
    });

    updateNowPlayingBanner();
    handleStationDeepLink();
    console.log('RadioStream v' + APP_VERSION + ' siap!');
}

document.addEventListener('DOMContentLoaded', init);
