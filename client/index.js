const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

var request = new XMLHttpRequest();
request.open("GET", "./mockups.json", false);
request.send(null)
const mockups = JSON.parse(request.responseText);

const color = {
    "teal": "#7ADBBC",
    "lgreen": "#B9E87E",
    "orange": "#E7896D",
    "yellow": "#FDF380",
    "lavender": "#B58EFD",
    "pink": "#EF99C3",
    "vlgrey": "#E8EBF7",
    "lgrey": "#AA9F9E",
    "guiwhite": "#FFFFFF",
    "black": "#484848",
    "blue": "#3CA4CB",
    "green": "#8ABC3F",
    "red": "#E03E41",
    "gold": "#EFC74B",
    "purple": "#8D6ADF",
    "magenta": "#CC669C",
    "grey": "#A7A7AF",
    "dgrey": "#726F6F",
    "white": "#DBDBDB",
    "guiblack": "#000000",
    "paletteSize": 10,
    "border": 0.65
}
function getEntityImageFromMockup(index, color = mockups[index].color) {
    let mockup = mockups[index];
    return {
        time: 0,
        index: index,
        x: mockup.x,
        y: mockup.y,
        vx: 0,
        vy: 0,
        size: mockup.size,
        realSize: mockup.realSize,
        color: color,
        render: {
            status: {
                getFade: () => {
                    return 1;
                },
                getColor: () => {
                    return '#FFFFFF';
                },
                getBlend: () => {
                    return 0;
                },
                health: {
                    get: () => {
                        return 1;
                    },
                },
                shield: {
                    get: () => {
                        return 1;
                    },
                },
            },
        },
        facing: mockup.facing,
        shape: mockup.shape,
        name: mockup.name,
        score: 0,
        tiggle: 0,
        layer: mockup.layer,
        guns: {
            length: mockup.guns.length,
            getPositions: () => {
                let a = [];
                mockup.guns.forEach(() => a.push(0));
                return a;
            },
            update: () => { },
        },
        turrets: mockup.turrets.map((t) => {
            let o = getEntityImageFromMockup(t.index);
            o.realSize = o.realSize / o.size * mockup.size * t.sizeFactor;
            o.size = mockup.size * t.sizeFactor;
            o.angle = t.angle;
            o.offset = t.offset;
            o.direction = t.direction;
            o.facing = t.direction + t.angle;
            return o;
        }),
    };
}

let image = getEntityImageFromMockup(250);

let mixColors = (() => {
    /** https://gist.github.com/jedfoster/7939513 **/
    function d2h(d) {
        return d.toString(16);
    } // convert a decimal value to hex
    function h2d(h) {
        return parseInt(h, 16);
    } // convert a hex value to decimal
    return (color_2, color_1, weight = 0.5) => {
        if (weight === 1) return color_1;
        if (weight === 0) return color_2;
        var col = "#";
        for (var i = 1; i <= 6; i += 2) { // loop through each of the 3 hex pairs—red, green, and blue, skip the '#'
            var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
                v2 = h2d(color_2.substr(i, 2)),
                // combine the current pairs from each source color, according to the specified weight
                val = d2h(Math.floor(v2 + (v1 - v2) * weight));
            while (val.length < 2) {
                val = '0' + val;
            } // prepend a '0' if val results in a single digit
            col += val; // concatenate val to our new color string
        }
        return col; // PROFIT!
    };
})();
function getColor(colorNumber) {
    switch (colorNumber) {
        case 0:
            return color.teal;
        case 1:
            return color.lgreen;
        case 2:
            return color.orange;
        case 3:
            return color.yellow;
        case 4:
            return color.lavender;
        case 5:
            return color.pink;
        case 6:
            return color.vlgrey;
        case 7:
            return color.lgrey;
        case 8:
            return color.guiwhite;
        case 9:
            return color.black;
        case 10:
            return color.blue;
        case 11:
            return color.green;
        case 12:
            return color.red;
        case 13:
            return color.gold;
        case 14:
            return color.purple;
        case 15:
            return color.magenta;
        case 16:
            return color.grey;
        case 17:
            return color.dgrey;
        case 18:
            return color.white;
        case 19:
            return color.guiblack;
        default:
            return '#FF0000';
    }
}

