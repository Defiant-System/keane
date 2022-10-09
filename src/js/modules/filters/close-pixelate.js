
/*
 * Close Pixelate
 * rewrite from:
 *   https://github.com/desandro/close-pixelate/blob/master/close-pixelate.js
 */

let closePixelate = (function() {

    class ClosePixelation {
        constructor() {
            this.cvs = document.createElement("canvas");
            this.ctx = this.cvs.getContext("2d");
        }

        render(opt={}) {
            let cfg = {
                    width: 1,
                    height: 1,
                    layers: [],
                    ...opt,
                };
            // set size
            this.width = this.cvs.width = cfg.width;
            this.height = this.cvs.height = cfg.height;

            this.data = cfg.copy.data;
            // this.ctx.putImageData(cfg.copy, 0, 0);

            cfg.layers.map(layer => this.renderClosePixels(layer));

            return this.ctx.getImageData(0, 0, this.width, this.height);
        }

        renderClosePixels(layer) {
            let opt = {
                    res: 16,
                    size: 16,
                    alpha: 1,
                    offset: 0,
                    size: layer.size || layer.res,
                    ...layer,
                };

            // option defaults
            var data = this.data,
                cl = this.width / opt.res + 1,
                rl = this.height / opt.res + 1,
                hs = opt.size / 2,
                ds = opt.size / Math.SQRT2,
                hds = ds / 2,
                PI2 = Math.PI * 2,
                QPI = Math.PI * .25,
                offsetX,
                offsetY;

            switch (opt.offset.constructor) {
                case Object:
                    offsetX = opt.offset.x || 0;
                    offsetY = opt.offset.y || 0;
                    break;
                case Array:
                    offsetX = opt.offset[0] || 0;
                    offsetY = opt.offset[1] || 0;
                    break;
                default:
                    offsetX =
                    offsetY = opt.offset || 0;
            }

            for (let r=0; r<rl; r++) {
                let y = (r - 0.5) * opt.res + offsetY;
                // normalize y so shapes around edges get color
                let pixelY = Math.max(Math.min(y, this.height-1), 0);

                for (let c=0; c<cl; c++) {
                    let x = (c - 0.5) * opt.res + offsetX,
                        // normalize y so shapes around edges get color
                        pX = Math.max(Math.min(x, this.width-1), 0),
                        pI = (pX + pixelY * this.width) * 4,
                        r = data[pI],
                        g = data[pI + 1],
                        b = data[pI + 2],
                        a = opt.alpha * (data[pI + 3] / 255);

                    this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`;

                    switch (opt.shape) {
                        case "circle" :
                            this.ctx.beginPath();
                            this.ctx.arc (x, y, hs, 0, PI2, true);
                            this.ctx.fill();
                            this.ctx.closePath();
                            break
                        case "diamond" :
                            this.ctx.save();
                            this.ctx.translate(x, y);
                            this.ctx.rotate(QPI);
                            this.ctx.fillRect(-hds, -hds, ds, ds);
                            this.ctx.restore();
                            break
                        default :
                            // square
                            this.ctx.fillRect(x-hs, y-hs, opt.size, opt.size);
                    }
                }
            }
        }
    }

    let CP = new ClosePixelation;

    return (...opt) => CP.render(...opt);

})();
