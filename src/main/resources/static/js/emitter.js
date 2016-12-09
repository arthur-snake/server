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