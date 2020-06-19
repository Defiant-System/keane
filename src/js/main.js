
defiant.require("canvas.js")
//defiant.req1uire("modules/psd.js")
//const PSD = require1("psd");

const ZOOM = [10,25,50,75,100,200,300,400,600,800,1200,1500,1800];

const TOOLS = {
	_active : false,
	move    : defiant.require("tools/move.js"),
	marquee : defiant.require("tools/marquee.js")
};

const photoshop = {
	els: {},
	init() {
		// fast references
		this.els.content = window.find("content");
		this.els.rulers = window.find(".ruler-top, .ruler-left");
		this.els.statusBar = window.find(".status-bar");

		// init sub-objects
		Canvas.init();
		Object.keys(this)
			.filter(item => this[item].init)
			.map(item => this[item].init());

		// auto store box HTML
		window.store("tool-options/marquee.htm", '.tool-options-marquee');

		let box = window.store("boxes/box-navigator.htm", 'div[data-box="navigator"]');
		this.box.navigator.toggle(box, "on");
		box = window.store("boxes/box-character.htm", 'div[data-box="character"]');
		this.box.character.toggle(box, "on");
		box = window.store("boxes/box-layers.htm", 'div[data-box="layers"]');
		this.box.layers.toggle(box, "on");

		// auto trigger resize event for canvas dimensions
		//this.dispatch({ event: "window.resize" });

		// auto-select initial tool
		this.els.content.find(".tools-bar .tool[data-content='move']").trigger("click");

		// bind event handlers
		this.els.content.bind("dragover drop", this.dispatch);

		// temp
		//this.dispatch({ type: "change-bg", arg: "/cdn/img/bg/wide/shoreline.jpg" });
		this.dispatch({ type: "change-bg", arg: "~/img/blue-rose.jpg" });
		//this.dispatch({ type: "change-bg", arg: "/cdn/img/bg/nature/rose.jpg" });
		//window.find('.sidebar-box div[data-content="info"]').trigger("click");
	},
	dispatch(event) {
		let Self = photoshop,
			image,
			name,
			boxEl,
			boxName,
			el;
		switch (event.type) {
			case "dragover":
				event.stopPropagation();
				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';
				break;
			case "drop":
				event.stopPropagation();
				event.preventDefault();
				
				PSD.fromEvent(event).then(function (psd) {
					var data = JSON.stringify(psd.tree().export(), undefined, 2),
						img = new Image();

					img.onload = () => {
						CTX.drawImage(img, 70, 150)
					};
					
					img.src = psd.image.toBase64();

					// document.getElementById('data').innerHTML = data;
					// document.getElementById('image').appendChild(psd.image.toPng());
				});
				break;

			case "window.open":
				break;
			case "window.resize":
				// resize canvas to maintain correct pixel ratio
				Canvas.dispatch(event);
				break;
			case "change-bg":
				image = new Image;
				image.onload = () => {
					let stack = [
							{ type: "reset-canvas" },
							{ type: "set-canvas", w: image.width, h: image.height, scale: 3 },
							// { type: "draw-base-layer", fill: "#fff" },
							// { type: "draw-base-layer", fill: "transparent" },
							{ type: "draw-image", src: image },
							// { type: "draw-rect", x: 165, y: 84, w: 269, h: 230, fill: "white" },
							// { type: "draw-rect", x: 140, y: 150, w: 200, h: 140, stroke: "blue", width: 5 },
							// { type: "draw-text", x: 70, y: 70, fill: "#fff", size: 37, font: "Helvetica", text: "Defiant" },
							{ type: "update-canvas" },
							//{ type: "pan-canvas", left: -377, top: 4 },
							{ type: "enable" },
						];
					Canvas.dispatch({ type: "load-canvas", stack });
				};
				image.src = event.arg;
				break;
			case "toggle-rulers":
				Self.els.rulers.toggleClass("hidden", event.checked === 1);
				// trigger re-calculations + re-paint
				Canvas.dispatch({ type: "window.resize" });
				break;
			case "toggle-statusbar":
				Self.els.statusBar.toggleClass("hidden", event.checked === 1);
				break;
			case "select-tool":
				el = $(event.target);
				if (el.hasClass("active") || !el.data("content")) return;
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				if (TOOLS._active) {
					// disable active tool
					TOOLS[TOOLS._active].dispatch({ type: "disable" });
				}
				if (TOOLS[el.data("content")]) {
					// enable tool
					TOOLS._active = el.data("content");
					TOOLS[TOOLS._active].dispatch({ type: "enable" });
				}

				let newOpt = window.store(`tool-options/${el.data("content")}.htm`)
					oldOpt = event.el.nextAll(".tools-options-bar").find("> div");

				oldOpt.replace(newOpt);
				break;
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active")) return;
				//console.log(event);
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
					boxEl = event.el.parents("div[data-box]");
					boxName = boxEl.attr("data-box");
					if (boxEl.length && Self.box[boxName].dispatch) {
						Self.box[boxName].dispatch(event);
					}
				}
		}
	},
	rulers: defiant.require("modules/rulers.js"),
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
