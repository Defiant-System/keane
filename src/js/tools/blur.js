
// TOOLS.blur

{
	init() {
		this.option = "blur";
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.blur;

		switch (event.blur) {
			// custom events
			case "select-option":
				Self.option = event.arg || "blur";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
