// ~ ~ ~ ~ ~ ~
var canvas = document.querySelector('canvas');

function ajustarTamañoDeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

var contexto = canvas.getContext('2d');

function configurarCanvas() {
	contexto.textAlign = 'center';
	contexto.textBaseline = 'middle';
}

ajustarTamañoDeCanvas();
configurarCanvas();

window.addEventListener('resize', function() {
	ajustarTamañoDeCanvas();
	configurarCanvas();
	dibujarMuro();
});

// ~ ~ ~ ~ ~ ~
function Vector(x, y) {
	this.x = x;
	this.y = y;
}
Vector.prototype.más = function(vector) {
	return new Vector(this.x + vector.x, this.y + vector.y);
}
Vector.prototype.menos = function(vector) {
	return new Vector(this.x - vector.x, this.y - vector.y);
}
Vector.prototype.toString = function() {
	return this.x + ',' + this.y;
}
Vector.fromString = function(str) {
	var arr = str.split(',');
	return new Vector(Number(arr[0]), Number(arr[1]));
}

function Selección(comienzo, fin) {
	this.comienzo = comienzo;
	this.fin = fin;
}
Selección.prototype.mínimo = function() {
	return new Vector(Math.min(this.comienzo.x, this.fin.x),
	                  Math.min(this.comienzo.y, this.fin.y));
}
Selección.prototype.máximo = function() {
	return new Vector(Math.max(this.comienzo.x, this.fin.x),
	                  Math.max(this.comienzo.y, this.fin.y));
}
Selección.prototype.ancho = function() {
	return Math.abs(this.comienzo.x - this.fin.x);
}
Selección.prototype.alto = function() {
	return Math.abs(this.comienzo.y - this.fin.y);
}
Selección.prototype.forEach = function(callback, thisArg) {
	var min = this.mínimo(), max = this.máximo();
	for(var y = min.y; y <= max.y; y++)
		for(var x = min.x; x <= max.x; x++)
			callback.call(thisArg, new Vector(x, y));
}

// ~ ~ ~ ~ ~ ~
var cursor = new Vector(0, 0);
if(localStorage.getItem('cursor'))
	cursor = Vector.fromString(localStorage.getItem('cursor'));

if(localStorage.getItem('grilla'))
	var grilla = JSON.parse(localStorage.getItem('grilla'));
