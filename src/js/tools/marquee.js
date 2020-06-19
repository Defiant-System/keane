
// TOOLS.marquee

{
	dispatch(event) {
		let APP = photoshop,
			Self = TOOLS.marquee,
			drag = Self.panDrag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			// native events
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
			// custom events
			case "enable":
				console.log(event.type);
				//Canvas.cvs.on("mousedown", this.pan);
				break;
			case "disable":
				console.log(event.type);
				break;
		}
	}
}
