const gameConfig = {
    baseWidth: 480,                           // Largura base para proporção 9:16
    baseHeight: 853,                          // Altura base para proporção 9:16
    birdWidth: 2.1,                           // Largura do pássaro 2.2
    birdHeight: 2.1,                          // Altura do pássaro 2.2
    gravity: 1,                               // Gravidade
    gravityScale: 0.07,                       // Fator de escala da gravidade
    lift: -1.15,                              // Distância avanço 
    liftScale: 3,                             // Fator de escala da força de subida
    birdRotationUp: -Math.PI / 8,             // Rotação máxima ao subir (-30 graus)
    birdRotationDown: Math.PI / 2,            // Rotação máxima ao cair (90 graus)
    birdRotationUpSpeed: 0.005,               // Velocidade de rotação ao subir
    birdRotationDownSpeed: 0.01,              // Velocidade de rotação ao cair
    pipeTopHeight: 50,                        // Altura do topo do cano
    pipeTopWidth: 2.1,                        // Largura do topo do cano (novo)
    pipeWidth: 1.85,                          // Largura do corpo do cano (novo)
    obstacleSpeed: 1,                         // Velocidade dos obstáculos
    gap: 2,                                   // Espaço entre obstáculos
    obstacleFrequency: 0.92,                  // Frequência de obstáculos (frames)
    birdStartX: 100,                          // Posição inicial X do pássaro
    birdStartY: 280,                          // Posição inicial Y do pássaro
    backgroundSpeed: 0.1,                     // Pixels de deslocamento do background
    groundSpeed: 1.499,                       // Pixels de deslocamento do chão
    startScreenSpacer: 30,                    // Espaçador do do bottom (startScreen)
    highestScoreColor: 'red',                 // Cor do Highest Score (startScreen)
    highestScoreFont: '2.3px DemonSker',      // Fonte base do Highest Score
    highestScoreFontSize: '40px',             // Fonte base do Highest Score (startScreen)
    scoreColor: 'red',                        // Cor do score (canvas)
    scoreFont: '2.3px DemonSker',             // Fonte base do score (scaleFactor)
    pauseMessageColor: 'red',                 // Cor da mensagem "Press to Play!" (canvas)
    pauseMessageFont: '1px DemonSker'         // Fonte "Press to Play!" (canvas)
};

// Images
const startBackgroundUrl = '../img/backgroundstartgame.png';
const gameOverBackgroundUrl = '../img/backgroundgameover.png';
const settingsBackgroundUrl = '../img/backgroundsettings.png';
const startButtonUrl = '../img/startbutton.png';
const retryButtonUrl = '../img/retrybutton.png';
const closeButtonUrl = '../img/closebutton.png';
const gameOverImageUrl = '../img/gameover.png';
const themeImageUrl = '../img/theme.png';
const theme1ImageUrl = '../img/theme1.png';
const theme2ImageUrl = '../img/theme2.png';

// SFX
const startSound = new Audio('../sfx/start.wav');
const hitSound = new Audio('../sfx/hit.wav');
const wingSound = new Audio('../sfx/wing.wav');
const pointSound = new Audio('../sfx/point.wav');
const wastedSound = new Audio('../sfx/wasted.wav');
const introMusic = new Audio('../sfx/intro.mp3');
introMusic.loop = true;

function fadeOutMusic(audio, duration = 1000) {
    let volume = audio.volume;
    const fadeStep = volume / (duration / 50);
    const fadeInterval = setInterval(() => {
        volume -= fadeStep;
        if (volume <= 0) {
            audio.pause();
            audio.volume = 1;
            clearInterval(fadeInterval);
        } else {
            audio.volume = volume;
        }
    }, 50);
}

// Themes
const themes = {
    theme1: {
        birdImageUrl: '../img/bird.png',
        pipeTopImageUrl: '../img/pipetop.png',
        pipeImageUrl: '../img/pipe.png',
        groundImageUrl: '../img/ground.png',
        backgroundImageUrl: '../img/background.png'
    },
    theme2: {
        birdImageUrl: '../img/bird1.png',
        pipeTopImageUrl: '../img/pipetop1.png',
        pipeImageUrl: '../img/pipe1.png',
        groundImageUrl: '../img/ground1.png',
        backgroundImageUrl: '../img/background1.png'
    },
    theme3: {
        birdImageUrl: '../img/bird2.png',
        pipeTopImageUrl: '../img/pipetop2.png',
        pipeImageUrl: '../img/pipe2.png',
        groundImageUrl: '../img/ground2.png',
        backgroundImageUrl: '../img/background2.png'
    }
};

// Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Ajustar canvas para proporção 9:16 independente da resolução
function adjustCanvas() {
    const aspectRatio = 9 / 16;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    canvas.width = gameConfig.baseWidth;
    canvas.height = gameConfig.baseHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - width) / 2}px`;
    canvas.style.top = `${(window.innerHeight - height) / 2}px`;
}
adjustCanvas();
window.addEventListener('resize', adjustCanvas);

const scaleFactor = canvas.width / gameConfig.baseWidth;
let bird = {
    x: gameConfig.birdStartX * scaleFactor,
    y: gameConfig.birdStartY * scaleFactor,
    width: gameConfig.birdWidth * scaleFactor * 40,
    height: gameConfig.birdHeight * scaleFactor * 40,
    velocity: 0,
    rotation: 0
};

let obstacles = [];
let frame = 0;
let gameStarted = false;
let isPaused = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let showPauseMessage = true;

// load
const birdImage = new Image();
const pipeTopImage = new Image();
const pipeImage = new Image();
const groundImage = new Image();
const backgroundImage = new Image();
const startBackground = new Image();
const gameOverBackground = new Image();
let currentTheme = 'theme1'; // Tema padrão

function loadTheme(themeName) {
    currentTheme = themeName;
    birdImage.src = themes[themeName].birdImageUrl;
    pipeTopImage.src = themes[themeName].pipeTopImageUrl;
    pipeImage.src = themes[themeName].pipeImageUrl;
    groundImage.src = themes[themeName].groundImageUrl;
    backgroundImage.src = themes[themeName].backgroundImageUrl;
}
loadTheme(currentTheme); // Carrega o tema inicial
startBackground.src = startBackgroundUrl;
gameOverBackground.src = gameOverBackgroundUrl;

function updateScreenDimensions(screen) {
    const aspectRatio = 9 / 16;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    screen.style.width = `${width}px`;
    screen.style.height = `${height}px`;
    screen.style.left = `${(window.innerWidth - width) / 2}px`;
    screen.style.top = `${(window.innerHeight - height) / 2}px`;
}

function createScreen(id, background, elements) {
    const screen = document.createElement('div');
    const aspectRatio = 9 / 16;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    screen.width = gameConfig.baseWidth;
    screen.height = gameConfig.baseHeight;
    screen.style.width = `${width}px`;
    screen.style.height = `${height}px`;
    screen.style.position = 'absolute';
    screen.style.left = `${(window.innerWidth - width) / 2}px`;
    screen.style.top = `${(window.innerHeight - height) / 2}px`;
    screen.id = id;
    screen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    screen.style.backdropFilter = 'blur(5px)';
    screen.style.background = `url(${background}) no-repeat center center, rgba(0, 0, 0, 0.8)`;
    screen.style.backgroundSize = 'cover';
    screen.style.display = 'none';
    screen.style.flexDirection = 'column';
    screen.style.justifyContent = 'center';
    screen.style.alignItems = 'center';
    screen.style.color = '#fff';
    screen.style.fontFamily = 'DemonSker';

    elements.forEach(el => {
        const element = document.createElement(el.tag);
        if (el.tag === 'img') {
            element.src = el.src;
            element.style.width = `${el.fontSize * scaleFactor * 50}px`;
            element.style.height = 'auto';
        } else if (el.id === 'gameOverSprite') { 
            const frameWidth = 200 * scaleFactor;
            const frameHeight = 100 * scaleFactor;
            const totalFrames = 20;
            element.style.width = `${frameWidth}px`;
            element.style.height = `${frameHeight}px`;
            element.style.backgroundImage = `url(${gameOverImageUrl})`;
            element.style.backgroundSize = `${frameWidth * totalFrames}px ${frameHeight}px`;
            element.style.backgroundPosition = '0px 0px';
            element.style.backgroundRepeat = 'no-repeat';
            element.dataset.frameWidth = frameWidth;
            element.dataset.totalFrames = totalFrames;
            element.dataset.currentFrame = 0;
        }
        else {
            element.textContent = el.text;
            element.style.fontSize = `${el.fontSize * scaleFactor * 20}px`;
        }
        element.style.margin = `${10 * scaleFactor}px`;
        if (el.id) element.id = el.id;
        
        if (el.tag === 'button') {
            element.style.padding = `${1 * scaleFactor}rem ${2 * scaleFactor}rem`;
            element.style.border = 'none';
            element.style.borderRadius = `${10 * scaleFactor}px`;
            element.style.cursor = 'pointer';
            element.style.backgroundColor = el.bgColor || 'transparent'; // Permite botões sem fundo
            element.style.color = '#fff';
            element.style.boxShadow = `0 ${5 * scaleFactor}px ${10 * scaleFactor}px rgba(0, 0, 0, 0.3)`;
            element.style.transition = 'transform 1s';
            element.addEventListener('mouseover', () => element.style.transform = `scale(1.35)`);
            element.addEventListener('mouseout', () => element.style.transform = `scale(1)`);
        }
        
        if (el.tag === 'highestScore') {
            element.style.overflow = 'visible';
            element.style.marginBottom = `${parseInt(gameConfig.startScreenMarginBottom) * scaleFactor}px`; // Ajustado dinamicamente
            element.style.color = gameConfig.highestScoreColor;
            element.style.fontFamily = gameConfig.highestScoreFont;
            element.style.fontSize = `${parseInt(gameConfig.highestScoreFontSize) * scaleFactor}px`; // Ajustado dinamicamente
        }
        
        screen.appendChild(element);
    });

    document.body.appendChild(screen);

    function updateScreenElements() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        let adjustedWidth = newWidth;
        let adjustedHeight = newHeight;
        const aspectRatio = 9 / 16;
        if (newWidth / newHeight > aspectRatio) {
            adjustedWidth = newHeight * aspectRatio;
        } else {
            adjustedHeight = newWidth / aspectRatio;
        }
        const newScaleFactor = adjustedWidth / gameConfig.baseWidth;
    
        screen.style.width = `${adjustedWidth}px`;
        screen.style.height = `${adjustedHeight}px`;
        screen.style.left = `${(newWidth - adjustedWidth) / 2}px`;
        screen.style.top = `${(newHeight - adjustedHeight) / 2}px`;
    
        elements.forEach((el, index) => {
            const element = screen.children[index];
            if (el.tag === 'img') {
                element.style.width = `${el.fontSize * newScaleFactor * 50}px`;
            } else if (el.id === 'gameOverSprite') {
                const frameWidth = 200 * newScaleFactor;
                const frameHeight = 100 * newScaleFactor;
                const totalFrames = 20;
                element.style.width = `${frameWidth}px`;
                element.style.height = `${frameHeight}px`;
                element.style.backgroundSize = `${frameWidth * totalFrames}px ${frameHeight}px`;
                const currentFrame = parseInt(element.dataset.currentFrame) || 0;
                element.style.backgroundPosition = `-${currentFrame * frameWidth}px 0px`;
                element.dataset.frameWidth = frameWidth;
            } else {
                element.style.fontSize = `${el.fontSize * newScaleFactor * 20}px`;
            }
            element.style.margin = `${10 * newScaleFactor}px`;
            if (el.tag === 'button') {
                element.style.padding = `${1 * newScaleFactor}rem ${2 * newScaleFactor}rem`;
                element.style.borderRadius = `${10 * newScaleFactor}px`;
                element.style.boxShadow = `none`;
                if (el.id === 'startButton') {
                    updateStartButtonSize(newScaleFactor);
                }
            }
            if (el.tag === 'highestScore') {
                element.style.marginBottom = `${parseInt(gameConfig.startScreenMarginBottom) * newScaleFactor}px`;
                element.style.fontSize = `${parseInt(gameConfig.highestScoreFontSize) * newScaleFactor}px`;
            }
        });
    }

    window.addEventListener('resize', updateScreenElements);

    return screen;
}

function calculateScaleFactor() {
    const aspectRatio = 9 / 16;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    return width / gameConfig.baseWidth;
}

// startScreen
const startScreen = createScreen('startScreen', startBackgroundUrl, [
    { tag: 'button', fontSize: 1.2, fontFamily: 'DemonSker', id: 'startButton', },
    { tag: 'highestScore', text: `Highest Score: ${highScore}`, fontSize: 1.2, id: 'highScore', },
    { tag: 'div', id: 'bottomSpacer' },

]);
startScreen.style.display = 'flex';
startScreen.style.flexDirection = 'column';
startScreen.style.justifyContent = 'flex-end';
startScreen.style.alignItems = 'center';
introMusic.play();

// settingsButton
const settingsButton = document.createElement('button');
settingsButton.textContent = '⚙️';
settingsButton.style.position = 'absolute';
settingsButton.style.top = `${10 * scaleFactor}px`;
settingsButton.style.right = `${20 * scaleFactor}px`;
settingsButton.style.width = `${50 * scaleFactor}px`;
settingsButton.style.height = `${50 * scaleFactor}px`;
settingsButton.style.border = 'none';
settingsButton.style.backgroundColor = 'transparent';
settingsButton.style.borderRadius = '50%';
settingsButton.style.fontSize = `${100 * scaleFactor}px`;
settingsButton.style.transition = 'transform 1s';
settingsButton.style.textShadow = '0 0 10px #ff0000, 0 0 1px #ff0000';
startScreen.appendChild(settingsButton);

settingsButton.addEventListener('mouseover', () => settingsButton.style.transform = `scale(1.35)`);
settingsButton.addEventListener('mouseout', () => settingsButton.style.transform = `scale(1)`);

// SettingsScreen
const settingsScreen = createScreen('settingsScreen', settingsBackgroundUrl, [
    { tag: 'h1', text: 'Settings', fontSize: 2.0, id: 'settingsTitle' },
    { tag: 'h2', text: 'Themes', fontSize: 1.5, id: 'themesSubtitle' },
    { tag: 'img', src: themeImageUrl, fontSize: 1.5, id: 'theme1Button' },
    { tag: 'img', src: theme1ImageUrl, fontSize: 1.5, id: 'theme2Button' },
    { tag: 'img', src: theme2ImageUrl, fontSize: 1.5, id: 'theme3Button' }
]);
settingsScreen.style.background = `url(${settingsBackgroundUrl}) no-repeat center center / cover, rgba(0, 0, 0, 0.8)`;
settingsScreen.style.display = 'none';
settingsScreen.style.flexDirection = 'column';
settingsScreen.style.justifyContent = 'flex-start';
settingsScreen.style.alignItems = 'center';
settingsScreen.style.paddingTop = `${20 * scaleFactor}px`;

const contentContainer = document.createElement('div');
contentContainer.style.display = 'flex';
contentContainer.style.flexDirection = 'column';
contentContainer.style.alignItems = 'center';
contentContainer.style.justifyContent = 'center';
contentContainer.style.flexGrow = '1';

const themesContainer = document.createElement('div');
themesContainer.style.display = 'flex';
themesContainer.style.flexDirection = 'row';
themesContainer.style.justifyContent = 'center';
themesContainer.style.gap = `${20 * scaleFactor}px`;

const themesSubtitle = document.getElementById('themesSubtitle');
settingsScreen.removeChild(themesSubtitle);
contentContainer.appendChild(themesSubtitle);

const themeButtons = [
    document.getElementById('theme1Button'),
    document.getElementById('theme2Button'),
    document.getElementById('theme3Button')
];
themeButtons.forEach(button => {
    settingsScreen.removeChild(button);
    themesContainer.appendChild(button);
});
contentContainer.appendChild(themesContainer);
settingsScreen.appendChild(contentContainer);

const settingsTitle = document.getElementById('settingsTitle');
settingsTitle.style.fontFamily = 'DemonSker';
settingsTitle.style.color = 'red';
settingsTitle.style.marginBottom = `${10 * scaleFactor}px`;
settingsTitle.style.position = 'relative';
themesSubtitle.style.fontFamily = 'DemonSker';
themesSubtitle.style.color = '#fff';
themesSubtitle.style.marginBottom = `${15 * scaleFactor}px`;

const settingsCloseButton = document.createElement('button');
settingsCloseButton.textContent = 'X';
settingsCloseButton.style.position = 'absolute';
settingsCloseButton.style.top = `${5 * scaleFactor}px`;
settingsCloseButton.style.left = `${5 * scaleFactor}px`;
settingsCloseButton.style.fontFamily = 'DemonSker';
settingsCloseButton.style.backgroundColor = '#2b2b2b';
settingsCloseButton.style.color = '#ff4444'; 
settingsCloseButton.style.border = `${2 * scaleFactor}px solid #4a2c2a`;
settingsCloseButton.style.borderRadius = `${50 * scaleFactor}px`;
settingsCloseButton.style.padding = `${0.8 * scaleFactor}rem ${1.5 * scaleFactor}rem`;
settingsCloseButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${3 * scaleFactor}px ${6 * scaleFactor}px rgba(0, 0, 0, 0.8)`;
settingsCloseButton.style.textShadow = `${1 * scaleFactor}px ${1 * scaleFactor}px ${2 * scaleFactor}px #000`;
settingsCloseButton.style.backgroundImage = 'linear-gradient(to bottom, rgba(255, 68, 68, 0.1), rgba(0, 0, 0, 0.5))';
settingsCloseButton.style.transition = 'transform 1s, box-shadow 1s';
settingsCloseButton.style.display = 'flex';
settingsCloseButton.style.justifyContent = 'center';
settingsCloseButton.style.alignItems = 'center';
settingsCloseButton.style.fontSize = `${20 * scaleFactor}px`;
settingsCloseButton.addEventListener('mouseover', () => {
    settingsCloseButton.style.transform = `scale(1.1)`;
    settingsCloseButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${5 * scaleFactor}px ${8 * scaleFactor}px rgba(255, 68, 68, 0.5)`;
});
settingsCloseButton.addEventListener('mouseout', () => {
    settingsCloseButton.style.transform = `scale(1)`;
    settingsCloseButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${3 * scaleFactor}px ${6 * scaleFactor}px rgba(0, 0, 0, 0.8)`;
});
settingsScreen.appendChild(settingsCloseButton);