function getColorDark(givenColor) {
    let dark = color.black;
    return mixColors(givenColor, dark, color.border);
}

function setColor(context, givenColor) {
    context.fillStyle = givenColor;
    context.strokeStyle = getColorDark(givenColor);
}

const drawEntity = (() => {
    // Sub-drawing functions
    function drawPoly(context, centerX, centerY, radius, sides, angle = 0, fill = true) {
        angle += (sides % 2) ? 0 : Math.PI / sides;
        // Start drawing
        context.beginPath();
        if (!sides) { // Circle
            let fillcolor = context.fillStyle;
            let strokecolor = context.strokeStyle;
            radius += context.lineWidth / 4;
            context.arc(centerX, centerY, radius + context.lineWidth / 4, 0, 2 * Math.PI);
            context.fillStyle = strokecolor;
            context.fill();
            context.closePath();
            context.beginPath();
            context.arc(centerX, centerY, radius - context.lineWidth / 4, 0, 2 * Math.PI);
            context.fillStyle = fillcolor;
            context.fill();
            context.closePath();
            return;
        } else if (sides < 0) { // Star
            let dip = 1 - (6 / sides / sides);
            sides = -sides;
            context.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
            for (let i = 0; i < sides; i++) {
                var theta = (i + 1) / sides * 2 * Math.PI;
                var htheta = (i + 0.5) / sides * 2 * Math.PI;
                var c = {
                    x: centerX + radius * dip * Math.cos(htheta + angle),
                    y: centerY + radius * dip * Math.sin(htheta + angle),
                };
                var p = {
                    x: centerX + radius * Math.cos(theta + angle),
                    y: centerY + radius * Math.sin(theta + angle),
                };
                context.quadraticCurveTo(c.x, c.y, p.x, p.y);
            }
        } else if (sides === 600) {
            for (let i = 0; i < 6; i++) {
                let theta = (i / 6) * 2 * Math.PI,
                    x = centerX + radius * 1.1 * Math.cos(180 / 6 + theta + angle + 0.385),
                    y = centerY + radius * 1.1 * Math.sin(180 / 6 + theta + angle + 0.385);
                context.lineTo(x, y);
            }
        } else if (sides > 0) { // Polygon
            for (let i = 0; i < sides; i++) {
                let theta = (i / sides) * 2 * Math.PI;
                let x = centerX + radius * Math.cos(theta + angle);
                let y = centerY + radius * Math.sin(theta + angle);
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.stroke();
        if (fill) {
            context.fill();
        }
        context.lineJoin = 'round';
    }

    function drawTrapezoid(context, x, y, length, height, aspect, angle) {
        let h = [];
        h = (aspect > 0) ? [height * aspect, height] : [height, -height * aspect];
        let r = [
            Math.atan2(h[0], length),
            Math.atan2(h[1], length)
        ];
        let l = [
            Math.sqrt(length * length + h[0] * h[0]),
            Math.sqrt(length * length + h[1] * h[1])
        ];
        context.beginPath();
        context.lineTo(x + l[0] * Math.cos(angle + r[0]), y + l[0] * Math.sin(angle + r[0]));
        context.lineTo(x + l[1] * Math.cos(angle + Math.PI - r[1]), y + l[1] * Math.sin(angle + Math.PI - r[1]));
        context.lineTo(x + l[1] * Math.cos(angle + Math.PI + r[1]), y + l[1] * Math.sin(angle + Math.PI + r[1]));
        context.lineTo(x + l[0] * Math.cos(angle - r[0]), y + l[0] * Math.sin(angle - r[0]));
        context.closePath();
        context.stroke();
        context.fill();
    }
    // The big drawing function
    return (x, y, instance, ratio, alpha = 1, scale = 1, rot = 0, turretsObeyRot = false, assignedContext = false, turretInfo = false, render = instance.render) => {
        let context = ctx;
        let fade = turretInfo ? 1 : render.status.getFade(),
            drawSize = scale * ratio * instance.size,
            m = mockups[instance.index],
            xx = x,
            yy = y,
            source = (turretInfo === false) ? instance : turretInfo;
        if (fade === 0 || alpha === 0) return;
        if (render.expandsWithDeath) drawSize *= (1 + 0.5 * (1 - fade));
        if (fade * alpha < 0.5) return;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        // Draw turrets beneath us
        if (source.turrets.length === m.turrets.length) {
            for (let i = 0; i < m.turrets.length; i++) {
                let t = m.turrets[i];
                source.turrets[i].lerpedFacing == false;
                if (t.layer === 0) {
                    let ang = t.direction + t.angle + rot,
                        len = t.offset * drawSize;
                    drawEntity((xx + len * Math.cos(ang)), (yy + len * Math.sin(ang)), t, ratio, 1, drawSize / ratio / t.size * t.sizeFactor, source.turrets[i].lerpedFacing + turretsObeyRot * rot, turretsObeyRot, context, source.turrets[i], render);
                }
            }
        } else {
            throw new Error("Mismatch turret number with mockup.");
        }
        // Draw guns
        source.guns.update();
        context.lineWidth = 10;
        setColor(context, mixColors(color.grey, render.status.getColor(), render.status.getBlend()));
        if (source.guns.length === m.guns.length) {
            let positions = source.guns.getPositions();
            for (let i = 0; i < m.guns.length; i++) {
                let g = m.guns[i],
                    position = positions[i] / ((g.aspect === 1) ? 2 : 1),
                    gx = g.offset * Math.cos(g.direction + g.angle + rot) + (g.length / 2 - position) * Math.cos(g.angle + rot),
                    gy = g.offset * Math.sin(g.direction + g.angle + rot) + (g.length / 2 - position) * Math.sin(g.angle + rot);
                drawTrapezoid(context, xx + drawSize * gx, yy + drawSize * gy, drawSize * (g.length / 2 - ((g.aspect === 1) ? position * 2 : 0)), drawSize * g.width / 2, g.aspect, g.angle + rot);
            }
        } else {
            throw new Error("Mismatch gun number with mockup.");
        }
        // Draw body
        context.globalAlpha = 1;
        setColor(context, mixColors(getColor(instance.color), render.status.getColor(), render.status.getBlend()));
        drawPoly(context, xx, yy, drawSize / m.size * m.realSize, m.shape, rot);
        // Draw turrets above us
        if (source.turrets.length === m.turrets.length) {
            for (let i = 0; i < m.turrets.length; i++) {
                let t = m.turrets[i];
                if (t.layer === 1) {
                    let ang = t.direction + t.angle + rot,
                        len = t.offset * drawSize;
                    drawEntity((xx + len * Math.cos(ang)), (yy + len * Math.sin(ang)), t, ratio, 1, drawSize / ratio / t.size * t.sizeFactor, source.turrets[i].lerpedFacing + turretsObeyRot * rot, turretsObeyRot, context, source.turrets[i], render);
                }
            }
        } else {
            throw new Error("Mismatch turret number with mockup.");
        }
        if (assignedContext == false && context != ctx && context.canvas.width > 0 && context.canvas.height > 0) {
            ctx.save();
            ctx.globalAlpha = alpha * fade;
            ctx.imageSmoothingEnabled = false;
            //ctx.globalCompositeOperation = "overlay";
            ctx.drawImage(context.canvas, x - xx, y - yy);
            ctx.restore();
            //ctx.globalCompositeOperation = "source-over";
        }
    };
})();

drawEntity(canvas.width / 2, canvas.height / 2, image, 1, 1, 3, 0, true, true, false);

document.getElementById("random").addEventListener("click", event => {
    let index = Math.floor(Math.random() * mockups.length);
    let mockupcolor = mockups[index].color === 16 ? 10 : mockups[index].color;
    let image = getEntityImageFromMockup(index, mockupcolor);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEntity(canvas.width / 2, canvas.height / 2, image, 1, 1, 3, 0, true, true, false);
});