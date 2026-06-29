/**
 * APP.JS - v6.0.0
 * Modular radio streaming app
 * Fixed: favorites (use stationuuid), playlists, playing indicator
 */

const APP_VERSION = '6.10.0';
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
    sleepTimer: null,
    sleepTimerEnd: null,
    alarms: [],
    alarmCheckInterval: null,
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

var ICON = {
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    heartFill: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    music: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    guitar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2l4 4-7 7-4-4z"/><path d="M2 22l4-4"/><path d="M11 7l-1.5 1.5"/><path d="M15.5 8.5L14 10"/><path d="M7.5 13.5L6 15"/><path d="M10 17l-1.5 1.5"/></svg>',
    headphone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    speaker: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    radio: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>',
    mic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    vinyl: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    pause: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
    skipBack: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>',
    skipForward: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>',
    share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    clipboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    starFill: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    refresh: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    volume: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    volumeX: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    chevronUp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
    chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    more: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
    list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    rock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2l4 4-7 7-4-4z"/><path d="M2 22l4-4"/><path d="M11 7l-1.5 1.5"/></svg>',
    jazz: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    classical: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    electronic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>',
    pop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>',
    hiphop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    arrowUp: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
    arrowDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
};

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

function setStaticIcons() {
    var menuToggle = $('menuToggle');
    if (menuToggle) menuToggle.innerHTML = ICON.menu;
    var searchIcon = document.querySelector('.search-icon');
    if (searchIcon) searchIcon.innerHTML = ICON.search;
    var favsBtn = $('favoritesBtn');
    if (favsBtn) favsBtn.innerHTML = ICON.heart;
    var themeTgl = $('themeToggle');
    if (themeTgl) themeTgl.innerHTML = ICON.sun;
    var prevBtn = $('prevBtn');
    if (prevBtn) prevBtn.innerHTML = ICON.skipBack;
    var nextBtn = $('nextBtn');
    if (nextBtn) nextBtn.innerHTML = ICON.skipForward;
    var retryBtn = $('retryBtn');
    if (retryBtn) retryBtn.innerHTML = ICON.refresh;
    var muteBtn = $('muteBtn');
    if (muteBtn) muteBtn.innerHTML = ICON.volume;
    var moreBtn = $('playerMoreBtn');
    if (moreBtn) moreBtn.innerHTML = ICON.more;
    var sleepBtn = $('sleepTimerBtn');
    if (sleepBtn) sleepBtn.innerHTML = '<span class="di-icon">⏰</span><span class="di-label">Sleep Timer</span>';
    var dropFav = $('toggleFavBtn');
    if (dropFav) { var di = dropFav.querySelector('.di-icon'); if (di) di.innerHTML = ICON.star; }
    var dropShare = $('shareStationBtn');
    if (dropShare) { var di2 = dropShare.querySelector('.di-icon'); if (di2) di2.innerHTML = ICON.share; }
    var dropAdd = $('addToPlaylistBtn');
    if (dropAdd) { var di3 = dropAdd.querySelector('.di-icon'); if (di3) di3.innerHTML = ICON.clipboard; }
    document.querySelectorAll('.sidebar-item[data-view="home"] .item-icon').forEach(function(el) { el.innerHTML = ICON.home; });
    document.querySelectorAll('.sidebar-item[data-view="favorites"] .item-icon').forEach(function(el) { el.innerHTML = ICON.heart; });
    document.querySelectorAll('.sidebar-item[data-view="recent"] .item-icon').forEach(function(el) { el.innerHTML = ICON.clock; });
    document.querySelectorAll('.sidebar-item[data-genre="rock"] .item-icon').forEach(function(el) { el.innerHTML = ICON.rock; });
    document.querySelectorAll('.sidebar-item[data-genre="jazz"] .item-icon').forEach(function(el) { el.innerHTML = ICON.jazz; });
    document.querySelectorAll('.sidebar-item[data-genre="classical"] .item-icon').forEach(function(el) { el.innerHTML = ICON.classical; });
    document.querySelectorAll('.sidebar-item[data-genre="electronic"] .item-icon').forEach(function(el) { el.innerHTML = ICON.electronic; });
    document.querySelectorAll('.sidebar-item[data-genre="pop"] .item-icon').forEach(function(el) { el.innerHTML = ICON.pop; });
    document.querySelectorAll('.sidebar-item[data-genre="hiphop"] .item-icon').forEach(function(el) { el.innerHTML = ICON.hiphop; });
    var createBtn = $('createPlaylistBtn');
    if (createBtn) { var sp = createBtn.querySelector('span'); if (sp) sp.innerHTML = ICON.plus; }
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

function updateToggleFavIcon(uuid) {
    var favBtn = $('toggleFavBtn');
    if (!favBtn || (uuid && state.playingStationId !== uuid)) return;
    var isFav = state.favorites.indexOf(state.playingStationId) > -1;
    favBtn.classList.toggle('active', isFav);
    var di = favBtn.querySelector('.di-icon');
    if (di) di.innerHTML = isFav ? ICON.heartFill : ICON.heart;
}

// ============================================================
//  SLEEP TIMER
// ============================================================
function startSleepTimer(minutes) {
    cancelSleepTimer();
    var endTime = Date.now() + minutes * 60 * 1000;
    state.sleepTimerEnd = endTime;
    localStorage.setItem('radio_sleep_end', String(endTime));
    state.sleepTimer = setInterval(function() {
        var remaining = Math.max(0, Math.round((state.sleepTimerEnd - Date.now()) / 1000));
        var countdownEl = $('sleepTimerCountdown');
        if (countdownEl) {
            var m = Math.floor(remaining / 60);
            var s = remaining % 60;
            countdownEl.textContent = m + 'm ' + s + 's';
        }
        if (remaining <= 0) {
            cancelSleepTimer();
            state.audio.pause();
            showToast('Sleep timer: audio berhenti');
        }
    }, 1000);
    showSleepTimerActive();
    showToast('Timer ' + minutes + ' menit diaktifkan');
}

function cancelSleepTimer() {
    if (state.sleepTimer) { clearInterval(state.sleepTimer); state.sleepTimer = null; }
    state.sleepTimerEnd = null;
    localStorage.removeItem('radio_sleep_end');
    var timerDiv = $('sleepTimerActive');
    if (timerDiv) timerDiv.style.display = 'none';
}

function showSleepTimerActive() {
    var timerDiv = $('sleepTimerActive');
    var optionsDiv = $('sleepTimerOptions');
    var customDiv = document.querySelector('.sleep-timer-custom');
    if (timerDiv) timerDiv.style.display = 'block';
    if (optionsDiv) optionsDiv.style.display = 'none';
    if (customDiv) customDiv.style.display = 'none';
}

function showSleepTimerModal() {
    var modal = $('sleepTimerModal');
    if (!modal) return;

    if (state.sleepTimerEnd) {
        showSleepTimerActive();
    } else {
        var timerDiv = $('sleepTimerActive');
        var optionsDiv = $('sleepTimerOptions');
        var customDiv = document.querySelector('.sleep-timer-custom');
        if (timerDiv) timerDiv.style.display = 'none';
        if (optionsDiv) optionsDiv.style.display = 'flex';
        if (customDiv) customDiv.style.display = 'flex';
    }

    modal.style.display = 'flex';
}

function restoreSleepTimer() {
    var saved = localStorage.getItem('radio_sleep_end');
    if (saved) {
        var endTime = parseInt(saved, 10);
        var remaining = Math.max(0, Math.round((endTime - Date.now()) / 60000));
        if (remaining > 0) {
            startSleepTimer(remaining);
        } else {
            localStorage.removeItem('radio_sleep_end');
        }
    }
}

// ============================================================
//  ALARM
// ============================================================
function loadAlarms() {
    try {
        var data = localStorage.getItem('radio_alarms_v1');
        state.alarms = data ? JSON.parse(data) : [];
    } catch (e) {
        state.alarms = [];
    }
}

function saveAlarms() {
    localStorage.setItem('radio_alarms_v1', JSON.stringify(state.alarms));
}

function renderAlarmList() {
    var list = $('alarmList');
    if (!list) return;
    if (!state.alarms.length) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:8px 0;">Belum ada alarm</p>';
        return;
    }
    var dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    list.innerHTML = state.alarms.map(function(a, i) {
        var days = a.days && a.days.length ? a.days.map(function(d) { return dayNames[d]; }).join(', ') : 'Sekali';
        return '<div class="alarm-item">' +
            '<div class="alarm-item-info">' +
                '<div class="alarm-item-time">' + a.time + '</div>' +
                '<div class="alarm-item-days">' + days + '</div>' +
                '<div class="alarm-item-station">' + escapeHtml(a.stationName || '') + '</div>' +
            '</div>' +
            '<span class="alarm-item-toggle" data-index="' + i + '">' + (a.enabled ? '🔔' : '🔕') + '</span>' +
            '<button class="alarm-item-delete" data-index="' + i + '">✕</button>' +
        '</div>';
    }).join('');
    list.querySelectorAll('.alarm-item-toggle').forEach(function(el) {
        el.addEventListener('click', function() {
            var idx = parseInt(el.dataset.index);
            state.alarms[idx].enabled = !state.alarms[idx].enabled;
            saveAlarms();
            renderAlarmList();
        });
    });
    list.querySelectorAll('.alarm-item-delete').forEach(function(el) {
        el.addEventListener('click', function() {
            state.alarms.splice(parseInt(el.dataset.index), 1);
            saveAlarms();
            renderAlarmList();
        });
    });
}

