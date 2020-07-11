
const Projector = {
	init() {
		// fast references
		this.doc = $(document);
		this.els = {
			toolBar    : window.find(".tools-bar"),
			optionsBar : window.find(".tools-options-bar"),
			sideBar    : window.find(".sidebar-wrapper"),
			statusBar  : window.find(".status-bar"),
		};
		// canvases
		this.cvs = window.find(".cvs-wrapper .canvas");
		this.ctx = this.cvs[0].getContext("2d");
		// publicly used swap canvas
		this.swap = { cvs, ctx } = Misc.createCanvas(1, 1);

		// checkers background
		return new Promise(resolve => {
			let image = new Image;
			image.onload = () => {
				Projector.checkers = Projector.ctx.createPattern(image, "repeat");
				resolve();
			};
			image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P8////fwY8YM+ePfikGRhHDRgWYbB792686cDFxQV/Ohg1gIFx6IcBAPU7UXHPhMXmAAAAAElFTkSuQmCC";
		});
	},
	renderFrame(file) {
		// pre-render frame
		let w = file.oW * file.scale,
			h = file.oH * file.scale,
			oX = file.oX || Math.round(this.cX - (w / 2)),
			oY = file.oY || Math.round(this.cY - (h / 2));
		
		// reset canvases
		this.swap.cvs.prop({ width: window.width, height: window.height });
		
		this.swap.ctx.shadowOffsetX = 0;
		this.swap.ctx.shadowOffsetY = 1;
		this.swap.ctx.shadowBlur = 5;
		this.swap.ctx.shadowColor = "#292929";
		this.swap.ctx.fillRect(oX, oY, w, h);
		this.frame = this.swap.ctx.getImageData(0, 0, window.width, window.height);
	},
	reset(file) {
		// reference to displayed file
		this.file = file;
		// reset canvases
		this.cvs.prop({ width: window.width, height: window.height });

		this.aX = file.showRulers ? Rulers.t : 0;
		this.aY = this.els.toolBar.height() + this.els.optionsBar.height() + (file.showRulers ? Rulers.t : 0);
		this.aW = window.width - this.aX - this.els.sideBar.width() + (file.showRulers ? Rulers.t : 0);
		this.aH = window.height - this.aY - (file.showRulers ? Rulers.t : 0); // - this.els.statusBar.height()
		// center
		this.cX = (window.width + this.aX - this.els.sideBar.width()) / 2;
		this.cY = (window.height + this.aY - this.els.statusBar.height()) / 2;

		// pre-render frame
		this.renderFrame(file);
	},
	render(noEmit) {
		// reference to displayed file
		let file = this.file;
		// reset canvas
		this.cvs.prop({ width: window.width, height: window.height });

		this.ctx.save();
		this.ctx.putImageData(this.frame, 0, 0);
		this.ctx.translate(file.oX, file.oY);
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(file.cvs[0], 0, 0, file.w, file.h);
		this.ctx.restore();

		if (file.showRulers) {
			Rulers.render(this);
		}
		if (!noEmit) {
			// emit event
			defiant.emit("projector-update");
		}
	}
};
