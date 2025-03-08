// Configurações base do jogo (valores inteiros baseados em 1)
const gameConfig = {
    baseWidth: 480,                           // Largura base para proporção 9:16
    baseHeight: 854,                          // Altura base para proporção 9:16
    birdWidth: 2.1,                           // Largura do pássaro 2.2
    birdHeight: 2.1,                          // Altura do pássaro 2.2
    gravity: 1,                               // Gravidade
    lift: -1.07,                              // Impulso para cima
    obstacleWidth: 2.1,                       // Largura dos obstáculos
    obstacleSpeed: 1,                         // Velocidade dos obstáculos
    gap: 2,                                   // Espaço entre obstáculos
    obstacleFrequency: 0.9,                   // Frequência de obstáculos (frames)
    birdStartX: 100,                          // Posição inicial X do pássaro
    birdStartY: 280,                          // Posição inicial Y do pássaro
    highestScoreColor: 'red',                 // Cor do Highest Score (startScreen)
    highestScoreFont: '2.3px DemonSker',      // Fonte base do Highest Score
    highestScoreFontSize: '40px',             // Fonte base do Highest Score (startScreen)
    startScreenMarginBottom: '150px',         // Margem inferior (startScreen)
    scoreColor: 'red',                        // Cor do score (canvas)
    scoreFont: '2.3px DemonSker',             // Fonte base do score (ajustada por scaleFactor)
    pauseMessageColor: 'red',                 // Cor da mensagem "Press to Play!" (canvas)
    pauseMessageFont: '1px DemonSker'        // Fonte da mensagem "Press to Play!" (canvas)
};

// URLs das imagens
const birdImageUrl = '../img/bird.png';
const pipeImageUrl = '../img/pipe.png';
const groundImageUrl = '../img/ground.png';
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
    y: gameConfig.birdStartY * scaleFactor,
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
const groundImage = new Image();
const backgroundImage = new Image();
const startBackground = new Image();
const gameOverBackground = new Image();
birdImage.src = birdImageUrl;
pipeImage.src = pipeImageUrl;
groundImage.src = groundImageUrl;
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
            element.style.transition = 'transform 1s';
            element.addEventListener('mouseover', () => element.style.transform = `scale(1.35)`);
            element.addEventListener('mouseout', () => element.style.transform = `scale(1)`);
        }
        if (el.id) element.id = el.id;
        if (el.tag === 'highestScore') {
            element.style.overflow = 'visible';
            element.style.marginBottom = gameConfig.startScreenMarginBottom;
            element.style.color = gameConfig.highestScoreColor;
            element.style.fontFamily = gameConfig.highestScoreFont;
            element.style.fontSize = gameConfig.highestScoreFontSize;
        }
        screen.appendChild(element);
    });
    document.body.appendChild(screen);
    return screen;
}

// Tela inicial
const startScreen = createScreen('startScreen', startBackgroundUrl, [
    { tag: 'button', fontSize: 1.2, fontFamily: 'DemonSker', id: 'startButton', },
    { tag: 'highestScore', text: `Highest Score: ${highScore}`, fontSize: 1.2, id: 'highScore', },
]);
startScreen.style.display = 'flex';
startScreen.style.justifyContent = 'flex-end';
startScreen.style.alignItems = 'center';

const startButton = document.getElementById('startButton');
const frameWidthstartButton = 200; // Largura de cada frame no spritesheet
const frameHeightstartButton = 100; // Altura de cada frame no spritesheet
const totalFramesstartButton = 20; // Número total de frames no spritesheet
let currentFramestartButton = 0; // Frame atual

startButton.style.height = `${frameHeightstartButton}px`;
startButton.style.width = `${frameWidthstartButton}px`;
startButton.style.backgroundImage = `url(${startButtonUrl})`;
startButton.style.backgroundSize = `${frameWidthstartButton * totalFramesstartButton}px ${frameHeightstartButton}px`; // Tamanho total do spritesheet
startButton.style.backgroundPosition = '0px 0px'; // Posição inicial
startButton.style.backgroundColor = 'transparent'; 
startButton.style.border = 'none'; 
startButton.style.boxShadow = 'none';

function animateSpritestartButton() {
    // Atualiza a posição do background para o próximo frame
    startButton.style.backgroundPosition = `-${currentFramestartButton * frameWidthstartButton}px 0px`;

    // Avança para o próximo frame
    currentFramestartButton = (currentFramestartButton + 1) % totalFramesstartButton; // Volta ao primeiro frame após o último
}

// Define o intervalo de animação (30 FPS, por exemplo)
const intervalstartButton = setInterval(animateSpritestartButton, 1000 / 10);


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

