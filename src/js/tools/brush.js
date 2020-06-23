
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
			// custom events
			case "select-option":
				Self.option = event.arg || "brush";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
