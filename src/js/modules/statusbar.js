
// photoshop.statusbar

{
	init() {
		
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.statusbar,
			Detail = event.detail;

		switch (event.type) {
			case "mouse-move":
				Self.els.mouseY.html(Detail.isCanvasY ? Detail.top : "");
				Self.els.mouseX.html(Detail.isCanvasX ? Detail.left : "");
				break;
		}
	}
}

