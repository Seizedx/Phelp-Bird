const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações editáveis do jogo (em pixels para 480x640)
const gameConfig = {
    birdWidth: 40,          // Largura base do pássaro em pixels
    birdHeight: 40,         // Altura base do pássaro em pixels
    gravity: 0.07,          // Gravidade do pássaro
    lift: -3,               // Impulso do pássaro para cima
    gameSpeed: 1,           // Velocidade geral do jogo
    gap: 100,               // Espaço base entre os obstáculos em pixels
    obstacleWidth: 50,      // Largura base dos obstáculos em pixels
    obstacleSpeed: 1.5,     // Velocidade inicial dos obstáculos
    obstacleFrequency: 300, // Frequência de criação dos obstáculos (frames)
    birdStartX: 50,         // Posição inicial X base do pássaro em pixels
    scoreColor: '#ff6200',  // Cor do score (laranja)
    scoreFont: '24px Arial',// Fonte base do score
    pauseMessageColor: '#fff', // Cor da mensagem "Press to Start!"
    pauseMessageFont: '30px Arial' // Fonte da mensagem "Press to Start!"
};

// URLs das imagens na pasta img
const birdImageUrl = '../img/bird.png';
const pipeImageUrl = '../img/pipe.png';
const backgroundImageUrl = '../img/background.png';
const backgroundstartgameImageUrl = '../img/backgroungstartgame.png';
const backgroundgameoverImageUrl = '../img/backgroundgameover.png';

// Calcular fator de escala baseado na resolução da tela
const scaleFactor = Math.min(window.innerWidth / 480, window.innerHeight / 640);
canvas.style.width = `${480 * scaleFactor}px`;
canvas.style.height = `${640 * scaleFactor}px`;

// Propriedades do pássaro ajustadas pela escala
const bird = {
    x: gameConfig.birdStartX * scaleFactor,
    y: (canvas.height / 2) * scaleFactor,
    width: gameConfig.birdWidth * scaleFactor,
    height: gameConfig.birdHeight * scaleFactor,
    gravity: gameConfig.gravity,
    lift: gameConfig.lift,
    velocity: 0,
};

// Variáveis do jogo
let obstacles = [];
let frame = 0;
let gameStarted = false;
let isPaused = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let showPauseMessage = true;

// Elementos da interface
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const highScoreDisplay = document.getElementById("highScore");
const retryButton = document.getElementById("retryButton");
const retry = document.getElementById("retry");
const closeButton = document.getElementById("closeButton");
const currentScoreDisplay = document.getElementById("currentScore");
const gameOverHighScoreDisplay = document.getElementById("gameOverHighScore");

// Carregar imagens
const birdImage = new Image();
const pipeImage = new Image();
const backgroundImage = new Image();
birdImage.src = birdImageUrl;
pipeImage.src = pipeImageUrl;
backgroundImage.src = backgroundImageUrl;

// Piscar mensagem "Press to Start!" a cada 500ms
setInterval(() => {
    if (isPaused) {
        showPauseMessage = !showPauseMessage;
    }
}, 500);

// Função para desenhar o fundo
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Função para desenhar o pássaro
function drawBird() {
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

// Função para atualizar a posição do pássaro
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

// Função para criar obstáculos
function createObstacles() {
    if (frame % gameConfig.obstacleFrequency === 0) {
        const height = Math.floor(Math.random() * (canvas.height - gameConfig.gap * scaleFactor));
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: gameConfig.obstacleWidth * scaleFactor,
            height: height,
            passed: false
        });
    }
}

// Função para atualizar e desenhar os obstáculos
function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameConfig.obstacleSpeed;

        // Cano superior (girado 180 graus)
        ctx.save();
        ctx.translate(obstacles[i].x + obstacles[i].width / 2, obstacles[i].height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipeImage, -obstacles[i].width / 2, -obstacles[i].height / 2, obstacles[i].width, obstacles[i].height);
        ctx.restore();

        // Cano inferior (sem rotação)
        ctx.drawImage(pipeImage, obstacles[i].x, obstacles[i].height + gameConfig.gap * scaleFactor, obstacles[i].width, canvas.height - obstacles[i].height - gameConfig.gap * scaleFactor);
    }
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

