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
}

const BONE = {
    "standard":null,
}

const ANIMATION = {
    "standard":null,
}


if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var container, stats, controls;
var camera, scene, renderer, light;

var morphMesheFace;

init();

function init() {
    container = document.querySelector("#cvs-render-vroid");

    camera = new THREE.PerspectiveCamera( 45, 960 / 540, 0.25, 20 );
    camera.position.set( 0.2982849955111436, 1.3631726070726906, -0.7060151231565723 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xBBBBBB );

    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 10, 0 );
    scene.add( light );

    var texLoader = new THREE.TextureLoader();

    var matcap = texLoader.load( 'resource/textures/matcaps/matcap-porcelain-white.jpg', function () {
        matcap.encoding = THREE.sRGBEncoding;
    } );

    var matColor = new THREE.Color(0x444444);

    var loader = new THREE.GLTFLoader().setPath( 'resource/' );
    loader.load( 'Sendagaya_Shibu.glb', function ( gltf ) {
        gltf.scene.traverse( function ( node ) {
            if ( node.isMesh ) {
                node.material = new THREE.MeshMatcapMaterial( {
                    color: matColor,
                    matcap: matcap,
                } );
            }
            if (node.isMesh && node.morphTargetInfluences) {
                // this setup is just for MatCap
                node.material.morphTargets = true;
                morphMesheFace = node;
            }
        } );
        scene.add( gltf.scene );
    }, undefined, function ( e ) {
        console.error( e );
    } );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    onWindowResize();
    renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( -0.061435277558714356, 1.3493664567901864, -0.13999196351380783 );
    controls.panSpeed = 0.5;
    controls.rotateSpeed = 0.5;
    controls.dampingFactor = 0.2;
    controls.enableDamping = true;
    controls.screenSpacePanning = true;
    controls.update();
    controls.enabled = false;
}


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.clientWidth, container.clientHeight );

}