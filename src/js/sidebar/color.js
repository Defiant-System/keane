
// keane.sidebar.color

{
	init() {
		let root = window.find(`.box-body > div[data-box="color"]`);
		this.els = {
			root,
			colorValues: root.find(".color-values"),

			iHue: root.find(`input[name="color-hsl-hue"]`),
			iSaturation: root.find(`input[name="color-hsl-saturation"]`),
			iLightness: root.find(`input[name="color-hsl-lightness"]`),
			iRed: root.find(`input[name="color-rgb-red"]`),
			iGreen: root.find(`input[name="color-rgb-green"]`),
			iBlue: root.find(`input[name="color-rgb-blue"]`),
			iHex: root.find(`input[name="color-hex"]`),
		};

		// subscribe to events
		karaqu.on("set-fg-color", this.dispatch);

		// temp
		setTimeout(() => window.find(`.swatches-wrapper > div:nth(5)`).trigger("click"), 300);
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
	}
}
