/// Player Code
let playerdata = {
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
    spawnx: 0,
    spawny: 0,
    flip: 1,
    state: 0,
    animstate: [
        [0],    // Idle
        [0,1],   // Walking
        [3,4,5,5], // Attacking
        [2], // Dashing
    ],
    vert_velocity: 0, // vertical velocity
    horz_velocity: 0,  // horizontal velocity,
    dash : 0, // dash impulse
    cframe : 0,
    nframe : 0,
    score: 0,
    stamina: 100,
    hp: 100,
    lives: 2,
    dead: false,
    hasTorch: true
};

let kp_jump = false;
let kp_dash = false;

let player = function() {
    let obj = {};

    let STATES = {
        NEUTRAL: 0,
        DASH: 3,
        ATTACK: 2
    };

    obj.STATES = STATES;

    obj.reset = function(resetlives) {
        // Reset some player values
        resetlives = resetlives | false;
        playerdata.flip = 1;
        playerdata.state = 0;
        playerdata.vert_velocity = 0;
        playerdata.horz_velocity = 0;
        playerdata.dash = 0;
        if(resetlives) {
            playerdata.score = 0;
            playerdata.lives = 2;
        }
        playerdata.hp = 100;
        playerdata.stamina = 100;
        playerdata.dead = false;
    }

    function drawHUD() {
        // Draw Game Info
        drawtext(0, 0, "HP");
        drawtext(0, 8, "ST");
        drawrect(16,1,playerdata.hp,6,"rgb(190, 38, 51)");
        drawrect(16,9,playerdata.stamina,6,"rgb(68, 137, 26)");
        drawtext(136,0,"SCORE");
        drawtext(136,8,"LIVES X");
        drawnum(184,0,playerdata.score.toString());
        drawnum(192,8, playerdata.lives.toString());
    }
     
    obj.draw = function() {
        drawHUD();

        let cframe = Math.floor(playerdata.cframe);
        let num = playerdata.animstate[playerdata.state].length;
        playerdata.nframe = num;
        let frame = playerdata.animstate[playerdata.state][cframe%num];
        drawsprite([frame], Math.floor(playerdata.x), Math.floor(playerdata.y), 0.2, playerdata.flip);
    };

    let stdata = {
        cx: 0, cy: 0, cxl: 0, cxr: 0, t: 0, tr: 0, tl: 0
    }

    // States, easier to deal with than the big function block I had previously
    function st_common() { // Things like falling and collision with the level
        stdata.cx = playerdata.x + 8;
        stdata.cy = playerdata.y + 16;
        stdata.cxl = stdata.cx-4;
        stdata.cxr = stdata.cx+4;
        stdata.t = getTile(stdata.cx, stdata.cy);
        stdata.tl = getTile(stdata.cxl, stdata.cy);
        stdata.tr = getTile(stdata.cxr, stdata.cy);

        // Increment counters
        playerdata.cframe = (playerdata.cframe + 0.2);
        if(playerdata.stamina < 100) {
            playerdata.stamina += 1;
        }

        // Do fall check
        if(stdata.t === TILE.AIR && stdata.tl === TILE.AIR && stdata.tr === TILE.AIR) { 
            playerdata.vert_velocity+=0.28; 
        } else {
            playerdata.vert_velocity = 0;
        }

        // Vertical collision detection

        let yoffset = playerdata.vert_velocity < 0 ? -15 : 0;
        stdata.t = getTile(stdata.cx, stdata.cy+2+playerdata.vert_velocity+yoffset);
        stdata.tl = getTile(stdata.cxl, stdata.cy+2+playerdata.vert_velocity+yoffset);
        stdata.tr = getTile(stdata.cxr, stdata.cy+2+playerdata.vert_velocity+yoffset);
        
        if(playerdata.vert_velocity !== 0) {
            if(stdata.t === TILE.AIR && stdata.tl === TILE.AIR && stdata.tr === TILE.AIR) {
                playerdata.y += Math.floor(playerdata.vert_velocity);
            } else {
                if(playerdata.vert_velocity > 0) {
                    playerdata.y = (Math.round((playerdata.y + playerdata.vert_velocity + 16)/16)-1)*16;
                } else 
                if(playerdata.vert_velocity < 0) {
                    playerdata.vert_velocity = playerdata.vert_velocity / 2;
                }
            }
        }

        // Clamp vertical velocity to something sane
        if(playerdata.vert_velocity > 3) {playerdata.vert_velocity = 3};
        
    }

    function st_move() {
        let hmove = 0, dmove = 1.0;
        if(playerdata.dash === 0) {
            hmove = KEYS[39] - KEYS[37];
        } else {
            hmove = playerdata.dash > 0 ? 1 : -1;
            dmove = 3.5;
        }

        if(playerdata.dash > 0) {
            playerdata.dash -= 1;
        }
        else if(playerdata.dash < 0) {
            playerdata.dash += 1;
        } else {
            if(playerdata.state === STATES.DASH) {
                playerdata.state = STATES.NEUTRAL;
            }
        }

        if(hmove !== 0) {
            playerdata.flip = hmove;
            if(playerdata.state !== STATES.DASH) { playerdata.state = 1; }
        } else {
            playerdata.state = 0;
        }

        if(hmove === 0) { playerdata.horz_velocity = 0; }
        else { playerdata.horz_velocity += 0.075 * hmove * dmove; }

        if(playerdata.horz_velocity < -2*dmove) { playerdata.horz_velocity = -2*dmove; }
        if(playerdata.horz_velocity > 2*dmove) { playerdata.horz_velocity = 2*dmove; }
        let offset = playerdata.horz_velocity > 0 ? 8 : -8;
        stdata.t = getTile(stdata.cx + playerdata.horz_velocity + offset, stdata.cy-1);
        stdata.tr = getTile(stdata.cxr + playerdata.horz_velocity + 4, stdata.cy-1);
        stdata.tl = getTile(stdata.cxl + playerdata.horz_velocity - 4, stdata.cy-1);

        if(stdata.t === TILE.AIR) {
            if(playerdata.horz_velocity > 0) {
                if(stdata.tr === TILE.AIR) { 
                    playerdata.x += playerdata.horz_velocity;
                } else {
                    playerdata.horz_velocity = 0;
                }
            } else
            if(playerdata.horz_velocity < 0) {
                if(stdata.tl === TILE.AIR) {
                    playerdata.x += playerdata.horz_velocity;
                } else {
                    playerdata.horz_velocity = 0;
                }
            }
        } else {
            if(offset > 0) {
                playerdata.x = (Math.floor((playerdata.x + playerdata.horz_velocity + offset)/16))*16;
            } else {
                playerdata.x = (Math.floor((playerdata.x + playerdata.horz_velocity)/16)+1)*16;
            }
        }
    }

    function st_dash() {
        if(pressed(32)) {
            let hmove = KEYS[39]-KEYS[37];
            if(playerdata.dash === 0 && playerdata.stamina >= 100) { 
                playerdata.dash = 15 * hmove; 
                if(playerdata.dash !== 0) { playerdata.stamina -= 100; }
            }
            if(playerdata.dash === 0) { // Standing still, use sword
                if(playerdata.state !== STATES.ATTACK) {
                    playerdata.state = STATES.ATTACK;
                    playerdata.cframe = 0;
                }
            } else {
                playerdata.state = STATES.DASH;
            }
        }
    }

    function st_jump() {
        let t = getTile(stdata.cx, stdata.cy);
        if(pressed(38)) {
            if(t !== TILE.AIR) {
                playerdata.vert_velocity -= 5;
                playerdata.y -= 2;
                aud_seq([110,220],0.2);
            }
        }
    }

    obj.update = function() {

        // Do actions

        if(playerdata.hp <= 0 && playerdata.dead === false) {
            playerdata.hp = 0;
            playerdata.dead = true;
            playerdata.lives -= 1;
            efx_explosion(playerdata.x, playerdata.y, CAMERA.x, CAMERA.y);
            
            setTimeout(() => {
                if(playerdata.lives >= 0) {
                    player.reset(false);
                    DATA.gamestate = GAMESTATES.READY;
                    playerdata.x = playerdata.spawnx;
                    playerdata.y = playerdata.spawny;
                    CAMERA.x = playerdata.cx;
                    CAMERA.y = playerdata.cy;
                } else {
                    DATA.gamestate = GAMESTATES.GAMEOVER;
                    setTimeout(() => {
                        DATA.gamestate = GAMESTATES.TITLE;
                    }, 2000);
                }
            }, 2000);
        } else {
            st_common();
            if(playerdata.state !== STATES.ATTACK) { st_move(); }
            st_jump();
            st_dash();

            if(playerdata.state === STATES.ATTACK) {
                if(playerdata.cframe > 4) { playerdata.state = STATES.NEUTRAL; }
            }

            if(playerdata.state === STATES.DASH) {
                efx_explosion(playerdata.x, playerdata.y, CAMERA.x, CAMERA.y);
            }
        }
    };

    obj.hit = function(caller, narrow, callback) {
        // If 'narrow' is true, it makes the checked player hitbox smaller by 4 pixels all around.
        let n = narrow;
        let h = false;
        let lb = n ? 4 : 0;
        let ub = n ? 12 : 16;
        h = !(
            caller.x > playerdata.x + ub || caller.x+16 < playerdata.x + lb || 
            caller.y > playerdata.y + ub || caller.y+16 < playerdata.y + lb
        );
        if(h) {
            callback(caller);
        }
    };

    return obj;
}();