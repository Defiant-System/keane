
// TOOLS.pen

{
	init() {
		this.option = "pen";
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.pen;

		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "pen";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