document.getElementById('theme1Button').addEventListener('click', () => {
    loadTheme('theme1');
    settingsScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});
document.getElementById('theme2Button').addEventListener('click', () => {
    loadTheme('theme2');
    settingsScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});
document.getElementById('theme3Button').addEventListener('click', () => {
    loadTheme('theme3');
    settingsScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

settingsButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    settingsScreen.style.display = 'flex';
});
settingsCloseButton.addEventListener('click', () => {
    settingsScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

function updateAllScreens() {
    const currentScaleFactor = calculateScaleFactor();
    const screens = [startScreen, gameOverScreen, settingsScreen];

    screens.forEach(screen => {
        const elements = screen.children;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.id === 'startButton') {
                updateStartButtonSize(currentScaleFactor);
            } else if (element.id === 'gameOverSprite') {
                const frameWidth = 200 * currentScaleFactor;
                const frameHeight = 100 * currentScaleFactor;
                const totalFrames = 20;
                element.style.width = `${frameWidth}px`;
                element.style.height = `${frameHeight}px`;
                element.style.backgroundSize = `${frameWidth * totalFrames}px ${frameHeight}px`;
                const currentFrame = parseInt(element.dataset.currentFrame) || 0;
                element.style.backgroundPosition = `-${currentFrame * frameWidth}px 0px`;
                element.dataset.frameWidth = frameWidth;
            } else if (element.tagName === 'P' || element.tagName === 'BUTTON') {
                const baseFontSize = element.id === 'currentScore' || element.id === 'gameOverHighScore' || element.id === 'retryButton' ? 1.2 : 1.2;
                element.style.fontSize = `${baseFontSize * currentScaleFactor * 20}px`;
            } else if (element.id === 'highScore') {
                element.style.fontSize = `${parseInt(gameConfig.highestScoreFontSize) * currentScaleFactor}px`;
            } else if (element.id === 'bottomSpacer') {
                element.style.height = `${gameConfig.startScreenSpacer * currentScaleFactor}px`;
            } else if (element.id === 'theme1Button' || element.id === 'theme2Button' || element.id === 'theme3Button') {
                element.style.width = `${1.5 * currentScaleFactor * 50}px`;
                element.style.height = 'auto';
            }
            element.style.margin = `${10 * currentScaleFactor}px`;
        }
        const aspectRatio = 9 / 16;
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        screen.style.width = `${width}px`;
        screen.style.height = `${height}px`;
        screen.style.left = `${(window.innerWidth - width) / 2}px`;
        screen.style.top = `${(window.innerHeight - height) / 2}px`;
    });

    // closeButton and settingsButton
    closeButton.style.top = `${5 * currentScaleFactor}px`;
    closeButton.style.left = `${5 * currentScaleFactor}px`;
    closeButton.style.width = `${50 * currentScaleFactor}px`;
    closeButton.style.height = `${50 * currentScaleFactor}px`;
    closeButton.style.fontSize = `${40 * currentScaleFactor}px`;
    settingsButton.style.width = `${70 * currentScaleFactor}px`;
    settingsButton.style.height = `${70 * currentScaleFactor}px`;
    settingsButton.style.fontSize = `${60 * currentScaleFactor}px`;
    settingsCloseButton.style.top = `${5 * currentScaleFactor}px`;
    settingsCloseButton.style.left = `${5 * currentScaleFactor}px`;
    settingsCloseButton.style.width = `${50 * currentScaleFactor}px`;
    settingsCloseButton.style.height = `${50 * currentScaleFactor}px`;
    settingsCloseButton.style.fontSize = `${40 * currentScaleFactor}px`;
}

