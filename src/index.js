
import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { gsap } from "./greensock/all.js";
    
//---VARS------------------------------------------------------------------------------------------

var action="load"
var gameAction = "ready"

var count=0;
var dt = 0;
var lastTime = 0;
var objectsLoaded = 0;
var camMoveTime = 2;
var qCue = 1;
var qCue = 1;
var questOpacity = 0;
var questOpacity1 = 0;
var questOpacity2 = 0;
var questOpacity3 = 0;
var questionTime = 0;
var miniBallCount = 0;
var flashOpacity = 0;
var addScoreOpacity = 0;
var addScoreDown = 0;
var domFadeInTime = 2;
var questionWerp = 3;
var correctAnswer = 1;
var countNum = 3;
var tickCount = 0;
var totalScore = 0;
var showScore = 0;
var gs = 0;

var scene = null;
var camera = null;
var renderer = null;
var mainCont = null;
var lightingCont = null;
var ambLight = null;
var camContX = null;
var camContY = null;
var polyInnerMat = null;
var glowMat = null;
var gradGlow = null;
var gradGlowWhite = null;
var gradGlowWhite2 = null;
var ring = null;
var question = null;
var ans1 = null;
var ans2 = null;
var ans3 = null;
var countCont = null;
var countMat = null;

var loaderArray=[];
var questionBalls = [];
var questionBallWires = [];
var questConts = [];
var bitBalls = [];
var cConts = [];

var cometSound=false;
var scoreAni=false;

var t = new Object();
t.addScoreDown = 0;
t.addScoreOpacity = 0;
t.gs = 0;

//---CLICK------------------------------------------------------------------------------------------

function clickAnswer(ans){

    if(gameAction==="waiting for answer"){

        console.log("answer: "+ans+" / "+correctAnswer);

        if(ans===correctAnswer){
            gameAction="answered right";
        }else{
            gameAction="answered wrong";
        }

    }

}

function showAnswer(){

    if(correctAnswer===1){

        ans2.style.opacity=.2;
        ans3.style.opacity=.2;
        questOpacity2=.2
        questOpacity3=.2
    
    }else if(correctAnswer===2){

        ans1.style.opacity=.2;
        ans3.style.opacity=.2;
        questOpacity1=.2
        questOpacity3=.2
    
    }else if(correctAnswer===3){

        ans1.style.opacity=.2;
        ans2.style.opacity=.2;
        questOpacity1=.2
        questOpacity2=.2
    
    }

}

//---LOOP------------------------------------------------------------------------------------------

