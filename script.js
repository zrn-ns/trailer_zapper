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
    youtubePlayer: null,
    youtubeApiPromise: null,
    currentPage: 1,
    totalPages: 1,
    isFetchingMovies: false,
    processedMovies: new Set(),
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
    nextButton.disabled = state.currentMovieIndex >= state.movies.length - 1 && state.currentPage >= state.totalPages;
}

function destroyYoutubePlayer() {
    if (state.youtubePlayer) {
        state.youtubePlayer.destroy();
        state.youtubePlayer = null;
    }
}

function loadYoutubeApiScript() {
    if (window.YT && typeof window.YT.Player === 'function') {
        return Promise.resolve();
    }

    if (!state.youtubeApiPromise) {
        state.youtubeApiPromise = new Promise((resolve, reject) => {
            const scriptTag = document.createElement('script');
            scriptTag.src = 'https://www.youtube.com/iframe_api';
            scriptTag.async = true;
            scriptTag.onerror = () => reject(new Error('YouTube IFrame APIの読み込みに失敗しました。'));
            document.head.appendChild(scriptTag);

            const previousCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof previousCallback === 'function') {
                    previousCallback();
                }
                resolve();
            };
        });
    }

    return state.youtubeApiPromise;
}

async function displayTrailer(youtubeKey) {
    try {
        await loadYoutubeApiScript();
    } catch (error) {
        console.error(error);
        showLoadingMessage('予告編プレーヤーの初期化に失敗しました。');
        playNext();
        return false;
    }

    let playerHost = document.getElementById('youtube-player');
    if (!playerHost) {
        playerContainer.innerHTML = '';
        playerHost = document.createElement('div');
        playerHost.id = 'youtube-player';
        playerContainer.appendChild(playerHost);
    }

    if (!state.youtubePlayer) {
        state.youtubePlayer = new YT.Player(playerHost, {
            height: '480',
            width: '854',
            videoId: youtubeKey,
            playerVars: {
                autoplay: 1,
                mute: 1,
                rel: 0,
            },
            events: {
                onReady: (event) => {
                    event.target.mute();
                    event.target.playVideo();
                },
                onError: handleYoutubeError,
                onStateChange: handleYoutubeStateChange,
            },
        });
    } else {
        state.youtubePlayer.loadVideoById({
            videoId: youtubeKey,
        });
        state.youtubePlayer.playVideo();
    }

    return true;
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
    destroyYoutubePlayer();
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

function handleYoutubeError(event) {
    console.warn('YouTubeプレーヤーエラーが発生しました。コード:', event.data);
    playNext();
}

function handleYoutubeStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

function persistProcessedMovies() {
    localStorage.setItem('processedMovies', JSON.stringify(Array.from(state.processedMovies)));
}

function markCurrentMovieProcessed() {
    const movie = state.movies[state.currentMovieIndex];
    if (!movie) return;

    if (!state.processedMovies.has(movie.id)) {
        state.processedMovies.add(movie.id);
        persistProcessedMovies();
    }

    state.movies.splice(state.currentMovieIndex, 1);
}

async function loadAndDisplayTrailer(index) {
    if (index < 0) {
        console.log('リストの先頭です。');
        updateButtonStates();
        return;
    }

    if (index >= state.movies.length) {
        // 現在のリストの終わりに達し、まだ次のページがある場合
        if (state.currentPage < state.totalPages && !state.isFetchingMovies) {
            console.log('現在のリストの終わりに達しました。次のページをロードします...');
            state.currentPage++;
            await updateAndFetchMovies(false); // 次のページをロードし、既存のリストに追加
            // 新しい映画が追加されたので、再度同じインデックスで試す
            if (state.movies.length > index) {
                loadAndDisplayTrailer(index);
            } else {
                showLoadingMessage('再生可能な予告編がこれ以上見つかりませんでした。');
            }
            return;
        } else {
            // すべてのページを試したか、現在フェッチ中の場合
            console.log('すべての映画の予告編を試しましたが、これ以上見つかりませんでした。');
            showLoadingMessage('再生可能な予告編がこれ以上見つかりませんでした。');
            updateButtonStates();
            return;
        }
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
            const started = await displayTrailer(videoToPlay.key);
            if (started) {
                displayMovieInfo(movie);
            }
            return;
        }
    }

    console.log(`'${movie.title}' に再生可能な予告編が見つかりませんでした。次の映画を試します。`);
    const nextIndex = state.currentMovieIndex;
    markCurrentMovieProcessed();
    loadAndDisplayTrailer(nextIndex);
}

