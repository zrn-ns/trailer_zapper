console.log('Trailer Zapperのスクリプトが読み込まれました。');

// --- iOS Safariでのピンチズーム無効化 ---
// iOS 10以降ではviewportのuser-scalable=noが無視されるため、JavaScriptで対応
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});

// マルチタッチによるズームを防ぐ
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// --- API設定 ---
// APIキーはプロキシサーバー経由で安全に管理されます
// ローカル開発環境ではプロキシサーバー（ポート3000）を使用
// 本番環境では相対パスを使用
const isLocalDevelopment = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.');
const API_BASE_URL = isLocalDevelopment
  ? `http://${window.location.hostname}:3000/api/tmdb`
  : '/api/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const REGION = 'JP';

// --- 定数定義 ---
const PROVIDER_IDS = {
    NETFLIX: '8',
    PRIME_VIDEO: '9',
    HULU: '15',
    U_NEXT: '84',
    DISNEY_PLUS: '337',
    APPLE_TV_PLUS: '350',
};

/**
 * TMDB APIからデータを非同期で取得するためのラッパー関数
 * プロキシサーバー経由でリクエストを送信し、APIキーはサーバー側で管理されます
 * @param {string} endpoint - APIのエンドポイント (例: '/movie/popular')
 * @param {Object} [params={}] - クエリパラメータのオブジェクト (例: { page: 1 })
 * @returns {Promise<Object>} - 取得したデータのJSONオブジェクト
 */
