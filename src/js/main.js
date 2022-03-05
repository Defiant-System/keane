
@import "classes/file.js"
@import "classes/layer.js"
@import "classes/simplex-noise.js"

@import "modules/files.js"
@import "modules/projector.js"
@import "modules/misc.js"
@import "modules/color.js"
@import "modules/ui.js"
@import "modules/rulers.js"
@import "modules/thumb.js"
@import "modules/filters.js"


const TOOLS = {
	_active   : false,
	index     : @import "tools/index.js",
	marquee   : @import "tools/marquee.js",
	move      : @import "tools/move.js",
	pipette   : @import "tools/pipette.js",
	brush     : @import "tools/brush.js",
	gradient  : @import "tools/gradient.js",
	type      : @import "tools/type.js",
	crop      : @import "tools/crop.js",
	blur      : @import "tools/blur.js",
	stamp     : @import "tools/stamp.js",
	pen       : @import "tools/pen.js",
	shape     : @import "tools/shape.js",
	pointer   : @import "tools/pointer.js",
	zoom      : @import "tools/zoom.js",
	quickMask : @import "tools/quickMask.js",
};


const keane = {
	async init() {
		// fast references
		this.els = {
			content: window.find("content"),
			toolsBar: window.find(".tools-bar"),
			blankView: window.find(".blank-view"),
			statusBar: window.find(".status-bar"),
		};

		// init objects
		UI.init();
		Files.init();
		Filters.init();
		// wating for checkers bg to be created as pattern
		await Projector.init();
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());
		Object.keys(TOOLS).filter(t => TOOLS[t].init).map(t => TOOLS[t].init());

		// init sidebar initial boxes
		["navigator", "character", "layers"].map(item => {
			let box = window.store(`boxes/box-${item}.htm`, `div[data-box="${item}"]`);
			this.box[item].toggle(box, "on");
		});

		// auto store first visible tool-options HTML
		window.store("tool-options/marquee.htm", '.tool-options-marquee');

		// auto-select initial tool
		requestAnimationFrame(() =>
			this.els.toolsBar.find(".tool[data-content='brush']").trigger("click"));
			// this.els.toolsBar.find(".tool[data-content='marquee']").trigger("click"));
			// this.els.toolsBar.find(".tool[data-content='move']").trigger("click"));
	},
	dispatch(event) {
		let Self = keane,
			image,
			name,
			value,
			boxName,
			pEl,
			el;
		//console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				// reset app by default - show initial view
				Self.dispatch({ type: "reset-app" });
				break;
			case "window.close":
				// save recents list to settings
				window.settings.setItem("recents", Self.blankView.xRecent);
				break;
			case "window.keystroke":
				if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
					let menu = window.bluePrint.selectSingleNode(`//Menu[@hotkey="${event.char}"]`);
					if (menu) {
						return Self.dispatch({ type: menu.getAttribute("click") });
					}
				}

				name = Self.els.toolsBar.find(".active").data("content");
				// dispatch event to tool object
				if (TOOLS[name]) TOOLS[name].dispatch(event);
				break;
			case "open.file":
				event.open({ responseType: "blob" })
					.then(file => Self.dispatch({ type: "prepare-file", file }));
					// .then(file => Files.open(file));
				
				//Self.dispatch({ type: "filter-render", arg: "clouds" });
				break;
			// custom events
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
				Files.open(event.file, event);
				// enable & click on show sidebar
				// TODO....
				break;
			case "open-file":
				window.dialog.open({
					jpg: item => Self.dispatch(item),
					jpeg: item => Self.dispatch(item),
					png: item => Self.dispatch(item),
				});
				break;
			case "select-file":
				Files.select(event.arg);
				break;
			case "close-file":
				if (event.el) {
					el = event.el.parent();
					value = el.data("arg");
				} else {
					value = Projector.file._file.id;
				}
				Files.close(value);
				break;
			case "toggle-rulers":
				Projector.file.dispatch(event);
				break;
			case "toggle-statusbar":
				Self.els.statusBar.toggleClass("hidden", event.checked === 1);
				break;
			case "reset-app":
				// show blank view
				Self.els.content.addClass("show-blank-view");
				// enable / disable toolbar
				Self.dispatch({ type: "toggle-toolbars", state: false });
				break;
			case "toggle-toolbars":
				// console.log(event);
				break;
			case "select-tool":
				el = $(event.target);
				if (el.hasClass("active") || !el.data("content")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				// replace existing tool options with selected
				let newEl = window.store(`tool-options/${el.data("content")}.htm`),
					oldEl = event.el.nextAll(".tools-options-bar").find("> div"),
					root = oldEl.replace(newEl);

				if (TOOLS._active) {
					// disable active tool
					TOOLS[TOOLS._active].dispatch({ type: "disable" });
				}
				if (TOOLS[el.data("content")]) {
					// enable tool
					TOOLS._active = el.data("content");
					TOOLS[TOOLS._active].dispatch({ type: "enable", root });
				}
				break;
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active") || !el.parent().hasClass("box-head")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				let newBox = window.store(`boxes/box-${el.data("content")}.htm`),
					oldBox = el.parent().nextAll(".box-body").find("> div[data-box]");
				
				// notify box state = off
				this.box[oldBox.data("box")].toggle(oldBox, "off");
				// replace box body
				newBox = oldBox.replace(newBox);
				// notify box state = on
				this.box[newBox.data("box")].toggle(newBox, "on");
				break;
			case "filter-render":
				let args = event.arg.split(",");
					layer = Projector.file.activeLayer;
					pixels = Filters.getPixels(layer.cvs[0]);
					filtered = Filters[args[0]](pixels, ...args.slice(1));
				layer.ctx.putImageData(filtered, 0, 0);
				// render file
				Projector.file.render();
				break;
			default:
				el = event.el;
				if (el) {
					pEl = el.parents("[data-area]");
					if (pEl.length && Self[pEl.data("area")]) {
						return Self[pEl.data("area")].dispatch(event);
					}
					pEl = el.parents(".tools-options-bar");
					if (pEl.length) {
						name = el.data("group");
						if (el.hasClass("tool")) {
							if (name) {
								pEl.find(`.down[data-group="${name}"]`).removeClass("down");
							}
							el.addClass("down");
							// tool sub-options
							pEl.find(".tool-group.active").removeClass("active");
							name = el.data("subOptions");
							pEl.find(`.tool-group[data-subName="${name}"]`).addClass("active");
						}
						pEl = pEl.prevAll(".tools-bar").find(".active");
						if (el.data("option") === "main") {
							// change root tool icon
							image = el.css("background-image").replace(/http(s?):\/\/.*?\//, "/");
							pEl.css({ "background-image": image });
						}
						// dispatch event to tool object
						if (pEl.length) {
							return TOOLS[pEl.data("content")].dispatch(event);
						}
					}
					pEl = el.parents(".inline-menubox");
					if (pEl.length) {
						return UI.dispatch(event);
					}
					pEl = el.parents("div[data-box]");
					boxName = pEl.attr("data-box");
					if (pEl.length && Self.box[boxName].dispatch) {
						Self.box[boxName].dispatch(event);
					}
				}
				let [obj, prop, type] = event.type.split(":");
				if (obj === "tool") {
					return TOOLS[prop].dispatch({ ...event, type });
				}
		}
	},
	blankView: @import "modules/blankView.js",
	statusbar: @import "modules/statusbar.js",
	box: {
		navigator: @import "boxes/box-navigator.js",
		color:     @import "boxes/box-color.js",
		info:      @import "boxes/box-info.js",
		character: @import "boxes/box-character.js",
		swatches:  @import "boxes/box-swatches.js",
		paragraph: @import "boxes/box-paragraph.js",
		layers:    @import "boxes/box-layers.js",
		channels:  @import "boxes/box-channels.js",
		paths:     @import "boxes/box-paths.js"
	}
};

window.exports = keane;
