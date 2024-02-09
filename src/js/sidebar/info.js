
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
			fileSize: root.find(".value.fileSize"),
		};
		// default
		this.memRect = {};
		// subscribe to events
		window.on("file-selected", this.dispatch);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.info,
			Detail = event.detail,
			isOn,
			val,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "mouse-move":
				if (Detail.isSelecting) {
					// remember rectangle
					Self.memRect = Detail;
					// update DOM
					Self.els.mouseY.html(Detail.y || "");
					Self.els.mouseX.html(Detail.x || "");
					Self.els.selHeight.html(Detail.h || "");
					Self.els.selWidth.html(Detail.w || "");
					return;
				}
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

				Self.els.mouseY.html(isOn ? Detail.top : Self.memRect.y || "");
				Self.els.mouseX.html(isOn ? Detail.left : Self.memRect.x || "");

				if (Self.memRect.w) {
					Self.els.selHeight.html(Self.memRect.h || "");
					Self.els.selWidth.html(Self.memRect.w || "");
				}
				break;
			case "selection-cleared":
				// clear memory rectangle
				Self.memRect = {};
				// update DOM
				Self.els.mouseY.html("");
				Self.els.mouseX.html("");
				Self.els.selHeight.html("");
				Self.els.selWidth.html("");
				break;
			case "file-selected":
				val = karaqu.formatBytes(event.detail.file.size);
				Self.els.fileSize.html(val);
				break;
			
			// custom events
			case "enable":
				// subscribe to events
				window.on("mouse-move", Self.dispatch);
				window.on("selection-cleared", Self.dispatch);
				break;
			case "disable":
				// unsubscribe to events
				window.off("mouse-move", Self.dispatch);
				window.off("selection-cleared", Self.dispatch);
				break;
		}
	}
}