async function fetchFromTMDB(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
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

// --- 定数 ---
const MAX_PROCESSED_MOVIES = 2500; // 再生済み作品の最大保持件数

// --- グローバル変数と状態管理 ---
const state = {
    movies: [],
    history: [],
    currentMovieIndex: 0,
    selectedProviders: [],
    genres: [],
    selectedGenres: new Set(),
    youtubePlayer: null,
    youtubeApiPromise: null,
    currentPage: 1,
    totalPages: 1,
    isFetchingMovies: false,
    processedMovies: new Set(), // 高速検索用（映画IDのみ）
    processedMoviesHistory: [], // タイムスタンプ付き履歴 [{id: number, timestamp: number}, ...]
    isPaused: false,
    isSoundEnabled: false,
    hasStarted: false,
    sortOrder: 'popularity.desc',
    lastAutoSkipTime: null,
    isRetrying: false,
    isIOSSafari: false, // iOS Safari検出フラグ
    iosUserWantsSound: false, // iOS Safariでユーザーが音声をリクエストしたかどうか
};

// --- Pending State（遅延フィルター適用用）---
// フィルター条件の一時的な状態を保持し、「適用」ボタンで確定する
const pendingState = {
    providers: [], // 選択中の配信サービスID（一時）
    sortOrder: 'popularity.desc', // 選択中のソート順（一時）
    genres: new Set(), // 選択中のジャンルID（一時）
};

// --- DOM要素 ---
const appContainer = document.getElementById('app');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const netflixFilter = document.getElementById('netflix-filter');
const primeVideoFilter = document.getElementById('prime-video-filter');
const huluFilter = document.getElementById('hulu-filter');
const uNextFilter = document.getElementById('u-next-filter');
const disneyPlusFilter = document.getElementById('disney-plus-filter');
const appleTvPlusFilter = document.getElementById('apple-tv-plus-filter');
const applyFiltersButton = document.getElementById('apply-filters-button');
const resetFiltersButton = document.getElementById('reset-filters-button');
const sortOrderSelect = document.getElementById('sort-order');
const playerContainer = document.getElementById('player-container');
const playerOverlay = document.getElementById('player-overlay');
const movieInfoContainer = document.getElementById('movie-info');
const genreFilterToggle = document.getElementById('genre-filter-toggle');
const genreFilterModal = document.getElementById('genre-filter-modal');
const genreFilterList = document.getElementById('genre-filter-list');
const genreFilterClose = document.getElementById('genre-filter-close');
const aboutButton = document.getElementById('about-button');
const aboutModal = document.getElementById('about-modal');
const aboutModalClose = document.getElementById('about-modal-close');
const uiLayer = document.querySelector('.ui-layer');
const pauseButton = document.getElementById('pause-button');
const immersiveStage = document.getElementById('immersive-stage');
const fullscreenButton = document.getElementById('fullscreen-button');
const uiToggleButton = document.getElementById('ui-toggle-button');
const playerShell = document.querySelector('.player-shell');
const startModal = document.getElementById('start-modal');
const startButton = document.getElementById('start-button');
const fullscreenStartButton = document.getElementById('fullscreen-start-button');
const dimmingOverlay = document.getElementById('dimming-overlay');
const theaterScreen = document.getElementById('theater-screen');
const iosUnmuteButton = document.getElementById('ios-unmute-button');

// --- ブザー音の設定 ---
const buzzerAudio = new Audio('/assets/sounds/opening_buzzer.mp3');
buzzerAudio.preload = 'auto';
buzzerAudio.volume = 0.4; // 音量を40%に設定（0.0-1.0の範囲）
buzzerAudio.addEventListener('error', (e) => {
    console.warn('ブザー音の読み込みに失敗しました:', e);
});
// プリロードを開始
buzzerAudio.load();

// --- iOS Safari検出 ---
/**
 * フィルター条件に未適用の変更があるかチェックする
 * @returns {boolean} 未適用の変更がある場合true
 */
function hasPendingChanges() {
    // プロバイダーの比較
    const currentProviders = state.selectedProviders.slice().sort().join(',');
    const pendingProviders = pendingState.providers.slice().sort().join(',');
    if (currentProviders !== pendingProviders) return true;

    // ソート順の比較
    if (state.sortOrder !== pendingState.sortOrder) return true;

    // ジャンルの比較
    if (state.selectedGenres.size !== pendingState.genres.size) return true;
    for (const genreId of state.selectedGenres) {
        if (!pendingState.genres.has(genreId)) return true;
    }
    for (const genreId of pendingState.genres) {
        if (!state.selectedGenres.has(genreId)) return true;
    }

    return false;
}

/**
 * 適用/リセットボタンの有効/無効状態を更新する
 */
function updateFilterButtonStates() {
    const hasChanges = hasPendingChanges();

    if (applyFiltersButton) {
        applyFiltersButton.disabled = !hasChanges;
        if (hasChanges) {
            applyFiltersButton.classList.add('has-pending-changes');
        } else {
            applyFiltersButton.classList.remove('has-pending-changes');
        }
    }

    if (resetFiltersButton) {
        resetFiltersButton.disabled = !hasChanges;
    }
}

/**
 * iOS Safariを検出する関数
 * iOS Safariでは、ミュートされていない動画の自動再生が許可されないため、
 * 検出して特別な処理を行う必要があります。
 * @returns {boolean} iOS Safariの場合true
 */
function detectIOSSafari() {
    const ua = navigator.userAgent;
    // iPhone、iPad、iPod + Safari、かつChromeやFirefoxではない
    return /iPhone|iPad|iPod/.test(ua) &&
           /Safari/.test(ua) &&
           !/CriOS|FxiOS/.test(ua);
}

// アプリ起動時にiOS Safariを検出
state.isIOSSafari = detectIOSSafari();
if (state.isIOSSafari) {
    console.log('iOS Safari検出: ミュートで自動再生します（フローティングボタンで音声ON可能）');
    // iOS Safariの場合、デフォルトはミュート（自動再生ポリシーの制約により）
    state.iosUserWantsSound = false;
}

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
        showLoadingMessage('予告映像プレーヤーの初期化に失敗しました。');
        playNext();
        return false;
    }

    // iOS Safariの場合、既存のプレーヤーがあれば使い回す
    if (state.isIOSSafari && state.youtubePlayer && typeof state.youtubePlayer.loadVideoById === 'function') {
        console.log('iOS Safari: 既存プレーヤーで動画を切り替え');
        // オーバーレイを表示（YouTube UIを隠す）
        if (playerOverlay) {
            playerOverlay.classList.remove('hidden');
        }

        // ユーザーが音声ONにしていた場合は音声ONで再生
        if (state.iosUserWantsSound) {
            state.youtubePlayer.unMute();
        } else {
            state.youtubePlayer.mute();
        }

        state.youtubePlayer.loadVideoById(youtubeKey);
        state.isPaused = false;
        updatePauseButton();
        return true;
    }

    destroyYoutubePlayer(); // プレーヤーを破棄して再生成する

    // オーバーレイを表示（YouTube UIを隠す）
    if (playerOverlay) {
        playerOverlay.classList.remove('hidden');
    }

    playerContainer.innerHTML = ''; // コンテナをクリア
    const playerHost = document.createElement('div');
    playerHost.id = 'youtube-player';
    playerContainer.appendChild(playerHost);

    state.youtubePlayer = new YT.Player(playerHost, {
        height: '480',
        width: '854',
        videoId: youtubeKey,
        playerVars: {
            autoplay: 1,
            rel: 0,
            controls: 0,
            modestbranding: 1,
            mute: 1, // 常にミュートで開始
            iv_load_policy: 3, // アノテーションを非表示
            disablekb: 1, // キーボード操作を無効化
            playsinline: 1, // モバイルでインライン再生
            fs: 0, // フルスクリーンボタンを非表示
        },
        events: {
            onReady: (event) => {
                if (state.isIOSSafari) {
                    // iOS Safariでは常にミュートで再生開始
                    console.log('iOS Safari: ミュートで再生開始');
                    event.target.mute();
                    event.target.playVideo();
                    // フローティングボタンを音声ONモードで表示
                    if (iosUnmuteButton) {
                        iosUnmuteButton.dataset.mode = 'unmute';
                        const icon = iosUnmuteButton.querySelector('.unmute-icon');
                        const text = iosUnmuteButton.querySelector('.unmute-text');
                        if (icon) icon.textContent = '🔇';
                        if (text) text.textContent = 'タップして音声ON';
                        iosUnmuteButton.style.display = 'flex';
                    }
                } else {
                    // 非iOS Safariでは通常通り音声設定を適用
                    applySoundPreference();
                    event.target.playVideo();
                }
            },
            onError: handleYoutubeError,
            onStateChange: handleYoutubeStateChange,
        },
    });

    state.isPaused = false;
    updatePauseButton();
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
            <div class="info-actions">
                <button id="open-service-button" class="ghost-button">配信サービスで開く</button>
            </div>
        </div>
    `;
    // UIが既に表示されている場合のみ再表示（自動非表示後は再表示しない）
    if (isUIVisible) {
        showUI();
    }
}

function showLoadingMessage(message) {
    destroyYoutubePlayer();
    // オーバーレイのスピナーで代用するため、メッセージは非表示
    playerContainer.innerHTML = '';
    movieInfoContainer.innerHTML = '';

    // オーバーレイを表示
    if (playerOverlay) {
        playerOverlay.classList.remove('hidden');
    }

    if (pauseButton) {
        state.isPaused = true;
        updatePauseButton();
    }
}

function applySoundPreference() {
    if (!state.youtubePlayer || typeof state.youtubePlayer.isMuted !== 'function') {
        return;
    }
    // iOS Safariでユーザーが音声をリクエストした場合
    if (state.isIOSSafari && state.iosUserWantsSound) {
        state.youtubePlayer.unMute();
        state.youtubePlayer.setVolume(100);
        return;
    }
    // iOS Safariでは自動再生のために常にミュートを維持
    if (state.isIOSSafari) {
        state.youtubePlayer.mute();
        return;
    }
    // 非iOS Safariでは通常通り音声設定を適用
    if (state.isSoundEnabled) {
        state.youtubePlayer.unMute();
        state.youtubePlayer.setVolume(100);
    } else {
        state.youtubePlayer.mute();
    }
}

function setSoundEnabled(enabled) {
    state.isSoundEnabled = enabled;
    applySoundPreference();
}

function populateGenreFilterUI() {
    genreFilterList.innerHTML = '<p class="filter-explanation">チェックを入れたジャンルのみ表示されます。</p>'; // 説明文を動的に追加
    state.genres.forEach(genre => {
        const isChecked = state.selectedGenres.has(genre.id);
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${genre.id}" ${isChecked ? 'checked' : ''}> ${genre.name}`;
        genreFilterList.appendChild(label);
    });
}

