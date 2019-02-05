var container, stats, controls;
var camera, scene, renderer, light;

//=========================================

// Physics variables
var gravityConstant = - 9.8;
var physicsWorld;
var rigidBodies = [];
var margin = 0.05;
var hinge;
var cloth;
var transformAux1 = new Ammo.btTransform();

function initPhysics() {
    // Physics configuration
    var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    var broadphase = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    var softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver );
    physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
    physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
}

//=========================================

const FACE_MORPH = {
    "EYE_CLOSE" : 12,
    "EYE_CLOSE_R" : 13,
    "EYE_CLOSE_L" : 14,
    "EYE_Surpirsed" : 19,
    "MTH_A" : 29,
    "MTH_I" : 30,
    "MTH_U" : 31,
    "MTH_E" : 32,
    "MTH_O" : 33,
};

var morphMesheFace;

var weightFace = {
    12 : 0,
    13 : 0,
    14 : 0,
    19 : 0,
    29 : 0,
    30 : 0,
    31 : 0,
    32 : 0,
    33 : 0,
}

var nodeMeshBody;

var boneBody = {
    // Chest
    "J_Bip_C_Chest": -1,
    // Neck
    "J_Bip_C_Neck": -1,
    // Head
    "J_Bip_C_Head": -1,
    // Eye, don't use z (1, 1, 0)
    "J_Adj_L_FaceEye": -1,
    "J_Adj_R_FaceEye": -1,
    // UpperArm
    "J_Bip_L_UpperArm": -1,
    "J_Bip_R_UpperArm": -1,
    // LowwerArm
    "J_Bip_L_LowerArm": -1,
    "J_Bip_R_LowerArm": -1,
    // Hand
    "J_Bip_L_Hand": -1,
    "J_Bip_R_Hand": -1,
};

var boneBodyTransition = {
     // Chest
     "J_Bip_C_Chest": {
         x : -1,
         y : -1,
         z : -1,
     },
     // Neck
     "J_Bip_C_Neck": {
        x : -1,
        y : -1,
        z : -1,
    },
     // Head
     "J_Bip_C_Head": {
        x : -1,
        y : -1,
        z : -1,
    },
     // Eye, don't use z (1, 1, 0)
     "J_Adj_L_FaceEye": {
        x : -1,
        y : -1,
        z : -1,
    },
     "J_Adj_R_FaceEye": {
        x : -1,
        y : -1,
        z : -1,
    },
     // UpperArm
     "J_Bip_L_UpperArm": {
        x : -1,
        y : -1,
        z : -1,
    },
     "J_Bip_R_UpperArm": {
        x : -1,
        y : -1,
        z : -1,
    },
     // LowwerArm
     "J_Bip_L_LowerArm": {
        x : -1,
        y : -1,
        z : -1,
    },
     "J_Bip_R_LowerArm": {
        x : -1,
        y : -1,
        z : -1,
    },
     // Hand
     "J_Bip_L_Hand": {
        x : -1,
        y : -1,
        z : -1,
    },
     "J_Bip_R_Hand": {
        x : -1,
        y : -1,
        z : -1,
    },
};

const ANIMATION = {
    "Default":null,
};


function init() {
    container = document.querySelector("#cvs-render-vroid");

    // create Scean
    scene = new THREE.Scene();

    // Lighting
    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 10, 0 );
    scene.add( light );

    // for Matcap
    var texLoader = new THREE.TextureLoader();
    var matcap = texLoader.load( 'resource/textures/matcaps/matcap-porcelain-white.jpg', function () {
        matcap.encoding = THREE.sRGBEncoding;
    } );
    var matColor = new THREE.Color(0x444444);

    var loader = new THREE.GLTFLoader().setPath( 'resource/' );
    loader.load( 'Sendagaya_Shibu.glb', function ( gltf ) {
        gltf.scene.traverse( function ( node ) {
            // Matcap
            // if ( node.isMesh ) {
            //     node.material = new THREE.MeshMatcapMaterial( {
            //         color: matColor,
            //         matcap: matcap,
            //         skinning: true,
            //     } );
            // }

            if (node.isMesh && node.name == "Body") {
                nodeMeshBody = node;
            }

            if (node.isMesh && node.morphTargetInfluences) {
                node.material.morphTargets = true; // this setup is just for MatCap
                morphMesheFace = node;
            }

            if (node.isBone) {
                if ( boneBody[node.name] < 0 ) {
                    boneBody[node.name] = node;
                }
            }
        } );
        scene.add( gltf.scene );
    }, undefined, function ( e ) {
        console.error( e );
    } );


    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );


    camera = new THREE.PerspectiveCamera( 45, 960 / 540, 0.25, 20 );
    camera.position.set( 0.2982849955111436, 1.3631726070726906, -0.7060151231565723 );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( -0.061435277558714356, 1.3493664567901864, -0.13999196351380783 );
    controls.panSpeed = 0.5;
    controls.rotateSpeed = 0.5;
    controls.dampingFactor = 0.2;
    controls.enableDamping = true;
    controls.screenSpacePanning = true;
    controls.enabled = false;    
    controls.update();
    
    onWindowResize();


    // init Transition
    for( var k in FACE_MORPH ) {
        weightFace[FACE_MORPH[k]] = new Transition();
    }
    for( var b in boneBody ) {
        boneBodyTransition[b].x = new Transition();
        boneBodyTransition[b].y = new Transition();
        boneBodyTransition[b].z = new Transition();
    }
}

function onWindowResize(){

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.clientWidth, container.clientHeight );

}


class Transition {
    constructor () {
        this.startValue = 0;
        this.endValue = 0;
        this.currentValue = 0;
        
        this.isDone = true;

        this.step = 0;
        this.duration = 30;
    }

    update() {
        var returnValue = this.timing();
        return returnValue;
    }
    
    setCurrent( v ) {
        this.isDone = false;
        this.step = 0;
        this.startValue = v;
    }

    setTarget( v ) {
        this.setCurrent( this.currentValue );
        this.endValue = v;
    }

    timing() {
        if ( this.isDone ) { // is need check distance?
            return this.currentValue;
        }

        this.currentValue = this.startValue + (this.endValue - this.startValue) * (this.step / this.duration);

        if(this.step >= this.duration) {
            this.isDone = true;
        }

        this.step = this.step + 1;

        return this.currentValue;
    }
}


window.addEventListener( 'resize', onWindowResize, false );
