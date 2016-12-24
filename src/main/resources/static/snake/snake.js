if (typeof Emitter === "undefined") {
    if (typeof window !== "undefined") {
        console.log("looks like script is running in browser. check Emitter(https://github.com/ystskm/browser-emitter-js/blob/master/Emitter.js) dependency");
    }
    var Emitter = require("browser-emitter");
}

if (typeof WebSocket === "undefined") {
    var WebSocket = require("ws");
}

'use strict';

class Ids {

    constructor(snake) {
        this.ids = {};
        this.snake = snake;

        snake.emit("new.ids", this);
    }

    update(arr) {
        if (typeof arr === "undefined") return;
        for (let i = 0; i < arr.length; i++) {
            const ii = arr[i];
            this.ids[ii.id] = ii;
            this.snake.emit("id.update")
        }
        this.snake.emit("ids.update", this);
    };

    get(id) {
        return this.ids[id];
    }
}

class SnakeMap {
    constructor(snake, r, c) {
        this.snake = snake;
        this.rows = r;
        this.columns = c;
        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.map[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.map[i][j] = {color: "white"};
            }
        }

        this.snake.emit("new.map", this);
    }

    update(arr) {
        for (let i = 0; i < arr.length; i++) {
            const event = arr[i];
            const {x, y} = event;
            const old = this.map[y][x];
            if (old.time && event.time && event.time <= old.time) continue;
            this.map[y][x] = event;
            this.snake.emit("cell.update", x, y, event, old);
        }
    }

    checkAll() {
        for (let i = 0; i  < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (typeof this.map[i][j].id === "undefined") continue;
                const info = this.snake.ids.get(this.map[i][j].id);
                if (this.map[i][j].color == info.color) continue;
                const old = this.map[i][j];
                this.map[i][j] = {
                    x: j,
                    y: i,
                    id: this.map[i][j].id,
                    info: info,
                    color: info.color
                };
                this.snake.emit("cell.update", j, i, this.map[i][j], old);
            }
        }
    }
}

class Snake {

    constructor() {
        Emitter.call(this);
        this.running = false;
        this.logMessages = false;

        this.ids = new Ids(this);
        this.map = new SnakeMap(this, 0, 0);

        this.on("ws.close", this.reconnect);
        this.on("onmessage", this.onMessage);
    }

    start() {
        this.running = true;
        this.reconnect();
    }

    stop() {
        this.running = false;
        this.reconnect();
    }

    connectTo(server) {
        this.server = server;
        this.start();
    }

    reconnect() {
        if (typeof this.ws !== "undefined") {
            this.ws.onclose = undefined;
            this.ws.close();
        }
        if (!this.running) return false;

        this.emit("reconnect");

        console.log("trying to connect to " + this.server);

        this.ws = new WebSocket(this.server);

        this.ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            this.emit("onmessage", msg);
        };

        this.ws.onclose = () => {
            console.log("connection closed");
            this.emit("ws.close");
        };

        this.ws.onopen = () => {
            console.log("connection established");
            this.emit("ws.open", this.ws);
        };

        return true;
    }

    onMessage(msg) {
        const parseCellInfo = (info) => {
            const obj = {};
            const pos1 = info.indexOf('.');
            const pos2 = info.indexOf('#');
            let pos3 = info.indexOf('*');
            if (pos3 != -1) {
                obj.points = parseInt(info.slice(pos3 + 1));
            } else {
                pos3 = info.length;
            }
            obj.x = parseInt(info.slice(0, pos1)); //server.x
            obj.y = parseInt(info.slice(pos1 + 1, pos2)); //server.y
            obj.id = info.slice(pos2 + 1, pos3);
            obj.info = this.ids.get(obj.id);
            obj.color = obj.info.color;
            return obj;
        };

	    if (this.logMessages == true) console.log(msg);

        if (msg.act == "init") {
            let {rows, columns} = msg;
            console.log(`Server map size: ${rows} ${columns}`);

            this.ids = new Ids(this);
            this.map = new SnakeMap(this, rows, columns);

            this.emit("init");
        }
        this.ids.update(msg.u);

        if (typeof msg.c !== "undefined") {
            for (let i = 0; i < msg.c.length; i++) {
                this.emit("new.chat", msg.c[i]);
            }
        }

        const sarr = msg.a;
        if (typeof sarr !== "undefined") {
            const arr = sarr.split("|");
            const events = [];
            for (let i = 0; i < arr.length; i++) {
                events.push(parseCellInfo(arr[i]));
            }
            this.map.update(events);
            this.emit("map.update", events);
        }

        if (typeof msg.u !== "undefined") this.map.checkAll();

        this.emit("server.tick", msg);
    }

    join(nick) {
        if (typeof this.ws === "undefined") return;
        this.ws.send(JSON.stringify({act: "join", "nick": nick}));
        console.log("join: " + nick);
        this.emit("join", nick);
    }

    leave() {
        if (typeof this.ws === "undefined") return;
        this.ws.send(JSON.stringify({act: "leave"}));
        console.log("leave");
        this.emit("leave");
    }

    go(dir) {
        if (typeof this.ws === "undefined") return;
        this.ws.send(JSON.stringify({act: "turn", "dir": dir}));
        this.emit("go", dir);
    }

    sendChat(msg) {
        if (typeof this.ws === "undefined") return;
        this.ws.send(JSON.stringify({act: "chat", msg: msg}));
        this.emit("send.chat", msg);
    }
}

Emitter.inherits(Snake);

if (typeof module !== "undefined") {
    module.exports = Snake;
}
