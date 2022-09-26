
// keane.sidebar.color

{
	init() {
		let root = window.find(`.box-body > div[data-box="color"]`);
		// fast references
		this.doc = $(document);
		this.els = {
			root,
			colorValues: root.find(".color-values"),
			colorWheel: root.find(".color-wheel"),

			iHue: root.find(`input[name="color-hsl-hue"]`),
			iSaturation: root.find(`input[name="color-hsl-saturation"]`),
			iLightness: root.find(`input[name="color-hsl-lightness"]`),
			iRed: root.find(`input[name="color-rgb-red"]`),
			iGreen: root.find(`input[name="color-rgb-green"]`),
			iBlue: root.find(`input[name="color-rgb-blue"]`),
			iHex: root.find(`input[name="color-hex"]`),
		};

		// bind event handlers
		this.els.colorWheel.on("mousedown", this.doColorWheel);

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);

		// temp
		setTimeout(() => window.find(`.swatches-wrapper > div:nth(5)`).trigger("click"), 500);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			rgb,
			hsl,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "set-fg-color":
				// console.log( event.detail );
				rgb = Color.hexToRgb(event.detail.hex);
				// hsl = Color.rgbToHsl(rgb);
				// console.log( hsl );

				Self.els.iHex.val(event.detail.hex.slice(1,7));
				break;

			// custom events
			case "show-color-values":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				Self.els.colorValues
					.removeClass("show-rgb show-hsl")
					.addClass(`show-${event.arg}`);
				break;
			case "color-wheel-shape":
				// TODO (!?)
				break;
		}
	},
	doColorWheel(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// origin element
				let el = $(event.target);
				// handle areas
				if (el.hasClass("negative-space")) return;
				if (el.hasClass("color-shape")) return Self.doColorBox(event);

				// prepare drag object
				let cursor = el.find(".circle-cursor"),
					rect = el[0].getBoundingClientRect(),
					center = {
						x: rect.x + (+el.prop("offsetWidth") >> 1),
						y: rect.y + (+el.prop("offsetHeight") >> 1),
					};
				Self.drag = {
					cursor,
					center,
					_PI: Math.PI,
					_atan2: Math.atan2,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// force cursor to position to mouse
				Self.doColorWheel({ type: "mousemove", clientX: event.clientX, clientY: event.clientY });
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doColorWheel);
				break;
			case "mousemove":
				let hue = Drag._atan2(event.clientY - Drag.center.y, event.clientX - Drag.center.x) * (180 / Drag._PI);
				if (hue < 0) hue += 360;
				Drag.cursor.css({ transform: `rotate(${hue}deg)` });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doColorWheel);
				break;
		}
	},
	doColorBox(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// get elements & align cursor
				let el = $(event.target),
					cursor = el.find(".box-cursor").css({ left: event.offsetX, top: event.offsetY });
				// prepare drag object
				Self.drag = {
					cursor,
					clickX: +cursor.prop("offsetLeft") - event.clientX,
					clickY: +cursor.prop("offsetTop") - event.clientY,
					min: { x: 0, y: 0 },
					max: {
						x: +el.prop("offsetWidth"),
						y: +el.prop("offsetHeight"),
					},
					_max: Math.max,
					_min: Math.min,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("no-cursor");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doColorBox);
				break;
			case "mousemove":
				let left = Drag._min(Drag._max(event.clientX + Drag.clickX, Drag.min.x), Drag.max.x),
					top = Drag._min(Drag._max(event.clientY + Drag.clickY, Drag.min.y), Drag.max.y);
				Drag.cursor.css({ top, left });
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("no-cursor");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doColorBox);
				break;
		}
	}
}
