
// TOOLS.quickMask

{
	init() {
		
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.quickMask;

		switch (event.type) {
			// custom events
			case "enable":
				console.log(event);
				break;
			case "disable":
				console.log(event);
				break;
		}
	}
}
