
// keane.sidebar.info

{
	init() {
		let root = window.find(`.box-body > div[data-box="info"]`);
		// fast references
		this.els = {
			root,
			hslH: root.find(".value.hslH"),
			hslS: root.find(".value.hslS"),
			hslL: root.find(".value.hslL"),
			rgbR: root.find(".value.rgbR"),
			rgbG: root.find(".value.rgbG"),
			rgbB: root.find(".value.rgbB"),
			rgbA: root.find(".value.rgbA"),
			mouseX: root.find(".value.mouseX"),
			mouseY: root.find(".value.mouseY"),
			selHeight: root.find(".value.selHeight"),
			selWidth: root.find(".value.selWidth"),
		};
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.info,
			Detail = event.detail,
			isOn,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "mouse-move":
				isOn = Detail.isOnCanvas;
				
				Self.els.hslH.html(isOn ? Math.round(Detail.hsl.h) +"°" : "");
				Self.els.hslS.html(isOn ? Math.round(Detail.hsl.s * 100) +"%" : "");
				Self.els.hslL.html(isOn ? Math.round(Detail.hsl.l * 100) +"%" : "");
				
				Self.els.rgbR.html(isOn ? Detail.rgb.r : "");
				Self.els.rgbG.html(isOn ? Detail.rgb.g : "");
				Self.els.rgbB.html(isOn ? Detail.rgb.b : "");
				// alpha value is shown if it's not 100%
				Self.els.rgbA.html(isOn ? Math.round((Detail.rgb.a / 255) * 100) +"%" : "");
				Self.els.rgbA.parent().toggleClass("hidden", isOn && Detail.rgb.a !== 255);

				Self.els.mouseY.html(isOn ? Detail.top : "");
				Self.els.mouseX.html(isOn ? Detail.left : "");
				break;
			
			// custom events
			case "enable":
				// subscribe to events
				karaqu.on("mouse-move", Self.dispatch);
				break;
			case "disable":
				// unsubscribe to events
				karaqu.off("mouse-move", Self.dispatch);
				break;
		}
	}
}
