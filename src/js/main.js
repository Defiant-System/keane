
defiant.require("canvas.js")
defiant.require("polygon.js")

//requ2ire("modules/psd.js")

const photoshop = {
	init() {
		// fast references
		this.boxNavigator = window.find(".navigator-wrapper");
		this.canvas = window.find(".canvas");

		// auto trigger resize event for canvas dimensions
		this.dispatch({ event: "window.resize" });

		// auto store box HTML
		window.store("tool-options/marquee.htm", '.tool-options-marquee');

		let box = window.store("boxes/box-navigator.htm", 'div[data-box="navigator"]');
		this.box.navigator.toggle(box, "on");
		box = window.store("boxes/box-character.htm", 'div[data-box="character"]');
		this.box.character.toggle(box, "on");
		box = window.store("boxes/box-layers.htm", 'div[data-box="layers"]');
		this.box.layers.toggle(box, "on");

		// temp
		//window.find(".zoom-slider input").val(235).trigger("input");
		//window.find('[data-content="color"]').trigger("click");
		//window.find('.tool[data-content="brush"]').trigger("click");
	},
	dispatch(event) {
		let self = photoshop,
			name,
			boxEl,
			boxName,
			el;
		switch (event.type) {
			case "window.open":
				break;
			case "window.resize":
				// resize canvas to maintain correct pixel ratio
				self.canvas.prop({
					width: window.width,
					height: window.height,
				});
				break;
			case "change-bg":
				self.canvas.css({"background-image": `url('/cdn/img/bg/${event.arg}.jpg')`});
				self.boxNavigator.css({"background-image": `url('/cdn/img/bg/${event.arg}.jpg')`});
				break;
			case "select-tool":
				el = $(event.target);
				if (el.hasClass("active") || !el.data("content")) return;

				el.parent().find(".active").removeClass("active");
				el.addClass("active");

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
					if (boxEl.length && self.box[boxName].dispatch) {
						self.box[boxName].dispatch(event);
					}
				}
		}
	},
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