// Função para verificar colisão considerando apenas pixels não transparentes
function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        const birdRect = { x: bird.x, y: bird.y, width: bird.width, height: bird.height };
        const pipeTopRect = { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
        const pipeBottomRect = { x: obs.x, y: obs.height + gameConfig.gap * scaleFactor, width: obs.width, height: canvas.height - obs.height - gameConfig.gap * scaleFactor };

        if (rectIntersect(birdRect, pipeTopRect)) {
            if (pixelCollision(birdRect, pipeTopRect, birdImage, pipeImage)) {
                return true;
            }
        }

        if (rectIntersect(birdRect, pipeBottomRect)) {
            if (pixelCollision(birdRect, pipeBottomRect, birdImage, pipeImage)) {
                return true;
            }
        }
    }
    return false;
}

// Função auxiliar para verificar interseção de retângulos
function rectIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Função para verificar colisão de pixels não transparentes
function pixelCollision(rect1, rect2, img1, img2) {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.drawImage(img1, rect1.x, rect1.y, rect1.width, rect1.height);
    const birdData = tempCtx.getImageData(x1, y1, x2 - x1, y2 - y1).data;

    tempCtx.clearRect(0, 0, canvas.width, canvas.height);
    tempCtx.drawImage(img2, rect2.x, rect2.y, rect2.width, rect2.height);
    const pipeData = tempCtx.getImageData(x1, y1, x2 - x1, y2 - y1).data;

    for (let i = 3; i < birdData.length; i += 4) {
        if (birdData[i] > 0 && pipeData[i] > 0) {
            return true;
        }
    }
    return false;
}

// Função para verificar se o pássaro passou pelo obstáculo
function checkPassObstacle() {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x + obstacles[i].width < bird.x && !obstacles[i].passed) {
            obstacles[i].passed = true;
            score++; // Incrementa o score ao passar pelo pipe
            return true;
        }
    }
    return false;
}

// Função para desenhar o score dentro do canvas
function drawScore() {
    ctx.font = `${parseInt(gameConfig.scoreFont) * scaleFactor}px Arial`;
    ctx.fillStyle = gameConfig.scoreColor;
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, canvas.width - 10 * scaleFactor, 30 * scaleFactor);
}

// Função para desenhar a mensagem "Press to Start!" piscando
function drawPauseMessage() {
    if (isPaused && showPauseMessage) {
        ctx.font = `${parseInt(gameConfig.pauseMessageFont) * scaleFactor}px Arial`;
        ctx.fillStyle = gameConfig.pauseMessageColor;
        ctx.textAlign = "center";
        ctx.fillText("Press to Start!", canvas.width / 2, canvas.height / 2);
    }
}

// Função para atualizar o jogo
function update() {
    if (!gameStarted) return;

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

        checkPassObstacle(); // Score já incrementado aqui

        if (checkCollision()) {
            endGame();
        }
    }

    requestAnimationFrame(update);
}

// Função para reiniciar o jogo (com pausa inicial)
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    obstacles = [];
    frame = 0;
    score = 0;
    gameStarted = true;
    isPaused = true;
    retryButton.style.display = "none";
    startScreen.style.display = "none";
}

// Função para terminar o jogo
function endGame() {
    gameStarted = false;
    isPaused = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    highScoreDisplay.textContent = highScore;
    currentScoreDisplay.textContent = score;
    gameOverHighScoreDisplay.textContent = highScore;
    retryButton.style.display = "flex"; // Garantir que sempre apareça
}

// Função para voltar à tela inicial
function returnToStart() {
    resetGame();
    gameStarted = false;
    isPaused = false;
    startScreen.style.display = "flex";
}

// Controles do jogo
canvas.addEventListener("click", function () {
    if (gameStarted) {
        if (isPaused) {
            isPaused = false;
        } else {
            bird.velocity = bird.lift;
        }
    }
});

startButton.addEventListener("click", function () {
    startScreen.style.display = "none";
    gameStarted = true;
    isPaused = true;
    update();
});

retry.addEventListener("click", function () {
    resetGame();
    update();
});

closeButton.addEventListener("click", returnToStart);

// Inicia a tela inicial
startScreen.style.display = "flex";
highScoreDisplay.textContent = highScore;