function populateAlarmStationSelect() {
    var select = $('alarmStationSelect');
    if (!select) return;
    select.innerHTML = '<option value="">— Pilih stasiun —</option>';
    // show favorites and recently played first
    var seen = {};
    function addStation(st, label) {
        var uuid = stationUuid(st);
        if (!uuid || seen[uuid]) return;
        seen[uuid] = true;
        var opt = document.createElement('option');
        opt.value = uuid;
        opt.textContent = (st.name || 'Unknown') + (label ? ' [' + label + ']' : '');
        select.appendChild(opt);
    }
    state.recentlyPlayed.forEach(function(st) { addStation(st, 'Recent'); });
    state.stations.forEach(function(st) { addStation(st); });
}

function showAlarmModal() {
    populateAlarmStationSelect();
    renderAlarmList();
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    $('alarmTimeInput').value = hh + ':' + mm;
    $('alarmModal').style.display = 'flex';
}

function startAlarmChecker() {
    if (state.alarmCheckInterval) return;
    state.alarmCheckInterval = setInterval(function() {
        if (!state.alarms.length) return;
        var now = new Date();
        var timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        var day = now.getDay();
        state.alarms.forEach(function(a) {
            if (!a.enabled) return;
            var lastFired = a.lastFired || '';
            var todayKey = now.toDateString();
            if (lastFired === todayKey) return;
            if (a.time !== timeStr) return;
            if (a.days && a.days.length && a.days.indexOf(day) === -1) return;
            fireAlarm(a);
            a.lastFired = todayKey;
            saveAlarms();
        });
    }, 30000);
}