function update() {

    //---score--------------------------------------------------------------------------------------------------------------

    document.getElementById("score").innerHTML = showScore+"";

    document.getElementById("score").style.textShadow = "0 0 10px rgba(255,255,255,"+(t.gs*2)+"), 0 0 30px rgba(0,255,170,"+(t.gs*2)+")";

    // if(countMat!==null){
    //     countMat.color = countMatColor;
    // }

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
    
        camContY.rotation.y = ca(0);
        camContX.rotation.x = ca(-55);
    
        //---renderer--------------------------------------------------------------------------------------------------------------
    
        renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance", alpha: true})
    
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.outputEncoding = THREE.sRGBEncoding
    
        renderer.setSize(window.innerWidth,window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    
        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);
    
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

        //conts
    
        mainCont = new THREE.Group();
        scene.add( mainCont );

        lightingCont = new THREE.Group();
        scene.add( lightingCont );

        mainCont = new THREE.Group();
        scene.add(mainCont);

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
        
        for(var i=0; i<10; i++){

            var glowMat = new THREE.MeshBasicMaterial( {color: 0xbf40a6, transparent: true, opacity: .6, map: gradGlow} );

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

            var timerGeo = new THREE.SphereGeometry( .1, 16, 16 );
            var timerMat = new THREE.MeshStandardMaterial( {color: timerColor, flatShading: true} );
            var timerBall = new THREE.Mesh( timerGeo, timerMat );
            timerBallCont2.add( timerBall );

            var glowMat2 = new THREE.MeshBasicMaterial( {color: 0x00aeff, transparent: true, opacity: .4, map: gradGlowWhite, side: THREE.DoubleSide} );
            var glowGeo2 = new THREE.PlaneGeometry( .4, .4, 1, 1 );
            var glowPlane2 = new THREE.Mesh( glowGeo2, glowMat2 );
            timerBallCont2.add( glowPlane2 );

            var timerLight = new THREE.PointLight( 0xffffff, 0, 100 );
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

            // hide the first one

            if(i===0){
                questCont.scale.x = questCont.scale.y = questCont.scale.z = 0;
            }

        }

        //timer count down objects

        countCont = new THREE.Group();
        mainCont.add( countCont );

        countCont.rotation.x = ca(90);

        countMat = new THREE.MeshStandardMaterial( {color: questionBallColor,  flatShading: false} );

        for(var i=0; i<3; i++){

            var cCont = new THREE.Group();
            countCont.add( cCont );

            var cContInner = new THREE.Group();
            cCont.add( cContInner );

            var countGeo = new THREE.SphereGeometry( .5, 32, 32 );
            var countBall = new THREE.Mesh( countGeo, countMat );
            cContInner.add( countBall );

            var glowGeo = new THREE.PlaneGeometry( 1.5, 1.5, 1, 1 );
            var glowMat = new THREE.MeshBasicMaterial( {color: 0xbf40a6, transparent: true, opacity: .75, map: gradGlow} );
            var glowPlane = new THREE.Mesh( glowGeo, glowMat );
            glowPlane.rotation.x = ca(-90);
            cContInner.add( glowPlane );

            var ringGeo = new THREE.PlaneGeometry( 1.5, 1.5, 1, 1 );
            var ringMat = new THREE.MeshBasicMaterial( {color: 0xbf40a6, transparent: true, opacity: .75, map: ring, side: THREE.DoubleSide} );
            var ringPlane = new THREE.Mesh( ringGeo, ringMat );
            ringPlane.rotation.x = ca(-90);
            ringPlane.scale.x = ringPlane.scale.y = ringPlane.scale.z = 0;
            cContInner.add( ringPlane );

            cCont.rotation.y = ca(i*120);

            cContInner.scale.x = cContInner.scale.y = cContInner.scale.z = 0;
            cConts.push(cCont);

            cCont.ball = cContInner;
            cCont.ballOb = countBall;
            cCont.ring = ringPlane;

        }

        countCont.position.x = questConts[0].position.x;
        countCont.position.y = questConts[0].position.y;
        countCont.position.z = questConts[0].position.z+200;

        //initial positioning

        camContX.position.x = questConts[0].position.x;
        camContX.position.y = questConts[0].position.y;
        camContX.position.z = questConts[0].position.z+200;

        //bits

        var bitGeo = new THREE.TetrahedronGeometry(.4, 0);
        var bitMat = new THREE.MeshStandardMaterial( {color: bitColor,  flatShading: true} );

        for(var i=0; i<1500; i++){

            var poly = new THREE.Mesh( bitGeo, bitMat );
            poly.position.x=ran(400)-200;
            poly.position.y=ran(200)-100;
            poly.position.z=-ran(2000)+200;
            mainCont.add( poly );

            poly.xspeed = ran(30)/30;
            poly.yspeed = ran(30)/30;
            poly.zspeed = ran(30)/30;

            bitBalls.push(poly);

        }

        //---scene--------------------------------------------------------------------------------------------------------------

        gameAction="wait for a click"
        action="loop";

    }else if(action==="loop"){

        //position question and answers

        var ans_width = 170;

        var sideMove = 400;
        var downMove = .25

        document.getElementById("ans2").style.transform = "translate("+((window.innerWidth/2)-ans_width)+"px, "+(window.innerHeight - (window.innerHeight*downMove))+"px";
        document.getElementById("ans1").style.transform = "translate("+((window.innerWidth/2)-ans_width-sideMove)+"px, "+(window.innerHeight - (window.innerHeight*downMove))+"px";
        document.getElementById("ans3").style.transform ="translate("+((window.innerWidth/2)-ans_width+sideMove)+"px, "+(window.innerHeight - (window.innerHeight*downMove))+"px";

        document.getElementById("boosts").style.transform ="translate("+((window.innerWidth/2)-158)+"px, "+(window.innerHeight - (window.innerHeight*.15))+"px";
        document.getElementById("questionNum").style.transform ="translate("+((window.innerWidth/2)-100)+"px, "+(window.innerHeight*.11)+"px";

        document.getElementById("boosts").style.opacity = document.getElementById("question").style.opacity
        document.getElementById("questionNum").style.opacity = document.getElementById("question").style.opacity

        //rotate all question balls

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

        //rotate all bits

        for(var i=0; i<bitBalls.length; i++){

            bitBalls[i].rotation.y+=dt*bitBalls[i].yspeed;
            bitBalls[i].rotation.z+=dt*bitBalls[i].zspeed;
            bitBalls[i].rotation.x+=dt*bitBalls[i].xspeed;

        }

        //---MAIN GAME LOOP--------------------------------------------------------------------------------------------------------------

        if(gameAction==="wait for a click"){

            //engage in window to start

        }else if(gameAction==="start it"){

            gsap.to(renderer.domElement.style, {opacity: "1", duration: domFadeInTime })
    
            gameAction="start wait"

        }else if(gameAction==="start wait"){

            //wait for opacity of 3d background to come in

            count+=dt;
            if(count>domFadeInTime){

                count=0;
                gameAction="count down start"

            }

            camContX.position.z-=dt*15
            countCont.position.z=camContX.position.z;

        }else if(gameAction==="count down start"){

            var bd = .7
            var ts = .125
            var tt = .125
            var rt = .55

            snd("glint1")

            cConts[0].ballOb.material.color.setHex("0xffffff");

            gsap.killTweensOf(cConts[0].ballOb.material.color)
            gsap.killTweensOf(cConts[1].ballOb.material.color)
            gsap.killTweensOf(cConts[2].ballOb.material.color)

            gsap.killTweensOf(cConts[0].ring.scale)
            gsap.killTweensOf(cConts[1].ring.scale)
            gsap.killTweensOf(cConts[2].ring.scale)

            gsap.killTweensOf(cConts[0].ring.material)
            gsap.killTweensOf(cConts[1].ring.material)
            gsap.killTweensOf(cConts[2].ring.material)

            cConts[0].ring.scale.x = cConts[0].ring.scale.y = cConts[0].ring.scale.z = 0;
            cConts[1].ring.scale.x = cConts[1].ring.scale.y = cConts[1].ring.scale.z = 0;
            cConts[2].ring.scale.x = cConts[2].ring.scale.y = cConts[2].ring.scale.z = 0;

            var rs = 2
            var re = "expo.out"

            gsap.to(cConts[0].ballOb.material.color, {
                r: countMatColor.r,
                g: countMatColor.g,
                b: countMatColor.b,
                duration: 1, ease: "expo.out"  })

            cConts[0].ring.material.opacity = 1;
            
            cConts[0].ring.position.y = .01
            cConts[1].ring.position.y = .02
            cConts[2].ring.position.y = .03
            
            cConts[0].ring.material.opacity = .5;
            cConts[1].ring.material.opacity = .5;
            cConts[2].ring.material.opacity = .5;

            if(countNum===3){

                cConts[0].rotation.y = 0;
                cConts[1].rotation.y = ca(120);
                cConts[2].rotation.y = ca(240);

                cConts[0].ball.position.z=bd;
                cConts[1].ball.position.z=bd;
                cConts[2].ball.position.z=bd;

                // gsap.to(cConts[0].ball.position, {z: bd, duration: tt, delay: ts, ease: "expo.out" })
                // gsap.to(cConts[1].ball.position, {z: bd, duration: tt, delay: ts, ease: "expo.out" })
                // gsap.to(cConts[2].ball.position, {z: bd, duration: tt, delay: ts, ease: "expo.out" })

                gsap.to(cConts[0].ball.scale, {x: 1, y: 1, z: 1, duration: tt, ease: "expo.out"  })
                gsap.to(cConts[1].ball.scale, {x: 1, y: 1, z: 1, duration: tt, ease: "expo.out"  })
                gsap.to(cConts[2].ball.scale, {x: 1, y: 1, z: 1, duration: tt, ease: "expo.out"  })

                gsap.to(cConts[0].ring.scale, {x: rs, y: rs, z: rs, duration: rt, ease: "expo.out"  })
                gsap.to(cConts[1].ring.scale, {x: rs, y: rs, z: rs, duration: rt, ease: "expo.out"  })
                gsap.to(cConts[2].ring.scale, {x: rs, y: rs, z: rs, duration: rt, ease: "expo.out"  })

                gsap.to(cConts[0].ring.material, {opacity: 0, duration: rt, ease: re  })
                gsap.to(cConts[1].ring.material, {opacity: 0, duration: rt, ease: re  })
                gsap.to(cConts[2].ring.material, {opacity: 0, duration: rt, ease: re  })

            }else if(countNum===2){

                cConts[0].rotation.y = 0;
                cConts[1].rotation.y = ca(180);

                cConts[0].ball.position.z=bd;
                cConts[1].ball.position.z=bd;

                // gsap.to(cConts[0].ball.position, {z: bd, duration: tt, delay: ts, ease: "expo.out" })
                // gsap.to(cConts[1].ball.position, {z: bd, duration: tt, delay: ts, ease: "expo.out" })
                
                gsap.to(cConts[0].ball.scale, {x: 1, y: 1, z: 1, duration: tt, ease: "expo.out"  })
                gsap.to(cConts[1].ball.scale, {x: 1, y: 1, z: 1, duration: tt, ease: "expo.out"  })
                
                gsap.to(cConts[0].ring.scale, {x: rs, y: rs, z: rs, duration: rt, ease: "expo.out"  })
                gsap.to(cConts[1].ring.scale, {x: rs, y: rs, z: rs, duration: rt, ease: "expo.out"  })

                gsap.to(cConts[0].ring.material, {opacity: 0, duration: rt, ease: re  })
                gsap.to(cConts[1].ring.material, {opacity: 0, duration: rt, ease: re  })

            }else if(countNum===1){

                cConts[0].rotation.y = 0;

                cConts[0].ball.position.z = 0;

                gsap.to(cConts[0].ball.scale, {x: 1, y: 1, z: 1, duration: tt, ease: "expo.out"  })

                gsap.to(cConts[0].ring.scale, {x: rs, y: rs, z: rs, duration: rt, ease: "expo.out"  })

                gsap.to(cConts[0].ring.material, {opacity: 0, duration: rt, ease: re  })
                

            }

            gameAction="count down wait"

        }else if(gameAction==="count down wait"){

            countCont.rotation.y+=dt
            camContX.position.z-=dt*15
            countCont.position.z=camContX.position.z;

            count+=dt;

            if(count>1.5){

                count=0;
                gameAction="count out"
                // gameAction="count out2"

            }

        }else if(gameAction==="count out"){

            for(var i=0; i<cConts.length; i++){

                // gsap.to(cConts[i].ball.position, {z: 0, duration: .25, ease: "expo.out" })
                gsap.to(cConts[i].ball.scale, {x: 0, y: 0, z: 0, duration: .25, ease: "expo.out"  })

            }

            gameAction="count out wait"

        }else if(gameAction==="count out wait"){

            countCont.rotation.y+=dt
            camContX.position.z-=dt*15
            countCont.position.z=camContX.position.z;

            count+=dt;

            if(count>.25){

                count=0;

                countNum-=1;

                if(countNum<1){
                    gameAction="move to next"
                    snd("woosh")
                }else{
                    gameAction="count down start"
                }
                
            }

        }else if(gameAction==="move to next"){

            //move the camera

            var targ = questConts[qCue];
            gsap.to(camContX.position, {x: targ.position.x, z: targ.position.z, y: targ.position.y, duration: camMoveTime, ease: "expo.inOut"})
            gsap.to(camContX.rotation, {x: ca(-5), duration: camMoveTime/2, ease: "sine.out"})
            gsap.to(camContX.rotation, {x: ca(0), duration: camMoveTime/2, delay: camMoveTime/2, ease: "sine.out"})

            for(var i=0; i<questConts[qCue].innerArray.length; i++){

                var q = questConts[qCue].innerArray[i].poly;
                gsap.to(q.position, {z: ran(6)+2, duration: camMoveTime, delay: camMoveTime, ease: "expo.out"})

            }

            //animate the wireframe object

            var sc = 1.5
            var sc2 = 1.2
            
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

            //shrink timer ball if it has been used
      
            for(var i=0; i<questConts.length; i++){

                gsap.killTweensOf( questConts[i].timerBallCont.rotation );

                if(questConts[i].timerBallCont.rotation.z!==0){
                    gsap.to(questConts[i].timerBallCont2.scale, { x: 0, y: 0, z: 0, duration: .25,  ease: "expo.out"})
                }

            }

            //set vars
            
            gameAction="move";
            
        }else if(gameAction==="move"){

            //camera is moving into position

            //hide question and answers

            questOpacity-=dt*3
            questOpacity1-=dt*3
            questOpacity2-=dt*3
            questOpacity3-=dt*3

            question.style.opacity=questOpacity+"";
            ans1.style.opacity=questOpacity1+"";
            ans2.style.opacity=questOpacity2+"";
            ans3.style.opacity=questOpacity3+"";

            //whne moved into place

            count+=dt;
            if(count>camMoveTime){

                //light the timer ball light

                questConts[qCue].timerBallLight.intensity = 2;

                questOpacity=0;
                questOpacity1=0;
                questOpacity2=0;
                questOpacity3=0;

                questionTime=6;

                snd("glint2");

                count=0;
                gameAction="ball up";

            }

        }else if(gameAction==="ball up"){

            qLoop.volume(.5);

            //have a slight delay after move

            count+=dt;
            if(count>.75){

                //roman numeral

                if(qCue===1){
                    document.getElementById("questionNum").innerHTML = "I"
                }else if(qCue===2){
                    document.getElementById("questionNum").innerHTML = "II"
                }else if(qCue===3){
                    document.getElementById("questionNum").innerHTML = "III"
                }else if(qCue===4){
                    document.getElementById("questionNum").innerHTML = "IV"
                }else if(qCue===5){
                    document.getElementById("questionNum").innerHTML = "V"
                }else if(qCue===6){
                    document.getElementById("questionNum").innerHTML = "VI"
                }else if(qCue===7){
                    document.getElementById("questionNum").innerHTML = "VII"
                }else if(qCue===8){
                    document.getElementById("questionNum").innerHTML = "VIII"
                }else if(qCue===9){
                    document.getElementById("questionNum").innerHTML = "IX"
                }else if(qCue===10){
                    document.getElementById("questionNum").innerHTML = "X"
                }

                //populate words (temp)

                var sampleQuestions = [
                    "Which artist has sold the most albums?",
                    "Which artist is youngest?",
                    "Which artist does not have a number one single?",
                    "Which artist is signed to Capital Records?",
                    "Which artist grew up in New Jersey?",
                    "Which artist has sold the most albums?",
                    "Which artist is youngest?",
                    "Which artist does not have a number one single?",
                    "Which artist is signed to Capital Records?",
                    "Which artist grew up in New Jersey?"
                ];

                var sampleAnswers = [
                    new Array("Eminem", "Elvis", "Adele", 3),
                    new Array("The Weekend", "Katy Perry", "Taylor Swift", 3),
                    new Array("Missy Elliott", "Frank Sinatra", "Snoop Dog", 1),
                    new Array("Tina Turner", "Neil Diamond", "Bruce Springsteen", 2),
                    new Array("Cardi B", "Bon Jovi", "Biggie Smalls", 2),
                    new Array("Eminem", "Elvis", "Adele", 3),
                    new Array("The Weekend", "Katy Perry", "Taylor Swift", 3),
                    new Array("Missy Elliott", "Frank Sinatra", "Snoop Dog", 1),
                    new Array("Tina Turner", "Neil Diamond", "Bruce Springsteen", 2),
                    new Array("Cardi B", "Bon Jovi", "Biggie Smalls", 3)
                ]

                document.getElementById("question").innerHTML = sampleQuestions[qCue-1];

                document.getElementById("ans1").innerHTML = sampleAnswers[qCue-1][0];
                document.getElementById("ans2").innerHTML = sampleAnswers[qCue-1][1];
                document.getElementById("ans3").innerHTML = sampleAnswers[qCue-1][2];

                correctAnswer = sampleAnswers[qCue-1][3];

                //populate answers

                count=0;
                gameAction="asking";
    
            }

        }else if(gameAction==="asking"){

            //animate question and answers in

            var fadeInSpeed = 4;

            questOpacity+=dt*fadeInSpeed;
            questOpacity1+=dt*fadeInSpeed;
            questOpacity2+=dt*fadeInSpeed;
            questOpacity3+=dt*fadeInSpeed;

            question.style.opacity=questOpacity+"";
            ans1.style.opacity=questOpacity1+"";
            ans2.style.opacity=questOpacity2+"";
            ans3.style.opacity=questOpacity3+"";

            //move the timer ball into starting position

            gsap.to(questConts[qCue].timerBallCont2.position, { y: 1.4, duration: camMoveTime/4, ease: "expo.out"})

            //when fully visible, start timer

            if(questOpacity1>=1){
                gameAction="waiting for answer"
            }

            //reset vars

            questionWerp=4;
            
        }else if(gameAction==="waiting for answer"){

            //timer parts

            questConts[qCue].timerBallCont.rotation.z = ca(questionTime*60)
            makeMiniBalls(questConts[qCue].timerBall);

            tickCount+=dt;

            if(tickCount>2){

                tickCount=0;

                if(questionTime<2){

                    snd("werp");

                }else{

                    snd("tick");

                }

            }

            //out of time

            questionTime-=dt*.5;

            if(questionTime<=0){
                gameAction="answered wrong"
            }

        }else if(gameAction==="answered wrong"){

            qLoop.volume(0);

            snd("wrong");

            //change opacity of answers

            showAnswer();

            //flash

            flashOpacity=.3

            document.getElementById("flash").style.opacity = flashOpacity;
            document.getElementById("flash").style.backgroundColor = "#ff0000";

            gameAction="show answer wrong"

        }else if(gameAction==="show answer wrong"){

            //flash overlay

            if(flashOpacity>0){
                flashOpacity-=dt*.2;
            }
            document.getElementById("flash").style.opacity = flashOpacity;

            //short ref

            var q =  questConts[qCue]

            //animate parts out

            q.poly.material.visible=false;
            gsap.to(q.timerBallCont2.scale, {x: 0, y: 0, z: 0, duration: .5 })
            gsap.to(q.glowPlane.material, {opacity: 0, duration: .5 })

            for(var i=0; i< q.innerArray.length; i++){

                gsap.to(q.innerArray[i].scale, {x: 0, y: 0, z: 0, duration: .5 })

            }

            //move broken piences

            var breakSpeed=5;
            var breakGravity=-2;
            var breakRot=3;

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

            //count

            count+=dt;
            if(count>4){

                count=0;
                gameAction = "end animation"

            }

        }else if(gameAction==="answered right"){

            qLoop.volume(0);

            snd("right");

            //change opacity of answers

            showAnswer();

            //stop rotation of question cont

            questConts[qCue].rotateMe=false;

            //flash overlay

            flashOpacity=.2

            document.getElementById("flash").style.opacity = flashOpacity;
            document.getElementById("flash").style.backgroundColor = "#00ffff";

            //short ref

            var q =  questConts[qCue]

            //shrink orbital balls

            for(var i=0; i< q.innerArray2.length; i++){

                gsap.to(q.innerArray2[i].scale, {x: 0, y: 0, z: 0, duration: .5 })

            }

            //show score

            document.getElementById("addScore").style.opacity = 1;
            document.getElementById("addScore").innerHTML = ""+(Math.round(questionTime*1500))

            //add to total score

            totalScore+=Math.round(questionTime*1500);

            //animate ball leaving

            var dl = 1;
            var dl2 = 15;

            questConts[qCue].rotation.y=0;

            gsap.to(questConts[qCue].poly.position, {x: questConts[qCue].poly.position.x-dl, y: questConts[qCue].poly.position.y-dl, duration: .8, ease: "quart.out" })
            gsap.to(questConts[qCue].poly.position, {x: questConts[qCue].poly.position.x+dl2, duration: 1, delay: .8, ease: "quint.inOut" })
            gsap.to(questConts[qCue].poly.position, {y: questConts[qCue].poly.position.y+dl2, duration: 1, delay: .8, ease: "quart.inOut" })

            var ds = .5
            var ds2 = .1

            gsap.to(questConts[qCue].poly.scale, {x: ds, y: ds, z: ds, duration: 1, ease: "quart.out" })
            gsap.to(questConts[qCue].poly.scale, {x: ds2, y: ds2, z: ds2, duration: 1, ease: "quart.out" })

            var targetColor = new THREE.Color(0x14e0ff);
            gsap.to(questConts[qCue].poly.material.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 1, ease: "expo.out"})
            
            //hide glow

            gsap.to(q.glowPlane.material, {opacity: 0, duration: .5 })

            //animate score text

            t.addScoreDown=80;
            t.addScoreOpacity=0;

            addScoreDown = t.addScoreDown;
            addScoreOpacity = t.addScoreOpacity;
            document.getElementById("addScore").style.transform ="translate("+((window.innerWidth/2)-100)+"px, "+((window.innerHeight/2)-60-addScoreDown)+"px";
            document.getElementById("addScore").style.opacity = 0;

            gsap.to(t, {addScoreDown: 0, duration: .4, ease: "quart.out" })
            gsap.to(t, {addScoreOpacity: .8, duration: .4, ease: "linear" })

            //reset vars

            cometSound=false;
            scoreAni=false

            gameAction="show answer right"

        }else if(gameAction==="show answer right"){

            //apply flash animation

            if(flashOpacity>0){
                flashOpacity-=dt*.1;
            }
            document.getElementById("flash").style.opacity = flashOpacity;

            //make wire shell rotate

            questConts[qCue].poly2.rotation.y += dt*.3

            //hide score after some time

            addScoreDown = t.addScoreDown;
            addScoreOpacity = t.addScoreOpacity;

            if(count>3.0 && t.addScoreOpacity===.8){
                gsap.to(t, {addScoreOpacity: 0, duration: .5 })
            }

            document.getElementById("addScore").style.opacity=addScoreOpacity;

            document.getElementById("addScore").style.transform ="translate("+((window.innerWidth/2)-100)+"px, "+((window.innerHeight/2)-60-addScoreDown)+"px";

            //count

            count+=dt;

            if(count>.8 && cometSound===false){
                cometSound=true;
                snd("comet");
            }

            if(count>1.5 && scoreAni===false){
                scoreAni=true;
                showScore=totalScore;
                t.gs = 1;
                gsap.to(t, {gs: 0, duration: 2 })
                snd("sparkle")
            }

            if(count>3.5){

                count=0;
                gameAction = "end animation"

            }

        }else if(gameAction==="end animation"){

            snd("woosh")

            gameAction="move to next"
            
            qCue+=1;
            
            if(qCue>=10){
                gameAction="end"
            }

        }

        //---LOOP--------------------------------------------------------------------------------------

        renderer.render(scene, camera);

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

    requestAnimationFrame(update);
    
}

