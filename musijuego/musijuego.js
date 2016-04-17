
// algunas variables y constantes
var _cantidadNotas = 24, _delayReproducción = 1000, _repeticionesPorNivel=4,
	_delayCambiarNivel=2000;

var recursos, niveles;
var PianoScript = {
	"notas": [],
	"tos": [],
	"reproducir": function(arr, delay) {
		PianoScript.parar();
		if(typeof arr === 'number') arr = [arr];
		
		if(delay) {
			arr.forEach(function(nota, i) {
				PianoScript.tos.push(setTimeout(function() {
					if(i>0) PianoScript.notas[arr[i-1]].pause();
					PianoScript.notas[nota].currentTime = 0;
					PianoScript.notas[nota].play();
				}, delay*i));
			});
		} else {
			arr.forEach(function(nota) {
				PianoScript.notas[nota].currentTime = 0;
				PianoScript.notas[nota].play();
			});
		}
	}, "parar": function() {
		PianoScript.tos.forEach(to => clearTimeout(to));
		PianoScript.tos = [];
		PianoScript.notas.forEach(nota => nota.pause());
	}
}

// Promise loaders:
function loadJSON(filename) {
	return new Promise(function(fulfill, reject) {
		var xml = new XMLHttpRequest();
		xml.open('GET', filename, true);
		xml.onload = function() {
			if(xml.status == 200)
				fulfill(JSON.parse(xml.response));
			else
				reject(Error(xml.statusText));
		}
		xml.onerror = function() {
			reject(Error('Error de red'));
		}
		xml.send(null);
	});
}
function loadNote(n) {
	return new Promise(function(fulfill, reject) {
		var nota = new Audio('audio/'+n+'.mp3');
		nota.oncanplaythrough = function() {
			nota.oncanplaythrough = null;
			fulfill(nota);
		};
		nota.onerror = reject;
	});
}

window.onload = function() {
	var notas = [],
		archivos = [loadJSON('recursos.json'), loadJSON('niveles.json')];
	for(var i=0; i<=_cantidadNotas; i++)
		notas.push(loadNote(i));
	
	Promise.all(notas).then(function(arr) {
		PianoScript.notas = arr;
		return Promise.all(archivos);
	}, function(err) {
		console.log(err);
		alert("¡Alerta!\nError inesperado cargando las notas.\nIntente nuevamente.");
	}).then(function(arr) {
		recursos = arr[0];
		niveles = arr[1];
		iniciar();
	}, function(err) {
		alert("¡Alerta!\nError inesperado cargando recursos:\n\"" + err + "\"\nIntente nuevamente.");
	});
};


function Nivel(obj) {
	this.obj = obj;
	this.título = obj.título;
	this.respuestas = typeof obj.respuestas == 'string' ? obj.respuestas.split(', ') : obj.respuestas;
	this.resp_correcta = obj.resp_correcta || Math.floor(Math.random()*this.respuestas.length);
	
	this.notas = obj.notas || (function(nivel) {
		var notas = recursos[obj.tipo][nivel.respuestas[nivel.resp_correcta]];
		if(typeof notas === 'number') notas = [notas];
		else notas = notas.slice();
		// Ej acorde mayor:
		//notas===[3,4]
		notas.unshift(0);
		//notas===[0,3,4]
		var count = 0;
		notas = notas.map(function(nota) {
			count += nota;
			return count;
		});
		//notas===[0,3,7]
		var max = _cantidadNotas - Math.max(...notas);
		var rand = Math.floor(Math.random()*max);
		notas = notas.map(nota => nota+rand);
		//notas===[3,6,10]
		if(obj.reproducir === 'descendente')
			notas.reverse();
		return notas;
	})(this);
}

Nivel.prototype.reproducir = function() {
	if(this.obj.reproducir==='armónico')
		PianoScript.reproducir(this.notas);
	else
		PianoScript.reproducir(this.notas, _delayReproducción);
}

// dos o tres funciones ayudantes:
var $ = (q, ctx) => (ctx||document).querySelector(q),
	$$ = (q, ctx) => (ctx||document).querySelectorAll(q);
function elt(str) {
	var div = document.createElement('div');
	div.innerHTML = str;
	return div.removeChild(div.firstChild);
}

