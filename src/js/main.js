
const photoshop = {
	init() {
		// fast references
		this.canvas = window.find(".canvas");
		this.boxNavigator = window.find(".navigator-wrapper");

		// auto store box HTML
		window.store("tool-options/marquee.htm", '.tool-options-marquee');

		let box = window.store("boxes/box-navigator.htm", 'div[data-box="navigator"]');
		this.box.navigator.toggle(box, "on");
		box = window.store("boxes/box-character.htm", 'div[data-box="character"]');
		this.box.character.toggle(box, "on");
		box = window.store("boxes/box-layers.htm", 'div[data-box="layers"]');
		this.box.layers.toggle(box, "on");


		// temp
		window.find(".zoom-slider input").val(235).trigger("input");
		window.find('[data-content="color"]').trigger("click");
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
		navigator: require("boxes/box-navigator.js"),
		color: require("boxes/box-color.js"),
		info: require("boxes/box-info.js"),
		character: require("boxes/box-character.js"),
		swatches: require("boxes/box-swatches.js"),
		paragraph: require("boxes/box-paragraph.js"),
		layers: require("boxes/box-layers.js"),
		channels: require("boxes/box-channels.js"),
		paths: require("boxes/box-paths.js")
	}
};

require("polygon.js")

window.exports = photoshop;