function fireAlarm(alarm) {
    // try to find station by uuid
    var station = state.stations.find(function(s) { return stationUuid(s) === alarm.stationUuid; });
    if (!station) station = state.recentlyPlayed.find(function(s) { return stationUuid(s) === alarm.stationUuid; });
    if (station) {
        playStationByData(station);
    }
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Radio Alarm', {
            body: 'Waktunya ' + (alarm.stationName || 'radio') + '!',
            icon: 'icons/icon-192.svg'
        });
    }
    showToast('🔔 Alarm: ' + (alarm.stationName || 'Radio') + ' aktif!');
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

    updateToggleFavIcon(uuid);

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

// ============================================================
//  IMPORT / EXPORT PLAYLISTS
// ============================================================
function exportPlaylists() {
    if (!state.playlists.length) {
        showToast('Tidak ada playlist untuk di-export');
        return;
    }
    var data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        playlists: state.playlists.map(function(p) {
            return { id: p.id, name: p.name, stations: p.stations, createdAt: p.createdAt };
        })
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'radiostream-playlists-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Playlist di-export');
}

function importPlaylists(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (!data.version || !Array.isArray(data.playlists)) {
                showToast('Format file tidak valid');
                return;
            }
            // merge or replace? merge by default
            var imported = 0;
            data.playlists.forEach(function(importedPl) {
                // check duplicate by name + station count
                var exists = state.playlists.find(function(ep) { return ep.name === importedPl.name && ep.stations.length === (importedPl.stations || []).length; });
                if (!exists) {
                    state.playlists.push({
                        id: importedPl.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
                        name: importedPl.name,
                        stations: importedPl.stations || [],
                        createdAt: importedPl.createdAt || new Date().toISOString()
                    });
                    imported++;
                }
            });
            if (imported > 0) {
                savePlaylists();
                renderPlaylistSidebar();
                showToast(imported + ' playlist di-import');
                if (state.currentView.startsWith('playlist:')) loadStations(true);
            } else {
                showToast('Tidak ada playlist baru untuk di-import');
            }
        } catch (err) {
            showToast('Gagal membaca file: ' + err.message);
        }
    };
    reader.readAsText(file);
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

    var cardIcons = [ICON.music, ICON.headphone, ICON.radio, ICON.speaker, ICON.vinyl, ICON.mic, ICON.music, ICON.headphone, ICON.radio, ICON.speaker, ICON.vinyl, ICON.mic];
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
        var cardIcon = cardIcons[idx % cardIcons.length];

        var playlistBtns = '';
        if (isPlaylistView) {
            playlistBtns =
                '<button class="pl-move-btn" data-uuid="' + uuid + '" data-dir="-1" aria-label="Naik" title="Naik">' + ICON.chevronUp + '</button>' +
                '<button class="pl-move-btn" data-uuid="' + uuid + '" data-dir="1" aria-label="Turun" title="Turun">' + ICON.chevronDown + '</button>' +
                '<button class="pl-remove-btn" data-uuid="' + uuid + '" aria-label="Hapus dari playlist" title="Hapus">' + ICON.x + '</button>';
        }

        html += '<div class="station-card' + (isActive ? ' active' : '') + '" data-index="' + idx + '" data-uuid="' + uuid + '">' +
            (isPlaylistView ? playlistBtns :
                '<button class="fav-btn' + (isFav ? ' active' : '') + '" data-uuid="' + uuid + '" aria-label="Favorit">' + (isFav ? ICON.heartFill : ICON.heart) + '</button>' +
                '<button class="share-btn" data-uuid="' + uuid + '" aria-label="Share" title="Share stasiun ini">' + ICON.share + '</button>' +
                '<button class="add-playlist-btn" data-uuid="' + uuid + '" aria-label="Tambah ke Playlist" title="Tambah ke Playlist">' + ICON.clipboard + '</button>'
            ) +
            '<div class="card-art">' +
                '<div class="card-art-icon">' + cardIcon + '</div>' +
                '<div class="playing-overlay">' +
                    '<span class="play-icon">' + (isPlaying ? ICON.pause : ICON.play) + '</span>' +
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
    $('npbPlayBtn').innerHTML = state.isPlaying ? ICON.pause : ICON.play;
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
    audio.oncanplay = null;
    audio.pause();
    audio.currentTime = 0;

    clearPlayerError();
    updatePlayerUI(station);
    showPlayerLoading(station);

    audio.src = streamUrl;
    audio.load();

    audio.play().then(function() {
        state.isPlaying = true;
        state.playBtn.innerHTML = ICON.pause;
        clearPlayerError();
        updatePlayerUI(station);
        updatePlayerVisualState(true);
        updateMediaSession(station);
        renderStations(state.stations);
    }).catch(function(err) {
        if (err.name === 'AbortError') return;
        state.isPlaying = false;
        state.playBtn.innerHTML = ICON.play;
        audio.oncanplay = function() {
            audio.oncanplay = null;
            audio.play().then(function() {
                state.isPlaying = true;
                state.playBtn.innerHTML = ICON.pause;
                clearPlayerError();
                updatePlayerUI(station);
                updatePlayerVisualState(true);
                updateMediaSession(station);
                renderStations(state.stations);
            }).catch(function(err2) {
                if (err2.name === 'AbortError') return;
                var msg = getPlayErrorMessage(err2);
                showPlayerError(msg);
                showToast(msg);
                renderStations(state.stations);
            });
        };
    });

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
        state.playBtn.innerHTML = ICON.pause;
        state.playerArt.innerHTML = ICON.radio;

        if (favBtn) {
            var uuid = stationUuid(station);
            var isFav = state.favorites.indexOf(uuid) > -1;
            favBtn.classList.toggle('active', isFav);
            var di = favBtn.querySelector('.di-icon');
            if (di) di.innerHTML = isFav ? ICON.heartFill : ICON.heart;
        }
    } else {
        state.playerStationName.textContent = 'Tidak ada yang diputar';
        state.playerStationDetail.textContent = 'Pilih stasiun untuk mulai mendengarkan';
        state.playBtn.innerHTML = ICON.play;
        state.playerArt.innerHTML = ICON.radio;
        if (favBtn) {
            favBtn.classList.remove('active');
            var di = favBtn.querySelector('.di-icon');
            if (di) di.innerHTML = ICON.heart;
        }
    }
}

