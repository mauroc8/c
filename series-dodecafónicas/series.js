var canvas = document.querySelector('canvas');
var marco = document.querySelector('#marco');
var $ = canvas.getContext('2d');
var img60, img40; //imágenes de símbolos: clave de sol, sostenido, bemol y becuadro

function crearSerie() {
	var serie = [];
	var notas = [0,1,2,3,4,5,6,7,8,9,10,11];
	var última, mínima, máxima;
	for(var i=0; i<12; i++) {
		var índice = Math.floor(Math.random()*notas.length);
		var nota = notas[índice];
		var octava = Math.floor(Math.random()*2);
		if(octava&&
		   última&&mínima&&máxima&&
		   Math.abs(nota+12-última)<12&&
		   nota+12-mínima<14) {
			nota += 12;
		} else if(!octava&&
		          última&&mínima&&máxima&&
		          Math.abs(nota-última)>12) {
			nota += 12;
		} else if(!octava&&
		          última&&mínima&&máxima&&
		          máxima-nota>14) {
			nota += 12;
		} else if(octava&&
		          !última&&!mínima&&!máxima) {
			nota += 12;
		}
		serie.push(nota);
		notas.splice(índice, 1);
		mínima = mínima ? Math.min(mínima, nota) : nota;
		máxima = máxima ? Math.max(máxima, nota) : nota;
		última = nota;
	}
	return serie;
}

function cargarImágen(src) {
	return new Promise(function(éxito, fracaso) {
		var img = new Image();
		img.src = src;
		img.onload = function() {
			éxito(img);
		}
		img.onerror = img.onabort = fracaso;
	});
}

window.onresize = () => {
	var ancho = document.body.getBoundingClientRect().width;
	var tamaños = [780, 520, 420, 280, 200];
	for(var i=0; i<tamaños.length; i++) {
		var tamaño = tamaños[i];
		if(ancho>=tamaño) {
			if(canvas.width!=tamaño) {
				canvas.width=tamaño;
				transcribirSerie();
			}
			break;
		}
	}
}

function intervaloEntreNotas(nota1, nota2) { //no le importa si es tercera o sexta, da igual
	var notas = 'do,re,mi,fa,sol,la,si'.split(',');
	var indexNota1 = notas.indexOf(nota1);
	var indexNota2 = notas.indexOf(nota2);
	return Math.abs(indexNota2 - indexNota1) + 1;
}

var notas = {
	becuadro: {
		'do':0,
		're':2,
		'mi':4,
		'fa':5,
		'sol':7,
		'la':9,
		'si':11
	}, sostenido: {
		'si':0,
		'do':1,
		're':3,
		'mi':5,
		'fa':6,
		'sol':8,
		'la':10,
	}, bemol: {
		're':1,
		'mi':3,
		'fa':4,
		'sol':6,
		'la':8,
		'si':10,
		'do':11
	}, doblesostenido: {
		'si':1,
		'do':2,
		're':4,
		'mi':6,
		'fa':7,
		'sol':9,
		'la':11
	}, doblebemol: {
		're':0,
		'mi':2,
		'fa':3,
		'sol':5,
		'la':7,
		'si':9,
		'do':10
	},
	porDefecto: {
		0:'do becuadro',
		1:'do sostenido',
		2:'re becuadro',
		3:'mi bemol',
		4:'mi becuadro',
		5:'fa becuadro',
		6:'fa sostenido',
		7:'sol becuadro',
		8:'la bemol',
		9:'la becuadro',
		10:'si bemol',
		11:'si becuadro'
	}
}

function traducirSerie(serie) {
	var alteración, nombre;
	var resultado = [];
	
	var num = serie[0];
	var nota = num%12;
	var octava = Math.floor(num/12);
	var str = notas.porDefecto[nota];
	[nombre, alteración] = str.split(' ');
	resultado.push({
		nombre: nombre,
		alteración: alteración,
		octava: octava
	});
	
	for(var i=1; i<serie.length; i++) {
		num = serie[i];
		nota = num%12;
		octava = Math.floor(num/12);
		var diferenciaSemitonos = num - serie[i-1];
		var nombreSugerido = calcularNombreDePróximaNota(diferenciaSemitonos, nombre);
		if(notas.becuadro[nombreSugerido] == nota) {
			nombre = nombreSugerido;
			alteración = 'becuadro';
		} else if(notas[alteración][nombreSugerido] == nota) {
			nombre = nombreSugerido;
		} else {
			var alteraciones = 'becuadro,bemol,sostenido,doblesostenido,doblebemol'.split(',');
			var notaEncontrada = false;
			for(var j=0; j<alteraciones.length; j++) {
				var alteraciónSugerida = alteraciones[j];
				if(notas[alteraciónSugerida][nombreSugerido] == nota) {
					nombre = nombreSugerido;
					alteración = alteraciónSugerida;
					notaEncontrada = true;
					break;
				}
			}
			if(notaEncontrada == false) {
				//acá es cuando tenemos que sacrificar el nombre de nota ideal
				var str = notas.porDefecto[nota];
				[nombre, alteración] = str.split(' ');
			}
		}
		resultado.push({
			nombre: nombre,
			alteración: alteración,
			octava: octava
		});
	}
	return resultado;
}

