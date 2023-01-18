
import * as THREE from '../../build/three.module.js';
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from '../jsm/shaders/FXAAShader.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { ImprovedNoise } from '../jsm/libs/ImprovedNoise.js';
import { Sky } from '../jsm/objects/Sky.js';
import { gsap } from "./greensock/all.js";
    
var action="load"
var count=0;

var scene = null;
var camera = null;
var renderer = null;
var mainCont = null;
var lightingCont = null;
var ambLight = null;
var dl = null;
var dl2 = null;
var bloomPass = null;
var fxaaPass = null;
var composer = null;
var renderScene = null;
var tester = null;
var camContX = null;
var camContY = null;

var renderType = 0;
var objectsLoaded = 0;
var loaderArray=[];
var dt = 0;
var lastTime = 0;
var myScene = 5;
var floor = null;
var floor2 = null;
var clock = null;
var count = 0;
var planeGeo = null;
var planeMat = null;
var planeMat2 = null;

var raycaster = null;

var polyArray = [];
var bigPoly = null;
var smallPolyArray = [];
var shell = null;
var wavePoly = [];

var questionBalls = [];
var subAction = "ready"
var camMoveTime = 2;
var qCue = 1;

var verticesOfCube = [
    -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
    -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
];

var indicesOfFaces = [
    2,1,0,    0,3,2,
    0,4,7,    7,3,0,
    0,1,5,    5,4,0,
    1,2,6,    6,5,1,
    2,3,7,    7,6,2,
    4,5,6,    6,7,4
];

var myNoise = new ImprovedNoise();
var ns;

var params = {exposure: 0, bloomStrength: .75, bloomThreshold: 0, bloomRadius: 0};

window.addEventListener("resize", () => {
    resize3D();
})

//---------------------------------------------------------------------------------------------

document.addEventListener( 'click', e => {

    windowClick();

}, false)

document.addEventListener( 'tap', e => {

    windowClick();

}, false)

function windowClick(){

    if(myScene===5){

        if(subAction==="ready"){

            subAction="move";
            
            var targ = questionBalls[qCue];
            gsap.to(camContX.position, {x: targ.position.x, z: targ.position.z, duration: camMoveTime, ease: "expo.inOut"})

            qCue+=1;
    
        }

    }

}

//---------------------------------------------------------------------------------------------