// Função para desenhar o chao
function drawGround() {
    const groundHeight = canvas.height * 0.25;
    ctx.drawImage(groundImage, 0, canvas.height - groundHeight, canvas.width, groundHeight);
    // O filtro será aplicado no canvas inteiro via CSS
}

// Função para desenhar o fundo
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    // O filtro será aplicado no canvas inteiro via CSS
}

// Função para desenhar o pássaro
function drawBird() {
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    // O filtro será aplicado no canvas inteiro via CSS
}

// Função para atualizar o pássaro
function updateBird() {
    bird.velocity += gameConfig.gravity * scaleFactor * 0.07;
    bird.y += bird.velocity;

    const groundHeight = canvas.height * 0.25;
    const groundY = canvas.height - groundHeight;
    if (bird.y + bird.height > groundY || bird.y < 0) {
        isPaused = true; // Pausa o jogo na colisão com topo ou chão
        triggerGameOverTransition(); // Inicia a transição
    }
}

// Função para criar obstáculos
function createObstacles() {
    if (frame % (gameConfig.obstacleFrequency * 300) === 0) {
        const groundHeight = canvas.height * 0.25; // 25% da altura do canvas
        const playableHeight = canvas.height - groundHeight - (gameConfig.gap * scaleFactor * 100); // Altura jogável (75% - gap)
        const height = Math.floor(Math.random() * playableHeight); // Limitado ao espaço acima do chão
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
    if (!isPaused) { // Só move os obstáculos se o jogo não estiver pausado
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].x -= gameConfig.obstacleSpeed * scaleFactor * 1.5;
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        ctx.save();
        ctx.translate(obstacles[i].x + obstacles[i].width / 2, obstacles[i].height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipeImage, -obstacles[i].width / 2, -obstacles[i].height / 2, obstacles[i].width, obstacles[i].height);
        ctx.restore();

        const groundHeight = canvas.height * 0.25;
        const groundY = canvas.height - groundHeight;
        const bottomPipeY = obstacles[i].height + gameConfig.gap * scaleFactor * 100;
        const bottomPipeHeight = groundY - bottomPipeY;
        if (bottomPipeHeight > 0) {
            ctx.drawImage(pipeImage, obstacles[i].x, bottomPipeY, obstacles[i].width, bottomPipeHeight);
        }
    }
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    // O filtro será aplicado no canvas inteiro via CSS
}

// Função para verificar colisão
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
            isPaused = true; // Pausa o jogo na colisão
            triggerGameOverTransition(); // Inicia a transição
            return true;
        }
    }
    return false;
}

// Função para verificar interseção entre um círculo e um retângulo
function circleRectIntersect(circle, rect) {
    // Encontrar o ponto mais próximo no retângulo ao centro do círculo
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calcular a distância entre o centro do círculo e o ponto mais próximo
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    // Se a distância for menor que o raio ao quadrado, há interseção
    return distanceSquared <= (circle.radius * circle.radius);
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
        ctx.fillText('Press to Play!', canvas.width / 2, canvas.height / 4);
    }
}

// Piscar mensagem "Press to Play"
setInterval(() => {
    if (isPaused) showPauseMessage = !showPauseMessage;
}, 500);

// Função principal do jogo
function update() {
    if (!gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBird();
    drawGround();
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
            // Já tratado na função checkCollision
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
    // O fundo e o filtro já foram definidos em triggerGameOverTransition
}

function triggerGameOverTransition() {
    canvas.style.transition = 'filter 1s ease';
    canvas.style.filter = 'grayscale(100%)';

    setTimeout(() => {
        // Captura o estado atual do canvas como imagem
        const pausedGameImage = canvas.toDataURL('image/png');
        gameOverScreen.style.background = `url(${pausedGameImage}) no-repeat center center`;
        gameOverScreen.style.backgroundSize = 'cover';
        gameOverScreen.style.filter = 'grayscale(100%)'; // Aplica o filtro diretamente na tela de Game Over
        endGame();
    }, 1000);
}

// Função para reiniciar o jogo com "Press to Play"
function resetGame() {
    bird.y = gameConfig.birdStartY * scaleFactor;
    bird.velocity = 0;
    obstacles = [];
    frame = 0;
    score = 0;
    gameStarted = true;
    isPaused = true;
    canvas.style.filter = 'none'; // Remove o filtro ao reiniciar
    gameOverScreen.style.filter = 'none'; // Remove o filtro da tela de Game Over ao reiniciar
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
    gameOverScreen.style.transition = 'opacity 1s ease';
    gameOverScreen.style.opacity = '0';
    setTimeout(() => {
        gameOverScreen.style.display = 'none';
        gameOverScreen.style.opacity = '1'; // Restaura opacidade para próxima vez
        resetGame();
        update(); // Reiniciar o loop explicitamente
    }, 1000);
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