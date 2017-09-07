'use strict';

let GTICK = 0;

let GAMESTATES = {
    TITLE: 0,
    GAME: 1,
    GAMEOVER: 2,
    READY: 3
};

let DATA = {
    sprites: null,
    flipped_sprites: null,
    tiles: document.getElementById('img-tiles'),
    gamestate: GAMESTATES.TITLE
};

load_spritemap();

let WORLD = {
    SCREENS : [],
    ready: false
};

let CAMERA = {
    x: 3,
    y: 0
};

function isOnScreen(x, y) {
    return x === CAMERA.x && y === CAMERA.y;
}

// This function reads the right half of the tilemap and produces playable levels from the data there.
// Each height layer is assigned a different tileset. Tilesets are 4x2 'blocks' from the top left.
// The first four blocks are 'floor' blocks, the next four are 'inner' blocks.
// The generator determines floor blocks by checking for 'air' space above the current block.
function build_levels() {
    if(DATA.tiles === null) {
        requestAnimationFrame(build_levels);
        return;
    }

    console.log("Building world map");

    let temp_canvas = document.createElement('canvas');
    temp_canvas.width = 128;
    temp_canvas.height = 256;
    let temp_context = temp_canvas.getContext('2d', { alpha: false});
    temp_context.drawImage(DATA.tiles, 128,0,128,256,0,0,128,256);

    for(let sy = 0; sy < SCREENS_H; sy++) {
        for(let sx = 0; sx < SCREENS_W; sx++) {
            let sxa = sx*16;
            let sya = sy*13;
            let screen = [];
            for(let ii = 0; ii < 16*13; ii++) {
                screen[ii] = 0;
            }
            for(let py = 0; py < 13; py++) {
                for(let px = 0; px < 16; px++) {
                    let imgdata = temp_context.getImageData(sxa+px, sya+py, 1, 1).data;
                    let idexa = py > 0 ? ((py-1)*16+px) : -1;
                    let colindex = palette_match([imgdata[0], imgdata[1], imgdata[2]]);
                    let colindexa = idexa >= 0 ? screen[idexa] : -1;
                    switch(colindex) {
                        case 0: // Nothing/air
                            screen[py*16+px] = TILE.AIR;
                            break;
                        case 2: // Solid Block/wall/floor
                            if(colindexa === TILE.AIR) {
                                screen[py*16+px] = TILE.FLOOR;
                            } else {
                                screen[py*16+px] = TILE.WALL;
                            }
                            break;
                        case 7: // Log Bridge
                            screen[py*16+px] = TILE.FLOOR;
                            obj_bridge(px*16, py*16, sx, sy);
                            break;
                        case 11: // Player start
                            CAMERA.x = sx;
                            CAMERA.y = sy;
                            playerdata.cx = sx;
                            playerdata.cy = sy;
                            playerdata.x = (px*16);
                            playerdata.y = (py*16);
                            playerdata.spawnx = (px*16);
                            playerdata.spawny = (py*16);
                            break;
                        case 3: // Enemy (Randomized)
                            EnemyManager.add(random_enemy()(px*16,py*16,sx,sy));
                            break;
                    };
                }
            }
            WORLD.SCREENS[sy*(SCREENS_W)+sx] = screen;
        }
    }

    WORLD.ready = true;
    console.log("World map built!");
}

build_levels();
aud_init();

/// Collision functions
function getTile(x, y) {
    let sx = CAMERA.x;
    let sy = CAMERA.y;
    let tx = Math.floor(x/16);
    let ty = Math.floor(y/16);
    if(tx < 0 || tx > 15 || ty < 0 || ty > 12) { return TILE.AIR; };
    return (WORLD.SCREENS[sy*(SCREENS_W)+sx])[ty*16+tx];
}

let canvas = document.querySelector("#gcanvas");
let ctx = canvas.getContext('2d', {
    alpha: true
});
ctx.imageSmoothingEnabled = false;

function drawtile(tilebank, tile, x, y) {
    if(DATA.tiles === null) { return; }
    let ty = Math.floor(tilebank / 2);
    let tx = tilebank % 2;
    let tty = Math.floor(tile / 4);
    let ttx = tile % 4;
    ctx.drawImage(DATA.tiles, (tx*64)+(ttx*16), (ty*32)+(tty*16), 16, 16, x, y, 16, 16);
}

function irandom(max) {
    return Math.floor(Math.random()*max);
}

function drawroom() {
    let roomx = CAMERA.x;
    let roomy = CAMERA.y;
    let ts = (roomy*2)+(roomx > 4 ? 1 : 0);
    
    rfor(13, (ty) => {
        rfor(16, (tx) => {
            let t = WORLD.SCREENS[roomy * SCREENS_W + roomx][ty*16+tx];
            if(t === TILE.AIR) { return; }
            let t1 = 0;
            t === TILE.FLOOR ? t = (tx+ty) % 4 : t = ((tx+ty) % 4) + 4;
            drawtile(ts, t, tx*16, ty*16);
        });
    });
}

function switchstate_game() {
    EnemyManager.clear();
    build_levels();
    player.reset(true);
    DATA.gamestate = GAMESTATES.READY;
}

function update() {
    ctx.fillStyle = "rgb(0,0,0);";
    ctx.fillRect(0,0,256,212);

    if(WORLD.ready) {
        switch(DATA.gamestate) {
            case GAMESTATES.TITLE: {
                drawtext(52,16,"LOST  IN  LABYRINTH");

                drawtext(48,72,"PRESS SPACE TO BEGIN");

                drawtext(92,120,"CONTROLS");
                drawtext(56,136,"ARROW KEYS TO MOVE");
                drawtext(68,144,"SPACE TO ATTACK");
                drawtext(24,152,"SPACE WHILE MOVING TO DASH");
                
                if(pressed(32)) {
                    aud_seq([69.30,155.60,370.0].reverse(),1.5,2.25)
                    switchstate_game();
                }
            } break;
            case GAMESTATES.GAMEOVER: {
                drawtext(96,16,"YOU DIED");
                drawtext(92,24,"GAME OVER");
            } break;
            case GAMESTATES.READY: {
                drawtext(92,120,"GET READY");
                drawsprite([0], 108, 128, 1.0, true);
                drawtext(124,136,"X");
                drawnum(132, 136, playerdata.lives.toString());
                let handle = null;
                handle = setTimeout(() => {
                    DATA.gamestate = GAMESTATES.GAME;
                    clearTimeout(handle);
                }, 1500)
            } break;
            case GAMESTATES.GAME: {
                drawroom();
                
                EnemyManager.update();
                EnemyManager.draw();

                player.update();
                if(playerdata.hp > 0) { player.draw(); }

                // Do screen transition check

                if(playerdata.x+4 < 0) {
                    playerdata.x = PROOM_WIDTH - Math.abs(playerdata.x);
                    CAMERA.x -= 1;
                }
                if(playerdata.x+4 > PROOM_WIDTH) {
                    playerdata.x = PROOM_WIDTH - playerdata.x;
                    CAMERA.x += 1;
                }
                if(playerdata.y+4 < 0) {
                    playerdata.y = PROOM_HEIGHT - Math.abs(playerdata.y);
                    CAMERA.y -= 1;
                }
                if(playerdata.y+4 > PROOM_HEIGHT) {
                    playerdata.y = PROOM_HEIGHT - playerdata.y;
                    CAMERA.y += 1;
                }

                if(pressed('R'.charCodeAt(0))) {
                    switchstate_game();
                }
            } break;
        }
    }
    
    GTICK++;
    window.setTimeout(update, TICKS);
}



update();


