
let stroke = (() => {

	let oIY = function(l, d, G, b) {
		var Q = d.cover(b);
		var t = Math.max(0, Q.x - d.x),
			I = Math.max(0, Q.x - b.x),
			y = Math.max(0, Q.y - d.y),
			e = Math.max(0, Q.y - b.y),
			M = Q.w,
			R = Q.h;
		for (var A = 0; A < R; A++) {
			var J = (y + A) * d.w + t,
				n = (e + A) * b.w + I;
			G.set(new Uint8Array(l.buffer, J, M), n)
		}
	};

	let ohI = function(l) {
		var d = new Uint32Array(l.buffer),
			G = d.length;
		for (var A = 0; A < G; A++) d[A] = ~d[A]
	};

	let oQYwD = function(l, d, G) {
		var b = 1 / 255;
		for (var A = 0; A < l.length; A++) G[A] = l[A] * d[A] * b
	};

	let ostylestroke = function(l, d, G, b) {
		var V = G.w,
			Q = G.h,
			t = new Float64Array(V * Q);
		ostyleiU(l, t, V, Q);
		ostyleLr(d, G, t, G, b)
	};

	let ostyleLr = function(l, d, G, b, V) {
		var Q = d.cover(b),
			t = Q.w,
			I = Q.h;
		V += .5;
		var y = Q.x - d.x,
			e = Q.y - d.y,
			M = d.w,
			R = Q.x - b.x,
			J = Q.y - b.y,
			n = b.w;
		for (var r = 0; r < I; r++) {
			var T = (r + J) * n + R,
				j = (r + e) * M + y;
			for (var g = 0; g < t; g++) {
				var Y = Math.max(0, Math.min(1, V - G[T + g]));
				l[j + g] = Math.round(Y * 255)
			}
		}
	};

	let ostyleiU = function(l, d, G, b) {
		var V = 0,
			Q = G * b;
		for (var A = 0; A < Q; A++) V |= l[A];
		if (V == 0) {
			d.fill(1e9);
			return
		}
		var t = ostylei5(l, G, b);
		for (var I = 0; I < b; I++) {
			for (var y = 0; y < G; y++) {
				var A = I * G + y,
					e = t[A * 2],
					M = t[A * 2 + 1],
					R = (I + M) * G + y + e;
				if (e == 0 && M == 0) {
					d[A] = 0;
					continue
				}
				var J = Math.sqrt(e * e + M * M),
					n = l[R] * (1 / 255),
					r = 1 / J,
					T = Math.abs(e) * r,
					j = Math.abs(M) * r;
				if (j > T) {
					var g = j;
					j = T;
					T = g
				}
				d[A] = J + ostylea7V(T, j, n)
			}
		}
	};

	let ostylea7V = function(l, d, G) {
		return (.5 - G) * l
	};

	let ostylei5 = function(l, d, G, b) {
		var V = new Int16Array(d * G * 2);
		ostyleaio(l, V, d, G, 128);
		return V
	};

	let ostyleaio = function(l, d, G, b, V) {
		var Q = new Int32Array(G * b);
		ostyleauc(l, Q, G, b, V);
		ostylea5L(Q, d, G, b)
	};

	let ostyleauc = function(l, d, G, b, V) {
		var Q = new Int32Array(b);
		for (var t = 0; t < G; t++) {
			var I = G + b;
			for (var y = b - 1; y >= 0; y--) {
				if (l[y * G + t] > V) I = 0;
				else I++;
				Q[y] = I
			}
			I = G + b;
			for (var y = 0; y < b; y++) {
				if (l[y * G + t] > V) I = 0;
				else I++;
				d[y * G + t] = I < Q[y] ? -I : Q[y]
			}
		}
	};
	
	let ostylea5L = function(l, d, G, b) {
		var V = (G + b) * (G + b),
			Q = new Float64Array(G),
			t = new Uint16Array(G);
		for (var I = 0; I < b; I++) {
			var y = I * G,
				e = 0;
			t[0] = 0;
			Q[0] = -V;
			Q[1] = +V;
			for (var M = 1; M < G; M++) {
				var R = l[M + y] * l[M + y] + M * M,
					J = (R - (l[t[e] + y] * l[t[e] + y] + t[e] * t[e])) / (2 * M - 2 * t[e]);
				while (J <= Q[e]) {
					e--;
					J = (R - (l[t[e] + y] * l[t[e] + y] + t[e] * t[e])) / (2 * M - 2 * t[e])
				}
				e++;
				t[e] = M;
				Q[e] = J;
				Q[e + 1] = V
			}
			e = 0;
			for (var M = 0; M < G; M++) {
				while (Q[e + 1] < M) e++;
				var n = t[e] - M,
					r = l[t[e] + y],
					A = I * G + M << 1;
				d[A] = n;
				d[A + 1] = r
			}
		}
	};

	return function(mask, inside, outside) {
		// var b = Math.max(1, Math.ceil(outside));
		var box = mask.rect.clone();
		// box.expand(b, b);

		var boxArea = box.area(),
			copy = {
				channel: new Uint8Array(boxArea),
				rect: box
			},
			buff1 = new Uint8Array(boxArea),
			buff2 = new Uint8Array(boxArea);
		

		oIY(mask.channel, mask.rect, buff1, copy.rect);
		
		ostylestroke(buff1, copy.channel, copy.rect, outside);

		ohI(buff1);

		ostylestroke(buff1, buff2, copy.rect, inside);
		
		oQYwD(copy.channel, buff2, copy.channel);
		
		return copy;
	};

})();
