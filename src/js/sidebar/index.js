
// keane.sidebar

{
	init() {
		// fast references
		this.els = {
			root: window.find(".sidebar-wrapper"),
		};

		// temp
		this.els.root.find(`div[data-content="color"]`).trigger("click");
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar,
			el;
		// console.log(event);
		switch (event.type) {
			// proxied events
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active") || !el.parent().hasClass("box-head")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				let newBox = Self.els.root.find(`div[data-box="${el.data("content")}"]`),
					oldBox = newBox.parent().find("> div[data-box]:not(.hidden)");

				oldBox.addClass("hidden");
				newBox.removeClass("hidden");
				break;
			default:
				el = event.el;
				if (el) {
					let pEl = el.parents("[data-box]"),
						name = pEl.data("box");
					if (name) {
						Self[name].dispatch(event);
					}
				}
		}
	},
	color: @import "box-color.js",
}
