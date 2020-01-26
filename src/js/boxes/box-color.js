
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wrapper = el.find(".wheel-object");
			this.wheel = el.find(".color-wheel");
			this.triangle = el.find(".color-triangle");

			// bind event handlers
			this.wheel.on("mousedown", this.dispatch)
		} else {

			// unbind event handlers
			this.wheel.off("mousedown", this.dispatch)
		}
	},
	dispatch(event) {
		let root = photoshop,
			self = root.box.color,
			dx,
			dy,
			angle,
			hue;
		switch (event.type) {
			case "mousedown":
				self.down = true;
				self.wheel.on("mousemove mouseup", self.dispatch)
				break;
			case "mousemove":
				if (!self.down) return;

				dy = event.offsetY - 128;
				dx = event.offsetX - 128;
				angle = parseInt(Math.atan2(dy, dx) * (180 / Math.PI), 10);
				hue = (-angle - 39);

				self.wrapper.attr({
					style: `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg);`
				});
				break;
			case "mouseup":
				delete self.down;
				self.wheel.off("mousemove mouseup", self.dispatch)
				break;
		}
	}
}
