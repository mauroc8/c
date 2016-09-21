var canvas = document.querySelector('canvas');
var marco = document.querySelector('#marco');
var $ = canvas.getContext('2d');
var img = null; //imágen de símbolos: clave de sol, bemol y becuadro

function crearSerie() {
	var serie = [];
	var notas = [1,2,3,4,5,6,7,8,9,10,11,12];
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

function línea(contexto, x, y, a, b) {
	contexto.moveTo(x,y);
	contexto.lineTo(a,b);
}

window.onresize = () => {
	var ancho = document.body.getBoundingClientRect().width;
	if(ancho>=780) {
		if(canvas.width!=780) {
			canvas.width=780;
			transcribirSerie();
		}
	} else if(ancho>=520) {
		if(canvas.width!=520) {
			canvas.width=520;
			transcribirSerie();
		}
	} else if(ancho>=280) {
		if(canvas.width!=280) {
			canvas.width=280;
			transcribirSerie();
		}
	} else if(ancho>=200) {
		if(canvas.width!=200) {
			canvas.width=200;
			transcribirSerie();
		}
	}
}
window.onresize();

function transcribirSerie() {
	if(canvas.width == 780)
		cargarImágen('img/símbolos-60.png')
			.then(function(img) {
				//W&Height
				var w = canvas.width;
				var h = canvas.height = 120;
				//Variables espaciales de pentagrama
				var pInicio = 38;//y de la primera línea
				var pLínea = 14;//espacio entre líneas
				var pGrilla = 60;//división del pentagrama en 13 (1 para el cleff y 12 p/notas)
				//Clear
				$.clearRect(0,0,w,h);
				//Pentagrama
				$.beginPath();
				for(var i=0; i<5; i++) {
					var y = pInicio + pLínea*i +0.5;
					línea($,0,y,w,y);
				}
				//línea($,.5,pInicio,.5,pInicio+pLínea*4);
				//línea($,w-.5,pInicio,w-.5,pInicio+pLínea*4);
				$.stroke();
				//Clave de Sol
				$.drawImage(img,0,0,pGrilla,h,0,0,pGrilla,h);
				//Borde azul
				$.strokeStyle='blue';
				$.setLineDash([4,4]);
				var paddingX=3, paddingY=10;
				for(var i=1; i<13; i++) {
					$.strokeRect(pGrilla*i+paddingX+.5, pInicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
				}
				$.strokeStyle='black';
				$.setLineDash([]);
				//Notas
					//...
			})
			.catch(function(err) {
				console.log(err);
			});
	else if(canvas.width == 520)
		cargarImágen('img/símbolos-40.png')
			.then(function(img) {
				//W&Height
				var w = canvas.width;
				var h = canvas.height = 80;
				//Variables espaciales de pentagrama
				var pInicio = 25;
				var pLínea = 9;
				var pGrilla = 40;
				//Clear
				$.clearRect(0,0,w,h);
				//Pentagrama
				$.beginPath();
				for(var i=0; i<5; i++) {
					var y = pInicio + pLínea*i +0.5;
					línea($,0,y,w,y);
				}
				//línea($,.5,pInicio,.5,pInicio+pLínea*4);
				//línea($,w-.5,pInicio,w-.5,pInicio+pLínea*4);
				$.stroke();
				//Clave de Sol
				$.drawImage(img,0,0,pGrilla,h,0,0,pGrilla,h);
				//Borde azul
				$.strokeStyle='blue';
				$.setLineDash([4,4]);
				var paddingX=3, paddingY=6;
				for(var i=1; i<13; i++) {
					$.strokeRect(pGrilla*i+paddingX+.5, pInicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
				}
				$.strokeStyle='black';
				$.setLineDash([]);
				//Notas
					//...
			})
			.catch(function(err) {
				console.log(err);
			});
	else if(canvas.width == 280)
		cargarImágen('img/símbolos-40.png')
			.then(function(img) {
				//W&Height
				var w = canvas.width;
				var h = 80; //del primer pentagrama
				var h2 = canvas.height = h*2; //del segundo pentagrama
				//Variables espaciales de pentagrama
				var pInicio = 25;
				var p2Inicio = pInicio+h;//(y de 1era línea, para el segundo pentagrama)
				var pLínea = 9;
				var pGrilla = 40;
				//Clear
				$.clearRect(0,0,w,h);
				//Pentagrama
				$.beginPath();
				for(var i=0; i<5; i++) {
					var y = pInicio + pLínea*i +0.5;
					línea($,0,y,w,y);
					var y2 = y + h;
					línea($,0,y2,w,y2);
				}
				//línea($,.5,pInicio,.5,pInicio+pLínea*4);
				//línea($,w-.5,pInicio,w-.5,pInicio+pLínea*4);
				$.stroke();
				//Claves de Sol
				$.drawImage(img,0,0,pGrilla,h,0,0,pGrilla,h);
				//Borde azul
				$.strokeStyle='blue';
				$.strokeWidth=1;
				$.setLineDash([4,4]);
				var paddingX=3, paddingY=6;
				for(var i=1; i<7; i++) {
					$.strokeRect(pGrilla*i+paddingX+.5, pInicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
					$.strokeRect(pGrilla*i+paddingX+.5, p2Inicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
				}
				$.strokeStyle='black';
				$.setLineDash([]);
				//Notas
					//...
			})
			.catch(function(err) {
				console.log(err);
			});
	else if(canvas.width == 200)
		cargarImágen('img/símbolos-40.png')
			.then(function(img) {
				//W&Height
				var w = canvas.width;
				var h = 80; //del primer pentagrama
				var h2 = h*2; //del segundo pentagrama
				var h3 = canvas.height = h*3; //del 3er
				//Variables espaciales de pentagrama
				var pInicio = 25;
				var p2Inicio = pInicio+h;
				var p3Inicio = p2Inicio+h;
				var pLínea = 9;
				var pGrilla = 40;
				//Clear
				$.clearRect(0,0,w,h);
				//Pentagrama
				$.beginPath();
				for(var i=0; i<5; i++) {
					var y = pInicio + pLínea*i +0.5;
					línea($,0,y,w,y);
					var y2 = y + h;
					línea($,0,y2,w,y2);
					var y3 = y2 + h;
					línea($,0,y3,w,y3);
				}
				//línea($,.5,pInicio,.5,pInicio+pLínea*4);
				//línea($,w-.5,pInicio,w-.5,pInicio+pLínea*4);
				$.stroke();
				//Clave de Sol
				$.drawImage(img,0,0,pGrilla,h,0,0,pGrilla,h);
				//Borde azul
				$.strokeStyle='blue';
				$.strokeWidth=1;
				$.setLineDash([4,4]);
				var paddingX=3, paddingY=6;
				for(var i=1; i<5; i++) {
					$.strokeRect(pGrilla*i+paddingX+.5, pInicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
					$.strokeRect(pGrilla*i+paddingX+.5, p2Inicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
					$.strokeRect(pGrilla*i+paddingX+.5, p3Inicio-paddingY+.5,
					             pGrilla-paddingX*2, pLínea*4+paddingY*2);
				}
				$.strokeStyle='black';
				$.setLineDash([]);
				//Notas
					//...
			})
			.catch(function(err) {
				console.log(err);
			});

}
var serie = crearSerie();
transcribirSerie();