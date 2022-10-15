
// keane.tools.marquee

{
	init() {
		// default values
		this.option = "rectangle";

		// temp
		// setTimeout(() => window.find(`.tool-marquee-circle`).trigger("click"), 500);
		setTimeout(() => window.find(`.tool-wand`).trigger("click"), 500);
	},
	dispatch(event) {
		let APP = keane,
			Proj = Projector,
			File = Proj.file,
			Self = APP.tools.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min,
			color,
			mask,
			image,
			oX, oY;

		switch (event.type) {
			// custom events
			case "select-option":
				Self.option = event.arg || "rectangle";
				break;
			case "select-all":
				// colorize mask
				Self.ctx.fillRect(0, 0, 1e9, 1e9);
				Self.ctx.fill();
				// march little ants!
				Mask.ants.paint(true);
				break;
			case "deselect":
				Self.ctx.clear();
				// halt ants
				Mask.ants.halt();
				break;
			case "inverse-selection":
				Self.ctx.globalCompositeOperation = "source-out";
				Self.ctx.fillRect(0, 0, 1e9, 1e9);
				Self.ctx.fill();
				// start marching ants
				Mask.ants.paint(true);
				break;
			case "enable":
				Proj.cvs.on("mousedown", Self.doMarquee);
				// temp
				// APP.els.content.find(".tool[data-arg='magic-wand']").trigger("click");
				break;
			case "disable":
				Proj.cvs.off("mousedown", Self.doMarquee);
				break;
		}
	},
	doMarquee(event) {
		let APP = keane,
			Self = APP.tools.marquee,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let option = Self.option,
					File = Projector.file,
					ctx = Mask.ctx,
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					oX = event.offsetX - File.oX,
					oY = event.offsetY - File.oY,
					PI2 = Math.PI * 2;

				Self.drag = { option, ctx, click, oX, oY, PI2 };
				// reset selection canvas
				Mask.cvs.prop({ width: File.width, height: File.height });
				Projector.swap.cvs.prop({ width: File.width, height: File.height });
				// halt ants, if marching (also clears canvas from existing ants)
				Mask.ants.halt(true);

				switch (Self.option) {
					case "lasso":
					case "polygon":
					case "magnetic":
						// TODO: spacial handling
						return;
					case "magic-wand":
						return Mask.dispatch({ type: "select-with-magic-wand", oX, oY });
					case "rectangle":
					case "elliptic":
						/* do stuff below */
				}
				
				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				Projector.doc.on("mousemove mouseup", Self.doMarquee);
				break;
			case "mousemove":
				Drag.oW = event.clientX - Drag.click.x;
				Drag.oH = event.clientY - Drag.click.y;
				
				// clear marquee canvas (fastest way)
				Drag.ctx.clear();

				switch (Self.option) {
					case "rectangle":
						Drag.ctx.fillRect(Drag.oX, Drag.oY, Drag.oW, Drag.oH);
						break;
					case "elliptic":
						let eW = Drag.oW >> 1,
							eH = Drag.oH >> 1,
							eX = Drag.oX + eW,
							eY = Drag.oY + eH;
						if (eW < 0) eW *= -1;
						if (eH < 0) eH *= -1;
						Drag.ctx.ellipse(eX, eY, eW, eH, 0, 0, Drag.PI2);
						break;
				}
				// paint selected area
		    	Drag.ctx.fill();

				// paint ants but no marching
				Mask.ants.paint();
				break;
			case "mouseup":
				// start marching if there is selection
				if (Drag.oW && Drag.oH) Mask.ants.paint(true);
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				Projector.doc.off("mousemove mouseup", Self.doMarquee);
				break;
		}
	}
}
