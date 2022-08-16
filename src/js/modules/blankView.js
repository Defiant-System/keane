
// keane.blankView

{
	init() {
		// fast references
		this.els = {
			el: window.find(".blank-view"),
		};
		// window.settings.clear();
		
		// get settings, if any
		let xList = $.xmlFromString(`<Recents/>`);
		let xSamples = window.bluePrint.selectSingleNode(`//Samples`);
		this.xRecent = window.settings.getItem("recents") || xList.documentElement;

		Promise.all(this.xRecent.selectNodes("./*").map(async xItem => {
				let filepath = xItem.getAttribute("filepath"),
					check = await karaqu.shell(`fs -f '${filepath}'`);
				if (!check.result) {
					xItem.parentNode.removeChild(xItem)
				}
			}))
			.then(() => {
				// add recent files in to data-section
				xSamples.parentNode.append(this.xRecent);

				// render blank view
				window.render({
					template: "blank-view",
					match: `//Data`,
					target: keane.els.blankView
				});

				// setTimeout(() => window.find(".sample:nth(0)").trigger("click"), 100);
				// setTimeout(() => vermeer.dispatch({ type: "close-file" }), 500);
			});
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.blankView,
			file,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "open-filesystem":
				APP.dispatch({ type: "open-file" });
				break;
			case "from-clipboard":
				// TODO
				break;
			case "select-sample":
				el = $(event.target);
				if (!el.hasClass("sample")) return;
				// opening image file from application package
				Files.openLocal(el.data("url"))
					.then(file => {
						// forward event to app
						APP.dispatch({ type: "prepare-file", isSample: true, file })
					});
				break;
			case "select-preset":
				el = $(event.target);

				let width = +el.data("width"),
					height = +el.data("height"),
					fill = "#ddd",
					file = new karaqu.File({ kind: "psd" });
				// set up workspace
				APP.dispatch({ type: "setup-workspace", width, height, fill, file });
				break;
			case "select-recent-file":
				el = $(event.target);
				if (!el.hasClass("recent-file")) return;
				
				karaqu.shell(`fs -o '${el.data("file")}' null`)
					.then(exec => APP.dispatch(exec.result));
				break;
			case "add-recent-file":
				if (!event.file.path) return;
				let str = `<i name="${event.file.base}" filepath="${event.file.path}"/>`,
					xFile = $.nodeFromString(str),
					xExist = Self.xRecent.selectSingleNode(`//Recents/*[@filepath="${event.file.path}"]`);
				// remove entry if already exist
				if (xExist) xExist.parentNode.removeChild(xExist);
				// insert new entry at first position
				Self.xRecent.insertBefore(xFile, Self.xRecent.firstChild);
				break;
		}
	}
}