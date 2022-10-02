
const Dialogs = {
	dlgGaussianBlur(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		// console.log(event);
		switch (event.type) {
			case "dlg-close":
				UI.doDialog(event);
				break;
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgSharpen(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		// console.log(event);
		switch (event.type) {
			case "dlg-close":
				UI.doDialog(event);
				break;
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgColors(event) {
		let APP = keane,
			Self = Dialogs,
			value,
			el;
		switch (event.type) {
			case "dlg-open":
				value = "#ffffff";
				// set "current color"
				event.dEl.find(".dlg-content").css({
					"--color": value,
					"--old-color": value,
					"--alpha": 1,
					"--old-alpha": 1,
				});
				// save reference to event
				Self.srcEvent = event;
				break;
			case "dlg-close":
				UI.doDialog(event);
				// delete reference
				delete Self.srcEvent;
				break;
			case "dlg-ok":
				el = Self.srcEvent.dEl.find(".dlg-content");
				Self.srcEvent.callback({
					value: el.cssProp("--color"),
					src: event.src,
				});
				// close dialog
				Self.dlgColors({ ...event, type: "dlg-close" });
				break;
			case "before-knob": // <-- called before knob is turned
				// fast references
				Self.els = {
					content: event.dEl.find(".dlg-content"),
				};
				break;
			case "set-color-opacity":
				Self.els.content.css({ "--alpha": event.value / 100 });
				break;
		}
	}
};
