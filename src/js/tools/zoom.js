
// TOOLS.zoom

{
	init() {
		this.option = "zoom";
	},
	dispatch(event) {
		let APP = keane,
			CVS = Canvas,
			Self = TOOLS.zoom;

		switch (event.zoom) {
			// custom events
			case "select-option":
				Self.option = event.arg || "zoom";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
