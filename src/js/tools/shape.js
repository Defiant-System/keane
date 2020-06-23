
// TOOLS.shape

{
	init() {
		this.option = "shape";
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.shape;

		switch (event.shape) {
			// custom events
			case "select-option":
				Self.option = event.arg || "shape";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
