// Rendering related code

const NATIVE_WIDTH = 256;
const NATIVE_HEIGHT = 212;

let PALETTE = [
    [0, 0, 0], [157, 157, 157], [255, 255, 255], [190, 38, 51],
    [224, 111, 139], [73, 60, 43], [164, 100, 34], [235, 137, 49],
    [247, 226, 107], [47, 72, 78], [68, 137, 26], [163, 206, 39],
    [27, 38, 50], [0, 87, 132], [49, 162, 242], [178, 220, 239]
];

function palette_match(colors) {
    for(let i = 0; i < 16; i++) {
        if(PALETTE[i][0] === colors[0] && 
           PALETTE[i][1] === colors[1] &&
           PALETTE[i][2] === colors[2]) {
               return i;
           }
    }

    return 0;
}

function load_spritemap() {
    console.log("Loading sprites...");
    let img = new Image();
    img.src = "./sprites.png";
    img.onload = (event) => {
        DATA.sprites = img;
        DATA.flipped_sprites = document.createElement('canvas');
        DATA.flipped_sprites.width = 256;
        DATA.flipped_sprites.height = 256;
        let tctx = DATA.flipped_sprites.getContext('2d');
        tctx.scale(-1, 1);
        tctx.drawImage(DATA.sprites, -256, 0);
        console.log("Done loading sprites!");
    };
}

function load_tilemap() {
    console.log("Loading tilemap...");
    let img = new Image();
    img.src = "./tiles.png";
    img.onload = (event) => {
        DATA.tiles = img;
        console.log("Done loading tilemap!");
    };
}

function drawsprite(cellrange, x, y, speed, flip) {
    if(DATA.sprites === null) { return; } 
    let cs = 16;
    let f = flip | 1;
    let frame = (Math.floor(GTICK*speed))%cellrange.length;
    let fx = (cellrange[frame]%cs)*cs;
    let fy = Math.floor(cellrange[frame]/cs)*cs;
    if(f >= 0) {
        ctx.drawImage(DATA.sprites, fx, fy, cs, cs, x, y, cs, cs);
    } else  {
        ctx.drawImage(DATA.flipped_sprites, 256-fx-16, fy, cs, cs, x, y, cs, cs);

    }
} 

function drawrect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle = "rgba(0,0,0,1.0)";
}

function drawtext(x, y, text) {
    if(DATA.sprites === null) { return; }
    let cs = 8;
    afor(text, (char, i) => {
        let c = char.charCodeAt(0) - 'A'.charCodeAt(0);
        ctx.drawImage(DATA.sprites, c*8, 248, 8, 8, x + i*8, y, 8, 8);
    });
}

function drawnum(x, y, num) {
    if(DATA.sprites === null) { return; }
    let cs = 8;
    afor(num, (n, i) => {
        let c = n.charCodeAt(0) - '0'.charCodeAt(0);
        ctx.drawImage(DATA.sprites, c*8, 240, 8, 8, x + i*8, y, 8, 8);
    });
}
