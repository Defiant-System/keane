
defiant.require("classes/file.js")
defiant.require("classes/layer.js")

defiant.require("modules/files.js")
defiant.require("modules/projector.js")
defiant.require("modules/misc.js")
defiant.require("modules/color.js")
defiant.require("modules/ui.js")
defiant.require("modules/rulers.js")
defiant.require("modules/thumb.js")


const TOOLS = {
	_active  : false,
	marquee  : defiant.require("tools/marquee.js"),
	move     : defiant.require("tools/move.js"),
	pipette  : defiant.require("tools/pipette.js"),
	brush    : defiant.require("tools/brush.js"),
	gradient : defiant.require("tools/gradient.js"),
	type     : defiant.require("tools/type.js"),
	crop     : defiant.require("tools/crop.js"),
	blur     : defiant.require("tools/blur.js"),
	stamp    : defiant.require("tools/stamp.js"),
	pen      : defiant.require("tools/pen.js"),
	shape    : defiant.require("tools/shape.js"),
	pointer  : defiant.require("tools/pointer.js"),
	zoom     : defiant.require("tools/zoom.js"),
};


const photoshop = {
	els: {},
	init() {
		// fast references
		this.els.content = window.find("content");
		this.els.statusBar = window.find(".status-bar");

		// file stack
		this.files = [];

		// init objects
		UI.init();
		Files.init();
		Projector.init();
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
			this.els.content.find(".tools-bar .tool[data-content='marquee']").trigger("click"));

		// temp
		this.dispatch({ type: "open-file", name: "Untitled", width: 400, height: 300, fill: "red", scale: 1 });
		//this.dispatch({ type: "open-file", path: "~/img/blue-rose.jpg", scale: 1 });
		//this.dispatch({ type: "open-file", path: "~/img/mona-lisa.jpg", scale: 1 });
		//this.dispatch({ type: "open-file", path: "~/img/small.jpg", scale: 1 });
	},
	dispatch(event) {
		let Self = photoshop,
			image,
			name,
			boxName,
			pEl,
			el;
		switch (event.type) {
			case "open-file":
				Files.open(event);
				break;
			case "select-file":
				Files.select(event.arg);
				break;
			case "close-file":
				el = event.el.parent();
				Files.close(el.data("arg"));
				break;
			case "toggle-rulers":
				Projector.file.dispatch(event);
				break;
			case "toggle-statusbar":
				Self.els.statusBar.toggleClass("hidden", event.checked === 1);
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
				//	TOOLS[TOOLS._active].dispatch({ type: "disable" });
				}
				if (TOOLS[el.data("content")]) {
					// enable tool
					TOOLS._active = el.data("content");
				//	TOOLS[TOOLS._active].dispatch({ type: "enable", root });
				}
				break;
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active")) return;
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
			default:
				if (event.el) {
					pEl = event.el.parents(".tools-options-bar");
					if (pEl.length) {
						name = event.el.data("group");
						if (event.el.hasClass("tool")) {
							if (name) {
								pEl.find(`.down[data-group="${name}"]`).removeClass("down");
							}
							event.el.addClass("down");
						}
						pEl = pEl.prevAll(".tools-bar").find(".active");
						if (event.el.data("option") === "main") {
							// change root tool icon
							image = event.el.css("background-image").replace(/http(s?):\/\/.*?\//, "/");
							pEl.css({ "background-image": image });
						}
						// dispatch event to tool object
						return TOOLS[pEl.data("content")].dispatch(event);
					}
					pEl = event.el.parents(".inline-menubox");
					if (pEl.length) {
						return UI.dispatch(event);
					}
					pEl = event.el.parents("div[data-box]");
					boxName = pEl.attr("data-box");
					if (pEl.length && Self.box[boxName].dispatch) {
						Self.box[boxName].dispatch(event);
					}
				}
		}
	},
	statusbar: defiant.require("modules/statusbar.js"),
	box: {
		navigator: defiant.require("boxes/box-navigator.js"),
		color:     defiant.require("boxes/box-color.js"),
		info:      defiant.require("boxes/box-info.js"),
		character: defiant.require("boxes/box-character.js"),
		swatches:  defiant.require("boxes/box-swatches.js"),
		paragraph: defiant.require("boxes/box-paragraph.js"),
		layers:    defiant.require("boxes/box-layers.js"),
		channels:  defiant.require("boxes/box-channels.js"),
		paths:     defiant.require("boxes/box-paths.js")
	}
};

window.exports = photoshop;
