
/*
 * HTML Editor
 * AYUDANTES
 * 
 */

function $(query, context) {
	return (context||document).querySelector(query);
}
function $$(query, context) {
	return Array.prototype.slice.call((context||document).querySelectorAll(query));
}
function elt(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.firstChild;
}

/*
 * HTML Editor
 * VARIABLES GLOBALES...
 * y configuraciones iniciales
 * 
 */

var ta_head = $('#edit-head textarea'),
	ta_body = $('#edit-body textarea'),
	iframe = $('iframe');

var edit_mode = 'html';

$('#edit-body a').onclick = function() {
	iframe.contentDocument.head.innerHTML = ta_head.value;
	iframe.contentDocument.body.innerHTML = ta_body.value;
	edit_mode = 'wysiwyg';
	$('#edit-body').style.display = 'none';
	$('#edit-wysiwyg').style.display = 'block';
	iframe.focus();
}
$('#edit-wysiwyg a').onclick = function() {
	ta_head.value = iframe.contentDocument.head.innerHTML;
	ta_body.value = iframe.contentDocument.body.innerHTML;
	//.replace(/<([^\>]*(p|div|blockquote|pre|header|footer|ul|ol|li|h[1-6])[^\>]*)><([^\>]*(p|div|blockquote|pre|header|footer|ul|ol|li|h[1-6])[^\>]*)>/g, '<$1>\n<$3>');
	edit_mode = 'html';
	$('#edit-body').style.display = 'block';
	$('#edit-wysiwyg').style.display = 'none';
	ta_body.focus();
}

ta_head.oninput = function() {
	if(edit_mode === 'wysiwyg')
		iframe.contentDocument.head.innerHTML = this.value;
}

//Autoload
if(localStorage.getItem('edit-mode')) {
	edit_mode = localStorage.getItem('edit-mode');
	ta_head.value = localStorage.getItem('edit-head');
	ta_body.value = localStorage.getItem('edit-body');
	$('#filename').value = localStorage.getItem('edit-name');
	if(edit_mode==='wysiwyg')
		$('#edit-body a').click();
}

function autosave() {
	localStorage.setItem('edit-mode', edit_mode);
	localStorage.setItem('edit-head', ta_head.value);
	localStorage.setItem('edit-body', edit_mode==='html'? ta_body.value: iframe.contentDocument.body.innerHTML);
	localStorage.setItem('edit-name', $('#filename').value);
	if($('#status-bar').innerHTML==='')
		statusBar('guardado', true);
}

setInterval(autosave, 10000);

window.onload = function() {
	iframe.contentDocument.designMode = 'On';
	iframe.contentDocument.body.spellcheck = false;
	cmd('insertbronreturn', true);
	$('#edit-body a').click();
}

$('#change-head').onclick = function() {
	document.body.classList.toggle('head-right');
}

/*
 * HTML Editor
 * HERRAMIENTAS
 * 
 */

var toolgroups = [];
toolgroups.push([
	{
		title: "Negrita (Ctrl+B)",
		src: "bold.png",
		command: "bold"
	}, {
		title: "Cursiva (Ctrl+I)",
		src: "italic.png",
		command: "italic"
	}, {
		title: "Subrayado (Ctrl+U)",
		src: "underline.png",
		command: "underline"
	}
]);
toolgroups.push([
	{
		title: "Align left",
		src: "justifyleft.png",
		command: "justifyleft"
	}, {
		title: "Align center",
		src: "justifycenter.png",
		command: "justifycenter"
	}, {
		title: "Align right",
		src: "justifyright.png",
		command: "justifyright"
	}, {
		title: "Align justify",
		src: "justifyfull.png",
		command: "justifyfull"
	}
]);
toolgroups.push([
	{
		title: "Indent",
		src: "indent.png",
		command: "indent"
	}, {
		title: "Outdent",
		src: "outdent.png",
		command: "outdent"
	}, {
		title: "Unordered list",
		src: "unorderedlist.png",
		command: "insertunorderedlist"
	}, {
		title: "Ordered list",
		src: "orderedlist.png",
		command: "insertorderedlist"
	}
]);

