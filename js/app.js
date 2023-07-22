const icons = [];
let canvas;
let ctx;

class Icon {
    constructor(name, icon, system = false) {
        this.name = name;
        this.icon = icon;
        this.system = system;
        this.location = this.pickLocation();
    }

    pickLocation() {
        return [0, 0];
    }

    draw() {
        ctx.fillStyle = "#F99";
        ctx.fillRect(0, 0, 8, 8);
    }
}

function startGame() {
    icons.length = 0;
    icons.push(new Icon("My Computer", "computer", true));
}

function init() {
    resizeCanvas();
    startGame();
    requestAnimationFrame(draw);
}

function drawBackground() {
    ctx.fillStyle = "#099";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDesktop() {
    for (const icon of icons) {
        icon.draw();
    }
}

function drawEmail() {

}

function drawPopups() {

}

function drawGame() {
    drawBackground();
    drawDesktop();
    drawEmail();
    drawPopups();
}

function draw() {
    drawGame();
    requestAnimationFrame(draw);
}

function resizeCanvas() {
    canvas = document.getElementById("game");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    ctx = canvas.getContext("2d");
}

window.addEventListener("load", init);
window.addEventListener("resize", resizeCanvas);
