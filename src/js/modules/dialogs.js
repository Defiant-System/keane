
const Dialogs = {
	dlgBrightnessContrast(event) {
		/*
		 * Brightness -  Min: -150   Max: 150
		 * Contrast -    Min: -100   Max: 100
		 */
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
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
	dlgStroke(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
		// console.log(event);
		switch (event.type) {
			case "apply-filter-data":
				break;
			
			case "set-stroke-location":
				// inside, center, outside
				console.log(event);
				break;

			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgStroke" });
		}
	},
	dlgGaussianBlur(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
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
			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGaussianBlur" });
		}
	},
	dlgThreshold(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
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
			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgThreshold" });
		}
	},
	dlgCrystallize(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
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
				copy = Filters.crystallize(copy, Self.data.value.size);
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
				break;
			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgCrystallize" });
		}
	},
	dlgPointillize(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
		switch (event.type) {
			// "fast events"
			case "set-size":
				if (Self.data.value.size === +event.value) return;
				Self.data.value.size = +event.value;
				// exit if "preview" is not enabled
				if (!Self.preview) return;
				/* falls-through */
			case "apply-filter-data":
				if (!Self.data.value.color) {
					let clr = ColorLib.hexToRgb(Projector.file.fgColor);
					Self.data.value.color = [clr.r, clr.g, clr.b];
				}
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				copy = Filters.crystallize(copy, Self.data.value.size, Self.data.value.color);
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
				break;
			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgPointillize" });
		}
	},
	dlgMosaic(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
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
			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgMosaic" });
		}
	},
	dlgSponge(event) {
		let APP = keane,
			Self = Dialogs,
			pixels,
			copy;
		switch (event.type) {
			// "fast events"
			case "set-intensity":
			case "set-radius":
				if (Self.data.value[Self.data.filter] === +event.value) return;
				Self.data.value[Self.data.filter] = +event.value;
				// exit if "preview" is not enabled
				if (!Self.preview) return;
				/* falls-through */
			case "apply-filter-data":
				console.time("Sponge Filter");
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				copy = Filters.sponge(copy, Self.data.value);
				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
				console.timeEnd("Sponge Filter");
				break;
			
			// slow/once events
			case "before:set-intensity":
			case "before:set-radius":
				Self.data.filter = event.type.split("-")[1];
				break;

			default:
				/* Falls through to "master UI"
				 * Can be handled here if needed - just capture events:
				 * "dlg-ok", "dlg-open", "dlg-reset", "dlg-preview", "dlg-close"
				 */
				// handler standard dialog events
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgSponge" });
		}
	},
	dlgPixelator(event) {
		let APP = keane,
			Self = Dialogs,
			layers,
			pixels,
			copy,
			el;
		switch (event.type) {
			case "apply-filter-data":
				// copy first, then apply filter on pixels
				pixels = Self.data.pixels;
				
				// layers = Dialogs.dlgPixelator({ type: "preset-from-xml", id: "prst-2" });
				layers = Self.dlgPixelator({ type: "preset-from-html" });
				if (!layers.length || closePixelate.working) return;
				closePixelate.working = true;

				// console.time("Pixelator Filter");
				copy = closePixelate({
						copy: new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height),
						width: pixels.width,
						height: pixels.height,
						layers,
					});
				// console.timeEnd("Pixelator Filter");

				// reset flag
				delete closePixelate.working;

				// update layer
				Self.data.layer.putImageData({ data: copy, noEmit: event.noEmit });
				break;

			// custom dialog events
			case "preset-from-html":
				layers = Self.srcEvent.dEl.find(".list-body .row").map(row => {
					let el = $(row),
						sEl = el.find(".shape-options i.active"),
						[a, b, shape] = sEl.prop("className").split(" ")[0].split("-"),
						res = parseInt(el.find("> div:nth(1)").text(), 10),
						size = parseInt(el.find("> div:nth(2)").text(), 10),
						offset = parseInt(el.find("> div:nth(3)").text(), 10),
						alpha = parseInt(el.find(".icon-bars").cssProp("--value"), 10) / 100,
						hidden = el.find(".icon-eye-on").hasClass("icon-eye-off") ? 1 : 0,
						data = { res };

					if (shape !== "square") data.shape = shape;
					if (hidden) data.hidden = hidden;
					if (!isNaN(size)) data.size = size;
					if (!isNaN(offset)) data.offset = offset;
					if (!isNaN(alpha) && alpha !== 1) data.alpha = alpha;

					return data;
				});
				return layers;
			case "preset-from-xml":
				let xPreset = window.bluePrint.selectSingleNode(`//Pixelator/Preset[@id="${event.id}"]`);
				layers = xPreset.selectNodes("./*").map(xLayer => {
					let data = {};
					[...xLayer.attributes].map(a => {
						let val = parseInt(a.value, 10);
						return data[a.name] = isNaN(val) ? a.value : val;
					});
					return data;
				});
				return layers;
			case "select-preset":
				el = $(event.target);

				let prepend = Self.srcEvent.dEl.find(".list-body");
				prepend.find(".row").remove();
				// render active preset layer list
				window.render({
					template: "pixelator-preset",
					match: `//Pixelator/Preset[@id="${el.data("id")}"]`,
					prepend,
				});

				// re-apply filter
				Self.dlgPixelator({ type: "apply-filter-data" });
				break;
			case "add-layer":
				let str = window.render({
						template: "pixelator-preset-layer",
						match: "//Pixelator/Preset[1]",
					}),
					row = event.el.before(str).addClass("adding");

				requestAnimationFrame(() =>
					row.cssSequence("!adding", "transitionend", el => el.removeClass("adding")));
				break;
			case "remove-layer":
				event.el.parents(".row").cssSequence("removing", "transitionend", el => el.remove());
				// re-apply filter
				Self.dlgPixelator({ type: "apply-filter-data" });
				break;
			case "toggle-layer":
				event.el.toggleClass("icon-eye-off", event.el.hasClass("icon-eye-off"));
				// re-apply filter
				Self.dlgPixelator({ type: "apply-filter-data" });
				break;
			case "set-layer-shape":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				// re-apply filter
				Self.dlgPixelator({ type: "apply-filter-data" });
				break;

			case "set-spacing":
			case "set-size":
			case "set-offset":
			case "set-opacity":
				// re-apply filter
				Self.dlgPixelator({ type: "apply-filter-data" });
				break;

			// standard dialog events
			case "dlg-open":
				// click on a preset
				requestAnimationFrame(() =>
					event.dEl.find(`.presets li[data-id="prst-2"]`).trigger("mousedown").trigger("click"));
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
