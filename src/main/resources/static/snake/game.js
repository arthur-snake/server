'use strict';

//Features
let displayAllStats = false;

//Connection
let server = servers.getServer(0);
let connection = 0;
let state = 'panel';
let ws;
let nick;

//Constants
const snakeColor = "#4B77BE";
const defaultColor = "#EEEEEE";

//Map
let rows;
let columns;
let map = [];

//Canvas
let height;
let width;
let requestAnimFrame;
let canvas;
let ctx;

let cellSize;
let indent = 1;
let textIndent;
let xShift = 0;
let yShift = 0;

const resizeAll = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cellSize = Math.min(Math.floor((width + indent) / columns - indent), Math.floor((height + indent) / rows - indent));
    const heightField = rows * (cellSize + indent);
    const widthField = columns * (cellSize + indent);
    //console.log(heightField + " " + widthField);
    //console.log(height + " " + width);
    xShift = Math.floor((width - widthField) / 2);
    yShift = Math.floor((height - heightField) / 2);
    textIndent = cellSize / 1.2;
    drawFrame();
};


//server messages
const reconnect = () => {
    connection = 0;
    showPanel();
    clearField();

    console.log("trying to connect to " + server);
    ws = new WebSocket(server);
    ws.onmessage = messageReceived;
    ws.onclose = () => {
        console.log("connection closed");
        reconnect();
    };
    ws.onopen = () => {
        connection = 1;
        console.log("connection established");
    }
};

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
    obj.info = ids[obj.id];
    obj.color = obj.info.color;
    return obj;
};

const messageReceived = (e) => {
    const msg = JSON.parse(e.data);
    //console.log(msg);
    if (msg.act == "init") {
        let {rows, columns} = msg;
        console.log(`Server map size: ${rows} ${columns}`);
        initMap(rows, columns);
        drawFrame()
    }
    updateIds(msg.u);
    const sarr = msg.a;
    if (typeof sarr === "undefined") return;
    const arr = sarr.split("|");
    const events = [];
    for (let i = 0; i < arr.length; i++) {
        events.push(parseCellInfo(arr[i]));
    }
    changeMap(events);
};


//panel
const showPanel = () => {
    if (state === 'panel')
        return;
    state = 'panel';
    $('#overlays').css({"display": "block", "opacity": 0});
    panelOpacity = 0;
    if (connection == 1) ws.send(JSON.stringify({act: "leave"}));
    showingPanel();
};

let panelOpacity = 0;

const showingPanel = () => {
    //console.log("showing " + panelOpacity);
    panelOpacity += 0.02;
    $("#overlays").css("opacity", panelOpacity);
    if (panelOpacity < 1) setTimeout(showingPanel, 0.5);
};

const showGame = () => {
    if (state === 'game' || connection != 1)return;
    state = 'game';
    $("#overlays").css("display", "none");
    ws.send(JSON.stringify({act: "join", "nick": nick}));
};


//map
const clearField = () => {
    initMap(0, 0);
    drawFrame();
};

const initMap = (r, c) => {
    rows = r;
    columns = c;
    for (let i = 0; i < rows; i++) {
        map[i] = [];
        for (let j = 0; j < columns; j++) {
            map[i][j] = {color: "white"};
        }
    }
    resizeAll();
};

//keys
const handleKeypress = (e) => {
    const code = e.keyCode;
    //console.log("Key: " + code);
    if (state == 'game') {
        if (code >= 37 && code <= 40) { //Arrows
            switch (code) {
                case 37:
                    changeDirection("LEFT");
                    break;
                case 38:
                    changeDirection("UP");
                    break;
                case 39:
                    changeDirection("RIGHT");
                    break;
                case 40:
                    changeDirection("DOWN");
                    break;
            }
        }
        if (code == 27) { //Escape
            showPanel();
        }
    }
    if (state == 'panel') {
        if (code == 13) //Enter
            joinGame($('#nick').val());
    }
};

const onKeyDown = (e) => {
    const evt = e || event;
    handleKeypress(evt);
};

const changeDirection = (dir) => {
    if (state !== 'game') return;
    //console.log("New Direction: " + dir);
    ws.send(JSON.stringify({act: "turn", "dir": dir}));
};


