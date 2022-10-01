
const Dialogs = {
	dlgGaussianBlur(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		switch (event.type) {
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgSharpen(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		switch (event.type) {
			case "dlg-ok":
			case "dlg-preview":
				break;
		}
	},
	dlgColors(event) {
		let APP = keane,
			Self = Dialogs,
			el;
		switch (event.type) {
			case "before-knob": // <-- called before knob is turned
				// fast references
				Self.els = {
					content: event.dEl.find(".dlg-content"),
				};
				break;
			case "set-color-opacity":
				Self.els.content.css({ "--alpha": event.value / 100 });
				break;
			case "dlg-ok":
				break;
		}
	}
};
