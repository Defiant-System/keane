
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wrapper = el.find(".wheel-object");
			this.wheel = el.find(".color-wheel");
			this.triangle = el.find(".color-triangle");
			this.dot = el.find(".color-dot");

			// bind event handlers
			this.wheel.on("mousedown", this.wheelEvents)
			this.triangle.on("mousedown", this.triangleEvents)
		} else {
			// unbind event handlers
			this.wheel.off("mousedown", this.wheelEvents)
			this.triangle.off("mousedown", this.triangleEvents)
		}
	},
	triangleEvents(event) {
		let root = photoshop,
			self = root.box.color,
			down = self.triangleDown,
			top,
			left;

		switch (event.type) {
			case "mousedown":
				// stop event from bubbling up
				event.stopPropagation();

				self.triangleDown = {
					offsetY: self.wrapper[0].offsetTop + 20,
					offsetX: self.wrapper[0].offsetLeft + 22,
					clickY: event.clientY,
					clickX: event.clientX,
				};

				self.dot.css({
					top: (event.offsetY + 20) +"px",
					left: (event.offsetX + 22) +"px",
				});

				// bind event handlers
				self.triangle.on("mousemove mouseup mouseout", self.triangleEvents)
				break;
			case "mousemove":
				top = event.clientY - down.clickY + event.offsetY;
				left = event.clientX - down.clickX + event.offsetX;

				self.dot.css({
					top: top +"px",
					left: left +"px",
				});
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				self.triangle.off("mousemove mouseup mouseout", self.triangleEvents)
				break;
		}
	},
	wheelEvents(event) {
		let root = photoshop,
			self = root.box.color,
			dx, dy,
			style,
			speed,
			angle,
			diff,
			hue;
		switch (event.type) {
			case "mousedown":
				dy = event.offsetY - 128;
				dx = event.offsetX - 128;
				angle = parseInt(Math.atan2(dy, dx) * (180 / Math.PI), 10);
				hue = (360 - angle) % 360;
				// calculate angle diff
				diff = ((this.cAngle || 0) - angle + 180) % 360 - 180;
				diff = diff < -180 ? diff - 180 : diff;

				speed = Math.abs(diff) * 2.5;
				angle = (this.cAngle || 0) - diff;
				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;
				this.cAngle = angle;

				self.wrapper
					.cssSequence("fade", "transitionend", i => self.wrapper.removeClass("fade"))
					.attr({ style });

				// bind event handlers
				self.wheel.on("mousemove mouseup mouseout", self.wheelEvents)
				self.wheelDown = true;
				break;
			case "mousemove":
				//if (!self.wheelDown) return;
				self.wrapper.removeClass("fade");

				dy = event.offsetY - 128;
				dx = event.offsetX - 128;
				angle = parseInt(Math.atan2(dy, dx) * (180 / Math.PI), 10);
				hue = (360 - angle) % 360;
				style =  `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg);`;
				this.cAngle = angle;

				self.wrapper.attr({ style });
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				self.wheel.off("mousemove mouseup mouseout", self.wheelEvents)
				//delete self.wheelDown;
				break;
		}
	}
}
