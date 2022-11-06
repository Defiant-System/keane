
// keane.tools.shape

{
	init() {
		// fast references
		this.handleBox = keane.els.handleBox;

		this.boxType = {
			circle: "rectangle",
			ellipse: "rectangle",
			rect: "rectangle",
			polygon: "rectangle",
			polyline: "rectangle",
			path: "rectangle",
			image: "rectangle",
			line: "line",
			bezier: "bezier",
		};

		// defaults
		this.option = "shape";
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.tools.shape;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "shape";
				break;
			case "enable":
				// set default cursor for this tool
				APP.els.content.addClass("cursor-crosshair");
				// bind event handler
				APP.els.content.on("mousedown", ".vector-layer", Self.doMove);
				Self.handleBox.on("mousedown", Self.doResize);
				break;
			case "disable":
				// unset default cursor for this tool
				APP.els.content.removeClass("cursor-crosshair");
				// unbind event handler
				APP.els.content.off("mousedown", ".vector-layer", Self.doMove);
				Self.handleBox.off("mousedown", Self.doResize);
				break;
		}
	},
	isLine(shape) {
		let lineItem = shape.find(this.shapeTypes.join(",")),
			name = lineItem.prop("nodeName"),
			d = (name === "path") ? lineItem.attr("d").split(" ") : false,
			type = name === "line" ? "line" : "shape";
		if (d && d.length === 4) type = "line";
		return type === "line";
	},
	doMove(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let el = $(event.target);
				
				if (!el.hasClass("shape")) el = el.parents(".shape");
				if (!el.length) return Self.handleBox.removeClass("show");

				// UI update handle-box
				let names = Object.keys(Self.boxType).join(","),
					child = el.find(names).get(0),
					name = child.prop("nodeName");
				if (name === "path" && child.attr("d").split(" ").length === 4) {
					name = "bezier";
				}
				Self.handleBox.data({ type: Self.boxType[name] });

				// prepare drag object
				let Proj = Projector,
					File = Proj.file,
					oX = File.oX - Proj.aX,
					oY = File.oY - Proj.aY,
					oTop = parseInt(el.css("top"), 10),
					oLeft = parseInt(el.css("left"), 10),
					oWidth = parseInt(el.css("width"), 10),
					oHeight = parseInt(el.css("height"), 10),
					angle = el.attr("rotate") || 0,
					bEl = Self.handleBox,
					offset = {
						y: oTop - event.clientY,
						x: oLeft - event.clientX,
					};
				Self.drag = { el, bEl, offset, oX, oY };

				// show handle-box
				Self.handleBox.addClass("show").css({
					top: oY + oTop,
					left: oX + oLeft,
					width: oWidth,
					height: oHeight,
					transform: `rotate(${angle}deg)`,
				});

				// hide from layer & show SVG version
				el.addClass("transforming");
				// re-render layer
				File.activeLayer.renderShapes({ noEmit: true });

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				UI.doc.on("mousemove mouseup", Self.doMove);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.el.css({ top, left });

				top += Drag.oY;
				left += Drag.oX;
				Drag.bEl.css({ top, left });
				break;
			case "mouseup":
				// re-render layer
				Projector.file.activeLayer.renderShapes({ all: true });
				// uncover app UI
				APP.els.content.removeClass("cover");
				// unbind event handler
				UI.doc.off("mousemove mouseup", Self.doMove);
				break;
		}
	},
	doResize(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prepare values
				let el = Self.handleBox,
					type = event.target.className.split(" ")[1],
					min = {
						w: 50,
						h: 50,
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					offset = {
						x: parseInt(el.css("left"), 10),
						y: parseInt(el.css("top"), 10),
						w: parseInt(el.css("width"), 10),
						h: parseInt(el.css("height"), 10),
						// rx: +shape.attr("rx"),
					};
				// create drag object
				Self.drag = {
					el,
					type,
					min,
					click,
					offset,
					_min: Math.min,
				};
				// cover layout
				APP.els.content.addClass("cover");
				// bind event
				UI.doc.on("mousemove mouseup", Self.doResize);
				break;
			case "mousemove":
				let dim = {
						width: Drag.offset.w,
						height: Drag.offset.h,
					};
				// movement: north
				if (Drag.type.includes("n")) {
					dim.top = event.clientY - Drag.click.y + Drag.offset.y;
					dim.height = Drag.offset.h + Drag.click.y - event.clientY;
				}
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: south
				if (Drag.type.includes("s")) {
					dim.height = event.clientY - Drag.click.y + Drag.offset.h;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}
				// apply new dimensions to element
				if (dim.width < Drag.min.w) dim.width = Drag.min.w;
				if (dim.height < Drag.min.h) dim.height = Drag.min.h;
				Drag.el.css(dim);
				break;
			case "mouseup":
				// uncover layout
				APP.els.content.removeClass("cover");
				// unbind event
				UI.doc.off("mousemove mouseup", Self.doResize);
				break;
		}
	}
}
