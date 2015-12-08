
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
BOXSIZE = 6.0;
CONST = { EMPTY: 0, WALL: 1, PLAYER: 2, ENEMY: 3, ALLY:4, STONE: 5, BULLET: 6 }
CONTROL = { NOACTION: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4, STOP:5, SHOOT: 6 }

Levels = {
    Random: "Random",
    Maze :  [
            [2,0,0,0,0,0,0,0,0,0],
            [5,5,5,5,5,5,5,5,5,0],
            [0,0,0,0,0,0,0,0,5,0],
            [0,5,5,5,5,5,5,0,5,0],
            [0,5,0,0,3,3,5,0,5,0],
            [0,5,0,5,3,3,5,0,5,0],
            [0,5,0,5,5,5,5,0,5,0],
            [0,5,0,0,0,0,0,0,5,0],
            [0,5,5,5,5,5,5,5,5,0],
            [0,0,0,0,0,0,0,0,0,0]
        ]
    ,
    Empty: "Empty"
}

KeyMapping = {
    Space:32,
    'Left Arrow':37,
    'Up Arrow':38,
    'Right Arrow':39,
    'Down Arrow':40,
    0:48,
    1:48,
    2:50,
    3:51,
    4:52,
    5:53,
    6:54,
    7:55,
    8:56,
    9:57,
    A:65,
    B:66,
    C:67,
    D:68,
    E:69,
    F:70,
    G:71,
    H:72,
    I:73,
    J:74,
    K:75,
    L:76,
    M:77,
    N:78,
    O:79,
    P:80,
    Q:81,
    R:82,
    S:83,
    T:84,
    U:85,
    V:86,
    W:87,
    X:88,
    Y:89,
    Z:90,
    ';':186,
    '=':187,
    ',':188,
    '-':189,
    '.':190,
    '/':191,
    '`':192,
    '[':219,
    '\\':220,
    ']':221,
    "'":222,
}
Map = function () { isgrid = false; };
Map.prototype = {
    getPosition: function (i, j) {
        var bs = BOXSIZE;
        return { x: i * bs + bs / 2 - this.width/2, y: bs / 2, z: j * bs + bs / 2 - this.height/2 }
    },
    getGridPosition: function(x, z) {
        var bs = BOXSIZE;
        return { i: Math.floor((x + this.width / 2) / bs) , j: Math.floor((z + this.height / 2 ) / bs) }
    },
    getGridDeviation: function(x, z) {
        var bs = BOXSIZE;
        return { x: Math.floor((x + this.width / 2) % bs) -bs/2 , y: Math.floor((z + this.height / 2 ) % bs)-bs/2 }
    },
    getType: function (i, j) {
        return this.isgrid ? this.map[j][i] : this.map[i * this.rows + j];
    },
    setType: function(i, j, t) {
        if (this.isgrid) 
        this.map[j][i] = t;
        else
        this.map[i * this.rows + j] = t;
    },
    isWall: function(i,j) {
        return (this.isgrid ? this.map[j][i] : this.map[i * this.rows + j])==CONST.STONE;
    },
    distance: function (p1,p2) {
        return Math.abs(p1.i-p2.i)+Math.abs(p1.j-p2.j);
    },
    generateMap: function (r, c, enemy,ally, wallsratio, stoneratio) {
        var tmp = [];
        for (var i = 0; i < r * c; i++) {
            if (i == 0) tmp[i] = CONST.PLAYER;
            else if (i <= enemy) tmp[i] = CONST.ENEMY;
            else if (i <= enemy+ally) tmp[i] = CONST.ALLY;
            else tmp[i] = Math.random() < wallsratio ? (Math.random() < stoneratio ? CONST.STONE : CONST.WALL) : CONST.EMPTY;
        }
        this.map = tmp.shuffle();
        this.rows = r;
        this.cols = c;
        this.width = c * BOXSIZE;
        this.height = r * BOXSIZE;
        this.searchGrid=new Graph(this.rows,this.cols);
    },
    generateEmptyMap: function (r, c) {
        var tmp = [];
        for (var i = 0; i < r * c; i++) {
            tmp[i] = CONST.EMPTY;
        }
        this.map = tmp.shuffle();
        this.rows = r;
        this.cols = c;
        this.width = c * BOXSIZE;
        this.height = r * BOXSIZE;
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
        this.isgrid=true;
        this.rows = this.map.length;
        this.cols = this.map[0].length;
        this.width = this.cols * BOXSIZE;
        this.height = this.rows * BOXSIZE;
        this.searchGrid=new Graph(this.rows,this.cols);
    },
    toArray: function() {
        var tmp = [];
        for (var i = 0; i < this.rows; i++) {
            tmp[i] = []
            for (var j = 0; j < this.cols; j++) {
                tmp[i][j] = this.getType(j,i);
            }
        }
        return tmp;
    }
};

