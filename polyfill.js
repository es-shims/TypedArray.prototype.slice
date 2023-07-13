'use strict';

var callBind = require('call-bind');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var $strSlice = callBound('String.prototype.slice');

var implementation = require('./implementation');

var ownSlice = null;
if (typeof Uint8Array === 'function' && !Uint8Array.prototype.slice && new Uint8Array(0).slice) {
	// node < 0.12 has typed arrays but only an own slice, that's specific for each type
	var map = {
		$Float32Array: callBind(new Float32Array(0).slice),
		$Float64Array: callBind(new Float64Array(0).slice),
		$Int8Array: callBind(new Int8Array(0).slice),
		$Int16Array: callBind(new Int16Array(0).slice),
		$Int32Array: callBind(new Int32Array(0).slice),
		$Uint8Array: callBind(new Uint8Array(0).slice),
		$Uint8ClampedArray: typeof Uint8ClampedArray !== 'undefined' && callBind(new Uint8ClampedArray(0).slice), // node 0.6 lacks Uint8ClampedArray
		$Uint16Array: callBind(new Uint16Array(0).slice),
		$Uint32Array: callBind(new Uint32Array(0).slice),
		__proto__: null
	};
	ownSlice = function slice(start, end) {
		var fn = map['$' + $strSlice($toString(this), 8, -1)];
		/* eslint no-invalid-this: 0 */
		if (arguments.length < 2) {
			return fn(this, arguments.length > 0 ? start : 0);
		}
		return fn(this, start, end);
	};
}

module.exports = function getPolyfill() {
	return (typeof Uint8Array === 'function' && Uint8Array.prototype.slice)
		|| ownSlice
		|| implementation;
};
