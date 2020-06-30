
const UI = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("click", ".option .value", this.dispatch);
		this.content.on("mousedown", "[data-ui]", this.dispatch);
	},
	dispatch(event) {
		let APP = photoshop,
			Self = UI,
			data,
			value,
			menu,
			min,
			max,
			unit,
			rect,
			el;
		//console.log(event);
		switch (event.type) {
			case "click":
				el = $(this.parentNode);
				if (!el.data("options")) return;

				// save reference to source element
				Self.srcEl = el;

				rect = this.getBoundingClientRect();
				data = {
					template: el.data("options"),
					append: Self.content
				};
				// add xpath match
				if (el.data("match")) data.match = el.data("match");

				// render menubox
				Self.menu = window.render(data);

				// initial value of knob
				value = parseInt(el.find(".value").text(), 10);
				Self.menu.find(".knob").data({ value });

				// position menubox
				Self.menu.css({
					top: (rect.top - window.top + rect.height + 9) +"px",
					left: (rect.left - window.left + (rect.width / 2) - (Self.menu[0].offsetWidth / 2)) +"px",
				});
				break;
			case "mousedown":
				Self[this.dataset.ui](event);
				break;
		}
	},
	doSwatches(event) {

	},
	doBlendModes(event) {

	},
	doKnob(event) {
		let APP = photoshop,
			Self = UI,
			Drag = Self.drag,
			_round = Math.round,
			_min = Math.min,
			_max = Math.max,
			data,
			value,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				el = $(event.target);
				value = +el.data("value");

				Self.drag = {
					el,
					value,
					src: Self.srcEl.find(".value"),
					unit: Self.srcEl.data("unit") || "",
					min: +Self.srcEl.data("min"),
					max: +Self.srcEl.data("max"),
					clientY: event.clientY,
					clientX: event.clientX,
				};
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				value = ((Drag.clientY - event.clientY)) + Drag.value;
				value = _min(_max(value, 0), 100);
				Drag.el.data({ value });

				Drag.newValue = Drag.min + _round((value / 100) * (Drag.max - Drag.min));
				Drag.src.html(Drag.newValue + Drag.unit);
				break;
			case "mouseup":
				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					old: Drag.value,
					new: Drag.newValue,
				};
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);

				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);

				Self.srcEl = false;
				Self.menu.remove();
				break;
		}
	}
};