// --- コアロジック ---

function handleYoutubeError(event) {
    const errorCode = event.data;
    const currentTime = Date.now();
    const movie = state.movies[state.currentMovieIndex];
    const videoId = movie?.videos?.results?.[0]?.key || 'unknown';

    // エラーの種類を判別
    const isFatalError = [100, 101, 150].includes(errorCode);
    const isTemporaryError = [2, 5].includes(errorCode);
    const errorType = isFatalError ? '致命的' : isTemporaryError ? '一時的' : '不明';

    // エラーコードの詳細メッセージ
    const errorMessages = {
        2: 'リクエストに無効なパラメータが含まれています',
        5: 'HTMLエラー',
        100: '動画が見つかりませんでした',
        101: '動画の所有者が埋め込み再生を許可していません',
        150: '動画の所有者が埋め込み再生を許可していません'
    };
    const errorMessage = errorMessages[errorCode] || `不明なエラー (コード: ${errorCode})`;

    console.error(`[YouTube Error] ${errorMessage}`);
    console.error(`  エラーコード: ${errorCode}`);
    console.error(`  種類: ${errorType}`);
    console.error(`  動画ID: ${videoId}`);
    console.error(`  映画タイトル: ${movie?.title || 'unknown'}`);
    console.error(`  時刻: ${new Date(currentTime).toLocaleString()}`);

    // 致命的なエラーの場合は即座にスキップ（連続スキップチェックなし）
    if (isFatalError) {
        console.warn(`[YouTube Error] 致命的なエラーのため、動画をスキップします`);
        state.lastAutoSkipTime = currentTime;
        playNext();
        return;
    }

    // 一時的なエラーの場合はリトライを試みる
    if (isTemporaryError && !state.isRetrying) {
        console.warn(`[YouTube Error] 一時的なエラーのため、リトライを試みます`);
        state.isRetrying = true;
        setTimeout(() => {
            if (state.youtubePlayer && typeof state.youtubePlayer.playVideo === 'function') {
                state.youtubePlayer.playVideo();
                // リトライ後、2秒待ってもエラーが続く場合はスキップ
                setTimeout(() => {
                    state.isRetrying = false;
                }, 2000);
            }
        }, 1000);
        return;
    }

    // 連続スキップ防止: 最後のスキップから3秒以内の場合はスキップしない
    if (state.lastAutoSkipTime !== null) {
        const timeSinceLastSkip = (currentTime - state.lastAutoSkipTime) / 1000;
        if (timeSinceLastSkip < 3) {
            console.warn(`[YouTube Error] 最後のスキップから${timeSinceLastSkip.toFixed(1)}秒しか経過していないため、自動スキップをスキップします`);
            return;
        }
    }

    // スキップ実行
    console.warn(`[YouTube Error] 次の動画にスキップします`);
    state.lastAutoSkipTime = currentTime;
    state.isRetrying = false;
    playNext();
}

function handleYoutubeStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        state.isPaused = false;
        updatePauseButton();

        // iOS Safariでは音声設定は適用しない（ユーザーが明示的にボタンをタップしたときのみ）
        if (!state.isIOSSafari) {
            applySoundPreference();
        }

        // 再生中は再生再開ボタンを非表示
        if (iosUnmuteButton && iosUnmuteButton.dataset.mode === 'resume') {
            iosUnmuteButton.style.display = 'none';
        }

        // 再生開始時にオーバーレイを非表示（YouTube UIが見えるようになる）
        if (playerOverlay) {
            playerOverlay.classList.add('hidden');
        }
    } else if (event.data === YT.PlayerState.PAUSED) {
        state.isPaused = true;
        updatePauseButton();

        // 再生停止時に再生再開ボタンを表示
        if (iosUnmuteButton) {
            iosUnmuteButton.dataset.mode = 'resume';
            const icon = iosUnmuteButton.querySelector('.unmute-icon');
            const text = iosUnmuteButton.querySelector('.unmute-text');
            if (icon) icon.textContent = '▶️';
            if (text) text.textContent = 'タップして再生再開';
            iosUnmuteButton.style.display = 'flex';
        }
    } else if (event.data === YT.PlayerState.ENDED) {
        // 動画終了時にオーバーレイを表示（関連動画を隠す）
        if (playerOverlay) {
            playerOverlay.classList.remove('hidden');
        }
        playNext();
    }
}

function persistProcessedMovies() {
    // タイムスタンプ付き履歴をlocalStorageに保存
    localStorage.setItem('processedMovies', JSON.stringify(state.processedMoviesHistory));
}

function trimProcessedMoviesHistory() {
    // 2500件を超えた場合、古いものから削除
    if (state.processedMoviesHistory.length > MAX_PROCESSED_MOVIES) {
        // タイムスタンプでソート（古い順）
        state.processedMoviesHistory.sort((a, b) => a.timestamp - b.timestamp);

        // 超過分を削除
        const toRemove = state.processedMoviesHistory.length - MAX_PROCESSED_MOVIES;
        const removed = state.processedMoviesHistory.splice(0, toRemove);

        // Setからも削除
        removed.forEach(item => {
            state.processedMovies.delete(item.id);
        });

        console.log(`[履歴管理] 古い再生済み作品${toRemove}件を削除しました。現在の保持件数: ${state.processedMoviesHistory.length}`);
    }
}

function markCurrentMovieProcessed() {
    const movie = state.movies[state.currentMovieIndex];
    if (!movie) return;

    if (!state.processedMovies.has(movie.id)) {
        const timestamp = Date.now();

        // Setに追加（高速検索用）
        state.processedMovies.add(movie.id);

        // タイムスタンプ付き履歴に追加
        state.processedMoviesHistory.push({
            id: movie.id,
            timestamp: timestamp
        });

        // 2500件を超えた場合は古いものを削除
        trimProcessedMoviesHistory();

        // localStorageに保存
        persistProcessedMovies();

        console.log(`[再生済み] ${movie.title} (ID: ${movie.id}) を記録しました。現在の再生済み作品数: ${state.processedMovies.size}`);
    }
}

