
const CVS = window.find("canvas");
const CTX = CVS[0].getContext("2d");

CVS.prop({
		width: window.width,
		height: window.height,
	})
	.css({
		width: window.width +"px",
		height: window.height +"px",
	});

CTX.translate(.5,.5);
CTX.strokeStyle = "#000"
CTX.fillStyle = "#fff"


CTX.beginPath();
CTX.rect(160,250,460,340);
//CTX.fillRect(160,250,460,340);
CTX.stroke();
