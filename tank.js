
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
CONST = { EMPTY: 0, WALL: 1, PLAYER: 2, ENEMY: 3, BULLET: 4 }
CONTROL = { NOACTION: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4, STOP:5, SHOOT: 6 }
Map = function () { };
Map.prototype = {
    BOXSIZE: 6.0,
    getPosition: function (i, j) {
        var bs = this.BOXSIZE;
        return { x: i * bs + bs / 2 - this.width/2, y: bs / 2, z: j * bs + bs / 2 - this.height/2 }
    },
    getType: function (i, j) {
        return this.map[i * this.rows + j];
    },
    generateMap: function (r, c) {
        var tmp = [];
        for (var i = 0; i < r * c; i++) {
            if (i == 0) tmp[i] = CONST.PLAYER;
            else if (i <= 5) tmp[i] = CONST.ENEMY;
            else tmp[i] = Math.random() > 0.8 ? CONST.WALL : CONST.EMPTY;
        }
        this.map = shuffle(tmp);
        this.rows = r;
        this.cols = c;
        this.width = c * this.BOXSIZE;
        this.height = r * this.BOXSIZE;
    },
    loadMap: function (map) {
        this.map = map;
    },
    createGround: function (scene) {
        var ground_material = Physijs.createMaterial(
                new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/ground/grasslight-big.jpg') }),
                .9, .3);
        var width = this.BOXSIZE * this.cols;
        var height = this.BOXSIZE * this.rows;
        var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(width,2, height), ground_material, 0);
        ground.position.y=-1;

        var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, height), ground_material, 0);
        borderLeft.position.x = -width / 2 + 1;
        borderLeft.position.y = 2;
        ground.add(borderLeft);

        var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, height), ground_material, 0);
        borderRight.position.x = width / 2 + 1;
        borderRight.position.y = 2;
        ground.add(borderRight);

        var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(width + 4, 3, 2), ground_material, 0);
        borderBottom.position.z = height / 2;
        borderBottom.position.y = 2;
        ground.add(borderBottom);

        var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(width + 4, 3, 2), ground_material, 0);
        borderTop.position.z = -height / 2;
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
}
HumanController.prototype = {
    control: function (key) {
        switch (key) {

            case this.shoot: return CONTROL.SHOOT;  break;

            case this.up: return CONTROL.UP; break;
            case this.down: return CONTROL.DOWN; break;

            case this.left: return CONTROL.LEFT; break;
            case this.right: return CONTROL.RIGHT; break;
        }
    }
}

function RandomController(avatar) {
    this.avatar = avatar;
    this.firerate = Math.random() *0.3;
    this.dirchange = Math.random() *0.6;
}

RandomController.prototype = {
    control: function ( world) {
        
        var fire = Math.random() < this.firerate;
        if (fire) return CONTROL.SHOOT;
        else {
            var changedir = Math.random() > this.dirchange;

            if (changedir || this.avatar.lastaction === undefined) {
                return Math.floor(Math.random() * 5) + 1;
            } else return this.avatar.lastaction;
        }
    }
}
function AIController(avatar) {
    this.attentiveness = Math.random();
    this.reaction = Math.random();
    this.avatar = avatar;
}

AIController.prototype = {
    control: function (self, world) {
        var attack = Math.random() > this.reaction;
        var findplayer = Math.random() > this.attentiveness;
        var position = self.getGridPosition();
        var player = world.nearestOpponent();
        var playerpos = player.getGridPosition();
        if (position.x == playerpos.x || position.y == playerpos.y) {

        }
        
    }
}



function Game() {
    this.gameOver = false;
    this.enemies = [];
    this.walls = [];
    this.bullets = [];
    this.humancontrollers = [];
    this.aicontrollers = [];
}

