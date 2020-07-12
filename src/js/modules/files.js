
const Files = {
	init() {
		// fast references
		this.statusBar = window.find(".status-bar");

		// file stack
		this.stack = [];
	},
	getUniqId() {
		let ids = this.stack.map(f => f._id);
		return Math.max.apply({}, [0, ...ids]) + 1;
	},
	open(xFile) {
		let opt = {
				xFile,
				_id: this.getUniqId(),
				name: xFile.getAttribute("name"),
				scale: +xFile.getAttribute("scale"),
				width: +xFile.getAttribute("width"),
				height: +xFile.getAttribute("height"),
			};
		
		// add file name to xml node
		xFile.setAttribute("_id", opt._id);

		// add statusbar tab
		window.render({
			data: xFile,
			template: "statusbar-tab",
			prepend: this.statusBar,
		});

		// add option to menubar
		window.menuBar.add({
			"parent": "//MenuBar/Menu[@name='Window']",
			"check-group": "selected-file",
			"is-checked": 1,
			"click": "select-file",
			"arg": opt._id,
			"name": opt.name,
		});

		// add to stack
		let file = new File(opt);
		this.stack.push(file);

		// select newly added file
		this.select(opt._id);
	},
	close(id) {
		let el = this.statusBar.find(`.file[data-arg="${id}"]`),
			next = this.statusBar.find(".active");

		// search for previous tab / file
		if (el[0] === next[0]) next = [];
		if (!next.length) next = el.nextAll(".file")
		if (!next.length) next = el.prevAll(".file");

		// remove elmeent
		el.remove();

		// remove option from menubar
		window.menuBar.remove(`//MenuBar/Menu[@name='Window']/*[@arg="${id}"]`);

		if (!next.length) {
			console.log("show initial start view");
		} else if (!next.hasClass("active")) {
			// auto-select next file
			this.select(next.data("arg"));
		}
	},
	select(id) {
		let el = this.statusBar.find(`.file[data-arg="${id}"]`);
		if (el.hasClass("active")) return;

		// ui update active element
		el.parent().find(".active").removeClass("active");
		el.addClass("active");

		// update option in menubar
		window.menuBar.update(`//MenuBar//Menu[@arg="${id}"]`, {"is-checked": "1"});

		// skip rest if this function is called from "open"
		if (Projector.file && Projector.file._id === id) return;

		// reference to active file
		let file = this.stack.find(f => f._id === id);
		Projector.reset(file);
		Projector.render();

		// emit event
		defiant.emit("file-selected");
	}
};
