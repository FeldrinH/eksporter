function transform(x, y, t) {
    return {
        x: x * t[0][0] + y * t[0][1] + t[0][2],
        y: x * t[1][0] + y * t[1][1] + t[1][2]
    };
}
function getBoundingBox(p) {
    const t = p.relativeTransform;
    const points = [transform(0, 0, t), transform(p.width, 0, t), transform(0, p.height, t), transform(p.width, p.height, t)];
    const pointsX = points.map(p => p.x);
    const pointsY = points.map(p => p.y);
    return { xMin: Math.round(Math.min(...pointsX)), yMin: Math.round(Math.min(...pointsY)), xMax: Math.round(Math.max(...pointsX)), yMax: Math.round(Math.max(...pointsY)) };
}
const platvormStyleId = figma.getLocalPaintStyles().find(s => s.name == "platvorm").id;
const trapdoorStyleId = figma.getLocalPaintStyles().find(s => s.name == "trapdoor").id;
//console.assert(figma.currentPage.selection.length === 1 && figma.currentPage.selection[0].type === "FRAME", "Please select at least one frame")
const ekraanid = figma.currentPage.selection.filter(s => s.type === "FRAME");
const out = [];
ekraanid.forEach(ekraan => {
    const platvormid = [];
    const asjad = ekraan.findAll(s => s.type == "RECTANGLE");
    asjad.filter(a => a.strokeStyleId == platvormStyleId || a.fillStyleId == platvormStyleId).forEach(p => {
        const bbox = getBoundingBox(p);
        platvormid.push(`Põrand(${bbox.xMin},${bbox.xMax},${bbox.yMin},${bbox.yMax})`);
    });
    asjad.filter(a => a.strokeStyleId == trapdoorStyleId || a.fillStyleId == trapdoorStyleId).forEach(p => {
        const bbox = getBoundingBox(p);
        const args = p.name.match(/\[([^\]]+)\]/)[1];
        platvormid.push(`Trapdoor(${bbox.xMin},${bbox.xMax},${bbox.yMin},${bbox.yMax},${args})`);
    });
    const roomId = ekraan.name.match(/\[([-]?[0-9]+)\]/)[1];
    console.log(`'${ekraan.name}' ${roomId}`);
    out.push(`${roomId}:[${platvormid.join(",")}]`);
});
console.log(out.join("\n"));
figma.closePlugin();
