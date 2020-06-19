
// TOOLS.marquee

{
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.marquee,
			Drag = Self.drag,
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
				//Canvas.cvs.on("mousedown", this.pan);
				break;
			case "disable":
				break;
		}
	}
}
