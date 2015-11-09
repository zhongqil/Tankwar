
function Map(r,c) {
    this.prototype={
            EMPTY:0,WALL:1,PLAYER:2,ENEMY:3,BOXSIZE:10,
            getPosition:function(i,j) {
                return {x:i*BOXSIZE+BOXSIZE/2,y:BOXSIZE/2,z:j*BOXSIZE+BOXSIZE/2}
            },
            createObjects:function() {
            },
            generateMap:function(r,c) {
                this.map=[];
                this.rows=r;
                this.cols=c;
                for(var i=0;i<r;i++) {
                    this.map[i]=new Array;
                    for(var j=0;j<c;j++) {
                        this.map[i][j]=0;
                    }
                 }
            },
            loadMap:function(map) {
                this.map=map;
            },
            createGround:function (scene) {
            var ground_material = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('/assets/textures/ground/grasslight-big.jpg')}),
                    .9, .3);

            var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 1, 60), ground_material, 0);

            var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 60), ground_material, 0);
            borderLeft.position.x = -31;
            borderLeft.position.y = 2;
            ground.add(borderLeft);

            var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 60), ground_material, 0);
            borderRight.position.x = 31;
            borderRight.position.y = 2;
            ground.add(borderRight);

            var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(64, 3, 2), ground_material, 0);
            borderBottom.position.z = 30;
            borderBottom.position.y = 2;
            ground.add(borderBottom);

            var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(64, 3, 2), ground_material, 0);
            borderTop.position.z = -30;
            borderTop.position.y = 2;
            ground.add(borderTop);

            scene.add(ground);
        }
    };

}


function Game(){
	this.gameOver = false;
}

Game.prototype={
    constructor:Game,
    start:function() {
        this.scene=this.initScene();
        this.map=new Map();
        this.map.generateMap(20,20);
        this.map.createGround(this.scene);
        requestAnimationFrame(this.render);
    
    },
    render:function () {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
        this.render_stats.update();

        this.scene.simulate(undefined, 1);


    },
    initScene:function () {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer=this.renderer;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.setClearColor(new THREE.Color(0x000000));
        document.getElementById('viewport').appendChild(renderer.domElement);

        this.render_stats = new Stats();
        this.render_stats.domElement.style.position = 'absolute';
        this.render_stats.domElement.style.top = '1px';
        this.render_stats.domElement.style.zIndex = 100;
        document.getElementById('viewport').appendChild(render_stats.domElement);

        this.scene = new Physijs.Scene;
        this.scene.setGravity(new THREE.Vector3(0, -50, 0));

        this.camera = new THREE.PerspectiveCamera(
                35,
                window.innerWidth / window.innerHeight,
                1,
                1000
        );
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(new THREE.Vector3(10, 0, 10));
        this.scene.add(camera);

        // Light
        var light = new THREE.SpotLight(0xFFFFFF);
        light.position.set(20, 100, 50);


        this.scene.add(light);
        


        //var gui = new dat.GUI();
        //gui.add(controls, 'gravityX', -100, 100);
        //gui.add(controls, 'gravityY', -100, 100);
        //gui.add(controls, 'gravityZ', -100, 100);
        //gui.add(controls, 'resetScene');

    }
};