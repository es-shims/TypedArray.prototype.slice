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
	var dispatch = function dispatchSlice(fn, arr, args) {
		if (args.length < 2) {
			return fn(arr, args.length > 0 ? args[0] : 0);
		}
		return fn(arr, args[0], args[1]);
	};
	// eslint-disable-next-line no-unused-vars
	ownSlice = function slice(start, end) {
		var fn = map['$' + $strSlice($toString(this), 8, -1)];
		if (!fn) {
			/* eslint max-depth: 0 */
			try {
				return dispatch(map.$Float32Array, this, arguments);
			} catch (e) {
				try {
					return dispatch(map.$Float64Array, this, arguments);
				} catch (e1) {
					try {
						return dispatch(map.$Int8Array, this, arguments);
					} catch (e2) {
						try {
							return dispatch(map.$Uint8Array, this, arguments);
						} catch (e3) {
							try {
								return dispatch(map.$Uint8ClampedArray, this, arguments);
							} catch (e4) {
								try {
									return dispatch(map.$Int16Array, this, arguments);
								} catch (e5) {
									try {
										return dispatch(map.$Uint16Array, this, arguments);
									} catch (e6) {
										try {
											return dispatch(map.$Int32Array, this, arguments);
										} catch (e7) {
											return dispatch(map.$Uint32Array, this, arguments);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		/* eslint no-invalid-this: 0 */
		return dispatch(fn, this, arguments);
	};
}

module.exports = function getPolyfill() {
	return (typeof Uint8Array === 'function' && Uint8Array.prototype.slice)
		|| ownSlice
		|| implementation;
};
