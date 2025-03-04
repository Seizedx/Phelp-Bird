const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// URLs das imagens na pasta img
const birdImageUrl = '../img/bird.png'; // URL do pássaro
const pipeImageUrl = '../img/pipe.png'; // URL do cano
const backgroundImageUrl = '../img/background.png'; // URL do fundo

// Configurações do jogo
const gameConfig = {
    birdWidth: 40,          // Largura do pássaro
    birdHeight: 40,         // Altura do pássaro
    gravity: 0.07,          // Gravidade do pássaro
    lift: -3,               // Impulso do pássaro para cima
    gameSpeed: 1,           // Velocidade do jogo
    gap: 100,               // Espaço entre os obstáculos
    obstacleWidth: 50,      // Largura dos obstáculos
    obstacleSpeed: 1.5,     // Velocidade dos obstáculos
    obstacleFrequency: 300, // Frequência de criação dos obstáculos
};

// Propriedades do pássaro
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: gameConfig.birdWidth,
    height: gameConfig.birdHeight,
    gravity: gameConfig.gravity,
    lift: gameConfig.lift,
    velocity: 0,
};

// Obstáculos
let obstacles = [];
let frame = 0;
let gameStarted = false; // Flag para verificar se o jogo começou
let score = 0;  // Pontuação do jogador
let highScore = localStorage.getItem("highScore") || 0;  // Record (salvo no localStorage)

// Tela Inicial
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const highScoreDisplay = document.getElementById("highScore");

// Botões de retry
const retryButton = document.getElementById("retryButton");
const retry = document.getElementById("retry");

// Exibição do placar
const scoreDisplay = document.getElementById("score");

// Carregar imagens
const birdImage = new Image();
const pipeImage = new Image();
const backgroundImage = new Image();

birdImage.src = birdImageUrl;
pipeImage.src = pipeImageUrl;
backgroundImage.src = backgroundImageUrl;

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

    // Evitar que o pássaro saia da tela
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

// Função para criar e desenhar obstáculos
function createObstacles() {
    if (frame % gameConfig.obstacleFrequency === 0) {
        const height = Math.floor(Math.random() * (canvas.height - gameConfig.gap));
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: gameConfig.obstacleWidth,
            height: height
        });
    }
}

// Função para atualizar e desenhar os obstáculos
function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameConfig.obstacleSpeed; // Diminuir a velocidade dos obstáculos
        ctx.drawImage(pipeImage, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
        ctx.drawImage(pipeImage, obstacles[i].x, obstacles[i].height + gameConfig.gap, obstacles[i].width, canvas.height - obstacles[i].height - gameConfig.gap);
    }

    // Remover obstáculos que saem da tela
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

// Função de colisão
function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        if (
            bird.x + bird.width > obstacles[i].x &&
            bird.x < obstacles[i].x + obstacles[i].width &&
            (bird.y < obstacles[i].height || bird.y + bird.height > obstacles[i].height + gameConfig.gap)
        ) {
            return true; // Colisão
        }
    }
    return false; // Sem colisão
}

// Função para verificar se o pássaro passou pelo obstáculo
function checkPassObstacle() {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x + obstacles[i].width < bird.x && !obstacles[i].passed) {
            obstacles[i].passed = true;  // Marcar o obstáculo como "passado"
            return true;  // O pássaro passou por um obstáculo
        }
    }
    return false;  // Não passou por nenhum obstáculo
}

// Função para atualizar o jogo
function update() {
    if (!gameStarted) return; // Só executa se o jogo foi iniciado

    frame++;
    drawBackground(); // Desenhar o fundo
    drawBird(); // Desenhar o pássaro
    updateBird(); // Atualizar a posição do pássaro
    createObstacles(); // Criar obstáculos
    updateObstacles(); // Atualizar obstáculos

    // Incrementar o placar quando passar por um obstáculo
    if (checkPassObstacle()) {
        score++;
    }

    // Aumentar a dificuldade após o placar 20
    if (score > 20) {
        gameConfig.obstacleSpeed *= 1.3;  // Aumenta a velocidade dos obstáculos em 30%
        gameConfig.obstacleFrequency *= 0.7; // Aumenta a frequência de obstáculos em 30%
    }

    // Verificar colisão
    if (checkCollision()) {
        endGame();
    }

    scoreDisplay.textContent = "Score: " + score;

    requestAnimationFrame(update);
}

// Função para reiniciar o jogo
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    obstacles = [];
    frame = 0;
    score = 0;
    gameStarted = false;
    scoreDisplay.textContent = "Score: " + score;
    retryButton.style.display = "none"; // Ocultar o botão de retry
    startScreen.style.display = "none"; // Ocultar a tela inicial
}

// Função para terminar o jogo e exibir a caixa de diálogo
function endGame() {
    gameStarted = false;
    // Atualizar o record, se necessário
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    highScoreDisplay.textContent = highScore;
    retryButton.style.display = "block"; // Mostrar o botão de retry
}

// Função de controle do pássaro (click ou toque na tela)
canvas.addEventListener("click", function () {
    if (gameStarted) {
        bird.velocity = bird.lift;
    } else {
        gameStarted = true;
        update(); // Inicia o jogo
    }
});

// Função para começar o jogo (clicando no botão "Start")
startButton.addEventListener("click", function () {
    startScreen.style.display = "none"; // Esconde a tela inicial
    gameStarted = true;
    update(); // Inicia o jogo
});

// Função para o botão de "Retry"
retry.addEventListener("click", function () {
    resetGame();
    update(); // Reinicia o jogo
});

// Inicia a tela inicial
startScreen.style.display = "block";