function loadSortOrder() {
    const saved = localStorage.getItem('sortOrder');
    if (saved) {
        state.sortOrder = saved;
        pendingState.sortOrder = saved;
        sortOrderSelect.value = saved;
    } else {
        // デフォルト値をpendingStateにも設定
        pendingState.sortOrder = state.sortOrder;
    }
}

function saveSortOrder() {
    localStorage.setItem('sortOrder', state.sortOrder);
}

function updatePauseButton() {
    if (!pauseButton) return;
    const hasPlayer = !!state.youtubePlayer;
    pauseButton.disabled = !hasPlayer;
    const label = state.isPaused || !hasPlayer ? '▶' : '⏸';
    pauseButton.textContent = label;
}

function togglePause() {
    if (!state.youtubePlayer || !pauseButton || typeof YT === 'undefined') return;
    const playerState = state.youtubePlayer.getPlayerState?.();

    if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
        state.youtubePlayer.playVideo();
        state.isPaused = false;
    } else {
        state.youtubePlayer.pauseVideo();
        state.isPaused = true;
        // 一時停止した時だけUIを表示
        showUI();
    }

    updatePauseButton();
}

function toggleUIVisibility() {
    if (!state.hasStarted) return;
    if (!uiToggleButton) return;

    // 縦レイアウト（≤1024px）では切り替え機能を無効化
    const isPortraitMobile = window.innerWidth <= 1024;
    if (isPortraitMobile) return;

    if (isManuallyHidden) {
        isManuallyHidden = false;
        uiToggleButton.textContent = '◉';
        showUI(true);
        setSoundEnabled(true);
    } else {
        isManuallyHidden = true;
        uiToggleButton.textContent = '○';
        hideUI(true);
        setSoundEnabled(true);
    }
}

function openMovieOnService() {
    const movie = state.movies[state.currentMovieIndex];
    if (!movie) return;

    const tmdbUrl = `https://www.themoviedb.org/movie/${movie.id}`;
    window.open(tmdbUrl, '_blank', 'noopener,noreferrer');
}

function handleKeyboardShortcuts(event) {
    if (!event) return;
    const activeTag = document.activeElement && document.activeElement.tagName;
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
    }

    if (!state.hasStarted) {
        if ((event.key === ' ' || event.key === 'Enter') && startButton && !startModal?.classList.contains('hidden')) {
            event.preventDefault();
            startButton.click();
        }
        return;
    }

    switch (event.key) {
        case ' ':
            event.preventDefault();
            togglePause();
            break;
        case 'f':
        case 'F':
            event.preventDefault();
            toggleFullscreen();
            break;
        case 'h':
        case 'H':
            event.preventDefault();
            toggleUIVisibility();
            break;
        case 'n':
        case 'N':
            event.preventDefault();
            playNext();
            break;
        case 'p':
        case 'P':
            event.preventDefault();
            playPrev();
            break;
        case 'Enter':
            event.preventDefault();
            openMovieOnService();
            break;
        default:
            break;
    }
}

function updateFullscreenButton() {
    if (!fullscreenButton) return;
    const active = document.fullscreenElement !== null;
    fullscreenButton.textContent = active ? '⊟' : '⛶';
}

async function toggleFullscreen() {
    if (!fullscreenButton) return;
    const fullscreenTarget = immersiveStage || playerShell || document.documentElement;
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await fullscreenTarget.requestFullscreen();
        }
    } catch (error) {
        console.warn('Fullscreen toggle failed:', error);
    } finally {
        updateFullscreenButton();
        showUI();
    }
}

function handleFullscreenChange() {
    updateFullscreenButton();
    showUI();
}

// --- UI表示制御 ---

let isUIVisible = true;
let isManuallyHidden = false;
let uiTimeout = null;
let isInteracting = false;

function showUI(force = false) {
    if (!uiLayer) return;
    if (!state.hasStarted && !force) return;
    if (isManuallyHidden && !force) return;
    if (!isUIVisible) {
        uiLayer.classList.remove('ui-hidden');
        if (aboutButton) {
            aboutButton.classList.remove('ui-hidden');
        }
        isUIVisible = true;
        // ボタンのアイコンを更新
        if (uiToggleButton) {
            uiToggleButton.textContent = '◉';
            uiToggleButton.setAttribute('tabindex', '0'); // フォーカス可能にする
        }
        if (aboutButton) {
            aboutButton.setAttribute('tabindex', '0'); // フォーカス可能にする
        }
    }
}

function hideUI(force = false) {
    if (!uiLayer) return;
    if (!state.hasStarted && !force) return;
    if (isManuallyHidden && !force) return;
    if (isInteracting && !force) return; // インタラクション中は非表示にしない

    // 縦レイアウト（≤1024px）ではUIを常に表示するため、非表示にしない
    const isPortraitMobile = window.innerWidth <= 1024;
    if (isPortraitMobile && !force) return;

    if (isUIVisible) {
        uiLayer.classList.add('ui-hidden');
        if (aboutButton) {
            aboutButton.classList.add('ui-hidden');
        }
        isUIVisible = false;
        // ボタンのアイコンを更新
        if (uiToggleButton) {
            uiToggleButton.textContent = '○';
            uiToggleButton.setAttribute('tabindex', '-1'); // フォーカス不可にする
        }
        if (aboutButton) {
            aboutButton.setAttribute('tabindex', '-1'); // フォーカス不可にする
        }
    }
}

