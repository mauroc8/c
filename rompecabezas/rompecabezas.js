function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.plus = function(otro) {
	return new Vector(this.x + otro.x, this.y + otro.y);
}

Vector.prototype.times = function(num) {
	return new Vector(this.x * num, this.y * num);
}

function Rompecabeza(img, width, height) {
	this.img = img;
	this.width = width;
	this.height = height;
	this.scaleX = img.width / width;
	this.scaleY = img.height / height;
	
	this.cursor = new Vector(0, 0);
	this.grilla = [];
	for(var y = 0; y < height; y++) {
		var línea = [];
		for(var x = 0; x < width; x++) {
			// todos en la posición original
			línea.push(new Vector(x, y));
		}
		this.grilla.push(línea);
	}
	
	do {
		this.desordenarGrilla();
	} while(this.grillaEstáOrdenada());
}

Rompecabeza.prototype.estáAdentroDeLaGrilla = function(vector) {
	return vector.x >= 0 && vector.x < this.width &&
				 vector.y >= 0 && vector.y < this.height;
}

Rompecabeza.prototype.moverCursor = function() {
	var direcciones = {
		'izquierda': new Vector(-1, 0),
		'derecha': new Vector(1, 0),
		'arriba': new Vector(0, -1),
		'abajo': new Vector(0, 1)
	};
	return function(dir) {
		var vectDir = direcciones[dir];
		var cursorViejo = this.cursor.times(1);
		var cursorNuevo = this.cursor.plus(vectDir);
		if(this.estáAdentroDeLaGrilla(cursorNuevo)) {
			var grillaViejo = this.grilla[cursorViejo.y][cursorViejo.x];
			this.grilla[cursorViejo.y][cursorViejo.x] = this.grilla[cursorNuevo.y][cursorNuevo.x];
			this.grilla[cursorNuevo.y][cursorNuevo.x] = grillaViejo;
			this.cursor = cursorNuevo;
		}
	}
}();

Rompecabeza.prototype.desordenarGrilla = function() {
	var dir = 'izquierda, derecha, arriba, abajo'.split(', ');
	var max = this.width * this.width * this.height * this.height;
	for(var i = 0; i < max; i++) {
		this.moverCursor(dir[Math.floor(Math.random() * dir.length)]);
	}
}

Rompecabeza.prototype.grillaEstáOrdenada = function() {
	for(var y = 0; y < this.height; y++) {
		for(var x = 0; x < this.width; x++) {
			var pos = this.grilla[y][x];
			if(pos.x != x || pos.y != y)
				return false;
		}
	}
	return true;
}

function RenderizadorCanvas(parent, rompecabeza) {
	this.canvas = document.createElement('canvas');
	this.cx = this.canvas.getContext('2d');
	this.canvas.width = rompecabeza.width * rompecabeza.scaleX;
	this.canvas.height = rompecabeza.height * rompecabeza.scaleY;
	this.rompecabeza = rompecabeza;
	this.dibujarRompecabeza();
	parent.appendChild(this.canvas);
}

RenderizadorCanvas.prototype.limpiar = function() {
	this.canvas.parentNode.removeChild(this.canvas);
}

RenderizadorCanvas.prototype.dibujarRompecabeza = function() {
	if(this.rompecabeza.grillaEstáOrdenada()) {
		this.dibujarImágenCompleta();
	} else {
		this.dibujarImágenCortada();
		this.dibujarCuadrícula();
		this.dibujarCursor();
	}
}

RenderizadorCanvas.prototype.dibujarImágenCortada = function() {
	var rmp = this.rompecabeza;
	for(var y = 0; y < rmp.height; y++) {
		for(var x = 0; x < rmp.width; x++) {
			var recorte = rmp.grilla[y][x];
			var sX = rmp.scaleX, sY = rmp.scaleY;
			this.cx.drawImage(rmp.img,
			                  recorte.x * sX, recorte.y * sY, sX, sY,
			                  x * sX, y * sY, sX, sY);
		}
	}
}

RenderizadorCanvas.prototype.dibujarImágenCompleta = function() {
	this.cx.drawImage(this.rompecabeza.img,
	                  0, 0,
	                  this.canvas.width, this.canvas.height);
}

