
@import "classes/file.js"
@import "classes/layer.js"
@import "classes/simplex-noise.js"

@import "modules/misc.js"
@import "modules/color.new.js"
@import "modules/ui.js"
@import "modules/tabs.js"
@import "modules/projector.js"
@import "modules/rulers.js"
@import "modules/filters.js"
@import "modules/dialogs.js"


@import "modules/filters/gaussian-blur.js"
@import "modules/filters/close-pixelate.js"


// wating for checkers bg to be created as pattern
await Projector.init();


const keane = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			toolsBar: window.find(".tools-bar"),
			blankView: window.find(".blank-view"),
			statusBar: window.find(".status-bar"),
		};
		// init objects
		UI.init();
		Tabs.init();
		Filters.init();
		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());
	},
	dispatch(event) {
		let Self = keane,
			Tools = Self.tools,
			el;
		//console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "open.file":
				event.open({ responseType: "blob" })
					.then(file => Self.dispatch({ type: "prepare-file", file }));
				break;
			
			// custom events
			case "load-samples":
				// opening image file from application package
				event.names.map(async name => {
					// forward event to app
					let file = await Tabs.openLocal(`~/samples/${name}`);
					Self.dispatch({ type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// set up workspace
				Self.dispatch({ ...event, type: "setup-workspace" });
				break;
			case "setup-workspace":
				// show blank view
				Self.els.content.removeClass("show-blank-view");
				// open file + prepare workspace
				Tabs.open(event.file, event);
				break;
			case "show-blank-view":
				// show blank view
				Self.els.content.addClass("show-blank-view");
				break;

			case "open-dialog":
				UI.doDialog({ type: "dlg-open", name: event.arg });
				break;
			case "filter-render":
				let args = event.arg.split(","),
					layer = Projector.file.activeLayer,
					pixels = Filters.getPixels(layer.cvs[0]),
					filtered = Filters[args[0]](pixels, ...args.slice(1));
				layer.ctx.putImageData(filtered, 0, 0);
				// update sidebar/layers thumbnail
				layer.updateThumbnail();
				// render file
				Projector.file.render();
				break;

			// proxy events
			case "select-tool":
				return Self.tools.dispatch(event)
			case "box-head-tab":
				return Self.sidebar.dispatch(event)
			default:
				el = event.el;
				if (el) {
					let rEl = el.parents("[data-section]"),
						section = rEl.data("section");
					if (section) {
						return Self[section].dispatch(event);
					}
					rEl = el.parents(".inline-menubox");
					if (rEl.length) {
						return UI.dispatch(event);
					}
					rEl = el.parents(".dialog-box");
					if (rEl.length) {
						let name = rEl.data("dlg");
						return Dialogs[name](event);
					}
				}
		}
	},
	blankView: @import "modules/blankView.js",
	statusbar: @import "modules/statusbar.js",
	sidebar: @import "sidebar/index.js",
	tools: @import "tools/index.js",
};

window.exports = keane;
