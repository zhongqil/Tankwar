
Array.prototype.shuffle = function () {
    var counter = this.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }

    return this;
}

Array.prototype.remove = function (element) {
var index = this.indexOf(element);

if (index > -1) {
    this.splice(index, 1);
}
}

CONST = { EMPTY: 0, WALL: 1, PLAYER: 2, ENEMY: 3, STONE: 5, BULLET: 6 }
CONTROL = { NOACTION: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4, STOP:5, SHOOT: 6 }
Map = function () { };
Map.prototype = {
    BOXSIZE: 6.0,
    getPosition: function (i, j) {
        var bs = this.BOXSIZE;
        return { x: i * bs + bs / 2 - this.width/2, y: bs / 2, z: j * bs + bs / 2 - this.height/2 }
    },
    getGridPosition: function(x, z) {
        var bs = this.BOXSIZE;
        return { i: Math.floor((x + this.width / 2) / bs) , j: Math.floor((z + this.height / 2 ) / bs) }
    },
    getType: function (i, j) {
        return this.map[i * this.rows + j];
    },
    setType: function(i, j, t) {
        this.map[i * this.rows + j] = t;
    },
    isWall: function(i,j) {
        return this.map[i * this.rows + j]==CONST.WALL;
    },
    distance: function (p1,p2) {
        return Math.abs(p1.i-p2.i)+Math.abs(p1.j-p2.j);
    },
    generateMap: function (r, c, enemy, wallsratio) {
        var tmp = [];
        for (var i = 0; i < r * c; i++) {
            if (i == 0) tmp[i] = CONST.PLAYER;
            else if (i <= enemy) tmp[i] = CONST.ENEMY;
            else tmp[i] = Math.random() < wallsratio ? CONST.WALL : CONST.EMPTY;
        }
        this.map = tmp.shuffle();
        this.rows = r;
        this.cols = c;
        this.width = c * this.BOXSIZE;
        this.height = r * this.BOXSIZE;
        this.searchGrid=new Graph(this.rows,this.cols);
    },
    search: function(gp1,gp2) {
      var start=this.searchGrid.grid[gp1.i][gp1.j];
      var end=this.searchGrid.grid[gp2.i][gp2.j];
      var self=this;
      return astar.search(this.searchGrid,start,end,{
          closest:true,
          isWall:function (node) {
              var type=self.getType(node.x,node.y);
              return type==CONST.STONE;
              },
          getCost:function (node) {
              var type=self.getType(node.x,node.y)
              return type==CONST.EMPTY ? 1 : 3;
              }
      });
      
    },
    loadMap: function (map) {
        this.map = map;
        this.searchGrid=new Graph(this.rows,this.cols);
    },
    createGround: function (scene) {
        var ground_material = Physijs.createMaterial(
                new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/ground/grasslight-big.jpg') }),
                .2, .0);
        var width = this.BOXSIZE * this.cols;
        var height = this.BOXSIZE * this.rows;
        var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(width,2, height), ground_material, 0);
        ground.position.y=-1;

        var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, height), ground_material, 0);
        borderLeft.position.x = -width / 2 - 1;
        borderLeft.position.y = 2;
        ground.add(borderLeft);

        var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, height), ground_material, 0);
        borderRight.position.x = width / 2 + 1;
        borderRight.position.y = 2;
        ground.add(borderRight);

        var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(width + 4, 3, 2), ground_material, 0);
        borderBottom.position.z = height / 2 + 1;
        borderBottom.position.y = 2;
        ground.add(borderBottom);

        var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(width + 4, 3, 2), ground_material, 0);
        borderTop.position.z = -height / 2 - 1;
        borderTop.position.y = 2;
        ground.add(borderTop);

        scene.add(ground);
    }
};

