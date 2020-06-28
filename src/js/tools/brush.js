
// TOOLS.brush

{
	init() {
		this.option = "brush";
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.brush;

		switch (event.type) {
			// native events
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
			// custom events
			case "select-option":
				Self.option = event.arg || "brush";
				break;
			case "enable":
				CVS.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				CVS.cvs.off("mousedown", Self.dispatch);
				break;
		}
	}
}
