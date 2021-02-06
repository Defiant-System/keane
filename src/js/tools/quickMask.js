
// TOOLS.quickMask

{
	init() {
		this.enabled = false;
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.quickMask;

		switch (event.type) {
			// custom events
			case "enable":
				Self.enabled = !Self.enabled;
				// toggle menu item
				if (Self.enabled) {
					window.bluePrint.selectSingleNode(`//Menu[@click="tool:quickMask:enable"]`).setAttribute("type", "hidden");
					window.bluePrint.selectSingleNode(`//Menu[@click="tool:quickMask:disable"]`).removeAttribute("type");
				} else {
					window.bluePrint.selectSingleNode(`//Menu[@click="tool:quickMask:enable"]`).removeAttribute("type");
					window.bluePrint.selectSingleNode(`//Menu[@click="tool:quickMask:disable"]`).setAttribute("type", "hidden");
					return Self.dispatch({ type: "disable" });
				}

				console.log(event);
				break;
			case "disable":
				console.log(event);
				break;
		}
	}
}