async function updateAndFetchMovies(resetPage = true) {
    if (state.isFetchingMovies) return;
    state.isFetchingMovies = true;

    try {
        if (resetPage) {
            markCurrentMovieProcessed();
            state.currentPage = 1;
            state.totalPages = 1;
            state.movies = [];
            state.currentMovieIndex = 0;
        }

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

        let pageToFetch = state.currentPage;
        const targetIndex = resetPage
            ? 0
            : Math.max(Math.min(state.currentMovieIndex, state.movies.length), 0);
        const existingMovies = resetPage ? [] : [...state.movies];

        while (true) {
            state.currentPage = pageToFetch;

            const apiParams = {
                with_watch_providers: selectedProviders.join('|'),
                watch_region: REGION,
                sort_by: 'popularity.desc',
                page: pageToFetch,
            };

            if (state.excludedGenres.size > 0) {
                apiParams.without_genres = Array.from(state.excludedGenres).join(',');
            }

            const movieData = await fetchFromTMDB('/discover/movie', apiParams);

            if (!movieData || !movieData.results) {
                state.movies = resetPage ? [] : existingMovies;
                showLoadingMessage('選択されたサービスで視聴可能な映画が見つかりませんでした。');
                updateButtonStates();
                return;
            }

            state.totalPages = movieData.total_pages || pageToFetch;

            const newMovies = movieData.results.filter(movie => {
                const movieId = movie.id;
                return !state.ignoredMovies.has(movieId) && !state.processedMovies.has(movieId);
            });

            if (newMovies.length > 0) {
                if (resetPage) {
                    state.movies = newMovies;
                } else {
                    state.movies = [...existingMovies, ...newMovies];
                }
                state.currentPage = pageToFetch;
                loadAndDisplayTrailer(targetIndex);
                return;
            }

            if (pageToFetch >= state.totalPages) {
                state.movies = resetPage ? [] : existingMovies;
                showLoadingMessage('視聴可能な映画はすべて「興味なし」または除外ジャンルに設定されています。');
                updateButtonStates();
                return;
            }

            pageToFetch += 1;
        }
    } finally {
        state.isFetchingMovies = false;
    }
}

function playNext() {
    const nextIndex = state.currentMovieIndex;
    markCurrentMovieProcessed();
    loadAndDisplayTrailer(nextIndex);
}

function playPrev() {
    const targetIndex = Math.max(state.currentMovieIndex - 1, 0);
    markCurrentMovieProcessed();
    loadAndDisplayTrailer(targetIndex);
}

function handleIgnoreClick() {
    const movieToIgnore = state.movies[state.currentMovieIndex];
    if (!movieToIgnore) return;

    console.log(`'${movieToIgnore.title}' を興味なしリストに追加しました。`);
    state.ignoredMovies.add(movieToIgnore.id);
    localStorage.setItem('ignoredMovies', JSON.stringify(Array.from(state.ignoredMovies)));

    state.movies.splice(state.currentMovieIndex, 1);
    loadAndDisplayTrailer(state.currentMovieIndex);
}

// --- 初期化処理 ---

async function initializeApp() {
    console.log('アプリケーションを初期化します...');
    // イベントリスナー
    nextButton.addEventListener('click', playNext);
    prevButton.addEventListener('click', playPrev);
    netflixFilter.addEventListener('change', () => updateAndFetchMovies(true));
    primeVideoFilter.addEventListener('change', () => updateAndFetchMovies(true));
    
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
        updateAndFetchMovies(true);
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
                updateAndFetchMovies(true);
            }
        }
    });

    // localStorageから設定を読み込み
    const savedProviders = JSON.parse(localStorage.getItem('selectedProviders')) || [];
    if (savedProviders.includes(PROVIDER_IDS.NETFLIX)) netflixFilter.checked = true;
    if (savedProviders.includes(PROVIDER_IDS.PRIME_VIDEO)) primeVideoFilter.checked = true;

    const savedIgnored = JSON.parse(localStorage.getItem('ignoredMovies')) || [];
    state.ignoredMovies = new Set(savedIgnored);

    const savedProcessed = JSON.parse(localStorage.getItem('processedMovies')) || [];
    state.processedMovies = new Set(savedProcessed);

    const savedExcludedGenres = JSON.parse(localStorage.getItem('excludedGenres')) || []; // キーを戻す
    state.excludedGenres = new Set(savedExcludedGenres);

    // ジャンルリストを取得してからアプリのメインロジックを開始
    const genreData = await fetchFromTMDB('/genre/movie/list');
    if (genreData && genreData.genres) {
        state.genres = genreData.genres;
        populateGenreFilterUI();
    }

    updateAndFetchMovies(true);
}

initializeApp();