function update() {

    // document.getElementById("testCont").style.height = (window.innerHeight-100)+"px";

    //---deltatime--------------------------------------------------------------------------------------------------------------

    var currentTime = new Date().getTime();
    dt = (currentTime -lastTime) / 1000;
    if (dt > 1) {
       dt = 0;
    }
    lastTime = currentTime;

    //---action--------------------------------------------------------------------------------------------------------------

    if(action==="load"){

        loadResources();

        action="loading"

    }else if(action==="loading"){

        if(objectsLoaded===loaderArray.length){
            action="set up"
        }

    }else if(action==="set up"){

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,.1, 1520);
        // scene.background = new THREE.Color( 0x000000 );
        
        //---carmera rig--------------------------------------------------------------------------------------------------------------
    
        camContX = new THREE.Group();
        camContY = new THREE.Group();
        scene.add(camContX);
        scene.add(camContY);
    
        camContY.add(camContX)
        camContX.add(camera);
        camera.position.z = 60;
        camera.position.y = 0;
    
        // camContY.rotation.y = ca(45);
        camContX.rotation.x = ca(-55);
    
        //---renderer--------------------------------------------------------------------------------------------------------------
    
        renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance", alpha: true})
    
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.outputEncoding = THREE.sRGBEncoding
    
        renderer.setSize(window.innerWidth,window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    
        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);
    
        //---post processing--------------------------------------------------------------------------------------------------------------

        renderScene = new RenderPass( scene, camera );

        //bloom
    
        // bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), .5, 0, 0.6 );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        //aa

        var fxaaPass = new ShaderPass( FXAAShader );
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
        fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );

        //composer

        composer = new EffectComposer( renderer );
        composer.addPass( renderScene );
        composer.addPass( bloomPass );
        composer.addPass( fxaaPass );

        //---sky--------------------------------------------------------------------------------------------------------------

        //---dom--------------------------------------------------------------------------------------------------------------
    
        document.body.appendChild(renderer.domElement);
        renderer.domElement.style.zIndex = "200";
    
        action="scene";

    }else if(action==="scene"){

        if(dl!==null){
            lightingCont.remove(dl)
        }
        
        if(dl2!==null){
            lightingCont.remove(dl2)
        }

        if(ambLight!==null){
            scene.remove(ambLight)
        }

        if(lightingCont!==null){
            mainCont.remove(lightingCont);
        }

        if(mainCont!==null){
            scene.remove(mainCont);
        }
        
        if(floor2!==null){
            mainCont.remove(floor2)
        }
        
        //---lighting--------------------------------------------------------------------------------------------------------------
    
        mainCont = new THREE.Group();
        scene.add( mainCont );

        lightingCont = new THREE.Group();
        scene.add( lightingCont );

        //amb
            
        // ambLight = new THREE.AmbientLight( 0xffffff, .2 );
        // scene.add( ambLight );

        //direct
        
        // dl = new THREE.DirectionalLight(0xffffff, .8);
        // dl.position.x=10;
        // dl.position.z=-30;
        // dl.position.y=40;
        // lightingCont.add(dl);
        
        // var pointlight = new THREE.PointLight(0xffffff,.5);
        // pointlight.position.set(200,200,200);
        // scene.add(pointlight);

        //---test parts--------------------------------------------------------------------------------------------------------------
    
        // var testBoxGeo = new THREE.SphereGeometry( 4, 64, 64 );
        // var testBoxMat = new THREE.MeshPhysicalMaterial({
        //     clearcoat: 1,
        //     clearcoatRoughness: .1,
        //     metalness: 0.9,
        //     roughness: 0.05,
        //     color: 0x8418ca, 
        //     wireframe: false,
        //     normalMap: glitter,
        //     normalScale: new THREE.Vector2(0.15,0.15),
        //     // emissive: 0xff00e4,
        //     // emissiveIntensity: .05,
        //     envMap: reflectionTexture
        // });
        

        // tester = new THREE.Mesh( testBoxGeo, testBoxMat );
        // tester.name="tester";
        // scene.add( tester );
        // tester.position.x=0
        // tester.position.z=0
        // tester.position.y=2
        // tester.castShadow=true;
        // tester.receiveShadow=true;

        // testBoxMat.normalMap.repeat.set(8, 8);
        // testBoxMat.normalMap.wrapS = testBoxMat.normalMap.wrapT = THREE.RepeatWrapping;
    
        // var planeGeo = new THREE.PlaneGeometry( 200, 200, 32 );
        // var planeMat = new THREE.MeshPhysicalMaterial( {color: 0x333333, side: THREE.DoubleSide} );
        // var testFloor = new THREE.Mesh( planeGeo, planeMat );
        // // scene.add( testFloor );
        // testFloor.rotation.x=ca(90);
        // testFloor.receiveShadow=true;

        mainCont = new THREE.Group();
        scene.add(mainCont);
    
        if(myScene===1){

            scene.fog = new THREE.Fog(0x1a0147, 30, 80);
            camContX.rotation.x = ca(-55);
            mainCont.position.y=0;

            dl = new THREE.DirectionalLight(0xff0000, 1.8);
            dl.position.x=30;
            dl.position.z=20;
            dl.position.y=0;
            lightingCont.add(dl);
            
            var boxSize = 4;
            var totalBoxes = 45;

            for(var x=0; x<totalBoxes; x++){
                for(var z=0; z<totalBoxes; z++){

                    var boxGeo = new THREE.BoxGeometry( boxSize, boxSize*4, boxSize );
                    var boxMat = new THREE.MeshStandardMaterial({
                        // color: 0x000000 
                        color: 0x050143, flatShading: true
                    });

                    var box = new THREE.Mesh( boxGeo, boxMat );
                    mainCont.add( box );
                    box.position.x=(x*boxSize)-(totalBoxes*boxSize/2);
                    box.position.z=(z*boxSize)-(totalBoxes*boxSize/2);
                    box.position.y=(ran(50)/10)-2;

                    gsap.to(box.position, {y: ran(70)/10, duration: (ran(100)/10)+2, repeat: -1, yoyo:true})

                }
            }

            makePoly();
        
        }else if(myScene===2){

            scene.fog = new THREE.Fog(0x1a0147, 30, 80);
            
            camContX.rotation.x = ca(-55);
            mainCont.position.y=0;

            dl = new THREE.DirectionalLight(0xff0000, 1.8);
            dl.position.x=30;
            dl.position.z=20;
            dl.position.y=0;
            lightingCont.add(dl);
            
            var tubeSize = 2;
            var totalTubes = 55;

            for(var x=0; x<totalTubes; x++){
                for(var z=0; z<totalTubes; z++){

                    var tubeGeo = new THREE.CylinderGeometry( tubeSize, tubeSize, 10, 6 );
                    var tubeMat = new THREE.MeshStandardMaterial({
                        color: 0x000000, flatShading: true
                    });

                    var tube = new THREE.Mesh( tubeGeo, tubeMat );
                    mainCont.add( tube );

                    var moveFactor=3.05
                    var moveFactor2=.87

                    tube.position.x=(x*tubeSize*moveFactor2)-(totalTubes*tubeSize/2);
                    tube.position.y=(ran(50)/10);

                    if(x % 2 === 0){
                        
                        tube.position.z=(z*tubeSize*moveFactor)-(totalTubes*tubeSize/2);
                        
                    }else{

                        tube.position.z=(z*tubeSize*moveFactor)-(totalTubes*tubeSize/2)+moveFactor;

                    }
                    
                    gsap.to(tube.position, {y: (ran(70)/10)+1, duration: (ran(100)/10)+2, repeat: -1, yoyo:true})


                }
            }

            makePoly();

        }else if(myScene===3){

            ambLight = new THREE.AmbientLight( 0x9600ff, .5 );
            scene.add( ambLight );

            scene.fog = new THREE.Fog(0x1a0147, 30, 70);
            camContX.rotation.x = ca(-55);
            mainCont.position.y=0;

            dl = new THREE.DirectionalLight(0x1800ff, .6);
            dl.position.x=30;
            dl.position.z=-30;
            dl.position.y=30;
            lightingCont.add(dl);

            // dl2 = new THREE.DirectionalLight(0xff0000, 1.4);
            // dl2.position.x=-30;
            // dl2.position.z=30;
            // dl2.position.y=30;
            // lightingCont.add(dl2);

            clock = new THREE.Clock();

            var planeDivs = 30

            planeGeo = new THREE.PlaneGeometry( 200, 200, planeDivs, planeDivs );
            planeMat = new THREE.MeshStandardMaterial( {color: 0x111111, side: THREE.DoubleSide, flatShading: true} );
            floor = new THREE.Mesh( planeGeo, planeMat );
            floor.position.y=17
            mainCont.add( floor );
            floor.rotation.x=ca(90);

            if(planeMat2===null){
                planeMat2 = new THREE.MeshPhysicalMaterial( {color: 0xff00f6, side: THREE.DoubleSide, transparent:true, opacity:.1, wireframe: true, wireframeLinewidth: 1} );
            }
            floor2 = new THREE.Mesh( planeGeo, planeMat2 );
            floor2.position.y=17
            // floor2.position.x=ran(30)/10
            mainCont.add( floor2 );
            floor2.rotation.x=ca(90);

            wavePoly=[];

            for(var x=-3; x<5; x++){
                for(var z=-3; z<5; z++){

                    var polyGeo = new THREE.IcosahedronGeometry(  .1, 1 );
                    var polyMat = new THREE.MeshStandardMaterial( {color: 0xff0000,  flatShading: true} );
                    var poly = new THREE.Mesh( polyGeo, polyMat );
                    // poly.position.y=15;
                    poly.position.x=x*6.66
                    poly.position.z=z*6.66
                    poly.position.y=17
                    mainCont.add( poly );

                    wavePoly.push(poly)
                    
                }
            }

        }else if(myScene===5){

            ambLight = new THREE.AmbientLight( 0x9600ff, .5 );
            scene.add( ambLight );

            scene.fog = new THREE.Fog(0x240055, 30, 270);
            // scene.background = new THREE.Color( 0x1a0147 );
            // scene.fog = null;
            camContX.rotation.x = ca(-5);
            // camContY.rotation.y = ca(-90);
            camContX.position.y=3;
            mainCont.position.y=0;

            camera.position.z = 20;

            dl = new THREE.DirectionalLight(0x1800ff, .4);
            dl.position.x=30;
            dl.position.z=-30;
            dl.position.y=30;
            lightingCont.add(dl);

            dl2 = new THREE.DirectionalLight(0xff0000, .6);
            dl2.position.x=-30;
            dl2.position.z=-10;
            dl2.position.y=-30;
            lightingCont.add(dl2);

            for(var i=0; i<10; i++){

                var polyGeo = new THREE.IcosahedronGeometry(  1, 1 );
                var polyMat = new THREE.MeshStandardMaterial( {color: 0x222222,  flatShading: true} );
                var poly = new THREE.Mesh( polyGeo, polyMat );
                poly.position.x=ran(200)-100
                poly.position.y=3
                poly.position.z=i*-150;
                mainCont.add( poly );

                questionBalls.push(poly);
    
            }

            camContX.position.x = questionBalls[0].position.x;
            camContX.position.z = questionBalls[0].position.z;


            var planeDivs = 140

            planeGeo = new THREE.PlaneGeometry( 1400, 1400, planeDivs, planeDivs );
            // planeMat = new THREE.MeshStandardMaterial( {color: 0x150023, side: THREE.DoubleSide, flatShading: true, envMap: reflectionTexture} );
            planeMat = new THREE.MeshStandardMaterial( {color: 0x230022, side: THREE.DoubleSide, flatShading: true } );
            // planeMat.metalness = .8;
            // planeMat.roughness = 0.65;
            // planeMat.envMapIntensity=0;
            floor = new THREE.Mesh( planeGeo, planeMat );
            mainCont.add( floor );
            floor.rotation.x=ca(90);

            planeMat2 = new THREE.MeshPhysicalMaterial( {color: 0xff00f6, side: THREE.DoubleSide, transparent:true, opacity:.1, wireframe: true, wireframeLinewidth: 1} );
            floor2 = new THREE.Mesh( planeGeo, planeMat2 );
            mainCont.add( floor2 );
            floor2.rotation.x=ca(90);

        }else if(myScene===4){

            ambLight = new THREE.AmbientLight( 0x9600ff, .2 );
            scene.add( ambLight );

            scene.fog = new THREE.Fog(0x090015, 30, 110);
            scene.background = new THREE.Color( 0x03000e );
            camContX.rotation.x = ca(-30);
            camContY.rotation.y = 0;
            mainCont.position.y=1;

            dl = new THREE.DirectionalLight(0xffffff, .15);
            dl.position.x=30;
            dl.position.z=10;
            dl.position.y=30;
            lightingCont.add(dl);

            dl2 = new THREE.DirectionalLight(0xff0000, 1.8);
            dl2.position.x=-30;
            dl2.position.z=-10;
            dl2.position.y=-30;
            lightingCont.add(dl2);

            // scene.fog.near = 0.1;
            // scene.fog.far = 0;
            
            var polyGeo = new THREE.IcosahedronGeometry(  1, 1 );
            var polyMat = new THREE.MeshStandardMaterial( {color: 0x050143,  flatShading: true} );
            var polyMat2 = new THREE.MeshBasicMaterial( {color: 0x680069, transparent:true, opacity:.075, wireframe: true} );
            var polyMat3 = new THREE.MeshBasicMaterial( {color: 0xff002a} );

            var shellGeo = new THREE.IcosahedronGeometry(  1, 3 );
            var shellMat = new THREE.MeshBasicMaterial( {color: 0x680069, transparent:true, opacity:.075, wireframe: true, fog:false} );
            shell =  new THREE.Mesh( shellGeo, shellMat );
            shell.scale.x=shell.scale.y=shell.scale.z=200
            mainCont.add(shell);

            var polyNum = 75;

            for(var i=0; i<polyNum; i++){

                var polyCont = new THREE.Group();
                mainCont.add( polyCont );

                var polyCont2 = new THREE.Group();
                polyCont.add( polyCont2 );

                var poly = new THREE.Mesh( polyGeo, polyMat );
                polyCont2.add( poly );
                var poly2 = new THREE.Mesh( polyGeo, polyMat2 );
                polyCont2.add( poly2 );

                polyCont.polyCont2=polyCont2;
                
                if(i===0){

                    poly.scale.x=poly.scale.y=poly.scale.z=10
                    poly2.scale.x=poly2.scale.y=poly2.scale.z=10

                    bigPoly=polyCont2;

                }else if(i>polyNum-15){

                    poly.material = polyMat3;

                    polyCont.rotation.y = ca(ran(360));

                    polyCont2.position.z = 12+ran(15)

                    poly.scale.x=poly.scale.y=poly.scale.z = ran(7)/20
                    poly2.scale.x=poly2.scale.y=poly2.scale.z = ran(7)/20

                    polyCont.speed=ran(14)+14
                    polyCont.polyCont2.speed=ran(14)+14

                    var rran=ran(2);
                    if(rran===1){
                        polyCont.speed*=-1
                        polyCont.polyCont2.speed*=-1
                    }
                        
                    smallPolyArray.push(polyCont);

                }else{

                    polyCont.rotation.y = ca(ran(360));

                    var dist = i*.6

                    polyCont2.position.z = 10+dist

                    poly.scale.x=poly.scale.y=poly.scale.z = (19 - dist)/7
                    poly2.scale.x=poly2.scale.y=poly2.scale.z=poly.scale.z

                    polyCont.speed=ran(14)+14
                    polyCont.polyCont2.speed=ran(14)+14

                    var rran=ran(2);
                    if(rran===1){
                        polyCont.speed*=-1
                        polyCont.polyCont2.speed*=-1
                    }
                        
                    smallPolyArray.push(polyCont);

                }

            }

        }

        //---scene--------------------------------------------------------------------------------------------------------------
    
        action="loop";

    }else if(action==="loop"){

        if(myScene===1){

            mainCont.rotation.y-=ca(9)*dt;

        }else if(myScene===2){

            mainCont.rotation.y+=ca(9)*dt;

        }else if(myScene===5){

            count+=dt/4;

            for (var i = 0; i < planeGeo.vertices.length; i++) {

                var p = planeGeo.vertices[i]
                var m = .025;
                ns = myNoise.noise((p.x*m)+.01+count, (p.y*m)+.01+count, .01);
                planeGeo.vertices[i].z = ns*2;

            }

            planeGeo.verticesNeedUpdate = true
            planeMat.needUpdate = true

            if(subAction==="move"){

                count+=dt;
                if(count>camMoveTime){

                    count=0;
                    subAction="ready";

                }

            }

        }else if(myScene===3){

            mainCont.rotation.y+=ca(9)*dt;

            count+=dt/8;

            for (var i = 0; i < planeGeo.vertices.length; i++) {

                var p = planeGeo.vertices[i]
                var m = .1;
                ns = myNoise.noise((p.x*m)+.01+count, (p.y*m)+.01+count, .01);
                planeGeo.vertices[i].z = ns*7;

            }

            planeGeo.verticesNeedUpdate = true
            planeMat.needUpdate = true

            for(var i=0; i<wavePoly.length; i++){

                var rcl = new THREE.Vector3();
                wavePoly[i].getWorldPosition(rcl);
                
                // var rcl = wavePoly[i].position;

                var rc = new THREE.Vector3( rcl.x, 100, rcl.z )

                raycaster = new THREE.Raycaster(rc, new THREE.Vector3( 0, -1, 0 ), 0, 200);
                var floorArray = [floor];
                var intersects = raycaster.intersectObjects( floorArray, true );
    
                for ( let j = 0; j < intersects.length; j ++ ) {
    
                    // intersects[ i ].object.material.color.set( 0xff00ff );
                    // console.log(intersects[ j ])

                    wavePoly[i].position.y=intersects[j].point.y

                    if(i===40){
                        // console.log(intersects[j].point.y);
                    }
    
                }
    
            }


        }else if(myScene===4){

            var masterSpeed = .4

            // lightingCont.rotation.y+=dt*1;
            bigPoly.rotation.y+=dt*.4*masterSpeed;
            shell.rotation.y+=dt*.04*masterSpeed;

            for(var i=0; i<smallPolyArray.length; i++){
                smallPolyArray[i].rotation.y+=dt*smallPolyArray[i].speed/100*masterSpeed
                smallPolyArray[i].polyCont2.rotation.y+=dt*smallPolyArray[i].polyCont2.speed/100*masterSpeed
            }
    
        }

        

        //---LOOP--------------------------------------------------------------------------------------

        if(renderType===0){
            renderer.render(scene, camera);
        }else{
            composer.render();
        }

    }

    handlePoly();

    requestAnimationFrame(update);
    
}

