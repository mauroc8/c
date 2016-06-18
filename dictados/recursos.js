var recursos = {
	'notas': [
		"Do", "Do#/Reb", "Re", "Re#/Mib", "Mi", "Fa", "Fa#/Solb", "Sol", "Sol#/Lab", "La", "La#/Sib", "Si"
	],
	'acordes': {
		'mayor': [0, 4, 7],
		'menor': [0, 3, 7]
	},
	'inversiones': {
		'mayor fundamental': [0, 4, 7],
		'menor fundamental': [0, 3, 7],
		'mayor 1°i': [0, 3, 8],
		'menor 1°i': [0, 4, 8],
		'menor 2°i': [0, 5, 8],
		'mayor 2°i': [0, 5, 9]
	},
	'fundamentalesDeInversiones': {
		'mayor fundamental': 0,
		'menor fundamental': 0,
		'mayor 1°i': 3,
		'menor 1°i': 4,
		'menor 2°i': 8,
		'mayor 2°i': 9
	}
}


var PianoScript = {
	'context': new AudioContext(),
	'crearNota': [],
	'onload': function() {},
	'volumen': 0.4,
	'reproducir': function(notas, delay) {
		if(notas instanceof Array == false)
			notas = [notas];
		
		if(delay == null)
			delay = 0;		
		
		var volumen = PianoScript.context.createGain();
		volumen.gain.value = PianoScript.volumen;
		volumen.connect(PianoScript.context.destination);
		
		notas.forEach(function(n, i) {
			var nota = PianoScript.crearNota[n]();
			nota.connect(volumen);
			nota.start(PianoScript.context.currentTime + i * delay);
			
			var agregado;
			if(delay == 0 || i == notas.length - 1) agregado = 5;
			else agregado = 0.1;
			
			nota.stop(PianoScript.context.currentTime + (i+1) * delay + agregado);
		});
		
	}, 'parar': function() {
		PianoScript.context.close();
		PianoScript.context = new AudioContext();
	}
}

function cargarNota(n) {
	return new Promise(function(fullfill, reject) {
		var request = new XMLHttpRequest();
		
		request.open('GET', '../musijuego/audio/'+n+'.mp3', true);
		request.responseType = 'arraybuffer';
		
		request.onload = function() {
			PianoScript.context.decodeAudioData(request.response).then(function(buffer) {
				
				PianoScript.crearNota[n] = function() {
					var nota = PianoScript.context.createBufferSource();
					nota.buffer = buffer;
					return nota;
				}
				
				fullfill(true);
			});
		}
		
		request.onerror = reject;
		request.send(null);
	});
}

var promesas = [];
for(var i = 0; i <= 24; i++)
	promesas.push(cargarNota(i));

Promise.all(promesas).then(function() {
	if(PianoScript.onload)
		PianoScript.onload();
}, function(err) {
	alert("¡Alerta!\nError inesperado cargando las notas.\n\"" + err + "\"\nIntente nuevamente.");
	console.log(err);
});

function $(q, ctx) {
	return (ctx||document).querySelector(q);
}
function $$(q, ctx) {
	return Array.prototype.slice.call((ctx||document).querySelectorAll(q));
}