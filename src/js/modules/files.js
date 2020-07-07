
const Files = {
	init() {
		// fast references
		this.statusBar = window.find(".status-bar");

		// file stack
		this.stack = [];
	},
	open(path) {
		let file = new File(path),
			el = this.statusBar
					.prepend(`<div class="file" data-click="select-file" data-arg="${file.path}">
						<span>${file.name}</span><div class="close" data-click="close-file"></div></div>`);
		// add to stack
		this.stack.push(file);

		// add option to menubar
		window.menuBar.add({
			"parent": "//MenuBar/Menu[@name='Window']",
			"check-group": "selected-file",
			"is-checked": 1,
			"click": "select-file",
			"arg": file.path,
			"name": file.name,
		});
		
		// select newly added file
		this.select(path);

		return file;
	},
	close(path) {
		let el = this.statusBar.find(`.file[data-arg="${path}"]`),
			next = this.statusBar.find(".active");

		// search for previous tab / file
		if (el[0] === next[0]) next = [];
		if (!next.length) next = el.nextAll(".file")
		if (!next.length) next = el.prevAll(".file");

		// remove elmeent
		el.remove();

		// remove option from menubar
		window.menuBar.remove(`//MenuBar/Menu[@name='Window']/*[@arg="${path}"]`);

		if (!next.length) {
			// todo: show initial start view
		} else if (!next.hasClass("active")) {
			// auto-select next file
			this.select(next.data("arg"));
		}
	},
	select(path) {
		let el = this.statusBar.find(`.file[data-arg="${path}"]`);
		// ui update active element
		el.parent().find(".active").removeClass("active");
		el.addClass("active");

		// update option in menubar
		window.menuBar.update(`//MenuBar//Menu[@arg="${path}"]`, {"is-checked": 1});

		// reference to active file
		this._active = this.stack.find(f => f.path === path);

		return this._active;
	}
};
