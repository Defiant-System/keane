
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
		let APP = photoshop,
			Self = APP.box.color,
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

				Self.input.hue.val(hue +"°");
				Self.input.saturation.val(saturation +"%");
				Self.input.lightness.val(brightness +"%");


				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;

				// shape rotation
				Self.wheelObject
					.cssSequence("easeTo", "transitionend", i => Self.wheelObject.removeClass("easeTo"))
					.attr({ style });

				break;
			case "show-color-values":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				Self.el.find(".color-values")
					.removeClass("show-hsl show-rgb")
					.addClass("show-"+ event.arg);
				break;
			case "color-wheel-shape":
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				Self.el.find(".color-wheel .color-shape")
					.removeClass("triangle rectangle")
					.addClass(event.arg);
				break;
		}
	},
	current: { angle: 0 },
	wheelEvents(event) {
		let APP = photoshop,
			Self = APP.box.color,
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
					return Self.shapeEvents(event);
				}

				angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
				hue = angle < 0 ? 360 + angle : angle;

				// calculate angle diff & make sure rotation is shortest distance
				diff = angle - Self.current.angle;
				if (diff < -180) {
					diff = 360 + diff;
					angle = Self.current.angle + diff;
				} else if (diff > 180) {
					diff = diff - 360;
					angle = Self.current.angle + diff;
				}

				speed = Math.max(Math.abs(diff) * 2.5, 150);
				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;

				// save current angle
				Self.current.angle = angle;

				// shape rotation
				Self.wheelObject
					.cssSequence("easeTo", "transitionend", i => Self.wheelObject.removeClass("easeTo"))
					.attr({ style });

				// update input field
				Self.input.hue.val(hue +"°");

				// bind event handlers
				Self.wheel
					.addClass("color-seek")
					.on("mousemove mouseup mouseout", Self.wheelEvents);
				break;
			case "mousemove":
				Self.wheelObject.removeClass("easeTo");

				dy = event.offsetY - 83;
				dx = event.offsetX - 83;
				angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
				hue = angle < 0 ? 360 + angle : angle;

				// shape rotation
				style =  `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg);`;
				Self.wheelObject.attr({ style });

				// update input field
				Self.input.hue.val(hue +"°");

				// save current angle
				Self.current.angle = angle;
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				Self.wheel
					.removeClass("color-seek")
					.off("mousemove mouseup mouseout", Self.wheelEvents);
				break;
		}
	},
	shapeEvents(event) {
		let APP = photoshop,
			Self = APP.box.color,
			down = Self.shapeDown,
			shape,
			point;

		switch (event.type) {
			case "mousedown":
				if (Self.shape.hasClass("triangle")) {
					shape = new Polygon([[42,22], [141,76], [42,130]]);
					shape.rotate(0);
				} else {
					shape = new Polygon([[32,32], [121,32], [121,121], [32,121]]);
				}
				//console.log(Self.shapeDown.shape.getCentroid());

				Self.shapeDown = {
					shape,
					offsetY: event.offsetY - 8,
					offsetX: event.offsetX - 7,
					clickY: event.clientY,
					clickX: event.clientX,
				};

				//fake trigger event
				Self.shapeEvents({
					type: "mousemove",
					clientY: event.clientY,
					clientX: event.clientX,
				});

				// bind event handlers
				Self.wheel
					.addClass("color-seek")
					.on("mousemove mouseup mouseout", Self.shapeEvents);
				break;
			case "mousemove":
				point = down.shape.constrain([
					event.clientX - down.clickX + down.offsetX, // left
					event.clientY - down.clickY + down.offsetY, // top
				]);

				// point = {
				// 	x: event.clientX - down.clickX + down.offsetX, // left
				// 	y: event.clientY - down.clickY + down.offsetY, // top
				// };

				Self.dot.css({
					top: point.y +"px",
					left: point.x +"px",
				});
				break;
			case "mouseout":
			case "mouseup":
				// unbind event handlers
				Self.wheel
					.removeClass("color-seek")
					.off("mousemove mouseup mouseout", Self.shapeEvents);
				break;
		}
	}
}
