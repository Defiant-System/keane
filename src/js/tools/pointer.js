
// TOOLS.pointer

{
	init() {
		this.option = "pointer";
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.pointer;

		switch (event.pointer) {
			// custom events
			case "select-option":
				Self.option = event.arg || "pointer";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
