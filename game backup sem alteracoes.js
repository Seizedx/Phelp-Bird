// Configurações base do jogo (valores inteiros baseados em 1)
const gameConfig = {
    baseWidth: 480,          // Largura base para proporção 9:16
    baseHeight: 854,         // Altura base para proporção 9:16
    birdWidth: 2.4,            // Largura do pássaro 2.2 (proporcional)
    birdHeight: 2.4,           // Altura do pássaro 2.2(proporcional)
    gravity: 0.9,              // Gravidade
    lift: -1.05,                // Impulso para cima
    obstacleWidth: 2.1,        // Largura dos obstáculos
    obstacleSpeed: 1,        // Velocidade dos obstáculos
    gap: 2,                  // Espaço entre obstáculos
    obstacleFrequency: 1,    // Frequência de obstáculos (frames)
    birdStartX: 30,           // Posição inicial X do pássaro
    scoreColor: '#ff6200',   // Cor do score (laranja)
    scoreFont: '2.3px DemonSker',  // Fonte base do score (ajustada por scaleFactor)
    pauseMessageColor: '#fff', // Cor da mensagem "Press to Play"
    pauseMessageFont: '1px DemonSker' // Fonte da mensagem "Press to Play"
};

// URLs das imagens
const birdImageUrl = '../img/bird2.png';
const pipeImageUrl = '../img/pipe.png';
const backgroundImageUrl = '../img/background.png';
const startBackgroundUrl = '../img/backgroundstartgame.png';
const gameOverBackgroundUrl = '../img/backgroundgameover.png';
const startButtonUrl = '../img/startbutton.png';
const retryButtonUrl = '../img/retrybutton.png';
const closeButtonUrl = '../img/closebutton.png';
const gameOverImageUrl = '../img/gameover.png';

// Criar canvas dinamicamente
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

// Fator de escala baseado na resolução base
const scaleFactor = canvas.width / gameConfig.baseWidth;

// Variáveis do jogo ajustadas por scaleFactor
let bird = {
    x: gameConfig.birdStartX * scaleFactor,
    y: canvas.height / 2,
    width: gameConfig.birdWidth * scaleFactor * 40,
    height: gameConfig.birdHeight * scaleFactor * 40,
    velocity: 0,
};
let obstacles = [];
let frame = 0;
let gameStarted = false;
let isPaused = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let showPauseMessage = true;

// Carregar imagens
const birdImage = new Image();
const pipeImage = new Image();
const backgroundImage = new Image();
const startBackground = new Image();
const gameOverBackground = new Image();
birdImage.src = birdImageUrl;
pipeImage.src = pipeImageUrl;
backgroundImage.src = backgroundImageUrl;
startBackground.src = startBackgroundUrl;
gameOverBackground.src = gameOverBackgroundUrl;

// Função para criar telas estilizadas e centralizadas
function createScreen(id, background, elements) {
    const screen = document.createElement('div');
    screen.id = id;
    screen.style.display = 'flex';
    screen.style.flexDirection = 'row';
    screen.style.justifyContent = 'center';
    screen.style.alignItems = 'center';
    screen.style.width = '100%';
    screen.style.height = '100%';
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
    screen.style.borderRadius = `${20 * scaleFactor}px`;
    screen.style.boxShadow = `0 0 ${10 * scaleFactor}px rgba(255, 255, 255, 0.5)`;

    elements.forEach(el => {
        const element = document.createElement(el.tag);
        element.textContent = el.text;
        element.style.fontSize = `${el.fontSize * scaleFactor * 20}px`;
        element.style.margin = `${10 * scaleFactor}px`;
        if (el.id) element.id = el.id;
        if (el.tag === 'button') {
            element.style.padding = `${1 * scaleFactor}rem ${2 * scaleFactor}rem`;
            element.style.border = 'none';
            element.style.borderRadius = `${10 * scaleFactor}px`;
            element.style.cursor = 'pointer';
            element.style.backgroundColor = el.bgColor;
            element.style.color = '#fff';
            element.style.boxShadow = `0 ${5 * scaleFactor}px ${10 * scaleFactor}px rgba(0, 0, 0, 0.3)`;
            element.style.transition = 'transform 0.2s';
            element.addEventListener('mouseover', () => element.style.transform = `scale(1.05)`);
            element.addEventListener('mouseout', () => element.style.transform = `scale(1)`);
        }
        screen.appendChild(element);
    });
    document.body.appendChild(screen);
    return screen;
}

// Tela inicial
const startScreen = createScreen('startScreen', startBackgroundUrl, [
    { tag: 'button', text: 'Start Game', fontSize: 1.2, fontFamily: 'DemonSker', id: 'startButton', bgColor: '#4CAF50', },
    { tag: 'p', text: `Highest Score: ${highScore}`, fontSize: 1.2, id: 'highScore' },
]);
startScreen.style.display = 'flex';
startScreen.style.justifyContent = 'flex-end';
startScreen.style.alignItems = 'center';


