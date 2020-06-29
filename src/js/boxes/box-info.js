
// photoshop.box.info

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			this.els.root = root;

			// subscribe to events
			defiant.on("mouse-move", this.dispatch);
		} else {
			// subscribe to events
			defiant.off("mouse-move", this.dispatch);
			
			// clean up
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.info;

		if (!Self.els.root) return;
		switch (event.type) {
			case "mouse-move":
				Self.els.root.patch(el => {
					let Detail = event.detail,
						isOn = Detail.isOnCanvas,
						rgbA = el.find(".value.rgbA");

					el.find(".value.hslH").html(isOn ? Detail.hsl[0] +"°" : "");
					el.find(".value.hslS").html(isOn ? Detail.hsl[1] +"%" : "");
					el.find(".value.hslV").html(isOn ? Detail.hsl[2] +"%" : "");
					el.find(".value.rgbR").html(isOn ? Detail.rgba[0] : "");
					el.find(".value.rgbG").html(isOn ? Detail.rgba[1] : "");
					el.find(".value.rgbB").html(isOn ? Detail.rgba[2] : "");
					// alpha value is shown if it's not 100%
					rgbA.html(isOn ? Math.round((Detail.rgba[3] / 255) * 100) +"%" : "");
					rgbA.parent().toggleClass("hidden", isOn && Detail.rgba[3] !== 255);

					el.find(".value.mouseY").html(isOn ? Detail.top : "");
					el.find(".value.mouseX").html(isOn ? Detail.left : "");
				});
				break;
		}
	}
}
