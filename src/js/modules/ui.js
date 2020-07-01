
const UI = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("click", ".option .value", this.dispatch);
		this.content.on("mousedown", "[data-ui]", this.dispatch);

		// temp
		// setTimeout(() => {
		// 	this.content.find(".option[data-options='blend-modes'] .value").trigger("click");
		// }, 200);
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

				// position menubox
				Self.menu.css({
					top: (rect.top - window.top + rect.height + 9) +"px",
					left: (rect.left - window.left + (rect.width / 2) - (Self.menu[0].offsetWidth / 2)) +"px",
				});

				// set inital value - by associated event handler
				Self[Self.menu.data("ui")]({ type: "set-initial-value", el });

				// event handler checks for clicks outside inline-menubox
				Self.doc.on("mousedown", Self.dispatch);
				break;
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				if ($(event.target).parents(".inline-menubox").length) {
					// forward event to fitting handler
					Self[this.dataset.ui](event);
				} else {
					// clean up
					Self.srcEl = false;
					Self.menu.remove();
				}
				// unbind event handler
				Self.doc.off("mousedown", Self.dispatch);
				break;
		}
	},
	doSwatches(event) {
		let APP = photoshop,
			Self = UI,
			value,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				break;
			// custom events
			case "set-initial-value":
				// initial value
				break;
		}
	},
	doSelectbox(event) {
		let APP = photoshop,
			Self = UI,
			data,
			value,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);
				if (!el.hasClass("option")) el = el.parents(".option");
				// selected option - UI update
				el.parent().find(".selected").removeClass("selected");
				el.addClass("selected");

				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					old: Self.srcEl.find(".value").html(),
					value: el.html(),
				};
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);
				
				// update source element
				Self.srcEl.find(".value").html(el.html());
				// clean up
				Self.srcEl = false;
				Self.menu.remove();
				break;
			// custom events
			case "set-initial-value":
				// initial value
				//console.log(event);
				Self.menu.find(".option:first").addClass("selected");
				break;
		}
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
			// native events
			case "mousedown":
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
					value: Drag.newValue,
				};
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);

				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				// clean up
				Self.srcEl = false;
				Self.menu.remove();
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				value = parseInt(event.el.find(".value").text(), 10);
				Self.menu.find(".knob").data({ value });
				break;
		}
	}
};
