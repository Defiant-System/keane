
// photoshop.rulers

{
	els: {},
	init() {
		// fast references
		this.els.rulerTop = window.find(".ruler-top");
		this.els.rulerLeft = window.find(".ruler-left");
		this.els.rulerTopValue = window.find(".ruler-top span");
		this.els.rulerLeftValue = window.find(".ruler-left span");

		// subscribe to events
		defiant.on("mouse-move", this.dispatch);
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.rulers,
			Detail = event.detail;

		switch (event.type) {
			case "mouse-move":
				Self.els.rulerTopValue
					.css({ left: Detail.offsetX +"px" })
					.html(Detail.left);
				Self.els.rulerLeftValue
					.css({ top: Detail.offsetY +"px" })
					.html(Detail.top);
				break;
		}
	}
}

