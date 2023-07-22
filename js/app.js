const icons = [];
const popups = [];
let canvas;
let ctx;

class Popup {
    static borderSize = 2;
    static titlebarHeight = 24;

    constructor(title, popupType) {
        this.popupType = popupType;
        // this.ad = Window.ads[Math.floor(Math.random()*Popup.ads.length)];
        this.size = [200, 150]; // TODO: random size
        this.location = [50, 50]; // TODO: random location
        this.title = title;
        this.focused = false;
        this.dragging = false;
        this.dragOffset = [0, 0];
    }

    get innerLocation() {
        return [
            this.location[0] + Popup.borderSize,
            this.location[1] + Popup.borderSize + Popup.titlebarHeight
        ];
    }

    get innerSize() {
        return [
            this.size[0] - Popup.borderSize * 2,
            this.size[1] - Popup.borderSize * 2 - Popup.titlebarHeight
        ];
    }

    get draggableArea() {
        return [
            this.innerLocation[0], this.innerLocation[1] - Popup.titlebarHeight,
            this.innerSize[0], Popup.titlebarHeight,
        ];
    }

    fixLocation() {
        this.location[0] = Math.min(Math.max(this.location[0], 0), canvas.width - this.size[0]);
        this.location[1] = Math.min(Math.max(this.location[1], 0), canvas.height - this.size[1]);
    }

    draw() {
        this.fixLocation();

        // border
        ctx.fillStyle = "#333";
        ctx.fillRect(...this.location, ...this.size);

        // titlebar
        ctx.fillStyle = this.focused ? "#33F" : "#AAE";
        ctx.fillRect(
            this.innerLocation[0], this.innerLocation[1] - Popup.titlebarHeight,
            this.innerSize[0], Popup.titlebarHeight
        );

        // content
        ctx.fillStyle = "#EEE";
        ctx.fillRect(...this.innerLocation, ...this.innerSize);
    }
}

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
            if (loc[1] >= canvas.height - this.size[1]) break;
            if (!usedLocations.find((usedLoc) =>
                Math.abs(usedLoc[1] - loc[1]) + Math.abs(usedLoc[0] - loc[0]) < 48
            )) {
                return loc;
            }
        }
        // fallback
        return [Math.floor(canvas.width*Math.random()*0.9), Math.floor(canvas.height*Math.random()*0.9)];
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
    }
}

function startGame() {
    icons.length = 0;
    icons.push(new Icon("My Computer", "computer", true));
    icons.push(new Icon("Recycle Bin", "bin", true));
    icons.push(new Icon("Important Documents", "documents", true));
    // setInterval(()=>{icons.push(new Icon(Math.random(), "bin", true))}, 1000)
    popups.length = 0;
    popups.push(new Popup("E-mail", "email"));
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
function mouseDown(event) {
    const x = event.clientX;
    const y = event.clientY;
    let alreadyHit = false;
    for (const popup of popups.slice().reverse()) {
        const hit = alreadyHit ? false : inRect(x, y, ...popup.location, ...popup.size);
        const dragHit = hit && inRect(x, y, ...popup.draggableArea);
        if (hit) alreadyHit = true;
        popup.focused = hit;
        popup.dragging = dragHit;
        if (dragHit) popup.dragOffset = [popup.location[0] - x, popup.location[1] - y];
    }

    if (!alreadyHit) {
        // assuming icon or desktop
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
}

function mouseUp(event) {
    const x = event.clientX;
    const y = event.clientY;
    // always run
    for (const item of [...icons, ...popups]) {
        item.dragging = false;
    }
}

function mouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    // always run
    for (const item of [...icons, ...popups].filter(item => item.dragging)) {
        item.location = [x + item.dragOffset[0], y + item.dragOffset[1]];
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
    for (const popup of popups) {
        popup.draw();
    }
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
