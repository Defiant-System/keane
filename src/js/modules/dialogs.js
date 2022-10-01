
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
					
				};
				break;
			case "set-color-opacity":
				console.log(event);
				break;
			case "dlg-ok":
				break;
		}
	}
};
