
@import "modules/test.js"


@import "classes/box.js"
@import "classes/file.js"
@import "classes/layer.js"
@import "classes/guides.js"
@import "classes/simplex-noise.js"

@import "ext/pathseg.js"
@import "modules/misc.js"
@import "modules/color.new.js"
@import "modules/ui.js"
@import "modules/mask.js"
@import "modules/tabs.js"
@import "modules/projector.js"
@import "modules/rulers.js"
@import "modules/actions.js"
@import "modules/filters.js"
@import "modules/dialogs.js"

@import "modules/filters/gaussian-blur.js"
@import "modules/filters/crystallize.js"
@import "modules/filters/painter.js"
@import "modules/filters/close-pixelate.js"



let Pref = {
	guides: {
		show: true,
		color: "#3583d0",
		sensitivity: 10,
	},
	grid: {
		show: false,
		type: "square", // isometric
		gap: 10,
		pixelGrid: false,
	},
	quickMask: {
		paint: "selected", // masked
		color: "#ff000070",
	}
};



const keane = {
	init() {
		// get settings or use default settings
		this.Settings = window.settings.getItem("settings") || Pref;
		// fast references
		this.els = {
			content: window.find("content"),
			toolsBar: window.find(".tools-bar"),
			blankView: window.find(".blank-view"),
			handleBox: window.find(".handle-box"),
		};
		// init objects
		UI.init();
		Mask.init();
		Tabs.init();
		Rulers.init();
		Filters.init();
		Actions.init();
		Projector.init();
		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		// DEV-ONLY-START
		Test.init();
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = keane,
			Tools = Self.tools,
			name,
			args,
			layer,
			pixels,
			filtered,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				Self.dispatch({ type: "show-blank-view" });
				break;
			case "window.blur":
				Mask.ants.halt();
				break;
			case "window.focus":
				Mask.ants.resume();
				break;
			case "window.resize":
				Tabs.resize(event);
				Projector.dispatch(event);
				break;
			case "window.keystroke":
				switch (event.char) {
					case "meta":
						karaqu.emit("meta-key", { state: "down" });
						break;
				}
				// dispatch event to active tool object
				name = Self.els.toolsBar.find(".active").data("content");
				if (Self.tools[name]) Self.tools[name].dispatch(event);
				break;
			case "window.keyup":
				switch (event.char) {
					case "meta":
						karaqu.emit("meta-key", { state: "up" });
						break;
				}
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
				if (Self.els.content.hasClass("show-blank-view")) return;

				let str = "show-blank-view";
				str += Tabs._stack.length ? " files-open" : "";
				// show blank view
				Self.els.content.addClass(str);
				// check clipboard for images
				Self.blankView.dispatch({ type: "check-clipboard" });
				break;

			case "open-dialog":
				UI.doDialog({ type: "dlg-open", name: event.arg });
				break;
			case "edit-action":
				args = event.arg.split(",");
				layer = Projector.file.activeLayer;
				pixels = Actions.getPixels(layer.cvs[0]);
				filtered = Actions[args[0]](pixels, ...args.slice(1));

				layer.ctx.putImageData(filtered, 0, 0);
				// update sidebar/layers thumbnail
				layer.updateThumbnail();
				// render file
				Projector.file.render();
				break;

			case "filter-render":
				args = event.arg.split(",");
				layer = Projector.file.activeLayer;
				pixels = Filters.getPixels(layer.cvs[0]);
				filtered = Filters[args[0]](pixels, ...args.slice(1));

				layer.ctx.putImageData(filtered, 0, 0);
				// update sidebar/layers thumbnail
				layer.updateThumbnail();
				// render file
				Projector.file.render();
				break;

			// proxy events
			case "file-rotate90cw":
			case "file-rotate90ccw":
			case "file-rotate180":
				Projector.file.rotate(event.type.split("-")[1], event.arg);
				break;
			case "file-flipV":
			case "file-flipH":
				Projector.file.flip(event.type.split("-")[1], event.arg);
				break;

			case "toggle-guides":
			case "toggle-rulers":
			case "toggle-grid":
			case "toggle-pixel-grid":
				return Rulers.dispatch(event);
			case "toggle-statusbar":
				return Self.statusbar.dispatch(event);
			case "toggle-quick-mask-mode":
			case "toggle-paint-masked-area":
			case "enter-quick-mask-mode":
			case "exit-quick-mask-mode":
			case "select-tool":
				return Self.tools.dispatch(event);
			case "box-head-tab":
				return Self.sidebar.dispatch(event);
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
				} else {
					return Self.tools.dispatch(event);
				}
		}
	},
	blankView: @import "modules/blankView.js",
	statusbar: @import "modules/statusbar.js",
	sidebar: @import "sidebar/index.js",
	tools: @import "tools/index.js",
};

window.exports = keane;
