
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
var waveCount = 0;
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
var questionBallWires = [];
var questConts = [];
var bitBalls = [];
var subAction = "ready"
var camMoveTime = 2;
var qCue = 1;
var polyInnerMat = null;
var glowMat = null;
var gradGlow = null;
var gradGlowWhite = null;
var gradGlowWhite2 = null;

var question = null;
var ans1 = null;
var ans2 = null;
var ans3 = null;
var questOpacity = 0;
var questOpacity1 = 0;
var questOpacity2 = 0;
var questOpacity3 = 0;
var questionTime = 0;
var miniBallCount = 0;
var flashOpacity = 0;
var addScoreOpacity = 0;
var addScoreDown = 0;
var cometSound=false;
var questionWerp = 3;

var t = new Object();
t.addScoreDown = 0;
t.addScoreOpacity = 0;

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

    // moveToNext();

}, false)

document.addEventListener( 'tap', e => {

    // moveToNext();

}, false)

function moveToNext(){

    if(myScene===5){

        // if(subAction==="ready"){

            for(var i=0; i<questConts.length; i++){

                gsap.killTweensOf( questConts[i].timerBallCont.rotation );

                if(questConts[i].timerBallCont.rotation.z!==0){
                    gsap.to(questConts[i].timerBallCont2.scale, { x: 0, y: 0, z: 0, duration: .25,  ease: "expo.out"})
                }

            }

            subAction="move";
            
            var targ = questConts[qCue];
            gsap.to(camContX.position, {x: targ.position.x, z: targ.position.z, y: targ.position.y, duration: camMoveTime, ease: "expo.inOut"})
            gsap.to(camContX.rotation, {x: ca(-5), duration: camMoveTime/2, ease: "sine.out"})
            gsap.to(camContX.rotation, {x: ca(0), duration: camMoveTime/2, delay: camMoveTime/2, ease: "sine.out"})

            for(var i=0; i<questConts[qCue].innerArray.length; i++){

                var q = questConts[qCue].innerArray[i].poly;
                gsap.to(q.position, {z: ran(6)+2, duration: camMoveTime, delay: camMoveTime, ease: "expo.out"})

            }

            gsap.to(questConts[qCue].timerBallCont2.position, { y: 1.4, duration: camMoveTime/4, delay: camMoveTime, ease: "expo.out"})
            // gsap.to(questConts[qCue].timerBallCont.rotation, { z: ca(-360), duration: 6, delay: camMoveTime + .25, ease: "linear"})
            // gsap.to(questConts[qCue].timerBallCont2.scale, { x: 0, y: 0, z: 0, duration: .25, delay: camMoveTime + 1 + 6, ease: "expo.out"})
            // gsap.to(questConts[qCue].timerBallLight, { intensity: 0, duration: .25, delay: camMoveTime + 1 + 6, ease: "expo.out"})

            questConts[qCue].timerBallLight.intensity = 2;

            var sc = 1.5
            var sc2 = 1.2
            
            // questConts[qCue].poly2.material.color.setHex(0x5300b3);
            
            var targetColor = new THREE.Color(0xffffff);
            var targetColor2 = new THREE.Color(0x5300b3);

            var spt = .125
            var spt2 = 1

            gsap.to(questConts[qCue].poly2.scale, {x: sc, y: sc, z: sc, duration: spt, delay: camMoveTime, ease: "expo.out"})
            gsap.to(questConts[qCue].poly2.material.color, { r: targetColor.r, t: targetColor.t, b: targetColor.b, duration: spt, delay: camMoveTime, ease: "expo.out"})
            gsap.to(questConts[qCue].poly2.material, { opacity: 1, duration: spt, delay: camMoveTime, ease: "expo.out"})

            gsap.to(questConts[qCue].poly2.scale, {x: sc2, y: sc2, z: sc2, duration: spt2, delay: camMoveTime+spt, ease: "expo.out"})
            gsap.to(questConts[qCue].poly2.material.color, { r: targetColor2.r, t: targetColor2.t, b: targetColor2.b, duration: spt2, delay: camMoveTime+spt, ease: "expo.out"})
            gsap.to(questConts[qCue].poly2.material, { opacity: .2, duration: spt2, delay: camMoveTime+spt, ease: "expo.out"})
            
            qCue+=1;
    
        // }

    }

}

