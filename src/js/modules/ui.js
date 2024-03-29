
const UI = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		let dlg = window.find(`.dialog-box[data-dlg="dlgColors"]`);
		this.els = {
			iHue: dlg.find(`input[name="color-hsl-hue"]`),
			iSaturation: dlg.find(`input[name="color-hsl-saturation"]`),
			iLightness: dlg.find(`input[name="color-hsl-lightness"]`),
			iRed: dlg.find(`input[name="color-rgb-red"]`),
			iGreen: dlg.find(`input[name="color-rgb-green"]`),
			iBlue: dlg.find(`input[name="color-rgb-blue"]`),
			iAlpha: dlg.find(`input[name="color-opacity"]`),
			iHex: dlg.find(`input[name="color-hex"]`),
		};
		// global css variables
		this.content.css({ "--guide-color": Pref.guides.color });

		// bind event handlers
		this.content.on("click", ".option .value", this.dispatch);
		this.content.on("mousedown mouseup", "[data-ui], [data-dlg]", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = UI,
			data,
			value,
			menu,
			min,
			max,
			rect,
			top,
			left,
			el;
		// console.log(event);
		switch (event.type) {
			case "click":
				el = $(this.parentNode);
				value = el.data("options");
				if (!value || el.hasClass("disabled")) return;

				// save reference to source element
				Self.srcEl = el.addClass("opened");
				// render menubox
				Self.menu = window.render({
						template: value,
						append: Self.content,
						match: el.data("match") || false,
					});

				// position menubox
				rect = this.getBoundingClientRect();
				top = rect.top - window.top + rect.height + 9;
				left = rect.left - window.left + (rect.width >> 1) - (Self.menu[0].offsetWidth >> 1);
				Self.menu.css({ top, left });

				// set inital value - by associated event handler
				Self[Self.menu.data("ui")]({ type: "set-initial-value", el });

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// event handler checks for clicks outside inline-menubox
				Self.doc.on("mousedown", Self.dispatch);
				break;
			case "mousedown":
				el = $(event.target);
				if (el.parents(".inline-menubox").length) {
					if (this === document) return;
					// forward event to fitting handler
					Self[this.dataset.ui](event);
					// handles event differently for brush menu box
					if (this.dataset.ui === "doBrushTips") return;
				} else if (el.parents("ul.opt-group").length) {
					// event handling option-group
					if (el.hasClass("active")) return;
					el.parent().find(".active").removeClass("active");
					el.addClass("active");
				} else if (el.parents("[data-dlg]").length) {
					return Self.doDialog(event);
				} else {
					// clean up
					Self.menu.remove();
				}
				if (Self.srcEl) Self.srcEl.removeClass("opened");
				// uncover app UI
				APP.els.content.removeClass("cover");
				// unbind event handler
				Self.doc.off("mousedown", Self.dispatch);
				break;
			case "mouseup":
				el = $(event.target);
				if (Self.srcEl && !el.parents(".inline-menubox").length) {
					//reset origin element
					Self.srcEl.removeClass("opened");
					Self.srcEl = false;
				}
				break;
			default:
				// forward route events
				data = event.el.parents("[data-ui]").data("ui");
				Self[data](event);
		}
	},
	doGradients(event) {
		let Self = UI,
			el;
		// console.log(event);
		switch (event.type) {
			case "add-gradient-strip":
				console.log(event);
				break;
			case "select-gradient-strip":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				// update toolbar option selectbox
				Self.srcEl.find(".gradient-strip").css({ "--gs": el.cssProp("--gs") })
				break;
		}
	},
	doDialogKnobValue(event) {
		let Self = UI,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let el = $(event.target),
					dEl = el.parents(".dialog-box"),
					dId = dEl.data("dlg"),
					bEl = dEl.find(".hover-knob"),
					kEl = bEl.find(".knob"),
					min = +el.data("min"),
					max = +el.data("max"),
					suffix = el.data("suffix") || "",
					type = el.data("change"),
					val = Math.round(((parseInt(el.text() || "0", 10) - min) / (max - min)) * 100),
					offset = val + event.clientY,
					_min = Math.min,
					_max = Math.max;
				Self.drag = { el, bEl, kEl, dId, min, max, type, offset, suffix, _min, _max };

				// reset knob
				kEl.data({ value: val });
				// show knob-bubble
				bEl.removeClass("hidden")
					.css({
						top: el.prop("offsetTop"),
						left: el.prop("offsetLeft"),
					});

				// bind event handlers
				Self.content.addClass("no-dlg-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialogKnobValue);
				break;
			case "mousemove":
				// update knob
				let value = Drag._max(Drag._min(Drag.offset - event.clientY, 100), 0);
				Drag.kEl.data({ value });
				// update origin element value
				value = Math.round((value / 100) * (Drag.max - Drag.min));
				let str = value > 0 ? `${value}${Drag.suffix}` : "";
				Drag.el.html(str);

				if (Drag.value === value) return;
				Drag.value = value;
				
				// proxy changed value
				Dialogs[Drag.dId]({ type: Drag.type, value: Drag.value });
				break;
			case "mouseup":
				// proxy changed value
				Dialogs[Drag.dId]({ type: `after:${Drag.type}`, value: Drag.value });
				// hide knob-bubble
				Drag.bEl.cssSequence("close", "animationend", el => el.addClass("hidden").removeClass("close"));
				// unbind event handlers
				Self.content.removeClass("no-dlg-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialogKnobValue);
				break;
		}
	},
	doDialogBars(event) {
		let Self = UI,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let el = $(event.target),
					dEl = el.parents(".dialog-box"),
					dId = dEl.data("dlg"),
					bEl = dEl.find(".hover-bubble"),
					offset = parseInt(el.cssProp("--value"), 10) - event.clientX,
					type = el.data("change"),
					min = 0,
					max = 100,
					_min = Math.min,
					_max = Math.max;
				Self.drag = { el, bEl, dId, min, max, type, offset, _min, _max };

				// show bubble
				bEl.removeClass("hidden")
					.css({
						top: el.parent().prop("offsetTop"),
						left: el.parent().prop("offsetLeft"),
					});

				// bind event handlers
				Self.content.addClass("no-dlg-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialogBars);
				break;
			case "mousemove":
				// update bars icon UI
				let value = Drag._max(Drag._min(Drag.offset + event.clientX, Drag.max), Drag.min);
				Drag.el.css({ "--value": `${value}%` });
				// show value in bubble
				Drag.bEl.html(`${value}%`);

				if (Drag.value === value) return;
				Drag.value = value;

				// proxy changed value
				Dialogs[Drag.dId]({ type: Drag.type, value: Drag.value });
				break;
			case "mouseup":
				// proxy changed value
				Dialogs[Drag.dId]({ type: `after:${Drag.type}`, value: Drag.value });
				// hide bubble
				Drag.bEl.cssSequence("close", "animationend", el => el.addClass("hidden").removeClass("close"));
				// unbind event handlers
				Self.content.removeClass("no-dlg-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialogBars);
				break;
		}
	},
	doDialog(event) {
		let Self = UI,
			Drag = Self.drag,
			file,
			layer,
			pixels,
			copy,
			value,
			dEl,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);

				switch (true) {
					case el.hasClass("toggler"):
						return el.data("value") === "on"
								? el.data({ value: "off" })
								: el.data({ value: "on" });
					case el.hasClass("color-box"):
						return Self.doColorBox(event);
					case el.hasClass("hue-bar"):
						return Self.doHueBar(event);
					case el.data("ux") === "dlg-knob":
						return Self.doDialogKnobValue(event);
					case el.data("ux") === "dlg-bars":
						return Self.doDialogBars(event);
					case el.hasClass("knob"):
					case el.hasClass("pan-knob"):
						return Self.doDialogKnob(event);
				}

				// prevent default behaviour
				event.preventDefault();

				let dlg = el.parents(".dialog-box"),
					offset = {
						y: +dlg.prop("offsetTop") - event.clientY,
						x: +dlg.prop("offsetLeft") - event.clientX,
					};
				Self.drag = { dlg, offset };

				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialog);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.dlg.css({ top, left });
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialog);
				break;

			// custom events
			case "dlg-open":
				dEl = $(`.dialog-box[data-dlg="${event.name}"]`);
				// make sure knobs in dialog is synced with its sibling input element
				Self.doDialogKnob({ type: "set-initial-value", dEl });
				// auto forward open event
				Dialogs[event.name]({ ...event, dEl });
				// prevent mouse from triggering mouseover
				Self.content.addClass("cover");
				// open dialog
				dEl.cssSequence("opening", "animationend", el => {
						el.addClass("showing").removeClass("opening");
					});
				break;
			case "dlg-close":
				// close dialog
				event.el.parents(".dialog-box")
					.cssSequence("closing", "animationend", el => {
						// prevent mouse from triggering mouseover
						Self.content.removeClass("cover");
						// reset element
						el.removeClass("showing closing");
					});
				break;
			case "dlg-undo-filter":
				// revert layer to initial state
				pixels = Dialogs.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				// update layer
				Dialogs.data.layer.putImageData({ data: copy, noEmit: 1 });
				break;

			case "dlg-open-common":
				file = Projector.file;
				layer = file.activeLayer;
				pixels = layer.ctx.getImageData(0, 0, layer.width, layer.height);
				value = {};
				// collect default values
				event.dEl.find(`.field-row input`).map(elem => {
					let iEl = $(elem);
					value[iEl.attr("name")] = parseInt(iEl.val(), 10);
				});
				// fast references for knob twist event
				Dialogs.data = { file, layer, pixels, value };
				// save reference to event
				Dialogs.srcEvent = event;
				// read preview toggler state
				Dialogs.preview = event.dEl.find(`.toggler[data-click="dlg-preview"]`).data("value") === "on";
				// apply -- In case Preview is turned off, apply filter on image
				Dialogs[event.name]({ type: "apply-filter-data" });
				break;
			case "dlg-ok-common":
				// collect values
				Dialogs.srcEvent.dEl.find(`.field-row input`).map(elem => {
					let iEl = $(elem);
					Dialogs.data.value[iEl.attr("name")] = parseInt(iEl.val(), 10);
				});
				// apply -- In case Preview is turned off, apply filter on image
				Dialogs[event.name]({ type: "apply-filter-data", noEmit: 0 });
				// update layer thumbnail
				Dialogs.data.layer.updateThumbnail();
				// notify event origin of the results
				if (Dialogs.srcEvent.callback) Dialogs.srcEvent.callback(Dialogs.data.value);
				// close dialog
				Dialogs[event.name]({ ...event, type: "dlg-close" });
				break;
			case "dlg-reset-common":
				// reset input fields
				Dialogs.srcEvent.dEl.find(`.field-row input`).map(elem => {
					let iEl = $(elem),
						row = iEl.parents(".field-row"),
						suffix = iEl.data("suffix") || "";
					iEl.val(iEl.data("default") + suffix);
					if (row.hasClass("has-knob")) {
						// reset knobs
						let val = +iEl.data("default"),
							min = +iEl.data("min"),
							max = +iEl.data("max"),
							value = Math.round((val-min) / (max-min) * 100);
						row.find(".knob, .pan-knob").data({ value });
					}
					// default values for dialog
					Dialogs.data.value[iEl.attr("name")] = parseInt(iEl.val(), 10);
				});
				// apply filter with default values
				Dialogs[event.name]({ type: "apply-filter-data", noEmit: (event.noEmit !== undefined) ? event.noEmit : 1 });
				break;
			case "dlg-preview-common":
				Dialogs.preview = event.el.data("value") === "on";
				if (Dialogs.preview) {
					// apply -- In case Preview is turned off, apply filter on image
					Dialogs[event.name]({ type: "apply-filter-data", noEmit: 1 });
				} else {
					Self.doDialog({ type: "dlg-undo-filter" });
				}
				break;
			case "dlg-close-common":
				if (event.el && event.el.hasClass("icon-dlg-close")) {
					// Dialogs[event.name]({ type: "dlg-reset", noEmit: 0 });
					Self.doDialog({ type: "dlg-undo-filter" });
				}
				Self.doDialog({ ...event, type: "dlg-close" });
				break;
		}
	},
	doBrushTips(event) {
		let APP = keane,
			Self = UI,
			Drag = Self.drag,
			Tool = APP.tools[APP.tools._active],
			_round = Math.round,
			_min = Math.min,
			_max = Math.max,
			_cos = Math.cos,
			data = {},
			name,
			size,
			value,
			hardness,
			roundness,
			angle,
			image,
			el;
		//console.log(event);
		switch (event.type) {
			case "mousedown":
				el = $(event.target);
				// special handling for gyro events
				if (!["handle", "direction"].includes(el.prop("className"))) return;
				// prevent default behaviour
				event.preventDefault();

				Self.drag = {
					el: el.parent(),
					type: el.prop("className"),
					clientY: event.clientY,
					clientX: event.clientX,
					roundness: +Self.xShape.getAttribute("roundness"),
					angle: +Self.xShape.getAttribute("angle"),
				};

				if (Self.drag.type === "handle") {
					Self.drag.mirror = el.index() === 0 ? -1 : 1;
					Self.drag.value = 49.5 * (Self.drag.roundness / 100);
					Self.drag.min = 5;
					Self.drag.max = 49.5;
				} else {
					Self.drag.value = Self.drag.angle;
					Self.drag.min = -60;
					Self.drag.max = 60;
				}

				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doBrushTips);
				break;
			case "mousemove":
				roundness = Drag.roundness;
				angle = Drag.angle;

				if (Drag.type === "handle") {
					// this type affects tip roundness
					value = Drag.value - (Drag.mirror * (Drag.clientY - event.clientY));
					value = _min(_max(value, Drag.min), Drag.max);
					data.height = value +"px";
					// set roundness
					roundness = _round((value / Drag.max) * 100);
				} else {
					// this type affects tip angle
					value = _min(_max(event.clientY - Drag.clientY, Drag.min), Drag.max);
					value = Drag.value + _round((value / 120) * 360);
					data.transform = `translateX(-50%) translateY(-50%) rotate(${value}deg)`;
					// set angle
					angle = (value + 360) % 360;
				}
				// UI update for gyro
				Drag.el.css(data);

				Self.doBrushTips({ type: "tip-menu-set-roundness-angle", roundness, angle });
				Self.doBrushTips({ type: "draw-preview-curve" });
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doBrushTips);
				break;
			// custom events
			case "set-initial-value":
				Self.cvs = Self.menu.find(".preview canvas");
				Self.ctx = Self.cvs[0].getContext("2d", { willReadFrequently: true });
				Self.cvs.prop({ width: 206, height: 78 });

				// indicate currect tip in menu
				name = Self.srcEl.data("name");
				Self.menu.find(`.shape-list > div[data-name="${name}"]`).trigger("click");
				break;
			case "draw-preview-curve":
				// reset context
				Self.cvs.prop({ width: 206, height: 78 });
				Self.ctx.translate(4, 28);
				// Self.ctx.fillStyle = "#fff";

				image = Tool.preset.tip.cvs[0];
				size = Tool.preset.size;
				for (let i=0; i<180; i++) {
					Self.ctx.translate(1, _cos(i * 0.035) * .65);
					Self.ctx.drawImage(image, 0, 0, size, size, 0, 0, 17, 17);
				}
				break;
			case "tip-menu-set-tip":
				el = event.el;
				el.parent().find(".selected").removeClass("selected");
				el.addClass("selected");

				// assemble info about preset
				name = el.data("name");
				Self.xShape = window.bluePrint.selectSingleNode(`//TipShapes/*[@name="${name}"]`);
				size      = +Self.xShape.getAttribute("size");
				hardness  = +Self.xShape.getAttribute("hardness");
				roundness = +Self.xShape.getAttribute("roundness");
				angle     = +Self.xShape.getAttribute("angle");

				// dispatch event to be forwarded
				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					arg: name,
					callback: () => Self.doBrushTips({ type: "draw-preview-curve" })
				};
				if (data.type) APP.dispatch(data);


				Self.menu.find(".gyro").css({
					height: (roundness / 100) * 49.5 +"px",
					transform: `translateX(-50%) translateY(-50%) rotate(${angle}deg)`,
				});

				// update size range / field
				Self.menu.find(".tip-size input").val(size);
				Self.doBrushTips({ type: "tip-menu-set-size", value: size });
				
				// update hardness range / field
				Self.menu.find(".tip-hardness input").val(hardness);
				Self.doBrushTips({ type: "tip-menu-set-hardness", value: hardness });
				break;
			case "tip-menu-set-roundness-angle":
				// update xml node
				Self.xShape.setAttribute("roundness", event.roundness);
				Self.xShape.setAttribute("angle", event.angle);
				// forward event to active tool
				Tool.dispatch({ ...event, type: "resize-rotate-tip" });
				break;
			case "tip-menu-set-size":
				el = Self.menu.find(".tip-size .value");
				el.html(event.value + el.data("suffix"));

				// update xml node
				Self.xShape.setAttribute("size", event.value);
				// forward event to active tool
				Tool.dispatch({ ...event, type: "change-size"});
				break;
			case "tip-menu-set-hardness":
				el = Self.menu.find(".tip-hardness .value");
				el.html(event.value + el.data("suffix"));

				// update xml node
				Self.xShape.setAttribute("hardness", event.value);
				// forward event to active tool
				Tool.dispatch({ ...event, type: "change-hardness"});
				break;
		}
	},
	doSwatches(event) {
		let APP = keane,
			Self = UI,
			data,
			value,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);
				// selected option - UI update
				el.parent().find(".selected").removeClass("selected");
				el.addClass("selected");

				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					old: ColorLib.rgbToHex(Self.srcEl.find(".value").css("background-color")),
					value: ColorLib.rgbToHex(el.css("background-color")),
				};
				if (data.old === data.value) return;
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);

				// update source element
				Self.srcEl.find(".value").css({ background: data.value });
				// clean up
				Self.srcEl = false;
				Self.menu.remove();
				break;
			// custom events
			case "set-initial-value":
				// initial value
				value = ColorLib.rgbToHex(event.el.find(".value").css("background-color"));
				Self.menu.find(`.swatch[style="background: ${value};"]`).addClass("selected")
				break;
		}
	},
	doSelectbox(event) {
		let APP = keane,
			Self = UI,
			data,
			value,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);
				if (!el.hasClass("option")) el = el.parents(".option");
				// selected option - UI update
				el.parent().find(".selected").removeClass("selected");
				el.addClass("selected");

				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					old: Self.srcEl.find(".value").html(),
					text: el.html(),
					value: el.data("value"),
				};
				if (data.old === data.value || !data.value) return;
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);

				// update source element
				Self.srcEl.find(".value").html(data.text);
				// clean up
				Self.srcEl = false;
				Self.menu.remove();
				break;
			// custom events
			case "set-initial-value":
				// initial value
				value = event.el.find(".value").text();
				Self.menu.find(".option").map(elem => {
					if (elem.textContent === value) {
						elem.className += " selected";
					}
				});
				break;
		}
	},
	doColorBox(event) {
		let APP = keane,
			Self = UI,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// get elements & align cursor
				let el = $(event.target),
					cursor = el.find(".cursor"),
					cEl = el.parents(".dlg-content");
				// UI / UX
				cursor.addClass("dragging")
					.css({ left: event.offsetX, top: event.offsetY });
				// prepare drag object
				Self.drag = {
					cEl,
					cursor,
					clickX: +cursor.prop("offsetLeft") - event.clientX,
					clickY: +cursor.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.prop("offsetWidth"),
						y: +el.prop("offsetHeight"),
					},
					hue: parseInt(Self.els.iHue.val(), 10),
					alpha: parseInt(Self.els.iAlpha.val(), 10) / 100,
					_max: Math.max,
					_min: Math.min,
					_abs: Math.abs,
					_round: Math.round,
				};
				// trigger mousemove
				Self.doColorBox({ type: "mousemove", clientY: event.clientY, clientX: event.clientX });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-dlg-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doColorBox);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				Drag.cursor.css({ top, left });

				// calculate color from pos
				let hsvValue = 1 - ((top / Drag.max.y * 100) / 100),
					hsvSaturation = (left / Drag.max.x * 100) / 100;
				Drag.lgh = (hsvValue / 2) * (2 - hsvSaturation);
				Drag.sat = (hsvValue * hsvSaturation) / (1.0001 - Drag._abs(2 * Drag.lgh - 1));

				let hsl = { h: Drag.hue, s: Drag.sat, l: Drag.lgh, a: Drag.alpha };
				Drag.hex = ColorLib.hslToHex(hsl);
				Drag.rgb = ColorLib.hexToRgb(Drag.hex);

				// update color
				Drag.cEl.css({ "--color": Drag.hex });
				// saturation & lightness
				Self.els.iSaturation.val(Drag._round(Drag.sat * 100) +"%");
				Self.els.iLightness.val(Drag._round(Drag.lgh * 100) +"%");
				// rgb values
				Self.els.iRed.val(Drag.rgb.r);
				Self.els.iGreen.val(Drag.rgb.g);
				Self.els.iBlue.val(Drag.rgb.b);
				// hex value
				Self.els.iHex.val(Drag.hex.slice(1,7));
				break;
			case "mouseup":
				// UI / UX
				Drag.cursor.cssSequence("dropped", "animationend", el => el.removeClass("dropped dragging"));
				// remove class
				APP.els.content.removeClass("no-dlg-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doColorBox);
				break;
			// custom events
			case "position-cursor":
				// position cursor
				let iHsv = ColorLib.hexToHsv(event.value),
					iWidth = +event.dEl.find(".color-box").prop("offsetWidth"),
					iLeft = iWidth * iHsv.s,
					iTop = iWidth * (1-iHsv.v);
				event.dEl.find(".color-box .cursor").css({ top: iTop, left: iLeft });
				break;
		}
	},
	doHueBar(event) {
		let APP = keane,
			Self = UI,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// get elements & align cursor
				let el = $(event.target),
					cursor = el.find(".cursor").css({ top: event.offsetY }),
					cEl = el.parents(".dlg-content");
				// prepare drag object
				Self.drag = {
					cEl,
					cursor,
					clickY: +cursor.prop("offsetTop") - event.clientY,
					min: { y: 0 },
					max: { y: +el.prop("offsetHeight") },
					alpha: parseInt(Self.els.iAlpha.val(), 10) / 100,
					sat: parseInt(Self.els.iSaturation.val(), 10) / 100,
					lgh: parseInt(Self.els.iLightness.val(), 10) / 100,
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
				};
				// trigger mousemove
				Self.doHueBar({ type: "mousemove", clientY: event.clientY });
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-dlg-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doHueBar);
				break;
			case "mousemove":
				let top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y),
					hue = Drag._round((1-(top / Drag.max.y)) * 360);
				if (hue >= 360) hue = 0;
				// move cursor
				Drag.cursor.css({ top });
				// color box color
				Drag.hue = ColorLib.hslToHex({ h: hue, s: 1, l: .5, a: 1 });
				// real swatch color
				let hsl = { h: hue, s: Drag.sat, l: Drag.lgh, a: Drag.alpha };
				Drag.hex = ColorLib.hslToHex(hsl);
				Drag.rgb = ColorLib.hexToRgb(Drag.hex);
				// update color-box color
				Drag.cEl.css({ "--hue": Drag.hue, "--color": Drag.hex });
				// hue value
				Self.els.iHue.val(hue +"°");
				// saturation & lightness
				Self.els.iSaturation.val(Drag._round(Drag.sat * 100) +"%");
				Self.els.iLightness.val(Drag._round(Drag.lgh * 100) +"%");
				// rgb values
				Self.els.iRed.val(Drag.rgb.r);
				Self.els.iGreen.val(Drag.rgb.g);
				Self.els.iBlue.val(Drag.rgb.b);
				// hex value
				Self.els.iHex.val(Drag.hex.slice(1,7));
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-dlg-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doHueBar);
				break;
			// custom events
			case "position-cursor":
				// position cursor
				let iHsl = ColorLib.hexToHsl(event.value),
					iRgb = ColorLib.hexToRgb(event.value),
					hueHex = ColorLib.hslToHex({ h: iHsl.h, s: 1, l: .5, a: 1 }),
					iHeight = +event.dEl.find(".hue-bar").prop("offsetHeight"),
					iTop = (1-(iHsl.h / 360)) * iHeight;
				// dialog content variables
				event.dEl.find(".dlg-content").css({
					"--color": event.value,
					"--old-color": event.value,
					"--alpha": 1,
					"--old-alpha": 1,
					"--hue": hueHex,
				});
				// hue bar cursor
				event.dEl.find(".hue-bar .cursor").css({ top: iTop });

				// hsl values
				Self.els.iHue.val(iHsl.h +"°");
				Self.els.iSaturation.val(Math.round(iHsl.s * 100) +"%");
				Self.els.iLightness.val(Math.round(iHsl.l * 100) +"%");
				// rgb values
				Self.els.iRed.val(iRgb.r);
				Self.els.iGreen.val(iRgb.g);
				Self.els.iBlue.val(iRgb.b);
				// hex value
				Self.els.iHex.val(event.value.slice(1,7));
				break;
		}
	},
	doDialogKnob(event) {
		let Self = UI,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag event object
				let el = $(event.target),
					pEl = el.parent().addClass("hover"),
					dEl = pEl.parents(".dialog-box"),
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: el.data("change"),
					},
					src = pEl.find(".value input"),
					isPanKnob = el.hasClass("pan-knob");
				// references needed for drag'n drop
				Self.drag = {
					el,
					src,
					dlg,
					isPanKnob,
					suffix: src.data("suffix") || "",
					min: isPanKnob ? -100 : 0,
					max: isPanKnob ? 100 : 100,
					value: +el.data("value"),
					clientY: event.clientY,
					val: {
						min: isPanKnob ? 0 : +src.data("min"),
						max: +src.data("max") - +src.data("min"),
						step: +src.data("step") || 1,
						value: +src.val(),
					},
					_min: Math.min,
					_max: Math.max,
					_round: Math.round,
				};
				// pre-knob twist event
				dlg.func({ ...dlg, type: `before:${dlg.type}`, value: +el.data("value") });
				// bind event handlers
				Self.content.addClass("no-dlg-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialogKnob);
				break;
			case "mousemove":
				let value = (Drag.clientY - event.clientY) + (Drag.isPanKnob ? Drag.value * 2 : Drag.value);
				value = Drag._min(Drag._max(value, Drag.min), Drag.max);
				if (Drag.isPanKnob) value = value >> 1;
				Drag.el.data({ value });

				let i = Drag.val.step.toString().split(".")[1],
					val = +((Drag.val.max * (value / 100)) + Drag.val.min).toFixed(i ? i.length : 0);
				Drag.src.val(val + Drag.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, value: val });
				// save value
				Drag.newValue = val;
				break;
			case "mouseup":
				// post-knob twist event
				Drag.dlg.func({ ...Drag.dlg, type: `after:${Drag.dlg.type}`, value: Drag.newValue });
				// reset parent element
				Drag.el.parent().removeClass("hover");
				// unbind event handlers
				Self.content.removeClass("no-dlg-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialogKnob);
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				event.dEl.find(".field-row.has-knob").map(rEl => {
					let row = $(rEl),
						iEl = row.find("input"),
						min = +iEl.data("min"),
						max = +iEl.data("max"),
						val = parseInt(iEl.val(), 10),
						kEl = row.find(".knob");
					if (kEl.length) {
						kEl.data({ value: Math.round((val-min) / (max-min) * 100) });
					} else {
						kEl = row.find(".pan-knob");
						kEl.data({ value: "0" });
					}
				});
				break;
		}
	},
	doKnob(event) {
		let APP = keane,
			Self = UI,
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
