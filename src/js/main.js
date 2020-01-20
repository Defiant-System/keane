
const photoshop = {
	init() {
		// fast references
		this.content = window.find("content");
	},
	dispatch(event) {
		switch (event.type) {
			case "window.open":
				break;
		}
	}
};

window.exports = photoshop;
