
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wheelObject = el.find(".wheel-object");
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
			shape,
			point;

		switch (event.type) {
			case "mousedown":
				// stop event from bubbling up
				event.stopPropagation();
				event.preventDefault();

				//console.log( event.offsetX, event.offsetY );
				shape = new Polygon([[38,7], [185,90], [38,171]]);

				self.triangleDown = {
					shape,
					offsetY: event.offsetY,
					offsetX: event.offsetX,
					clickY: event.clientY,
					clickX: event.clientX,
				};

				//console.log(self.triangleDown.shape.getCentroid());

				//fake trigger event
				self.triangleEvents({
					type: "mousemove",
					clientY: event.clientY,
					clientX: event.clientX,
				});

				// bind event handlers
				self.wheelObject
					.on("mousemove mouseup mouseout", self.triangleEvents);
				break;
			case "mousemove":
				point = down.shape.constrain([
					event.clientX - down.clickX + down.offsetX - 9, // left
					event.clientY - down.clickY + down.offsetY - 10, // top
				]);

				self.dot.css({
					top: point.y +"px",
					left: point.x +"px",
				});
				break;
			case "mouseout":
				if (event.target !== self.wheelObject[0]) return;
			case "mouseup":
				// unbind event handlers
				self.wheelObject
					.off("mousemove mouseup mouseout", self.triangleEvents);
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
				// prevent default behaviour
				event.preventDefault();

				dy = event.offsetY - 128;
				dx = event.offsetX - 128;
				angle = parseInt(Math.atan2(dy, dx) * (180 / Math.PI), 10);
				hue = (360 - angle) % 360;
				// calculate angle diff
				diff = ((this.cAngle || 0) - angle + 180) % 360 - 180;
				diff = diff < -180 ? diff - 360 : diff;

				speed = Math.abs(diff) * 2.5;
				angle = (this.cAngle || 0) - diff;
				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;
				this.cAngle = angle;

				self.wheelObject
					.cssSequence("fade", "transitionend", i => self.wheelObject.removeClass("fade"))
					.attr({ style });

				// bind event handlers
				self.wheel.on("mousemove mouseup mouseout", self.wheelEvents);
				self.wheelDown = true;
				break;
			case "mousemove":
				//if (!self.wheelDown) return;
				self.wheelObject.removeClass("fade");

				dy = event.offsetY - 128;
				dx = event.offsetX - 128;
				angle = parseInt(Math.atan2(dy, dx) * (180 / Math.PI), 10);
				hue = (360 - angle) % 360;
				style =  `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg);`;
				this.cAngle = angle;

				self.wheelObject.attr({ style });
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				self.wheel.off("mousemove mouseup mouseout", self.wheelEvents);
				//delete self.wheelDown;
				break;
		}
	}
}
