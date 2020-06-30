
const UI = {
	init() {
		// fast references
		this.content = window.find("content");

		// bind event handlers
		this.content.on("click", ".option .value", this.dispatch);
	},
	dispatch(event) {
		let APP = photoshop,
			Self = UI,
			el;
		switch (event.type) {
			case "click":
				
				break;
		}
	}
};
