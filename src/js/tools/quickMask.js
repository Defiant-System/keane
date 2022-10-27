
// keane.tools.quickMask

{
	init() {
		// fast references
		this.els = {
			tool: keane.els.toolsBar.find(".tool.icon-quick-mask"),
			menu: window.bluePrint.selectSingleNode(`//Menu[@check-group="quick-mask-mode"]`),
		};

		// defaults
		this.enabled = false;
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.quickMask;

		switch (event.type) {
			// custom events
			case "toggle-quick-mask-mode":
				// stop marching ants
				Mask.ants.halt(true);

				// toggle file "quick mask" flag
				Self.enabled = !Self.enabled;
				File.quickMask.show = !File.quickMask.show;

				if (Self.enabled) {
					Self.els.tool.addClass("active");
					Self.els.menu.setAttribute("is-checked", "1");
					
					Self.paint(File.quickMask.ctx);

				} else {
					Self.els.tool.removeClass("active");
					Self.els.menu.removeAttribute("is-checked");
					// march tiny ants!
					Mask.ants.paint(true);
				}

				// update projector
				File.render({ noEmit: true });
				break;
		}
	},
	paint(ctx) {
		let rgba = [255, 0, 0, 150],
			pixels = Actions.getPixels(Mask.cvs[0]),
			buff = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height),
			d = buff.data,
			alpha = Actions.getChannel(pixels.data),
			il = alpha.length,
			i = 0;

		// invert alpha channel
		for (; i<il; i++) {
			// alpha[i] = 255 - alpha[i];
		}


		for (let i=0, il=alpha.length; i<il; i++) {
			let p = (i << 2) - 4;
			if (!alpha[i]) continue;
			d[p+0] = rgba[0];
			d[p+1] = rgba[1];
			d[p+2] = rgba[2];
			d[p+3] = alpha[i]; // rgba[3];
		}

		ctx.putImageData(buff, 0, 0);

		// paint semi transparent cover
		// ctx.save();
		// ctx.globalCompositeOperation = "source-over";
		// ctx.drawImage(Mask.cvs[0], 0, 0);
		// ctx.globalCompositeOperation = "source-out";
		// ctx.fillStyle = Pref.quickMask.color;
		// ctx.fillRect(0, 0, 1e9, 1e9);
		// ctx.restore();
	}
}
