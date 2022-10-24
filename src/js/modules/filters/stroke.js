
let Stroke = (function() {

	function stroke(src, dest) {
		/*
		l = Uint8Array
		G = Uint8Array
		*/

		let width = 600,
			height = 400,
			k = new Uint32Array(src.buffer),
			F = new Uint32Array(dest.buffer);
		
		for (var A = 0; A < width; A++) {
			var D = A * height;
			for (var H = 0; H < height; H++) {
				var W = k[D + H];
				if (W >>> 24 == 0) continue;
				if (W >>> 24 == 255) {
					F[D + H] = k[D + H];
					continue
				}
				var Z = F[D + H],
					B = W & 255,
					a = W >>> 8 & 255,
					m = W >>> 16 & 255,
					p = Z & 255,
					c = Z >>> 8 & 255,
					v = Z >>> 16 & 255,
					i = (W >>> 24) * (1 / 255),
					P = (Z >>> 24) * (1 / 255),
					C = P * (1 - i),
					h = i + C,
					L = 1 / h;
				F[D + H] = ~~(.5 + h * 255) << 24 | ~~(.5 + (m * i + v * C) * L) << 16 | ~~(.5 + (a * i + c * C) * L) << 8 | ~~(.5 + (B * i + p * C) * L)
			}
		}

	}

	return stroke;

})();
