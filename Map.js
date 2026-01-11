class Map {
    constructor(width, height, spawnZone = { xMin: 0, xMax: width, yMin: 0, yMax: height }) {
        this.width = width;
        this.height = height;
        this.spawnZone = spawnZone; // { xMin, xMax, yMin, yMax }
    }
    isInsideBounds(x, y) {
        return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
    }
    getRandomSpawnPoint() {
        const x = Math.floor(Math.random() * (this.spawnZone.xMax - this.spawnZone.xMin)) + this.spawnZone.xMin;
        const y = Math.floor(Math.random() * (this.spawnZone.yMax - this.spawnZone.yMin)) + this.spawnZone.yMin;
        return { x, y };
    }
    
}
export default Map;