
// TOOLS.crop

{
	init() {
		this.option = "crop";
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.crop;

		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "crop";
				break;
			case "enable":
				break;
			case "disable":
				break;
		}
	}
}
