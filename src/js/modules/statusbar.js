
// keane.statusbar

{
	init() {
		// fast references
		this.els = {
			statusBar: window.find(".status-bar"),
		};
	},
	dispatch(event) {
		let APP = keane,
			Self = APP.statusbar,
			Detail = event.detail;
		// console.log( event );
		switch (event.type) {
			case "select-file":
				Tabs.select(event.arg);
				break;
			case "close-file":
				Tabs.close(event.el.parent().data("arg"));
				break;
			case "toggle-statusbar":
				Self.els.statusBar.toggleClass("hidden", event.checked === 1);
				break;
			case "new-from-clipboard":
				APP.blankView.dispatch(event);
				break;
		}
	}
}

