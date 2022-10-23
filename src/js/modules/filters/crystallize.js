
function crystallize(src, width, height, dest, size) {
	let _floor = Math.floor,
		_random = Math.random,
		_max = Math.max,
		_min = Math.min,
		_sqrt = Math.sqrt,
		I = 0,
		y = 0,
		m = 0,
		c = 0,
		i = 0,
		p = 1e9,
		v = 1e9,
		z = 1e9,
		P = 0,
		C = 0,
		h = 0,
		L = 0,
		e = 1 / size,
		M = _floor(width * e) + 1,
		R = _floor(height * e) + 1,
		J = [],
		n = new Uint8Array(M * R * 4),
		r = 1,
		T = 0,
		e016 = (l, d, G, b) => {
			let V = G - l[d],
				Q = b - l[d + 1];
			return V * V + Q * Q;
		};

	for (let j = 0; j < R; j++) {
		let g = 0;
		for (let Y = 0; Y < M; Y++) {
			let k = (Y + _random() * r + g) * size,
				F = (j + _random() * r) * size;
			J.push(k, F);
			let D = _min(width - 1, _floor(k)),
				q = _min(height - 1, _floor(F)),
				H = (q * width + D) * 4,
				W = (j * M + Y) * 4;
			for (let A = 0; A < 4; A++) n[W + A] = _max(0, _min(255, _floor(src[H + A] + (_random() - .5) * T)))
		}
	}
	let Z = [0, 0, 0],
		B = M * R * 2,
		a = [-M - 1, -M, -M + 1, -1, 0, 1, M - 1, M, M + 1];
	for (let j = 0; j < height; j++) {
		h = 0;
		for (let Y = 0; Y < width; Y++) {
			let U = Y + .5,
				S = j + .5,
				E = _floor(S * e),
				x = _floor(U * e),
				K = E * M + x,
				O = 0,
				$ = 0;
			if (h > 1 + I) {
				p = e016(J, m, U, S);
				P = _sqrt(p);
				h--;
				L++
			} else {
				p = v = z = 1e9;
				for (let A = 0; A < a.length; A++) {
					let u = (K + a[A]) * 2;
					if (u < 0 || u >= B) continue;
					let bC = e016(J, u, U, S);
					if (bC < z) {
						if (bC < v) {
							if (bC < p) {
								i = c;
								z = v;
								c = m;
								v = p;
								m = u;
								p = bC
							} else {
								i = c;
								z = v;
								c = u;
								v = bC
							}
						} else {
							i = u;
							z = bC
						}
					}
				}
				P = _sqrt(p);
				C = _sqrt(v);
				h = C - (P + C) * .5
			}
			
			let gX = (P + C) * .5,
				_ = 0;
			O = _max(0, _min(1, .5 + gX - P - _));
			$ = _max(0, _min(1, 1 - (.5 + gX - P) - _))
			
			let jq = 1 - $ - O,
				W = j * width + Y << 2,
				iv = m << 1,
				kq = c << 1;
			dest[W + 0] = _floor(.5 + O * n[iv + 0] + $ * n[kq + 0] + jq * Z[0]);
			dest[W + 1] = _floor(.5 + O * n[iv + 1] + $ * n[kq + 1] + jq * Z[1]);
			dest[W + 2] = _floor(.5 + O * n[iv + 2] + $ * n[kq + 2] + jq * Z[2]);
			dest[W + 3] = src[W + 3]
		}
	}
}
