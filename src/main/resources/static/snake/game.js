'use strict';

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

const init = () => {
    document.onkeydown = (e) => {
        const evt = e || event;
        handleKeypress(evt);
    };
    initCanvas();
    initMap(0, 0);
    document.body.onresize = resizeAll;
    reconnect();
};

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
    obj.x = parseInt(info.slice(0, pos1));
    obj.y = parseInt(info.slice(pos1 + 1, pos2));
    obj.color = info.slice(pos2, pos3);
    return obj;
};

const messageReceived = (e) => {
    const msg = e.data;
    //console.log("debug: " + msg);
    //if (msg.length > 0 && msg.startsWith("*")) msg = msg.substring(1);
    const arr = msg.split("|");
    const info = arr[0];
    if (info !== "") { //first message
        const arr2 = info.split(";");
        console.log("Server map size: " + arr2[0] + " " + arr2[1]);
        initMap(arr2[0], arr2[1]);
        drawFrame();
    }
    const events = [];
    for (let i = 1; i < arr.length; i++) {
        events.push(parseCellInfo(arr[i]));
    }
    changeMap(events);
};

const showPanel = () => {
    if (state === 'panel')
        return;
    state = 'panel';
    $('#overlays').css({"display": "block", "opacity": 0});
    panelOpacity = 0;
    if (connection == 1) ws.send("4");
    showingPanel();
};

let panelOpacity = 0;

const showingPanel = () => {
    //console.log("showing " + panelOpacity);
    panelOpacity += 0.02;
    $("#overlays").css(opacity, panelOpacity);
    if (panelOpacity < 1) setTimeout(showingPanel, 0.5);
};

const showGame = () => {
    if (state === 'game' || connection != 1)return;
    state = 'game';
    $("#overlays").css("display", "none");
    ws.send("5" + nick);
};

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
};

const changeDirection = (dir) => {
    if (state !== 'game') return;
    //console.log("New Direction: " + dir);
    ws.send(dir);
};

const handleKeypress = (e) => {
    const code = e.keyCode;
    //console.log("Key: " + code);
    if (state == 'game') {
        if (code >= 37 && code <= 40) //Arrows
            changeDirection(+code - 37);
        if (code == 27) //Escape
            showPanel();
    }
    if (state == 'panel') {
        if (code == 13) //Enter
            joinGame(document.getElementById('nick').value);
    }
};

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
};

let initCanvas = () => {
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

    canvas.onmousedown = function(e) {
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
    }
};

window.addEventListener("load", init, false);

const joinGame = (nickname) => {
    nick = nickname;
    showGame();
};

const changeServer = (newServer) => {
    if (!newServer) return;
    server = newServer;
    ws.close();
};