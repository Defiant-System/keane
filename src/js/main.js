
const photoshop = {
	init() {
		// fast references
		this.content = window.find("content");
		this.canvas = window.find(".canvas");
		this.boxNavigator = window.find(".navigator-wrapper");
		this.zoomSlider = window.find(".zoom-slider input");

		// auto store box HTML
		window.store("boxes/box-navigator.htm", 'div[data-box="navigator"]');
		window.store("boxes/box-character.htm", 'div[data-box="character"]');
		window.store("boxes/box-layers.htm", 'div[data-box="layers"]');

		// bind event handlers
		this.zoomSlider.on("input", this.dispatch);

		// temp
		this.zoomSlider.val(235).trigger("input");
		window.find('[data-content="boxes/box-color.htm"]').trigger("click");
	},
	dispatch(event) {
		let self = photoshop,
			name,
			el;

		switch (event.type) {
			case "input":
				let percent = this.value / 100;

				window.find(".box-foot .value").html(this.value + "%");

				self.canvas.css({
					width: (600 * percent) +"px",
					height: (366 * percent) +"px",
				});

				let width = Math.min((190 * 1.25) / percent, 190),
					height = Math.min((120 * 1.25) / percent, 120),
					top = ((120 - height) / 2),
					left = ((190 - width) / 2);

				self.boxNavigator.find(".view-rect").css({
					top: top +"px",
					left: left +"px",
					width: width +"px",
					height: height +"px",
				});
				break;
			case "change-bg":
				self.canvas.css({"background-image": `url('/cdn/img/bg/${event.arg}.jpg')`});
				self.boxNavigator.css({"background-image": `url('/cdn/img/bg/${event.arg}.jpg')`});
				break;
			case "box-head-tab":
				el = $(event.target);
				if (el.hasClass("active")) return;
				//console.log(event);
				el.parent().find(".active").removeClass("active");
				el.addClass("active");

				let newBox = window.store(el.data("content")),
					oldBox = el.parent().nextAll(".box-body").find("> div[data-box]");
				
				// notify box state = off
				this.box[oldBox.data("box")].toggle(oldBox, "off");

				// replace box body
				newBox = oldBox.replace(newBox);

				// notify box state = on
				this.box[newBox.data("box")].toggle(newBox, "on");
				break;
		}
	},
	box: {
		navigator: require("boxes/box-navigator.js"),
		color: require("boxes/box-color.js"),
		info: require("boxes/box-info.js"),
		character: require("boxes/box-character.js"),
		swatches: require("boxes/box-swatches.js"),
		paragraph: require("boxes/box-paragraph.js"),
		layers: require("boxes/box-layers.js")
	}
};

window.exports = photoshop;