requestAnimationFrame(update);

//---HELPERS----------------------------------------------------------------------------------------

function makePoly(){

    for(var i=0; i<polyArray.length; i++){

        mainCont.remove(polyArray[i]);

    }

    polyArray=[];

    var polyGeo = new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, .07, 2 );
    var polyMat = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );

    var polyNum = 20;

    for(var i=0; i<polyNum; i++){

        var poly = new THREE.Mesh( polyGeo, polyMat );
        poly.position.y=15;
        poly.position.x=-ran(40)+20
        poly.position.z=-ran(40)+20
        mainCont.add( poly );

        if(i<polyNum/2){
            poly.dir="x";
        }else{
            poly.dir="z";
        }

        poly.speed = ran(3)+3

        var r = ran(2);
        if(r===1){
            poly.speed*=-1;
        }

        polyArray.push(poly);

        gsap.to(poly.scale, {x: 0.3, y: 0.3, z: 0.3, duration: (ran(40)/10)+2, delay:ran(2), repeat: -1, yoyo:true})

    }
    

}

function handlePoly(){

    for(var i=0; i<polyArray.length; i++){

        var p = polyArray[i];

        if(p.dir==="x"){

            p.position.x+=dt*p.speed*.4;
            if(p.position.x>20){
                p.position.x=-19;
            }else if(p.position.x<-20){
                p.position.x=19;
            }

        }else{

            p.position.z+=dt*p.speed*.4;
            if(p.position.z>20){
                p.position.z=-19;
            }else if(p.position.z<-20){
                p.position.z=19;
            }

        }

    }

}

