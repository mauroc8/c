var Pop = window.Pop = (function() {
	// helpers
	var $ = (q, ctx) => (ctx||document).querySelector(q);
	var $$ = (q, ctx) => (ctx||document).querySelectorAll(q);
	var forEach = (ctx, ...args) => Array.prototype.forEach.apply(ctx, args);
	var arrFn = (fn, ctx, ...args) => Array.prototype[fn].apply(ctx, args);
	var elt = function(txt) {
		var div = document.createElement('div');
		div.innerHTML = txt;
		return div.removeChild(div.firstChild);
	}
	
	var _settingsDefault = {
		exitOnEscape: true,
		exitOnReturn: true,
		exitOnClick: true,
		openOnCreate: true,
		buttonClass: '',
		buttonStyle: '',
		inputClass: '',
		inputStyle: ''
	};
	
	function _orderArgs(args) {
		var title, content, buttons, settings, callback;
		
		if(typeof args[args.length-1] == "function")
			callback = args.pop();
		
		
		if(args.length > 1) {
			if(typeof args[0] == 'string' && typeof args[1] == 'string') {
				title = args.shift();
				content = args.shift();
			} else {
				content = args.shift();
			}
			buttons = args[0];
			settings = args[1];
		} else if(args.length === 1)
			content = args[0];
		
		return [title, content, buttons, settings, callback];
	}
	
	function Pop(...args) {
		if ( !(this instanceof Pop) ) 
			return new Pop(...args);
		
		if(args.length!==5)
			args = _orderArgs(args);
		
		var title = args[0],
			content=args[1],
			buttons=args[2],
			settings=args[3],
			callback=args[4];
		
		this.container = elt('<div>'+
			'<div class="pop-blackscreen" tabIndex=0></div>'+
			'<div class="pop-window">'+
				'<div class="pop-header">'+
					'<h6 class="pop-title"></h6>'+
					'<button class="pop-escape">x</button>'+
				'</div>'+
				'<div class="pop-inner">'+
					'<div class="pop-content" tabIndex=1></div>'+
					'<div class="pop-buttons"></div>'+
				'</div>'+
			'</div>'+
		'</div>');
		
		this.settings = Object.create(_settingsDefault);		
		if(typeof settings === "object")
			for(var s in settings)
				if(settings.hasOwnProperty(s))
					this.settings[s] = settings[s];

		this.title=title || 'Alerta';
		this.content=content || '';
		this.buttons=buttons || ['Aceptar'];
		this.callback=callback || function() {};
		this.eventList = [];
		
		$('.pop-escape', this.container).addEventListener('click', (e) => {
			e.preventDefault();
			this.close(-1, 'CLOSE-BUTTON');
		});
		this.container.addEventListener('keydown', (event) => {
			if(event.keyCode==13&&this.settings.exitOnReturn) {
				event.preventDefault();
				event.stopPropagation();
				this.close(13, 'RETURN');
			} else if(event.keyCode==27&&this.settings.exitOnEscape) {
				event.preventDefault();
				event.stopPropagation();
				this.close(-3, 'ESCAPE');
			}
		});
		$('.pop-blackscreen', this.container).addEventListener('click', () => {
			if(this.settings.exitOnClick)
				this.close(-2, 'CLICK-OUTSIDE');
		});
		
		if(this.settings.openOnCreate) {
			if(!document.body)
				window.addEventListener('load', this.open.bind(this));
			else
				this.open();
		}
	}
	['content','title'].forEach(function(nn) {
		Object.defineProperty(Pop.prototype, nn, {
			get: function() { return $('.pop-'+nn, this.container); },
			set: function(t) { $('.pop-'+nn, this.container).innerHTML = t; }
		});
	});
	Object.defineProperty(Pop.prototype, 'buttons', {
		get: function() { return $('.pop-buttons', this.container); },
		set: function(newBtns) {
			if(typeof newBtns=="string")
				newBtns = [newBtns];
			
			this.buttons.innerHTML = '';
			newBtns.forEach(function(name, i) {
				var btn = elt('<button '+
					'style="'+this.settings.buttonStyle+'" '+
					'class="'+this.settings.buttonClass+'"'+
					'>'+name+'</button>');
				
				btn.addEventListener('click', (e) => {
					e.preventDefault();
					this.close(i, btn.textContent);
				});
				
				this.buttons.appendChild(btn);
			}, this);
		}
	});
	Pop.prototype.open = function() {
		this.status=undefined;
		this.responseText=null;
		
		document.body.appendChild(this.container);
		($('.pop-content input', this.container)||
		 $('.pop-content textarea', this.container) ||
		 $('.pop-content', this.container)).focus();
	}
	Pop.prototype.close = function(status, responseText) {
		this.status = status===undefined ? -400 : status;
		this.responseText = responseText===undefined ? '?' : responseText;
		if(this.callback(this)===false) return;
		document.body.removeChild(this.container);
	}
	Pop.prototype.on = function(ev, fn) {
		this.eventList.push([ev,fn]);
		this.container.addEventListener(ev, fn);
	}
	Pop.prototype.off = function(ev, fn) {
		this.eventList.forEach(function(arr) {
			if(arr[0]==ev) {
				if(fn==undefined || arr[1] == fn)
					this.container.removeEventListener(ev, arr[1]);
			}
		});
	}
	
	Pop.config = function(s) {
		if(!s || typeof s !== 'object')
			throw new Error('Pop.prototype.settings({...}) needs an object as argument.');
		for(var i in s)
			if(s.hasOwnProperty(i))
				_settingsDefault[i] = s[i];
	}
	
	Pop.set = function(s, v) {
		return arguments.length>=2 ? _settingsDefault[s] = v : _settingsDefault[s];
	}
	
	Pop.alert = function(...args) {		
		return new Pop(...args);
	}
	
	Pop.info = function(...args) {
		args = _orderArgs(args);
		var title = args[0] || "Info",
			content=args[1],
			buttons=args[2] || ['Aceptar'],
			settings=args[3],
			callback=args[4];
		
		return new Pop(title, content, buttons, settings, callback);
	}
	
	Pop.confirm = function(...args) {
		args = _orderArgs(args);
		var title = args[0] || 'Confirmar',
			content=args[1],
			buttons=args[2] || ['Cancelar', 'Aceptar'],
			settings=args[3],
			callback=args[4];
		
		var pop = new Pop(title, content, buttons, settings);
		pop.innerCallback = callback || function() {};
		pop.callback = function() {
			if(pop.status>0)
				return pop.innerCallback(true, pop);
			else return pop.innerCallback(false, pop);
		};
		return pop;
	}
	
	Pop.prompt = function(...args) {
		args = _orderArgs(args);
		var settings = args[3];
		if(settings) {
			var additions = "";
			if(settings.inputClass)
				additions += 'class="'+settings.inputClass+'" ';
			if(settings.inputStyle)
				additions += 'style="'+settings.inputStyle+'"';
		}
		var title = args[0] || 'Pregunta',
			content=args[1]+'<p><input type="text" id="pop-prompt" '+additions+'/></p>',
			buttons=args[2] || ['Cancelar', 'Aceptar'],
			callback=args[4];
		
		var pop = new Pop(title, content, buttons, settings);
		pop.innerCallback = callback || function() {};
		pop.callback = function() {
			if(pop.status>0)
				return pop.innerCallback($('#pop-prompt', pop.container).value, pop);
			else return pop.innerCallback(false, pop);
		};
		return pop;
	}
	
	Pop.form = function(...args) {
		args = _orderArgs(args);
		var title = args[0] || 'Formulario',
			content=args[1],
			buttons=args[2] || ['Cancelar', 'Enviar'],
			settings=args[3],
			callback=args[4];
		
		var pop = new Pop(title, content, buttons, settings);
		pop.innerCallback = callback || function() {};
		pop.callback = function() {
			if(pop.status>0)
				return pop.innerCallback(
					arrFn('map',
						$$('input, textarea, select', pop.container),
						elem => elem.value), pop);
			else return pop.innerCallback(false, pop);
		};
		return pop;
	}
	
	Pop.sync = function(generator) {
		if(generator.constructor.name !== 'GeneratorFunction')
			throw new SyntaxError('Pop.sync: call with generator function: Pop.sync(function *(){});');
		return new Promise(function(success, fail) {
			var it = generator();
			function _cb(answ) {
				var pop = it.next(answ);
				if(pop.done===false) {
					if(pop.value instanceof Pop) {
						if(pop.value.innerCallback)
							pop.value.innerCallback = _cb;
						else pop.value.callback = _cb;
					} else {
						throw new SyntaxError('Pop.sync: Usá la expresión "yield" solamente para objetos Pop()');
					}
				} else {
					success(pop.value);
				}
			}
			_cb(null);
		});
	}
	
	return Pop;
})();
