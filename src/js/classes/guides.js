
class Guides {

	static get selector() {
		return ".table, .shape, .image, .text";
	}

	static get context() {
		return "content .vector-layer";
	}

	constructor(opt={}) {
		// reference to root application
		let APP = keane,
			Spawn = karaqu.getSpawn(opt.offset.el),
			opts = {
				// default selector & context
				selector: opt.selector || Guides.selector,
				context: opt.context || Guides.context,
				// offsets origo
				x: 0,
				y: 0,
				// offsets guide line
				w: 0,
				h: 0,
				mh: opt.offset.h >> 1 || 0,
				mw: opt.offset.w >> 1 || 0,
				lines: opt.lines || [],
				// snap sensitivity
				sensitivity: APP.Settings.guides.sensitivity || 7,
				// override defaults, if any
				...opt.offset,
			};
		// default properties
		this.els = [...opts.lines];
		// selector = "#shape-rounded";
		Spawn.find(opts.selector, opts.context).map(elem => {
				let el = $(elem),
					y = parseInt(el.css("top"), 10),
					x = parseInt(el.css("left"), 10),
					w = parseInt(el.css("width"), 10),
					h = parseInt(el.css("height"), 10),
					mh = h >> 1,
					mw = w >> 1;
				if (el.hasClass("xl-table")) {
					w += 1;
					h += 1;
					mh = h >> 1;
					mw = w >> 1;
				}
				if (!isNaN(y) && !isNaN(x) && elem !== opts.el) {
					this.els.push({ y, x, w, h, mh, mw });
				}
			});

		// add guide line element to "this"
		this.lines = {
			horizontal: Spawn.find(".guide-lines .horizontal"),
			vertical: Spawn.find(".guide-lines .vertical"),
			diagonal: Spawn.find(".guide-lines .diagonal"),
		};
		// add guide line element to "this"
		this.opts = opts;
	}

