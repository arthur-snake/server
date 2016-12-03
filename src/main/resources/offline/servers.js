'use strict';

function Servers() {
    const list = [
        ["ws://wrt.qjex.xyz:8080/snake/ws/main", "main server"]
    ];

    this.getNames = () => {
        const arr = [];
        list.forEach((item) => arr.push(item[1]));
        return arr;
    };

    this.getServer = (index) => {
        if (index < 0 || index >= list.length) return undefined;
        return list[index][0];
    }
}

const servers = new Servers();