function clickAnswer(ans){

    console.log(ans);

    if(subAction==="waiting for answer"){

        console.log("next")

        if(ans===3){
            subAction="answered right"
        }else{
            subAction="answered wrong"
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
        camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,.1, 1000);
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

        question = document.getElementById("question");
        ans1 = document.getElementById("ans1");
        ans2 = document.getElementById("ans2");
        ans3 = document.getElementById("ans3");

                
        ans1.addEventListener( 'click', e => {

            clickAnswer(1)

        }, false)

        ans2.addEventListener( 'click', e => {

            clickAnswer(2)

        }, false)

        ans3.addEventListener( 'click', e => {

            clickAnswer(3)

        }, false)


        //---dom--------------------------------------------------------------------------------------------------------------
    
        document.body.appendChild(renderer.domElement);
        renderer.domElement.style.zIndex = "200";
        renderer.domElement.style.opacity = "0";

        action="scene";

    }else if(action==="scene"){

        //---conts--------------------------------------------------------------------------------------------------------------
    
        mainCont = new THREE.Group();
        scene.add( mainCont );

        lightingCont = new THREE.Group();
        scene.add( lightingCont );

        mainCont = new THREE.Group();
        scene.add(mainCont);
    
        if(myScene===5){

            //set up

            // scene.background = new THREE.Color( 0x1a0147 );
            scene.fog = new THREE.Fog(fogColor, 30, 370);
            camContX.rotation.x = ca(0);
            camContX.position.y=3;
            mainCont.position.y=0;

            camera.position.z = 20;

            //lights

            ambLight = new THREE.AmbientLight( ambColor, .5 );
            scene.add( ambLight );

            dl = new THREE.DirectionalLight( dlColor, .4);
            dl.position.x=30;
            dl.position.z=-30;
            dl.position.y=30;
            lightingCont.add(dl);

            dl2 = new THREE.DirectionalLight( dl2Color, .6);
            dl2.position.x=-30;
            dl2.position.z=-10;
            dl2.position.y=-30;
            lightingCont.add(dl2);

            //question balls

            var polyGeo = new THREE.IcosahedronGeometry(  1, 1 );
            polyInnerMat = new THREE.MeshStandardMaterial( {color: polyInnerColor} );
            
            glowMat = new THREE.MeshBasicMaterial( {color: 0xbf40a6, transparent: true, opacity: .6, map: gradGlow} );

            for(var i=0; i<10; i++){

                var questCont = new THREE.Group();
                scene.add( questCont );

                var polyMat = new THREE.MeshStandardMaterial( {color: questionBallColor, flatShading: true} );
                var polyMat2 = new THREE.MeshPhongMaterial( {color: questionBallWireColor, transparent: true, wireframe: true} );

                // basic shape

                var poly = new THREE.Mesh( polyGeo, polyMat );
                questCont.add( poly );
                questionBalls.push( poly );

                // wireframe

                var poly2 = new THREE.Mesh( polyGeo, polyMat2 );
                questCont.add( poly2 );
                questionBallWires.push( poly2 );

                // breaker

                var breakerMat = new THREE.MeshStandardMaterial( {color: questionBallColor, flatShading: true, visible: false} );
     
                var breaker = breakObj.clone();
                questCont.add(breaker);

                questCont.breaks = [];

                breaker.traverse( ( object ) =>  {

                    if ( object.isMesh ){

                        object.material = breakerMat;

                        object.speedx = object.position.x
                        object.speedy = object.position.y*1.5
                        object.speedz = object.position.z

                        questCont.breaks.push( object );

                    }

                });

                // glow plane

                var glowGeo = new THREE.PlaneGeometry( 3, 3, 1, 1 );
                var glowPlane = new THREE.Mesh( glowGeo, glowMat );
                questCont.add( glowPlane );

                // timer ball

                var timerBallCont = new THREE.Group();
                questCont.add( timerBallCont );

                var timerBallCont2 = new THREE.Group();
                timerBallCont.add( timerBallCont2 );

                timerBallCont2.scale.x = timerBallCont2.scale.y = timerBallCont2.scale.z = .7;
                // timerBallCont2.position.y = 1.4;

                var timerGeo = new THREE.SphereGeometry( .1, 16, 16 );
                var timerMat = new THREE.MeshStandardMaterial( {color: timerColor, flatShading: true} );
                var timerBall = new THREE.Mesh( timerGeo, timerMat );
                timerBallCont2.add( timerBall );

                var glowMat2 = new THREE.MeshBasicMaterial( {color: 0x00aeff, transparent: true, opacity: .4, map: gradGlowWhite, side: THREE.DoubleSide} );
                var glowGeo2 = new THREE.PlaneGeometry( .4, .4, 1, 1 );
                var glowPlane2 = new THREE.Mesh( glowGeo2, glowMat2 );
                timerBallCont2.add( glowPlane2 );

                var timerLight = new THREE.PointLight( 0xffffff, 1, 100 );
                timerBallCont2.add( timerLight );

                questCont.timerBallCont = timerBallCont;
                questCont.timerBallCont2 = timerBallCont2;
                questCont.timerBallLight = timerLight;
                questCont.timerBall = timerBall;

                // inner balls

                questCont.innerArray = [];
                questCont.innerArray2 = [];

                var innerGeo = new THREE.IcosahedronGeometry(1, 1);

                for(var j=0; j<10; j++){

                    var questInnerCont = new THREE.Group();
                    questCont.add( questInnerCont );
                    questInnerCont.rotation.x = ca( nran(30) );
                    questInnerCont.rotation.y = ca( ran(360) );
    
                    var polyInner = new THREE.Mesh( innerGeo, polyInnerMat );
                    // polyInner.position.z = ran(8)+2;
                    polyInner.scale.x = polyInner.scale.y = polyInner.scale.z = (ran(4)+4)/100;
                    questInnerCont.poly = polyInner;
                    questInnerCont.add( polyInner );
                    questCont.innerArray.push( questInnerCont );
                    questCont.innerArray2.push( polyInner );

                    questInnerCont.rotSpeed = nran(10);
                    if(questInnerCont.rotSpeed===0){
                        questInnerCont.rotSpeed = 5;
                    }

                }

                // refs

                questCont.poly = poly;
                questCont.poly2 = poly2;
                questCont.breaker = breaker;
                questCont.glowPlane = glowPlane;

                questCont.rotateMe = true;

                questCont.position.x=ran(200)-100
                questCont.position.y=ran(60)-30
                questCont.position.z=i*-150;
                questConts.push( questCont );

    
            }

            camContX.position.x = questConts[0].position.x;
            camContX.position.y = questConts[0].position.y;
            camContX.position.z = questConts[0].position.z;

            //bits

            var bitGeo = new THREE.TetrahedronGeometry(.4, 0);
            var bitMat = new THREE.MeshStandardMaterial( {color: bitColor,  flatShading: true} );

            for(var i=0; i<1500; i++){

                var poly = new THREE.Mesh( bitGeo, bitMat );
                poly.position.x=ran(400)-200;
                poly.position.y=ran(200)-100;
                poly.position.z=-ran(2000);
                mainCont.add( poly );

                poly.xspeed = ran(30)/30;
                poly.yspeed = ran(30)/30;
                poly.zspeed = ran(30)/30;

                bitBalls.push(poly);

            }


            //floor

            var planeDivs = 140

            planeGeo = new THREE.PlaneGeometry( 1400, 1400, planeDivs, planeDivs );
            planeMat = new THREE.MeshStandardMaterial( {color: floorColor, side: THREE.DoubleSide, flatShading: true } );
            // planeMat = new THREE.MeshStandardMaterial( {color: 0x150023, side: THREE.DoubleSide, flatShading: true, envMap: reflectionTexture} );
            // planeMat.metalness = .8;
            // planeMat.roughness = 0.65;
            // planeMat.envMapIntensity=0;
            floor = new THREE.Mesh( planeGeo, planeMat );
            mainCont.add( floor );
            floor.rotation.x=ca(90);

            planeMat2 = new THREE.MeshPhysicalMaterial( {color: floor2Color, side: THREE.DoubleSide, transparent:true, opacity:.1, wireframe: true, wireframeLinewidth: 1} );
            floor2 = new THREE.Mesh( planeGeo, planeMat2 );
            mainCont.add( floor2 );
            floor2.rotation.x=ca(90);

            // var shellGeo = new THREE.IcosahedronGeometry(  1, 3 );
            // var shellMat = new THREE.MeshBasicMaterial( {color: 0x680069, transparent:true, opacity:.075, wireframe: true, fog:false} );
            // shell =  new THREE.Mesh( shellGeo, shellMat );
            // shell.scale.x=shell.scale.y=shell.scale.z=200
            // mainCont.add(shell);

        }

        //---scene--------------------------------------------------------------------------------------------------------------

        moveToNext();
    
        gsap.to(renderer.domElement.style, {opacity: "1", duration: 2 })
    
        action="loop";

    }else if(action==="loop"){

        var ans_width = 150;

        // document.getElementById("ans1").style.transform = "translate("+((window.innerWidth/2)-ans_width)+"px, "+(window.innerHeight - (window.innerHeight*.14))+"px";
        // document.getElementById("ans2").style.transform = "translate("+((window.innerWidth/2)-ans_width)+"px, "+(window.innerHeight - (window.innerHeight*.22))+"px";
        // document.getElementById("ans3").style.transform = "translate("+((window.innerWidth/2)-ans_width)+"px, "+(window.innerHeight - (window.innerHeight*.30))+"px";

        var sideMove = 400;
        var downMove = .25

        document.getElementById("ans2").style.transform = "translate("+((window.innerWidth/2)-ans_width)+"px, "+(window.innerHeight - (window.innerHeight*downMove))+"px";
        document.getElementById("ans1").style.transform = "translate("+((window.innerWidth/2)-ans_width-sideMove)+"px, "+(window.innerHeight - (window.innerHeight*downMove))+"px";
        document.getElementById("ans3").style.transform ="translate("+((window.innerWidth/2)-ans_width+sideMove)+"px, "+(window.innerHeight - (window.innerHeight*downMove))+"px";

        document.getElementById("boosts").style.transform ="translate("+((window.innerWidth/2)-158)+"px, "+(window.innerHeight - (window.innerHeight*.15))+"px";
        document.getElementById("questionNum").style.transform ="translate("+((window.innerWidth/2)-100)+"px, "+(window.innerHeight*.11)+"px";

        

        document.getElementById("boosts").style.opacity = document.getElementById("question").style.opacity
        document.getElementById("questionNum").style.opacity = document.getElementById("question").style.opacity



        if(myScene===5){

            for(var i=0; i<questConts.length; i++){

                if(questConts[i].rotateMe===true){

                    questionBalls[i].rotation.y+=dt*.3;
                    questionBallWires[i].rotation.y+=dt*.3;
                    questConts[i].breaker.rotation.y=questionBallWires[i].rotation.y
    
                    for(var j=0; j<questConts[i].innerArray.length; j++){
                        questConts[i].innerArray[j].rotation.y+=ca(questConts[i].innerArray[j].rotSpeed)/20;
                    }
    
                }

            }

            for(var i=0; i<bitBalls.length; i++){

                bitBalls[i].rotation.y+=dt*bitBalls[i].yspeed;
                bitBalls[i].rotation.z+=dt*bitBalls[i].zspeed;
                bitBalls[i].rotation.x+=dt*bitBalls[i].xspeed;

            }

            //waves

            waveCount+=dt/4;

            for (var i = 0; i < planeGeo.vertices.length; i++) {

                var p = planeGeo.vertices[i]
                var m = .025;
                ns = myNoise.noise((p.x*m)+.01+waveCount, (p.y*m)+.01+waveCount, .01);
                planeGeo.vertices[i].z = ns*2;

            }

            planeGeo.verticesNeedUpdate = true
            planeMat.needUpdate = true

            //camera move

            // console.log(subAction)

            if(subAction==="move"){

                questOpacity-=dt*3
                questOpacity1-=dt*3
                questOpacity2-=dt*3
                questOpacity3-=dt*3

                question.style.opacity=questOpacity+"";
                ans1.style.opacity=questOpacity1+"";
                ans2.style.opacity=questOpacity2+"";
                ans3.style.opacity=questOpacity3+"";

                count+=dt;
                if(count>camMoveTime){

                    count=0;
                    subAction="ball up";

                    questOpacity=0;
                    questOpacity1=0;
                    questOpacity2=0;
                    questOpacity3=0;

                    questionTime=6;

                    snd("glint1");

                }

            }else if(subAction==="ball up"){

                count+=dt;
                if(count>.75){

                    count=0;
                    subAction="asking";

                                
                    if(qCue-1===1){
                        document.getElementById("questionNum").innerHTML = "I"
                    }else if(qCue-1===2){
                        document.getElementById("questionNum").innerHTML = "II"
                    }else if(qCue-1===3){
                        document.getElementById("questionNum").innerHTML = "III"
                    }else if(qCue-1===4){
                        document.getElementById("questionNum").innerHTML = "IV"
                    }else if(qCue-1===5){
                        document.getElementById("questionNum").innerHTML = "V"
                    }else if(qCue-1===6){
                        document.getElementById("questionNum").innerHTML = "VI"
                    }else if(qCue-1===7){
                        document.getElementById("questionNum").innerHTML = "VII"
                    }else if(qCue-1===8){
                        document.getElementById("questionNum").innerHTML = "VIII"
                    }else if(qCue-1===9){
                        document.getElementById("questionNum").innerHTML = "IX"
                    }else if(qCue-1===10){
                        document.getElementById("questionNum").innerHTML = "X"
                    }


                }

            }else if(subAction==="asking"){

                questOpacity+=dt;
                questOpacity1+=dt;
                questOpacity2+=dt;
                questOpacity3+=dt;

                question.style.opacity=questOpacity+"";
                ans1.style.opacity=questOpacity1+"";
                ans2.style.opacity=questOpacity2+"";
                ans3.style.opacity=questOpacity3+"";

                if(questOpacity1>=1){
                    subAction="waiting for answer"
                }

                questionTime-=dt;
                questConts[qCue-1].timerBallCont.rotation.z = ca(questionTime*60)
                makeMiniBalls(questConts[qCue-1].timerBall);

                questionWerp=4;
                
            }else if(subAction==="waiting for answer"){

                questionTime-=dt*.5;
                questConts[qCue-1].timerBallCont.rotation.z = ca(questionTime*60)
                makeMiniBalls(questConts[qCue-1].timerBall);

                // console.log(questionTime*-60)

                if(questionTime<=0){
                    subAction="answered wrong"
                }

                if(questionTime<2 && questionWerp===4){
                    snd("werp");
                    questionWerp-=1
                }else if(questionTime<1.5 && questionWerp===3){
                    snd("werp");
                    questionWerp-=1
                }else if(questionTime<1 && questionWerp===2){
                    snd("werp");
                    questionWerp-=1
                }else if(questionTime<.5 && questionWerp===1){
                    snd("werp");
                    questionWerp-=1
                }

            }else if(subAction==="answered wrong"){

                snd("wrong");

                ans1.style.opacity=.2;
                ans2.style.opacity=.2;
                questOpacity1=.2
                questOpacity2=.2

                flashOpacity=.3

                document.getElementById("flash").style.opacity = flashOpacity;
                document.getElementById("flash").style.backgroundColor = "#ff0000";

                subAction="show answer wrong"

            }else if(subAction==="show answer wrong"){

                if(flashOpacity>0){
                    flashOpacity-=dt*.2;
                }
                document.getElementById("flash").style.opacity = flashOpacity;

                var q =  questConts[qCue-1]

                var breakSpeed=5;
                var breakGravity=-2;
                var breakRot=3;

                q.poly.material.visible=false;
                // gsap.to(q.poly2.scale, {x: 0, y: 0, z: 0, duration: .5 })
                gsap.to(q.timerBallCont2.scale, {x: 0, y: 0, z: 0, duration: .5 })
                gsap.to(q.glowPlane.material, {opacity: 0, duration: .5 })

                for(var i=0; i< q.innerArray.length; i++){

                    gsap.to(q.innerArray[i].scale, {x: 0, y: 0, z: 0, duration: .5 })

                }

                for(var i=0; i<q.breaks.length; i++){

                    q.breaks[i].material.visible = true;

                    q.breaks[i].position.x += q.breaks[i].speedx * breakSpeed * dt;
                    q.breaks[i].position.y += q.breaks[i].speedy * breakSpeed * dt;
                    q.breaks[i].position.z += q.breaks[i].speedz * breakSpeed * dt;

                    q.breaks[i].rotation.x += q.breaks[i].speedx * breakRot * dt;
                    q.breaks[i].rotation.y += q.breaks[i].speedy * breakRot * dt;
                    q.breaks[i].rotation.z += q.breaks[i].speedz * breakRot * dt;

                    q.breaks[i].speedy += breakGravity * dt;

                }

                count+=dt;
                if(count>4){

                    count=0;
                    subAction = "end animation"

                }

            }else if(subAction==="answered right"){

                snd("right");

                ans1.style.opacity=.2;
                ans2.style.opacity=.2;
                questOpacity1=.2
                questOpacity2=.2

                questConts[qCue-1].rotateMe=false;

                flashOpacity=.2

                document.getElementById("flash").style.opacity = flashOpacity;
                document.getElementById("flash").style.backgroundColor = "#00ffff";

                // gsap.to(questConts[qCue-1].poly.rotation, {y: ca(-300), duration: 2, ease: "expo.out" })
                // gsap.to(questConts[qCue-1].poly2.rotation, {y: ca(-300), duration: 2, ease: "expo.out" })

                var targetColor = new THREE.Color(0x14e0ff);
                var targetColor2 = new THREE.Color(0xffffff);
                
                var q =  questConts[qCue-1]

                for(var i=0; i< q.innerArray2.length; i++){

                    gsap.to(q.innerArray2[i].scale, {x: 0, y: 0, z: 0, duration: .5 })

                }

                document.getElementById("addScore").style.opacity = 1;
                document.getElementById("addScore").innerHTML = ""+(Math.round(questionTime*1500))

                var dl = 1;
                var dl2 = 15;

                questConts[qCue-1].rotation.y=0;

                gsap.to(questConts[qCue-1].poly.position, {x: questConts[qCue-1].poly.position.x-dl, y: questConts[qCue-1].poly.position.y-dl, duration: .8, ease: "quart.out" })
                gsap.to(questConts[qCue-1].poly.position, {x: questConts[qCue-1].poly.position.x+dl2, duration: 1, delay: .8, ease: "quint.inOut" })
                gsap.to(questConts[qCue-1].poly.position, {y: questConts[qCue-1].poly.position.y+dl2, duration: 1, delay: .8, ease: "quart.inOut" })

                var ds = .5
                var ds2 = .1

                gsap.to(questConts[qCue-1].poly.scale, {x: ds, y: ds, z: ds, duration: 1, ease: "quart.out" })
                gsap.to(questConts[qCue-1].poly.scale, {x: ds2, y: ds2, z: ds2, duration: 1, ease: "quart.out" })

                gsap.to(q.glowPlane.material, {opacity: 0, duration: .5 })
                gsap.to(questConts[qCue-1].poly.material.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 1, ease: "expo.out"})
                // gsap.to(questConts[qCue-1].poly2.material.color, { r: targetColor2.r, g: targetColor2.g, b: targetColor2.b, duration: 1, ease: "expo.out"})

                // mainCont.add(questConts[qCue-1].poly2);

                // gsap.to(q.timerBallCont.scale, {x: 0, y: 0, z: 0, duration: .5 })
                // gsap.to(q.timerBallCont2.scale, {x: 0, y: 0, z: 0, duration: .5 })

                t.addScoreDown=80;
                t.addScoreOpacity=0;

                addScoreDown = t.addScoreDown;
                addScoreOpacity = t.addScoreOpacity;
                document.getElementById("addScore").style.transform ="translate("+((window.innerWidth/2)-100)+"px, "+((window.innerHeight/2)-60-addScoreDown)+"px";

                gsap.to(t, {addScoreDown: 0, duration: .4, ease: "quart.out" })
                gsap.to(t, {addScoreOpacity: .8, duration: .4, ease: "linear" })

                document.getElementById("addScore").style.opacity = 0;

                cometSound=false;

                subAction="show answer right"

            }else if(subAction==="show answer right"){

                if(flashOpacity>0){
                    flashOpacity-=dt*.1;
                }
                document.getElementById("flash").style.opacity = flashOpacity;

                questConts[qCue-1].poly2.rotation.y += dt*.3

                //---------------

                addScoreDown = t.addScoreDown;
                addScoreOpacity = t.addScoreOpacity;

                if(count>3.0 && t.addScoreOpacity===.8){
                    gsap.to(t, {addScoreOpacity: 0, duration: .5 })
                }

                document.getElementById("addScore").style.opacity=addScoreOpacity;

                document.getElementById("addScore").style.transform ="translate("+((window.innerWidth/2)-100)+"px, "+((window.innerHeight/2)-60-addScoreDown)+"px";

                //---------------

                count+=dt;

                if(count>.8 && cometSound===false){
                    cometSound=true;
                    snd("comet");
                }

                if(count>3.5){

                    count=0;
                    subAction = "end animation"

                }

            }else if(subAction==="end animation"){

                snd("woosh")

                moveToNext();
                subAction="move"

                if(qCue>=10){
                    subAction="end"
                }

                

            }

        }

        //---LOOP--------------------------------------------------------------------------------------

        if(renderType===0){
            renderer.render(scene, camera);
        }else{
            composer.render();
        }

        mixer();

    }

    function makeMiniBalls(ob){

        miniBallCount+=dt;

        if(miniBallCount>.01){

            miniBallCount=0;

            var miniMat = new THREE.MeshStandardMaterial( {color: 0x00ffff, opacity: (ran(5)+5)/10, transparent: true, side: THREE.DoubleSide, map: gradGlowWhite2 } );

            var ms = (ran(5)/100) + .05;

            var miniGeo = new THREE.PlaneGeometry( ms, ms, 1, 1 );
            var miniPlane = new THREE.Mesh( miniGeo, miniMat );

            var rcl = new THREE.Vector3();
            ob.getWorldPosition(rcl);

            var mdiv = 200;
            var mdiv2 = 50;

            var mdiv3 = 100

            miniPlane.position.x = rcl.x + nran(10)/mdiv
            miniPlane.position.y = rcl.y + nran(10)/mdiv
            miniPlane.position.z = rcl.z + nran(10)/mdiv

            gsap.to(miniPlane.scale, {x: 0, y: 0, z: 0, duration: ran(mdiv3)/10 })
            gsap.to(miniPlane.position, {x: miniPlane.position.x + nran(10)/mdiv2, y: miniPlane.position.y + nran(10)/mdiv2, duration: ran(mdiv3)/10 })

            scene.add( miniPlane );
            
        }


    }

    handlePoly();

    requestAnimationFrame(update);
    
}

