
// keane.tools.quickMask

{
	init() {
		this.enabled = false;
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools.quickMask;

		switch (event.type) {
			// custom events
			case "toggle-quick-mask-mode":
				console.log(1111, event);
				break;

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
				break;
			case "disable":
				console.log(event);
				break;
		}
	}
}
