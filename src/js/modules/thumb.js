
const Thumb = {
	render(options) {
		let _round = Math.round,
			_canvas = Canvas,
			Cvs = options.el[0],
			Ctx = Cvs.getContext("2d"),
			width = Cvs.offsetWidth,
			height = Cvs.offsetHeight,
			ratio = _canvas.oW / _canvas.oH,
			l, t, w, h;

		options.el.prop({ width, height });

		w = width;
		h = _round(width / ratio);
		l = _round((width - w) / 2);
		t = _round((height - h) / 2);

		Ctx.drawImage(_canvas.osCvs[0], l, t, w, h);

		Ctx.strokeStyle = "#000";
		Ctx.lineWidth = .5;

		Ctx.translate(.5, .5);
		Ctx.beginPath();
		Ctx.rect(l, t, w - 1, h - 1);
		Ctx.stroke();
	}
};
