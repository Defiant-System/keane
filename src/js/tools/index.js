
// keane.tools

{
	init() {
		// fast references
		this.els = {
			toolBar: window.find(".tools-bar"),
			optionBar: window.find(".tools-options-bar"),
		};
		// all tools
		this.allTools = "marquee move brush gradient type crop blur stamp pipette pen shape pointer zoom others".split(" ");

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		// select a tool
		this.els.toolBar.find(".tool:nth(2)").trigger("click");

		// temp
		// setTimeout(() => window.find(`.option .tip-icon`).trigger("click"), 500);
		setTimeout(() => window.find(`.tool-options-brush .tool-feather`).trigger("click"), 500);
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools,
			root,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// proxied events
			case "select-tool":
				el = $(event.target);
				if (el.hasClass("active") || !el.data("content")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				if (Self._active) {
					Self.els.optionBar.find(`> .tool-options-${Self._active}`).addClass("hidden");
					// disable active tool
					Self[Self._active].dispatch({ type: "disable" });
				}

				Self._active = el.data("content");
				root = Self.els.optionBar.find(`> .tool-options-${Self._active}`).removeClass("hidden");
				// enable tool
				Self[Self._active].dispatch({ type: "enable", root });
				break;
			case "select-option":
				root = event.el.parents("div[data-area]:first");
				root.find(`.tool.down[data-group="options"]`).removeClass("down");
				event.el.addClass("down");
				// tool sub-options
				name = event.el.data("subOptions");
				root.find(`.tool-group.active`).removeClass("active");
				root.find(`.tool-group[data-subName="${name}"]`).addClass("active");

				break;

			// custom events
			case "enable-tools":
				list = event.list || Self.allTools;
				list.map(name => Self.els.toolBar.find(`.tool[data-content="${name}"]`).removeClass("disabled"));
				break;
			case "disable-tools":
				list = event.list || Self.allTools;
				list.map(name => Self.els.toolBar.find(`.tool[data-content="${name}"]`).addClass("disabled"));
				break;
			case "enable-options":
				list = event.list || Self.els.optionBar.find("[data-arg]").map(el => el.getAttribute("data-arg"));
				list.map(name => Self.els.optionBar.find(`[data-arg="${name}"]`).removeClass("disabled"));
				break;
			case "disable-options":
				list = event.list || Self.els.optionBar.find("[data-arg]").map(el => el.getAttribute("data-arg"));
				list.map(name => Self.els.optionBar.find(`[data-arg="${name}"]`).addClass("disabled"));
				break;
			default:
				el = event.el;
				if (el) {
					let pEl = el.parents("[data-area]"),
						area = pEl.data("area");
					if (area) {
						Self[area].dispatch(event);
					}
				}
		}
	},
	marquee   : @import "marquee.js",
	move      : @import "move.js",
	pipette   : @import "pipette.js",
	brush     : @import "brush.js",
	gradient  : @import "gradient.js",
	type      : @import "type.js",
	crop      : @import "crop.js",
	blur      : @import "blur.js",
	stamp     : @import "stamp.js",
	pen       : @import "pen.js",
	shape     : @import "shape.js",
	pointer   : @import "pointer.js",
	zoom      : @import "zoom.js",
	quickMask : @import "quickMask.js",
}