requestAnimationFrame(update);

//---HELPERS----------------------------------------------------------------------------------------

var questionBallColor = new THREE.Color(0xb8009c);
var questionBallWireColor = new THREE.Color(0xfa00ed);
var polyInnerColor = new THREE.Color(0x73008a);
var timerColor = new THREE.Color(0x1d93e2);

var floorColor = new THREE.Color(0x1c0070);
var floor2Color = new THREE.Color(0xa875ff);

var dlColor = new THREE.Color(0xa7a7a9);
var dl2Color = new THREE.Color(0xff0000);
var ambColor = new THREE.Color(0xd4d3d4);
// var ambColor = new THREE.Color(0xffffff);

var fogColor = new THREE.Color(0x700099);
var bitColor = new THREE.Color(0xb8009c);


function mixer(){

    floor.material.visible=false;
    floor2.material.visible=false;

    if(document.getElementById("mix").checked === true){

        //-------------------------------------

        var c1_H = document.getElementById("c1_H").value;
        var c1_S = document.getElementById("c1_S").value;
        var c1_L = document.getElementById("c1_L").value;

        document.getElementById("c1_Color").value = hslToHex(c1_H,c1_S,c1_L);

        // glowMat.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );
        
        // scene.fog.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );

        for(var i=0; i<questConts.length; i++){
            questConts[i].poly.material.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );
        }
        
        //-------------------------------------

        var c2_H = document.getElementById("c2_H").value;
        var c2_S = document.getElementById("c2_S").value;
        var c2_L = document.getElementById("c2_L").value;

        for(var i=0; i<questConts.length; i++){
            questConts[i].poly2.material.color.setHex( "0x"+hslToHex(c2_H,c2_S,c2_L) );
        }
        
        // document.getElementById("c2_Color").value = hslToHex(c2_H,c2_S,c2_L);

        // floor.material.color.setHex( "0x"+hslToHex(c2_H,c2_S,c2_L) );

        //-------------------------------------

        var c3_H = document.getElementById("c3_H").value;
        var c3_S = document.getElementById("c3_S").value;
        var c3_L = document.getElementById("c3_L").value;

        document.getElementById("c3_Color").value = hslToHex(c3_H,c3_S,c3_L);
        
        // dl.color.setHex( "0x"+hslToHex(c3_H,c3_S,c3_L) );

        //-------------------------------------

        var c4_H = document.getElementById("c4_H").value;
        var c4_S = document.getElementById("c4_S").value;
        var c4_L = document.getElementById("c4_L").value;

        document.getElementById("c4_Color").value = hslToHex(c4_H,c4_S,c4_L);
        
        // ambLight.color.setHex( "0x"+hslToHex(c4_H,c4_S,c4_L) );

        //-------------------------------------

        var c5_H = document.getElementById("c5_H").value;
        var c5_S = document.getElementById("c5_S").value;
        var c5_L = document.getElementById("c5_L").value;

        document.getElementById("c5_Color").value = hslToHex(c5_H,c5_S,c5_L);
        
        // floor2.material.color.setHex( "0x"+hslToHex(c5_H,c5_S,c5_L) );

        //-------------------------------------

        var num1 = document.getElementById("num1").value;
        var num2 = document.getElementById("num2").value;
        var num3 = document.getElementById("num3").value;

        // glowMat.opacity = num1/100;

        // for(var i=0; i<questionBallWires.length; i++){
        //     questionBallWires[i].material.opacity = num1/100
        // }

    }

}

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

