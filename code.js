function transform(x, y, t) {
    return {
        x: x * t[0][0] + y * t[0][1] + t[0][2],
        y: x * t[1][0] + y * t[1][1] + t[1][2]
    };
}
const platvormStyleId = figma.getLocalPaintStyles().find(s => s.name == "platvorm").id;
//console.assert(figma.currentPage.selection.length === 1 && figma.currentPage.selection[0].type === "FRAME", "Please select at least one frame")
const ekraanid = figma.currentPage.selection.filter(s => s.type === "FRAME");
const out = [];
ekraanid.forEach(ekraan => {
    const platvormid = [];
    const asjad = ekraan.findAll(s => s.type == "RECTANGLE");
    asjad.filter(a => a.strokeStyleId == platvormStyleId || a.fillStyleId == platvormStyleId).forEach(p => {
        const t = p.relativeTransform;
        const points = [transform(0, 0, t), transform(p.width, 0, t), transform(0, p.height, t), transform(p.width, p.height, t)];
        const pointsX = points.map(p => p.x);
        const pointsY = points.map(p => p.y);
        const eksport = { xMin: Math.round(Math.min(...pointsX)), yMin: Math.round(Math.min(...pointsY)), xMax: Math.round(Math.max(...pointsX)), yMax: Math.round(Math.max(...pointsY)) };
        platvormid.push(eksport);
    });
    const roomId = ekraan.name.match(/\[([-]?[0-9]+)\]/)[1];
    console.log(`'${ekraan.name}' ${roomId}`);
    out.push(`${roomId}:[${platvormid.map(p => `Põrand(${p.xMin},${p.xMax},${p.yMin},${p.yMax})`).join(",")}]`);
});
console.log(out.join(",\n"));
figma.closePlugin();