else
	var grilla = JSON.parse('{"5,3":{"caracter":"E"},"6,3":{"caracter":"s"},"7,3":{"caracter":"t"},"8,3":{"caracter":"e"},"10,3":{"caracter":"e"},"11,3":{"caracter":"s"},"13,3":{"caracter":"u"},"14,3":{"caracter":"n"},"16,3":{"caracter":"e"},"17,3":{"caracter":"d"},"18,3":{"caracter":"i"},"19,3":{"caracter":"t"},"20,3":{"caracter":"o"},"21,3":{"caracter":"r"},"23,3":{"caracter":"l"},"24,3":{"caracter":"i"},"25,3":{"caracter":"b"},"26,3":{"caracter":"r"},"27,3":{"caracter":"e"},"29,3":{"caracter":"d"},"30,3":{"caracter":"e"},"32,3":{"italic":true,"caracter":"m"},"33,3":{"italic":true,"caracter":"u"},"34,3":{"italic":true,"caracter":"r"},"35,3":{"italic":true,"caracter":"o"},"36,3":{"caracter":"."},"38,3":{"caracter":"A"},"39,3":{"caracter":"c"},"40,3":{"caracter":"á"},"42,3":{"caracter":"p"},"43,3":{"caracter":"o"},"44,3":{"caracter":"d"},"45,3":{"caracter":"é"},"46,3":{"caracter":"s"},"5,4":{"caracter":"e"},"6,4":{"caracter":"s"},"7,4":{"caracter":"c"},"8,4":{"caracter":"r"},"9,4":{"caracter":"i"},"10,4":{"caracter":"b"},"11,4":{"caracter":"i"},"12,4":{"caracter":"r"},"14,4":{"caracter":"l"},"15,4":{"caracter":"o"},"17,4":{"caracter":"q"},"18,4":{"caracter":"u"},"19,4":{"caracter":"e"},"21,4":{"caracter":"q"},"22,4":{"caracter":"u"},"23,4":{"caracter":"i"},"24,4":{"caracter":"e"},"25,4":{"caracter":"r"},"26,4":{"caracter":"a"},"27,4":{"caracter":"s"},"29,4":{"caracter":"e"},"30,4":{"caracter":"n"},"32,4":{"caracter":"d"},"33,4":{"caracter":"o"},"34,4":{"caracter":"n"},"35,4":{"caracter":"d"},"36,4":{"caracter":"e"},"38,4":{"caracter":"q"},"39,4":{"caracter":"u"},"40,4":{"caracter":"i"},"41,4":{"caracter":"e"},"42,4":{"caracter":"r"},"43,4":{"caracter":"a"},"44,4":{"caracter":"s"},"45,4":{"caracter":"."},"5,6":{"caracter":"T"},"6,6":{"caracter":"e"},"7,6":{"caracter":"n"},"8,6":{"caracter":"é"},"9,6":{"caracter":"s"},"11,6":{"caracter":"d"},"12,6":{"caracter":"i"},"13,6":{"caracter":"s"},"14,6":{"caracter":"p"},"15,6":{"caracter":"o"},"16,6":{"caracter":"n"},"17,6":{"caracter":"i"},"18,6":{"caracter":"b"},"19,6":{"caracter":"l"},"20,6":{"caracter":"e"},"21,6":{"caracter":"s"},"23,6":{"caracter":"a"},"24,6":{"caracter":"l"},"25,6":{"caracter":"g"},"26,6":{"caracter":"u"},"27,6":{"caracter":"n"},"28,6":{"caracter":"a"},"29,6":{"caracter":"s"},"31,6":{"caracter":"h"},"32,6":{"caracter":"e"},"33,6":{"caracter":"r"},"34,6":{"caracter":"r"},"35,6":{"caracter":"a"},"36,6":{"caracter":"m"},"37,6":{"caracter":"i"},"38,6":{"caracter":"e"},"39,6":{"caracter":"n"},"40,6":{"caracter":"t"},"41,6":{"caracter":"a"},"42,6":{"caracter":"s"},"44,6":{"caracter":"b"},"45,6":{"caracter":"á"},"46,6":{"caracter":"s"},"47,6":{"caracter":"i"},"48,6":{"caracter":"c"},"49,6":{"caracter":"a"},"50,6":{"caracter":"s"},"52,6":{"caracter":"d"},"53,6":{"caracter":"e"},"55,6":{"caracter":"e"},"56,6":{"caracter":"d"},"57,6":{"caracter":"i"},"58,6":{"caracter":"c"},"59,6":{"caracter":"i"},"60,6":{"caracter":"ó"},"61,6":{"caracter":"n"},"62,6":{"caracter":":"},"5,7":{"caracter":"P"},"6,7":{"caracter":"r"},"7,7":{"caracter":"o"},"8,7":{"caracter":"b"},"9,7":{"caracter":"a"},"11,7":{"caracter":"u"},"12,7":{"caracter":"s"},"13,7":{"caracter":"a"},"14,7":{"caracter":"r"},"16,7":{"caracter":"e"},"17,7":{"caracter":"l"},"19,7":{"bold":true,"caracter":"S"},"20,7":{"bold":true,"caracter":"h"},"21,7":{"bold":true,"caracter":"i"},"22,7":{"bold":true,"caracter":"f"},"23,7":{"bold":true,"caracter":"t"},"25,7":{"caracter":"p"},"26,7":{"caracter":"a"},"27,7":{"caracter":"r"},"28,7":{"caracter":"a"},"30,7":{"caracter":"c"},"31,7":{"caracter":"r"},"32,7":{"caracter":"e"},"33,7":{"caracter":"a"},"34,7":{"caracter":"r"},"36,7":{"caracter":"s"},"37,7":{"caracter":"e"},"38,7":{"caracter":"l"},"39,7":{"caracter":"e"},"40,7":{"caracter":"c"},"41,7":{"caracter":"c"},"42,7":{"caracter":"i"},"43,7":{"caracter":"o"},"44,7":{"caracter":"n"},"45,7":{"caracter":"e"},"46,7":{"caracter":"s"},"47,7":{"caracter":"."},"5,8":{"caracter":"E"},"6,8":{"caracter":"l"},"8,8":{"bold":true,"caracter":"C"},"9,8":{"bold":true,"caracter":"t"},"10,8":{"bold":true,"caracter":"r"},"11,8":{"bold":true,"caracter":"l"},"13,8":{"caracter":"s"},"14,8":{"caracter":"e"},"16,8":{"caracter":"u"},"17,8":{"caracter":"s"},"18,8":{"caracter":"a"},"20,8":{"caracter":"p"},"21,8":{"caracter":"a"},"22,8":{"caracter":"r"},"23,8":{"caracter":"a"},"25,8":{"caracter":"m"},"26,8":{"caracter":"o"},"27,8":{"caracter":"v"},"28,8":{"caracter":"e"},"29,8":{"caracter":"r"},"5,9":{"caracter":"S"},"6,9":{"caracter":"i"},"8,9":{"caracter":"q"},"9,9":{"caracter":"u"},"10,9":{"caracter":"e"},"11,9":{"caracter":"r"},"12,9":{"caracter":"é"},"13,9":{"caracter":"s"},"15,9":{"caracter":"c"},"16,9":{"caracter":"o"},"17,9":{"caracter":"p"},"18,9":{"caracter":"i"},"19,9":{"caracter":"a"},"20,9":{"caracter":"r"},"22,9":{"caracter":"e"},"23,9":{"caracter":"n"},"25,9":{"caracter":"v"},"26,9":{"caracter":"e"},"27,9":{"caracter":"z"},"29,9":{"caracter":"d"},"30,9":{"caracter":"e"},"32,9":{"caracter":"m"},"33,9":{"caracter":"o"},"34,9":{"caracter":"v"},"35,9":{"caracter":"e"},"36,9":{"caracter":"r"},"37,9":{"caracter":","},"39,9":{"caracter":"u"},"40,9":{"caracter":"s"},"41,9":{"caracter":"á"},"43,9":{"bold":true,"caracter":"S"},"44,9":{"bold":true,"caracter":"h"},"45,9":{"bold":true,"caracter":"i"},"46,9":{"bold":true,"caracter":"f"},"47,9":{"bold":true,"caracter":"t"},"48,9":{"bold":true,"caracter":"+"},"49,9":{"bold":true,"caracter":"C"},"50,9":{"bold":true,"caracter":"t"},"51,9":{"bold":true,"caracter":"r"},"52,9":{"bold":true,"caracter":"l"},"53,9":{"caracter":"."},"31,8":{"caracter":"c"},"32,8":{"caracter":"o"},"33,8":{"caracter":"s"},"34,8":{"caracter":"a"},"35,8":{"caracter":"s"},"36,8":{"caracter":"."},"5,13":{"caracter":"="},"6,13":{"caracter":"="},"7,13":{"caracter":"="},"8,13":{"caracter":"="},"9,13":{"caracter":"="},"10,13":{"caracter":"="},"11,13":{"caracter":"="},"12,13":{"caracter":"="},"13,13":{"caracter":"="},"14,13":{"caracter":"="},"15,13":{"caracter":"="},"16,13":{"caracter":"="},"17,13":{"caracter":"="},"18,13":{"caracter":"="},"19,13":{"caracter":"="},"20,13":{"caracter":"="},"21,13":{"caracter":"="},"22,13":{"caracter":"="},"23,13":{"caracter":"="},"24,13":{"caracter":"="},"25,13":{"caracter":"="},"26,13":{"caracter":"="},"27,13":{"caracter":"="},"28,13":{"caracter":"="},"29,13":{"caracter":"="},"30,13":{"caracter":"="},"31,13":{"caracter":"="},"32,13":{"caracter":"="},"33,13":{"caracter":"="},"34,13":{"caracter":"="},"35,13":{"caracter":"="},"36,13":{"caracter":"="},"37,13":{"caracter":"="},"38,13":{"caracter":"="},"39,13":{"caracter":"="},"40,13":{"caracter":"="},"41,13":{"caracter":"="},"42,13":{"caracter":"="},"43,13":{"caracter":"="},"44,13":{"caracter":"="},"45,13":{"caracter":"="},"46,13":{"caracter":"="},"47,13":{"caracter":"="},"48,13":{"caracter":"="},"49,13":{"caracter":"="},"50,13":{"caracter":"="},"51,13":{"caracter":"="},"52,13":{"caracter":"="},"53,13":{"caracter":"="},"54,13":{"caracter":"="},"55,13":{"caracter":"="},"56,13":{"caracter":"="},"57,13":{"caracter":"="},"58,13":{"caracter":"="},"59,13":{"caracter":"="},"60,13":{"caracter":"="},"61,13":{"caracter":"="},"5,15":{"caracter":"T"},"6,15":{"caracter":"h"},"7,15":{"caracter":"i"},"8,15":{"caracter":"s"},"10,15":{"caracter":"i"},"11,15":{"caracter":"s"},"13,15":{"caracter":"a"},"15,15":{"caracter":"f"},"16,15":{"caracter":"r"},"17,15":{"caracter":"e"},"18,15":{"caracter":"e"},"20,15":{"italic":true,"caracter":"w"},"21,15":{"italic":true,"caracter":"a"},"22,15":{"italic":true,"caracter":"l"},"23,15":{"italic":true,"caracter":"l"},"25,15":{"caracter":"e"},"26,15":{"caracter":"d"},"27,15":{"caracter":"i"},"28,15":{"caracter":"t"},"29,15":{"caracter":"o"},"30,15":{"caracter":"r"},"31,15":{"caracter":"."},"33,15":{"caracter":"H"},"34,15":{"caracter":"e"},"35,15":{"caracter":"r"},"36,15":{"caracter":"e"},"37,15":{"caracter":","},"39,15":{"caracter":"y"},"40,15":{"caracter":"o"},"41,15":{"caracter":"u"},"43,15":{"caracter":"c"},"44,15":{"caracter":"a"},"45,15":{"caracter":"n"},"5,16":{"caracter":"w"},"6,16":{"caracter":"r"},"7,16":{"caracter":"i"},"8,16":{"caracter":"t"},"9,16":{"caracter":"e"},"11,16":{"caracter":"d"},"12,16":{"caracter":"o"},"13,16":{"caracter":"w"},"14,16":{"caracter":"n"},"16,16":{"caracter":"e"},"17,16":{"caracter":"v"},"18,16":{"caracter":"e"},"19,16":{"caracter":"r"},"20,16":{"caracter":"y"},"21,16":{"caracter":"t"},"22,16":{"caracter":"h"},"23,16":{"caracter":"i"},"24,16":{"caracter":"n"},"25,16":{"caracter":"g"},"27,16":{"caracter":"y"},"28,16":{"caracter":"o"},"29,16":{"caracter":"u"},"31,16":{"caracter":"w"},"32,16":{"caracter":"a"},"33,16":{"caracter":"n"},"34,16":{"caracter":"t"},"36,16":{"caracter":"w"},"37,16":{"caracter":"h"},"38,16":{"caracter":"e"},"39,16":{"caracter":"r"},"40,16":{"caracter":"e"},"42,16":{"caracter":"y"},"43,16":{"caracter":"o"},"44,16":{"caracter":"u"},"46,16":{"caracter":"w"},"47,16":{"caracter":"a"},"48,16":{"caracter":"n"},"49,16":{"caracter":"t"},"51,16":{"caracter":"t"},"52,16":{"caracter":"o"},"53,16":{"caracter":"."},"5,18":{"caracter":"Y"},"6,18":{"caracter":"o"},"7,18":{"caracter":"u"},"9,18":{"caracter":"h"},"10,18":{"caracter":"a"},"11,18":{"caracter":"v"},"12,18":{"caracter":"e"},"14,18":{"caracter":"a"},"15,18":{"caracter":"v"},"16,18":{"caracter":"a"},"17,18":{"caracter":"i"},"18,18":{"caracter":"l"},"19,18":{"caracter":"a"},"20,18":{"caracter":"b"},"21,18":{"caracter":"l"},"22,18":{"caracter":"e"},"24,18":{"caracter":"s"},"25,18":{"caracter":"o"},"26,18":{"caracter":"m"},"27,18":{"caracter":"e"},"29,18":{"caracter":"b"},"30,18":{"caracter":"a"},"31,18":{"caracter":"s"},"32,18":{"caracter":"i"},"33,18":{"caracter":"c"},"35,18":{"caracter":"e"},"36,18":{"caracter":"d"},"37,18":{"caracter":"i"},"38,18":{"caracter":"t"},"39,18":{"caracter":"i"},"40,18":{"caracter":"n"},"41,18":{"caracter":"g"},"43,18":{"caracter":"t"},"44,18":{"caracter":"o"},"45,18":{"caracter":"o"},"46,18":{"caracter":"l"},"47,18":{"caracter":"s"},"48,18":{"caracter":":"},"5,19":{"bold":true,"caracter":"S"},"6,19":{"bold":true,"caracter":"h"},"7,19":{"bold":true,"caracter":"i"},"8,19":{"bold":true,"caracter":"f"},"9,19":{"bold":true,"caracter":"t"},"11,19":{"caracter":"i"},"12,19":{"caracter":"s"},"14,19":{"caracter":"u"},"15,19":{"caracter":"s"},"16,19":{"caracter":"e"},"17,19":{"caracter":"d"},"19,19":{"caracter":"t"},"20,19":{"caracter":"o"},"22,19":{"caracter":"c"},"23,19":{"caracter":"r"},"24,19":{"caracter":"e"},"25,19":{"caracter":"a"},"26,19":{"caracter":"t"},"27,19":{"caracter":"e"},"29,19":{"caracter":"s"},"30,19":{"caracter":"e"},"31,19":{"caracter":"l"},"32,19":{"caracter":"e"},"33,19":{"caracter":"c"},"34,19":{"caracter":"t"},"35,19":{"caracter":"i"},"36,19":{"caracter":"o"},"37,19":{"caracter":"n"},"38,19":{"caracter":"s"},"39,19":{"caracter":"."},"5,20":{"bold":true,"caracter":"C"},"6,20":{"bold":true,"caracter":"t"},"7,20":{"bold":true,"caracter":"r"},"8,20":{"bold":true,"caracter":"l"},"10,20":{"caracter":"i"},"11,20":{"caracter":"s"},"13,20":{"caracter":"u"},"14,20":{"caracter":"s"},"15,20":{"caracter":"e"},"16,20":{"caracter":"d"},"18,20":{"caracter":"t"},"19,20":{"caracter":"o"},"21,20":{"caracter":"m"},"22,20":{"caracter":"o"},"23,20":{"caracter":"v"},"24,20":{"caracter":"e"},"26,20":{"caracter":"t"},"27,20":{"caracter":"h"},"28,20":{"caracter":"i"},"29,20":{"caracter":"n"},"30,20":{"caracter":"g"},"31,20":{"caracter":"s"},"33,20":{"caracter":"a"},"34,20":{"caracter":"r"},"35,20":{"caracter":"o"},"36,20":{"caracter":"u"},"37,20":{"caracter":"n"},"38,20":{"caracter":"d"},"39,20":{"caracter":"."},"5,21":{"caracter":"C"},"6,21":{"caracter":"o"},"7,21":{"caracter":"m"},"8,21":{"caracter":"b"},"9,21":{"caracter":"i"},"10,21":{"caracter":"n"},"11,21":{"caracter":"e"},"13,21":{"caracter":"t"},"14,21":{"caracter":"h"},"15,21":{"caracter":"e"},"17,21":{"caracter":"t"},"18,21":{"caracter":"w"},"19,21":{"caracter":"o"},"21,21":{"caracter":"t"},"22,21":{"caracter":"o"},"24,21":{"caracter":"c"},"25,21":{"caracter":"o"},"26,21":{"caracter":"p"},"27,21":{"caracter":"y"},"29,21":{"caracter":"t"},"30,21":{"caracter":"h"},"31,21":{"caracter":"i"},"32,21":{"caracter":"n"},"33,21":{"caracter":"g"},"34,21":{"caracter":"s"},"35,21":{"caracter":"."},"5,11":{"caracter":"U"},"6,11":{"caracter":"s"},"7,11":{"caracter":"á"},"9,11":{"bold":true,"caracter":"C"},"10,11":{"bold":true,"caracter":"t"},"11,11":{"bold":true,"caracter":"r"},"12,11":{"bold":true,"caracter":"l"},"14,11":{"bold":true,"caracter":"B"},"15,11":{"caracter":","},"17,11":{"bold":true,"caracter":"I"},"18,11":{"caracter":","},"20,11":{"bold":true,"caracter":"U"},"21,11":{"caracter":","},"23,11":{"caracter":"o"},"25,11":{"bold":true,"caracter":"S"},"27,11":{"caracter":"p"},"28,11":{"caracter":"a"},"29,11":{"caracter":"r"},"30,11":{"caracter":"a"},"32,11":{"bold":true,"caracter":"n"},"33,11":{"bold":true,"caracter":"e"},"34,11":{"bold":true,"caracter":"g"},"35,11":{"bold":true,"caracter":"r"},"36,11":{"bold":true,"caracter":"i"},"37,11":{"bold":true,"caracter":"t"},"38,11":{"bold":true,"caracter":"a"},"39,11":{"bold":true,"caracter":","},"41,11":{"italic":true,"caracter":"i"},"42,11":{"italic":true,"caracter":"t"},"43,11":{"italic":true,"caracter":"á"},"44,11":{"italic":true,"caracter":"l"},"45,11":{"italic":true,"caracter":"i"},"46,11":{"italic":true,"caracter":"c"},"47,11":{"italic":true,"caracter":"a"},"48,11":{"italic":true,"caracter":","},"50,11":{"underline":true,"caracter":"s"},"51,11":{"underline":true,"caracter":"u"},"52,11":{"underline":true,"caracter":"b"},"53,11":{"underline":true,"caracter":"r"},"54,11":{"underline":true,"caracter":"a"},"55,11":{"underline":true,"caracter":"y"},"56,11":{"underline":true,"caracter":"a"},"57,11":{"underline":true,"caracter":"d"},"58,11":{"underline":true,"caracter":"o"},"59,11":{"caracter":",","underline":true},"61,11":{"caracter":"o"},"63,11":{"stroke":true,"caracter":"s"},"64,11":{"stroke":true,"caracter":"t"},"65,11":{"stroke":true,"caracter":"r"},"66,11":{"stroke":true,"caracter":"o"},"67,11":{"stroke":true,"caracter":"k"},"68,11":{"stroke":true,"caracter":"e"},"69,11":{"caracter":"."},"5,23":{"caracter":"Y"},"6,23":{"caracter":"o"},"7,23":{"caracter":"u"},"9,23":{"caracter":"m"},"10,23":{"caracter":"a"},"11,23":{"caracter":"y"},"13,23":{"caracter":"u"},"14,23":{"caracter":"s"},"15,23":{"caracter":"e"},"17,23":{"bold":true,"caracter":"C"},"18,23":{"bold":true,"caracter":"t"},"19,23":{"bold":true,"caracter":"r"},"20,23":{"bold":true,"caracter":"l"},"22,23":{"bold":true,"caracter":"B"},"23,23":{"bold":true,"caracter":","},"25,23":{"bold":true,"caracter":"I"},"26,23":{"bold":true,"caracter":","},"28,23":{"bold":true,"caracter":"U"},"30,23":{"caracter":"o"},"31,23":{"caracter":"r"},"33,23":{"bold":true,"caracter":"S"},"35,23":{"caracter":"t"},"36,23":{"caracter":"o"},"38,23":{"caracter":"s"},"39,23":{"caracter":"t"},"40,23":{"caracter":"y"},"41,23":{"caracter":"l"},"42,23":{"caracter":"e"},"44,23":{"caracter":"t"},"45,23":{"caracter":"e"},"46,23":{"caracter":"x"},"47,23":{"caracter":"t"},"49,23":{"caracter":"w"},"50,23":{"caracter":"i"},"51,23":{"caracter":"t"},"52,23":{"caracter":"h"},"54,23":{"bold":true,"caracter":"b"},"55,23":{"bold":true,"caracter":"o"},"56,23":{"bold":true,"caracter":"l"},"57,23":{"bold":true,"caracter":"d"},"58,23":{"bold":true,"caracter":","},"60,23":{"italic":true,"caracter":"i"},"61,23":{"italic":true,"caracter":"t"},"62,23":{"italic":true,"caracter":"a"},"63,23":{"italic":true,"caracter":"l"},"64,23":{"italic":true,"caracter":"i"},"65,23":{"italic":true,"caracter":"c"},"66,23":{"italic":true,"caracter":","},"5,24":{"underline":true,"caracter":"u"},"6,24":{"underline":true,"caracter":"n"},"7,24":{"underline":true,"caracter":"d"},"8,24":{"underline":true,"caracter":"e"},"9,24":{"underline":true,"caracter":"r"},"10,24":{"underline":true,"caracter":"l"},"11,24":{"underline":true,"caracter":"i"},"12,24":{"underline":true,"caracter":"n"},"13,24":{"underline":true,"caracter":"e"},"14,24":{"underline":true,"caracter":","},"16,24":{"caracter":"o"},"17,24":{"caracter":"r"},"19,24":{"stroke":true,"caracter":"s"},"20,24":{"stroke":true,"caracter":"t"},"21,24":{"stroke":true,"caracter":"r"},"22,24":{"stroke":true,"caracter":"o"},"23,24":{"stroke":true,"caracter":"k"},"24,24":{"stroke":true,"caracter":"e"},"25,24":{"caracter":"."}}');