function calcularNombreDePróximaNota(diferenciaSemitonos, anterior) {
	var nombre = '';
	var notas = 'do,re,mi,fa,sol,la,si'.split(',');
	var traducciónDeDiferenciaSemitonos = {1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:5,9:5,10:6,11:6};
	var absDifSt = Math.abs(diferenciaSemitonos);
	var diferenciaInterválica = traducciónDeDiferenciaSemitonos[absDifSt];
	if(diferenciaSemitonos < 0) diferenciaInterválica = -diferenciaInterválica;
	var posiciónAnterior = notas.indexOf(anterior);
	var nuevaPos = posiciónAnterior + diferenciaInterválica;
	if(nuevaPos < 0) nuevaPos = 7 + nuevaPos;
	if(nuevaPos > 6) nuevaPos = nuevaPos % 7;
	return notas[nuevaPos];
}

function transcribirSerie() {
	var img;
	if(canvas.width==780||canvas.width==420) {
		if(img60)
			img = img60;
		else
			return cargarImágen('img/símbolos-60.png').then(img => {
				img60 = img;
				transcribirSerie();
			}).catch(err => console.log(err));
	} else {
		if(img40)
			img = img40;
		else
			return cargarImágen('img/símbolos-40.png').then(img => {
				img40 = img;
				transcribirSerie();
			}).catch(err => console.log(err));
	}
	var width = canvas.width;
	var height, pentagramas;
	if(width==780) {
		height=120;
		pentagramas=1;
	} else if(width==520) {
		height=80;
		pentagramas=1;
	} else if(width==420) {
		height=120;
		pentagramas=2;
	} else if(width==280) {
		height=80;
		pentagramas=2;
	} else if(width==200) {
		height=80;
		pentagramas=3;
	}
	var yInicio, yLínea, xGrilla, paddingX, paddingY;
	if(height==120) {
		yInicio = 38;
		yLínea = 14;
		xGrilla = 60;
		paddingX = 3;
		paddingY = 10;
	} else if(height==80) {
		yInicio = 25;
		yLínea = 9;
		xGrilla = 40;
		paddingX = 3;
		paddingY = 6;
	}
	//Height (& clear)
	canvas.height = height * pentagramas;
	//Clave de Sol
	$.drawImage(img,
	            0,0,
	            xGrilla,height,
	            0,0,
	            xGrilla,height);
	//Pentagrama
	$.beginPath();
	for(var i=0; i<5; i++) {
		for(var j=0; j<pentagramas; j++) {
			var y = yInicio + yLínea * i + height * j + 0.5;
			$.moveTo(0, y);
			$.lineTo(width, y);
		}
	}
	$.stroke();
	//Borde azul
	var notasPorPentagrama = 12 / pentagramas;
	$.strokeStyle='blue';
	$.setLineDash([4,4]);
	for(var i=0; i<notasPorPentagrama; i++) {
		for(var j=0; j<pentagramas; j++) {
			$.strokeRect(xGrilla + xGrilla * i + paddingX + 0.5,
			             yInicio + height * j - yLínea - paddingY + 0.5,
			             xGrilla - paddingX * 2, yLínea * 6 + paddingY * 2);
		}
	}
	$.strokeStyle='black';
	$.setLineDash([]);
	//Notas
	var líneaAdicionalArriba = yInicio - yLínea + 0.5;
	var líneaAdicionalAbajo = yInicio + yLínea * 5 + 0.5;
	var notas = 'do,re,mi,fa,sol,la,si'.split(',');
	var i=0;
	for(var p=0; p<pentagramas; p++) {
		for(var n=0; n<notasPorPentagrama; n++) {
			var nota = serie[i];
			i++;
			var nombre = nota.nombre,
				octava = nota.octava,
				alteración = nota.alteración;
			//posición representa distancia desde el Fa de la 1era línea. Ej: el Do central tiene 10
			var posición = 10 - notas.indexOf(nombre) - octava * 7;
			var xAlteración = xGrilla + xGrilla * n + xGrilla/4;
			var xNota = xAlteración + xGrilla/4;
			var xFinNota = xNota + xGrilla/4;
			var yNota = height * p + yInicio + yLínea/2 * posición;
			//Dibujar línea adicional si hiciera falta
			$.beginPath();
			if(posición <= -2) {
				$.moveTo(xAlteración, líneaAdicionalArriba + height * p);
				$.lineTo(xFinNota, líneaAdicionalArriba + height * p);
			} else if(posición >= 10) {
				$.moveTo(xAlteración, líneaAdicionalAbajo + height * p);
				$.lineTo(xFinNota, líneaAdicionalAbajo + height * p);
			}
			$.stroke();
			//Dibujar alteración
			
		}
	}
}

var serie = traducirSerie(crearSerie());
window.onresize();