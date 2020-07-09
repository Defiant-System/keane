
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
		// canvas
		this.cvs = window.find(".cvs-wrapper .canvas");
		this.ctx = this.cvs[0].getContext("2d");

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
	reset(file) {
		// reference to displayed file
		this.file = file;
		
		// clears canvas
		this.cvs.prop({ width: window.width, height: window.height });

		this.aX = file.showRulers ? Rulers.t : 0;
		this.aY = this.els.toolBar.height() + this.els.optionsBar.height() + (file.showRulers ? Rulers.t : 0);
		this.aW = window.width - this.aX - this.els.sideBar.width() + (file.showRulers ? Rulers.t : 0);
		this.aH = window.height - this.aY - (file.showRulers ? Rulers.t : 0); // - this.els.statusBar.height()
		// center
		this.cX = (window.width + this.aX - this.els.sideBar.width()) / 2;
		this.cY = (window.height + this.aY - this.els.statusBar.height()) / 2;
	},
	render() {
		// reference to displayed file
		let file = this.file;
		// clear canvas
		this.ctx.clearRect(0, 0, 1e6, 1e6);

		this.ctx.save();
		this.ctx.translate(file.oX, file.oY);
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowBlur = 5;
		this.ctx.shadowColor = "#292929";
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(file.cvs[0], 0, 0, file.w, file.h);
		this.ctx.restore();

		if (file.showRulers) {
			Rulers.render(this);
		}

		// emit event
		defiant.emit("projector-update");
	}
};
