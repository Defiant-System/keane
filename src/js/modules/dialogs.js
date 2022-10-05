
const Dialogs = {
	/*
	 * Brightness -  Min: -150   Max: 150
	 * Contrast -    Min: -100   Max: 100
	 */
	dlgBrightnessContrast(event) {
		let APP = keane,
			Self = Dialogs,
			file,
			layer,
			pixels,
			filter,
			copy,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// "fast events"
			case "set-contrast-amount":
			case "set-brightness-amount":
				if (Self.data.value === event.value) return;
				Self.data.value[Self.data.filter] = +event.value;
				// exit if "preview" is not enabled
				if (!Self.preview) return;
				/* falls-through */
			case "apply-filter-data":
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				copy = Filters.brightnessContrast(copy, Self.data.value);
				Self.data.layer.ctx.putImageData(copy, 0, 0);

				// render file
				Projector.file.render({ noEmit: (event.noEmit !== undefined) ? event.noEmit : 1 });
				break;
			// slow/once events
			case "before:set-contrast-amount":
			case "before:set-brightness-amount":
				Self.data.filter = event.type.split("-")[1];
				break;
			case "after:set-contrast-amount":
			case "after:set-brightness-amount":
				// console.log(event);
				break;

			// standard dialog events
			case "dlg-open":
				file = Projector.file;
				layer = file.activeLayer;
				pixels = layer.ctx.getImageData(0, 0, layer.width, layer.height);
				value = {
					contrast: +event.dEl.find(`.dlg-content input[name="contrast-amount"]`).val(),
					brightness: +event.dEl.find(`.dlg-content input[name="brightness-amount"]`).val(),
				};
				// fast references for knob twist event
				Self.data = { file, layer, pixels, value };
				// save reference to event
				Self.srcEvent = event;
				// read preview toggler state
				Self.preview = event.dEl.find(`.toggler[data-click="dlg-preview"]`).data("value") === "on";
				break;
			case "dlg-ok":
				let cEl = Self.srcEvent.dEl.find(".dlg-content");
				Self.data.value = {
					brightness: +cEl.find(`input[name="brightness-amount"]`).val(),
					contrast: +cEl.find(`input[name="contrast-amount"]`).val(),
				};
				// apply -- In case Preview is turned off, apply filter on image
				Self.dlgBrightnessContrast({ type: "apply-filter-data", noEmit: 0 });

				// notify event origin of the results
				Self.srcEvent.callback(Self.data.value);
				// close dialog
				Self.dlgBrightnessContrast({ ...event, type: "dlg-close" });
				break;
			case "dlg-reset":
				pixels = Self.data.pixels;
				Self.data.layer.ctx.putImageData(pixels, 0, 0);
				// reset input fields
				Self.srcEvent.dEl.find(`input[name="brightness-amount"]`).val(0);
				Self.srcEvent.dEl.find(`input[name="contrast-amount"]`).val(0);
				// reset pan-knobs
				Self.srcEvent.dEl.find(`.pan-knob`).data({ value: 0 });
				// render file
				Projector.file.render({ noEmit: 1 });
				break;
			case "dlg-preview":
				Self.preview = event.el.data("value") === "on";
				if (Self.preview) {
					// apply -- In case Preview is turned off, apply filter on image
					Self.dlgBrightnessContrast({ type: "apply-filter-data", noEmit: 0 });
				} else {
					// revert layer to initial state
					pixels = Self.data.pixels;
					copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
					Self.data.layer.ctx.putImageData(copy, 0, 0);
					// render file
					Projector.file.render({ noEmit: 0 });
				}
				break;
			case "dlg-close":
				if (event.el && event.el.hasClass("icon-dlg-close")) {
					Self.dlgBrightnessContrast({ type: "dlg-reset" });
				}
				UI.doDialog(event);
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
			// standard dialog events
			case "dlg-open":
			case "dlg-ok":
			case "dlg-preview":
				break;
			case "dlg-close":
				UI.doDialog(event);
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
			case "dlg-ok":
				el = Self.srcEvent.dEl.find(".dlg-content");
				Self.srcEvent.callback({
					value: el.cssProp("--color"),
					src: event.src,
				});
				// close dialog
				Self.dlgColors({ ...event, type: "dlg-close" });
				break;
			case "dlg-close":
				UI.doDialog(event);
				// delete reference
				delete Self.srcEvent;
				break;
		}
	}
};