function HumanController(avatar,up, down, left, right, shoot) {
    this.left = left;
    this.right = right;
    this.up = up;
    this.down = down;
    this.shoot = shoot;
    this.avatar = avatar;
    this.action = CONTROL.NOACTION;
}
HumanController.prototype = {
    control: function (world) {
        if (this.action == CONTROL.SHOOT)
        {
            this.action = this.avatar.lastdirection;
            return CONTROL.SHOOT;
        }
        console.log(this.action);
        return this.action;
    },
    keyPress: function (key,isdown) {
        switch (key) {

            case this.shoot:
            
             this.action = isdown ? CONTROL.SHOOT : this.avatar.lastdirection;  
             break;

            case this.up: 
            if (this.action!=CONTROL.UP && !isdown) this.action = this.avatar.lastdirection;
            else 
            this.action = isdown ? CONTROL.UP : CONTROL.STOP; break;
            case this.down: 
            if (this.action!=CONTROL.DOWN && !isdown) this.action = this.avatar.lastdirection;
            else 
            this.action = isdown ?  CONTROL.DOWN : CONTROL.STOP; break;

            case this.left: 
            if (this.action!=CONTROL.LEFT && !isdown) this.action = this.avatar.lastdirection;
            else 
            this.action = isdown ?  CONTROL.LEFT : CONTROL.STOP; break;
            case this.right: 
            if (this.action!=CONTROL.RIGHT && !isdown) this.action = this.avatar.lastdirection;
            else 
            this.action = isdown ? CONTROL.RIGHT : CONTROL.STOP; break;
        }
    }
}

function RandomController(avatar) {
    this.avatar = avatar;
    this.firerate = Math.random() *0.2;
    this.dirchange = Math.random() *0.5;
}

RandomController.prototype = {
    control: function ( world) {
        
        var fire = Math.random() < this.firerate;
        if (fire) return CONTROL.SHOOT;
        else {
            var changedir = Math.random() < this.dirchange;

            if (changedir || this.avatar.lastdirection === undefined) {
                return Math.floor(Math.random() * 5) + 1;
            } else return this.avatar.lastdirection;
        }
    }
}
function AIController(avatar,attentiveness,reaction,destructive,dirchange) {
    this.attentiveness = attentiveness!==undefined ? attentiveness : Math.random();
    this.reaction = reaction!==undefined ? reaction : Math.random();
    this.destructiveness = destructive!==undefined ? destructive : Math.random() * 0.2;
    this.dirchange = dirchange!==undefined ? dirchange : Math.random() * 0.4;
    this.pathfinding = true;
    this.avatar = avatar;
}

AIController.prototype = {
    control: function (world) {
        var attack = Math.random() < this.reaction;
        var findplayer = Math.random() < this.attentiveness;
        
        var enemy = world.findNearestEnemy(this.avatar);
        if (enemy==null) return CONTROL.STOP;
        var info = world.getAttackInfo(this.avatar,enemy);
        var curdir = this.avatar.lastdirection;
        var changedir = Math.random() < this.dirchange;
        var fire = Math.random() < this.destructiveness;
        //console.log(info);
        if (info.inline && attack) {
            console.log('Attack');
            if (info.dir==curdir) {
                return CONTROL.SHOOT;
            } else  {
                return info.dir;
            }
        } else if (!info.inline && findplayer) {
            console.log('Find');
            if (this.pathfinding) {
                var path=world.searchPath(this.avatar,enemy);
                if (path.obscured && curdir == path.nextdir) {
                        return CONTROL.SHOOT;
                    } else {
                        return path.nextdir;
                    }
            } else {
                var movex = info.x < info.y;
                if (movex && !info.obscured) movex = movex &&  info.xobscured && fire;
                if (movex) {
                    if (info.xobscured && curdir == info.dirx) {
                        return CONTROL.SHOOT;
                    } else {
                        return info.dirx;
                    }
                } else {
                    if (info.yobscured && curdir == info.diry) {
                        return CONTROL.SHOOT;
                    } else {
                        return info.diry;
                    }
                }
            }
        }
        var changedir = Math.random() < this.dirchange;
        if (changedir || curdir == CONTROL.STOP) {
            console.log('Change Direction');
            return Math.floor(Math.random() * 5) + 1;
        } else {
            console.log('Shot');
            if (fire) return CONTROL.SHOOT;
            else return curdir;
        }
        
    }
}

function GameObject(geometry,material) {
    Physijs.BoxMesh.call(this, geometry, material);
}

GameObject.prototype =  Object.create(Physijs.BoxMesh.prototype, {
});
GameObject.prototype.constructor = GameObject;

