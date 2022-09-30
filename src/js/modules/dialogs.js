
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
				switch (true) {
					case el.hasClass("toggler"):
						return el.data("value") === "on"
								? el.data({ value: "off" })
								: el.data({ value: "on" });
					case el.hasClass("knob"):
						return Self.doKnob(event);
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
	doKnob(event) {
		let APP = keane,
			Self = Dialogs,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				let el = $(event.target),
					src = el.parent().find(".value input"),
					suffix = src.data("suffix") || "",
					min = +src.data("min"),
					max = +src.data("max"),
					click = {
						y: event.clientY,
						x: event.clientX,
					};
				Self.drag = { el, src, suffix, min, max, click };
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				break;
			case "mouseup":

				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				break;
		}
	}
};
