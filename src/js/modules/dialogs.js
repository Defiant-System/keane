
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
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
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
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
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
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
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
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				copy = Filters.pixelate(copy, Self.data.value.size);
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
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
	dlgPixelator(event) {
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
				
				console.time("test");
				let layers = [
						// { res: 16 },

						// { res: 32 },
						// { shape: "circle", res: 32, offset: 15 },
						// { shape: "circle", res: 32, size: 26, offset: 13 },
						// { shape: "circle", res: 32, size: 18, offset: 10 },
						// { shape: "circle", res: 32, size: 12, offset: 8 },

						// { res: 48 },
						// { shape: "diamond", res: 48, offset: 12, alpha: 0.5 },
						// { shape: "diamond", res: 48, offset: 36, alpha: 0.5 },
						// { shape: "circle", res: 16, size: 8, offset: 4, alpha: 0.5 },
						// { res: 24, alpha: 0.25, hidden: 1 },

						// { shape: "circle", res: 32, size: 6, offset: 8 },
						// { shape: "circle", res: 32, size: 9, offset: 16 },
						// { shape: "circle", res: 32, size: 12, offset: 24 },
						// { shape: "circle", res: 32, size: 9, offset: 0 },

						// { shape: "diamond", res: 24, size: 25 },
						// { shape: "diamond", res: 24, offset: 12 },
						// { res: 24, alpha: 0.5 },

						// { shape: "circle", res: 24 },
						// { shape: "circle", res: 24, size: 9, offset: 12 },

						// { shape: "square", res: 48 },
						// { shape: "diamond", res: 12, size: 8 },
						// { shape: "diamond", res: 12, size: 8, offset: 6 },

						// { shape: "square", res: 48, offset: 24 },
						// { shape: "circle", res: 48, offset: 0 },
						// { shape: "diamond", res: 16, size: 15, offset: 0, alpha: 0.6 },
						// { shape: "diamond", res: 16, size: 15, offset: 8, alpha: 0.6 },

						{ shape: "square", res: 32 },
						{ shape: "circle", res: 32, offset: 16 },
						{ shape: "circle", res: 32, offset: 0, alpha: 0.5 },
						{ shape: "circle", res: 16, size: 9, offset: 0, alpha: 0.5 },

						// { shape: "diamond", res: 48, size: 50 },
						// { shape: "diamond", res: 48, offset: 24 },
						// { shape: "circle", res: 8, size: 6 },
					];

				copy = closePixelate({
						copy: new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height),
						width: pixels.width,
						height: pixels.height,
						layers,
					});
				console.timeEnd("test");

				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
				break;
			
			// slow/once events
			case "before:set-amount":
			case "before:set-radius":
				Self.data.filter = event.type.split("-")[1];
				break;

			// custom dialog events
			case "add-layer":
				break;
			case "remove-layer":
				event.el.parents(".row").cssSequence("removing", "transitionend", el => {
					el.remove();
				});
				break;
			case "toggle-layer":
				event.el.toggleClass("icon-eye-off", event.el.hasClass("icon-eye-off"));
				break;
			case "set-layer-shape":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				break;

			// standard dialog events
			case "dlg-open":
			case "dlg-ok":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgPixelator" });
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