var estilo = {};
if(localStorage.getItem('estilo'))
	estilo = JSON.parse(localStorage.getItem('estilo'));

var selección = null;
var nuevaLínea = cursor.x; // posición x del cursor al pulsar ENTER.
var historia = JSON.stringify(grilla); // historia se guarda para poder hacer Ctrl-Z

// ~ ~ ~ ~ ~ ~ autosave:
setInterval(function() {
	localStorage.setItem('cursor', cursor.toString());
	localStorage.setItem('grilla', JSON.stringify(grilla));
	localStorage.setItem('estilo', JSON.stringify(estilo));
}, 5000);

// ~ ~ ~ ~ ~ ~
var escala = new Vector(12, 16);
var fontSize = '16px';

var dibujarMuro = (function() {
	var fuente = fontSize + '"Roboto Mono", monospace';
	function dibujarLínea(contexto, x1, y1, x2, y2) {
		contexto.beginPath();
		contexto.moveTo(x1, y1);
		contexto.lineTo(x2, y2);
		contexto.stroke();
	}
	function dibujarGrilla() {
		for(var coordenadas in grilla) {
			if(grilla.hasOwnProperty(coordenadas)) {
				var bloque = grilla[coordenadas];
				if(bloque) {
					var posición = Vector.fromString(coordenadas);
					
					if(bloque.caracter) {
						var estilo = (bloque.italic ? 'italic ' : '') +
												 (bloque.bold ? 'bold ' : '');
						contexto.font = estilo + fuente;
						contexto.fillText(bloque.caracter,
						                  (posición.x+.5)*escala.x, (posición.y+.5)*escala.y);
					}
					if(bloque.underline) {
						var y = (posición.y + 1) * escala.y - 0.5;
						dibujarLínea(contexto, posición.x * escala.x, y, (posición.x + 1) * escala.x, y);
					}
					if(bloque.stroke) {
						var y = (posición.y + 0.5) * escala.y + 0.5;
						dibujarLínea(contexto, posición.x * escala.x, y, (posición.x + 1) * escala.x, y);
					}
				}
			}
		}
	}
	function dibujarCursor() {
		contexto.strokeRect(cursor.x * escala.x - 0.5, cursor.y * escala.y - 0.5,
		                    escala.x + 1, escala.y + 1);
	}
	function dibujarSelección() {
		var min = selección.mínimo();
		contexto.setLineDash([4, 4]);
		contexto.strokeRect(min.x * escala.x - 0.5, min.y * escala.y - 0.5,
		                    (selección.ancho() + 1) * escala.x + 1, (selección.alto() + 1) * escala.y + 1);
		contexto.setLineDash([]);
	}
	
	return function dibujarMuro() {
		contexto.clearRect(0, 0, canvas.width, canvas.height);
		dibujarGrilla();
		if(selección) {
			dibujarSelección();
			mostrarInformaciónDeEstilo(grilla[selección.comienzo]);
		} else {
			dibujarCursor();
			mostrarInformaciónDeEstilo(estilo);
		}
	}
})();