Game.prototype = {
    constructor: Game,
    initScene: function () {
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
    addObjects: function () {
        var map = this.map;
        for (var i = 0; i < map.rows; i++) {
            for (var j = 0; j < map.cols; j++) {
                var type = map.getType(i, j);
                var position = map.getPosition(i, j);
                var obj = null;
                switch (type) {
                    case CONST.WALL:
                        obj = this.createWall(position);
                        this.scene.add(obj);
                        this.walls.push(obj);
                        break;
                    case CONST.PLAYER:
                        this.createPlayer(position);
                        
                        break;
                    case CONST.ENEMY:
                        obj = this.createEnemy(position);
                        this.scene.add(obj);
                        obj.setAngularFactor(new THREE.Vector3(0, 0, 0));
                        var aicontroller = new RandomController(obj);
                        this.aicontrollers.push(aicontroller);
                        this.enemies.push(obj);
                        break;
                }
                if (obj != null) obj.gametype = type;
            }
        }
    },
    createPlayer: function (position) {
        var loader = new THREE.JSONLoader();
        var self = this;
        loader.load('/assets/model/tank_distribution.json', function (geometry, material) {
            var texture = THREE.ImageUtils.loadTexture("assets/model/traveller_1.png");

            //var size = this.map.BOXSIZE;
            //geometry = new THREE.BoxGeometry(size, size, size);
            material = Physijs.createMaterial(
                        new THREE.MeshLambertMaterial({ color: 0xFFFFFF, map: THREE.ImageUtils.loadTexture('/assets/textures/animals/dog.jpg') }),
                        .3, 0);

            var player = new Physijs.BoxMesh(geometry, material, 20);
            player.position.x = position.x;
            player.position.y = position.y;
            player.position.z = position.z;
            player.curdir = { x: 0, z: -1 };
            player.isAlive = true;
            self.scene.add(player);

            var humancontroller = new HumanController(player, 87, 83, 65, 68, 32);
            self.humancontrollers.push(humancontroller);
            player.setAngularFactor(new THREE.Vector3(0, 0, 0));


        });
        
    },
    createEnemy: function (position) {
        var size = this.map.BOXSIZE;
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/animals/cat.jpg') }),
                    .9, 0);

        var enemy = new Physijs.BoxMesh(geometry, material, 20);
        enemy.position.x = position.x;
        enemy.position.y = position.y;
        enemy.position.z = position.z;
        enemy.curdir = { x: 0, z: -1 };
        enemy.isAlive = true;
        return enemy;
    },
    createWall: function (position) {
        var size = this.map.BOXSIZE;
        var wallGeometry = new THREE.BoxGeometry(size, size, size);
        var wallmaterial = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('/assets/textures/general/brick-wall.jpg') }),
                    .9, 0);

        var wall = new Physijs.BoxMesh(wallGeometry, wallmaterial, 0);
        wall.position.x = position.x;
        wall.position.y = position.y;
        wall.position.z = position.z;
        return wall;
    },
    createBullet: function (player) {
        var size = this.map.BOXSIZE;
        var geometry = new THREE.SphereGeometry(1, 10, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        var bullet = new Physijs.BoxMesh(geometry, material, 5);

        bullet.position.x = player.position.x + player.curdir.x * 4;
        bullet.position.y = player.position.y;
        bullet.position.z = player.position.z + player.curdir.z * 4;
        this.bullets.push(bullet);
        this.scene.add(bullet);
        self = this;
        bullet.gametype = CONST.BULLET;
        bullet.owner=player;
        bullet.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            if (other_object === this.owner) return;
            switch (other_object.gametype) {
                case CONST.WALL:
                    break;
                case CONST.BULLET:
                    break;
                case CONST.PLAYER:
                    self.gameOver = true;
                    other_object.isAlive = false;
                    break;
                case CONST.ENEMY:
                    other_object.isAlive = false;
                    break;
                default:
                    self.scene.remove(this);
                    return;
            }

                self.scene.remove(this);
                self.scene.remove(other_object);
            

        });
        bullet.setLinearFactor(new THREE.Vector3(1, 0, 1));
        bullet.setLinearVelocity({ x: player.curdir.x * 40, y: 0, z: player.curdir.z * 40 })
        return bullet;
    },
    performAction: function (action, player) {
        var V = 15;
        switch (action) {

            case CONTROL.SHOOT: /* space */
                var bullet = this.createBullet(player);
                return;
                break;

            case CONTROL.UP: /*W*/
               /* if (player.hconstraint === undefined) {
                    var hconstraint = new Physijs.SliderConstraint(player, new THREE.Vector3(player.position.x, player.position.y, player.position.z), new THREE.Vector3(Math.PI / 2, 0, 0));

                player.hconstraint = hconstraint;
                
                this.scene.addConstraint(hconstraint);
                hconstraint.setLimits(-6, 6, 0, 0);
                hconstraint.setRestitution(0, 0);
                }
                hconstraint = player.hconstraint;
                hconstraint.enableLinearMotor(10,2);*/
                player.curdir = { x: 0, z: -1 };
                player.setLinearVelocity({ x: 0, y: 0, z: -V }); 
                break;
            case CONTROL.DOWN: /*S*/
                player.curdir = { x: 0, z: 1 };
                player.setLinearVelocity({ x: 0, y: 0, z: V }); 
                //hconstraint = player.hconstraint;
                //hconstraint.enableLinearMotor(-10, 2);
                break;

            case CONTROL.LEFT: /*A*/
                player.curdir = { x: -1, z: 0 };

                player.setLinearVelocity({ x: -V, y: 0, z: 0 }); break;
            case CONTROL.RIGHT: /*D*/
                player.curdir = { x: 1, z: 0 };
                player.setLinearVelocity({ x: V, y: 0, z: 0 }); break;
        }
        player.lastaction=action;
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
            console.dir(event);
            for (var i = 0; i < self.humancontrollers.length;i++) {
                var controller = self.humancontrollers[i]
                if (controller.avatar.isAlive) {
                    var action = controller.control(event.keyCode);
                    self.performAction(action, controller.avatar);
                }
            }
            
        }

        domElement.addEventListener("keydown", keyDownListener, false);
        domElement.setAttribute("tabindex", 0);
        //domElement.addEventListener("mousemove",mouseMoveListener,false);
    },
    updateAIControllers: function () {
        for (var i = 0; i < this.aicontrollers.length;i++) {
            var controller = this.aicontrollers[i]
            if (controller.avatar.isAlive) {
                var action = controller.control(this);
                this.performAction(action, controller.avatar);
            }
        }
    },
    start: function () {
        this.initScene();
        this.map = new Map();
        this.map.generateMap(12,12);
        this.map.createGround(this.scene);
        this.addObjects();
        this.createEventListeners();
        var self = this;
        var time = Date.now();
        render = function () {
            requestAnimationFrame(render);
            self.renderer.render(self.scene, self.camera);
            self.render_stats.update();
            if (this.gameOver) {
                return;
            }
            var newtime = Date.now();
            var delta = newtime - time;
            if (delta > 500) {
                self.updateAIControllers();
                time = newtime;
            }
            self.scene.simulate(undefined, 1);
        }
        requestAnimationFrame(render);
    }
};
