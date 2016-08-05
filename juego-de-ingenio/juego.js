var mapaDeCaracteres = {
	'#': 'pared',
	'x': 'lava',
	'*': 'estrella'
}

var mapaDeObjetos = {
	'@': Jugador,
	'$': Sombra
}

var teclas = {
	// Flechitas
	37: 'izquierda',
	38: 'arriba',
	39: 'derecha',
	40: 'abajo',
	// WASD
	87: 'arriba',
	65: 'izquierda',
	83: 'abajo',
	68: 'derecha'
}

var mapaDeColores = {
	'pared': 'black',
	'lava': 'red',
	'jugador': 'blue',
	'sombra': 'green',
	'estrella': 'yellow'
}

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.times = function(num) {
	return new Vector(this.x * num, this.y * num);	
}

function Nivel(plan) {
	this.width = plan[0].length;
	this.height = plan.length;
	this.mapa = [];
	this.objetos = [];
	
	for(var y = 0; y < this.height; y++) {
		var línea = plan[y];
		var líneaDeMapa = [];
		for(var x = 0; x < this.width; x++) {
			var caracter = línea[x];
			var bloque = mapaDeCaracteres[caracter] || null;
			líneaDeMapa.push(bloque);
			var Objeto = mapaDeObjetos[caracter];
			if(Objeto)
				this.objetos.push(new Objeto(new Vector(x, y), this, caracter));
		}
		this.mapa.push(líneaDeMapa);
	}
	
	this.status = null;
}

function reaccionarATecla(teclas, función, thisObj) {
	function eventListener(event) {
		if(teclas[event.keyCode]) {
			var answ = función.call(thisObj, teclas[event.keyCode]);
			if(answ === false)
				removeEventListener('keydown', eventListener);
			event.preventDefault();
		}
	}
	addEventListener('keydown', eventListener);
}

function Jugador(pos, nivel) {
	this.pos = pos;
	this.nivel = nivel;
	
	reaccionarATecla(teclas, this.moverse, this);
}

Jugador.prototype.tipo = 'jugador';

Jugador.prototype.direcciones = {
	'izquierda': new Vector(-1, 0),
	'arriba': new Vector(0, -1),
	'derecha': new Vector(1, 0),
	'abajo': new Vector(0, 1)
}

Jugador.prototype.moverse = function(dirección) {
	if(this.nivel.status)
		return false;
	
	var nuevaPos = this.pos.plus(this.direcciones[dirección]);
	var colisión = this.nivel.colisiónEn(nuevaPos);
	if(colisión != 'pared') {
		this.pos = nuevaPos;
		if(colisión == 'lava')
			this.nivel.status = 'perdido';
		else if(colisión == 'estrella')
			this.nivel.personajeTocaEstrella();
	}
}

Nivel.prototype.colisiónEn = function(pos) {
	if(pos.x < 0 || pos.x > this.width || pos.y < 0 || pos.y > this.height)
		return 'pared';
	else
		return this.mapa[pos.y][pos.x];
}

Nivel.prototype.personajeTocaEstrella = function() {
	var ganó = this.objetos.every(function(objeto) {
		return this.colisiónEn(objeto.pos) == 'estrella';
	}, this);
	
	if(ganó) {
		this.status = 'ganado';
	}
}

function Sombra(pos, nivel) {
	Jugador.call(this, pos, nivel);
}

Sombra.prototype = Object.create(Jugador.prototype);

Sombra.prototype.tipo = 'sombra';

Sombra.prototype.direcciones = {
	'izquierda': new Vector(1, 0),
	'arriba': new Vector(0, 1),
	'derecha': new Vector(-1, 0),
	'abajo': new Vector(0, -1)
}

var scale = 20;

function RenderizadorCanvas(parent, nivel) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = nivel.width * scale;
	this.canvas.height = nivel.height * scale;
	this.cx = this.canvas.getContext('2d');
	parent.appendChild(this.canvas);
	this.nivel = nivel;
	
	this.últimaTecla = null;
	
	this.actualizar('arriba');
}

RenderizadorCanvas.prototype.autodestruir = function() {
	this.canvas.parentNode.removeChild(this.canvas);
}

RenderizadorCanvas.prototype.actualizar = function(tecla) {
	this.últimaTecla = tecla;
	
	this.limpiarCanvas();
	this.dibujarMapa();
	this.dibujarObjetos();
}