// ~ ~ ~ ~ ~ ~
addEventListener('click', function(evento) {
	var posición = obtenerPosiciónDeEvento(evento);
	var ctrl = evento.ctrlKey, shift = evento.shiftKey;
	
	if(ctrl && shift) {
		historia = JSON.stringify(grilla);
		if(selección) {
			copiarSelecciónA(posición, false); // false: sin borrar el contenido de la selección
			moverSelecciónA(posición);
		} else {
			selección = new Selección(cursor, posición);
			// rellenar selección con cursor
			selección.forEach(pos => grilla[pos] = clonarObjeto(grilla[cursor]));
		}
	} else if(ctrl) {
		historia = JSON.stringify(grilla);
		if(selección) {
			copiarSelecciónA(posición, true);
								// ^ true significa que va a borrar el contenido de la selección original
			moverSelecciónA(posición);
		} else {
			var bloque = grilla[cursor];
			delete grilla[cursor];
			cursor = posición;
			grilla[cursor] = bloque;
		}
	} else if(shift) {
		if(selección)
			selección.fin = posición;
		else
			selección = new Selección(cursor, posición);
	} else {
		cursor = posición;
		nuevaLínea = posición.x;
		selección = null;
	}
	dibujarMuro();
});

function copiarSelecciónA(posición, borrar) {
	var desplazamiento = posición.menos(selección.mínimo());
	var copia = Object.create(null);
	selección.forEach(function(pos) {
		var bloque = grilla[pos];
		if(bloque)
			copia[pos] = clonarObjeto(bloque);
	});
	if(borrar)
		borrarContenidoDeSelección();
	selección.forEach(function(pos) {
		var nueva = pos.más(desplazamiento);
		if(copia[pos])
			grilla[nueva] = copia[pos];
		else
			delete grilla[nueva];
	});
}
function borrarContenidoDeSelección() {
	selección.forEach(function(pos) {
		delete grilla[pos];
	});
}
function moverSelecciónA(posición) {
	var desplazamiento = posición.menos(selección.mínimo());
	selección.comienzo = selección.comienzo.más(desplazamiento);
	selección.fin = selección.fin.más(desplazamiento);
}

