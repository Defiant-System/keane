
// keane.sidebar.paragraph

{
	init() {
		let root = window.find(`.box-body > div[data-box="paragraph"]`);
		// fast references
		this.els = {
			root,
		};
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.paragraph,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "select-justify":
				event.el.find("> .active").removeClass("active");
				el = $(event.target).addClass("active");
				break;
		}
	}
}
