
// keane.tools.shape

{
	init() {
		// fast references
		this.handleBox = keane.els.handleBox;
		// handle-box types
		this.boxType = {
			circle: "box",
			ellipse: "box",
			rect: "rectangle",
			polygon: "box",
			polyline: "line",
			path: "box",
			image: "box",
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
			case "focus-shape-gradient":
				// UI update handle-box
				let names = Object.keys(Self.boxType).join(","),
					child = event.el.find(names).get(0),
					name = child.prop("nodeName"),
					type = Self.boxType[name],
					cn = ["show"],
					radius = +child.attr("rx"),
					angle = event.el.attr("rotate") || 0,
					css = {
						top: event.oTop,
						left: event.oLeft,
						width: event.oWidth,
						height: event.oHeight,
						transform: `rotate(${angle}deg)`,
						"--rc": `${radius-4}px`,
					};
				// this is temp solution
				if (name === "path" && child.attr("d").split(" ").length === 4) {
					name = "bezier";
				}
				// reference to selected shape
				Self.svgItem = event.el;
				Self.shape = child;

				// shape has gradient
				let fill = Self.shape.css("fill"),
					stroke = Self.shape.css("stroke");

				console.log( "fill color", fill );
				console.log( "stroke color", stroke );
				
				
				if (fill.startsWith("url(")) {
					let xNode = event.el.find(fill.slice(5,-2)),
						gradientType = xNode.prop("nodeName"),
						top, left, width,
						dx, dy;
					switch (gradientType) {
						case "radialGradient":
							top = (+xNode.attr("cy") * event.oHeight) + 1;
							left = (+xNode.attr("cx") * event.oWidth) + 1;
							width = +xNode.attr("r") * event.oWidth;
							angle = 45;
							break;
						case "linearGradient":
							top = ((+xNode.attr("y1") || 0) * event.oHeight) + 1;
							left = ((+xNode.attr("x1") || 0) * event.oWidth) + 1;
							dy = (+xNode.attr("y2") * event.oHeight) - top + 1;
							dx = (+xNode.attr("x2") * event.oWidth) - left + 1;
							width = Math.round(Math.sqrt(dx*dx + dy*dy));
							angle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
							break;
					}
					css["--g-top"] = `${top}px`;
					css["--g-left"] = `${left}px`;
					css["--g-width"] = `${width}px`;
					css["--g-angle"] = `${angle}deg`;
					// add to class names
					cn.push("has-gradient");
				} else {
					// console.log( "fill color", ColorLib.rgbToHex(fill) );
				}

				// show handle-box
				Self.handleBox
					.removeClass("has-gradient")
					.addClass(cn.join(" "))
					.data({ type })
					.css(css);
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
	doMove(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let el = $(event.target);
				// reset reference
				Self.svgItem = undefined;
				Self.shape = undefined;
				
				if (!el.hasClass("shape")) el = el.parents(".shape");
				if (!el.length) return Self.handleBox.removeClass("show");

				// prepare drag object
				let Proj = Projector,
					File = Proj.file,
					oX = File.oX - Proj.aX,
					oY = File.oY - Proj.aY,
					oTop = parseInt(el.css("top"), 10),
					oLeft = parseInt(el.css("left"), 10),
					bEl = Self.handleBox,
					offset = {
						y: oTop - event.clientY,
						x: oLeft - event.clientX,
					};
				Self.drag = { el, bEl, offset, oX, oY };

				Self.dispatch({
					type: "focus-shape-gradient",
					oTop: oY + oTop,
					oLeft: oX + oLeft,
					oWidth: parseInt(el.css("width"), 10),
					oHeight: parseInt(el.css("height"), 10),
					el,
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
	doRadius(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				let File = Projector.file,
					el = $(event.target),
					pEl = el.parent(),
					type = el.prop("className").split(" ")[2],
					shape = Self.shape,
					[t, l, vW, vH] = Self.svgItem.attr("viewBox").split(" "),
					offset = {
						l: +el.prop("offsetLeft"),
						t: +el.prop("offsetTop"),
						x: parseInt(shape.css("x"), 10),
						w: parseInt(shape.css("width"), 10),
						h: parseInt(shape.css("height"), 10),
					},
					ratio = offset.w / offset.h,
					origo = {
						x: vW >> 1,
						y: vH >> 1,
						r: (Math.min(offset.w, offset.h) >> 1),
					};
				// calculate origo for handles
				if (ratio != 1) {
					switch (type) {
						case "ne":
							origo.x = ratio > 1 ? vH >> 1 : origo.x;
							origo.y = ratio < 1 ? vW >> 1 : origo.y;
							break;
						case "nw":
							origo.x = ratio > 1 ? vW - (vH >> 1) : origo.x;
							origo.y = ratio < 1 ? vW >> 1 : origo.y;
							break;
						case "sw":
							origo.x = ratio > 1 ? vW - (vH >> 1) : origo.x;
							origo.y = ratio < 1 ? vH - (vW >> 1) : origo.y;
							break;
						case "se":
							origo.x = ratio > 1 ? vH >> 1 : origo.x;
							origo.y = ratio < 1 ? vH - (vW >> 1) : origo.y;
							break;
					}
				}
				// create drag object
				Self.drag = {
					el,
					pEl,
					shape,
					type,
					origo,
					offset,
					click: {
						x: event.clientX - offset.l,
						y: event.clientY - offset.t,
					},
					getRadius(x, y) {
						let min = Math.min,
							o = this.origo,
							v;
						switch (this.type) {
							case "ne": v = min(o.y-y, o.x-x, o.r); break;
							case "nw": v = min(o.y-y, x-o.x, o.r); break;
							case "sw": v = min(y-o.y, x-o.x, o.r); break;
							case "se": v = min(y-o.y, o.x-x, o.r); break;
						}
						return min(Math.max(o.r-v, 0), o.r);
					},
				};

				// hide from layer & show SVG version
				Self.svgItem.addClass("transforming");
				// re-render layer
				File.activeLayer.renderShapes({ noEmit: true });

				// cover layout
				APP.els.content.addClass("cover no-cursor");
				// bind event
				UI.doc.on("mousemove mouseup", Self.doRadius);
				break;
			case "mousemove":
				let x = event.clientX - Drag.click.x,
					y = event.clientY - Drag.click.y,
					rx = Drag.getRadius(x, y);
				Drag.pEl.css({ "--rc": (rx-4) +"px" });
				Drag.shape.attr({ rx: rx });
				break;
			case "mouseup":
				// re-render layer
				Projector.file.activeLayer.renderShapes({ all: true });
				// uncover layout
				APP.els.content.removeClass("cover no-cursor");
				// unbind event
				UI.doc.off("mousemove mouseup", Self.doRadius);
				break;
		}
	},
	doRotate(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	},
	doGradient(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	},
	doResize(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let el = $(event.target);
				// proxy event, if needed
				if (el.hasClass("rc")) return Self.doRadius(event);
				if (el.hasClass("rot")) return Self.doRotate(event);

				// prepare values
				let bEl = Self.handleBox,
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
						x: parseInt(bEl.css("left"), 10),
						y: parseInt(bEl.css("top"), 10),
						w: parseInt(bEl.css("width"), 10),
						h: parseInt(bEl.css("height"), 10),
						// rx: +shape.attr("rx"),
					};
				// create drag object
				Self.drag = {
					bEl,
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
				Drag.bEl.css(dim);
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
