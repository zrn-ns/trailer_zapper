console.log('Trailer Zapperのスクリプトが読み込まれました。');

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

// --- グローバル変数と状態管理 ---
const state = {
    movies: [],
    history: [],
    currentMovieIndex: 0,
    selectedProviders: [],
    ignoredMovies: new Set(),
    genres: [],
    selectedGenres: new Set(),
    youtubePlayer: null,
    youtubeApiPromise: null,
    currentPage: 1,
    totalPages: 1,
    isFetchingMovies: false,
    processedMovies: new Set(),
    isPaused: false,
    isSoundEnabled: false,
    hasStarted: false,
    sortOrder: 'popularity.desc',
    lastAutoSkipTime: null,
    isRetrying: false,
    isIOSSafari: false, // iOS Safari検出フラグ
    iosUserWantsSound: false, // iOS Safariでユーザーが音声をリクエストしたかどうか
};

// --- DOM要素 ---
const appContainer = document.getElementById('app');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const netflixFilter = document.getElementById('netflix-filter');
const primeVideoFilter = document.getElementById('prime-video-filter');
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
        showLoadingMessage('予告編プレーヤーの初期化に失敗しました。');
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
                <button id="ignore-button" class="button">興味なし</button>
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
    localStorage.setItem('processedMovies', JSON.stringify(Array.from(state.processedMovies)));
}

function markCurrentMovieProcessed() {
    const movie = state.movies[state.currentMovieIndex];
    if (!movie) return;

    if (!state.processedMovies.has(movie.id)) {
        state.processedMovies.add(movie.id);
        persistProcessedMovies();
        console.log(`[再生済み] ${movie.title} (ID: ${movie.id}) を記録しました。現在の再生済み作品数: ${state.processedMovies.size}`);
    }
}

function loadSortOrder() {
    const saved = localStorage.getItem('sortOrder');
    if (saved) {
        state.sortOrder = saved;
        sortOrderSelect.value = saved;
    }
}

function saveSortOrder() {
    localStorage.setItem('sortOrder', state.sortOrder);
}

function updatePauseButton() {
    if (!pauseButton) return;
    const hasPlayer = !!state.youtubePlayer;
    pauseButton.disabled = !hasPlayer;
    const label = state.isPaused || !hasPlayer ? '再生' : '一時停止';
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

    // 縦レイアウト（≤720px）では切り替え機能を無効化
    const isPortraitMobile = window.innerWidth <= 720;
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
    fullscreenButton.textContent = active ? '全画面解除' : '全画面';
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
        }
    }
}

function hideUI(force = false) {
    if (!uiLayer) return;
    if (!state.hasStarted && !force) return;
    if (isManuallyHidden && !force) return;
    if (isInteracting && !force) return; // インタラクション中は非表示にしない

    // 縦レイアウト（≤720px）ではUIを常に表示するため、非表示にしない
    const isPortraitMobile = window.innerWidth <= 720;
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
        const isPortraitMobile = window.innerWidth <= 720;

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
    markCurrentMovieProcessed();
    if (!state.history.includes(index)) {
        state.history.push(index);
    }
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
    playNext();
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
                return !state.ignoredMovies.has(movieId) && !state.processedMovies.has(movieId);
            });
            const filteredCount = totalFetched - newMovies.length;
            if (filteredCount > 0) {
                console.log(`[フィルタリング] ${totalFetched}件中${filteredCount}件を除外しました（再生済み: ${state.processedMovies.size}件, 興味なし: ${state.ignoredMovies.size}件）`);
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

function handleIgnoreClick() {
    const movieToIgnore = state.movies[state.currentMovieIndex];
    if (!movieToIgnore) return;

    console.log(`'${movieToIgnore.title}' を興味なしリストに追加しました。`);
    state.ignoredMovies.add(movieToIgnore.id);
    localStorage.setItem('ignoredMovies', JSON.stringify(Array.from(state.ignoredMovies)));

    playNext();
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
    netflixFilter.addEventListener('change', () => updateAndFetchMovies(true));
    primeVideoFilter.addEventListener('change', () => updateAndFetchMovies(true));

    // ソート順変更時のイベントハンドラー
    sortOrderSelect.addEventListener('change', () => {
        state.sortOrder = sortOrderSelect.value;
        saveSortOrder();

        // ソート順変更時は履歴のみリセット（再生済み作品は除外し続ける）
        state.history = [];

        updateAndFetchMovies(true);
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

    genreFilterList.addEventListener('change', (event) => {
        const genreId = parseInt(event.target.value);
        if (event.target.checked) {
            state.selectedGenres.add(genreId);
        } else {
            state.selectedGenres.delete(genreId);
        }
        localStorage.setItem('selectedGenres', JSON.stringify(Array.from(state.selectedGenres)));
        updateAndFetchMovies(true);
    });

    movieInfoContainer.addEventListener('click', (event) => {
        if (event.target.id === 'ignore-button') {
            handleIgnoreClick();
        } else if (event.target.id === 'open-service-button') {
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

    // 初回訪問時（localStorageが空）はデフォルトで両方チェック
    if (savedProviders === null) {
        netflixFilter.checked = true;
        primeVideoFilter.checked = true;
    } else {
        // 保存された設定がある場合はそれを適用
        netflixFilter.checked = savedProviders.includes(PROVIDER_IDS.NETFLIX);
        primeVideoFilter.checked = savedProviders.includes(PROVIDER_IDS.PRIME_VIDEO);
    }

    const savedIgnored = JSON.parse(localStorage.getItem('ignoredMovies')) || [];
    state.ignoredMovies = new Set(savedIgnored);

    const savedProcessed = JSON.parse(localStorage.getItem('processedMovies')) || [];
    state.processedMovies = new Set(savedProcessed);
    if (savedProcessed.length > 0) {
        console.log(`[初期化] 再生済み作品を${savedProcessed.length}件読み込みました`);
    }

    const savedSelectedGenres = JSON.parse(localStorage.getItem('selectedGenres')) || [];
    state.selectedGenres = new Set(savedSelectedGenres);

    // ソート順を読み込み
    loadSortOrder();

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

                // モバイル縦画面（≤720px）では最初からUIを表示
                // タッチデバイスの横画面やタブレットでもUIを表示
                // デスクトップ（非タッチ）のみUIを非表示にして、マウス移動で表示
                const isPortraitMobile = window.innerWidth <= 720;
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
                }
                if (aboutButton) {
                    aboutButton.style.visibility = 'visible';
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

        // ボタンのクリックイベント
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
