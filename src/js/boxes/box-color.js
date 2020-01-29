
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			// fast references
			this.wheelObject = el.find(".wheel-object");
			this.wheel = el.find(".color-wheel");
			this.shape = el.find(".color-shape");
			this.dot = el.find(".color-dot");

			this.input = {
				hue: el.find("input[name='color-hsl-hue']"),
				saturation: el.find("input[name='color-hsl-saturation']"),
				lightness: el.find("input[name='color-hsl-lightness']"),
			};

			this.el = el;

			// bind event handlers
			this.wheel.on("mousedown", this.wheelEvents)

		//	setTimeout(() => this.dispatch({
		//			type: "set-color-hsl",
		//		//	arg: "hsl(0, 100%, 100%)"
		//		//	arg: "hsl(270, 90%, 31%)"
		//			arg: "hsl(91, 100%, 100%)"
		//		}), 1000);
		} else {
			// unbind event handlers
			this.wheel.off("mousedown", this.wheelEvents)
		}
	},
	dispatch(event) {
		let root = photoshop,
			self = root.box.color,
			rx,
			values;

		switch (event.type) {
			case "set-color-hsl":
				rx = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g
				values = rx.exec(event.arg);
				if (!values) return;

				let hue = values[1],
					saturation = values[2],
					brightness = values[3],
					angle = hue,
					speed = 250;

				self.input.hue.val(hue +"°");
				self.input.saturation.val(saturation +"%");
				self.input.lightness.val(brightness +"%");


				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;

				// shape rotation
				self.wheelObject
					.cssSequence("easeTo", "transitionend", i => self.wheelObject.removeClass("easeTo"))
					.attr({ style });

				break;
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
	current: { angle: 0 },
	wheelEvents(event) {
		let root = photoshop,
			self = root.box.color,
			diff = 0,
			dx, dy,
			angle,
			style,
			speed,
			hue;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				dy = event.offsetY - 83;
				dx = event.offsetX - 83;
				
				if (Math.sqrt(dy * dy + dx * dx) <= 66) {
					// event passed to shapeEvents
					console.log(123);
					return self.shapeEvents(event);
				}

				angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
				hue = angle < 0 ? 360 + angle : angle;

				// calculate angle diff & make sure rotation is shortest distance
				diff = angle - self.current.angle;
				if (diff < -180) {
					diff = 360 + diff;
					angle = self.current.angle + diff;
				} else if (diff > 180) {
					diff = diff - 360;
					angle = self.current.angle + diff;
				}

				speed = Math.max(Math.abs(diff) * 2.5, 150);
				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;

				// save current angle
				self.current.angle = angle;

				// shape rotation
				self.wheelObject
					.cssSequence("easeTo", "transitionend", i => self.wheelObject.removeClass("easeTo"))
					.attr({ style });

				// update input field
				self.input.hue.val(hue +"°");

				// bind event handlers
				self.wheel
					.addClass("color-seek")
					.on("mousemove mouseup mouseout", self.wheelEvents);
				break;
			case "mousemove":
				self.wheelObject.removeClass("easeTo");

				dy = event.offsetY - 83;
				dx = event.offsetX - 83;
				angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
				hue = angle < 0 ? 360 + angle : angle;

				// shape rotation
				style =  `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg);`;
				self.wheelObject.attr({ style });

				// update input field
				self.input.hue.val(hue +"°");

				// save current angle
				self.current.angle = angle;
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				self.wheel
					.removeClass("color-seek")
					.off("mousemove mouseup mouseout", self.wheelEvents);
				break;
		}
	},
	shapeEvents(event) {
		let root = photoshop,
			self = root.box.color,
			down = self.shapeDown,
			offset,
			shape,
			point;

		switch (event.type) {
			case "mousedown":
				if (self.shape.hasClass("triangle")) {
					shape = new Polygon([[-16,-36], [82,17], [-16,72]]);
					offset = 67;
				} else {
					shape = new Polygon([[-6,-6], [83,-6], [83,83], [-6,83]]);
					offset = 47;
				}
				//shape.rotate(180);
				//console.log(self.shapeDown.shape.getCentroid());

				self.shapeDown = {
					shape,
					offsetY: event.offsetY - offset,
					offsetX: event.offsetX - offset,
					clickY: event.clientY,
					clickX: event.clientX,
				};

				//fake trigger event
				self.shapeEvents({
					type: "mousemove",
					clientY: event.clientY,
					clientX: event.clientX,
				});

				// bind event handlers
				self.wheel
					.addClass("color-seek")
					.on("mousemove mouseup mouseout", self.shapeEvents);
				break;
			case "mousemove":
				point = down.shape.constrain([
					event.clientX - down.clickX + down.offsetX, // left
					event.clientY - down.clickY + down.offsetY, // top
				]);

				self.dot.css({
					top: point.y +"px",
					left: point.x +"px",
				});
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				self.wheel
					.removeClass("color-seek")
					.off("mousemove mouseup mouseout", self.shapeEvents);
				break;
		}
	}
}
