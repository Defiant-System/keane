
const Tabs = {
	init() {
		// fast references
		this.statusBar = window.find(".status-bar");

		// file stack
		this._stack = [];
	},
	getUniqId() {
		let ids = this._stack.map(f => f._id);
		return Math.max.apply({}, [0, ...ids]) + 1;
	},
	resize(event) {
		// forward resize event to open files
		this._stack.map(file => file.dispatch(event));
	},
	open(fsFile, opt={}) {
		if (!opt.fill) opt.fill = "transparent";
		if (!fsFile) fsFile = new karaqu.File({ kind: "psd" });
		
		// create file
		let file = new File(fsFile, opt);
		let fileId = file._file.id;
		let xNode = file._file.xNode;

		if (!xNode) {
			xNode = $.nodeFromString(`<i id="${file._file.id}" name="${file._file.base}" />`);
		}

		// add to stack
		this._stack.push(file);

		// add statusbar tab
		window.render({
			data: xNode,
			template: "statusbar-tab",
			prepend: this.statusBar,
		});

		// add option to menubar
		window.menuBar.add({
			"parent": "//MenuBar/Menu[@name='Window']",
			"check-group": "selected-file",
			"is-checked": 1,
			"click": "select-file",
			"arg": fileId,
			"name": fsFile.base,
		});

		// select newly added file
		this.select(fileId);

		if (opt.test) {
			setTimeout(Test[opt.test], 100);
		}
	},
	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;
					file.size = blob.size;
					resolve(file);
				})
				.catch(err => reject(err));
		});
	},
	close(id) {
		let APP = keane,
			el = this.statusBar.find(`.file[data-arg="${id}"]`),
			next = this.statusBar.find(".active");

		// search for previous tab / file
		if (el[0] === next[0]) next = [];
		if (!next.length) next = el.nextAll(".file")
		if (!next.length) next = el.prevAll(".file");

		// remove file from stack
		let file = this._stack.find(f => f._file.id === id);
		this._stack.splice(this._stack.indexOf(file), 1);

		// remove elmeent
		el.remove();

		// remove option from menubar
		window.menuBar.remove(`//MenuBar/Menu[@name='Window']/*[@arg="${id}"]`);

		if (!next.length) {
			// reset app by default - show initial view
			// APP.dispatch({ type: "show-blank-view" });
		} else if (!next.hasClass("active")) {
			// auto-select next file
			this.select(next.data("arg"));
		}
	},
	select(id) {
		let el = this.statusBar.find(`.file[data-arg="${id}"]`);
		if (this._active) {
			if (this._active[0] === el[0]) return;
			this._active.removeClass("active");
		}
		// ui update active element
		this._active = el.addClass("active");

		// update option in menubar
		window.menuBar.update(`//MenuBar//Menu[@arg="${id}"]`, {"is-checked": "1"});

		// skip rest if this function is called from "open"
		if (Projector.file && Projector.file._file.id === id) return;

		// reference to active file
		let file = this._stack.find(f => f._file.id === id);

		Projector.reset(file);
		Projector.render();
	}
};
