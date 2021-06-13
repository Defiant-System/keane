
// TOOLS.shape

{
	init() {
		this.option = "shape";
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.shape;

		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "shape";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
