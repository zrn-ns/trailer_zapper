console.log('Trailer Zapperのスクリプトが読み込まれました。');

// --- フェーズ1: タスク2 - TMDB APIラッパーの作成 ---

//【注意】
// 本来、APIキーはサーバーサイドで管理するのが最も安全です。
// このプロトタイプでは、クライアントサイド（ブラウザ）で完結させるため、
// JavaScript内に直接記述します。
const TMDB_API_KEY = 'd6f89a671e8fecb1f7cd6a6d32c66ff1';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REGION = 'JP';

// --- 定数定義 ---
const PROVIDER_IDS = {
    NETFLIX: '8',
    PRIME_VIDEO: '9',
};

/**
 * TMDB APIからデータを非同期で取得するためのラッパー関数
 * @param {string} endpoint - APIのエンドポイント (例: '/movie/popular')
 * @param {Object} [params={}] - クエリパラメータのオブジェクト (例: { page: 1 })
 * @returns {Promise<Object>} - 取得したデータのJSONオブジェクト
 */
async function fetchFromTMDB(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: 'ja-JP', // 結果を日本語で取得
        ...params
    });

    const url = `${API_BASE_URL}${endpoint}?${queryParams}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            const errorData = await response.json();
            console.error('Error Details:', errorData);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        return null;
    }
}

// --- グローバル変数と状態管理 ---
const state = {
    movies: [],
    currentMovieIndex: 0,
    selectedProviders: [],
    ignoredMovies: new Set(),
    genres: [],
    excludedGenres: new Set(), // `selectedGenres` から `excludedGenres` に戻す
};

// --- DOM要素 ---
const appContainer = document.getElementById('app');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const netflixFilter = document.getElementById('netflix-filter');
const primeVideoFilter = document.getElementById('prime-video-filter');
const playerContainer = document.getElementById('player-container');
const movieInfoContainer = document.getElementById('movie-info');
const genreFilterToggle = document.getElementById('genre-filter-toggle');
const genreFilterList = document.getElementById('genre-filter-list');

// --- UI更新関数 ---

function updateButtonStates() {
    prevButton.disabled = state.currentMovieIndex <= 0;
    nextButton.disabled = state.currentMovieIndex >= state.movies.length - 1;
}

function displayTrailer(youtubeKey) {
    playerContainer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&mute=1&rel=0`;
    iframe.width = '854';
    iframe.height = '480';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    playerContainer.appendChild(iframe);
}

function displayMovieInfo(movie) {
    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300.png?text=No+Image';
    const movieGenres = movie.genre_ids.map(id => {
        const genre = state.genres.find(g => g.id === id);
        return genre ? `<span class="genre-tag" data-genre-id="${id}">${genre.name}</span>` : '';
    }).join('');

    movieInfoContainer.innerHTML = `
        <img src="${posterPath}" alt="${movie.title} のポスター">
        <div class="movie-details">
            <h2>${movie.title}</h2>
            <div class="genres">${movieGenres}</div>
            <p>${movie.overview || 'あらすじはありません。'}</p>
            <button id="ignore-button" class="button">興味なし</button>
        </div>
    `;
}

function showLoadingMessage(message) {
    playerContainer.innerHTML = `<p>${message}</p>`;
    movieInfoContainer.innerHTML = '';
}

function populateGenreFilterUI() {
    genreFilterList.innerHTML = '<p class="filter-explanation">チェックを入れたジャンルは表示されません。</p>'; // 説明文を動的に追加
    state.genres.forEach(genre => {
        const isChecked = state.excludedGenres.has(genre.id);
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${genre.id}" ${isChecked ? 'checked' : ''}> ${genre.name}`;
        genreFilterList.appendChild(label);
    });
}

// --- コアロジック ---

async function loadAndDisplayTrailer(index) {
    if (index < 0 || index >= state.movies.length) {
        console.log('リストの範囲外です。');
        updateButtonStates();
        return;
    }

    state.currentMovieIndex = index;
    updateButtonStates();
    const movie = state.movies[state.currentMovieIndex];
    console.log(`'${movie.title}' の予告編を検索中...`);

    const videosData = await fetchFromTMDB(`/movie/${movie.id}/videos`);

    if (videosData && videosData.results) {
        const trailer = videosData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        const teaser = videosData.results.find(video => video.type === 'Teaser' && video.site === 'YouTube');
        const anyVideo = videosData.results.find(video => video.site === 'YouTube');
        const videoToPlay = trailer || teaser || anyVideo;

        if (videoToPlay) {
            console.log(`再生する予告編: ${movie.title}`);
            displayTrailer(videoToPlay.key);
            displayMovieInfo(movie);
            return;
        }
    }

    console.log(`'${movie.title}' に再生可能な予告編が見つかりませんでした。次の映画を試します。`);
    if (state.currentMovieIndex + 1 < state.movies.length) {
        loadAndDisplayTrailer(index + 1);
    } else {
        showLoadingMessage('再生可能な予告編がこれ以上見つかりませんでした。');
    }
}

