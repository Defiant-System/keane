
// TOOLS.blur

{
	init() {
		this.option = "blur";
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.blur;

		switch (event.type) {
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