function updatePlayerVisualState(isPlaying) {
    var player = $('player');
    var playerArt = $('playerArt');
    if (player) player.classList.toggle('playing', isPlaying);
    if (playerArt) playerArt.classList.toggle('playing', isPlaying);
}

// ============================================================
//  MEDIA SESSION API
// ============================================================
function updateMediaSession(station) {
    if (!('mediaSession' in navigator)) return;
    if (!station) {
        navigator.mediaSession.metadata = null;
        return;
    }
    var artwork = [];
    try {
        var icon192 = document.querySelector('link[rel="icon"][sizes="192x192"]');
        if (icon192) artwork.push({ src: icon192.href, sizes: '192x192', type: 'image/svg+xml' });
    } catch (e) {}
    navigator.mediaSession.metadata = new MediaMetadata({
        title: station.name || 'RadioStream',
        artist: station.country || '',
        album: station.tags || '',
        artwork: artwork
    });
}

function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', function() {
        if (state.playingStationData) {
            state.audio.play().catch(function() {});
        }
    });
    navigator.mediaSession.setActionHandler('pause', function() {
        state.audio.pause();
    });
    navigator.mediaSession.setActionHandler('nexttrack', function() {
        playNext();
    });
    navigator.mediaSession.setActionHandler('previoustrack', function() {
        playPrev();
    });
}