//canvas
const drawFrame = () => {
    ctx.fillStyle = defaultColor;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            ctx.fillStyle = map[i][j].color;
            ctx.fillRect(xShift + j * (cellSize + indent), yShift + i * (cellSize + indent), cellSize, cellSize);
            if (typeof map[i][j].points !== "undefined") {
                ctx.fillStyle = "black";
                ctx.font = "bold " + Math.max(0, cellSize - 2) + "px Arial";
                ctx.textAlign = "center";
                ctx.fillText(map[i][j].points + "", xShift + j * (cellSize + indent) + cellSize / 2, yShift + i * (cellSize + indent) + textIndent);
            }
        }
    }
    updateStats();
};

const initCanvas = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };

    canvas.onmousedown = onMouseDown
};

const changeMap = (events) => {
    for (let i = 0; i < events.length; i++) {
        map[events[i].y][events[i].x] = events[i];
        ctx.fillStyle = events[i].color;
        ctx.fillRect(xShift + events[i].x * (cellSize + indent), yShift + events[i].y * (cellSize + indent), cellSize, cellSize);
        if (typeof events[i].points !== "undefined") {
            ctx.fillStyle = 'black';
            ctx.font = 'bold ' + Math.max(0, cellSize - 2) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(events[i].points + "", xShift + events[i].x * (cellSize + indent) + cellSize / 2, yShift + events[i].y * (cellSize + indent) + textIndent);
        }
    }
    updateStats();
};


//stats
const updateStats = () => {
    const stats = {};
    const infos = {};
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const c = map[i][j];
            const info = c.info;
            if (typeof info === "undefined") continue;
            if (!displayAllStats && (info.type == "free" || info.type == "food" || info.type == "block")) continue;
            if (typeof stats[info.id] === "undefined") stats[info.id] = 0;
            stats[info.id]++;
            infos[info.id] = info;
        }
    }
    const arr = [];
    for (let prop in stats) {
        arr.push({id: prop, count: stats[prop], info: infos[prop]});
    }
    arr.sort((a, b) => {
        if (a.count > b.count) return -1;
        if (a.count == b.count) return 0;
        return 1;
    });
    const h = $("#top-list");
    const els = [];
    let pos = 1;
    for (let j = 0; j < arr.length; j++) {
        let name;
        const i = arr[j];
        if (i.info.type == "player") name = i.info.nick;
        else if (i.info.type == "food") name = "Food";
        else if (i.info.type == "free") name = "Empty";
        else if (i.info.type == "block") name = "Block";
        let s = pos + ". " + name + " " + i.count;
        pos++;
        els.push($(document.createElement("p")).addClass("top-element")
            .append($(document.createElement("span")).addClass("color-preview").css("background-color", i.info.color))
            .append($(document.createElement("span")).text(s)));
    }
    h.empty();
    h.append(...els);
};


//mouse
const onMouseDown = (e) => {
    const event = e || window.event;
    let mouseX, mouseY;
    if (document.attachEvent != null) {
        mouseX = window.event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        mouseY = window.event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    } else {
        mouseX = event.clientX + window.scrollX;
        mouseY = event.clientY + window.scrollY;
    }

    //mouseX -= nx;
    //mouseY -= ny;

    const x = mouseX / width;
    const y = mouseY / height;
    //console.log(mouseX + ":" + mouseY);
    //if (x + y <= 1) {
    //	if (x > y) changeDirection(1);
    //	else changeDirection(0);
    //} else {
    //	x = 1 - x;
    //	y = 1 - y;
    //	if (x > y) changeDirection(3);
    //	else changeDirection(2);
    //}
};

//Ids
const ids = {};

const updateIds = (arr) => {
    if (typeof arr === "undefined") return;
    for (let i = 0; i < arr.length; i++) {
        const ii = arr[i];
        ids[ii.id] = ii
    }
};


//ui
const joinGame = (nickname) => {
    nick = nickname;
    console.log("join: " + nickname);
    showGame();
};

const changeServer = (newServer) => {
    if (!newServer) return;
    server = newServer;
    ws.close();
};


//init
const init = () => {
    document.onkeydown = onKeyDown;
    initCanvas();
    initMap(0, 0);
    document.body.onresize = resizeAll;
    reconnect();
};

window.addEventListener("load", init, false);