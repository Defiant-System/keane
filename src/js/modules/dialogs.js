
const Dialogs = {
	dlgBrightnessContrast(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		// console.log(event);
		switch (event.type) {
			// "fast events"
			case "set-contrast-amount":
			case "set-brightness-amount":
				if (Self.data.value === event.value) return;
				Self.data.value = event.value;
				// apply filter on pixels
				let px = Self.data.pixels,
					copy = new ImageData( new Uint8ClampedArray(px.data), px.width, px.height ),
					filtered = Filters[Self.data.filter](copy, event.value);
				Self.data.layer.ctx.putImageData(filtered, 0, 0);
				// render file
				Projector.file.render({ noEmit: 1 });
				break;
			// slow/once events
			case "after:set-contrast-amount":
			case "after:set-brightness-amount":
				// console.log(event);
				break;
			case "before:set-contrast-amount":
			case "before:set-brightness-amount":
				let file = Projector.file,
					layer = Projector.file.activeLayer,
					pixels = layer.ctx.getImageData(0, 0, layer.width, layer.height),
					filter = event.type.split("-")[1];
				// fast references for knob twist event
				Self.data = { file, layer, pixels, filter };
				break;
			case "dlg-close":
				UI.doDialog(event);
				break;
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgGaussianBlur(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		// console.log(event);
		switch (event.type) {
			case "dlg-close":
				UI.doDialog(event);
				break;
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgSharpen(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		// console.log(event);
		switch (event.type) {
			case "dlg-close":
				UI.doDialog(event);
				break;
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgColors(event) {
		let APP = keane,
			Self = Dialogs,
			value,
			el;
		switch (event.type) {
			// "fast events"
			case "set-color-opacity":
				Self.els.content.css({ "--alpha": event.value / 100 });
				break;

			// slow/once events
			case "before:set-color-opacity":
				// fast references
				Self.els = {
					content: event.dEl.find(".dlg-content"),
				};
				break;
			case "after:set-color-opacity":
				break;
			case "dlg-open":
				// position cursors
				UI.doColorBox({ ...event, type: "position-cursor" });
				UI.doHueBar({ ...event, type: "position-cursor" });
				// save reference to event
				Self.srcEvent = event;
				break;
			case "dlg-close":
				UI.doDialog(event);
				// delete reference
				delete Self.srcEvent;
				break;
			case "dlg-ok":
				el = Self.srcEvent.dEl.find(".dlg-content");
				Self.srcEvent.callback({
					value: el.cssProp("--color"),
					src: event.src,
				});
				// close dialog
				Self.dlgColors({ ...event, type: "dlg-close" });
				break;
		}
	}
};