requestAnimationFrame(update);

//---MIXER (TEMP)----------------------------------------------------------------------------------------

var questionBallColor = new THREE.Color(0xb8009c);
var countMatColor = new THREE.Color(0xb8009c);
var questionBallWireColor = new THREE.Color(0xfa00ed);
var polyInnerColor = new THREE.Color(0x73008a);
var timerColor = new THREE.Color(0x1d93e2);

var dlColor = new THREE.Color(0xa7a7a9);
var dl2Color = new THREE.Color(0xff0000);
var ambColor = new THREE.Color(0xd4d3d4);

var fogColor = new THREE.Color(0x700099);
var bitColor = new THREE.Color(0xb8009c);

function mixer(){

    if(document.getElementById("mix").checked === true){

        //-------------------------------------

        var c1_H = document.getElementById("c1_H").value;
        var c1_S = document.getElementById("c1_S").value;
        var c1_L = document.getElementById("c1_L").value;

        document.getElementById("c1_Color").value = hslToHex(c1_H,c1_S,c1_L);

        // glowMat.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );
        
        // scene.fog.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );

        // for(var i=0; i<questConts.length; i++){
        //     questConts[i].poly.material.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );
        // }
        
        for(var i=0; i<cConts.length; i++){
            cConts[i].ball.material.color.setHex( "0x"+hslToHex(c1_H,c1_S,c1_L) );
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

//---LISTENERS----------------------------------------------------------------------------------------

window.addEventListener("resize", () => {

    resize3D();

})

document.addEventListener('click', e => {

    // moveToNext();

    if(gameAction==="wait for a click"){

        gameAction="start it";

    }

}, false)

document.addEventListener('tap', e => {

    // moveToNext();

}, false)

document.addEventListener("keydown", event => {

    if (event.key === " ") {

        

    }else if (event.key === "1") {

        

    }else if (event.key === "2") {

        document.getElementById("mixer").style.display = "none"

    }

});

//---LOAD RESOURCES----------------------------------------------------------------------------------------

var reflectionTexture

var breakObj = null;
var totalModels = 0;

function loadResources(){

    loaderArray.push("gradGlow"); gradGlow = new THREE.TextureLoader().load( './src/img/gradGlow.png', loadTexture(this));
    loaderArray.push("gradGlowWhite"); gradGlowWhite = new THREE.TextureLoader().load( './src/img/gradGlowWhite.png', loadTexture(this));
    loaderArray.push("gradGlowWhite2"); gradGlowWhite2 = new THREE.TextureLoader().load( './src/img/gradGlowWhite2.png', loadTexture(this));
    loaderArray.push("ring"); ring = new THREE.TextureLoader().load( './src/img/ring.png', loadTexture(this));

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

    console.log("MANAGER LOAD")

}

function loadModel(){
    
    objectsLoaded+=1;
    console.log("MODEL: "+objectsLoaded)
    
}

function loadTexture(loader){

    objectsLoaded+=1;
    console.log("TEXTURE: "+objectsLoaded)
    
}

//---RESIZE----------------------------------------------------------------------------------------

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

//---SOUND----------------------------------------------------------------------------------------

var soundArray = [
    "right", "wrong", "comet", "glint1", "glint2", "werp", "woosh", "tick", "sparkle"
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

var qLoop = new Howl({src: ['./src/sounds/ambient.mp3'], volume:0, loop:true});
qLoop.play();
qLoop.volume(0);

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


function arrayPick(ar){
  
    var r = this.ran(ar.length);
    return arrayPick[r];

  }

