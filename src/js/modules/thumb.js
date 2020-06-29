
const Thumb = {
	render(options) {
		let _round = Math.round,
			_canvas = Canvas,
			Cvs = options.el[0],
			Ctx = Cvs.getContext("2d"),
			width = Cvs.offsetWidth,
			height = Cvs.offsetHeight,
			ratio = _canvas.oW / _canvas.oH,
			l, t, w, h, c;

		options.el.prop({ width, height });

		w = width;
		h = _round(width / ratio);
		if (h > height - 2) {
			// portrait
			h = height - 2;
			w = _round(width * ratio);
		}
		l = _round((width - w) / 2);
		t = _round((height - h) / 2);

		// original canvas image
		Ctx.drawImage(_canvas.osCvs[0], l, t, w, h);

		c = ["red", "green", "blue"].indexOf(options.channel);
		if (c > -1) {
			let img = Ctx.getImageData(l, t, w, h),
				data = img.data;

			for (let i=0, il=data.length; i<il; i+=4) {
				data[i + 0] = data[i + c];
				data[i + 1] = data[i + c];
				data[i + 2] = data[i + c];
			}
			Ctx.putImageData(img, l, t);
		}

		// draw borders
		Ctx.strokeStyle = "#000";
		Ctx.lineWidth = .5;

		Ctx.translate(.5, .5);
		Ctx.beginPath();
		Ctx.rect(l, t, w - 1, h - 1);
		Ctx.stroke();
	}
};