var Juego = {
	"div_menú": elt('<div>'+
			'<h1>MusiJuego</h1>'+
			'<div>'+
				'<p>'+
					'Desafiate y poné a prueba tus habilidades audioperceptivas. '+
					'Las respuestas correctas suman puntaje, lo que te permite avanzar en el juego. '+
					'Pero cuidado: ¡las respuestas incorrectas te pueden hacer retroceder varios niveles!'+
				'</p>'+
				'<p>'+
					'<a id="continuar">Continuar</a><br />'+
					'<a id="empezar">Empezar juego nuevo</a>'+
				'</p>'+
			'</div>'+
		'</div>'),
	"div_niveles": elt('<div>'+
			'<div id="barra_de_estado">'+
				'Puntaje: <b id="puntaje">0</b>. <a id="volver">Volver al menú</a>'+
			'</div>'+
			'<h3></h3>' +
			'<div>'+
				'<div class="Botones" id="respuestas">'+
				'</div>'+
				'<p id="texto"></p>'+
			'</div>'+
			'<p>'+
				'<a id="repetir">Repetir</a> '+
			'</p>'+
		'</div>'),
	"div_ganar": elt('<div>'+
			'<h1>¡Ganaste!</h1>'+
			'<div>'+
				'<p>'+
					'Si te gustó el juego, no te olvides de compartirlo.'+
				'</p>'+
				'<p>'+
					'<a id="volver-ganar">Volver al menú</a>'+
				'</p>'+
			'</div>'+
		'</div>'),
	"cargarMenú": function() {
		$('#container').removeChild($('#container').firstChild);
		$('#container').appendChild(Juego.div_menú);
		$('#continuar', Juego.div_menú).textContent = "Continuar ("+Juego.puntaje()+")";
		$('#continuar', Juego.div_menú).classList.toggle('inactivo', !Juego.puntaje());
	},
	"cargarNiveles": function() {
		$('#container').removeChild($('#container').firstChild);
		$('#container').appendChild(Juego.div_niveles);
	},
	"cargarGanar": function() {
		$('#container').removeChild($('#container').firstChild);
		$('#container').appendChild(Juego.div_ganar);
	},
	"puntaje": function(n) {
		if(!localStorage)
			return alert('Este juego no corre en tu navegador.');
		if(n===undefined)
			return Number(localStorage.getItem('puntajeMJ2')) || 0;
		n = Math.max(0, n);
		localStorage.setItem('puntajeMJ2', n);
		$('#puntaje', Juego.div_niveles).textContent = n;
	},
	"repeticiones": _repeticionesPorNivel,
	"obj_nivel": null,
	"cargarNivel": function() {
		var obj_nivel = niveles[Juego.puntaje()];
		if(!obj_nivel) {
			if(Juego.puntaje()===niveles.length) {
				PianoScript.parar();
				Juego.puntaje(0);
				Juego.cargarGanar();
				return;
			} else return alert('Error: No existe el nivel '+ Juego.puntaje());
		}
		Juego.obj_nivel = new Nivel(obj_nivel);
		Juego.repeticiones = _repeticionesPorNivel;
		//
		var nivel = Juego.obj_nivel, _child;
		$('h3', Juego.div_niveles).textContent = Juego.puntaje() + '. ' + nivel.título;
		while(_child=$('#respuestas', Juego.div_niveles).firstChild)
			$('#respuestas', Juego.div_niveles).removeChild(_child);
		nivel.respuestas.forEach(function(resp, i) {
			var btn = elt('<a>'+resp+'</a>');
			btn.addEventListener('click', function _click() {
				this.removeEventListener('click', _click);
				if(i===nivel.resp_correcta) {
					Juego.puntaje(Juego.puntaje()+1);
					Juego.cambiarEstado('Correcto... Cargando nivel '+Juego.puntaje()+"...", "correcto");
					this.className = 'correcto';
					setTimeout(Juego.cargarNivel, _delayCambiarNivel);
				} else {
					Juego.puntaje(Juego.puntaje()-1);
					Juego.cambiarEstado('Incorrecto...', "incorrecto");
					this.className = 'inactivo';
				}
			});
			$('#respuestas', Juego.div_niveles).appendChild(btn);
		});
		//
		if(Juego.reproducirAlComenzar) {
			Juego.repeticiones--;
			Juego.cambiarEstado("Reproduciendo...", "");
			nivel.reproducir();
		} else {
			Juego.cambiarEstado("...","");
		}
		Juego.actualizarRepetir();
	},
	"toCambiarEstado": null,
	"cambiarEstado": function(str, clase) {
		var texto = $('#texto', Juego.div_niveles);
		texto.textContent = str;
		
		if(Juego.toCambiarEstado) clearTimeout(Juego.toCambiarEstado);
		Juego.toCambiarEstado = setTimeout(function() {
			texto.textContent = "...";
			texto.className = "";
		}, _delayCambiarNivel);
		
		if(clase!==undefined)
			texto.className = clase;
	},
	"actualizarRepetir": function() {
		var btn = $('#repetir', Juego.div_niveles);
		btn.textContent = "Repetir ("+Juego.repeticiones+")";
		if(Juego.repeticiones===0)
			btn.innerHTML = "No quedan repeticiones. ¿Cargar nuevo nivel (-1)?";
	},
	"reproducirAlComenzar": true
}

//Botones de menú:
$('#continuar', Juego.div_menú).addEventListener('click', function() {
	if(Juego.puntaje())
		Juego.cargarNiveles();
});
$('#empezar', Juego.div_menú).addEventListener('click', function() {
	Juego.puntaje(0);
	Juego.cargarNiveles();
	Juego.cargarNivel();
});
//Botones de niveles:
$('#volver', Juego.div_niveles).addEventListener('click', function() {
	PianoScript.parar();
	Juego.cargarMenú();
});
$('#repetir', Juego.div_niveles).addEventListener('click', function() {
	if(Juego.repeticiones===0) {
		Juego.puntaje(Juego.puntaje()-1);
		return Juego.cargarNivel();
	}
	Juego.repeticiones--;
	Juego.actualizarRepetir();
	Juego.obj_nivel.reproducir();
});
//Botón en ganar:
$('#volver-ganar', Juego.div_ganar).addEventListener('click', function() {
	Juego.cargarMenú();
});

//Iniciales
if(Juego.puntaje())
	$('#continuar', Juego.div_menú).addEventListener('click', function _click() {
		this.removeEventListener('click', _click);
		Juego.puntaje(Juego.puntaje());
		Juego.cargarNivel();
	});

function iniciar() {
	Juego.cargarMenú();
}