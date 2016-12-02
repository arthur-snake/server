'use strict';

function Game() {
    //Connection
    var server = servers.getServer(0);
    var connection = 0;
    var state = 'panel';
    var ws;
    var nick;

    //Constants
    var snakeColor = "#4B77BE";
    var defaultColor = "#EEEEEE";

    //Map
    var rows;
    var columns;
    var map = [];

    //Canvas
    var height;
    var width;
    var requestAnimFrame;
    var canvas;
    var ctx;

    var cellSize;
    var indent = 1;
    var textIndent;
    var xShift = 0;
    var yShift = 0;

    var init = function() {
        document.onkeydown = function(e) {
            var evt = e || event;
            handleKeypress(evt);
        };
        initCanvas();
        initMap(0, 0);
        document.body.onresize = resizeAll;
        reconnect();
    }

    var resizeAll = function() {
        width = canvas.width = document.body.clientWidth;
        height = canvas.height = document.body.clientHeight;
        cellSize = Math.min(Math.floor((width + indent) / columns - indent), Math.floor((height + indent) / rows - indent));
        var heightField = rows * (cellSize + indent);
        var widthField = columns * (cellSize + indent);
        //console.log(heightField + " " + widthField);
        //console.log(height + " " + width);
        xShift = Math.floor((width - widthField) / 2);
        yShift = Math.floor((height - heightField) / 2);
        textIndent = cellSize / 1.2;
        drawFrame();
    }

    var reconnect = function() {
        connection = 0;
        showPanel();
        clearField();

        console.log("trying to connect to " + server);
        ws = new WebSocket(server);
        ws.onmessage = messageReceived;
        ws.onclose = function() {
            console.log("connection closed");
            reconnect();
        }
        ws.onopen = function() {
            connection = 1;
            console.log("connection established");
        }
    }

    var parseCellInfo = function(info) {
        var obj = {};
        var pos1 = info.indexOf('.');
        var pos2 = info.indexOf('#');
        var pos3 = info.indexOf('*');
        if (pos3 != -1) {
            obj.points = parseInt(info.slice(pos3 + 1));
        } else {
            pos3 = info.length;
        }
        obj.x = parseInt(info.slice(0, pos1));
        obj.y = parseInt(info.slice(pos1 + 1, pos2));
        obj.color = info.slice(pos2, pos3);
        return obj;
    }

    var messageReceived = function(e) {
        var msg = e.data;
        console.log("debug: " + msg);
        //if (msg.length > 0 && msg.startsWith("*")) msg = msg.substring(1);
        var arr = msg.split("|");
        var info = arr[0];
        if (info !== "") { //first message
            var arr2 = info.split(";");
            console.log("Server map size: " + arr2[0] + " " + arr2[1]);
            initMap(arr2[0], arr2[1]);
            drawFrame();
        }
        var events = [];
        for (var i = 1; i < arr.length; i++) {
            events.push(parseCellInfo(arr[i]));
        }
        changeMap(events);
    }

    var showPanel = function() {
        if (state === 'panel')
            return;
        state = 'panel';
        document.getElementById('overlays').style.display = 'block';
        panelOpacity = 0;
        document.getElementById('overlays').style.opacity = 0;
        if (connection == 1)
            ws.send("4");
        showingPanel();
    }

    var panelOpacity = 0;

    var showingPanel = function() {
        //console.log("showing " + panelOpacity);
        panelOpacity += 0.02;
        document.getElementById('overlays').style.opacity = panelOpacity;
        if (panelOpacity < 1)
            setTimeout(showingPanel, 0.5);
    }

    var showGame = function() {
        if (state === 'game' || connection != 1)
            return;
        state = 'game';
        document.getElementById('overlays').style.display = 'none';
        ws.send("5" + nick);
    }

    var clearField = function() {
        initMap(0, 0);
        drawFrame();
    }

    var initMap = function(r, c) {
        rows = r;
        columns = c;
        for (var i = 0; i < rows; i++) {
            map[i] = [];
            for (var j = 0; j < columns; j++) {
                map[i][j] = {color: "white"};
            }
        }
        resizeAll();
    };

    var changeMap = function(events) {
        for (var i = 0; i < events.length; i++) {
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

    var changeDirection = function(dir) {
        if (state !== 'game') return;
        //console.log("New Direction: " + dir);
        ws.send(dir);
    };

    var handleKeypress = function(e) {
        var code = e.keyCode;
        //console.log("Key: " + code);
        if (state == 'game') {
            if (code >= 37 && code <= 40) //Arrows
                changeDirection(+code - 37);
            if (code == 27) //Escape
                showPanel();
        }
        if (state == 'panel') {
            if (code == 13) //Enter
                game.join(document.getElementById('nick').value);
        }
    };

    var drawFrame = function() {
        ctx.fillStyle = defaultColor;
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
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

    var initCanvas = function() {
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
            var event = e || window.event;
            var mouseX, mouseY;
            if (document.attachEvent != null) {
                mouseX = window.event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
                mouseY = window.event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
            } else {
                mouseX = event.clientX + window.scrollX;
                mouseY = event.clientY + window.scrollY;
            }

            //mouseX -= nx;
            //mouseY -= ny;

            var x = mouseX / width;
            var y = mouseY / height;
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

    this.join = function(nickname) {
        nick = nickname;
        showGame();
    }

    this.changeServer = function(newServer) {
        if (!newServer) return;
        server = newServer;
        ws.close();
    }
};

var game = new Game();