
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wheelObject = el.find(".wheel-object");
			this.wheel = el.find(".color-wheel");
			this.shape = el.find(".color-shape");
			this.dot = el.find(".color-dot");
			this.el = el;

			// bind event handlers
			this.wheel.on("mousedown", this.wheelEvents)
			//this.shape.on("mousedown", this.shapeEvents)
		} else {
			// unbind event handlers
			this.wheel.off("mousedown", this.wheelEvents)
			//this.shape.off("mousedown", this.shapeEvents)
		}
	},
	dispatch(event) {
		let root = photoshop,
			self = root.box.color;

		switch (event.type) {
			case "show-color-values":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				self.el.find(".color-values")
					.removeClass("show-hsl show-rgb")
					.addClass("show-"+ event.arg);
				break;
			case "color-wheel-shape":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				self.el.find(".color-wheel .color-shape")
					.removeClass("triangle rectangle")
					.addClass(event.arg);
				break;
		}
	},
	shapeEvents(event) {
		let root = photoshop,
			self = root.box.color,
			down = self.shapeDown,
			shape,
			point;

		switch (event.type) {
			case "mousedown":
				// stop event from bubbling up
				event.stopPropagation();
				event.preventDefault();

				//console.log( event.offsetX, event.offsetY );
				shape = new Polygon([[38,7], [185,90], [38,171]]);

				self.shapeDown = {
					shape,
					offsetY: event.offsetY,
					offsetX: event.offsetX,
					clickY: event.clientY,
					clickX: event.clientX,
				};

				//console.log(self.shapeDown.shape.getCentroid());

				//fake trigger event
				self.shapeEvents({
					type: "mousemove",
					clientY: event.clientY,
					clientX: event.clientX,
				});

				// bind event handlers
				self.wheelObject
					.on("mousemove mouseup mouseout", self.shapeEvents);
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
					.off("mousemove mouseup mouseout", self.shapeEvents);
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

				dy = event.offsetY - 83;
				dx = event.offsetX - 83;
				angle = parseInt(Math.atan2(dy, dx) * (180 / Math.PI), 10);
				hue = (360 - angle) % 360;

				// return console.log(hue);

				// // calculate angle diff
				// diff = ((this.cAngle || 0) - angle + 180) % 360 - 180;
				// diff = diff < -180 ? diff - 180 : diff;

				// speed = Math.abs(diff) * 2.5;
				// angle = (this.cAngle || 0) - diff;
				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;
				this.cAngle = angle;

				self.wheelObject
					.cssSequence("fade", "transitionend", i => self.wheelObject.removeClass("fade"))
					.attr({ style });

				break;
			case "mousemove":
				break;
			case "mouseout":
			case "mouseup":
				break;
		}
	}
}
