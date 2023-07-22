const icons = [];
let canvas;
let ctx;

class Icon {
    constructor(name, icon, system = false) {
        this.name = name;
        this.icon = icon;
        this.system = system;
        this.size = [32, 32];
        this.dragging = false;
        this.dragOffset = [0, 0];
        this.highlighted = false;
        this.location = this.pickLocation();
    }

    pickLocation() {
        const usedLocations = icons.map((icon) => icon.location);
        for (let i = 0; i < 100; i++) {
            const loc = [32, 24 + this.size[1]*2*i];
            if (!usedLocations.find((usedLoc) => usedLoc[1] === loc[1] && usedLoc[0] === loc[0])) {
                return loc;
            }
        }

    }

    fixLocation() {
        this.location[0] = Math.min(Math.max(this.location[0], 0), canvas.width - this.size[0]);
        this.location[1] = Math.min(Math.max(this.location[1], 0), canvas.height - this.size[1]);
    }

    draw() {
        this.fixLocation();

        ctx.fillStyle = {
            "computer": "#0F0",
            "bin": "#898",
            "documents": "#F99",
        }[this.icon];
        ctx.fillRect(...this.location, ...this.size);

        const textPos = [this.location[0] + this.size[0]/2, this.location[1] + this.size[1] + 14];
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        if (this.highlighted) {
            const textSize = ctx.measureText(this.name);
            const padding = 2;
            ctx.fillStyle = "#00F";
            ctx.fillRect(textPos[0] - textSize.width/2 - padding, textPos[1] - 9, textSize.width + padding*2, 12);
        }
        ctx.fillStyle = "#FFF";
        ctx.fillText(this.name, ...textPos);

        ctx.textAlign = "left";
        ctx.fillText(icons.map(icon => icon.name).join(", "), 10, 10);
    }
}

function startGame() {
    icons.length = 0;
    icons.push(new Icon("My Computer", "computer", true));
    icons.push(new Icon("Recycle Bin", "bin", true));
    icons.push(new Icon("Important Documents", "documents", true));
}

function init() {
    resizeCanvas();
    startGame();
    requestAnimationFrame(draw);
}

function inRect(srcX,srcY,x,y,w,h) {
    return (
        x < srcX &&
        y < srcY &&
        x + w > srcX &&
        y + h > srcY
    );
}

function findMouseTarget() {
    // TODO: Return target, eg popup or desktop

}

function mouseDown(event) {
    const x = event.clientX;
    const y = event.clientY;
    const target = findMouseTarget(x, y);
    // assuming icon or desktop
    let alreadyHit = false;
    for (const icon of icons.slice().reverse()) {
        const hit = alreadyHit ? false : inRect(x, y, ...icon.location, ...icon.size);
        icon.dragging = hit;
        icon.highlighted = hit;
        if (hit) {
            alreadyHit = true;
            icon.dragOffset = [icon.location[0] - x, icon.location[1] - y];
        }
    }
}

function mouseUp(event) {
    const x = event.clientX;
    const y = event.clientY;
    const target = findMouseTarget(x, y);
    // always run
    for (const icon of icons) {
        icon.dragging = false;
    }
}

function mouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    const target = findMouseTarget(x, y);
    // always run
    for (const icon of icons.filter(icon => icon.dragging)) {
        icon.location = [x + icon.dragOffset[0], y + icon.dragOffset[1]];
    }
}

function drawBackground() {
    ctx.fillStyle = "#099";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDesktop() {
    icons.reverse().sort((a, b) => a.highlighted ? 1 : -1);
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

window.addEventListener("mousedown", mouseDown);
window.addEventListener("mouseup", mouseUp);
window.addEventListener("mousemove", mouseMove);

window.addEventListener("resize", resizeCanvas);

window.addEventListener("load", init);
