
const Dialogs = {
	/*
	 * Brightness -  Min: -150   Max: 150
	 * Contrast -    Min: -100   Max: 100
	 */
	dlgBrightnessContrast(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy,
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

			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
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
			pixels,
			copy,
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
			case "dlg-ok":
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
			pixels,
			copy,
			el;
		// console.log(event);
		switch (event.type) {
			// "fast events"
			case "set-amount":
				if (Self.data.value.amount === +event.value) return;
				Self.data.value.amount = +event.value;
				// exit if "preview" is not enabled
				if (!Self.preview) return;
				/* falls-through */
			case "apply-filter-data":
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				copy = Filters.threshold(copy, Self.data.value.amount);
				Self.data.layer.ctx.putImageData(copy, 0, 0);
				// render file
				Projector.file.render({ noEmit: (event.noEmit !== undefined) ? event.noEmit : 1 });
				break;

			// standard dialog events
			case "dlg-open":
			case "dlg-ok":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgThreshold" });
				break;
		}
	},
	dlgMosaic(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy,
			el;
		// console.log(event);
		switch (event.type) {
			// "fast events"
			case "set-size":
				if (Self.data.value.size === +event.value) return;
				Self.data.value.size = +event.value;
				// exit if "preview" is not enabled
				if (!Self.preview) return;
				/* falls-through */
			case "apply-filter-data":
				
				break;

			// standard dialog events
			case "dlg-open":
			case "dlg-ok":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgMosaic" });
				break;
		}
	},
	dlgSmartSharpen(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy,
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
				// TODO
				break;
			
			// slow/once events
			case "before:set-amount":
			case "before:set-radius":
				Self.data.filter = event.type.split("-")[1];
				break;

			// standard dialog events
			case "dlg-open":
			case "dlg-ok":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgSmartSharpen" });
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
