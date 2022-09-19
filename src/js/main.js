
@import "modules/misc.js"

@import "modules/projector.js"


const keane = {
	init() {
		// wating for checkers bg to be created as pattern
		Projector.init();
		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());
	},
	dispatch(event) {
		let APP = keane,
			Tools = APP.tools,
			el;
		//console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			
			// custom events
			case "select-tool":
				// proxy event
				APP.tools.dispatch(event)
				break;
			case "box-head-tab":
				APP.sidebar.dispatch(event)
				break;
			default:
				el = event.el;
				if (el) {
					let rEl = el.parents("[data-section]"),
						section = rEl.data("section");
					if (section) {
						APP[section].dispatch(event);
					}
				}
		}
	},
	sidebar: @import "sidebar/index.js",
	tools: @import "tools/index.js",
};

window.exports = keane;