// startButton
const startButton = document.getElementById('startButton');
let frameWidthstartButton = 200 * scaleFactor;
let frameHeightstartButton = 100 * scaleFactor;
const totalFramesstartButton = 20;
let currentFramestartButton = 0;

function updateStartButtonSize(newScaleFactor) {
    frameWidthstartButton = 200 * newScaleFactor;
    frameHeightstartButton = 100 * newScaleFactor;
    startButton.style.height = `${frameHeightstartButton}px`;
    startButton.style.width = `${frameWidthstartButton}px`;
    startButton.style.backgroundSize = `${frameWidthstartButton * totalFramesstartButton}px ${frameHeightstartButton}px`;
}

startButton.style.backgroundImage = `url(${startButtonUrl})`;
startButton.style.backgroundPosition = '0px 0px';
startButton.style.backgroundColor = 'transparent';
startButton.style.border = 'none';
startButton.style.boxShadow = 'none';

// Tela de Game Over com botão X
const gameOverScreen = createScreen('gameOverScreen', gameOverBackgroundUrl, [
    { tag: 'div', id: 'gameOverSprite', fontSize: 2.5 },
    { tag: 'p', text: 'Score: 0', fontSize: 1.2, id: 'currentScore' },
    { tag: 'p', text: `Highest Score: ${highScore}`, fontSize: 1.2, id: 'gameOverHighScore' },
    { tag: 'button', text: 'Retry', fontSize: 2, id: 'retryButton', bgColor: '#f44336' },
]);