	snapDim(d) {
		let o = this.opts,
			s = o.sensitivity,
			u = d.uniform,
			b = {
				t: o.type,
				d: d.diagonal,
				n: o.type.includes("n"),
				w: o.type.includes("w"),
				e: o.type.includes("e"),
				s: o.type.includes("s"),
			},
			vert = { top: -99, left: -99, width: 1 },
			hori = { top: -99, left: -99, height: 1 },
			diag = { top: -99, left: -99, height: 1 },
			calcH = (g, c, add = { h: 0 }) => {
				let minX = o.x,
					maxX = g.x,
					w = g.w;
				d.height -= c.h;
				d.top -= c.t;
				if (maxX < minX) {
					minX = g.x;
					maxX = o.x;
					w = o.w;
				}
				if (u) freeze(true);
				return { top: g.y+add.h, left: minX, width: maxX-minX+w };
			},
			calcV = (g, c, add = { w: 0 }) => {
				let minY = o.y,
					maxY = g.y,
					h = g.h;
				d.width -= c.w;
				d.left -= c.l;
				if (maxY < minY) {
					minY = g.y;
					maxY = o.y;
					h = o.h;
				}
				if (u) freeze();
				return { top: minY, left: g.x+add.w, height: maxY-minY+h };
			},
			freeze = (h) => {
				switch (b.t) {
					case "ne":
						if (h) {
							d.width = d.height * d.ratio;
							d.left = o.x - ((d.height - o.h) * o.ratio);
						} else {
							d.height = d.width / d.ratio;
							d.top = o.y - ((d.width - o.w) / o.ratio);
						}
						break;
					case "se":
						if (h) {
							d.width = d.height * d.ratio;
							d.left = o.x - ((d.height - o.h) * o.ratio);
						} else {
							d.height = d.width / d.ratio;
						}
						break;
					case "sw":
						if (h) d.width = d.height * d.ratio;
						else d.height = d.width / d.ratio;
						break;
					case "nw":
						if (h) d.width = d.height * d.ratio;
						else {
							d.height = d.width / d.ratio;
							d.top = o.y - ((d.width - o.w) / o.ratio);
						}
						break;
					case "e":
					case "w":
						d.top = o.y - (((d.width - o.w) / o.ratio) >> 1);
						d.height = d.width / d.ratio;
						break;
					case "n":
					case "s":
						d.left = o.x - (((d.height - o.h) * o.ratio) >> 1);
						d.width = d.height * d.ratio;
						break;
				}
			};
		
		if (b.d) {
			switch (b.t) {
				case "ne":
				case "nw":
					d.height = Math.max(Math.round(d.width / d.ratio), d.min.h);
					d.top = Math.round(d.y + d.h - d.height);
					break;
				case "se":
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					d.left = Math.round(d.x + d.w - d.width);
					break;
				case "sw":
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					break;
			}

			diag = {
				top: d.top || o.y,
				left: d.left || o.x,
				transform: `rotate(${o.r}deg)`,
				width: Math.sqrt(d.height*d.height + d.width*d.width) + 10,
			};
			if (o.r > 90) diag.left += d.width;

		} else if (u) { // uniform resize
			switch (b.t) {
				case "n":
					d.top = Math.round(d.y + d.h - d.height);
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					d.left = o.x + ((o.w - d.width) >> 1);
					break;
				case "s":
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					d.left = o.x + ((o.w - d.width) >> 1);
					break;
				case "e":
				case "w":
					d.height = Math.max(Math.round(d.width / d.ratio), d.min.h);
					d.top = Math.round(d.y + ((d.h - d.height) >> 1));
					break;
			}
		}
		
		// iterate guide lines
		this.els.map(g => {
			let t = d.top - g.y,
				th = t - g.h,
				thm = t - g.mh,
				dh = d.height + o.y - g.y,
				ohy = dh - g.h,
				ohm = dh - g.mh,
				l = d.left - g.x,
				lw = l - g.w,
				lwm = l - g.mw,
				dw = d.width + o.x - g.x,
				owx = dw - g.w,
				owm = dw - g.mw,
				c = { w: 0, h: 0, t: 0, l: 0 };
			// horizontal comparisons
			switch (true) {
				// east
				case (b.e && l < s && l > -s):     c.l = l;   c.w -= l;   vert = calcV(g, c);              break;
				case (b.e && lw < s && lw > -s):   c.l = lw;  c.w -= lw;  vert = calcV(g, c, { w: g.w });  break;
				case (b.e && lwm < s && lwm > -s): c.l = lwm; c.w -= lwm; vert = calcV(g, c, { w: g.mw }); break;
				// west
				case (b.w && dw < s && dw > -s): c.w = dw; vert = calcV(g, c, { w: (u?1:0) });           break;
				case (b.w && owx < s && owx > -s): c.w = owx; vert = calcV(g, c, { w: g.w + (u?1:0) });  break;
				case (b.w && owm < s && owm > -s): c.w = owm; vert = calcV(g, c, { w: g.mw + (u?1:0) }); break;
			}
			// vertical comparisons
			switch (true) {
				// north
				case (b.n && t < s && t > -s):     c.t = t;   c.h -= t;   hori = calcH(g, c);              break;
				case (b.n && th < s && th > -s):   c.t = th;  c.h -= th;  hori = calcH(g, c, { h: g.h });  break;
				case (b.n && thm < s && thm > -s): c.t = thm; c.h -= thm; hori = calcH(g, c, { h: g.mh }); break;
				// south
				case (b.s && dh < s && dh > -s):   c.h = dh;  hori = calcH(g, c, { h: (u?-1:0) });        break;
				case (b.s && ohy < s && ohy > -s): c.h = ohy; hori = calcH(g, c, { h: g.h + (u?-1:0) });  break;
				case (b.s && ohm < s && ohm > -s): c.h = ohm; hori = calcH(g, c, { h: g.mh + (u?-1:0) }); break;
			}
		});

		// apply UI update
		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
		this.lines.diagonal.css(diag);
	}

