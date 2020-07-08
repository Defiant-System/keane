
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
	open(opt) {
		let _id = this.getUniqId(),
			file = new File({ _id, ...opt }),
			el = this.statusBar
					.prepend(`<div class="file" data-click="select-file" data-arg="${file._id}">
						<span>${file.name}</span><div class="close" data-click="close-file"></div></div>`);
		// add to stack
		this.stack.push(file);

		// add option to menubar
		window.menuBar.add({
			"parent": "//MenuBar/Menu[@name='Window']",
			"check-group": "selected-file",
			"is-checked": 1,
			"click": "select-file",
			"arg": file._id,
			"name": file.name,
		});

		// select newly added file
		this.select(file._id, true);
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
	select(id, isOpen) {
		let el = this.statusBar.find(`.file[data-arg="${id}"]`);
		if (el.hasClass("active")) return;

		// ui update active element
		el.parent().find(".active").removeClass("active");
		el.addClass("active");

		// update option in menubar
		window.menuBar.update(`//MenuBar//Menu[@arg="${id}"]`, {"is-checked": "1"});

		// skip rest if this function is called from "open"
		if (isOpen) return;

		// reference to active file
		let file = this.stack.find(f => f._id === id);
		Projector.reset(file);
		Projector.render();
	}
};
