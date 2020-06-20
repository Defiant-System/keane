
// TOOLS.marquee

{
	init() {
		this.cvs = $(document.createElement("canvas"));
		this.ctx = this.cvs[0].getContext("2d");
		this.ctx.fillStyle = "#000";
		this.threshold = 0xC0;

		// subscribe to events
		defiant.on("load-canvas", this.dispatch);
	},
	dispatch(event) {
		let APP = photoshop,
			CVS = Canvas,
			Self = TOOLS.marquee,
			Drag = Self.drag,
			_max = Math.max,
			_min = Math.min;

		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				Self.drag = {
					clickX: event.clientX,
					clickY: event.clientY,
					oX: event.offsetX - CVS.oX,
					oY: event.offsetY - CVS.oY,
				};

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// bind event handlers
				CVS.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let x = event.clientX - Drag.clickX,
					y = event.clientY - Drag.clickY;
				
				Self.cvs.prop({ width: Self.w, height: Self.h });
				Self.ctx.fillRect(Drag.oX, Drag.oY, x, y);
				
				// overlay painted canvas
				CVS.reset();
				CVS.ctx.drawImage(Self.cvs[0], 0, 0, Self.w, Self.h);
				break;
			case "mouseup":
				// remove class
				APP.els.content.removeClass("cover");
				// unbind event handlers
				CVS.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "load-canvas":
				Self.w = CVS.oW;
				Self.h = CVS.oH;
				Self.cvs.prop({ width: Self.w, height: Self.w });

				// temp
				Self.ctx.fillRect(60, 70, 100, 100);
				//Self.ctx.fillRect(130, 120, 100, 100);
				Self.ctx.arc(180, 180, 90, 0, 2 * Math.PI);
    			Self.ctx.fill();
				Self.ants();
				break;
			case "enable":
				CVS.cvs.on("mousedown", Self.dispatch);
				break;
			case "disable":
				CVS.cvs.off("mousedown", Self.dispatch);
				break;
		}
	},
	match(x, y) {
		let alpha = this.get(x, y);
		return alpha == null || alpha >= this.threshold;
	},
	isEdge(x, y) {
		return  !this.match(x-1, y-1) || !this.match(x+0, y-1) || !this.match(x+1, y-1) ||
				!this.match(x-1, y+0) ||        false          || !this.match(x+1, y+0) ||
				!this.match(x-1, y+1) || !this.match(x+0, y+1) || !this.match(x+1, y+1);
	},
	set(x, y, value) {
		let offset = ((y * this.w) + x) * 4;
		this.data[offset + 0] = value;
		this.data[offset + 1] = value;
		this.data[offset + 2] = value;
		this.data[offset + 3] = 0xFF;
	},
	get(x, y) {
		if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
		let offset = ((y * this.w) + x) * 4;
		return this.data[offset + 3];
	},
	getOutlineMask() {
		let src = this.ctx.getImageData(0, 0, this.w, this.h);
		this.data = src.data;

		for (let y=0; y<this.h; y++) {
			for (let x=0; x<this.w; x++) {
				let value = this.match(x, y) && this.isEdge(x, y) ? 0x00 : 0xFF;
				this.set(x, y, value);
			}
		}

		return src;
	},
	ants() {
		let CVS = Canvas,
			mask = this.getOutlineMask();
		
		CVS.ctx.putImageData(mask, CVS.oX, CVS.oY);
		//Canvas.ctx.drawImage(Self.cvs[0], 0, 0, Self.w, Self.h);
	}
}
