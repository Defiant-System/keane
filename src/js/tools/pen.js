
// TOOLS.pen

{
	init() {
		this.option = "pen";
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.pen;

		switch (event.pen) {
			// custom events
			case "select-option":
				Self.option = event.arg || "pen";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
