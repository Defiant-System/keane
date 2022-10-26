
class Box {
	constructor(x=0, y=0, w=0, h=0) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	area() {
		return this.w * this.h;
	}

	clone() {
		return new Box(this.x, this.y, this.w, this.h);
	}

	containsPoint(x, y) {
		return x >= this.x && x <= this.x + this.w && (y >= this.y && y <= this.y + this.h)
	}

	containsPos(pos) {
		return this.containsPoint(pos.x, pos.y);
	}

	expand(xSize, ySize) {
		this.x -= xSize;
		this.y -= ySize;
		this.w += 2 * xSize;
		this.h += 2 * ySize;
	}

	expandDim(dim) {
		this.expand(dim.x, dim.y);
	}

	intersects(box) {
		return this.x <= box.x && this.y <= box.y && box.x + box.w <= this.x + this.w && box.y + box.h <= this.y + this.h;
	}

	isSame(box) {
		return this.x == box.x && this.y == box.y && this.w == box.w && this.h == box.h;
	}

	cover(box) {
		var x = Math.max(this.x, box.x),
			y = Math.max(this.y, box.y),
			r = Math.min(this.x + this.w, box.x + box.w),
			b = Math.min(this.y + this.h, box.y + box.h);
		if (r < x || b < y) return new Box;
		else return new Box(x, y, r - x, b - y)
	}
}
