
// keane.tools.shape

{
	init() {
		// fast references
		this.rootEl = window.find(`.tool-options-shape`);
		this.handleBox = keane.els.handleBox;
		// handle-box types
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.shapes = "circle ellipse rect polygon polyline path image line bezier".split(" ");
		// defaults
		this.option = "shape";
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.shape,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "shape";
				break;
			case "re-focus-shape":
				el = Self.svgItem;
				Self.dispatch({
					type: "focus-shape",
					oTop: File.oY - Proj.aY + parseInt(el.css("top"), 10),
					oLeft: File.oX - Proj.aX + parseInt(el.css("left"), 10),
					oWidth: parseInt(el.css("width"), 10),
					oHeight: parseInt(el.css("height"), 10),
					el,
				});
				break;
			case "focus-shape":
				// UI update handle-box
				let names = Self.shapes.join(","),
					child = event.el.find(names).get(0),
					name = child.prop("nodeName"),
					cn = ["show"],
					radius = +child.attr("rx"),
					angle = event.el.attr("rotate") || 0,
					css = {
						top: event.oTop,
						left: event.oLeft,
						width: event.oWidth,
						height: event.oHeight,
						"--rotate": `${angle}deg`,
						"--rc": `${radius-4}px`,
					};
				// this is temp solution
				// if (name === "path" && child.attr("d").split(" ").length === 4) {
				// 	name = "bezier";
				// }

				// reference to selected shape
				Self.svgItem = event.el;
				Self.shape = child;
				Self.shapeName = name;

				// shape has gradient
				let fill = Self.shape.css("fill"),
					stroke = Self.shape.css("stroke");
				if (fill === "none") fill = "rgba(0,0,0,0)";
				if (stroke === "none") stroke = "rgba(0,0,0,0)";
				
				if (fill.startsWith("url(")) {
					let xNode = event.el.find(fill.slice(5,-2)),
						gradientType = xNode.prop("nodeName"),
						top, left, width,
						dx, dy,
						angle;
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

					fill = ColorLib.gradientToStrip(xNode);
				} else {
					fill = ColorLib.rgbToHex(fill);
				}
				// update tool options bar
				Self.dispatch({
					type: "update-tool-options",
					strokeWidth: +child.attr("stroke-width"),
					fill,
					stroke,
					angle,
					radius,
					css,
				});
				// show handle-box
				Self.handleBox
					.removeClass("has-gradient")
					.addClass(cn.join(" "))
					.data({ type: name === "rect" ? "rect" : "box" })
					.css(css);
				break;
			case "update-tool-options":
				Self.rootEl.find(".fill-color").css({ "--color": event.fill });
				Self.rootEl.find(".stroke-color").css({ "--color": event.stroke });
				// stroke width
				el = Self.rootEl.find(`.option[data-arg="stroke-width"]`);
				el.find(`.value`).html(`${event.strokeWidth}${el.data("suffix")}`);

				el = Self.rootEl.find(".shape-width");
				el.html(`${event.css.width}${el.data("suffix")}`);

				el = Self.rootEl.find(".shape-height");
				el.html(`${event.css.height}${el.data("suffix")}`);

				el = Self.rootEl.find(".shape-rotation");
				el.html(`${event.angle}${el.data("suffix")}`);

				el = Self.rootEl.find(".shape-radius");
				el.html(`${event.radius}${el.data("suffix")}`);
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
					oHeight = parseInt(el.css("height"), 10),
					oWidth = parseInt(el.css("width"), 10),
					bEl = Self.handleBox.addClass("hide"),
					offset = {
						y: oTop - event.clientY,
						x: oLeft - event.clientX,
					},
					guides = new Guides({
						offset: {
							el: el[0],
							w: oWidth,
							h: oHeight,
							coY: oY,
							coX: oX,
						},
						gl: {
							h: File.rulers.guides.horizontal,
							v: File.rulers.guides.vertical,
						},
					});
				// drag object
				Self.drag = { el, bEl, offset, oX, oY, guides };

				// trigger focus event
				Self.dispatch({
					type: "focus-shape",
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
				let pos = {
						top: event.clientY + Drag.offset.y,
						left: event.clientX + Drag.offset.x,
					};
				// "filter" position with guide lines
				Drag.guides.snapPos(pos);
				// move dragged object
				Drag.el.css(pos);

				// move "handle-box"
				pos.top += Drag.oY;
				pos.left += Drag.oX;
				Drag.bEl.css(pos);
				break;
			case "mouseup":
				// hide guides
				Drag.guides.reset();
				// show handle-box
				Self.handleBox.removeClass("hide");
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
				// hide handle-box while changing radius
				Self.handleBox.addClass("focus-radius");
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
				// unhide handle-box while changing radius
				Self.handleBox.removeClass("focus-radius");
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
				// prepare values
				let el = Self.svgItem,
					bEl = Self.handleBox.addClass("hide"),
					type = event.target.className.split(" ")[1],
					angle = parseInt(bEl.cssProp("--rotate"), 10) + event.clientY;
				// create drag object
				Self.drag = {
					el,
					bEl,
					type,
					angle,
				};

				// hide from layer & show SVG version
				Self.svgItem.addClass("transforming");
				// re-render layer
				Projector.file.activeLayer.renderShapes({ noEmit: true });
				// cover layout
				APP.els.content.addClass("cover no-cursor");
				// bind event
				UI.doc.on("mousemove mouseup", Self.doRotate);
				break;
			case "mousemove":
				let rotate = event.clientY - Drag.angle;
				Drag.el.css({ "--rotate": `${rotate}deg` });
				break;
			case "mouseup":
				// reset handle-box
				Drag.bEl.removeClass("hide");
				// re-render layer
				Projector.file.activeLayer.renderShapes({ all: true });
				// uncover layout
				APP.els.content.removeClass("cover no-cursor");
				// unbind event
				UI.doc.off("mousemove mouseup", Self.doRotate);
				break;
		}
	},
	doGradient(event) {
		let APP = keane,
			Self = APP.tools.shape,
			Drag = Self.drag,
			Gradient = Self.gradient;
		switch (event.type) {
			case "mousedown":
				let el = $(event.target).parent(),
					type = event.target.className.split(" ")[1],
					[a, b] = el.css("transform").split("(")[1].split(")")[0].split(","),
					rad = Math.atan2(a, b),
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					r = +el.prop("offsetWidth"),
					width = parseInt(Self.shape.css("width"), 10),
					height = parseInt(Self.shape.css("height"), 10);
				// create drag object
				Self.drag = {
					el,
					type,
					origo: { x, y, r },
					click: {
						x: event.clientX,
						y: event.clientY,
					},
					offset: {
						width,
						height,
						y: y + r * Math.cos(rad),
						x: x + r * Math.sin(rad),
					},
					_round: Math.round,
					_sqrt: Math.sqrt,
					_atan2: Math.atan2,
					_PI: 180 / Math.PI,
				};
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover no-cursor");
				// bind event handlers
				UI.doc.on("mousemove mouseup", Self.doGradient);
				break;
			case "mousemove":
				if (Drag.type === "p1") {
					let dY = event.clientY - Drag.click.y,
						dX = event.clientX - Drag.click.x,
						top = dY + Drag.origo.y,
						left = dX + Drag.origo.x,
						y2 = dY + Drag.offset.y,
						x2 = dX + Drag.offset.x,
						oW = Drag.offset.width,
						oH = Drag.offset.height;
					Drag.el.css({ top, left });
					// UI change gradient
					// Gradient.moveP1(left/oW, top/oH, x2/oW, y2/oH);
				} else {
					// rotate
					let y = event.clientY - Drag.click.y + Drag.offset.y - Drag.origo.y,
						x = event.clientX - Drag.click.x + Drag.offset.x - Drag.origo.x,
						deg = Drag._round(Drag._atan2(y, x) * Drag._PI),
						width = Drag._sqrt(y*y + x*x),
						oW = Drag.offset.width,
						oH = Drag.offset.height;
					if (deg < 0) deg += 360;
					Drag.el.css({ width, transform: `rotate(${deg}deg)` });
					// UI change gradient
					// Gradient.moveP2((Drag.origo.x+x)/oW, (Drag.origo.y+y)/oH, width/oW);
				}
				break;
			case "mouseup":
				// uncover app UI
				APP.els.content.removeClass("cover no-cursor");
				// unbind event handler
				UI.doc.off("mousemove mouseup", Self.doGradient);
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

				let hEl = $(event.target);
				// proxy event, if needed
				if (hEl.hasClass("rc")) return Self.doRadius(event);
				if (hEl.hasClass("rot")) return Self.doRotate(event);
				if (hEl.parent().hasClass("gradient-tool")) return Self.doGradient(event);

				// prepare values
				let el = Self.svgItem,
					bEl = Self.handleBox.addClass("hide"),
					type = event.target.className.split(" ")[1],
					min = {
						w: 15,
						h: 15,
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
					},
					points = Self.shape.attr("points");
				// process points, if any
				if (points) {
					points = points.replace(/, /g, ",")
									.replace(/\t|\n/g, "")
									.split(" ").map(p => p.split(",").map(i => +i.trim()));
				}
				if (Self.shapeName === "path") {
					Self.svg.appendChild(Self.shape[0].cloneNode(true));
					points = Self.svg.firstChild.pathSegList._list;
				}
				// create drag object
				Self.drag = {
					el,
					bEl,
					type,
					min,
					click,
					offset,
					points,
					scale: Self.scale[Self.shapeName],
					multiplyMatrices: Misc.multiplyMatrices,
					_min: Math.min,
				};

				// hide from layer & show SVG version
				el.addClass("transforming");
				// re-render layer
				Projector.file.activeLayer.renderShapes({ noEmit: true });

				// cover layout
				APP.els.content.addClass("cover no-cursor");
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
				// Drag.bEl.css(dim);

				let scale = {
						x: dim.width / Drag.offset.w,
						y: dim.height / Drag.offset.h,
					};
				// reszie svg element / viewbox
				Self.svgItem.css(dim).attr({ viewBox: `0 0 ${dim.width} ${dim.height}` });
				// resize focus shape
				Drag.scale(Self.shape, { ...dim, scale, points: Drag.points });
				break;
			case "mouseup":
				// update handle box dim
				Self.dispatch({ type: "re-focus-shape" });
				// show handle-box
				Self.handleBox.removeClass("hide");
				// re-render layer
				Projector.file.activeLayer.renderShapes({ all: true });
				// uncover layout
				APP.els.content.removeClass("cover no-cursor");
				// unbind event
				UI.doc.off("mousemove mouseup", Self.doResize);
				break;
		}
	},
	/* TRANSLATE matrix
		1  0  tx
		0  1  ty
		0  0  1
	*/
	/* ROTATE matrix
		cos(a)  -sin(a)  0
		sin(a)   cos(a)  0
		0        0       1
	*/
	scale: {
		line(xShape, dim) {
			// scale line
			xShape.attr({
				x1: 0,
				y1: 0,
				x2: dim.width,
				y2: dim.height,
			});
		},
		rect(xShape, dim) {
			// resize element
			xShape.attr({
				x: 0,
				y: 0,
				width: dim.width,
				height: dim.height,
			});
		},
		ellipse(xShape, dim) {
			// resize element
			xShape.attr({
				cx: dim.width * .5,
				cy: dim.height * .5,
				rx: dim.width * .5,
				ry: dim.height * .5,
			});
		},
		circle(xShape, dim) {
			// resize element
			let r = Math.min(dim.width, dim.height) >> 1,
				cx = dim.width * .5,
				cy = dim.height * .5;
			// if (cy < cx) cx -= cx - cy;
			// else cy -= cy - cx;
			xShape.attr({ cx, cy, r });
		},
		polygon(xShape, dim) {
			// scale transform matrix points
			let matrix = (x, y) => [[x, 0, 0],
									[0, y, 0],
									[0, 0, 1]],
				scale = matrix(dim.scale.x, dim.scale.y),
				points = dim.points.map(p => {
					let newPos = this.multiplyMatrices(scale, [[p[0]], [p[1]], [1]]);
					return [newPos[0], newPos[1]].join(",");
				}).join(" ");
			xShape.attr({ points });
		},
		polyline(xShape, dim) {
			// scale transform matrix points
			let matrix = (x, y) => [[x, 0, 0],
									[0, y, 0],
									[0, 0, 1]],
				scale = matrix(dim.scale.x, dim.scale.y),
				points = dim.points.map(p => {
					let newPos = this.multiplyMatrices(scale, [[p[0]], [p[1]], [1]]);
					return [newPos[0], newPos[1]].join(",");
				}).join(" ");
			xShape.attr({ points });
		},
		path(xShape, dim) {
			// scale transform matrix points
			let matrix = (x, y) => [[x, 0, 0],
									[0, y, 0],
									[0, 0, 1]],
				scale = matrix(dim.scale.x, dim.scale.y);
			
			let dstr = "",
				pathMap = [0, "z", "M", "m", "L", "l", "C", "c", "Q", "q", "A", "a", "H", "h", "V", "v", "S", "s", "T", "t"],
				dArr = [];
			dim.points.map(seg => {
				let type = seg.pathSegType,
					pC = pathMap[type],
					p, p1, p2, r1, r2;
				
				switch (type) {
					case 13: // relative horizontal line (h)
					case 12:
						// absolute horizontal line (H)
						dstr += seg.x + " ";
						break;
					case 15: // relative vertical line (v)
					case 14:
						// absolute vertical line (V)
						dstr += seg.y + " ";
						break;
					case 3:  // relative move (m)
					case 5:  // relative line (l)
					case 19: // relative smooth quad (t)
					case 2:  // absolute move (M)
					case 4:  // absolute line (L)
					case 18:
						// absolute smooth quad (T)
						dstr += seg.x + "," + seg.y + " ";

						p = this.multiplyMatrices(scale, [[seg.x], [seg.y], [1]]);
						dArr.push(`${pC}${p[0]},${p[1]} `);
						break;
					case 7: // relative cubic (c)
					case 6:
						// absolute cubic (C)
						dstr += seg.x1 + "," + seg.y1 + " " + seg.x2 + "," + seg.y2 + " " + seg.x + "," + seg.y + " ";
						
						p = this.multiplyMatrices(scale, [[seg.x], [seg.y], [1]]);
						p1 = this.multiplyMatrices(scale, [[seg.x1], [seg.y1], [1]]);
						p2 = this.multiplyMatrices(scale, [[seg.x2], [seg.y2], [1]]);
						dArr.push(`${pC}${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p[0]},${p[1]} `);
						break;
					case 9: // relative quad (q)
					case 8:
						// absolute quad (Q)
						dstr += seg.x1 + "," + seg.y1 + " " + seg.x + "," + seg.y + " ";
						break;
					case 11: // relative elliptical arc (a)
					case 10:
						// absolute elliptical arc (A)
						dstr += seg.r1 + "," + seg.r2 + " " + seg.angle + " " + Number(seg.largeArcFlag) + " " + Number(seg.sweepFlag) + " " + seg.x + "," + seg.y + " ";
						break;
					case 17: // relative smooth cubic (s)
					case 16:
						// absolute smooth cubic (S)
						dstr += seg.x2 + "," + seg.y2 + " " + seg.x + "," + seg.y + " ";
						break;
				}

			});
			
			// console.log( dArr.join(" ") );
			xShape.attr({ d: dArr.join(" ") });
		}
	}
}