async function updateAndFetchMovies() {
    const selectedProviders = [];
    if (netflixFilter.checked) selectedProviders.push(PROVIDER_IDS.NETFLIX);
    if (primeVideoFilter.checked) selectedProviders.push(PROVIDER_IDS.PRIME_VIDEO);

    localStorage.setItem('selectedProviders', JSON.stringify(selectedProviders));
    state.selectedProviders = selectedProviders;

    if (selectedProviders.length === 0) {
        state.movies = [];
        showLoadingMessage('視聴したい配信サービスを選択してください。');
        updateButtonStates();
        return;
    }

    showLoadingMessage('映画情報を取得中...');

    const apiParams = {
        with_watch_providers: selectedProviders.join('|'),
        watch_region: REGION,
        sort_by: 'popularity.desc',
    };

    // ロジックを元に戻す: excludedGenres に何かあれば `without_genres` を使う
    if (state.excludedGenres.size > 0) {
        apiParams.without_genres = Array.from(state.excludedGenres).join(','); // 除外はカンマ区切り
    }

    const movieData = await fetchFromTMDB('/discover/movie', apiParams);

    if (movieData && movieData.results && movieData.results.length > 0) {
        state.movies = movieData.results.filter(movie => !state.ignoredMovies.has(movie.id));
        if (state.movies.length > 0) {
            loadAndDisplayTrailer(0);
        } else {
            showLoadingMessage('視聴可能な映画はすべて「興味なし」または除外ジャンルに設定されています。');
            updateButtonStates();
        }
    } else {
        state.movies = [];
        showLoadingMessage('選択されたサービスで視聴可能な映画が見つかりませんでした。');
        updateButtonStates();
    }
}

function playNext() {
    loadAndDisplayTrailer(state.currentMovieIndex + 1);
}

function playPrev() {
    loadAndDisplayTrailer(state.currentMovieIndex - 1);
}

function handleIgnoreClick() {
    const movieToIgnore = state.movies[state.currentMovieIndex];
    if (!movieToIgnore) return;

    console.log(`'${movieToIgnore.title}' を興味なしリストに追加しました。`);
    state.ignoredMovies.add(movieToIgnore.id);
    localStorage.setItem('ignoredMovies', JSON.stringify(Array.from(state.ignoredMovies)));

    state.movies.splice(state.currentMovieIndex, 1);
    if (state.currentMovieIndex >= state.movies.length) {
        loadAndDisplayTrailer(state.currentMovieIndex - 1);
    } else {
        loadAndDisplayTrailer(state.currentMovieIndex);
    }
}

// --- 初期化処理 ---

async function initializeApp() {
    console.log('アプリケーションを初期化します...');
    // イベントリスナー
    nextButton.addEventListener('click', playNext);
    prevButton.addEventListener('click', playPrev);
    netflixFilter.addEventListener('change', updateAndFetchMovies);
    primeVideoFilter.addEventListener('change', updateAndFetchMovies);
    
    genreFilterToggle.addEventListener('click', () => {
        genreFilterList.classList.toggle('hidden');
    });

    genreFilterList.addEventListener('change', (event) => {
        const genreId = parseInt(event.target.value);
        if (event.target.checked) {
            state.excludedGenres.add(genreId);
        } else {
            state.excludedGenres.delete(genreId);
        }
        localStorage.setItem('excludedGenres', JSON.stringify(Array.from(state.excludedGenres)));
        updateAndFetchMovies();
    });

    movieInfoContainer.addEventListener('click', (event) => {
        if (event.target.id === 'ignore-button') {
            handleIgnoreClick();
        } else if (event.target.classList.contains('genre-tag')) {
            const genreId = parseInt(event.target.dataset.genreId);
            // 動的タグクリックで除外リストに追加
            if (!state.excludedGenres.has(genreId)) {
                state.excludedGenres.add(genreId);
                localStorage.setItem('excludedGenres', JSON.stringify(Array.from(state.excludedGenres)));
                populateGenreFilterUI(); // チェックボックスのUIを更新
                updateAndFetchMovies();
            }
        }
    });

    // localStorageから設定を読み込み
    const savedProviders = JSON.parse(localStorage.getItem('selectedProviders')) || [];
    if (savedProviders.includes(PROVIDER_IDS.NETFLIX)) netflixFilter.checked = true;
    if (savedProviders.includes(PROVIDER_IDS.PRIME_VIDEO)) primeVideoFilter.checked = true;

    const savedIgnored = JSON.parse(localStorage.getItem('ignoredMovies')) || [];
    state.ignoredMovies = new Set(savedIgnored);

    const savedExcludedGenres = JSON.parse(localStorage.getItem('excludedGenres')) || []; // キーを戻す
    state.excludedGenres = new Set(savedExcludedGenres);

    // ジャンルリストを取得してからアプリのメインロジックを開始
    const genreData = await fetchFromTMDB('/genre/movie/list');
    if (genreData && genreData.genres) {
        state.genres = genreData.genres;
        populateGenreFilterUI();
    }

    updateAndFetchMovies();
}

initializeApp();