// ============================================================
//  BACKGROUND PLAYBACK
// ============================================================
function setupBackgroundPlayback() {
    // resume playback if audio was interrupted while in background
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && state.playingStationData && !state.isPlaying) {
            if (state.audio.src && state.audio.src !== '') {
                state.audio.play().catch(function() {});
            }
        }
    });

    // keep audio context alive on browsers that suspend it in background
    try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        var ctx = new AudioCtx();
        // connect audio element to the context
        var src = ctx.createMediaElementSource ? ctx.createMediaElementSource(state.audio) : null;
        if (src) src.connect(ctx.destination);
        // resume context if suspended when page becomes visible
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && ctx.state === 'suspended') {
                ctx.resume().catch(function() {});
            }
        });
    } catch (e) {
        // AudioContext not supported or already in use
    }
}

// ============================================================
//  VOLUME
// ============================================================
function setupVolume() {
    var audio = state.audio;
    var slider = state.volumeSlider;
    var muteBtn = state.muteBtn;

    audio.volume = parseFloat(slider.value);
    var prevVolume = parseFloat(slider.value);
    var muted = false;

    slider.addEventListener('input', function() {
        audio.volume = parseFloat(slider.value);
        if (audio.volume > 0) { muted = false; muteBtn.innerHTML = ICON.volume; prevVolume = audio.volume; }
    });

    muteBtn.addEventListener('click', function() {
        muted = !muted;
        if (muted) { prevVolume = audio.volume; audio.volume = 0; slider.value = '0'; muteBtn.innerHTML = ICON.volumeX; }
        else { audio.volume = prevVolume; slider.value = String(prevVolume); muteBtn.innerHTML = ICON.volume; }
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
    var shareUrl = 'https://syamsiridwan2-cpu.github.io/radiostream/?station=' + encodeURIComponent(stationUuid(station));
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
        window.history.replaceState({}, '', window.location.pathname);
        apiFetchStationByUuid(stationId).then(function(st) {
            if (!st) return;
            var banner = $('nowPlayingBanner');
            if (banner) {
                $('npbArt').innerHTML = ICON.radio;
                $('npbName').textContent = st.name || 'Stasiun';
                var lang = Array.isArray(st.language) ? st.language.join(', ') : (st.language || '');
                $('npbDetail').textContent = 'Klik play untuk mendengarkan';
                $('npbEq').style.display = 'none';
                $('npbPlayBtn').innerHTML = ICON.play;
                banner.classList.add('visible');
            }
            state.playingStationData = st;
            state.playingStationId = stationUuid(st);
            state.stations = [st];
            state.currentIndex = 0;
            showToast('Klik \u25B6 untuk memutar ' + (st.name || 'stasiun'));
        });
    }
}

// ============================================================
//  INIT
// ============================================================
function init() {
    initDomReferences();
    setStaticIcons();
    loadTheme();
    loadFavorites();
    loadRecentlyPlayed();
    loadPlaylists();
    loadAlarms();
    renderPlaylistSidebar();
    renderRecentlyPlayedBadge();
    setupVolume();
    setupMediaSession();
    setupBackgroundPlayback();
    restoreSleepTimer();
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

    $('exportPlaylistsBtn').addEventListener('click', exportPlaylists);
    $('importPlaylistsBtn').addEventListener('click', function() { $('importFileInput').click(); });
    $('importFileInput').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) importPlaylists(e.target.files[0]);
        e.target.value = '';
    });

    $('alarmBtn').addEventListener('click', showAlarmModal);
    $('alarmModalClose').addEventListener('click', function() { $('alarmModal').style.display = 'none'; });
    $('alarmModal').addEventListener('click', function(e) { if (e.target === $('alarmModal')) $('alarmModal').style.display = 'none'; });
    $('alarmSaveBtn').addEventListener('click', function() {
        var time = $('alarmTimeInput').value;
        var stationSelect = $('alarmStationSelect');
        var stationUuid = stationSelect.value;
        var stationName = stationSelect.options[stationSelect.selectedIndex] ? stationSelect.options[stationSelect.selectedIndex].textContent : '';
        if (!time) { showToast('Pilih waktu alarm'); return; }
        var days = [];
        $('alarmModal').querySelectorAll('.alarm-days input:checked').forEach(function(cb) {
            days.push(parseInt(cb.dataset.day));
        });
        state.alarms.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            time: time,
            days: days,
            stationUuid: stationUuid,
            stationName: stationName,
            enabled: true,
            lastFired: ''
        });
        saveAlarms();
        renderAlarmList();
        populateAlarmStationSelect();
        showToast('Alarm disimpan');
    });
    startAlarmChecker();
    // request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(function() {});
    }

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

    state.searchType.addEventListener('change', function() {
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
        $('playerMoreDropdown').classList.remove('open');
        if (state.playingStationId) handleToggleFavorite(state.playingStationId);
        else showToast('Pilih stasiun terlebih dahulu');
    });

    $('shareStationBtn').addEventListener('click', function() {
        $('playerMoreDropdown').classList.remove('open');
        if (state.playingStationData) shareStation(state.playingStationData);
        else showToast('Pilih stasiun terlebih dahulu');
    });

    $('sleepTimerBtn').addEventListener('click', function() {
        $('playerMoreDropdown').classList.remove('open');
        showSleepTimerModal();
    });

    $('sleepTimerClose').addEventListener('click', function() {
        $('sleepTimerModal').style.display = 'none';
    });
    $('sleepTimerModal').addEventListener('click', function(e) {
        if (e.target === $('sleepTimerModal')) $('sleepTimerModal').style.display = 'none';
    });

    document.querySelectorAll('.sleep-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var minutes = parseInt(btn.dataset.minutes, 10);
            startSleepTimer(minutes);
            $('sleepTimerModal').style.display = 'none';
        });
    });

    $('sleepTimerCustomBtn').addEventListener('click', function() {
        var input = $('sleepTimerCustom');
        var val = parseInt(input.value, 10);
        if (val > 0) { startSleepTimer(val); $('sleepTimerModal').style.display = 'none'; }
    });
    $('sleepTimerCustom').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); $('sleepTimerCustomBtn').click(); }
    });

    $('sleepTimerCancelBtn').addEventListener('click', function() {
        cancelSleepTimer();
        showToast('Timer dibatalkan');
        $('sleepTimerModal').style.display = 'none';
    });

    $('playerMoreBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        $('playerMoreDropdown').classList.toggle('open');
    });

    state.themeToggle.addEventListener('click', toggleTheme);

    document.addEventListener('click', function(e) {
        if (!state.searchInput.contains(e.target) && !state.suggestions.contains(e.target)) {
            state.suggestions.classList.remove('active');
        }
        var moreWrap = document.querySelector('.player-more-wrap');
        if (moreWrap && !moreWrap.contains(e.target)) {
            var dd = $('playerMoreDropdown');
            if (dd) dd.classList.remove('open');
        }
    });

    state.audio.addEventListener('play', function() {
        state.isPlaying = true;
        state.playBtn.innerHTML = ICON.pause;
        updatePlayerVisualState(true);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
        renderStations(state.stations);
    });

    state.audio.addEventListener('pause', function() {
        state.isPlaying = false;
        state.playBtn.innerHTML = ICON.play;
        updatePlayerVisualState(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        renderStations(state.stations);
    });

    state.audio.addEventListener('ended', function() {
        state.isPlaying = false;
        state.playBtn.innerHTML = ICON.play;
        updatePlayerVisualState(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
        renderStations(state.stations);
    });

    state.audio.addEventListener('error', function() {
        if (!state.playingStationId) return;
        var msg = 'Gagal memutar stream. Coba stasiun lain.';
        showPlayerError(msg);
        state.isPlaying = false;
        state.playBtn.innerHTML = ICON.play;
        updatePlayerVisualState(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
        showToast(msg);
        renderStations(state.stations);
    });

    // Now Playing Banner play/pause button
    var npbPlayBtn = $('npbPlayBtn');
    if (npbPlayBtn) {
        npbPlayBtn.addEventListener('click', function() {
            if (state.playingStationData && state.audio.src && !state.isPlaying) {
                state.audio.play().catch(function() {});
            } else if (state.playingStationData && (!state.audio.src || state.audio.src === '')) {
                playStationByData(state.playingStationData);
            } else {
                togglePlay();
            }
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