//---LOAD RESOURCES----------------------------------------------------------------------------------------

document.addEventListener("keydown", event => {

    if (event.key === " ") {

        if(renderType===0){
            renderType=1;
        }else{
            renderType=0;
        }

    }else if (event.key === "1") {

        action="scene"
        myScene=1;

    }else if (event.key === "2") {

        action="scene"
        myScene=2;

    }else if (event.key === "3") {

        action="scene"
        myScene=3;

    }else if (event.key === "4") {

        action="scene"
        myScene=4;

    //    floor2.material.wireframe=false;
    //    floor2.material.color=0x000000;

    }else if (event.key === "q") {

        scene.fog.near = 0.1;
        scene.fog.far = 0;
        
    }

});
//---LOAD RESOURCES----------------------------------------------------------------------------------------

var glitter;
var reflectionTexture

function loadResources(){

    loaderArray.push("glitter"); glitter = new THREE.TextureLoader().load( './src/img/glitter.jpg', loadTexture(this));

    var myObject = "skybox"; loaderArray.push(myObject);
    var loader = new THREE.CubeTextureLoader();
    reflectionTexture = loader.load([
    './src/img/skyboxGrey/pos-x.png',
    './src/img/skyboxGrey/neg-x.png',
    './src/img/skyboxGrey/pos-y.png',
    './src/img/skyboxGrey/neg-y.png',
    './src/img/skyboxGrey/pos-z.png',
    './src/img/skyboxGrey/neg-z.png',
    ],loadTexture(this));

}

function loadTexture(loader){

    objectsLoaded+=1;
    console.log("TEXTURE: "+objectsLoaded)
    
}

function resize3D(){

    console.log("resize")

    var width = window.innerWidth;
    var height = window.innerHeight;

    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

}

//---UTILS----------------------------------------------------------------------------------------

function ca(ang) {
    var pi = Math.PI;
    return ang * (pi/180);
}

function ca2(ang){
    var pi = Math.PI;
    return ang * (180/pi);
}

function ran(num) {
    var num1 = Math.random() * num;
    var num2 = Math.floor(num1);
    return num2;
}
