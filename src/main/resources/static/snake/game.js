'use strict';

class SnakeDrawer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.requestAnimFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        this.defaultColor = "#EEEEEE";

        //canvas.onmousedown = onMouseDown;

        this.indent = 1;
        this.xShift = 0;
        this.yShift = 0;
    }

    resizeAll(rows, columns) {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.cellSize = Math.min(Math.floor((this.width + this.indent) / columns - this.indent), Math.floor((this.height + this.indent) / rows - this.indent));
        const heightField = rows * (this.cellSize + this.indent);
        const widthField = columns * (this.cellSize + this.indent);
        //console.log(heightField + " " + widthField);
        //console.log(height + " " + width);
        this.xShift = Math.floor((this.width - widthField) / 2);
        this.yShift = Math.floor((this.height - heightField) / 2);
        this.textIndent = this.cellSize / 1.2;
    };

    drawFrame(map) {
        this.ctx.fillStyle = this.defaultColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        for (let i = 0; i < map.rows; i++) {
            for (let j = 0; j < map.columns; j++) {
                const {color, points} = map.map[i][j];

                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    this.xShift + j * (this.cellSize + this.indent),
                    this.yShift + i * (this.cellSize + this.indent),
                    this.cellSize,
                    this.cellSize
                );
                if (typeof points !== "undefined") {
                    this.ctx.fillStyle = "black";
                    this.ctx.font = "bold " + Math.max(0, this.cellSize - 2) + "px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText(
                        points + "",
                        this.xShift + j * (this.cellSize + this.indent) + this.cellSize / 2,
                        this.yShift + i * (this.cellSize + this.indent) + this.textIndent
                    );
                }
            }
        }
    }

    drawUpdate(x, y, event) {
        this.ctx.fillStyle = event.color;
        this.ctx.fillRect(
            this.xShift + x * (this.cellSize + this.indent),
            this.yShift + y * (this.cellSize + this.indent),
            this.cellSize,
            this.cellSize
        );
        if (typeof event.points !== "undefined") {
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold ' + Math.max(0, this.cellSize - 2) + 'px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                event.points + "",
                this.xShift + x * (this.cellSize + this.indent) + this.cellSize / 2,
                this.yShift + y * (this.cellSize + this.indent) + this.textIndent
            );
        }
    }
}

class SnakeGame {
    constructor(snake, drawer) {
        this.drawer = drawer;
        this.snake = snake;
        this.state = 0;

        const showPanel = () => {
            if (this.state == 0) return;
            this.state = 0;
            $('#overlays').css({"display": "block", "opacity": 1});
        };

        /*            if (state === 'panel')
         return;
         state = 'panel';
         $('#overlays').css({"display": "block", "opacity": 0});
         panelOpacity = 0;
         if (connection == 1) ws.send(JSON.stringify({act: "leave"}));
         showingPanel();*/

        /*let panelOpacity = 0;

        const showingPanel = () => {
            //console.log("showing " + panelOpacity);
            panelOpacity += 0.02;
            $("#overlays").css("opacity", panelOpacity);
            if (panelOpacity < 1) setTimeout(showingPanel, 0.5);
        };*/

        const hidePanel = () => {
            if (this.state == 1 || this.snake.connection != 1) return;
            this.state = 1;
            $("#overlays").css("display", "none");
        };

        const redraw = () => {
            const map = this.snake.map;
            this.drawer.resizeAll(map.rows, map.columns);
            this.drawer.drawFrame(map);
        };

        snake.on("leave", showPanel);
        snake.on("join", hidePanel);
        snake.on("ws.close", showPanel);
        snake.on("init", redraw);
        snake.on("cell.update", (x, y, upd) => {
            this.drawer.drawUpdate(x, y, upd);
        });

        document.body.onresize = redraw;

        document.onkeydown = (e) => {
            e = e || event;
            const code = e.keyCode;
            //console.log("Key: " + code);
            if (this.state == 1) {
                if (code >= 37 && code <= 40) { //Arrows
                    let dir;
                    switch (code) {
                        case 37:
                            dir = "LEFT";
                            break;
                        case 38:
                            dir = "UP";
                            break;
                        case 39:
                            dir = "RIGHT";
                            break;
                        case 40:
                            dir = "DOWN";
                            break;
                    }
                    this.snake.go(dir);
                }
                if (code == 27) { //Escape
                    this.snake.leave();
                }
            }
            if (this.state == 0) {
                if (code == 13) { //Enter
                    this.snake.join($('#nick').val());
                }
            }
        }
    }
}

class SnakeStats{
    constructor(snake, container) {
        this.stats = {};
        this.container = container;

        this.maxTop = 10;
        this.displayPlayers = true;
        this.displayEmpty = false;
        this.displayBlocks = false;
        this.displayFood = false;
        this.minUpdate = 0;
        this.lastUpdate = -1;

        snake.on("init", () => {
            this.stats = {};
        });
        snake.on("cell.update", (x, y, cur, old) => {
            old = this.get(old);
            cur = this.get(cur);
            if (typeof old !== "undefined") old.count--;
            if (typeof cur !== "undefined") cur.count++;
        });
        snake.on("map.update", () => {
            const millis = new Date().getTime();
            if (millis < this.lastUpdate + this.minUpdate) return;
            this.lastUpdate = millis;

            const arr = [];
            for (let prop in this.stats) {
                arr.push(this.stats[prop]);
            }
            arr.sort((a, b) => {
                if (a.count > b.count) return -1;
                if (a.count < b.count) return 1;
                if (a.info.color > b.info.color) return 1;
                if (a.info.color < b.info.color) return -1;
                if (a.info.id > b.info.id) return 1;
                if (a.info.id < b.info.id) return -1;
                return 0;
             });
            const els = [];
            let pos = 1;
            for (let j = 0; j < arr.length && pos <= this.maxTop; j++) {
                let name;
                const i = arr[j];
                if (i.count == 0) continue;
                if (i.info.type == "player") {
                    if (!this.displayPlayers) continue;
                    name = i.info.nick;
                } else if (i.info.type == "food") {
                    if (!this.displayFood) continue;
                    name = "Food";
                } else if (i.info.type == "free") {
                    if (!this.displayEmpty) continue;
                    name = "Empty";
                } else if (i.info.type == "block") {
                    if (!this.displayBlocks) continue;
                    name = "Block";
                }
                let s = pos + ". " + name + " " + i.count;
                pos++;
                els.push($(document.createElement("p")).addClass("top-element")
                    .append($(document.createElement("span")).addClass("color-preview").css("background-color", i.info.color))
                    .append($(document.createElement("span")).text(s)));
            }

            this.container.empty();
            this.container.append(...els);
        });
    }

    get(info) {
        if (typeof info === "undefined" || typeof info.id === "undefined") return undefined;
        const id = info.id;
        if (typeof this.stats[id] === "undefined") this.stats[id] = {count: 0, info: info.info};
        return this.stats[id];
    }
}

let game;
let stats;

$(document).ready(() => {
    game = new SnakeGame(new Snake(), new SnakeDrawer(document.getElementById("canvas")));
    game.snake.connectTo(servers.getServer(0));
    stats = new SnakeStats(game.snake, $("#top-list"));
});