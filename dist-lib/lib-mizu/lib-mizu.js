/* eslint-disable */

(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	document.querySelector("#time").textContent = new Date().toLocaleTimeString();

	console.log("lib-mizu.js");

}));
