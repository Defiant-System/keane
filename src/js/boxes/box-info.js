
// photoshop.box.info

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			// fast references
			this.els.hslH = root.find(".value.hslH");
			this.els.hslS = root.find(".value.hslS");
			this.els.hslV = root.find(".value.hslV");
			this.els.rgbR = root.find(".value.rgbR");
			this.els.rgbG = root.find(".value.rgbG");
			this.els.rgbB = root.find(".value.rgbB");
			this.els.rgbA = root.find(".value.rgbA");
			this.els.mouseX = root.find(".value.mouseX");
			this.els.mouseY = root.find(".value.mouseY");
			this.els.selHeight = root.find(".value.selHeight");
			this.els.selWidth = root.find(".value.selWidth");
			this.els.root = root;

			// subscribe to events
			defiant.on("mouse-move", this.dispatch);
		} else {
			// clean up
			this.els = {};

			// unsubscribe to events
			defiant.off("mouse-move", this.dispatch);
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.info,
			Detail = event.detail,
			el;

		if (!Self.els.root) return;

		switch (event.type) {
			// subscribed events
			case "mouse-move":
				isOn = Detail.isOnCanvas;
				
				Self.els.hslH.html(isOn ? Detail.hsl[0] +"°" : "");
				Self.els.hslS.html(isOn ? Detail.hsl[1] +"%" : "");
				Self.els.hslV.html(isOn ? Detail.hsl[2] +"%" : "");
				
				Self.els.rgbR.html(isOn ? Detail.rgba[0] : "");
				Self.els.rgbG.html(isOn ? Detail.rgba[1] : "");
				Self.els.rgbB.html(isOn ? Detail.rgba[2] : "");
				// alpha value is shown if it's not 100%
				Self.els.rgbA.html(isOn ? Math.round((Detail.rgba[3] / 255) * 100) +"%" : "");
				Self.els.rgbA.parent().toggleClass("hidden", isOn && Detail.rgba[3] !== 255);

				Self.els.mouseY.html(isOn ? Detail.top : "");
				Self.els.mouseX.html(isOn ? Detail.left : "");
				break;
			// custom events
			case "custom-event":
				break;
		}
	}
}
