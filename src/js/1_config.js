const TICKS = 1000/60.0;
const SCREENS_W = 8;
const SCREENS_H = 19;
const ROOM_WIDTH = 16;
const ROOM_HEIGHT = 13;
const PROOM_WIDTH = ROOM_WIDTH*16;
const PROOM_HEIGHT = ROOM_HEIGHT*16;
const GRAVITY = 1;

let TILE = {
    AIR: 0,
    FLOOR: 1, 
    WALL: 2
};

// Auto-for
// Basically a shortened version of the old for(let i = 0; i < array.length; i++) line
let afor = (array, callback) => {
    for(let i = 0; i < array.length; i++) {
        callback(array[i], i);
    }
};

let rfor = (limit, callback) => {
    for(let i = 0; i < limit; i++) {
        callback(i);
    }
};