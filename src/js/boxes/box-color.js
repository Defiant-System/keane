
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wrapper = el.find(".wheel-object");
			this.wheel = el.find(".color-wheel");
			this.triangle = el.find(".color-triangle");

			// bind event handlers
			this.triangle.on("mousedown", this.dispatch)
		} else {

			// unbind event handlers
			this.triangle.off("mousedown", this.dispatch)
		}
	},
	dispatch(event) {
		let root = photoshop,
			self = root.box.color;
		switch (event.type) {
			case "mousedown":
				console.log(event);
				break;
		}
	}
}
