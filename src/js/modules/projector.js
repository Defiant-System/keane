
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
		let checkers = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2P8////fwY8YM+ePfikGRhHDRgWYbB792686cDFxQV/Ohg1gIFx6IcBAPU7UXHPhMXmAAAAAElFTkSuQmCC";
		Misc.createPattern(checkers, p => { Projector.checkers = p; });

		// reset projector
		//this.reset();
	},
	reset() {
		let APP = photoshop,
			File = this.file || {};
		
		this.aX = File.showRulers ? Rulers.t : 0;
		this.aY = this.els.toolBar.height() + this.els.optionsBar.height() + (File.showRulers ? Rulers.t : 0);
		this.aW = window.width - this.aX - this.els.sideBar.width() + (File.showRulers ? Rulers.t : 0);
		this.aH = window.height - this.aY - (File.showRulers ? Rulers.t : 0); // - this.els.statusBar.height()
		// center
		this.cX = (window.width + this.aX - this.els.sideBar.width()) / 2;
		this.cY = (window.height + this.aY - this.els.statusBar.height()) / 2;
		// clears canvas
		this.cvs.prop({ width: window.width, height: window.height });
	},
	render(file) {
		// reference to displayed file
		this.file = file;

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
