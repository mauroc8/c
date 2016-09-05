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

var grilla = {};
if(localStorage.getItem('grilla'))
	grilla = JSON.parse(localStorage.getItem('grilla'));

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
				var alternar = !grilla[selección.comienzo][acción];
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