RenderizadorCanvas.prototype.limpiarCanvas = function() {
	if(this.nivel.status == 'perdido')
		this.cx.fillStyle = 'pink';
	else if(this.nivel.status == 'ganado')
		this.cx.fillStyle = 'yellow';
	else
		this.cx.fillStyle = 'white';
	this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

RenderizadorCanvas.prototype.dibujarMapa = function() {
	for(var y = 0; y < this.nivel.height; y++) {
		for(var x = 0; x < this.nivel.width; x++) {
			var bloque = this.nivel.mapa[y][x];
			if(mapaDeColores[bloque]) {
				this.cx.fillStyle = mapaDeColores[bloque];
				this.cx.fillRect(x * scale, y * scale,
				                 scale, scale);
			}
		}
	}
}

RenderizadorCanvas.prototype.dibujarObjetos = function() {
	this.nivel.objetos.forEach(function(objeto) {
		var tipo = objeto.tipo;
		var pos = objeto.pos;
		if(mapaDeColores[tipo]) {
			this.cx.fillStyle = mapaDeColores[tipo];
			this.cx.beginPath();
			this.cx.arc(pos.x * scale + scale/2, pos.y * scale + scale/2, scale/2,
			            0, Math.PI * 2);
			this.cx.fill();
		}
		var dir = objeto.direcciones[this.últimaTecla];
		if(dir) {
			this.cx.fillStyle = 'white';
			this.cx.font = scale+'px "PT mono", monospace';
			this.cx.textAlign = 'center';
			this.cx.textBaseline = 'middle';
			this.cx.fillText(obtenerCaracterDeDirección(dir), pos.x * scale + scale /2, pos.y * scale + scale / 2);
		}
	}, this);
}

function obtenerCaracterDeDirección(vector) {
	if(vector.x == 1)
		return '>';
	else if(vector.x == -1)
		return '<';
	else if(vector.y == 1)
		return 'v';
	else
		return '^';
}

function iniciarNivel(planNivel, Renderizador, callback) {
	var nivel = new Nivel(planNivel);
	var renderizador = new Renderizador(document.body, nivel);
	
	reaccionarATecla(teclas, function(tecla) {
		renderizador.actualizar(tecla);
		
		if(nivel.status) {
			setTimeout(function() {
				renderizador.autodestruir();
				if(callback) callback(nivel.status);
			}, 1000);
			return false;
		}
	});
}

function iniciarJuego(arrayPlanNiveles, Renderizador, callback) {
	function cargarNivel(i) {
		iniciarNivel(arrayPlanNiveles[i], Renderizador, function(status) {
			if(status == 'perdido')
				cargarNivel(i);
			else if(status == 'ganado') {
				if(arrayPlanNiveles.length == i+1) {
					if(callback) callback();
				} else {
					localStorage.setItem('nivel', i + 1);
					cargarNivel(i + 1);
				}
			}
		});
	}
	cargarNivel(Number(localStorage.getItem('nivel')) || 0);
}


var niveles = [
	[
		"           ",
		" ######### ",
		" # * # $ # ",
		" #   #   # ",
		" #   #   # ",
		" #   #   # ",
		" #   #   # ",
		" # @ # * # ",
		" ######### ",
		"           "
	], [
		"             ",
		" ########### ",
		" # *  #  $ # ",
		" #  # #    # ",
		" #    #    # ",
		" #    #    # ",
		" #    #    # ",
		" # @  #*   # ",
		" ########### ",
		"             "
	], [
		"               ",
		" ############# ",
		" #  *  #$    # ",
		" #     #    x# ",
		" #     #xx xx# ",
		" #x x  #     # ",
		" #  #  # xxx # ",
		" #  xxx#     # ",
		" #   xx#     # ",
		" #@   x#  *  # ",
		" ############# ",
		"               "
	], [
		"                 ",
		" ############### ",
		" #@     #    x*# ",
		" #xxxx ## x    # ",
		" # x    #      # ",
		" #   xxx# xxxxx# ",
		" #*     #     $# ",
		" ############### ",
		"                 "
	], [
		"               ",
		" ############# ",
		" #  *x # #$  # ",
		" # x   #  xx # ",
		" ##    #     # ",
		" # xxx # x  x# ",
		" #     #     # ",
		" #x x  #   x # ",
		" #   x #     # ",
		" # x   # xxxx# ",
		" #   x #     # ",
		" #  xxx#x x  # ",
		" #  @ x#  *  # ",
		" ############# ",
		"               "
	], [
		"                           ",
		" ######################### ",
		" #@     xxx *#x  #   x   # ",
		" #xxx    xx  #   x     x # ",
		" #xx  x #x   # x      x  # ",
		" #   xx    xx#*x  x  #  $# ",
		" ######################### ",
		"                           "
	]
];

window.onload = function() {
	iniciarJuego(niveles, RenderizadorCanvas, function() {
		alert('¡Ganaste!');
		localStorage.removeItem('nivel');
		location.reload();
	});
}