function setupUIControls() {
    // iOS Safari用のフローティングボタン（音声ON / 再生再開）
    if (iosUnmuteButton) {
        iosUnmuteButton.addEventListener('click', (event) => {
            // イベント伝播を停止（親要素のクリックイベントを発火させない）
            event.stopPropagation();

            const mode = iosUnmuteButton.dataset.mode || 'unmute';

            if (mode === 'unmute') {
                // 音声ONモード
                console.log('ユーザーが音声ONをリクエスト');
                state.iosUserWantsSound = true;
                applySoundPreference();
                // ボタンを非表示
                iosUnmuteButton.style.display = 'none';
            } else if (mode === 'resume') {
                // 再生再開モード
                console.log('ユーザーが再生再開をリクエスト');
                if (state.youtubePlayer && typeof state.youtubePlayer.playVideo === 'function') {
                    state.youtubePlayer.playVideo();
                    // ボタンを非表示
                    iosUnmuteButton.style.display = 'none';
                }
            }
        });
    }

    document.addEventListener('keydown', handleKeyboardShortcuts, { passive: false });

    // マウス移動でUIを表示し、3秒後に自動非表示
    document.addEventListener('mousemove', () => {
        if (!state.hasStarted) return;
        if (isManuallyHidden) return;
        showUI();

        // 既存のタイムアウトをクリア
        if (uiTimeout) {
            clearTimeout(uiTimeout);
        }

        // 3秒後にUIを非表示
        uiTimeout = setTimeout(() => {
            if (!isManuallyHidden && !isInteracting) {
                hideUI();
            }
        }, 3000);
    });

    // インタラクティブ要素のホバー時はUIを維持
    const interactiveElements = document.querySelectorAll(
        'button, input, label, .control-panel, .info-panel, .genre-filter-modal, .about-modal'
    );

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            isInteracting = true;
            if (uiTimeout) {
                clearTimeout(uiTimeout);
            }
        });

        element.addEventListener('mouseleave', () => {
            isInteracting = false;
            // マウスが離れたらタイムアウトを再開
            if (!isManuallyHidden && state.hasStarted) {
                if (uiTimeout) {
                    clearTimeout(uiTimeout);
                }
                uiTimeout = setTimeout(() => {
                    if (!isManuallyHidden && !isInteracting) {
                        hideUI();
                    }
                }, 3000);
            }
        });
    });

    // 画面サイズ変更時の処理
    window.addEventListener('resize', () => {
        const isPortraitMobile = window.innerWidth <= 1024;

        // 縦レイアウトに切り替わった場合、UIを強制的に表示
        if (isPortraitMobile && !isUIVisible) {
            isManuallyHidden = false;
            showUI(true);
        }
    });
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
                showLoadingMessage('再生可能な予告映像がこれ以上見つかりませんでした。');
            }
            return;
        } else {
            // すべてのページを試したか、現在フェッチ中の場合
            console.log('すべての映画の予告映像を試しましたが、これ以上見つかりませんでした。');
            showLoadingMessage('再生可能な予告映像がこれ以上見つかりませんでした。');
            updateButtonStates();
            return;
        }
    }

    state.currentMovieIndex = index;
    markCurrentMovieProcessed();
    if (!state.history.includes(index)) {
        state.history.push(index);
    }
    updateButtonStates();
    const movie = state.movies[state.currentMovieIndex];
    console.log(`'${movie.title}' の予告映像を検索中...`);

    const videosData = await fetchFromTMDB(`/movie/${movie.id}/videos`);

    if (videosData && videosData.results) {
        const trailer = videosData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        const teaser = videosData.results.find(video => video.type === 'Teaser' && video.site === 'YouTube');
        const anyVideo = videosData.results.find(video => video.site === 'YouTube');
        const videoToPlay = trailer || teaser || anyVideo;

        if (videoToPlay) {
            console.log(`再生する予告映像: ${movie.title}`);
            const started = await displayTrailer(videoToPlay.key);
            if (started) {
                displayMovieInfo(movie);
            }
            return;
        }
    }

    console.log(`'${movie.title}' に再生可能な予告映像が見つかりませんでした。次の映画を試します。`);
    playNext();
}

/**
 * フィルター条件を適用してAPIリクエストを送信する
 */
async function applyFilters() {
    console.log('[フィルター適用] 適用ボタンがクリックされました');

    // 全プロバイダーチェックボックスから選択されているIDを収集
    const allProviderCheckboxes = [
        netflixFilter,
        primeVideoFilter,
        huluFilter,
        uNextFilter,
        disneyPlusFilter,
        appleTvPlusFilter
    ];

    const selectedProviders = [];
    if (netflixFilter && netflixFilter.checked) selectedProviders.push(PROVIDER_IDS.NETFLIX);
    if (primeVideoFilter && primeVideoFilter.checked) selectedProviders.push(PROVIDER_IDS.PRIME_VIDEO);
    if (huluFilter && huluFilter.checked) selectedProviders.push(PROVIDER_IDS.HULU);
    if (uNextFilter && uNextFilter.checked) selectedProviders.push(PROVIDER_IDS.U_NEXT);
    if (disneyPlusFilter && disneyPlusFilter.checked) selectedProviders.push(PROVIDER_IDS.DISNEY_PLUS);
    if (appleTvPlusFilter && appleTvPlusFilter.checked) selectedProviders.push(PROVIDER_IDS.APPLE_TV_PLUS);

    // 最低1つのプロバイダーが選択されているか検証
    if (selectedProviders.length === 0) {
        alert('少なくとも1つの配信サービスを選択してください。');
        return;
    }

    // pendingStateから確定状態（state）にコピー
    state.selectedProviders = selectedProviders;
    state.sortOrder = pendingState.sortOrder;
    state.selectedGenres = new Set(pendingState.genres);

    // localStorageに保存
    localStorage.setItem('selectedProviders', JSON.stringify(state.selectedProviders));
    localStorage.setItem('sortOrder', state.sortOrder);
    localStorage.setItem('selectedGenres', JSON.stringify(Array.from(state.selectedGenres)));

    console.log(`[フィルター適用] プロバイダー: ${state.selectedProviders.length}個, ソート: ${state.sortOrder}, ジャンル: ${state.selectedGenres.size}個`);

    // 映画リストと履歴をリセット
    state.movies = [];
    state.history = [];
    state.currentMovieIndex = 0;

    // 適用/リセットボタンを無効化
    updateFilterButtonStates();

    // APIリクエストを実行
    await updateAndFetchMovies(true);
}