//---LISTENERS----------------------------------------------------------------------------------------

document.addEventListener("keydown", event => {

    if (event.key === " ") {

        // if(renderType===0){
        //     renderType=1;
        // }else{
        //     renderType=0;
        // }

        // if(qCue===0){
        //     moveToNext();
        // }
        // moveToNext();

    }else if (event.key === "1") {

        if(renderType===0){
            renderType=1;
        }else{
            renderType=0;
        }

        // action="scene"
        // myScene=1;

    }else if (event.key === "2") {

        // action="scene"
        // myScene=2;
        document.getElementById("mixer").style.display = "none"

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

var breakObj = null;
var totalModels = 0;

function loadResources(){

    loaderArray.push("gradGlow"); gradGlow = new THREE.TextureLoader().load( './src/img/gradGlow.png', loadTexture(this));
    loaderArray.push("gradGlowWhite"); gradGlowWhite = new THREE.TextureLoader().load( './src/img/gradGlowWhite.png', loadTexture(this));
    loaderArray.push("gradGlowWhite2"); gradGlowWhite2 = new THREE.TextureLoader().load( './src/img/gradGlowWhite2.png', loadTexture(this));

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

    var myObject = "break1"; loaderArray.push(myObject); totalModels+=1;
    var manager = new THREE.LoadingManager(); manager.onLoad = () => { managerLoad(myObject) };
    var loader = new GLTFLoader(manager); loader.load('./src/models/'+myObject+'.glb', gltf => {  
    
        gltf.scene.traverse( function( object ) {

            breakObj = gltf.scene;

        });
        
    }, loadModel);


}

function managerLoad(obName){

    console.log("model load")

    // console.log("MODEL: "+obName+" - "+managermodelsLoaded+" / "+managertotalModels)
    
    // managermodelsLoaded+=1;
    
}

function loadModel(){
    
    objectsLoaded+=1;
    console.log("MODEL: "+objectsLoaded)
    
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

    snd("right");

}

//---SOUNDS----------------------------------------------------------------------------------------

var soundArray = [
    "right", "wrong", "comet", "glint1", "glint2", "werp", "woosh"
];
var loadedSounds = [];

for(var i=0; i<soundArray.length; i++){
    loadSounds(soundArray[i]);
}

function loadSounds(url){
    var theSound = new Howl({
        src: ['./src/sounds/'+url+".mp3"]
    });
    theSound.on('load', (event) => {
        theSound.name=url;
        loadedSounds.push(theSound);
        console.log("SOUND: "+url+" - "+loadedSounds.length+" / "+soundArray.length);
    });
}

function snd(type){

    for(var i=0; i<loadedSounds.length; i++){
        if(loadedSounds[i].name===type){
            console.log("play "+type)
            loadedSounds[i].play();
        }
    }
    
}


//---UTILS----------------------------------------------------------------------------------------

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `${f(0)}${f(8)}${f(4)}`;
}

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

function nran(num) {
    var num1 = Math.random() * (num*2);
    var num2 = Math.floor(num1-num);
    return num2;
  }
