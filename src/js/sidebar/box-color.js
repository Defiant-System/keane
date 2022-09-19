
// keane.sidebar.color

{
	els: {},
	dispatch(event) {
		let APP = keane,
			Self = APP.sidebar.color,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "show-color-values":
				console.log(event);
				break;
			case "color-wheel-shape":
				break;
		}
	}
}