function Character(geometry, material,gametype,controller) {
    this.isAlive = true;
    Physijs.CylinderMesh.call(this, geometry, material, 0.2);
    this.gametype = gametype;
    this.controller = controller;
    this.lastdirection = CONTROL.STOP;
}

Character.prototype = Object.create(Physijs.CylinderMesh.prototype, {
    getGridPosition: function () {
        return this.map.getGridPosition(this.position.x, this.position, z);
    }
});
Character.prototype.constructor = Character;

function Game() {
    this.gameOver = false;
    this.characters = [];
    this.walls = [];
    this.bullets = [];
    this.humancontrollers = [];
    this.controllers = [];
    this.enemycount = 0;
    this.player = null;
    this.pathgraph = null;
    this.config = {
        map: {
        rows:15,
        columns:15,
        enemyCount:5,
        wallRatio:0.2
        },
        wall: {
            health:30
        },
        bullet: {
            1:{
                speed:40,
                power:1,
                damage:10
            }
        },
        enemy: {
            health:10,
            speed:15,
            bulletType:1,
            attentiveniss:0.2,
            reaction:0.4
        },
        player: {
            health:30,
            speed:15,
            bulletType:1
        }
        }
}

Game.prototype = {
    constructor: Game,
    initScene: function () {
        document.getElementById('viewport').innerHTML = '';
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer = this.renderer;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.setClearColor(new THREE.Color(0x000000));
        document.getElementById('viewport').appendChild(this.renderer.domElement);

        this.render_stats = new Stats();
        this.render_stats.domElement.style.position = 'absolute';
        this.render_stats.domElement.style.top = '1px';
        this.render_stats.domElement.style.zIndex = 100;
        document.getElementById('viewport').appendChild(this.render_stats.domElement);

        this.scene = new Physijs.Scene;
        this.scene.setGravity(new THREE.Vector3(0, -50, 0));

        this.camera = new THREE.PerspectiveCamera(
                35,
                window.innerWidth / window.innerHeight,
                1,
                1000
        );
        this.camera.position.set(0, 50, 60);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);

        // Light
        var light = new THREE.SpotLight(0xFFFFFF);
        light.position.set(20, 100, 50);


        this.scene.add(light);



        //var gui = new dat.GUI();
        //gui.add(controls, 'gravityX', -100, 100);
        //gui.add(controls, 'gravityY', -100, 100);
        //gui.add(controls, 'gravityZ', -100, 100);
        //gui.add(controls, 'resetScene');

    },
    setPosition: function (player, i, j) {
        var position = this.map.getPosition(i, j);
           player.gridposition = {i:i,j:j};
            player.position.x = position.x;
            player.position.y = position.y;
            player.position.z = position.z;
            player.curdir = { x: 0, z: -1 };
    },
    addObjects: function () {
        var map = this.map;
        for (var i = 0; i < map.rows; i++) {
            for (var j = 0; j < map.cols; j++) {
                var type = map.getType(i,j);
                switch (type) {
                    case CONST.WALL:
                        this.createWall(i,j);
                        
                        break;
                    case CONST.PLAYER:
                        this.createPlayer(i,j);
                        
                        break;
                    case CONST.ENEMY:
                        this.createEnemy(i,j);
                        
                        break;
                }
            }
        }
    },
    createPlayer: function (i,j) {
        var loader = new THREE.JSONLoader();
        var self = this;
      ///  loader.load('/assets/model/tank_distribution.json', function (geometry, material) {
        var texture = THREE.ImageUtils.loadTexture("/assets/textures/animals/dog.jpg");

            var size = self.map.BOXSIZE;
            var geometry = new THREE.BoxGeometry(size, size, size);
            
           var material = Physijs.createMaterial(
                        new THREE.MeshLambertMaterial({ color: 0xFFFFFF, map: texture }),
                        0, 0);

           var player = new Character(geometry, material,CONST.PLAYER);
       //     var scale=3.0/geometry.boundingSphere.radius;
           // player.scale.set(scale, scale, scale);
            self.setPosition(player,i,j);
            self.scene.add(player);
            var config=this.config.player;
            player.health=config.health;
            player.speed=config.speed;
            player.bulletType=config.bulletType;
            
            var humancontroller = new HumanController(player, 87, 83, 65, 68, 32);
            self.humancontrollers.push(humancontroller);
           // self.controllers.push(humancontroller);
            self.characters.push(player);
            player.setAngularFactor(new THREE.Vector3(0, 0, 0));
            self.player = player;
            

    //    });
        
    },
    createEnemy: function (i,j) {
        var size = this.map.BOXSIZE;
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/animals/cat.jpg') }),
                    0, 0);

        var enemy = new Character(geometry, material, CONST.ENEMY);
        this.setPosition(enemy,i,j);
        this.scene.add(enemy);
        this.enemycount++;
        var config=this.config.enemy;
        enemy.health=config.health;
        enemy.speed=config.speed;
        enemy.bulletType=config.bulletType;
        enemy.setAngularFactor(new THREE.Vector3(0, 0, 0));
        var aicontroller = new AIController(enemy,config.attentiveniss,config.reaction);
        this.controllers.push(aicontroller);
        this.characters.push(enemy);
    },
    createWall: function (i,j) {
        var size = this.map.BOXSIZE;
        var wallGeometry = new THREE.BoxGeometry(size, size, size);
        var wallmaterial = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/general/brick-wall.jpg') }),
                    .9, 0);

        var wall = new Physijs.BoxMesh(wallGeometry, wallmaterial, 0);
        var position = this.map.getPosition(i, j);
        wall.gridposition = {i:i,j:j};
        wall.position.x = position.x;
        wall.position.y = position.y;
        wall.position.z = position.z;
        wall.gridposition = {i:i,j:j};
        wall.gametype = CONST.WALL;
        var config=this.config.wall;
        wall.health=config.health;
        this.scene.add(wall);
        this.walls.push(wall);
    },
    createBullet: function (player) {
        var size = this.map.BOXSIZE;
        var geometry = new THREE.SphereGeometry(1, 10, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        var bullet = new Physijs.SphereMesh(geometry, material, 5);

        bullet.position.x = player.position.x + player.curdir.x * 4;
        bullet.position.y = player.position.y;
        bullet.position.z = player.position.z + player.curdir.z * 4;
        this.bullets.push(bullet);
        this.scene.add(bullet);
        self = this;
        bullet.gametype = CONST.BULLET;
        var config=this.config.bullet[player.bulletType] || this.config.bullet[1];
        bullet.damage = config.damage;
        bullet.power= config.power;
        bullet.owner=player;
        bullet.setLinearFactor(new THREE.Vector3(1, 0, 1));
        bullet.setLinearVelocity({ x: player.curdir.x * config.speed, y: 0, z: player.curdir.z * config.speed })
        bullet.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            if (other_object === this.owner) return;
            switch (other_object.gametype) {
                case CONST.WALL:
                var wall=other_object;
                    wall.health -= this.damage;
                    if (wall.health <=0) {
                    self.scene.remove(wall);
                    self.walls.remove(wall);
                    self.map.setType(wall.gridposition.i,wall.gridposition.j,CONST.EMPTY);
                    }
                    break;
                case CONST.BULLET:
                    if (other_object.owner === this.owner) return;
                    self.scene.remove(other_object);
                    self.bullets.remove(other_object);
                    break;
                case CONST.PLAYER:
                    var player = other_object;
                    player.health-=this.damage;
                    if (player.health<=0) {
                    self.gameOver = 2;
                    self.scene.remove(other_object);
                    self.characters.remove(other_object);
                    self.controllers.remove(other_object.controller);
                    other_object.isAlive = false;
                    }
                    break;
                case CONST.ENEMY:
                var enemy=other_object;
                    enemy.health -= this.damage;
                    if (enemy.health <=0) {
                    self.scene.remove(other_object);
                    self.characters.remove(other_object);
                    self.controllers.remove(other_object.controller);
                    other_object.isAlive = false;
                    self.enemycount--;
                    if (self.enemycount==0) self.gameOver = 1;
                    }
                    break;
                default:
                    break;
            }
                    self.scene.remove(this);
                    self.bullets.remove(this);                
            

        });
        
        return bullet;
    },
    performAction: function (action, player) {
        switch (action) {

            case CONTROL.SHOOT: /* space */
                var bullet = this.createBullet(player);
                return;
                break;

            case CONTROL.UP: /*W*/
            
                 player.curdir = { x: 0, z: -1 };
                 
                if (player.lastdirection !== CONTROL.UP) {
                    player.rotation.y = Math.PI;
                    player.__dirtyRotation = true;
                } //else {

                    
                    player.setLinearVelocity({ x: 0, y: 0, z: -player.speed });
            //    }
                break;
            case CONTROL.DOWN: /*S*/
            player.curdir = { x: 0, z: 1 };
                if (player.lastdirection !== CONTROL.DOWN) {
                    player.rotation.y = 0;
                    player.__dirtyRotation = true;
                } //else {
                    
                    player.setLinearVelocity({ x: 0, y: 0, z: player.speed });
              //  }
                //hconstraint = player.hconstraint;
                //hconstraint.enableLinearMotor(-10, 2);
                break;

            case CONTROL.LEFT: /*A*/
            player.curdir = { x: -1, z: 0 };
                if (player.lastdirection !== CONTROL.LEFT) {
                    player.rotation.y = - Math.PI / 2;
                    player.__dirtyRotation = true;
                } //else {
                    

                    player.setLinearVelocity({ x: -player.speed, y: 0, z: 0 });
             //   }
                break;
            case CONTROL.RIGHT: /*D*/
            player.curdir = { x: 1, z: 0 };
                if (player.lastdirection !== CONTROL.RIGHT) {
                    player.rotation.y = Math.PI / 2;
                    player.__dirtyRotation = true;
                }// else {
                    
                    player.setLinearVelocity({ x: player.speed, y: 0, z: 0 });
              //  }
                break;
             case CONTROL.STOP: /*D*/
                    player.setLinearVelocity({ x: 0, y: 0, z: 0 });
                
                return;
            default: return;
        }
        player.lastdirection=action;
    },
    createEventListeners: function () {
        var domElement = document.getElementById("viewport");
        var self = this;

        function mouseMoveListener(event) {
            if (event.buttons) {
                //scene.rotation.y += event.movementX/100;
                //var relativeLocation = event.pageX/window.innerWidth-0.5;
                //paddle.position.z = relativeLocation*width * 2;
                //console.dir(event);
                //console.dir(paddle);
            }
        }

        function keyDownListener(event) {
            console.log("Key down");
            for (var i = 0; i < self.humancontrollers.length;i++) {
                var controller = self.humancontrollers[i]
                if (controller.avatar.isAlive) {
                    controller.keyPress(event.keyCode, true);
                    var action = controller.control(self);
                    self.performAction(action, controller.avatar);
                }
            }
            
        }
        function keyUpListener(event) {
            console.log("Key up");
            for (var i = 0; i < self.humancontrollers.length; i++) {
                var controller = self.humancontrollers[i]
                if (controller.avatar.isAlive) {
                    controller.keyPress(event.keyCode, false);
                    var action = controller.control(self);
                    self.performAction(action, controller.avatar);
                }
            }

        }

        domElement.addEventListener("keydown", keyDownListener, false);
        domElement.addEventListener("keyup", keyUpListener, false);
        domElement.setAttribute("tabindex", 0);
        //domElement.addEventListener("mousemove",mouseMoveListener,false);
    },
    findNearestEnemy: function (avatar) {
        var enemy = null, mdist=null;
        var self=this;
        this.characters.forEach(function (char) {
            if (char.gametype == avatar.gametype) return;
            else if (enemy == null) {
                enemy=char;
                mdist=self.map.distance(enemy.gridposition,avatar.gridposition);
            } else {
                var dist = self.map.distance(enemy.gridposition,avatar.gridposition);
                if (dist < mdist) {
                    enemy=char;
                    mdist = dist;
                }
            }
        });
        return enemy;
    },
    searchPath: function(avatar,enemy) {
        var path=this.map.search(avatar.gridposition,enemy.gridposition);
        
        return {path:path,obscured:this.map.getType(path[1].x,path[1].y) != CONST.EMPTY,nextdir:this.getDirection(path[0],path[1])};
    },
    getDirection: function(pos1,pos2) {
        if (pos1.x < pos2.x) return CONTROL.RIGHT;
        else if (pos1.x > pos2.x) return CONTROL.LEFT;
        else if (pos1.y < pos2.y) return CONTROL.DOWN;
        else if (pos1.y > pos2.y) return CONTROL.UP;
        return CONTROL.STOP;
    },
    getAttackInfo: function(avatar,enemy) {
        var pos = avatar.gridposition;
        var enemypos = enemy.gridposition;
        var rst = {inline:true,obscured:false,dir:CONTROL.NOACTION}
        rst.x=Math.abs(enemypos.i-pos.i);
        rst.y=Math.abs(enemypos.j-pos.j);
        rst.dirx=pos.i < enemypos.i ? CONTROL.RIGHT : CONTROL.LEFT ;
        rst.diry=pos.j < enemypos.j ? CONTROL.DOWN : CONTROL.UP ;
        if (pos.i == enemypos.i) {
            rst.dir=rst.diry;
            for (var i=Math.min(pos.j,enemypos.j)+1;i<Math.max(pos.j,enemypos.j);i++) {
                if (this.map.isWall(i,j)) rst.obscured=true;
            }
        } else if (pos.j==enemypos.j) {
            rst.dir=rst.dirx;
            for (var j=Math.min(pos.i,enemypos.i)+1;j<Math.max(pos.i,enemypos.i);j++) {
                if (this.map.isWall(i,j)) rst.obscured=true;
            }
        }else {
            rst.inline = false;
            newi=pos.i < enemypos.i ? pos.i+1 : pos.i-1 ;
            rst.xobscured = this.map.isWall(newi,pos.j);
            newj=pos.j < enemypos.j ? pos.j+1 : pos.j-1 ;
            rst.yobscured = this.map.isWall(pos.i,newj);
            rst.obscured = rst.xobscured && rst.yobscured;
        }
        return rst;
    },
    updateGameState: function() {
        
        this.updateMap();
        this.updateControllers();
    },
    updateMap: function() {
        var self=this;
        this.characters.forEach(function (char) {
            self.map.setType(char.gridposition.i,char.gridposition.j,CONST.EMPTY);
        });
        this.characters.forEach(function (char) {
            char.gridposition = self.map.getGridPosition(char.position.x,char.position.z);
            self.map.setType(char.gridposition.i,char.gridposition.j,char.gametype);
        });
    },
    updateControllers: function () {
        var self=this;
        this.controllers.forEach(function (controller) {
            if (controller.avatar.isAlive) {
                var action = controller.control(self);
                self.performAction(action, controller.avatar);
            }
        });
    },
    start: function () {
        this.initScene();
        this.map = new Map();
        this.running = true;
        var config=this.config.map;
        this.map.generateMap(config.rows,config.columns,config.enemyCount,config.wallRatio);
        this.map.createGround(this.scene);
        this.addObjects();
        this.createEventListeners();
        var self = this;
        this.starttime=Date.now();
        var time = Date.now();
        render = function () {
            
            
            if (self.running && self.gameOver == 1) {
                cancelAnimationFrame(self.id);
                self.scene=null;
                self.renderer=null;
                self.running = false;
                alert("You Win");
            } else if (self.running && self.gameOver == 2) {
                cancelAnimationFrame(self.id);
                self.renderer=null;
                self.scene=null;
                self.running = false;
                alert("Game Over");
            } else {
                self.id=requestAnimationFrame(render);
                self.renderer.render(self.scene, self.camera);
                self.render_stats.update();
                self.scene.simulate(undefined, 1);
                if (self.player) {
                self.camera.position.x=self.player.position.x;
                self.camera.position.z=self.player.position.z+40;
                self.camera.lookAt(self.player.position);
                self.camera.updateProjectionMatrix();
                }
                var newtime = Date.now();
                var delta = newtime - time;
                if (delta > 300 && newtime-self.starttime > 2000) {
                self.updateGameState();
                time = newtime;
                }
            }
            
        }
        requestAnimationFrame(render);
    }
};
