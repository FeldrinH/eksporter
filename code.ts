function transform(x: number, y: number, t: Transform): {x: number, y: number} {
    return {
        x: x * t[0][0] + y * t[0][1] + t[0][2],
        y: x * t[1][0] + y * t[1][1] + t[1][2]
    }
}

function getBoundingBox(p: RectangleNode) {
    const t = p.relativeTransform
    const points = [transform(0, 0, t), transform(p.width, 0, t), transform(0, p.height, t), transform(p.width, p.height, t)]
    const pointsX = points.map(p => p.x)
    const pointsY = points.map(p => p.y)
    return {xMin: Math.round(Math.min(...pointsX)), yMin: Math.round(Math.min(...pointsY)), xMax: Math.round(Math.max(...pointsX)), yMax: Math.round(Math.max(...pointsY))}
}

function getStyleId(name: string) {
    return figma.getLocalPaintStyles().find(s => s.name == name).id
}

const platvormStyleId = getStyleId("platvorm")
const trapdoorStyleId = getStyleId("trapdoor")

const enemyStyles = new Map([
    [getStyleId("Lind"), "Lind"],
    [getStyleId("Zombie"), "Zombie"],
    [getStyleId("Jälitaja"), "Jälitaja"],
    [getStyleId("Preester"), "Preester"],
    [getStyleId("Vampiir"), "Vampiir"],
])

//console.assert(figma.currentPage.selection.length === 1 && figma.currentPage.selection[0].type === "FRAME", "Please select at least one frame")
const ekraanid = (figma.currentPage.selection.filter(s => s.type === "FRAME") as FrameNode[])
    .map(s => [s, parseInt(s.name.match(/\[([-]?[0-9]+)\]/)[1])] as [FrameNode, number])
    .sort((a,b) => a[1] - b[1])

const outPlatforms = []

ekraanid.forEach(([ekraan, roomId]) => {
    const platvormid: string[] = []

    const asjad = ekraan.findAll(s => s.type == "RECTANGLE") as RectangleNode[]
    asjad.filter(a => a.strokeStyleId == platvormStyleId && a.visible).forEach(p => {
        const bbox = getBoundingBox(p)
        platvormid.push(`Põrand(${bbox.xMin},${bbox.xMax},${bbox.yMin},${bbox.yMax})`)
    })
    asjad.filter(a => a.strokeStyleId == trapdoorStyleId && a.visible).forEach(p => {
        const bbox = getBoundingBox(p)
        const args = p.name.match(/\[([^\]]+)\]/)[1]
        platvormid.push(`Trapdoor(${bbox.xMin},${bbox.xMax},${bbox.yMin},${bbox.yMax},${args})`)
    })

    console.log(`'${ekraan.name}' ${roomId}`)
    outPlatforms.push(`${roomId}:[${platvormid.join(",")}]`)
})

console.log(outPlatforms.join("\n") + "\n")

const outEnemies = []

ekraanid.forEach(([ekraan, roomId]) => {
    const vastased: string[] = []

    const asjad = ekraan.findAll(s => s.type == "RECTANGLE") as RectangleNode[]
    asjad.filter(a => enemyStyles.has(a.fillStyleId as string) && a.visible).forEach(p => {
        const bbox = getBoundingBox(p)
        vastased.push(`${enemyStyles.get(p.fillStyleId as string)}(${bbox.xMin},${bbox.yMax},${bbox.xMax-bbox.xMin},${bbox.yMax-bbox.yMin}, ???)`)
    })

    outEnemies.push(`${roomId}:[${vastased.join(",")}]`)
})

console.log(outEnemies.join("\n") + "\n")

figma.closePlugin();
