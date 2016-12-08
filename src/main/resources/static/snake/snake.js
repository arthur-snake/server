/**
 * [browser-emitter-js] Emitter.js
 * Copyright (c) 2013 Yoshitaka Sakamoto <brilliantpenguin@gmail.com>
 * See license: https://github.com/ystskm/browser-emitter-js/blob/master/LICENSE
 */
(function(has_win, has_mod) {

    var exports;
    if(has_win) {
        // browser, emulated window
        exports = window;
    } else {
        // raw Node.js, web-worker
        exports = typeof self == 'undefined' ? this: self;
    }

    has_mod && (module.exports = Emitter);
    exports.Emitter = Emitter;

    function Emitter() {
        this._events = {};
    }

    var EmitterProps = {
        inherits: inherits
    };
    for( var i in EmitterProps)
        Emitter[i] = EmitterProps[i];

    var EmitterProtos = {
        on: on,
        off: off,
        once: once,
        emit: emit,
        listeners: listeners
    };
    for( var i in EmitterProtos)
        Emitter.prototype[i] = _wrap(EmitterProtos[i]);

    function on(type, args) {
        this._events[type].push({
            fn: args[0]
        }); // TODO more options
        return this;
    }

    function once(type, args) {
        this._events[type].push({
            fn: args[0],
            once: true
        }); // TODO more options
        return this;
    }

    function off(type, args) {

        var self = this, splice_pos = 0;
        var evts = this._events;
        if(type == null) {
            for( var i in evts)
                delete evts[i];
            return this;
        }

        while(splice_pos < evts[type].length) {
            var stat = evts[type][splice_pos];
            typeof args[0] != 'function' || args[0] === stat.fn ? (function() {
                evts[type].splice(splice_pos, 1);
            })(): splice_pos++;
        }

        if(evts[type]) {
            // occasionally already deleted (another .off() called)
            evts[type].length == 0 && delete evts[type];
        }
        return this;

    }

    function emit(type, args) {

        var emitter = this, splice_pos = 0;
        var evts = emitter._events, handlers = [];

        // emit event occasionally off all type of events
        while(evts[type] && splice_pos < evts[type].length) {
            var stat = evts[type][splice_pos];
            handlers.push(stat.fn), stat.once ? (function() {
                evts[type].splice(splice_pos, 1);
            })(): splice_pos++;
        }

        if(evts[type]) {
            // occasionally already deleted (.off() called)
            evts[type].length || delete evts[type];
        }

        handlers.forEach(function(fn) {
            fn.apply(emitter, args);
        });

        return emitter;

    }

    function listeners(type) {
        return type == null ? this._events: this._events[type];
    }

    function inherits(Super) {
        for( var i in Emitter.prototype)
            Super.prototype[i] = Emitter.prototype[i];
    }

    function _wrap(fn) {
        return function() {
            var args = Array.prototype.slice.call(arguments), type = args.shift();
            !Array.isArray(this._events[type]) && (this._events[type] = []);
            return fn.call(this, type, args);
        };
    }

}).call(this, typeof window != 'undefined', typeof module != 'undefined');

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
            this.ids[ii.id] = ii
        }
        this.snake.emit("id.updated", this);
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
}

class Snake {

    constructor() {
        Emitter.call(this);
        this.running = false;
        this.connection = 0;

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
        if (this.ws) this.ws.close();
    }

    connectTo(server) {
        this.server = server;
        this.start();
    }

    reconnect() {
        this.connection = 0;
        if (!this.running) {
            return false;
        }

        this.emit("reconnect");

        console.log("trying to connect to " + this.server);
        this.ws = new WebSocket(this.server);
        this.ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            this.emit("onmessage", msg);
        };
        this.ws.onclose = () => {
            this.connection = 0;
            console.log("connection closed");
            this.emit("ws.close");
        };
        this.ws.onopen = () => {
            this.connection = 1;
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
            obj.x = parseInt(info.slice(0, pos1)); //server.y
            obj.y = parseInt(info.slice(pos1 + 1, pos2)); //server.x
            obj.id = info.slice(pos2 + 1, pos3);
            obj.info = this.ids.get(obj.id);
            obj.color = obj.info.color;
            return obj;
        };

        if (msg.act == "init") {
            let {rows, columns} = msg;
            console.log(`Server map size: ${rows} ${columns}`);

            this.ids = new Ids(this);
            this.map = new SnakeMap(this, rows, columns);

            this.emit("init");
        }
        this.emit("id.update", msg.u);
        this.ids.update(msg.u);

        const sarr = msg.a;
        if (typeof sarr === "undefined") return;

        const arr = sarr.split("|");
        const events = [];
        for (let i = 0; i < arr.length; i++) {
            events.push(parseCellInfo(arr[i]));
        }
        this.map.update(events);
        this.emit("map.update", events);
    }

    join(nick) {
        if (this.connection == 0) return;
        this.ws.send(JSON.stringify({act: "join", "nick": nick}));
        this.emit("join", nick);
    }

    leave() {
        if (this.connection == 0) return;
        this.ws.send(JSON.stringify({act: "leave"}));
        this.emit("leave");
    }

    go(dir) {
        this.ws.send(JSON.stringify({act: "turn", "dir": dir}));
        this.emit("go", dir);
    }
}

Emitter.inherits(Snake);