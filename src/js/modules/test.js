
let Test = {
	init() {
		// UI temp
		// setTimeout(() => UI.content.find(".option[data-options='pop-gradient-strips'] .value").trigger("click"), 200);
		// setTimeout(() => UI.content.find(".option[data-options='pop-brush-tips'] .value").trigger("click"), 200);

		// Sidebar Index
		window.find(`div[data-content="info"]`).trigger("click");
		// window.find(`div[data-content="swatches"]`).trigger("click");
		// window.find(`div[data-content="channels"]`).trigger("click");
		// window.find(`div[data-content="paragraph"]`).trigger("click");


		// Sidebar box; color
		// setTimeout(() => window.find(`.swatches-wrapper > div:nth(0)`).trigger("click"), 500);


		// Sidebar box; navigator
		// setTimeout(() => root.find(".icon.mini").trigger("click"), 900);
		// setTimeout(() => root.find(".icon.maxi").trigger("click"), 700);


		// Sidebar box; paragraph
		// setTimeout(() => window.find(`.swatches-wrapper > div:nth(0)`).trigger("click"), 500);

		
		// Sidebar box; swatches
		// setTimeout(() => this.els.root.find(".swatches-wrapper > div:nth(4)").trigger("click"), 300);



		// Tools index
		// setTimeout(() => window.find(`.fg-color`).trigger("click"), 500);
		// setTimeout(() => window.find(`.option .tip-icon`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-options-brush .tool-feather`).trigger("click"), 500);


		// Tools Marquee
		// setTimeout(() => window.find(`.tool-marquee-circle`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-wand`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-lasso`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool-lasso-polygon`).trigger("click"), 500);
		// setTimeout(() => window.find(`.tool.icon-marquee-union`).trigger("click"), 500);


		// temp
		// setTimeout(this.dialogs, 500);
		// setTimeout(this.mask, 600);
		// setTimeout(this.marquee, 500);
	},
	marquee() {
		Projector.file.dispatch({ type: "set-scale", scale: 32 });
		Projector.file.dispatch({ type: "pan-canvas", top: -390, left: -180, noZoom: true });
		// window.find(`.tool[data-content="move"]`).trigger("click");

		Mask.dispatch({ type: "select-rect", rect: { x: 10, y: 20, w: 13, h: 10 } });
		// Mask.dispatch({ type: "select-rect", rect: { x: 350, y: 140, w: 130, h: 210 } });

		// setTimeout(() => window.find(`.sidebar-wrapper .icon-eye-on`).trigger("click"), 600);
	},
	dialogs() {
		// root.find(`.icon[data-click="add-layer"]`).trigger("click");

		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "clouds" }), 200);
		
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "crystallize,10" }), 200);
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "pointillize,10" }), 200);
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "stainedGlass,10,4" }), 200);
		
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "invert" }), 400);
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "dither" }), 400);
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "gaussianBlur,3" }), 400);
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "brightness,-25" }), 400);
		// setTimeout(() => keane.dispatch({ type: "filter-render", arg: "emboss" }), 400);
		// return;

		// dlgBrightnessContrast
		// dlgGaussianBlur
		// dlgThreshold
		// dlgMosaic
		// dlgSponge
		// dlgPixelator
		// dlgCrystallize
		// dlgPointillize
		// dlgStroke
		UI.doDialog({
			type: "dlg-open",
			name: "dlgPixelator",
			// callback: ev => console.log(ev),
		});
	},
	mask() {
		Mask.dispatch({ type: "select-rect", rect: { x: 200, y: 110, w: 130, h: 210 } });
		// Mask.dispatch({ type: "select-rect", rect: { x: 140, y: 90, w: 150, h: 220 }, method: "subtract" });
		// Mask.dispatch({ type: "select-rect", rect: { x: 140, y: 90, w: 150, h: 220 }, method: "union" });
		// Mask.dispatch({ type: "select-elliptic", elps: { x: 300, y: 150, rX: 70, rY: 90 } });
		// Mask.dispatch({ type: "select-elliptic", elps: { x: 250, y: 130, rX: 120, rY: 70 }, method: "union" });
		// Mask.dispatch({ type: "select-polygon", points: [ 50, 50, 80, 40, 190, 70, 210, 240, 160, 170, 110, 160, 30, 190 ], method: "union" });
		// return;


		// setTimeout(() =>  window.find(`.tool[data-click="toggle-quick-mask-mode"]`).trigger("click"), 700);

		// setTimeout(() => keane.dispatch({ type: "edit-action", arg: "stroke,#000000,center,6" }), 300);
		
		// setTimeout(() => Mask.dispatch({ type: "select-none" }), 220);
		// setTimeout(() => keane.dispatch({ type: "edit-action", arg: "fill,#ff0000" }), 200);

		// Mask.dispatch({ type: "inverse-selection" });

		// setTimeout(() => $(".def-desktop_").trigger("mousedown").trigger("mouseup"), 200);

		// setTimeout(() => Mask.dispatch({ type: "select-elliptic", elps: { x: 300, y: 220, rX: 70, rY: 90 } }), 300);
	}
};
