
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
/* SCALE matrix
	sx  0  0
	0  sy  0
	0   0  1
*/

const Svg = {
	init() {
		// let arr1 = [[8, 3], [2, 4], [3, 6]],
		// 	arr2 = [[1, 2, 3], [4, 6, 8]];
		// console.log( this.matrixDot(arr1, arr2) );
	},
	matrixDot(A, B) {
		let result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));
		return result.map((row, i) =>
			row.map((val, j) =>
				A[i].reduce((sum, elm, k) =>
					parseFloat((sum + (elm * B[k][j])).toFixed(3)), 0)))
	},
	fitTranslate(Drag) {
		let width = Drag.viewBox.w,
			height = Drag.viewBox.h,
			viewBox = `0 0 ${width} ${height}`,
			css = {
				top: Math.floor(Drag.offset.y + Drag.viewBox.min.y),
				left: Math.floor(Drag.offset.x + Drag.viewBox.min.x),
				height,
				width,
			};
		// update element
		Drag.el.attr({ viewBox }).css(css);
		// final call
		if (typeof Drag.final === "function") Drag.final();
	},
	rotate: {
		matrix: (a, c) => {
			let _cos = Math.cos,
				_sin = Math.sin;
			return [[_cos(a), -_sin(a), -c.x * _cos(a) + c.y * _sin(a) + c.x],
					[_sin(a),  _cos(a), -c.x * _sin(a) - c.y * _cos(a) + c.y],
					[0, 0, 1]];
		},
		line(xShape, dim) {
			let mtxRotate = this.matrix(dim.radians, dim.origo),
				p1 = Svg.matrixDot(mtxRotate, [[dim.points[0].x], [dim.points[0].y], [1]]),
				p2 = Svg.matrixDot(mtxRotate, [[dim.points[1].x], [dim.points[1].y], [1]]),
				a = {
					x1: p1[0][0],
					y1: p1[1][0],
					x2: p2[0][0],
					y2: p2[1][0],
				};
			// line rotated
			xShape.attr(a);
			// calculate viewBox
			let min = {
					x: a.x1 < a.x2 ? a.x1 : a.x2,
					y: a.y1 < a.y2 ? a.y1 : a.y2,
				},
				max = {
					x: a.x1 > a.x2 ? a.x1 : a.x2,
					y: a.y1 > a.y2 ? a.y1 : a.y2,
				},
				w = Math.ceil(max.x - min.x),
				h = Math.ceil(max.y - min.y);
			dim.viewBox = { min, max, w, h, a };
			// final method to update element attribute
			dim.final = () => {
				a.x1 -= min.x;
				a.y1 -= min.y;
				a.x2 -= min.x;
				a.y2 -= min.y;
				xShape.attr(a);
			};
		},
		polyline(xShape, dim) {
			let arr = { x: [], y: [] },
				min = { x: 0, y: 0 },
				max = { x: 0, y: 0 },
				w, h,
				pnt = [],
				mtxRotate = this.matrix(dim.radians, dim.origo),
				points = dim.points.map(p => {
					let [x, y] = Svg.matrixDot(mtxRotate, [[p[0]], [p[1]], [1]]);
					arr.x.push(x);
					arr.y.push(y);
					pnt.push([x, y]);
					return `${x},${y}`;
				}).join(" ");
			// polyline rotated
			xShape.attr({ points });
			// calculate viewBox
			min.x = Math.min(...arr.x);
			min.y = Math.min(...arr.y);
			max.x = Math.max(...arr.x);
			max.y = Math.max(...arr.y);
			w = Math.ceil(max.x - min.x);
			h = Math.ceil(max.y - min.y);
			dim.viewBox = { min, max, w, h, pnt };
			// final method to update element attribute
			dim.final = () => {
				let points = dim.viewBox.pnt.map(p => `${p[0]-min.x},${p[1]-min.y}`).join(" ");
				xShape.attr({ points });
			};
		},
		rect(xShape, dim) {
			// let mtxRotate = this.matrix(dim.radians, dim.origo),
			// 	p1 = Svg.matrixDot(mtxRotate, [[dim.offset.w], [dim.offset.h], [1]]),
			// 	p2 = Svg.matrixDot(mtxRotate, [[dim.offset.w], [dim.offset.h], [1]]);
			dim.el
				.attr({ rotate: dim.angle })
				.css({ "--rotate": `${dim.angle}deg` });
			// TO BE CONTINUED
		},
		ellipse(xShape, dim) {},
		circle(xShape, dim) {},
		polygon(xShape, dim) {},
		path(xShape, dim) {}
	},
	scale: {
		matrix: (x, y) =>  [[x, 0, 0],
							[0, y, 0],
							[0, 0, 1]],
		line(xShape, dim) {
			let mtxScale = dim.matrix(dim.scale.x, dim.scale.y),
				[x1, y1] = this.matrixDot(mtxScale, [[dim.points[0].x], [dim.points[0].y], [1]]),
				[x2, y2] = this.matrixDot(mtxScale, [[dim.points[1].x], [dim.points[1].y], [1]]);
			// scale line
			xShape.attr({ x1, y1, x2, y2 });
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
			xShape.attr({ cx, cy, r });
		},
		polygon(xShape, dim) {
			// scale transform matrix points
			let mtxScale = dim.matrix(dim.scale.x, dim.scale.y),
				points = dim.points.map(p => {
					let [x, y] = this.matrixDot(mtxScale, [[p[0]], [p[1]], [1]]);
					return `${x},${y}`;
				}).join(" ");
			xShape.attr({ points });
		},
		polyline(xShape, dim) {
			// scale transform matrix points
			let mtxScale = dim.matrix(dim.scale.x, dim.scale.y),
				points = dim.points.map(p => {
					let [x, y] = this.matrixDot(mtxScale, [[p[0]], [p[1]], [1]]);
					return `${x},${y}`;
				}).join(" ");
			xShape.attr({ points });
		},
		path(xShape, dim) {
			// scale transform matrix points
			let mtxScale = dim.matrix(dim.scale.x, dim.scale.y),
				pathMap = [0, "z", "M", "m", "L", "l", "C", "c", "Q", "q", "A", "a", "H", "h", "V", "v", "S", "s", "T", "t"],
				dArr = [];
			// loop points
			dim.points.map(seg => {
				let type = seg.pathSegType,
					c = pathMap[type],
					x, y,
					x1, y1,
					x2, y2,
					r1, r2;
				// segment types
				switch (type) {
					case 13: // relative horizontal line (h)
					case 12: // absolute horizontal line (H)
						[x, y] = this.matrixDot(mtxScale, [[seg.x], [1], [1]]);
						dArr.push(`${c}${x} `);
						break;
					case 15: // relative vertical line (v)
					case 14: // absolute vertical line (V)
						[x, y] = this.matrixDot(mtxScale, [[1], [seg.y], [1]]);
						dArr.push(`${c}${y} `);
						break;
					case 3:  // relative move (m)
					case 5:  // relative line (l)
					case 19: // relative smooth quad (t)
					case 2:  // absolute move (M)
					case 4:  // absolute line (L)
					case 18: // absolute smooth quad (T)
						[x, y] = this.matrixDot(mtxScale, [[seg.x], [seg.y], [1]]);
						dArr.push(`${c}${x},${y} `);
						break;
					case 7: // relative cubic (c)
					case 6: // absolute cubic (C)
						[x,  y ] = this.matrixDot(mtxScale, [[seg.x],  [seg.y],  [1]]);
						[x1, y1] = this.matrixDot(mtxScale, [[seg.x1], [seg.y1], [1]]);
						[x2, y2] = this.matrixDot(mtxScale, [[seg.x2], [seg.y2], [1]]);
						dArr.push(`${c}${x1},${y1} ${x2},${y2} ${x},${y} `);
						break;
					case 9: // relative quad (q)
					case 8: // absolute quad (Q)
						[x,  y ] = this.matrixDot(mtxScale, [[seg.x], [seg.y], [1]]);
						[x1, y1] = this.matrixDot(mtxScale, [[seg.x1], [seg.y1], [1]]);
						dArr.push(`${c}${x1},${y1} ${x},${y} `);
						break;
					case 11: // relative elliptical arc (a)
					case 10: // absolute elliptical arc (A)
						[x,  y ] = this.matrixDot(mtxScale, [[seg.x], [seg.y], [1]]);
						[r1, r2] = this.matrixDot(mtxScale, [[seg.r1], [seg.r2], [1]]);
						dArr.push(`${c}${r1},${r2} ${seg.angle} ${ Number(seg.largeArcFlag)} ${Number(seg.sweepFlag)} ${x},${y} `);
						break;
					case 17: // relative smooth cubic (s)
					case 16: // absolute smooth cubic (S)
						[x,  y ] = this.matrixDot(mtxScale, [[seg.x], [seg.y], [1]]);
						[x2, y2] = this.matrixDot(mtxScale, [[seg.x2], [seg.y2], [1]]);
						dArr.push(`${c}${x2},${y2} ${x},${y} `);
						break;
				}
			});
			// update "d" attribute
			xShape.attr({ d: dArr.join(" ") });
		}
	}
};
