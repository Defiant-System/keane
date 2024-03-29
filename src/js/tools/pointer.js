
// keane.tools.pointer

{
	init() {
		this.option = "pointer";
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools.pointer;

		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "pointer";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