function obtenerPosiciónDeEvento(evento) {
	return new Vector(Math.floor( (evento.clientX + window.scrollX) / escala.x ),
	                  Math.floor( (evento.clientY + window.scrollY) / escala.y ));
}

function clonarObjeto(objeto) { // "shallow copy"
	var nuevo = {};
	for(var atributo in objeto) {
		if(objeto.hasOwnProperty(atributo))
			nuevo[atributo] = objeto[atributo];
	}
	return nuevo;
}

addEventListener('dblclick', function(evento) {
	var posición = obtenerPosiciónDeEvento(evento);
	var copia = new Vector(posición.x, posición.y);
	selección = new Selección(posición, copia);
	dibujarMuro();
});

// ~ ~ ~ ~ ~ ~
var textarea = document.querySelector('textarea');

addEventListener('click', function(evento) {
	textarea.focus();
	evento.preventDefault();
});

textarea.addEventListener('input', function() {
	historia = JSON.stringify(grilla);
	if(selección) {
		borrarContenidoDeSelección();
		cancelarSelección();
	}
	var texto = textarea.value;
	textarea.value = '';
	
	texto = texto.replace(/\t/g, '  ');
	
	for(var caracter of texto) {
		if(caracter == '\n')
			cursor = new Vector(nuevaLínea, cursor.y + 1);
		else if(caracter == ' ') {
			delete grilla[cursor];
			cursor.x++;
		} else {
			var nuevo = clonarObjeto(estilo);
			nuevo.caracter = caracter;
			grilla[cursor] = nuevo;
			cursor.x++;
		}
	}
	dibujarMuro();
});

