function $(q, c) {return (c||document).querySelector(q);}
function $$(q, c) {for(var n=(c||document).querySelectorAll(q),a=[],i=n.length;i;a[--i]=n[i]);return a;}

$$('textarea').forEach(function(textarea) {
	textarea.addEventListener('keydown', textarea_keydown_event_to_handle_TAB_and_RETURN_keys);
});

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
	ta_body.value = iframe.contentDocument.body.innerHTML
	.replace(/<([^\>]*(p|div|blockquote|pre|header|footer|ul|ol|li|h[1-6])[^\>]*)><([^\>]*(p|div|blockquote|pre|header|footer|ul|ol|li|h[1-6])[^\>]*)>/g, '<$1>\n<$3>');
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
		statusBar('Autosave...', true);
}

setInterval(autosave, 10000);

window.onload = function() {
	iframe.contentDocument.designMode = 'On';
}

var toolgroups = [];
toolgroups.push([
	{
		title: "Bold (Ctrl+B)",
		src: "bold.png",
		command: "bold"
	}, {
		title: "Italic (Ctrl+I)",
		src: "italic.png",
		command: "italic"
	}, {
		title: "Underline (Ctrl+U)",
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
		title: "Create link with selected text",
		src: "createlink.png",
		command: function() {
			if(iframe.contentDocument.getSelection().toString()=="")
				return Pop.alert('Must be a selection.');
			Pop.prompt('Create link', 'url:', function(answ) {
				if(answ===false)
					return;
				cmd('createlink', answ);
			});
		}
	}, {
		title: "Insert image",
		src: "insertimage.png",
		command: function() {
			Pop.prompt('Insert image', 'url:', function(answ) {
				if(answ===false)
					return;
				cmd('insertimage', answ);
			});
		}
	}, {
		title: "Insert HTML",
		src: "inserthtml.png",
		command: function() {
			Pop.form('Insert HTML', '<p>HTML to insert:</p><textarea cols="20" rows="10"></textarea>', function(r) {
				if(r===false) return;
				cmd('inserthtml', r);
			});
		}
	}, {
		title: "Insert n-dash (Ctrl+N)",
		src: "ndash.png",
		command: "inserthtml",
		argument: "&ndash;"
	}, {
		title: "Insert m-dash (Ctrl+M)",
		src: "mdash.png",
		command: "inserthtml",
		argument: "&mdash;"
	}
]);
toolgroups.push([
	{
		title: "Remove format (Ctrl+R)",
		src: "removeformat.png",
		command: "removeformat"
	}, {
		title: "Remove link(s)",
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
		'<p> Parragraph': 'P',
		'<pre> Preformated': 'PRE',
		'<div> Divisor': 'DIV',
		'<header> Header': 'HEADER',
		'<footer> Footer': 'FOOTER',
		'<custom block tag>': function() {
			Pop.prompt('Format with custom block tag', 'tag:', function(answ) {
				if(answ!==false)
					cmd('formatblock', answ);
			});
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
			Pop.sync(function *() {
				var selection = iframe.contentDocument.getSelection().toString();
				if(selection !== '') {
					var tag = yield Pop.prompt('Insert custom inline tag', 'tag:');
					if(tag)
						insertInline(tag);
				} else {
					var answ = yield Pop.form('Insert custom inline tag',
						'<p>tag:</p><input type="text" />'+
						'<p>content:</p><input type="text" />');
					if(answ)
						cmd('inserthtml', '<'+answ[0]+'>'+answ[1]+'</'+answ[0]+'>');
				}
			});
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

var fontColor = Pop.form('Font color', 'Choose color: <input type="color">', null,
	{openOnCreate: false}, function(answ, pop) {
		if(answ===false) return;
		if(answ[0]==='')
			return Pop.confirm('Error', 'There must be a color', (answ) => (answ ? pop.open() : ''));
		cmd('forecolor', answ[0]);
	});
var hiliteColor = Pop.form('Hilite color', 'Choose color: <input type="color">', null,
	{openOnCreate: false}, function(answ, pop) {
		if(answ===false) return;
		if(answ[0]==='')
			return Pop.confirm('Error', 'There must be a color', (answ) => (answ ? pop.open() : ''));
		cmd('hilitecolor', answ[0]);
	});

toolgroups2.push([
	{
		title: 'Font face',
		src: 'fontface.png',
		command: function() {
			Pop.prompt('Font face', 'font:', function(answ) {
				if(answ===false) return;
				cmd('fontname', answ);
			});
		}
	}, {
		title: 'Font size',
		src: 'fontsize.png',
		command: function() {
			Pop.prompt('Font size', 'size:', function(answ, pop) {
				if(answ===false) return;
				if(answ==='' || isNaN(answ) || answ < 1 || answ > 7)
					return Pop.confirm('Error', 'Font size must be a number from 1 to 7.', (answ) => (answ? pop.open() : ''));
				cmd('fontsize', answ);
			});
		}
	}, {
		title: 'Font color',
		src: 'fontcolor.png',
		command: function() {
			fontColor.open();
		}
	}, {
		title: 'Hilite color',
		src: 'hilitecolor.png',
		command: function() {
			hiliteColor.open();
		}
	}
]);

toolgroups2.push([
	{
		title: 'Change id',
		src: 'changeid.png',
		command: function() {
			Pop.form('Change id', '<p>id: <input type="text" /></p><small>Leave empty to remove.</small>',
				function(answers) {
					if(answers===false) return;
					changeAttribute('id', answers[0]);
				});
		}
	}, {
		title: 'Change className',
		src: 'changeclassname.png',
		command: function() {
			Pop.form('Change className', '<p>class: <input type="text" /></p><small>Leave empty to remove.</small>',
				function(answers) {
					if(answers===false) return;
					changeAttribute('class', answers[0]);
				});
		}
	}, {
		title: 'Change attribute',
		src: 'changeattr.png',
		command: function() {
			Pop.form('Change attribute', '<p>attr: <input type="text" /></p>'+
				'<p>value: <input type="text" /></p><small>Leave empty to remove.</small>',
				function(answers, pop) {
					if(answers===false) return;
					if(answers[0]==='') {
						Pop.confirm('Error', 'Must be an attr.', function(conf) {
							if(conf) pop.open();
						});
						return;
					}
					changeAttribute(answers[0], answers[1]);
				});
		}
	}, {
		title: 'Inspect tag',
		src: 'inspecttag.png',
		command: inspectTag
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
	iframe.contentDocument.onclick = null;
	iframe.contentDocument.removeEventListener('keydown', escape);
	window.removeEventListener('keydown', escape);
	statusBar('');
}
function escape(event) {
	if(event.keyCode===27) {
		event.preventDefault();
		finishChanging();
		statusBar('Canceled', true);
	}
}

function changeAttribute(attr, val) {
	statusBar('Changing '+attr+'. Click on an element. [Ctrl]: multiple. [Esc]: cancel.');
	window.addEventListener('keydown', escape);
	iframe.contentDocument.addEventListener('keydown', escape);
	iframe.contentDocument.designMode = 'Off';
	iframe.focus();
	iframe.contentDocument.onclick = function(event) {
		event.preventDefault();
		if(!event.ctrlKey)
			finishChanging();
		if(event.target.tagName=='HTML') {
			if(!event.ctrlKey)
				statusBar('Canceled.', true);
			return;
		}
		if(val)
			event.target.setAttribute(attr, val);
		else
			event.target.removeAttribute(attr);
		statusBar('Changed &lt;'+event.target.tagName.toLowerCase()+'&gt;.'+
			(event.ctrlKey? ' Click on an element. [Ctrl]: multiple. [Esc]: cancel.': ''),
			!event.ctrlKey);
	}
}

function inspectTag() {
	statusBar('Select a tag to inspect. [Ctrl]: multiple. [Esc]: cancel.');
	window.addEventListener('keydown', escape);
	iframe.contentDocument.addEventListener('keydown', escape);
	iframe.contentDocument.designMode = 'Off';
	iframe.focus();
	iframe.contentDocument.onclick = function(event) {
		event.preventDefault();
		finishChanging();
		if(event.target.tagName=='HTML') {
			if(!event.ctrlKey)
				return statusBar('Canceled.', true);
			else
				return inspectTag();
		}
		var tag = event.target;
		var pop = Pop('Inspecting &lt;'+tag.tagName.toLowerCase()+'&gt;', '',
				['Cancel', 'Accept'], function(pop) {
					if(pop.status<=0) return;
					$$('input', pop.content).forEach(function(input) {
						if(input.value)
							tag.setAttribute(input.getAttribute('data-attr'), input.value);
						else
							tag.removeAttribute(input.getAttribute('data-attr'));
					});
					if(event.ctrlKey)
						inspectTag();
				});
		var content = '<p><i>'+tag.toString()+'</i></p><p><b>Attributes:</b></p>';
		if(tag.attributes.length===0)
			content += '<p><small>This element has no attributes.</small></p>';
		Array.from(tag.attributes).forEach(function(attr) {
			content += '<p><i>' + attr.name+':</i> <input type="text" value="'+attr.value+'" data-attr="'+attr.name+'" /></p>';
		});
		content += '<a><small>Add attribute.<small></a>';
		pop.content.innerHTML = content;
		$('a', pop.content).onclick = function(event) {
			event.preventDefault();
			pop.close();
			Pop.prompt('Add attribute', 'attr:', function(answ) {
				pop.open();
				if(answ)
					pop.content.insertBefore(elt('<p><i>'+answ+':</i> '+
						'<input type="text" data-attr="'+answ+'" /></p>'), $('a', pop.content));
				$('input:last-child', pop.content).focus();
			});
		}
	}
}

toolgroups2.forEach(createToolgroupInToolbar);

function importFile() {
	var input = elt('<input type="file" />');
	input.click();
	input.onchange = function() {
		if(input.files.length===0) return;
		if(input.files[0].type!=='text/html')
			return Pop.alert('Error', 'File must be of type "text/html".');
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
					statusBar('Error while importing '+name+'.', true);
					Pop.alert('Error', '<p>File could not be read.</p><small>'+error.toString()+'</small>');
					return;
				}
				iframe.contentDocument.addEventListener('DOMContentLoaded', function _load() {
					iframe.contentDocument.removeEventListener('DOMContentLoaded', _load);
					ta_head.value = iframe.contentDocument.head.innerHTML;
					ta_body.value = iframe.contentDocument.body.innerHTML;
					iframe.contentDocument.body.innerHTML += ''; //Stops scripts
					iframe.contentDocument.designMode = 'On';
					iframe.contentDocument.addEventListener('keydown', shortcuts);
					statusBar('Imported '+name+'.', true);
				});
			}
		}
		reader.readAsText(input.files[0]);
	}
}

function exportFile() {
	statusBar('Exporting to file...');
	Pop.sync(function *() {
		var repeat = true;
		while(repeat) {
			var filename = $('#filename').value;
			if(!filename) filename = yield Pop.prompt('Export to file', 'file name:');
			if(filename===false) return;
			if(filename==="") {
				repeat = yield Pop.confirm('Error', 'Must be a filename');
				if(repeat===false)
					return;
			} else
				break;
		}
		filename = filename.replace(/\.html$/, '') + '.html';
		$('#filename').value = filename;
		downloadTextFile('text/html', filename, getFullHTML());
		statusBar('Successfully exported to '+filename, true);
	});
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
		title: 'Import',
		src: 'import.png',
		command: importFile
	}, {
		title: 'Export',
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

cmd('insertbronreturn', true);