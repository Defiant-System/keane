
const Color = {
	hslToRgb(h, s, l, a=1) {
		let _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			b = s * _min(l, 1-l);
		let f = (n, k = (n + h / 30) % 12) => l - b * _max(_min(k - 3, 9 - k, 1), -1);
		return [_round(f(0) * 255), _round(f(8) * 255), _round(f(4) * 255), a];
	},
	hslToHex(h, s, l, a=1) {
		let rgb = this.hslToRgb(h, s, l, a);
		return this.rgbToHex(`rgba(${rgb.join(",")})`);
	},
	rgbToHsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		var _round = Math.round,
			min = Math.min(r, g, b),
			max = Math.max(r, g, b),
			h = 0, s = 0, v = 0,
			d, h;
		// Black-gray-white
		if (min === max) return [0, 0, _round(min * 100)];
		// Colors other than black-gray-white:
		d = (r === min) ? g - b : ((b === min) ? r - g : b - r);
		h = (r === min) ? 3 : ((b === min) ? 1 : 5);
		h = 60 * (h - d / (max - min));
		s = (max - min) / max;
		return [_round(h), _round(s * 100), _round(max * 100)];
	},
	rgbToHex(rgb) {
		let d = "0123456789abcdef".split(""),
			hex = x => isNaN(x) ? "00" : d[( x - x % 16) / 16] + d[x % 16];
		rgb = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\.\d]+)\)$/);
		if (!rgb) rgb = arguments[0].match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/);
		let a = Math.round((rgb[4] || 1) * 255);
		return "#"+ hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]) + hex(a);
	},
	hexToRgb(hex) {
		let r = parseInt(hex.substr(1,2), 16),
			g = parseInt(hex.substr(3,2), 16),
			b = parseInt(hex.substr(5,2), 16),
			a = parseInt(hex.substr(7,2) || "ff", 16) / 255;
		return [r, g, b, a];
	},
	mixColors(hex1, hex2, p) {
		let rgb1 = this.hexToRgb(hex1),
			rgb2 = this.hexToRgb(hex2),
			w = p * 2 - 1,
			w1 = (w + 1) / 2.0,
			w2 = 1 - w1,
			rgb = [
				parseInt(rgb1[0] * w1 + rgb2[0] * w2, 10),
				parseInt(rgb1[1] * w1 + rgb2[1] * w2, 10),
				parseInt(rgb1[2] * w1 + rgb2[2] * w2, 10),
				rgb1[3] * w1 + rgb2[3] * w2
			];
		return this.rgbToHex(`rgba(${rgb.join(",")})`);
	}
};