toolgroups.push([
	{
		title: "Crear link",
		src: "createlink.png",
		command: function() {
			if(iframe.contentDocument.getSelection().toString()=="") {
				var url = prompt('Crear link\n1/2 Url:');
				if(url===null) return;
				var contenido = prompt('Crear link\n2/2 Contenido:');
				if(contenido===null) return;
				cmd('inserthtml', '<a href="'+url+'">'+contenido+'</a>');
			} else {
				var answ = prompt('Crear link:');
				if(answ===null)
					return;
				cmd('createlink', answ);
			}
		}
	}, {
		title: "Insertar imágen",
		src: "insertimage.png",
		command: function() {
			var answ = prompt('Insertar imágen:');
			if(answ===null)
				return;
			cmd('insertimage', answ);
		}
	}, {
		title: "Insertar HTML",
		src: "inserthtml.png",
		command: function() {
			var answ = prompt('Insertar HTML:');
			if(answ===null) return;
			cmd('inserthtml', answ);
		}
	}, {
		title: "Insertar n-dash (Ctrl+N)",
		src: "ndash.png",
		command: "inserthtml",
		argument: "&ndash;"
	}, {
		title: "Insertar m-dash (Ctrl+M)",
		src: "mdash.png",
		command: "inserthtml",
		argument: "&mdash;"
	}
]);

var fontColor = crearModal('Color de fuente:', '<input type="color"/><br><button>Aceptar</button>');
$('button', fontColor.elt).onclick = function() {
	cmd('forecolor', $('input', fontColor.elt).value);
	fontColor.close();
}
var hiliteColor = crearModal('Resaltar:', '<input type="color"/><br><button>Aceptar</button>');
$('button', hiliteColor.elt).onclick = function() {
	cmd('hilitecolor', $('input', hiliteColor.elt).value);
	hiliteColor.close();
}
toolgroups.push([
	{
		title: 'Nombre de fuente',
		src: 'fontface.png',
		command: function() {
			var answ = prompt('Fuente:');
			if(answ===null) return;
			cmd('fontname', answ);
		}
	}, {
		title: 'Tamaño de fuente',
		src: 'fontsize.png',
		command: function() {
			var answ = prompt('Tamaño de fuente:');
			if(answ===null) return;
			if(answ==='' || isNaN(answ) || answ < 1 || answ > 7)
				return alert('El tamaño de fuente tiene que ser un número entre 1 y 7.');
			cmd('fontsize', answ);
		}
	}, {
		title: 'Cambiar color a texto',
		src: 'fontcolor.png',
		command: function() {
			fontColor.open();
		}
	}, {
		title: 'Resaltar texto',
		src: 'hilitecolor.png',
		command: function() {
			hiliteColor.open();
		}
	}
]);

toolgroups.push([
	{
		title: "Borrar formato (Ctrl+R)",
		src: "removeformat.png",
		command: "removeformat"
	}, {
		title: "Borrar link(s)",
		src: "unlink.png",
		command: "unlink"
	}
]);


function cmd(name, args) {
	iframe.contentDocument.execCommand(name, null, args);
	iframe.focus();
}

function createToolgroup(parent, toolgroup) {
	var groupContainer = elt('<div class="toolgroup"></div>');
	toolgroup.forEach(function(tool) {
		var btn = elt('<button title="'+tool.title+'">'+
										'<img src="icons/'+tool.src+'" />'+
									'</button>');
		btn.onclick = function(event) {
			event.preventDefault();
			if(typeof tool.command === 'function')
				tool.command();
			else
				cmd(tool.command, tool.argument);
		}
		groupContainer.appendChild(btn);
	});
	parent.appendChild(groupContainer);
}

var createToolgroupInToolbar = createToolgroup.bind(null, $('#toolbar'));

toolgroups.forEach(createToolgroupInToolbar);