function HumanController(avatar,left, right, up, down, shoot) {
    this.left = left;
    this.right = right;
    this.up = up;
    this.down = down;
    this.shoot = shoot;
    this.avatar = avatar;
    this.action = CONTROL.NOACTION;
    this.fire = false;
}
HumanController.prototype = {
    control: function (world) {
        if (this.fire)
        {
            this.fire = false;
            return CONTROL.SHOOT;
        }
        console.log(this.action);
        return this.action;
    },
    keyPress: function (key,isdown) {
        switch (key) {

            case this.shoot:
            if (isdown) this.fire = true;  
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
    this.firerate = Math.random() *0.1;
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
        var action = this.getBestAction(world);
        //adjust to the grid to avoid stuck.
        var dev = world.getDeviationInfo(this.avatar,action);
                if (dev.needAdjust) return dev.dir;
                else return action;
    },
    getBestAction: function (world) {
        var attack = Math.random() < this.reaction;
        var findplayer = Math.random() < this.attentiveness;
        
        var enemy = world.findNearestEnemy(this.avatar);
        if (enemy==null) return CONTROL.STOP;
        var info = world.getAttackInfo(this.avatar,enemy);
        var curdir = this.avatar.lastdirection;
        var changedir = Math.random() < this.dirchange;
        var fire = Math.random() < this.destructiveness;
        
        //console.log(info);
        if (info.inline && !info.obscured && attack) {
            console.log('Attack');
            if (info.dir==curdir) {
                return CONTROL.SHOOT;
            } else  {
                return info.dir;
            }
        } else if ((!info.inline || info.inline && info.obscured) && findplayer) {
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
    Physijs.BoxMesh.call(this, geometry, material, 100);
    this.gametype = gametype;
    this.controller = controller;
    this.lastdirection = CONTROL.STOP;
}

Character.prototype = Object.create(Physijs.BoxMesh.prototype, {
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
    this.editormode = false;
    this.editor = {
        objects: [],
        type: CONST.EMPTY
    }
    this.config = {
        map: {
            rows: 15,
            columns: 15,
            enemyCount: 5,
            allyCount: 1,
            wallRatio: 0.2,
            stoneRatio: 0.5
        },
        wall: {
            strength: 1,
            type: CONST.WALL,
            health: 30
        },
        stone: {
            strength: 2,
            type: CONST.STONE,
            health: 30
        },
        bullet: {
            1: {
                speed: 40,
                power: 1,
                damage: 10
            },
            2: {
                speed: 40,
                power: 2,
                damage: 10
            }
        },
        enemy: {
            health: 20,
            speed: 15,
            bulletType: 1,
            attentiveniss: 0.2,
            firerate: 400,
            reaction: 0.4,
            gameside: CONST.ENEMY,
            gametype: CONST.ENEMY
        },
        ally: {
            health: 30,
            speed: 15,
            bulletType: 1,
            attentiveniss: 0.8,
            firerate: 400,
            reaction: 1.0,
            gameside: CONST.PLAYER,
            gametype: CONST.ALLY
        },
        player: {
            health: 40,
            speed: 15,
            firerate: 400,
            bulletType: 2,
            gameside: CONST.PLAYER,
            gametype: CONST.PLAYER
        },
        controls: {
            left: 65,
            right: 68,
            up: 87,
            down: 83,
            shoot: 32
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

        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.playerlistener = new THREE.AudioListener();

        this.bgm = new THREE.Audio(this.listener);
        this.bgm.load('/sounds/BGM.wav');
        this.bgm.setRefDistance(200);

        this.bgm.setLoop(true);

        this.loseSound = new THREE.Audio(this.listener);
        this.loseSound.load('/sounds/lose.mp3');
        this.loseSound.setRefDistance(200);
        this.loseSound.setVolume(10);

        this.winSound = new THREE.Audio(this.listener);
        this.winSound.load('/sounds/win.mp3');
        this.winSound.setRefDistance(200);
        this.winSound.setVolume(10);

        this.collisionSound;

        this.scene.add(this.camera);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        //sound.setRolloffFactor(1);

        // Light
        var light = new THREE.SpotLight(0xFFFFFF);
        light.position.set(20, 100, 50);


        this.scene.add(light);


        /* mirror box */
        this.cubeCamera = new THREE.CubeCamera( 1, 100000, 128 );
        var chromeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: this.cubeCamera.renderTarget } );
        //this.reflectBox = new THREE.Mesh(new THREE.SphereGeometry(5,5,5), chromeMaterial); //Sphere
        this.reflectBox = new THREE.Mesh(new THREE.BoxGeometry(5,5,5), chromeMaterial);  //Box
        this.reflectBox.position.y = 2;
        this.scene.add(this.cubeCamera);
        this.scene.add(this.reflectBox);

        /* skybox */
        var path = "/Park3Med/";
        var format = '.jpg';
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var textureCube = THREE.ImageUtils.loadTextureCube( urls );

        var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms[ "tCube" ].value = textureCube;

        var material = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });
                     

        mesh = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000 ), material );
        this.scene.add(mesh);



        this.particleGroup = new SPE.Group({
            texture: {
                value: THREE.ImageUtils.loadTexture('/assets/textures/particles/smokeparticle.png')
            },
            blending: THREE.AdditiveBlending
        });

        var emitterSettings = {
            type: SPE.distributions.SPHERE,
            position: {
                spread: new THREE.Vector3(2),
                radius: 1,
            },
            velocity: {
                value: new THREE.Vector3(30)
            },
            size: {
                value: [15, 0]
            },
            opacity: {
                value: [1, 0]
            },
            color: {
                value: [new THREE.Color('yellow'), new THREE.Color('red')]
            },
            particleCount: 50,
            alive: true,
            duration: 0.05,
            maxAge: {
                value: 0.3
            }
        };

        this.particleGroup.addPool(10, emitterSettings, false);


        // Add particle group to scene.
        this.scene.add(this.particleGroup.mesh);
        if (this.editormode) {
            this.editor.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
            this.editor.redmaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
            this.editor.overlap = false;
        }

    },
    loadModels: function (callback) {
        var self=this;
        var loader = new THREE.ColladaLoader();
        loader.load("/daes/FV510_Warrior/fv510.dae", function (result) {
            var tankmodel=result.scene.children[0].children[0];
            self.tank= {geometry:tankmodel.geometry,
            material:Physijs.createMaterial(tankmodel.material,
                        0, 0)
                
            };
			//var loader = new THREE.ColladaLoader();
			loader.load("/daes/FV510_Warrior/enemy.dae",function (result){
				var tankmodel=result.scene.children[0].children[0];
				console.log(tankmodel);
				self.tank2={geometry:tankmodel.geometry,
					material:Physijs.createMaterial(tankmodel.material,0,0)
				};
                var manager = new THREE.LoadingManager();
				var loader = new THREE.OBJLoader(manager);
				loader.load( '/assets/models/bullet.obj', function ( object ) {
					object.traverse(function(child){
						if (child instanceof THREE.Mesh){
							self.bullet = child;
						}
					});
					callback();
			});
            
        });
		});	
    },
    setPosition: function (player, i, j) {
        var position = this.map.getPosition(i, j);
           player.gridposition = {i:i,j:j};
            player.position.x = position.x;
            player.position.y = position.y;
            player.position.z = position.z;
            player.curdir = { x: 0, z: -1 };
    },
    
    addObject: function(i,j,type) {
        var obj= null;
        switch (type) {
                    case CONST.WALL:
                        obj = this.createWall(i,j,this.config.wall);
                        
                        break;
                    case CONST.STONE:
                        obj = this.createWall(i,j,this.config.stone);
                        
                        break;
                    case CONST.PLAYER:
                        obj = this.createPlayer(i,j,this.config.player);
                        
                        break;
                    case CONST.ENEMY:
                        obj = this.createNPC(i,j,this.config.enemy);
                        
                        break;
                    case CONST.ALLY:
                        obj = this.createNPC(i,j,this.config.ally);
                        
                        break;
                }
                if (obj && this.editormode) {
                    this.editor.objects.push(obj);
                }
    },
    addObjects: function () {
        var map = this.map;
        for (var i = 0; i < map.rows; i++) {
            for (var j = 0; j < map.cols; j++) {
                var type = map.getType(i,j);
                this.addObject(i,j,type);
            }
        }
    },
    removeObject: function(obj) {
        switch (obj.gametype) {
                    case CONST.WALL:
                    case CONST.STONE:
                        this.removeWall(obj);
                        
                        break;
                    
                    case CONST.PLAYER:
                        this.removePlayer();
                        
                        break;
                    case CONST.ENEMY:
                    case CONST.ALLY:
                        this.removeNPC(obj);
                        
                        break;
                }
                
                
    },
    createPlayer: function (i,j,config) {
        //var loader = new THREE.JSONLoader();
        var self = this;
      ///  loader.load('/assets/model/tank_distribution.json', function (geometry, material) {
        
            //mesh = result.scene.children[0].children[0].clone();
            //mesh.scale.set(1, 1, 1);
            //console.log(mesh.geometry);
        //var texture = THREE.ImageUtils.loadTexture("/assets/textures/animals/dog.jpg");

          //  var size = self.map.BOXSIZE;
          //  var geometry = new THREE.BoxGeometry(size, size, size);
            
           /*var material = Physijs.createMaterial(
                        new THREE.MeshLambertMaterial({ color: 0xFFFFFF, map: texture }),
                        0, 0);*/
            self.collisionSound = new THREE.Audio(this.listener);
            self.collisionSound.load('/sounds/explodeEffect.ogg');
            self.collisionSound.setRefDistance(40);
            self.collisionSound.setRolloffFactor(2);

            var player = new Character(this.tank.geometry, this.tank.material,CONST.PLAYER);
            //console.log(mesh.geometry);
            //console.log(mesh.geometry.boundingSphere);
            var scale=3.0/310;//401.4057951126266;
            //console.log(mesh.geometry.boundingSphere.radius);
            player.scale.set(scale, scale, scale);
            self.setPosition(player,i,j);
            self.scene.add(player);
            player.add(self.collisionSound);
            player.health=config.health;
            player.speed=config.speed;
            player.gameside=config.gameside;
            self.health=document.getElementById('health');
            self.health.max=player.health;
            self.health.value=player.health;
            player.bulletType=config.bulletType;
            player.firerate=config.firerate;
            
            var conf=this.config.controls;
            
            var humancontroller = new HumanController(player, parseInt(conf.left), parseInt(conf.right), parseInt(conf.up),parseInt( conf.down), parseInt(conf.shoot));
            self.humancontrollers.push(humancontroller);
           // self.controllers.push(humancontroller);
            self.characters.push(player);
            player.setAngularFactor(new THREE.Vector3(0, 0, 0));
            self.player = player;
            return player;
        
            

    //    });
        
    },
    removePlayer: function () {
        if (!this.player) return;
        this.scene.remove(this.player);
        this.characters.remove(this.player);
        this.controllers.remove(this.player.controller);
        this.map.setType(this.player.gridposition.i, this.player.gridposition.j, CONST.EMPTY);
        this.player = null;
    },
    createNPC: function (i, j, config) {
        // var size = this.map.BOXSIZE;
        // var geometry = new THREE.BoxGeometry(size, size, size);
        // var material = Physijs.createMaterial(
        //             new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/animals/cat.jpg') }),
        //           0, 0);

        var enemy = null;
        if (config.gametype == CONST.ENEMY) {
            enemy =  new Character(this.tank2.geometry, this.tank2.material, CONST.ENEMY);
            var scale = 3.0 / 310;
            enemy.scale.set(scale, scale, scale);
            this.enemycount++;
        } else {
            enemy = new Character(this.tank2.geometry, this.tank2.material, CONST.ALLY);
            var scale = 3.0 / 310;
            enemy.scale.set(scale, scale, scale);
        }
            
        
        //401.4057951126266;
        //console.log(mesh.geometry.boundingSphere.radius);
        
        this.setPosition(enemy, i, j);
        this.scene.add(enemy);
        
        enemy.health = config.health;
        enemy.speed = config.speed;
        enemy.gameside = config.gameside;
        enemy.bulletType = config.bulletType;
        enemy.firerate = config.firerate;
        enemy.setAngularFactor(new THREE.Vector3(0, 0, 0));
        var aicontroller = new AIController(enemy, config.attentiveniss, config.reaction);
        this.controllers.push(aicontroller);
        this.characters.push(enemy);
        return enemy;
    },
    removeNPC: function (enemy) {
        this.scene.remove(enemy);
        this.characters.remove(enemy);
        this.controllers.remove(enemy.controller);
        this.map.setType(enemy.gridposition.i, enemy.gridposition.j, CONST.EMPTY);
        if (enemy.gameside == CONST.ENEMY)
            this.enemycount--;
    },
    createWall: function (i,j,config) {
        var wallGeometry = new THREE.BoxGeometry(BOXSIZE, BOXSIZE, BOXSIZE);
        var wallmaterial = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({ map: config.type==CONST.WALL ? THREE.ImageUtils.loadTexture('/assets/textures/general/brick_1.jpg') 
                    : THREE.ImageUtils.loadTexture('/assets/textures/general/stone.jpg') }),
                    .9, 0);

        var wall = new Physijs.BoxMesh(wallGeometry, wallmaterial, 0);
        var position = this.map.getPosition(i, j);
        wall.gridposition = {i:i,j:j};
        wall.position.x = position.x;
        wall.position.y = position.y;
        wall.position.z = position.z;
        wall.gridposition = {i:i,j:j};
        wall.gametype = config.type;
        wall.strength=config.strength;
        wall.health=config.health;
        this.scene.add(wall);
        this.walls.push(wall);
        return wall;
    },
    removeWall:function(wall) {
        this.scene.remove(wall);
        this.walls.remove(wall);
        this.map.setType(wall.gridposition.i,wall.gridposition.j,CONST.EMPTY);
    },
    createBullet: function (player) {
        var size = BOXSIZE;
        //var geometry = new THREE.SphereGeometry(1, 10, 10);
        //var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        var bullet = new Physijs.SphereMesh(this.bullet.geometry, this.bullet.material, 4);

        bullet.position.x = player.position.x + player.curdir.x * 4;
        bullet.position.y = player.position.y;
        bullet.position.z = player.position.z + player.curdir.z * 4;
        this.bullets.push(bullet);
        this.scene.add(bullet);
        bullet.rotation.set(player.curdir.z * Math.PI / 2, 0, -player.curdir.x * Math.PI / 2);
        bullet.__dirtyRotation = true;
        self = this;
        bullet.gametype = CONST.BULLET;
        var config = this.config.bullet[player.bulletType] || this.config.bullet[1];
        bullet.damage = config.damage;
        bullet.power = config.power;
        bullet.owner = player;
        bullet.setLinearFactor(new THREE.Vector3(1, 0, 1));
        bullet.setLinearVelocity({ x: player.curdir.x * config.speed, y: 0, z: player.curdir.z * config.speed })
        bullet.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            //console.log(self.collisionSound.getVolume());
            self.collisionSound.setVolume(10);
            self.collisionSound.play();
            this.add(self.collisionSound);
            if (other_object === this.owner) return;
            switch (other_object.gametype) {
                case CONST.WALL:
                case CONST.STONE:
                    var wall = other_object;
                    if (this.power >= wall.strength)
                        wall.health -= this.damage;
                    if (wall.health <= 0) {
                        self.particleGroup.triggerPoolEmitter(1, this.position);
                        self.removeWall(wall);
                    }
                    break;
                case CONST.BULLET:
                    if (other_object.owner === this.owner) return;
                    self.particleGroup.triggerPoolEmitter(1, this.position);
                    self.scene.remove(other_object);
                    self.bullets.remove(other_object);
                    break;
                case CONST.PLAYER:
                    var player = other_object;
                    player.health -= this.damage;
                    self.health.value = player.health;
                    if (player.health <= 0) {
                        self.particleGroup.triggerPoolEmitter(1, this.position);
                        self.gameOver = 2;
                        self.removePlayer();
                    }
                    break;
                case CONST.ENEMY:
                case CONST.ALLY:
                    var enemy = other_object;
                    enemy.health -= this.damage;
                    if (enemy.health <= 0) {
                        self.particleGroup.triggerPoolEmitter(1, this.position);
                        self.removeNPC(enemy);
                        if (self.enemycount == 0) self.gameOver = 1;
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
    createGround: function () {
        var ground_material = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/ground/grasslight-big.jpg') }),
            .2, .0);
        var width = this.map.width;
        var height = this.map.height;
        var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(width, 2, height), ground_material, 0);
        ground.position.y = -1;


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
        if (this.editormode) {
            this.editor.objects.push(ground);
            this.editor.ground = ground;
        }

        this.scene.add(ground);
    },
    getVelocityInfo: function (dir) {
        switch (dir) {
            case CONTROL.UP: return { x: 0, z: -1, ay: 0.0 };
            case CONTROL.DOWN: return { x: 0, z: 1, ay: Math.PI };
            case CONTROL.LEFT: return { x: -1, z: 0, ay: Math.PI / 2 };
            case CONTROL.RIGHT: return { x: 1, z: 0, ay: -Math.PI / 2 };
        }
    },
    getDeviationInfo: function (avatar, dir) {
        var dev = this.map.getGridDeviation(avatar.position.x, avatar.position.z);
        var info = { needAdjust: false, dev: dev };
        if (dev.x > 1) { info.dir = CONTROL.LEFT; info.needAdjust = dir == CONTROL.UP || dir == CONTROL.DOWN; }
        else if (dev.x < -1) { info.dir = CONTROL.RIGHT; info.needAdjust = dir == CONTROL.UP || dir == CONTROL.DOWN; }
        else if (dev.y > 1) { info.dir = CONTROL.UP; info.needAdjust = dir == CONTROL.LEFT || dir == CONTROL.RIGHT; }
        else if (dev.y < -1) { info.dir = CONTROL.DOWN; info.needAdjust = dir == CONTROL.LEFT || dir == CONTROL.RIGHT; }
        return info;
    },
    performAction: function (action, player) {
        var axis = new THREE.Vector3(0, 1, 0);

        var quat = new THREE.Quaternion();
        switch (action) {

            case CONTROL.SHOOT: /* space */
                var time = Date.now();
                if (!player.lastfiretime || time - player.lastfiretime >= player.firerate) {
                    var bullet = this.createBullet(player);
                    player.lastfiretime = time;
                }
                return;
                break;

            case CONTROL.UP:
            case CONTROL.DOWN:
            case CONTROL.LEFT:
            case CONTROL.RIGHT:

                var info = this.getVelocityInfo(action);

                player.curdir = { x: info.x, z: info.z };

                if (player.lastdirection !== action) {
                    player.rotation.set(0, info.ay, 0);
                    player.__dirtyRotation = true;
                } //else {

                    
                player.setLinearVelocity({ x: player.speed * info.x, y: 0, z: player.speed * info.z });
                //    }
                break;

            case CONTROL.STOP:
                player.setLinearVelocity({ x: 0, y: 0, z: 0 });

                return;
            default: return;
        }
        player.lastdirection = action;
    },
    createEventListeners: function () {
        var domElement = document.getElementById("viewport");
        var self = this;

        function mouseMoveListener(event) {
            event.preventDefault();

            if (self.editormode && self.editor.curobject) {
                self.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

                self.raycaster.setFromCamera(self.mouse, self.camera);

                var intersects = self.raycaster.intersectObjects(self.editor.objects);
                
                intersects.forEach(function(intersect) {
                    if (intersect.object=self.editor.ground) {
                        var gpos = self.map.getGridPosition(intersect.point.x,intersect.point.z);
                        var pos = self.map.getPosition(gpos.i,gpos.j);
						self.editor.curobject.position.copy(pos);
                        if (self.map.getType(gpos.i,gpos.j)==CONST.EMPTY) {
                            self.editor.curobject.material = self.editor.material;
                        } else self.editor.curobject.material = self.editor.redmaterial;
                    }
                });

            }
        }
        
        function mouseDownListener(event) {
            event.preventDefault();
            if (self.editormode && self.editor.curobject && event.button == 0) {

				self.mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

				self.raycaster.setFromCamera( self.mouse, self.camera );

				var intersects = self.raycaster.intersectObjects( self.editor.objects );
                
                intersects.forEach(function(intersect) {
                    if (intersect.object==self.editor.ground && !self.editor.removeobj) {
                        var gpos = self.map.getGridPosition(intersect.point.x,intersect.point.z);
                        if (self.map.getType(gpos.i,gpos.j)!=CONST.EMPTY) {
                            return;
                        }
                        if (self.editor.type == CONST.PLAYER) {
                            self.removePlayer();
                        }
                        var obj=self.addObject(gpos.i,gpos.j,self.editor.type);
                        self.map.setType(gpos.i,gpos.j,self.editor.type);
                    } else if (intersect.object!=self.editor.ground && self.editor.removeobj) {
                        self.removeObject(intersect.object);
                        self.editor.objects.remove(intersect.object);
                    }
                });
                self.drawMinimap();
            }

        }

        function keyDownListener(event) {
            //console.log("Key down");
            if (self.editormode) {
                switch(event.keyCode) {
                    case self.config.controls.left:
                    self.camera.position.x -=1;
                    break;
                    case self.config.controls.right:
                    self.camera.position.x +=1;
                    break;
                    case self.config.controls.up:
                    self.camera.position.z -=1;
                    break;
                    case self.config.controls.down:
                    self.camera.position.z +=1;
                    break;
                    case 16: //shift
                    self.editor.removeobj = true;
                    break;
                }

            } else {
                for (var i = 0; i < self.humancontrollers.length; i++) {
                    var controller = self.humancontrollers[i]
                    if (controller.avatar.health > 0) {
                        controller.keyPress(event.keyCode, true);
                        var action = controller.control(self);
                        self.performAction(action, controller.avatar);
                    }
                }
            }

        }
        function keyUpListener(event) {
            //console.log("Key up");
            if (self.editormode) {
                switch(event.keyCode) {
                    case 16: //shift
                    self.editor.removeobj = false;
                    break;
                }

            } else {
            for (var i = 0; i < self.humancontrollers.length; i++) {
                var controller = self.humancontrollers[i]
                if (controller.avatar.health > 0) {
                    controller.keyPress(event.keyCode, false);
                    var action = controller.control(self);
                    self.performAction(action, controller.avatar);
                }
            }
            }

        }
        
        function scrollListener(event) {
            return;

        }

        domElement.addEventListener("keydown", keyDownListener, false);
        domElement.addEventListener("keyup", keyUpListener, false);
        window.addEventListener("scroll", scrollListener, false);
        window.addEventListener( 'resize', function() {
        	var w = window.innerWidth,
        		h = window.innerHeight;

        	self.camera.aspect = w / h;
        	self.camera.updateProjectionMatrix();

        	self.renderer.setSize( w, h );
        }, false );

        domElement.setAttribute("tabindex", 0);
        if (self.editormode) {
            domElement.addEventListener("mousemove",mouseMoveListener,false);
            domElement.addEventListener("mousedown",mouseDownListener,false);
        }
        //
    },
    setEditorType: function (type) {
        
        if (this.editor.type != type) {
            this.editor.type=type;
            if (this.editor.curobject)
            this.scene.remove(this.editor.curobject);
            this.addEditorObject();
        }
    },
    addEditorObject: function () {
        var object = null;
        switch (this.editor.type) {
            case CONST.WALL:
            case CONST.STONE:
                var wallGeometry = new THREE.BoxGeometry(BOXSIZE, BOXSIZE, BOXSIZE);
                object = new THREE.Mesh(wallGeometry, this.editor.material);
                break;
            case CONST.ENEMY:
            case CONST.ALLY:
            case CONST.PLAYER:
                object = new THREE.Mesh(this.tank.geometry, this.editor.material);
                var scale = 3.0 / 300;//401.4057951126266;
                //console.log(mesh.geometry.boundingSphere.radius);
                object.scale.set(scale, scale, scale);

                break;
            default:
                return;
        }
        this.scene.add(object);
        this.editor.curobject = object;
    },
    findNearestEnemy: function (avatar) {
        var enemy = null, mdist=null;
        var self=this;
        this.characters.forEach(function (char) {
            if (char.gameside == avatar.gameside) return;
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
        
        return {path:path,obscured:path[1]==undefined ? true : this.map.getType(path[1].x,path[1].y) == CONST.WALL || this.map.getType(path[1].x,path[1].y) == CONST.STONE,nextdir:this.getDirection(path[0],path[1])};
    },
    getDirection: function(pos1,pos2) {
        if (!pos2) return CONTROL.STOP;
        else if (pos1.x < pos2.x) return CONTROL.RIGHT;
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
            for (var j=Math.min(pos.j,enemypos.j)+1;j<Math.max(pos.j,enemypos.j);j++) {
                if (this.map.isWall(pos.i,j)) rst.obscured=true;
            }
        } else if (pos.j==enemypos.j) {
            rst.dir=rst.dirx;
            for (var i=Math.min(pos.i,enemypos.i)+1;i<Math.max(pos.i,enemypos.i);i++) {
                if (this.map.isWall(i,pos.j)) rst.obscured=true;
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
        this.drawMinimap();
        this.updateControllers();
    },
    updateMap: function() {
        var self=this;
        this.characters.forEach(function (char) {
            self.map.setType(char.gridposition.i,char.gridposition.j,CONST.EMPTY);
        });
        this.characters.forEach(function (char) {
            //var gd=self.map.getGridDeviation(char.position.x,char.position.z);
            //console.log(gd);
            //if (Math.abs(gd.x)>1 || Math.abs(gd.y)>1) return;
            char.gridposition = self.map.getGridPosition(char.position.x,char.position.z);
            self.map.setType(char.gridposition.i,char.gridposition.j,char.gametype);
        });
    },
    updateControllers: function () {
        var self=this;
        this.controllers.forEach(function (controller) {
            if (controller.avatar.health > 0) {
                var action = controller.control(self);
                self.performAction(action, controller.avatar);
            }
        });
    },
    drawMinimap: function () {
        var scale = 10;
        var width = scale*this.map.rows;
        var height = scale*this.map.cols;
        this.minimap.width = width;
        this.minimap.height = height;
        this.ctx.clearRect(0,0,width,height);
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2.0;
        this.ctx.strokeRect(0,0,scale*this.map.rows,scale*this.map.cols);
        for (var i=0;i<this.map.rows;i++) {
            for (var j=0;j<this.map.cols;j++) {
                var type=this.map.getType(i,j);
                switch (type) {
                    case CONST.PLAYER:
                    this.ctx.fillStyle = "#00ff00";
                    break;
                    case CONST.ENEMY:
                    this.ctx.fillStyle = "#ff0000";
                    break;
                    case CONST.ALLY:
                    this.ctx.fillStyle = "#0000ff";
                    break;
                    case CONST.WALL:
                    this.ctx.fillStyle = "#c0c0c0";
                    break;
                    case CONST.STONE:
                    this.ctx.fillStyle = "#ffffff";
                    break;
                    default:
                    continue;
                }
                
                this.ctx.fillRect(i*scale,j*scale,scale,scale);
            }
        }
         
        
    },
    loadLevel: function(config,map) {
        this.map = new Map();
        this.config = config;
        var config=this.config.map;
        if (map instanceof Array) {
            this.map.loadMap(map);
        } else if (map=='Empty') {
            this.map.generateEmptyMap(config.rows,config.columns);
            this.editormode = true;
        } else {
            this.map.generateMap(config.rows,config.columns,config.enemyCount,config.allyCount,config.wallRatio,config.stoneRatio);
        }
    },
    exitEditor: function() {
        if (this.editor.curobject) {
            this.scene.remove(this.editor.curobject);
            this.curobject = null;
        }
        this.editormode=false;
        this.bgm.play();
    },
    start: function () {
        this.initScene();
        
        this.running = true;
        this.createGround(this.scene);
        this.clock = new THREE.Clock();
        this.minimap =  document.getElementById('minimap');
        this.ctx = minimap.getContext('2d');
        var self = this;
        this.loadModels(function() {
        self.addObjects();
        self.drawMinimap();
        self.createEventListeners();
        var lastupdate = 0.0;
        var gameover= 0.0;
        if (!self.editormode)
                self.bgm.play();
        self.clock.start();
        render = function () {
            if (self.editormode) {
                self.id = requestAnimationFrame(render);
                self.renderer.render(self.scene, self.camera);
            } else {
                var dt = self.clock.getDelta();
                if (self.gameOver != 0) gameover += dt;
                if (self.running && self.gameOver == 1 && gameover > 2.0) {
                    cancelAnimationFrame(self.id);
                    self.scene = null;
                    self.renderer = null;
                    self.running = false;
                    self.bgm.stop();
                    self.winSound.play();
                    alert("You Win");
                } else if (self.running && self.gameOver == 2 && gameover > 2.0) {
                    cancelAnimationFrame(self.id);
                    self.renderer = null;
                    self.scene = null;
                    self.running = false;
                    self.bgm.stop();
                    self.loseSound.play();
                    alert("Game Over");
                } else {
                    self.id = requestAnimationFrame(render);
                    self.renderer.render(self.scene, self.camera);
                    self.render_stats.update();
                    self.scene.simulate(undefined, 1);

                    self.particleGroup.tick(dt);
                    if (self.player) {
                        self.camera.position.x = self.player.position.x;
                        self.camera.position.z = self.player.position.z + 40;
                        self.camera.lookAt(self.player.position);
                        self.camera.updateProjectionMatrix();
                    }
                    lastupdate += dt;
                    if (self.updateRequired || lastupdate > 0.3 && self.clock.getElapsedTime() > 2.0) {
                        self.updateRequired = false;
                        self.updateGameState();
                        lastupdate = 0.0;

                    }
                }

                self.cubeCamera.position.copy( self.reflectBox.position );
                self.cubeCamera.rotation.copy( self.reflectBox.rotation);
                self.reflectBox.visible = false ;
                if (self.scene){
                    self.cubeCamera.updateCubeMap( self.renderer, self.scene );
                    self.reflectBox.visible = true ;
                }

            }
        }
        requestAnimationFrame(render);
        });
    }
};