/**
 * フィルター条件の変更を破棄し、確定状態に戻す
 */
function resetFilters() {
    console.log('[フィルター] リセットボタンがクリックされました');

    // 確定状態（state）からpendingStateにコピー
    pendingState.providers = state.selectedProviders.slice();
    pendingState.sortOrder = state.sortOrder;
    pendingState.genres = new Set(state.selectedGenres);

    // UIコントロールを確定状態に戻す
    if (netflixFilter) netflixFilter.checked = state.selectedProviders.includes(PROVIDER_IDS.NETFLIX);
    if (primeVideoFilter) primeVideoFilter.checked = state.selectedProviders.includes(PROVIDER_IDS.PRIME_VIDEO);
    if (huluFilter) huluFilter.checked = state.selectedProviders.includes(PROVIDER_IDS.HULU);
    if (uNextFilter) uNextFilter.checked = state.selectedProviders.includes(PROVIDER_IDS.U_NEXT);
    if (disneyPlusFilter) disneyPlusFilter.checked = state.selectedProviders.includes(PROVIDER_IDS.DISNEY_PLUS);
    if (appleTvPlusFilter) appleTvPlusFilter.checked = state.selectedProviders.includes(PROVIDER_IDS.APPLE_TV_PLUS);

    if (sortOrderSelect) sortOrderSelect.value = state.sortOrder;

    // ジャンルフィルターのUIもリセット
    const genreCheckboxes = genreFilterList.querySelectorAll('input[type="checkbox"]');
    genreCheckboxes.forEach(checkbox => {
        const genreId = parseInt(checkbox.value);
        checkbox.checked = state.selectedGenres.has(genreId);
    });

    // ボタンの状態を更新
    updateFilterButtonStates();

    console.log('[フィルター] リセット完了');
}

