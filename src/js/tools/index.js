
// TOOLS.index

{
	init() {
		// fast references
		this.els = {
			toolBar: window.find(".tools-bar"),
			optionBar: window.find(".tools-options-bar"),
		};
		// all tools
		this.allTools = "marquee move brush gradient type crop blur stamp pipette pen shape pointer zoom others".split(" ");

		// temp
		// setTimeout(() => this.dispatch({ type: "disable-tools", list: "marquee move".split(" ") }), 200);
		// setTimeout(() => this.dispatch({ type: "disable-options", list: "blend opacity".split(" ") }), 200);
	},
	dispatch(event) {
		let APP = keane,
			Self = TOOLS.index,
			list,
			el;
		// console.log(event);
		switch (event.type) {
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
		}
	}
}
