
// TOOLS.marquee

{
	init() {
		this.dCvs = $(document.createElement("canvas"));
		this.dCtx = this.dCvs[0].getContext("2d");
		this.sCvs = $(document.createElement("canvas"));
		this.sCtx = this.sCvs[0].getContext("2d");
		this.sCtx.fillStyle = "#000";
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
				
				Self.sCvs.prop({ width: Self.w, height: Self.h });
				Self.sCtx.fillRect(Drag.oX, Drag.oY, x, y);
				
				// overlay painted canvas
				CVS.reset();
				CVS.ctx.drawImage(Self.sCvs[0], 0, 0, Self.w, Self.h);
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
				Self.sCvs.prop({ width: Self.w, height: Self.h });

				// temp
				//Self.sCtx.translate(.5, .5);
				// Self.sCtx.lineWidth = 15;
				// Self.sCtx.beginPath();
				// Self.sCtx.rect(60, 70, 100, 100);
    			// Self.sCtx.stroke();

				Self.sCtx.rect(60, 70, 100, 100);
				//Self.sCtx.fillRect(130, 120, 100, 100);
				Self.sCtx.arc(180, 180, 90, 0, 2 * Math.PI);
    			Self.sCtx.fill();
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
	getOutlineMask() {
		let srcImg = this.sCtx.getImageData(0, 0, this.w, this.h),
			dstImg = this.sCtx.getImageData(0, 0, this.w, this.h),
			srcData = srcImg.data,
			dstData = dstImg.data,
			match = (x, y) => {
				let alpha = get(x, y);
				return alpha === null || alpha >= this.threshold;
			},
			isEdge = (x, y) => {
				let x1 = x - 1, x2 = x + 1,
					y1 = y - 1, y2 = y + 1;
				return  !match(x1, y1) || !match(x, y1) || !match(x2, y1) ||
						!match(x1, y)  ||     false     || !match(x2, y)  ||
						!match(x1, y2) || !match(x, y2) || !match(x2, y2);
			},
			set = (x, y, v) => {
				let o = ((y * this.w) + x) * 4;
				dstData[o+0] = v;
				dstData[o+1] = v;
				dstData[o+2] = v;
				dstData[o+3] = 0xFF;
			},
			get = (x, y) => {
				if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
				let o = ((y * this.w) + x) * 4;
				return srcData[o+3];
			};
		// iterate image data and find outline
		for (let y=0; y<this.h; y++) {
			for (let x=0; x<this.w; x++) {
				let value = match(x, y) && isEdge(x, y) ? 0x00 : 0xFF;
				set(x, y, value);
			}
		}
		return dstImg;
	},
	ants() {
		let CVS = Canvas,
			mask = this.getOutlineMask();
		
		CVS.ctx.putImageData(mask, CVS.oX, CVS.oY);
		//Canvas.ctx.drawImage(this.cvs[0], 0, 0, this.w, this.h);
	}
}
