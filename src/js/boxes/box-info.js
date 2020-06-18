
// photoshop.box.info

{
	els: {},
	toggle(root, state) {
		if (state === "on") {
			this.els.hslH = root.find("input[name='hslH']");
			this.els.hslS = root.find("input[name='hslS']");
			this.els.hslL = root.find("input[name='hslL']");

			this.els.rgbR = root.find("input[name='rgbR']");
			this.els.rgbG = root.find("input[name='rgbG']");
			this.els.rgbB = root.find("input[name='rgbB']");

			this.els.mouseX = root.find("input[name='mouseX']");
			this.els.mouseY = root.find("input[name='mouseY']");

			this.els.selHeight = root.find("input[name='selHeight']");
			this.els.selWidth = root.find("input[name='selWidth']");

			// bind event handlers
			
		} else {

			// clean up
			delete this.els;
			this.els = {};
		}
	},
	dispatch(event) {
		let APP = photoshop,
			Self = APP.box.info;

		switch (event.type) {
			case "type-of-event":
				break;
		}
	}
}