var selectgroups = [];

selectgroups.push({
	title: '- heading -',
	command: 'formatblock',
	options: {
		'Heading 1': 'H1',
		'Heading 2': 'H2',
		'Heading 3': 'H3',
		'Heading 4': 'H4',
		'Heading 5': 'H5',
		'Heading 6': 'H6'
	}
});
selectgroups.push({
	title: '- block tag -',
	command: 'formatblock',
	options: {
		'<p> Párrafo': 'P',
		'<pre> Pre': 'PRE',
		'<div> Divisor': 'DIV',
		'<header> Header': 'HEADER',
		'<footer> Footer': 'FOOTER',
		'<custom block tag>': function() {
			var answ = prompt('Block tag:');
			if(answ!==null)
				cmd('formatblock', answ);
		}
	}
});
function insertInline(tag) {
	var selection = iframe.contentDocument.getSelection().toString();
	return cmd('inserthtml', '<'+tag+'>'+selection+'</'+tag+'>');
}
selectgroups.push({
	title: '- inline tag -',
	command: 'inserthtml',
	options: {
		'<code> Code': insertInline.bind(null, 'code'),
		'<button> Button': insertInline.bind(null, 'button'),
		'<custom inline tag>': function() {
			var tag = prompt('Tag:');
			if(tag === false) return;
			var selection = iframe.contentDocument.getSelection().toString();
			if(selection) {
				insertInline(tag);
			} else {
				var content = prompt('Contenido:');
				if(content === false) return;
				cmd('inserthtml', '<'+tag+'>'+content+'</'+tag+'>');
			}
		}
	}
});

