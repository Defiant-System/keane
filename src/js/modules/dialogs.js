
const Dialogs = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("mousedown", "[data-dlg]", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag,
			el;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				el = $(event.target);
				if (el.hasClass("toggler")) {
					if (el.data("value") === "on") el.data({ value: "off" });
					else el.data({ value: "on" });
					return;
				}

				// prevent default behaviour
				event.preventDefault();

				let dlg = el.parents(".dialog-box"),
					offset = {
						y: +dlg.prop("offsetTop") - event.clientY,
						x: +dlg.prop("offsetLeft") - event.clientX,
					};

				Self.drag = {
					dlg,
					offset,
				};

				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.dlg.css({ top, left });
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.dispatch);
				break;

			// custom event
			case "dlg-preview-gaussian-blur":
			case "dlg-preview-sharpen":
				console.log( event );
				break;
		}
	},
	dlgGaussianBlur: {},
	dlgSharpen: {},
	dlgColors: {},
	doKnob(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag,
			_round = Math.round,
			_min = Math.min,
			_max = Math.max,
			data,
			value,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				el = $(event.target);
				value = +el.data("value");

				Self.drag = {
					el,
					value,
					src: Self.srcEl.find(".value"),
					suffix: Self.srcEl.data("suffix") || "",
					min: +Self.srcEl.data("min"),
					max: +Self.srcEl.data("max"),
					clientY: event.clientY,
					clientX: event.clientX,
				};
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				value = (Drag.clientY - event.clientY) + Drag.value;
				value = _min(_max(value, 0), 100);
				Drag.el.data({ value });

				Drag.newValue = Drag.min + _round((value / 100) * (Drag.max - Drag.min));
				Drag.src.html(Drag.newValue + Drag.suffix);
				break;
			case "mouseup":
				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					old: Drag.value,
					value: Drag.newValue,
				};
				if (data.old === data.value) return;
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);

				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				// clean up
				Self.srcEl = false;
				Self.menu.remove();
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				value = parseInt(event.el.find(".value").text(), 10);
				Self.menu.find(".knob").data({ value });
				break;
		}
	}
};