async function updateAndFetchMovies(resetPage = true) {
    if (state.isFetchingMovies) return;
    state.isFetchingMovies = true;

    try {
        if (resetPage) {
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
                sort_by: state.sortOrder,
                page: pageToFetch,
            };

            if (state.selectedGenres.size > 0) {
                apiParams.with_genres = Array.from(state.selectedGenres).join(',');
            }

            const movieData = await fetchFromTMDB('/discover/movie', apiParams);

            if (!movieData || !movieData.results) {
                state.movies = resetPage ? [] : existingMovies;
                showLoadingMessage('選択されたサービスで視聴可能な映画が見つかりませんでした。');
                updateButtonStates();
                return;
            }

            state.totalPages = movieData.total_pages || pageToFetch;

            const totalFetched = movieData.results.length;
            const newMovies = movieData.results.filter(movie => {
                const movieId = movie.id;
                return !state.processedMovies.has(movieId);
            });
            const filteredCount = totalFetched - newMovies.length;
            if (filteredCount > 0) {
                console.log(`[フィルタリング] ${totalFetched}件中${filteredCount}件を除外しました（再生済み: ${state.processedMovies.size}件）`);
            }

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
                showLoadingMessage('視聴可能な映画はすべて再生済みです。');
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
    state.isPaused = true;
    updatePauseButton();
    const currentHistoryIndex = state.history.indexOf(state.currentMovieIndex);
    if (currentHistoryIndex < state.history.length - 1) {
        const targetMovieIndex = state.history[currentHistoryIndex + 1];
        loadAndDisplayTrailer(targetMovieIndex);
    } else {
        const nextMovieIndex = state.currentMovieIndex + 1;
        loadAndDisplayTrailer(nextMovieIndex);
    }
}

function playPrev() {
    state.isPaused = true;
    updatePauseButton();
    const currentHistoryIndex = state.history.indexOf(state.currentMovieIndex);
    const targetHistoryIndex = Math.max(currentHistoryIndex - 1, 0);
    const targetMovieIndex = state.history[targetHistoryIndex];
    loadAndDisplayTrailer(targetMovieIndex);
}


// --- 初期化処理 ---

async function initializeApp() {
    console.log('アプリケーションを初期化します...');
    // イベントリスナー
    nextButton.addEventListener('click', playNext);
    prevButton.addEventListener('click', playPrev);
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
        state.isPaused = true;
        updatePauseButton();
    }
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
        updateFullscreenButton();
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
    if (uiToggleButton) {
        uiToggleButton.addEventListener('click', () => {
            if (isManuallyHidden) {
                isManuallyHidden = false;
                uiToggleButton.textContent = '◉';
                showUI(true);
            } else {
                isManuallyHidden = true;
                uiToggleButton.textContent = '○';
                hideUI(true);
                setSoundEnabled(true);
            }
        });
        uiToggleButton.textContent = isManuallyHidden ? '○' : '◉';
    }
    // プロバイダーフィルターの変更 → pendingStateを更新（即座に適用しない）
    const providerChangeHandler = () => {
        const selectedProviders = [];
        if (netflixFilter && netflixFilter.checked) selectedProviders.push(PROVIDER_IDS.NETFLIX);
        if (primeVideoFilter && primeVideoFilter.checked) selectedProviders.push(PROVIDER_IDS.PRIME_VIDEO);
        if (huluFilter && huluFilter.checked) selectedProviders.push(PROVIDER_IDS.HULU);
        if (uNextFilter && uNextFilter.checked) selectedProviders.push(PROVIDER_IDS.U_NEXT);
        if (disneyPlusFilter && disneyPlusFilter.checked) selectedProviders.push(PROVIDER_IDS.DISNEY_PLUS);
        if (appleTvPlusFilter && appleTvPlusFilter.checked) selectedProviders.push(PROVIDER_IDS.APPLE_TV_PLUS);

        pendingState.providers = selectedProviders;
        updateFilterButtonStates();
        console.log(`[フィルター変更] プロバイダー: ${selectedProviders.length}個選択（未適用）`);
    };

    if (netflixFilter) netflixFilter.addEventListener('change', providerChangeHandler);
    if (primeVideoFilter) primeVideoFilter.addEventListener('change', providerChangeHandler);
    if (huluFilter) huluFilter.addEventListener('change', providerChangeHandler);
    if (uNextFilter) uNextFilter.addEventListener('change', providerChangeHandler);
    if (disneyPlusFilter) disneyPlusFilter.addEventListener('change', providerChangeHandler);
    if (appleTvPlusFilter) appleTvPlusFilter.addEventListener('change', providerChangeHandler);

    // ソート順変更時のイベントハンドラー → pendingStateを更新（即座に適用しない）
    sortOrderSelect.addEventListener('change', () => {
        pendingState.sortOrder = sortOrderSelect.value;
        updateFilterButtonStates();
        console.log(`[フィルター変更] ソート順: ${pendingState.sortOrder}（未適用）`);
    });

    // ジャンルフィルターモーダルの開閉
    genreFilterToggle.addEventListener('click', () => {
        genreFilterModal.classList.remove('hidden');
    });

    genreFilterClose.addEventListener('click', () => {
        genreFilterModal.classList.add('hidden');
    });

    // バックドロップクリックでモーダルを閉じる
    genreFilterModal.addEventListener('click', (event) => {
        if (event.target === genreFilterModal || event.target.classList.contains('genre-filter-modal__backdrop')) {
            genreFilterModal.classList.add('hidden');
        }
    });

    // 情報モーダルの開閉
    aboutButton.addEventListener('click', () => {
        aboutModal.classList.remove('hidden');
    });

    aboutModalClose.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });

    // バックドロップクリックで情報モーダルを閉じる
    aboutModal.addEventListener('click', (event) => {
        if (event.target === aboutModal || event.target.classList.contains('about-modal__backdrop')) {
            aboutModal.classList.add('hidden');
        }
    });

    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (!genreFilterModal.classList.contains('hidden')) {
                genreFilterModal.classList.add('hidden');
            }
            if (!aboutModal.classList.contains('hidden')) {
                aboutModal.classList.add('hidden');
            }
        }
    });

    // ジャンルフィルターの変更 → pendingStateを更新（即座に適用しない）
    genreFilterList.addEventListener('change', (event) => {
        const genreId = parseInt(event.target.value);
        if (event.target.checked) {
            pendingState.genres.add(genreId);
        } else {
            pendingState.genres.delete(genreId);
        }
        updateFilterButtonStates();
        console.log(`[フィルター変更] ジャンル: ${pendingState.genres.size}個選択（未適用）`);
    });

    // 適用ボタンのイベントリスナー
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyFilters);
    }

    // リセットボタンのイベントリスナー
    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', resetFilters);
    }

    movieInfoContainer.addEventListener('click', (event) => {
        if (event.target.id === 'open-service-button') {
            openMovieOnService();
        } else if (event.target.classList.contains('genre-tag')) {
            const genreId = parseInt(event.target.dataset.genreId);
            if (!state.selectedGenres.has(genreId)) {
                state.selectedGenres.add(genreId);
                localStorage.setItem('selectedGenres', JSON.stringify(Array.from(state.selectedGenres)));
                populateGenreFilterUI();
                updateAndFetchMovies(true);
            }
        }
    });

    immersiveStage.addEventListener('click', (event) => {
        // クリックされた要素がUI要素でない場合、UIの表示/非表示を切り替える
        if (
            !uiLayer.contains(event.target) &&
            event.target !== uiToggleButton &&
            state.hasStarted
        ) {
            toggleUIVisibility();
        }
    });

    // localStorageから設定を読み込み
    const savedProviders = JSON.parse(localStorage.getItem('selectedProviders'));

    // 初回訪問時（localStorageが空）はデフォルトで全6サービスをチェック
    if (savedProviders === null) {
        if (netflixFilter) netflixFilter.checked = true;
        if (primeVideoFilter) primeVideoFilter.checked = true;
        if (huluFilter) huluFilter.checked = true;
        if (uNextFilter) uNextFilter.checked = true;
        if (disneyPlusFilter) disneyPlusFilter.checked = true;
        if (appleTvPlusFilter) appleTvPlusFilter.checked = true;

        // 初期状態を両方のstateに設定
        state.selectedProviders = [
            PROVIDER_IDS.NETFLIX,
            PROVIDER_IDS.PRIME_VIDEO,
            PROVIDER_IDS.HULU,
            PROVIDER_IDS.U_NEXT,
            PROVIDER_IDS.DISNEY_PLUS,
            PROVIDER_IDS.APPLE_TV_PLUS
        ];
        pendingState.providers = state.selectedProviders.slice();
    } else {
        // 保存された設定がある場合はそれを適用
        if (netflixFilter) netflixFilter.checked = savedProviders.includes(PROVIDER_IDS.NETFLIX);
        if (primeVideoFilter) primeVideoFilter.checked = savedProviders.includes(PROVIDER_IDS.PRIME_VIDEO);
        if (huluFilter) huluFilter.checked = savedProviders.includes(PROVIDER_IDS.HULU);
        if (uNextFilter) uNextFilter.checked = savedProviders.includes(PROVIDER_IDS.U_NEXT);
        if (disneyPlusFilter) disneyPlusFilter.checked = savedProviders.includes(PROVIDER_IDS.DISNEY_PLUS);
        if (appleTvPlusFilter) appleTvPlusFilter.checked = savedProviders.includes(PROVIDER_IDS.APPLE_TV_PLUS);

        state.selectedProviders = savedProviders;
        pendingState.providers = savedProviders.slice();
    }

    const savedProcessed = JSON.parse(localStorage.getItem('processedMovies')) || [];

    // 既存データとの互換性を確保
    if (savedProcessed.length > 0) {
        const firstItem = savedProcessed[0];
        const now = Date.now();

        if (typeof firstItem === 'number') {
            // 旧形式（IDのみの配列）の場合
            console.log(`[初期化] 旧形式の再生済みデータを検出。新形式に変換します...`);
            state.processedMoviesHistory = savedProcessed.map(id => ({
                id: id,
                timestamp: now // 既存データには現在時刻を設定
            }));
            state.processedMovies = new Set(savedProcessed);

            // 新形式で保存し直す
            persistProcessedMovies();
            console.log(`[初期化] 再生済み作品を${savedProcessed.length}件読み込みました（新形式に変換完了）`);
        } else if (typeof firstItem === 'object' && firstItem.id !== undefined) {
            // 新形式（オブジェクト配列）の場合
            state.processedMoviesHistory = savedProcessed;
            state.processedMovies = new Set(savedProcessed.map(item => item.id));
            console.log(`[初期化] 再生済み作品を${savedProcessed.length}件読み込みました`);
        } else {
            console.warn(`[初期化] 不明な形式の再生済みデータです。初期化します。`);
            state.processedMoviesHistory = [];
            state.processedMovies = new Set();
        }

        // 2500件を超えている場合は古いものを削除
        trimProcessedMoviesHistory();
    }

    const savedSelectedGenres = JSON.parse(localStorage.getItem('selectedGenres')) || [];
    state.selectedGenres = new Set(savedSelectedGenres);
    pendingState.genres = new Set(savedSelectedGenres); // pendingStateも初期化

    // ソート順を読み込み
    loadSortOrder();

    // 初期ボタンの状態を設定
    updateFilterButtonStates();

    // ジャンルリストを取得してからアプリのメインロジックを開始
    const genreData = await fetchFromTMDB('/genre/movie/list');
    if (genreData && genreData.genres) {
        state.genres = genreData.genres;
        populateGenreFilterUI();
    }

    // 初期状態: UIレイヤーを非表示にする
    if (uiLayer) {
        uiLayer.classList.add('startup-hidden');
    }

    setupUIControls();

    if (startModal && startButton && dimmingOverlay && theaterScreen) {
        startModal.classList.remove('hidden');

        // 上映開始処理を共通関数として定義
        const startScreening = () => {
            // 重複クリック防止: 既に処理中の場合は早期リターン
            if (startButton.disabled) {
                return;
            }

            startButton.disabled = true;

            // ブザー音を再生（ユーザーインタラクション直後なので再生可能）
            buzzerAudio.play().catch((error) => {
                console.warn('ブザー音の再生に失敗しました:', error);
            });

            // 映画館のような暗転演出を開始
            startModal.classList.add('fade-out');
            dimmingOverlay.style.animation = 'dim-lights 0.5s ease-in forwards';
            dimmingOverlay.style.background = 'rgba(0, 0, 0, 1)';

            // 暗転アニメーション完了後、アプリケーションを開始
            setTimeout(() => {
                state.hasStarted = true;
                startModal.classList.add('hidden');
                setSoundEnabled(true);

                // タブレット・モバイル（≤1024px）では最初からUIを表示
                // タッチデバイスの横画面やタブレットでもUIを表示
                // デスクトップ（非タッチ）のみUIを非表示にして、マウス移動で表示
                const isPortraitMobile = window.innerWidth <= 1024;
                const shouldShowUI = isPortraitMobile || state.isTouchDevice;

                if (shouldShowUI) {
                    isManuallyHidden = false;
                    if (uiToggleButton) {
                        uiToggleButton.textContent = '◉';
                    }
                } else {
                    isManuallyHidden = true;
                    if (uiToggleButton) {
                        uiToggleButton.textContent = '○';
                    }
                }

                // スクリーンを即座に非表示（トランジションなし）
                if (theaterScreen) {
                    theaterScreen.style.transition = 'none';
                    theaterScreen.style.opacity = '0';
                    theaterScreen.style.display = 'none';
                }
                if (uiLayer) {
                    uiLayer.classList.remove('startup-hidden');
                }
                if (uiToggleButton) {
                    uiToggleButton.style.visibility = 'visible';
                    uiToggleButton.setAttribute('tabindex', '0'); // フォーカス可能にする
                }
                if (aboutButton) {
                    aboutButton.style.visibility = 'visible';
                    aboutButton.setAttribute('tabindex', '0'); // フォーカス可能にする
                }

                // theater-screenを非表示にしてから、暗転オーバーレイをゆっくりフェードアウト
                setTimeout(() => {
                    if (dimmingOverlay) {
                        dimmingOverlay.style.animation = 'none';
                        dimmingOverlay.style.transition = 'opacity 0.8s ease-out';
                        dimmingOverlay.style.opacity = '0';

                        // フェードアウト完了後に完全に非表示
                        setTimeout(() => {
                            dimmingOverlay.style.display = 'none';
                            dimmingOverlay.style.visibility = 'hidden';
                        }, 800);
                    }
                }, 50); // theater-screenの非表示処理の後、少し待ってからフェードアウト

                if (!shouldShowUI) {
                    hideUI(true);
                }
                updateAndFetchMovies(true);
            }, 500);
        };

        // モーダル全体のクリックイベント（画面全体をクリック可能に）
        startModal.addEventListener('click', () => {
            startScreening();
        }, { once: true });

        // 全画面表示ボタンのクリックイベント
        if (fullscreenStartButton) {
            fullscreenStartButton.addEventListener('click', async (event) => {
                // イベント伝播を停止（親要素のクリックイベントを発火させない）
                event.stopPropagation();

                // スタートモーダルはimmersive-stageの外にあるため、
                // document.documentElement（ページ全体）をフルスクリーンにする
                try {
                    if (!document.fullscreenElement) {
                        await document.documentElement.requestFullscreen();
                        console.log('フルスクリーンモードを有効化しました');
                    }
                } catch (error) {
                    console.warn('フルスクリーンモードの有効化に失敗しました:', error);
                }
            });
        }

        // 上映開始ボタンのクリックイベント
        startButton.addEventListener('click', (event) => {
            // イベント伝播を停止（親要素のクリックイベントを発火させない）
            event.stopPropagation();
            startScreening();
        }, { once: true });
    } else {
        state.hasStarted = true;
        updateAndFetchMovies(true);
    }
}

initializeApp();
