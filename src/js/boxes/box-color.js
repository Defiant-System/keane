
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

		//	setTimeout(() => this.dispatch({
		//			type: "set-color-hsl",
		//		//	arg: "hsl(0, 100%, 100%)"
		//		//	arg: "hsl(270, 90%, 31%)"
		//			arg: "hsl(91, 100%, 100%)"
		//		}), 1000);
		} else {
			// unbind event handlers
			this.wheel.off("mousedown", this.wheelEvents)
			//this.shape.off("mousedown", this.shapeEvents)
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

				self.el.find("input[name='color-hsl-hue']").val(hue +"°");
				self.el.find("input[name='color-hsl-saturation']").val(saturation +"%");
				self.el.find("input[name='color-hsl-lightness']").val(brightness +"%");


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
				
				if (Math.sqrt(dy * dy + dx * dx) <= 66) return; // event passed to shapeEvents

				angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
				hue = angle < 0 ? 360 + angle : angle;

				speed = 200; //Math.max(Math.abs(diff) * 2.5, 200);
				style = `--color: hsl(${hue}, 100%, 50%); --rotation: rotate(${angle}deg); --speed: ${speed}ms;`;

				// shape rotation
				self.wheelObject
					.cssSequence("easeTo", "transitionend", i => self.wheelObject.removeClass("easeTo"))
					.attr({ style });

				self.el.find("input[name='color-hsl-hue']").val(hue +"°");
				break;
			case "mousemove":
				break;
			case "mouseout":
			case "mouseup":
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
	}
}
