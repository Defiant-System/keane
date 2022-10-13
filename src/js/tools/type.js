
// keane.tools.type

{
	init() {
		this.option = "type";
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools.type;

		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "type";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