// ~ ~ ~ ~ ~ ~
function rastrearTeclas(teclas, llamada) {
	function listener(event) {
		if(teclas[event.keyCode]) {
			var respuesta = llamada(teclas[event.keyCode], event.ctrlKey, event.shiftKey, event);
			//prevenimos default para atajos de teclado que usemos
			if(event.ctrlKey)
				event.preventDefault();
			if(respuesta === false)
				removeEventListener('keydown', listener);
		}
	}
	addEventListener('keydown', listener);
}

var teclas = {
	37:'izquierda',38:'arriba',39:'derecha',40:'abajo',
	90:'Z',66:'B',73:'I',85:'U',83:'S',67:'C',
	8:'backspace',9:'tab',46:'supr'
};

var vectoresDeDirección = {
	'izquierda':new Vector(-1,0),'derecha':new Vector(1,0),
	'arriba':new Vector(0,-1),'abajo':new Vector(0,1)
};

rastrearTeclas(teclas, function(tecla, ctrl, shift, evento) {
	if(vectoresDeDirección[tecla])
		var desplazamiento = vectoresDeDirección[tecla];
	if(ctrl && shift) {
		if(desplazamiento) {
			historia = JSON.stringify(grilla);
			if(selección) {
				var nuevaPosición = selección.mínimo().más(desplazamiento);
				copiarSelecciónA(nuevaPosición, false);
				moverSelecciónA(nuevaPosición);
			} else {
				var nuevo = clonarObjeto(grilla[cursor]);
				cursor = cursor.más(desplazamiento);
				grilla[cursor] = nuevo;
			}
		}
	} else if(ctrl) {
		if(desplazamiento) {
			historia = JSON.stringify(grilla);
			if(selección) {
				var nuevaPosición = selección.mínimo().más(desplazamiento);
				copiarSelecciónA(nuevaPosición, true);
				moverSelecciónA(nuevaPosición);
			} else {
				var nuevo = clonarObjeto(grilla[cursor]);
				delete grilla[cursor];
				cursor = cursor.más(desplazamiento);
				grilla[cursor] = nuevo;
			}
		} else if(tecla=='Z') {
			var copia = JSON.stringify(grilla);
			grilla = JSON.parse(historia);
			historia = copia;
		} else if(tecla=='C') {
			var copiar = '';
			if(selección) {
				var línea = selección.mínimo().y;
				selección.forEach(function(pos) {
					if(pos.y != línea) {
						copiar += '\n';
						línea = pos.y;
					}
					if(grilla[pos])
						copiar += grilla[pos].caracter||' ';
					else copiar += ' ';
				});
				copiar = copiar.replace(/ +$/gm, '').replace(/\n+$|^\n+/g, '');
			} else
				copiar = grilla[cursor].caracter;
			textarea.value = copiar;
			textarea.select();
			document.execCommand('copy');
			textarea.value = '';
		} else if(tecla=='B'||tecla=='I'||tecla=='U'||tecla=='S') {
			//teclas de estilo
			var acción = ({'B':'bold','I':'italic','U':'underline','S':'stroke'})[tecla];
			if(selección) {
				var alternar = !(grilla[selección.mínimo()] && grilla[selección.mínimo()][acción]);
				selección.forEach(function(pos) {
					var bloque = grilla[pos];
					if(alternar) {
						if(bloque==undefined&&(acción=='underline'||acción=='stroke'))
							bloque = grilla[pos] = {};
						if(bloque)
							bloque[acción] = true;
					} else {
						if(bloque) {
							delete bloque[acción];
							if(!bloque.stroke&&!bloque.underline&&!bloque.caracter)
								delete grilla[pos];
						}
					}
				});
			} else {
				(estilo[acción] = !estilo[acción])||delete estilo[acción]; //if(false)->delete
			}
		}
	} else if(shift) {
		if(vectoresDeDirección[tecla]) {
			var desplazamiento = vectoresDeDirección[tecla];
			if(selección)
				selección.fin = selección.fin.más(desplazamiento);
			else
				selección = new Selección(cursor, cursor.más(desplazamiento));
		}
	} else {
		if(desplazamiento) {
			if(selección)
				cancelarSelección();
			cursor = cursor.más(desplazamiento);
			nuevaLínea = cursor.x;
		} else if(tecla=='backspace') {
			if(selección) {
				borrarContenidoDeSelección();
				cancelarSelección();
			} else {
				cursor.x--;
				delete grilla[cursor];
			}
		} else if(tecla=='supr') {
			if(selección)
				borrarContenidoDeSelección();
			else {
				delete grilla[cursor];
				cursor.x++;
			}
		} else if(tecla=='tab') {
			delete grilla[cursor]; cursor.x++;
			delete grilla[cursor]; cursor.x++;
			nuevaLínea = cursor.x;
			evento.preventDefault();
		}
	}
	dibujarMuro();
});

function cancelarSelección() {
	cursor = selección.fin;
	selección = null;
}

// ~ ~ ~ ~ ~ ~
var mostrarInformaciónDeEstilo = (function() {
	var span = document.createElement('span');
	var estilos = 'position:absolute;bottom:5px;right:5px;color:gray;'+
								'line-height:1em;font:'+escala.y+'px "Roboto Mono", monospace;';
	var traductor = {'bold':'font-weight:bold;','italic':'font-style:italic;',
									'underline':'border-bottom:1px solid gray;',
									'stroke':'text-decoration:line-through;'};
	span.style = estilos;
	span.textContent = 'a';
	document.body.appendChild(span);
	
	return function mostrarInformaciónDeEstilo(objeto) {
		var agregado = '';
		for(var prop in objeto)
			agregado += traductor[prop]||'';
		span.style = estilos + agregado;
	}
})();

// ~ ~ ~ ~ ~ ~
dibujarMuro();