	snapPos(m) {
		let o = this.opts,
			s = o.sensitivity,
			t = m.top + o.y,
			l = m.left + o.x,
			vert = { top: -1, left: -1, width: 1 },
			hori = { top: -1, left: -1, height: 1 },
			calcH = (g, y, add = { t: 0 }) => {
				let minX = l,
					maxX = g.x,
					w = maxX-minX+g.w;
				if (w < o.w) w = o.w;
				m.top -= y;
				if (maxX < minX) {
					minX = g.x;
					maxX = l;
					w = maxX-minX+o.w;
					if (w < g.w) w = g.w;
				}
				return { top: g.y+add.t, left: minX, width: w };
			},
			calcV = (g, x, add = { l: 0 }) => {
				let minY = t,
					maxY = g.y,
					h = maxY-minY+g.h;
				if (h < o.h) h = o.h;
				m.left -= x;
				if (maxY < minY) {
					minY = g.y;
					maxY = t;
					h = maxY-minY+o.h;
					if (h < g.h) h = g.h;
				}
				return { top: minY, left: g.x+add.l, height: h };
			};
		// restrains position
		if (m.restrict) {
			let dy = m.top - o.t,
				dx = m.left - o.l,
				tie = ["h", "ne", "v", "nw", "h", "ne", "v", "nw", "h"],
				deg = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
			if (deg < 0) deg += 360;
			switch (tie[Math.round(deg / 45)]) {
				case "v": m.left = o.l; break;
				case "h": m.top = o.t; break;
				case "ne": m.left = o.l + (m.top - o.t); break;
				case "nw": m.left = o.l - (m.top - o.t); break;
			}
		}
		// iterate guide lines
		this.els.map(g => {
			let dy = t - g.y,
				dx = l - g.x,
				ohy = dy + o.h,
				oh1 = dy + o.mh,
				oh2 = ohy - g.h - o.mh,
				ghy = dy - g.h,
				ogh = ohy - g.h,
				oym = ohy - g.mh - o.mh,
				owx = dx + o.w,
				ow1 = dx + o.mw,
				ow2 = owx - g.w - o.mw,
				gwx = dx - g.w,
				ogw = owx - g.w,
				oxm = owx - g.mw - o.mw,
				_hd = hori.top !== -1,
				_vd = vert.top !== -1;
			// vertical comparisons
			switch (true) {
				case (!_hd && dy  < s && dy  > -s): hori = calcH(g, dy);                break;
				case (!_hd && ohy < s && ohy > -s): hori = calcH(g, ohy);               break;
				case (!_hd && oh1 < s && oh1 > -s): hori = calcH(g, oh1);               break;
				case (!_hd && oh2 < s && oh2 > -s): hori = calcH(g, oh2, { t: g.h });   break;
				case (!_hd && oym < s && oym > -s): hori = calcH(g, oym, { t: g.mh });  break;
				case (!_hd && ghy < s && ghy > -s): hori = calcH(g, ghy, { t: g.h-1 }); break;
				case (!_hd && ogh < s && ogh > -s): hori = calcH(g, ogh, { t: g.h-1 }); break;
			}
			// horizontal comparisons
			switch (true) {
				case (!_vd && dx  < s && dx  > -s): vert = calcV(g, dx);                break;
				case (!_vd && owx < s && owx > -s): vert = calcV(g, owx);               break;
				case (!_vd && ow1 < s && ow1 > -s): vert = calcV(g, ow1);               break;
				case (!_vd && ow2 < s && ow2 > -s): vert = calcV(g, ow2, { l: g.w });   break;
				case (!_vd && oxm < s && oxm > -s): vert = calcV(g, oxm, { l: g.mw });  break;
				case (!_vd && gwx < s && gwx > -s): vert = calcV(g, gwx, { l: g.w-1 }); break;
				case (!_vd && ogw < s && ogw > -s): vert = calcV(g, ogw, { l: g.w-1 }); break;
			}
		});
		// apply UI update
		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
	}

	reset() {
		let data = { top: -99, left: -99, width: 1, height: 1 };
		this.lines.vertical.css(data);
		this.lines.horizontal.css(data);
		this.lines.diagonal.css(data);
	}
}
