
// keane.statusbar

{
	init() {
		
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
		}
	}
}

