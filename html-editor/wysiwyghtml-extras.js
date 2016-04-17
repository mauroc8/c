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
				text += selection.replace(/^\t/, '').replace(/\n\t/g, "\n");
				var newselectEnd = text.length;
				text += this.value.substring(this.selectionEnd);
				this.value =  text;
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