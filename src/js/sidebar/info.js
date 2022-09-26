
// keane.sidebar.info

{
	init() {
		let root = window.find(`.box-body > div[data-box="info"]`);
		// fast references
		this.els = {
			root,
			hslH: root.find(".value.hslH"),
			hslS: root.find(".value.hslS"),
			hslV: root.find(".value.hslV"),
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
