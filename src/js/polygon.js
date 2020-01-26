
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	static equals(point) {
		return this.x === point.x && this.y === point.y;
	}
	static distance(p0, p1) {
		return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
	}
}

class Vector {
	constructor(point, p1) {
		if (!p1) {
			if (point.constructor === Point) {
				this.i = point.x;
				this.j = point.y;
			} else {
				this.i = point.p1.x - point.p0.x;
				this.j = point.p1.y - point.p0.y;
			}
		} else {
			this.i = p1.x - point.x;
			this.j = p1.y - point.y;
		}
	}
	static crossProduct(vector1, vector2) {
		return vector1.i * vector2.j - vector1.j * vector2.i;
	}
}

class LineSegment {
	constructor(p0, p1) {
		this.p0 = p0;
		this.p1 = p1;
	}
	containsPoint(point) {
		if ((this.p1.x - this.p0.x) * (point.y - this.p0.y) - (point.x - this.p0.x) * (this.p1.y - this.p0.y) != 0) return false;

		if (this.p0.x != this.p1.x) {
			if ((this.p0.x <= point.x && point.x <= this.p1.x) || (point.x <= this.p0.x && this.p1.x <= point.x)) return true;
		} else {
			if ((this.p0.y <= point.y && point.y <= this.p1.y) || (point.y <= this.p0.y && this.p1.y <= point.y)) return true;
		}

		return false;
	}
	intersects(lineSegment) {
		let u = new Vector(this),
			v = new Vector(lineSegment),
			w = new Vector(lineSegment.p0, this.p0),
			denominator = Vector.crossProduct(u, v),
			numerator = Vector.crossProduct(u, w);

		if (denominator == 0) {
			if (numerator != 0) return null; // parallel

			let d0 = this.p0.equals(this.p1),
			d1 = lineSegment.p0.equals(lineSegment.p1);
			if (d0 && d1) {
				if (this.p0.equals(lineSegment.p0)) return lineSegment.p0; // same points
				else return null; // different points
			}
			if (d0) {
				if (lineSegment.containsPoint(this.p0)) return this.p0;
				else return null;
			}
			if (d1) {
				if (this.containsPoint(lineSegment.p0)) return lineSegment.p0;
				else return null;
			}

			// they are colinear
			let t0 = 0.0, t1 = 0.0, w2 = new Vector(lineSegment.p0, this.p1);
			if (v.i != 0) {
				t0 = w.i / v.i;
				t1 = w2.i / v.i;
			} else {
				t0 = w.j / v.j;
				t1 = w2.j / v.j;
			}
			if (t0 > t1) t1 = [t0, t0 = t1][0];
			
			t0 = t0<0? 0 : t0;
			t1 = t1>1? 1 : t1;
			if (t0 > 1 || t1 < 0) return null;
			if (t0 == t1) { // intersect is a point
				return new Point(lineSegment.p0.x + t0 * v.i, lineSegment.p0.y + t0 * v.j);
			}
			return new LineSegment(new Point(lineSegment.p0.x + t0 * v.i, lineSegment.p0.y + t0 * v.j), new Point(lineSegment.p0.x + t1 * v.i, lineSegment.p0.y + t1 * v.j))
		}

		let i = Vector.crossProduct(v, w) / denominator; //Vector.crossProduct(v, w) / denominator;
		
		if (!((i >= 0) && (i <= 1))) return null;
		let i2 = Vector.crossProduct(u, w) / denominator;
		if (!((i2 >= 0) && (i2 <= 1))) return null; //Number.range(i2, 0, 1)) return null;
		
		return new Point(this.p0.x + i * u.i, this.p0.y + i * u.j);
	}
}

class Polygon {
	constructor(vertices) {
		this.vertices = vertices.map(v => new Point(v[0], v[1]));
	}
	constrain(p, center) {
		let point = new Point(p[0], p[1]);
		if (this.containsPoint(point)) return point;

		center = center || this.getCentroid();

		let lineSegment = new LineSegment(center, point);
		let intersection = this.intersects(lineSegment)[0];
		
		return intersection && intersection.constructor === Point
			? intersection
			: (Point.distance(center, intersection.p0) > Point.distance(center, intersection.p1) ? intersection.p0 : intersection.p1);
	}
	containsPoint(point) {
		let contains = false;
		//	rectangle = this.getBoundingRectangle();

		//if (!rectangle.containsPoint(point)) return false;

		for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
			if ((new LineSegment(this.vertices[i], this.vertices[j])).containsPoint(point)) return true;
			if (((this.vertices[i].y > point.y) !== (this.vertices[j].y > point.y)) &&
				(point.x < (this.vertices[j].x - this.vertices[i].x) * (point.y - this.vertices[i].y) / (this.vertices[j].y - this.vertices[i].y) + this.vertices[i].x) ) {
				contains = !contains;
			}
		}
		return contains;
	}
	getCentroid() {
		let areaTotal = 0.0,
			areaPart = 0.0,
			centroidX = 0.0,
			centroidY = 0.0;

		this.vertices.map((p0, i) => {
			let p1 = this.vertices[(i + 1) % this.vertices.length],
				areaPart = p0.x * p1.y - p0.y * p1.x;
			areaTotal += areaPart;
			centroidX += areaPart * (p0.x + p1.x);
			centroidY += areaPart * (p0.y + p1.y);
		});

		areaTotal *= 0.5;
		centroidX = centroidX / (6.0 * areaTotal);
		centroidY = centroidY / (6.0 * areaTotal);

		return new Point(centroidX, centroidY);
	}
	intersects(lineSegment) {
		let intersections = [];
		for (let i=0, j=this.vertices.length-1; i<this.vertices.length; j=i++) {
			let intersection = lineSegment.intersects(new LineSegment(this.vertices[j], this.vertices[i]));
			if (intersection !== null) {
				intersections.push(intersection);
			}
		}
		return intersections;
	}
	rotate(angle, center) {
		center = center || this.getCentroid();

		this.vertices.map((point, i) => {
			let pointX = this.vertices[i].x - center.x,
				pointY = this.vertices[i].y - center.y,
				pointXr = pointX * Math.cos(angle) - pointY * Math.sin(angle),
				pointYr = pointY * Math.cos(angle) + pointX * Math.sin(angle);

			this.vertices[i] = new Point(pointXr + center.x, pointYr + center.y);
		});
	}
	scale(scaleX, scaleY, center) {
		center = center || this.getCentroid();

		this.vertices.map((point, i) => {
			let pointX = this.vertices[i].x - center.x,
				pointY = this.vertices[i].y - center.y;
			this.vertices[i] = new Point(pointX = scaleX * (this.vertices[i].x - center.x) + center.x,
						scaleY * (this.vertices[i].y - center.y) + center.y);
		});
	}
}
