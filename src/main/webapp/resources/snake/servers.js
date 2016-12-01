'use strict';

function Servers() {
	var list = [
		['ws://wrt.qjex.xyz:8080/snake/ws/main', 'main server']
	];
	
	this.getNames = function() {
		var arr = [];
		list.forEach(function(item) {
			arr.push(item[1]);
		});
		return arr;
	};
	
	this.getServer = function(index) {
		if (index < 0 || index >= list.length) return undefined;
		return list[index][0];
	}
}

var servers = new Servers();
