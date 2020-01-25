
// photoshop.box.color

{
	toggle(el, state) {
		if (state === "on") {
			el.on("mousedown", ".color-wheel", this.dispatch)
		} else {
			el.off("mousedown", ".color-wheel", this.dispatch)
		}
	},
	dispatch(event) {
		console.log(event);
	}
}
