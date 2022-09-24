
const UI = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("click", ".option .value", this.dispatch);
		this.content.on("mousedown mouseup", "[data-ui]", this.dispatch);

		// temp
		// setTimeout(() =>
		// 	this.content.find(".option[data-options='brush-tips'] .value").trigger("click"), 200);
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
		//console.log(event);
		switch (event.type) {
			case "click":
				el = $(this.parentNode);
				value = el.data("options");
				if (!value || el.hasClass("disabled")) return;

				if (value !== "brush-tips") {
					// prevent default behaviour
					event.preventDefault();
				}

				if (el.hasClass("opened")) {
					el.removeClass("opened");
					Self.content.trigger("mousedown");
					return;
				}

				// save reference to source element
				Self.srcEl = el.addClass("opened");

				data = {
					template: value,
					append: Self.content,
					match: el.data("match") || false,
				};
				// render menubox
				Self.menu = window.render(data);

				// position menubox
				rect = this.getBoundingClientRect();
				top = rect.top - window.top + rect.height + 9;
				left = rect.left - window.left + (rect.width >> 1) - (Self.menu[0].offsetWidth >> 1);
				Self.menu.css({ top, left });

				// set inital value - by associated event handler
				Self[Self.menu.data("ui")]({ type: "set-initial-value", el });

				// event handler checks for clicks outside inline-menubox
				Self.doc.on("mousedown", Self.dispatch);
				break;
			case "mousedown":
				el = $(event.target).parents(".inline-menubox");
				if (el.length) {
					if (this === document) return;
					// forward event to fitting handler
					Self[this.dataset.ui](event);
					// handles event differently for brush menu box
					if (this.dataset.ui === "doBrushTips") return;
				} else {
					// clean up
					Self.menu.remove();
				}
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
				Self.ctx = Self.cvs[0].getContext("2d");
				Self.cvs.prop({ width: 206, height: 78 });

				// indicate currect tip in menu
				name = Self.srcEl.data("name");
				Self.menu.find(`.shape-list > div[data-name="${name}"]`).trigger("click");
				break;
			case "draw-preview-curve":
				// reset context
				Self.cvs.prop({ width: 206, height: 78 });
				Self.ctx.translate(4, 28);
				Self.ctx.fillStyle = "#fff";

				image = Tool.preset.tip.cvs[0];
				size = Tool.preset.size;
				for (let i=0; i<180; i++) {
					Self.ctx.translate(1, _cos(i * 0.035) * .65);
					Self.ctx.drawImage(image, 0, 0, size, size, 0, 0, 17, 17);
				}
				break;
			case "tip-menu-set-tip":
				console.log(Self);
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
					old: Color.rgbToHex(Self.srcEl.find(".value").css("background-color")),
					value: Color.rgbToHex(el.css("background-color")),
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
				value = Color.rgbToHex(event.el.find(".value").css("background-color"));
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
