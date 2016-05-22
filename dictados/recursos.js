var recursos = {
	'notas': [
		"Do", "Do#/Reb", "Re", "Re#/Mib", "Mi", "Fa", "Fa#/Solb", "Sol", "Sol#/Lab", "La", "La#/Sib", "Si"
	],
	'acordes': {
		'mayor': [0, 4, 7],
		'menor': [0, 3, 7],
		'aumentado': [0, 4, 8],
		'disminuído': [0, 3, 6],
		'mayor fundamental': [0, 4, 7],
		'menor fundamental': [0, 3, 7],
		'mayor 1°i': [0, 3, 8],
		'menor 1°i': [0, 4, 8],
		'mayor 2°i': [0, 5, 9],
		'menor 2°i': [0, 5, 8]
	}
}

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
			for(var nota of arr)
				PianoScript.notas[nota].currentTime = 0;
			for(var nota of arr)
				PianoScript.notas[nota].play();
		}
	}, "parar": function() {
		PianoScript.tos.forEach(to => clearTimeout(to));
		PianoScript.tos = [];
		PianoScript.notas.forEach(nota => nota.pause());
	}
}
function loadNote(n) {
	return new Promise(function(fulfill, reject) {
		var nota = new Audio('../musijuego/audio/'+n+'.mp3');
		nota.oncanplaythrough = function() {
			nota.oncanplaythrough = null;
			fulfill(nota);
		};
		nota.onerror = reject;
	});
}

var _notas = [];
for(var i=0; i<=24; i++)
	_notas.push(loadNote(i));

Promise.all(_notas).then(function(arr) {
	PianoScript.notas = arr;
	if(PianoScript.onload)
		PianoScript.onload();
}, function(err) {
	alert("¡Alerta!\nError inesperado cargando las notas.\n\"" + err + "\"\nIntente nuevamente.");
})

function $(q, ctx) {
	return (ctx||document).querySelector(q);
}
function $$(q, ctx) {
	return Array.prototype.slice.call((ctx||document).querySelectorAll(q));
}