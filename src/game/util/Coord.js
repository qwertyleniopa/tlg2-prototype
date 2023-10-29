import bresenham from "bresenham/generator";

/**
 * @param {number[]} coord
 */
function withinBounds([x, y], [width, height]) {
    return x >= 0 && x < width && y >= 0 && y < height;
}

export const Coord = {
    equals(coord1, coord2) {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    },

    *circle(center, radius, bounds) {
        const r2 = radius ** 2;

        for (const [rx, ry] of this.square(center, radius, bounds)) {
            const crx = rx - center[0];
            const cry = ry - center[1];

            if (crx ** 2 + cry ** 2 <= r2 && withinBounds([rx, ry], bounds)) {
                yield [rx, ry];
            }
        }
    },

    *line(from, to, bounds) {
        // lol.
        const pointGenerator = bresenham(from[0], from[1], to[0], to[1]);

        for (const { x, y } of pointGenerator) {
            const cd = [x, y];

            if (withinBounds(cd, bounds)) {
                yield cd;
            }
        }
    },

    *square(center, sideLength, bounds) {
        for (let dy = -sideLength; dy <= sideLength; dy++) {
            for (let dx = -sideLength; dx <= sideLength; dx++) {
                const cd = [center[0] + dx, center[1] + dy];

                if (withinBounds(cd, bounds)) {
                    yield cd;
                }
            }
        }
    },
};
