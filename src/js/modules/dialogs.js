
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
			copy,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// "fast events"
			case "set-contrast":
			case "set-brightness":
				if (Self.data.value[Self.data.filter] === +event.value) return;
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
			case "before:set-contrast":
			case "before:set-brightness":
				Self.data.filter = event.type.split("-")[1];
				break;
			case "after:set-contrast":
			case "after:set-brightness":
				break;

			// standard dialog events
			case "dlg-open":
				file = Projector.file;
				layer = file.activeLayer;
				pixels = layer.ctx.getImageData(0, 0, layer.width, layer.height);
				value = {
					contrast: +event.dEl.find(`.dlg-content input[name="contrast"]`).val(),
					brightness: +event.dEl.find(`.dlg-content input[name="brightness"]`).val(),
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
					brightness: +cEl.find(`input[name="brightness"]`).val(),
					contrast: +cEl.find(`input[name="contrast"]`).val(),
				};
				// apply -- In case Preview is turned off, apply filter on image
				Self.dlgBrightnessContrast({ type: "apply-filter-data", noEmit: 0 });
				// update layer thumbnail
				Self.data.layer.updateThumbnail();
				// notify event origin of the results
				if (Self.srcEvent.callback) Self.srcEvent.callback(Self.data.value);
				// close dialog
				Self.dlgBrightnessContrast({ ...event, type: "dlg-close" });
				break;
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgBrightnessContrast" });
				break;
		}
	},
	dlgGaussianBlur(event) {
		let APP = keane,
			Self = Dialogs,
			file,
			layer,
			pixels,
			copy,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// "fast events"
			case "set-radius":
				if (Self.data.value.radius === +event.value) return;
				Self.data.value.radius = +event.value;
				// exit if "preview" is not enabled
				if (!Self.preview) return;
				/* falls-through */
			case "apply-filter-data":
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				gaussianBlur(copy.data, pixels.width, pixels.height, Self.data.value.radius);
				Self.data.layer.ctx.putImageData(copy, 0, 0);
				// render file
				Projector.file.render({ noEmit: (event.noEmit !== undefined) ? event.noEmit : 1 });
				break;
			
			// standard dialog events
			case "dlg-open":
				file = Projector.file;
				layer = file.activeLayer;
				pixels = layer.ctx.getImageData(0, 0, layer.width, layer.height);
				value = {
					radius: parseInt(event.dEl.find(`input[name="radius"]`).val(), 10),
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
					radius: parseInt(cEl.find(`input[name="radius"]`).val(), 10),
				};
				// apply -- In case Preview is turned off, apply filter on image
				Self.dlgGaussianBlur({ type: "apply-filter-data", noEmit: 0 });
				// update layer thumbnail
				Self.data.layer.updateThumbnail();
				// notify event origin of the results
				if (Self.srcEvent.callback) Self.srcEvent.callback(Self.data.value);
				// close dialog
				Self.dlgGaussianBlur({ ...event, type: "dlg-close" });
				break;
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGaussianBlur" });
				break;
		}
	},
	dlgThreshold(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		// console.log(event);
		switch (event.type) {
			// standard dialog events
			case "dlg-open":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgThreshold" });
				break;
			case "dlg-ok":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgThreshold" });
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
				Self.preview = event.dEl.find(`.toggler[data-click="dlg-preview"]`).data("value") === "on";
				break;
			case "dlg-ok":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgSharpen" });
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
				if (Self.srcEvent.callback) {
					Self.srcEvent.callback({
						value: el.cssProp("--color"),
						src: event.src,
					});
				}
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