// Tela de Game Over com botão X
const gameOverScreen = createScreen('gameOverScreen', gameOverBackgroundUrl, [
    { tag: 'h2', text: 'Game Over!', fontSize: 2.5 },
    { tag: 'p', text: 'Score: 0', fontSize: 1.2, id: 'currentScore' },
    { tag: 'p', text: `Highest Score: ${highScore}`, fontSize: 1.2, id: 'gameOverHighScore' },
    { tag: 'button', text: 'Retry', fontSize: 1.2, id: 'retryButton', bgColor: '#f44336' },
]);
const closeButton = document.createElement('button');
closeButton.textContent = 'X';
closeButton.style.position = 'absolute';
closeButton.style.top = `${5 * scaleFactor}px`;
closeButton.style.left = `${5 * scaleFactor}px`;
closeButton.style.width = `${30 * scaleFactor}px`;
closeButton.style.height = `${30 * scaleFactor}px`;
closeButton.style.backgroundColor = '#ff4444';
closeButton.style.color = '#fff';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '50%';
closeButton.style.cursor = 'pointer';
closeButton.style.fontSize = `${20 * scaleFactor}px`;
closeButton.style.display = 'flex';
closeButton.style.justifyContent = 'center';
closeButton.style.alignItems = 'center';
gameOverScreen.appendChild(closeButton);

// Função para desenhar o fundo
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Função para desenhar o pássaro
function drawBird() {
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

// Função para atualizar o pássaro
function updateBird() {
    bird.velocity += gameConfig.gravity * scaleFactor * 0.07;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

// Função para criar obstáculos
function createObstacles() {
    if (frame % (gameConfig.obstacleFrequency * 300) === 0) {
        const height = Math.floor(Math.random() * (canvas.height - gameConfig.gap * scaleFactor * 100));
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: gameConfig.obstacleWidth * scaleFactor * 50,
            height: height,
            passed: false
        });
    }
}

// Função para atualizar e desenhar obstáculos
function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameConfig.obstacleSpeed * scaleFactor * 1.5;

        ctx.save();
        ctx.translate(obstacles[i].x + obstacles[i].width / 2, obstacles[i].height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipeImage, -obstacles[i].width / 2, -obstacles[i].height / 2, obstacles[i].width, obstacles[i].height);
        ctx.restore();

        ctx.drawImage(pipeImage, obstacles[i].x, obstacles[i].height + gameConfig.gap * scaleFactor * 100, obstacles[i].width, canvas.height - obstacles[i].height - gameConfig.gap * scaleFactor * 100);
    }
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

// Função para verificar colisão
function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        const birdRect = { x: bird.x, y: bird.y, width: bird.width, height: bird.height };
        const pipeTopRect = { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
        const pipeBottomRect = { x: obs.x, y: obs.height + gameConfig.gap * scaleFactor * 100, width: obs.width, height: canvas.height - obs.height - gameConfig.gap * scaleFactor * 100 };

        if (rectIntersect(birdRect, pipeTopRect) || rectIntersect(birdRect, pipeBottomRect)) {
            return true;
        }
    }
    return false;
}

function rectIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Função para verificar passagem pelos obstáculos
function checkPassObstacle() {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x + obstacles[i].width < bird.x && !obstacles[i].passed) {
            obstacles[i].passed = true;
            score++;
            return true;
        }
    }
    return false;
}

// Função para desenhar o score
function drawScore() {
    ctx.font = `${parseInt(gameConfig.scoreFont) * scaleFactor * 24}px DemonSker`;
    ctx.fillStyle = gameConfig.scoreColor;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 10 * scaleFactor, 50 * scaleFactor);
}

// Função para desenhar a mensagem "Press to Play"
function drawPauseMessage() {
    if (isPaused && showPauseMessage) {
        ctx.font = `${parseInt(gameConfig.pauseMessageFont) * scaleFactor * 30}px DemonSker`;
        ctx.fillStyle = gameConfig.pauseMessageColor;
        ctx.textAlign = 'center';
        ctx.fillText('Press to Play!', canvas.width / 2, canvas.height / 2);
    }
}

// Piscar mensagem "Press to Play"
setInterval(() => {
    if (isPaused) showPauseMessage = !showPauseMessage;
}, 500);

// Função principal do jogo
function update() {
    if (!gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpar canvas mesmo quando parado
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBird();
    updateObstacles();
    drawScore();

    if (isPaused) {
        drawPauseMessage();
    } else {
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

// Função para iniciar o jogo
function startGame() {
    startScreen.style.display = 'none';
    resetGame();
    update(); // Garantir que o loop comece
}

// Função para terminar o jogo
function endGame() {
    gameStarted = false;
    isPaused = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('highScore').textContent = `Highest Score: ${highScore}`;
    document.getElementById('currentScore').textContent = `Score: ${score}`;
    document.getElementById('gameOverHighScore').textContent = `Highest Score: ${highScore}`;
    gameOverScreen.style.display = 'flex';
}

// Função para reiniciar o jogo com "Press to Play"
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    obstacles = [];
    frame = 0;
    score = 0;
    gameStarted = true;
    isPaused = true; // Sempre inicia pausado com "Press to Play"
    gameOverScreen.style.display = 'none';
}

// Função para voltar à tela inicial
function returnToStart() {
    gameStarted = false;
    isPaused = false;
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

// Eventos
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('retryButton').addEventListener('click', () => {
    resetGame();
    update(); // Reiniciar o loop explicitamente
});
closeButton.addEventListener('click', returnToStart);
canvas.addEventListener('click', () => {
    if (gameStarted) {
        if (isPaused) {
            isPaused = false;
        } else {
            bird.velocity = gameConfig.lift * scaleFactor * 3;
        }
    }
});

// Iniciar o loop para garantir que o canvas esteja limpo
requestAnimationFrame(update);