
const photoshop = {
	init() {
		// fast references
		this.content = window.find("content");
		this.canvas = window.find(".canvas");
		this.boxNavigator = window.find(".navigator-wrapper");
		this.zoomSlider = window.find(".zoom-slider input");

		// auto store 'box-characters.htm'
		window.store("box-navigator.htm", 'div[data-box="navigator"]');
		window.store("box-characters.htm", 'div[data-box="characters"]');
		window.store("box-layers.htm", 'div[data-box="layers"]');

		// bind event handlers
		this.zoomSlider.on("input", this.dispatch);

		// temp
		this.zoomSlider.val(235).trigger("input");
		window.find('[data-content="box-colors.htm"]').trigger("click");

		//this.box.color.init();
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
				
				name = oldBox.data("box");
				if (this.box[name]) this.box[name].toggle("off");


				oldBox.replace(newBox);

				name = newBox.data("box");
				if (this.box[name]) this.box[name].toggle("on");
				break;
		}
	},
	box: {
		navigator: require("modules/box-navigator.js"),
		colors: require("modules/box-colors.js")
	}
};

window.exports = photoshop;
