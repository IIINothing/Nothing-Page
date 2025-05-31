// Rain effect for left and right canvases
class RainDrop {
    constructor(x, y, speed, length) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.length = length;
        this.opacity = Math.random();
    }
}

class Rain {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.init();
        window.addEventListener('resize', () => this.init());
        this.animate();
    }
    init() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = window.innerHeight;
        this.drops = [];
        let count = Math.floor(this.canvas.width / 2);
        for (let i = 0; i < count; i++) {
            let x = Math.random() * this.canvas.width;
            let y = Math.random() * this.canvas.height;
            let speed = 2 + Math.random() * 3;
            let length = 10 + Math.random() * 20;
            this.drops.push(new RainDrop(x, y, speed, length));
        }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.font = '16px monospace';
        for (let drop of this.drops) {
            this.ctx.fillText('*', drop.x, drop.y);
            drop.y += drop.speed;
            if (drop.y > this.canvas.height) {
                drop.y = -20;
                drop.x = Math.random() * this.canvas.width;
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

let rainLeft = new Rain(document.getElementById('rain-left'));
let rainRight = new Rain(document.getElementById('rain-right'));

// Toggle rain with Ctrl+M
let rainVisible = true;
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'm') {
        rainVisible = !rainVisible;
        document.getElementById('rain-left').style.display = rainVisible ? 'block' : 'none';
        document.getElementById('rain-right').style.display = rainVisible ? 'block' : 'none';
    }
});

// Toggle section content
document.querySelector('.section').addEventListener('click', () => {
    let content = document.querySelector('.section-content');
    let indicator = document.querySelector('.toggle-indicator');
    if (content.style.display === 'block') {
        content.style.display = 'none';
        indicator.textContent = '[ ]';
    } else {
        content.style.display = 'block';
        indicator.textContent = '[+]';
    }
});

// Snake game
let snakeContainer = document.getElementById('snake-container');
let snakeCanvas = document.getElementById('snake-canvas');
let ctx = snakeCanvas.getContext('2d');
let scale = 20;
let rows = 20;
let cols = 20;
snakeCanvas.width = cols * scale;
snakeCanvas.height = rows * scale;

let snake;
let apple;
let gameLoop;
let directionQueue = [];

class Snake {
    constructor() {
        this.body = [{x: 10, y: 10}];
        this.dir = {x: 0, y: 0};
    }
    setDirection(dir) {
        // Prevent reversing
        let lastDir = this.dir;
        if ((dir.x === -lastDir.x && dir.y === -lastDir.y)) return;
        this.dir = dir;
    }
    update() {
        if (directionQueue.length) {
            this.setDirection(directionQueue.shift());
        }
        let head = {...this.body[0]};
        head.x += this.dir.x;
        head.y += this.dir.y;
        // Wrap around edges
        head.x = (head.x + cols) % cols;
        head.y = (head.y + rows) % rows;
        // Check collision with self
        for (let segment of this.body) {
            if (segment.x === head.x && segment.y === head.y) {
                gameOver();
                return;
            }
        }
        this.body.unshift(head);
        if (head.x === apple.x && head.y === apple.y) {
            placeApple();
        } else {
            this.body.pop();
        }
    }
    draw() {
        ctx.fillStyle = '#0f0';
        for (let segment of this.body) {
            ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
        }
    }
}

class Apple {
    constructor() {
        this.x = 5;
        this.y = 5;
    }
    draw() {
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
    }
}

function placeApple() {
    apple.x = Math.floor(Math.random() * cols);
    apple.y = Math.floor(Math.random() * rows);
    for (let segment of snake.body) {
        if (segment.x === apple.x && segment.y === apple.y) {
            return placeApple();
        }
    }
}

function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('game-over').style.display = 'block';
}

function startGame() {
    snake = new Snake();
    apple = new Apple();
    placeApple();
    document.getElementById('game-over').style.display = 'none';
    directionQueue = [];
    gameLoop = setInterval(() => {
        ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
        snake.update();
        snake.draw();
        apple.draw();
        document.getElementById('score').textContent = 'Score: ' + (snake.body.length - 1);
    }, 100);
    document.getElementById('press-start').style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
        if (snakeContainer.style.display === 'block') {
            snakeContainer.style.display = 'none';
            clearInterval(gameLoop);
        } else {
            snakeContainer.style.display = 'block';
            document.getElementById('press-start').style.display = 'block';
        }
    }
    if (snakeContainer.style.display === 'block' && e.key === ' ') {
        startGame();
    }
    if (snakeContainer.style.display === 'block') {
        let dir;
        if (e.key === 'ArrowUp') dir = {x: 0, y: -1};
        else if (e.key === 'ArrowDown') dir = {x: 0, y: 1};
        else if (e.key === 'ArrowLeft') dir = {x: -1, y: 0};
        else if (e.key === 'ArrowRight') dir = {x: 1, y: 0};
        if (dir) {
            directionQueue.push(dir);
        }
    }
});
