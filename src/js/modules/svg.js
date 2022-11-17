
const Svg = {
	init() {
		// let arr1 = [[8, 3], [2, 4], [3, 6]],
		// 	arr2 = [[1, 2, 3], [4, 6, 8]];
		// console.log( this.matrixDot(arr1, arr2) );
	},
	fitTranslate(svg) {
		let dim = [...svg[0].children].filter(el => el.getBBox).reduce((acc, el) => {
					let { x, y, width, height } = el.getBBox();
					if (!acc.min.x || x < acc.min.x) acc.min.x = x;
					if (!acc.max.x || x + width > acc.max.x) acc.max.x = x + width;
					if (!acc.min.y || y < acc.min.y) acc.min.y = y;
					if (!acc.max.y || y + height > acc.max.y) acc.max.y = y + height;
					return acc;
				}, { min: {}, max: {} }),
			_ceil = Math.ceil,
			width = _ceil(dim.max.x),
			height = _ceil(dim.max.y),
			viewBox = `0 0 ${width} ${height}`,
			css = {
				top: parseInt(svg.css("top"), 10) - _ceil(dim.min.y),
				left: parseInt(svg.css("left"), 10) - _ceil(dim.min.x),
				height,
				width,
			};
		// update element
		svg.attr({ viewBox }).css(css);
	},
	matrixDot(A, B) {
		let result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));
		return result.map((row, i) =>
			row.map((val, j) =>
				A[i].reduce((sum, elm, k) =>
					parseFloat((sum + (elm * B[k][j])).toFixed(3)), 0)))
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
	/* SCALE matrix
		sx  0  0
		0  sy  0
		0   0  1
	*/
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
				[x1, y1] = Svg.matrixDot(mtxRotate, [[dim.points[0].x], [dim.points[0].y], [1]]),
				[x2, y2] = Svg.matrixDot(mtxRotate, [[dim.points[1].x], [dim.points[1].y], [1]]);
			// line rotated
			xShape.attr({ x1, y1, x2, y2 });
		},
		rect(xShape, dim) {},
		ellipse(xShape, dim) {},
		circle(xShape, dim) {},
		polygon(xShape, dim) {},
		polyline(xShape, dim) {},
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