RenderizadorCanvas.prototype.dibujarCuadrícula = function() {
	this.cx.beginPath();
	// Líneas verticales
	for(var x = 1; x < this.rompecabeza.width; x++) {
		this.cx.moveTo(x * this.rompecabeza.scaleX, 0);
		this.cx.lineTo(x * this.rompecabeza.scaleX, this.canvas.height);
	}
	// Líneas horizontales
	for(var y = 1; y < this.rompecabeza.height; y++) {
		this.cx.moveTo(0, y * this.rompecabeza.scaleY);
		this.cx.lineTo(this.canvas.width, y * this.rompecabeza.scaleY);
	}
	this.cx.setLineDash([2, 2]);
	this.cx.lineWidth = 1;
	this.cx.lineDashOffset = 0;
	this.cx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	this.cx.stroke();
	this.cx.lineDashOffset = 2;
	this.cx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
	this.cx.stroke();
}

RenderizadorCanvas.prototype.dibujarCursor = function() {
	var cursor = this.rompecabeza.cursor;
	var scaleX = this.rompecabeza.scaleX, scaleY = this.rompecabeza.scaleY;
	this.cx.setLineDash([]);
	this.cx.lineWidth = 2;
	this.cx.strokeStyle = 'black';
	this.cx.strokeRect(cursor.x * scaleX, cursor.y * scaleY,
	                   scaleX, scaleY);
}

function cargarImágen(src) {
	return new Promise(function(éxito, fracaso) {
		var img = new Image();
		img.onload = function() {
			éxito(img);
		}
		img.onerror = function() {
			fracaso(img);
		}
		img.src = src;
	});
}

function rastrearTeclas(teclas, llamada) {
	addEventListener('keydown', function _keydown(event) {
		if(teclas[event.keyCode]) {
			var respuesta = llamada(teclas[event.keyCode]);
			if(respuesta === false)
				removeEventListener('keydown', _keydown);
			event.preventDefault();
		}
	});
}

var flechas = {
	37: 'izquierda',
	38: 'arriba',
	39: 'derecha',
	40: 'abajo'
};

var contenedor = document.querySelector('#contenedor');
var info = document.querySelector('#info');

function cargarRompecabeza(srcImg, width, height, llamada) {
	info.textContent = 'Cargando...';
	return cargarImágen(srcImg).then(function(img) {
		info.innerHTML = srcImg;
		var rompecabeza = new Rompecabeza(img, width, height);
		var renderizador = new RenderizadorCanvas(contenedor, rompecabeza);
		
		rastrearTeclas(flechas, function(dir) {
			rompecabeza.moverCursor(dir);
			renderizador.dibujarRompecabeza();
			if(rompecabeza.grillaEstáOrdenada()) {
				setTimeout(function() {
					renderizador.limpiar();
					if(llamada)
						llamada();
				}, 5000);
				return false;
			}
		});
	});
}


function cargarJuego(niveles, llamada) {
	function cargarNivel(n) {
		var nivel = niveles[n];
		if(nivel) {
			cargarRompecabeza('imágenes/' + nivel.img, nivel.width, nivel.height, function() {
				localStorage.setItem('rmp-nivel', n + 1);
				cargarNivel(n + 1);
			});
		} else {
			localStorage.removeItem('rmp-nivel');
			if(llamada)
				llamada();
		}
	}
	cargarNivel(Number(localStorage.getItem('rmp-nivel')) || 0);
}

var niveles = [
	{img: '1-mujer-con-guitarra.jpg', width: 3, height: 4},
	{img: '2-van-gogh.jpg', width: 4, height: 4},
	{img: '3-remedios-varo-la-despedida.jpg', width: 4, height: 5},
	{img: '4-thomas-cole.jpg', width: 4, height: 6},
	{img: '5-remedios-varo-creación-de-las-aves.jpg', width: 5, height: 5},
	{img: '6-botes.jpg', width: 6, height: 6},
];

cargarJuego(niveles, function() {
	info.textContent = 'Ganaste';
});