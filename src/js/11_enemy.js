// Enemy framework
// UPDATE: Now more of a general-purpose entity framework

let Enemy = function(x,y,sx,sy) {
    this.x = x;
    this.y = y;
    this.dmg = 0;
    this.update = null;
    this.draw = null;
    this.anims = [[0]];
    this.anim = 0;
    this.flip = 0;
    this.dead = false;
    this.sx = sx;
    this.sy = sy;
};

let EnemyManager = function() {
    let obj = {};
    obj.enemylist = [];
    let self = this;
    
    function sweepEnemies() {
        afor(obj.enemylist, (e, i) => {
            if(e && e.dead) {
                obj.enemylist.splice(i, 1);
            }
        }); 
    }

    obj.clear = function() {
        delete obj.enemylist;
        obj.enemylist = [];
    }

    obj.add = function(enm) {
        obj.enemylist.push(enm);
    };

    obj.update = function() {
        afor(obj.enemylist, (e) => {
            if(e && e.update && isOnScreen(e.sx, e.sy)) {
                e.update(e);
            }
        });

        sweepEnemies();
    };

    obj.draw = function() {
        afor(obj.enemylist, (e) => {
            if(e && e.draw && isOnScreen(e.sx, e.sy)) { 
                e.draw(e); 
            }
        });
    };

    return obj;
}();

function update_skeleton(self) {
    const movespeed = 0.5;
    if(self.flip === 0) { 
        let t = getTile(self.x - movespeed, self.y+15);
        let td = getTile(self.x - movespeed, self.y + 16);
        if(t === TILE.AIR && td !== TILE.AIR) {
            self.x -= movespeed;
        } else {
            self.flip = 1;
        }
    } else {
        let t = getTile(self.x + 16 + movespeed, self.y+15);
        let td = getTile(self.x + 16 + movespeed, self.y + 16);
        if(t === TILE.AIR && td !== TILE.AIR) {
            self.x += movespeed;
        } else {
            self.flip = 0;
        }
    }

    player.hit(self, true, () => {
        if(playerdata.state === player.STATES.DASH || playerdata.state === player.STATES.ATTACK) {
            self.dead = true;
            aud_seq([220.0,110.0], 0.2);
            playerdata.score += 100;
            efx_explosion(self.x, self.y, self.sx, self.sy);
        } else {
            playerdata.hp -= self.dmg;
        }
    });
}

function draw_snake(self) {
    let animframes = self.anims[self.anim];
    drawsprite(animframes, Math.floor(self.x), Math.floor(self.y), 0.1, -self.flip);
}

function draw_skeleton(self) {
    let animframes = self.anims[self.anim];
    drawsprite(animframes, Math.floor(self.x), Math.floor(self.y), 0.1, -self.flip);
}

function enm_skeleton(x, y, sx, sy) {
    let s = new Enemy(x, y, sx, sy);
    s.dmg = 1;
    s.update = update_skeleton;
    s.draw = draw_skeleton;
    s.anims = [[10,11]];
    s.anim = 0;

    return s;
}

function enm_snake(x, y, sx, sy) {
    let s = new Enemy(x, y, sx, sy);
    s.dmg = 1.5;
    s.update = update_skeleton;
    s.draw = draw_snake;
    s.anims = [[6,7]];
    s.anim = 0;
    return s;
}

function draw_effect(self) {
    let animframes = self.anims[0];
    
    self.frame += 0.25;
    
    if(self.frame >= animframes.length) {
        if(self.times > 0) {
            self.times--;
            self.frame = 0;
        } else {
            self.dead = true; 
            if(self.cb) {
                self.cb();
            }
        }
    }
    drawsprite([animframes[Math.floor(self.frame)]], Math.floor(self.x), Math.floor(self.y), 0.1, 0);
}

function efx_explosion(x, y, sx, sy, cb) {
    let s = new Enemy(x, y);
    cb = cb | null;
    s.dmg = 0;
    s.update = null;
    s.draw = draw_effect;
    s.anims = [[18,19,20]];
    s.anim = 0;
    s.frame = 0;
    s.sx = sx;
    s.sy = sy;
    s.cb = cb;

    EnemyManager.add(s);
    return s;
}

function efx_burn(x, y, sx, sy, cb) {
    let s = new Enemy(x, y);
    s.sx = sx;
    s.sy = sy;
    s.update = null;
    s.draw = draw_effect;
    s.anims = [[48,49]];
    s.times = 4;
    s.anim = 0;
    s.frame = 0;
    EnemyManager.add(s);
    s.cb = cb;
    return s;
}

function update_bridge(self) {
    // If player is standing on top with the Burning Torch then burn the block down
    player.hit(self,false,() => {
        if(playerdata.hasTorch) {
            efx_burn(self.x, self.y, self.sx, self.sy, () => {
                let px = Math.floor(self.x/16);
                let py = Math.floor(self.y/16);
                (WORLD.SCREENS[self.sy*SCREENS_W+self.sx])[py*16+px] = TILE.AIR;
            });
            self.dead = true;
            aud_seq([220.0,110.0], 0.2);
        }
    });
}

function draw_bridge(self) {
    drawsprite([25], Math.floor(self.x), Math.floor(self.y), 0.1, -self.flip);
}

function obj_bridge(x, y, sx, sy) {
    let s = new Enemy(x, y);
    s.dmg = 0;
    s.update = update_bridge;
    s.draw = draw_bridge;
    s.sx = sx;
    s.sy = sy;
    s.burning = false;

    EnemyManager.add(s);
    return s;
}

function random_enemy() {
    let i = Math.floor(Math.random()*2);
    switch(i) {
        case 0: return enm_skeleton;
        case 1: return enm_snake;
    }
}