function htmlParse(str) {
	return str.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

selectgroups.forEach(function(selectgroup) {
	var select = document.createElement('select');
	select.appendChild(elt('<option value="-1">'+selectgroup.title+'</option>'));
	
	var commands = [];
	for(var opt in selectgroup.options) {
		if(!selectgroup.options.hasOwnProperty(opt))
			continue;
		select.appendChild( elt('<option value='+commands.length+'>'+
															htmlParse(opt)+
														'</option>'));
		commands.push(selectgroup.options[opt]);
	}
	select.onchange = function() {
		var command = commands[Number(this.value)];
		if(!command) return false;
		if(typeof command === 'function')
			command();
		else
			cmd(selectgroup.command, command);
		this.value = -1;
	}
	$('#toolbar').appendChild(select);
});

var toolgroups2 = [];

toolgroups2.push([
	{
		title: 'Inspeccionar elemento (ctrl+click)',
		src: 'inspecttag.png',
		command: buttonInspectTag
	}
]);

var statusBar = function() {
	var timeout = null;
	return function statusBar(text, autorremove) {
		if(timeout) clearTimeout(timeout);
		$('#status-bar').innerHTML = text;
		if(autorremove===true)
			timeout = setTimeout(function() {
				$('#status-bar').innerHTML = '';
			}, 3000);
	}
}();

function finishChanging() {
	iframe.contentDocument.designMode = 'On';
	iframe.contentDocument.onmousemove = null;
	iframe.contentDocument.onclick = ctrlInspectTag;
	iframe.contentDocument.removeEventListener('keydown', escape);
	window.removeEventListener('keydown', escape);
	statusBar('');
}
function ctrlInspectTag(event) {
	if(event.ctrlKey)
		inspectTag(event.target);
}
function escape(event) {
	if(event.keyCode===27) {
		event.preventDefault();
		finishChanging();
		statusBar('Cancelado', true);
	}
}
function buttonInspectTag() {
	statusBar('Inspeccionar elemento:');
	window.addEventListener('keydown', escape);
	iframe.contentDocument.addEventListener('keydown', escape);
	iframe.contentDocument.designMode = 'Off';
	iframe.focus();
	iframe.contentDocument.onmousemove = function(event) {
		if(event.target.tagName == 'BODY'||event.target.tagName == 'HTML') {
			statusBar('Inspeccionar elemento:');
			return;
		}
		var target = event.target;
		var tagDescription = htmlParse(target.outerHTML.replace(/>[\W\w]*/, '>'));
		statusBar('Inspeccionar elemento: ' + tagDescription);
	}
	iframe.contentDocument.onclick = function(event) {
		event.preventDefault();
		finishChanging();
		inspectTag(event.target);
	}
}
function deleteParent() {
	this.parentNode.parentNode.removeChild(this.parentNode);
}
function inspectTag(target) {
	if(target==null)
		statusBar('Cancelado', true);
	//MODAL
	var contenidoTabla = "";
	for(var i=0; i<target.attributes.length; i++) {
		var attr = target.attributes[i];
		var name = attr.name;
		var val = attr.value;
		contenidoTabla += '<tr><td class="edit">'+name+'</td><td>=</td><td class="edit">'+val+'</td><td>-</td></tr>';
	}
	var modal = crearModal('Inspeccionar elemento',
		'<h5>Atributos del elemento <b>&lt;'+target.tagName+'&gt;</b></h5>\n'+
		'<table><tbody>'+contenidoTabla+'</tbody></table>'+
		'<p><a>+agregar</a></p>'+
		'<button>Aceptar</button>');
	$$('.edit',modal.contenido).forEach(td => {
		td.contentEditable = true;
		td.spellcheck = false;
	});
	$$('td:last-child',modal.contenido).forEach(td=>td.onclick=deleteParent);
	$('a',modal.contenido).onclick = function() {
		$('tbody',modal.contenido).innerHTML += '<tr>'+
			'<td contentEditable=true spellcheck=false></td>'+
			'<td>=</td>'+
			'<td contentEditable=true spellcheck=false></td>'+
			'<td>-</td>';
		$$('td:last-child',modal.contenido).forEach(td=>td.onclick=deleteParent);
		$('tr:last-child td').focus();
	}
	$('button',modal.contenido).onclick=function() {
		while(target.attributes.length)
			target.removeAttribute(target.attributes[0].name);
		
		$$('tr',modal.contenido).forEach(function(tr) {
			var tds = $$('td',tr);
			var name = tds[0].textContent;
			var val = tds[2].textContent;
			if(name)
				target.setAttribute(name,val);
		});
		modal.close();
	}
	modal.open();
}

toolgroups2.forEach(createToolgroupInToolbar);

function importFile() {
	var input = elt('<input type="file" />');
	input.click();
	input.onchange = function() {
		if(input.files.length===0) return;
		if(input.files[0].type!=='text/html')
			return alert('Error\nTiene que ser un archivo de tipo "text/html".');
		var name = input.files[0].name;
		var reader = new FileReader();
		reader.onload = function() {
			$('#filename').value = name;
			localStorage.setItem('edit-name', name);
			statusBar('Importing '+name+'...');
			var html = reader.result;
			iframe.src = 'about:blank';
			iframe.onload = function() {
				iframe.onload = null;
				try {
					iframe.contentDocument.open('text/html');
					iframe.contentDocument.write(html);
					iframe.contentDocument.close();
				} catch(error) {
					statusBar('Error al importar '+name+'.', true);
					alert('Error:\n<p>El archivo no pudo ser leído.</p><small>'+error.toString()+'</small>');
					return;
				}
				iframe.contentDocument.addEventListener('DOMContentLoaded', function _load() {
					iframe.contentDocument.removeEventListener('DOMContentLoaded', _load);
					ta_head.value = iframe.contentDocument.head.innerHTML;
					ta_body.value = iframe.contentDocument.body.innerHTML;
					iframe.contentDocument.body.innerHTML += ''; //Stops scripts
					iframe.contentDocument.designMode = 'On';
					iframe.contentDocument.body.spellchech = false;
					iframe.contentDocument.addEventListener('keydown', shortcuts);
					statusBar('Imported '+name+'.', true);
				});
			}
		}
		reader.readAsText(input.files[0]);
	}
}

function exportFile() {
	statusBar('Exportando archivo');
	var filename = $('#filename').value.replace(/\.html$/, '') + '.html';
	downloadTextFile('text/html', filename, getFullHTML());
	statusBar('Archivo exportado a '+filename, true);
}

function getFullHTML() {
	return '<!DOCTYPE html>\n'+
			'<html>\n'+
			'<head>\n'+ta_head.value+'\n</head>\n'+
			'<body>\n'+(edit_mode==='html'?ta_body.value:iframe.contentDocument.body.innerHTML)+'\n</body>\n'+
			'</html>';
}

var fileTools = [];

fileTools.push([
  {
  	title: 'Nuevo',
  	src: 'nuevo.png',
  	command: function() {
  		var conf = confirm('Se van borrar todos los cambios que no hayas guardado');
  		if(conf) {
  			ta_body.value = '';
  			ta_head.value = '';
  			iframe.contentDocument.body.innerHTML = '';
  		}
  	}
  }, {
		title: 'Importar',
		src: 'import.png',
		command: importFile
	}, {
		title: 'Exportar',
		src: 'export.png',
		command: exportFile
	}, {
		title: 'Preview in new window',
		src: 'preview.png',
		command: function() {
			PreviewPage(getFullHTML());
		}
	}
]);

fileTools.forEach(createToolgroup.bind(null, $('#file-tools')));

/*
 * HTML Editor
 * SHORTCUTS
 * atajos de teclado
 * 
 */

var shortcuts = (function() {
	var ctrlShortcuts = {
		66: 'bold',
		73: 'italic',
		85: 'underline',
		78: ['inserthtml', '&ndash;'],
		77: ['inserthtml', '&mdash;'],
		69: exportFile,
		82: 'removeformat',
		83: autosave
	}
	return function shortcuts(event) {
		if(event.keyCode===9) {
			event.preventDefault();
			cmd('inserthtml', '\t');
		}
		if(!event.ctrlKey)
			return;
		for(var keycode in ctrlShortcuts) {
			if(ctrlShortcuts.hasOwnProperty(keycode)==false)
				continue;
			if(event.keyCode==keycode) {
				event.preventDefault();
				var command = ctrlShortcuts[keycode];
				switch(typeof command) {
					case 'function':
						command();
						break;
					case 'object':
						cmd(command[0], command[1]);
						break;
					case 'string':
						cmd(command);
						break;
				}
			}
		}
	}
})();

iframe.contentDocument.addEventListener('keydown', shortcuts);
iframe.contentDocument.onclick = ctrlInspectTag;

/*
 * HTML Editor
 * EXTRAS
 * 
 */

function textarea_keydown_event_to_handle_TAB_and_RETURN_keys(event) {
	//TAB behavior
	if(event.keyCode == 9) {
		event.preventDefault();
		var selection = this.value.substring(this.selectionStart, this.selectionEnd);
		
		if(event.shiftKey == false) {
			if(selection==="") {
				var text = this.value.substring(0, this.selectionStart) + '\t';
				var selpoint = text.length;
				this.value = text + this.value.substring(this.selectionEnd);
				this.setSelectionRange(selpoint, selpoint);
			} else {
				var text = this.value.substring(0, this.selectionStart);
				var newselectStart = text.length;
				text += "\t" + selection.replace(/\n(?!$)/g, "\n\t");
				var newselectEnd = text.length;
				text += this.value.substring(this.selectionEnd);
				this.value =  text;
				this.setSelectionRange(newselectStart, newselectEnd);
			}
		} else {
			if(selection==="") {
				var text = this.value.substring(0, this.selectionStart).replace(/\t$/, '');
				var selpoint = text.length;
				this.value = text + this.value.substring(this.selectionEnd);
				this.setSelectionRange(selpoint,selpoint);
			} else {
				var text = this.value.substring(0, this.selectionStart);
				var newselectStart = text.length;
				text += selection.replace(/^(\t|  )/gm, "");
				var newselectEnd = text.length;
				text += this.value.substring(this.selectionEnd);
				this.value = text;
				this.setSelectionRange(newselectStart, newselectEnd);
			}
		}
		return;
	}
	// RETURN (newline) behavior
	if(event.keyCode==13) {
		event.preventDefault();
		var selection = this.value.substring(this.selectionStart, this.selectionEnd);
		
		var text = this.value.substring(0, this.selectionStart);
		
		var arr = text.split("\n");
		var lastLineIndent = /^\t*/.exec(arr.pop())[0];
		
		text += "\n" + lastLineIndent;
		var selPoint = text.length;
		
		text +=  this.value.substring(this.selectionEnd)
		this.value = text;
		this.setSelectionRange(selPoint, selPoint);
		return;	
	}
}

$$('textarea').forEach(function(textarea) {
	textarea.addEventListener('keydown', textarea_keydown_event_to_handle_TAB_and_RETURN_keys);
});

function replaceSelection(replace, textarea) {
	var selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
	var first = textarea.value.substring(0, textarea.selectionStart);
	var last = textarea.value.substring(textarea.selectionEnd);
	
	textarea.value = first + replace.replace('$&', selection) + last;
	return selection;
}

function elt(s) {
	var div = document.createElement('div');
	div.innerHTML = s;
	return div.removeChild(div.firstChild);
}

function downloadTextFile(type, filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:'+type+';charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function PreviewPage(content) {
	var wind = window.open("","_blank","width="+screen.width+",height="+screen.height+",left=0,top=0,menubar=yes,toolbar=yes,location=yes,scrollbars=yes");
	wind.document.open();
	wind.document.write(content);
	wind.document.close();
}

//ventanita.js
var estilosVentanita = '*{margin:0;padding:0;box-sizing:inherit}body,html{height:100%;box-sizing:border-box}#modal{position:absolute;bottom:0;left:50%;width:400px;margin-left:-200px;padding:10px;background-color:#eee8aa;transition:max-height .3s ease-in-out;max-height:0;overflow:auto}#modal.open{max-height:40vh}#modal h1{font:700 22px sans-serif;display:inline-block}#modal svg{float:right;cursor:pointer}#modal button{margin:0;padding:2px;border:1px solid gray;background-color:#d3d3d3;float:right}#modal table{width:100%;border:1px solid gray;margin:2px 0}#modal table td{font-style:italic;color:gray;min-width:20px}#modal table td:focus{color:#000;outline:0}#modal table td:last-child{cursor:pointer;color:#000;font-style:normal;font-weight:700}';
var ventanita = document.createElement('style');
ventanita.innerHTML = estilosVentanita;
document.head.appendChild(ventanita);

var ícono_cerrar = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
function crearModal(título, contenido, abrir) {
	var modal = elt('<div id="modal">');
	
	if(título) {
		var h1 = elt('<h1>');
		h1.textContent = título;
		modal.appendChild(h1);
	}
	
	var cerrar = elt(ícono_cerrar);
	cerrar.onclick = fnCerrar;
	modal.appendChild(cerrar);
	
	var div = elt('<div id="contenido">');
	
	if(typeof contenido == 'string')
		div.innerHTML = contenido;
	else if(contenido instanceof HTMLElement)
		div.appendChild(contenido);
	else if(contenido[0])
		for(var i=0; i<contenido.length; i++)
			div.appendChild(contenido[i]);
		
	modal.appendChild(div);
	
	var obj = Object.assign(Object.create(null), {
		elt: modal,
		título: h1,
		contenido: div,
		open: fnAbrir,
		close: fnCerrar
	});
	
	function fnAbrir() {
		document.body.appendChild(modal);
		setTimeout(_ => {
			modal.classList.add('open');
		},10);
	}
	function fnCerrar() {
		modal.classList.remove('open');
		setTimeout(_ => {
			document.body.removeChild(modal);
		},300);
	}
	
	if(abrir)
		fnAbrir();
	
	return obj;
}