const retryButton = document.getElementById('retryButton');
retryButton.style.fontFamily = 'DemonSker';
retryButton.style.backgroundColor = '#2b2b2b';
retryButton.style.color = 'red';
retryButton.style.border = `${2 * scaleFactor}px solid #4a2c2a`;
retryButton.style.borderRadius = `${5 * scaleFactor}px`;
retryButton.style.padding = `${0.8 * scaleFactor}rem ${1.5 * scaleFactor}rem`;
retryButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${3 * scaleFactor}px ${6 * scaleFactor}px rgba(0, 0, 0, 0.8)`;
retryButton.style.textShadow = `${1 * scaleFactor}px ${1 * scaleFactor}px ${2 * scaleFactor}px #000`;
retryButton.style.backgroundImage = 'linear-gradient(to bottom, rgba(113, 34, 34, 0.65), rgba(21, 18, 18, 0.5))';
retryButton.style.transition = 'transform 1s, box-shadow 1s'; 
retryButton.addEventListener('mouseover', () => {
    retryButton.style.transform = `scale(1.1)`;
    retryButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${5 * scaleFactor}px ${8 * scaleFactor}px rgba(255, 68, 68, 0.5)`;
});
retryButton.addEventListener('mouseout', () => {
    retryButton.style.transform = `scale(1)`;
    retryButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${3 * scaleFactor}px ${6 * scaleFactor}px rgba(0, 0, 0, 0.8)`;
});
const closeButton = document.createElement('button');
closeButton.textContent = 'X';
closeButton.style.position = 'absolute';
closeButton.style.fontFamily = 'DemonSker';
closeButton.style.backgroundColor = '#2b2b2b';
closeButton.style.color = '#ff4444';
closeButton.style.border = `${2 * scaleFactor}px solid #4a2c2a`;
closeButton.style.borderRadius = `${50 * scaleFactor}px`;
closeButton.style.padding = `${0.8 * scaleFactor}rem ${1.5 * scaleFactor}rem`;
closeButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${3 * scaleFactor}px ${6 * scaleFactor}px rgba(0, 0, 0, 0.8)`;
closeButton.style.textShadow = `${1 * scaleFactor}px ${1 * scaleFactor}px ${2 * scaleFactor}px #000`;
closeButton.style.backgroundImage = 'linear-gradient(to bottom, rgba(255, 68, 68, 0.1), rgba(0, 0, 0, 0.5))';
closeButton.style.transition = 'transform 1s, box-shadow 1s';
closeButton.style.display = 'flex';
closeButton.style.justifyContent = 'center';
closeButton.style.alignItems = 'center';
closeButton.addEventListener('mouseover', () => {
    closeButton.style.transform = `scale(1.1)`;
    closeButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${5 * scaleFactor}px ${8 * scaleFactor}px rgba(255, 68, 68, 0.5)`;
});
closeButton.addEventListener('mouseout', () => {
    closeButton.style.transform = `scale(1)`;
    closeButton.style.boxShadow = `inset 0 ${2 * scaleFactor}px ${5 * scaleFactor}px rgba(0, 0, 0, 0.6), 0 ${3 * scaleFactor}px ${6 * scaleFactor}px rgba(0, 0, 0, 0.8)`;
});
gameOverScreen.appendChild(closeButton);

updateAllScreens();

// startButton animation
function animateSpritestartButton() {
    startButton.style.backgroundPosition = `-${currentFramestartButton * frameWidthstartButton}px 0px`;
    currentFramestartButton = (currentFramestartButton + 1) % totalFramesstartButton;
}

const intervalstartButton = setInterval(animateSpritestartButton, 1000 / 10);

window.addEventListener('load', updateAllScreens);
window.addEventListener('resize', updateAllScreens);

function drawGround() {
    const groundHeight = canvas.height * 0.25;
    groundX = groundX % canvas.width;
    ctx.drawImage(groundImage, groundX, canvas.height - groundHeight, canvas.width, groundHeight);
    ctx.drawImage(groundImage, groundX + canvas.width - 1, canvas.height - groundHeight, canvas.width, groundHeight);
}
let backgroundX = 0;
let groundX = 0;

function drawBackground() {
    backgroundX = backgroundX % canvas.width;
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, backgroundX + canvas.width - 1, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(birdImage, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
}

function updateBird() {
    bird.velocity += gameConfig.gravity * scaleFactor * gameConfig.gravityScale;
    bird.y += bird.velocity;
    if (bird.velocity < 0) {
        bird.rotation = Math.max(bird.rotation - gameConfig.birdRotationUpSpeed, gameConfig.birdRotationUp);
    } else {
        bird.rotation = Math.min(bird.rotation + gameConfig.birdRotationDownSpeed, gameConfig.birdRotationDown);
    }
    const groundHeight = canvas.height * 0.25;
    const groundY = canvas.height - groundHeight; 
    if (bird.y + bird.height > groundY || bird.y < 0) {
        endGame();
    }
}

// Press movement
canvas.addEventListener('click', () => {
    if (gameStarted) {
        if (isPaused) {
            isPaused = false;
            wingSound.pause();
            wingSound.currentTime = 0;
            wingSound.play();
        } else {
            wingSound.pause();
            wingSound.currentTime = 0;
            wingSound.play();
            bird.velocity = gameConfig.lift * scaleFactor * gameConfig.liftScale;
            bird.rotation = gameConfig.birdRotationUp;
        }
    }
});

function createObstacles() {
    if (frame % (gameConfig.obstacleFrequency * 300) === 0) {
        const groundHeight = canvas.height * 0.25;
        const playableHeight = canvas.height - groundHeight - (gameConfig.gap * scaleFactor * 100);
        const height = Math.floor(Math.random() * playableHeight);
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: gameConfig.pipeWidth * scaleFactor * 50,
            height: height,
            passed: false
        });
    }
}

function updateObstacles() {
    const pipeTopHeight = gameConfig.pipeTopHeight;
    const offsetX = (gameConfig.pipeTopWidth - gameConfig.pipeWidth) * scaleFactor * 50 / 2;

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameConfig.obstacleSpeed * scaleFactor * 1.5;
        ctx.save();
        ctx.translate(obstacles[i].x + gameConfig.pipeTopWidth * scaleFactor * 50 / 2, obstacles[i].height);
        ctx.rotate(Math.PI);
        ctx.drawImage(
            pipeTopImage,
            -gameConfig.pipeTopWidth * scaleFactor * 50 / 2,
            0,
            gameConfig.pipeTopWidth * scaleFactor * 50,
            pipeTopHeight
        );
        if (obstacles[i].height > pipeTopHeight) {
            ctx.drawImage(
                pipeImage,
                -gameConfig.pipeWidth * scaleFactor * 50 / 2,
                pipeTopHeight,
                gameConfig.pipeWidth * scaleFactor * 50,
                obstacles[i].height - pipeTopHeight
            );
        }
        ctx.restore();
        const groundHeight = canvas.height * 0.25;
        const groundY = canvas.height - groundHeight; 
        const bottomPipeY = obstacles[i].height + gameConfig.gap * scaleFactor * 100; 
        const bottomPipeHeight = groundY - bottomPipeY; 
        if (bottomPipeHeight > 0) {
            ctx.drawImage(
                pipeTopImage,
                obstacles[i].x,
                bottomPipeY,
                gameConfig.pipeTopWidth * scaleFactor * 50,
                pipeTopHeight
            );
            if (bottomPipeHeight > pipeTopHeight) {
                ctx.drawImage(
                    pipeImage,
                    obstacles[i].x + offsetX,
                    bottomPipeY + pipeTopHeight,
                    gameConfig.pipeWidth * scaleFactor * 50,
                    bottomPipeHeight - pipeTopHeight
                );
            }
        }
    }
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    const birdRadius = bird.width / 2;
    const birdCircle = {
        x: bird.x + bird.width / 2,
        y: bird.y + bird.height / 2,
        radius: birdRadius
    };
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        const pipeTopRect = { 
            x: obs.x, 
            y: obs.y, 
            width: obs.width, 
            height: obs.height 
        };
        const pipeBottomRect = { 
            x: obs.x, 
            y: obs.height + gameConfig.gap * scaleFactor * 100, 
            width: obs.width, 
            height: canvas.height - obs.height - gameConfig.gap * scaleFactor * 100 
        };
        if (circleRectIntersect(birdCircle, pipeTopRect) || circleRectIntersect(birdCircle, pipeBottomRect)) {
            return true;
        }
    }
    return false;
}

function circleRectIntersect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared <= (circle.radius * circle.radius);
}

function checkPassObstacle() {
    for (let i = 0; i < obstacles.length; i++) {

        let birdCenter = bird.x + (bird.width / 2);
        if (birdCenter > obstacles[i].x + obstacles[i].width && !obstacles[i].passed) {
            obstacles[i].passed = true;
            score++;
            pointSound.play(); 
            return true;
        }
    }
    return false;
}

function drawScore() {
    ctx.font = `${parseInt(gameConfig.scoreFont) * scaleFactor * 24}px DemonSker`;
    ctx.fillStyle = gameConfig.scoreColor;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10 * scaleFactor, 50 * scaleFactor);
}

function drawPauseMessage() {
    if (isPaused && showPauseMessage) {
        ctx.font = `${parseInt(gameConfig.pauseMessageFont) * scaleFactor * 30}px DemonSker`;
        ctx.fillStyle = gameConfig.pauseMessageColor;
        ctx.textAlign = 'center';
        ctx.fillText('Press to Play!', canvas.width / 2, canvas.height / 4);
    }
}
setInterval(() => {
    if (isPaused) showPauseMessage = !showPauseMessage;
}, 500);

function update() {
    if (!gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBird();
    updateObstacles();
    drawGround();
    drawScore();

    if (isPaused) {
        drawPauseMessage();
    } else {
        backgroundX -= gameConfig.backgroundSpeed * scaleFactor;
        groundX -= gameConfig.groundSpeed * scaleFactor;
        frame++;
        updateBird();
        createObstacles();
        checkPassObstacle();
        if (checkCollision()) {
            endGame();
        }
    }
    requestAnimationFrame(update);
}

function startGame() {
    startScreen.style.display = 'none';
    fadeOutMusic(introMusic);
    resetGame();
    update();
}

function endGame() {
    gameStarted = false;
    isPaused = false;
    hitSound.pause();
    hitSound.currentTime = 0;
    hitSound.play();
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    fadeOutMusic(introMusic);
    const gameStateImage = canvas.toDataURL('image/png');
    setTimeout(() => {
        wastedSound.pause();
        wastedSound.currentTime = 0;
        wastedSound.play();
    }, 100);
    let backgroundImageElement = document.getElementById('gameOverBackgroundImage');
    if (!backgroundImageElement) {
        backgroundImageElement = document.createElement('img');
        backgroundImageElement.id = 'gameOverBackgroundImage';
        backgroundImageElement.style.position = 'absolute';
        backgroundImageElement.style.zIndex = '-1';
        backgroundImageElement.style.imageRendering = 'pixelated';
        document.body.appendChild(backgroundImageElement);

        function updateBackgroundSize() {
            updateScreenDimensions(backgroundImageElement);
        }

        window.addEventListener('resize', updateBackgroundSize);
    }
    backgroundImageElement.style.filter = 'none';
    backgroundImageElement.style.transition = 'none';
    backgroundImageElement.src = gameStateImage;

    updateScreenDimensions(backgroundImageElement);

    void backgroundImageElement.offsetWidth;

    backgroundImageElement.style.transition = 'filter 1.5s ease';
    backgroundImageElement.style.filter = 'grayscale(0%)';
    setTimeout(() => {
        backgroundImageElement.style.filter = 'grayscale(100%)';
    }, 100);

    // gameOverScreen
    gameOverScreen.style.background = 'none';
    document.getElementById('highScore').textContent = `Highest Score: ${highScore}`;
    document.getElementById('currentScore').textContent = `Score: ${score}`;
    document.getElementById('gameOverHighScore').textContent = `Highest Score: ${highScore}`;
    gameOverScreen.style.display = 'flex';
    closeButton.style.filter = 'none';
    document.getElementById('currentScore').style.filter = 'none';
    document.getElementById('gameOverHighScore').style.filter = 'none';
    document.getElementById('retryButton').style.filter = 'none';

    // GameOver Animation
    const gameOverSprite = document.getElementById('gameOverSprite');
    let frameWidth = parseFloat(gameOverSprite.dataset.frameWidth) || 200 * scaleFactor;
    const totalFrames = parseInt(gameOverSprite.dataset.totalFrames) || 20;
    let currentFrame = 0;

    function animateGameOver() {
        if (currentFrame < totalFrames - 1) {
            gameOverSprite.style.backgroundPosition = `-${currentFrame * frameWidth}px 0px`;
            currentFrame++;
            gameOverSprite.dataset.currentFrame = currentFrame;
        } else {
            gameOverSprite.style.backgroundPosition = `-${(totalFrames - 1) * frameWidth}px 0px`;
            gameOverSprite.dataset.currentFrame = totalFrames - 1;
            clearInterval(animationInterval);
        }
    }
    const animationInterval = setInterval(animateGameOver, 1000 / 10);

    closeButton.addEventListener('click', () => clearInterval(animationInterval), { once: true });
    document.getElementById('retryButton').addEventListener('click', () => {
        clearInterval(animationInterval);
        gameOverSprite.dataset.currentFrame = 0;
    }, { once: true });
}

function resetGame() {
    bird.y = gameConfig.birdStartY * scaleFactor,
    bird.velocity = 0;
    bird.rotation = 0;
    obstacles = [];
    frame = 0;
    score = 0;
    gameStarted = true;
    isPaused = true;
    gameOverScreen.style.display = 'none';
    const gameOverSprite = document.getElementById('gameOverSprite');
    gameOverSprite.style.backgroundPosition = '0px 0px';
    wastedSound.pause();
    wastedSound.currentTime = 0;
}

function returnToStart() {
    gameStarted = false;
    isPaused = false;
    bird.rotation = 0;
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

document.getElementById('startButton').addEventListener('click', () => {
    startSound.pause();
    startSound.currentTime = 0;
    startSound.play();
    startGame();
});

document.getElementById('retryButton').addEventListener('click', () => {
    startSound.pause();
    startSound.currentTime = 0;
    startSound.play();
    resetGame();
    update();
});

closeButton.addEventListener('click', () => {
    returnToStart();
    wastedSound.pause();
    wastedSound.currentTime = 0;
    introMusic.currentTime = 0;
    introMusic.play();
});

canvas.addEventListener('click', () => {
    if (gameStarted) {
        if (isPaused) {
            isPaused = false;
        } else {
            bird.velocity = gameConfig.lift * scaleFactor * 3;
        }
    }
});

requestAnimationFrame(update);