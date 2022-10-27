
// keane.tools.quickMask

{
	init() {
		// fast references
		this.els = {
			tool: keane.els.toolsBar.find(".tool.icon-quick-mask"),
			menuEnter: window.bluePrint.selectSingleNode(`//Menu[@click="enter-quick-mask-mode"]`),
			menuExit: window.bluePrint.selectSingleNode(`//Menu[@click="exit-quick-mask-mode"]`),
			menuToggle: window.bluePrint.selectSingleNode(`//Menu[@click="toggle-paint-masked-area"]`),
		};

		// defaults
		this.enabled = false;
		this.paintMasked = 0;
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.quickMask;

		switch (event.type) {
			// custom events
			case "toggle-paint-masked-area":
				Self.paintMasked = !Self.paintMasked;
				// paint masked / selected
				Self.paint(File.quickMask.ctx, Self.paintMasked);
				// update projector
				File.render({ noEmit: true });
				break;

			case "toggle-quick-mask-mode":
				if (Self.enabled) Self.dispatch({ type: "exit-quick-mask-mode" });
				else Self.dispatch({ type: "enter-quick-mask-mode" });
				break;
			case "enter-quick-mask-mode":
				// toggle file "quick mask" flag
				Self.enabled =
				File.quickMask.show = true;
				// stop marching ants
				Mask.ants.halt(true);

				// update menu
				Self.els.tool.addClass("active");
				Self.els.menuEnter.setAttribute("type", "hidden");
				Self.els.menuExit.removeAttribute("type");
				Self.els.menuToggle.removeAttribute("disabled");
				// paint masked / selected
				Self.paint(File.quickMask.ctx, Self.paintMasked);

				// update projector
				File.render({ noEmit: true });
				break;
			case "exit-quick-mask-mode":
				// toggle file "quick mask" flag
				Self.enabled =
				File.quickMask.show = false;
				// stop marching ants
				Mask.ants.halt(true);

				// update menu
				Self.els.tool.removeClass("active");
				Self.els.menuExit.setAttribute("type", "hidden");
				Self.els.menuEnter.removeAttribute("type");
				Self.els.menuToggle.setAttribute("disabled", "1");
				// march tiny ants!
				Mask.ants.paint(true);

				// update projector
				File.render({ noEmit: true });
				break;
		}
	},
	paint(ctx, selected) {
		let clr = ColorLib.hexToRgb(Pref.quickMask.color),
			rgba = [clr.r, clr.g, clr.b, clr.a],
			perc = clr.a / 255,
			pixels = Actions.getPixels(Mask.cvs[0]),
			alpha = Actions.getChannel(pixels.data),
			buff = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height),
			d = buff.data;
		// invert alpha channel
		if (selected) {
			for (let i=0, il=alpha.length; i<il; i++) {
				alpha[i] = 255 - alpha[i];
			}
		}
		// paint semi transparent cover
		for (let i=0, il=alpha.length; i<il; i++) {
			let p = (i << 2) - 4;
			if (selected && alpha[i] === 0) d[p+3] = 0;
			if (!alpha[i]) continue;
			d[p+0] = rgba[0];
			d[p+1] = rgba[1];
			d[p+2] = rgba[2];
			d[p+3] = alpha[i] * perc;
		}
		// paint on file context
		ctx.putImageData(buff, 0, 0);
	}
}
