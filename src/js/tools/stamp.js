
// TOOLS.stamp

{
	init() {
		this.option = "stamp";
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.stamp;

		switch (event.stamp) {
			// custom events
			case "select-option":
				Self.option = event.arg || "stamp";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
