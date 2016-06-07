/***********************************************************************************************/
// Jaguar - ENVIRONMENT MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// WEATHER EFFECTS - $Game.weatherEffects(JAG);
/***********************************************************************************************/
weatherEffects:function(JAG){
	var gD=JAG.DATA.gD,
		sD=JAG.DATA.sD;
	
	
	/////////////////////////////
	// ADD WEATHER EFFECTS CANVAS
	/////////////////////////////
	if(!$('#JAG_Weather').length){
		JAG.OBJ.$Game.prepend('<canvas id="JAG_Weather" width="'+gD.viewportW+'" height="'+gD.viewportH+'"></canvas>');	
		JAG.OBJ.$Weather=$('#JAG_Weather');
	};
	

	/////////////////////
	// PARTICLE VARIABLES
	/////////////////////
	var canvas=JAG.OBJ.$Weather[0],
		ctx=canvas.getContext('2d'),
		w=canvas.width, 
		h=canvas.height,
		effectType=sD.weather.clean(),
		particles,
		x=0, 
		y=0,
		noOfParticles=sD.weather_density.pF(),
		size=sD.weather_size.split(','),
		particleWidth=size[0].pF(),
		particleLength=size[1].pF(),
		particleSpeed=sD.weather_speed.pF(),
		particleColors=sD.weather_color,
		fallingParticles=[];
		
	JAG.OBJ.$Weather[0].style.visibility='visible';
	JAG.OBJ.$Weather[0].style.opacity=sD.weather_opacity;



	/////////////////
	// DRAW PARTICLES
	/////////////////
   	function drawParticles(){
		ctx.clearRect(0,0,w,h);
		
        for(var i=0; i<noOfParticles; i++){
			ctx.beginPath();
			
			switch(effectType){
				
				
				///////
				// RAIN
				///////
				case 'rain':
					// DRAW RAIN LINE
		 			ctx.moveTo(fallingParticles[i].x, fallingParticles[i].y);
			    	ctx.lineTo(fallingParticles[i].x, fallingParticles[i].y+(Math.random() * particleLength));
					ctx.lineWidth=Math.random() * particleWidth;				
				break;
				
							
				///////
				// SNOW
				///////
				case 'snow':
					// DRAW SNOW CIRCLE
			      	ctx.arc(fallingParticles[i].x, fallingParticles[i].y, Math.random() * particleWidth, 0, 2*Math.PI, false);
				break;
			};
			
			
			
			////////////////
			// SET THE COLOR				
			////////////////
			ctx.fillStyle=particleColors[Math.floor(Math.random()*particleColors.length)];
			ctx.strokeStyle=particleColors[Math.floor(Math.random()*particleColors.length)];
			ctx.stroke();				
			ctx.fill();
			


			////////////
			// SET SPEED
			////////////
		    fallingParticles[i].y+=3+Math.random() * particleSpeed; 



			////////////////////////////
			// REPEAT WHEN OUT OF BOUNDS
			////////////////////////////
			if(fallingParticles[i].y > h){
				// ACCOUNT FOR IMAGE SIZE
		        fallingParticles[i].y=-25 
				//APPEAR RANDOMLY ALONG WIDTH
	    	    fallingParticles[i].x=Math.random() * w;    
	        };
   	    };
    };



	//////////////////
	// SETUP PARTICLES
	//////////////////
    function ParticleSetup(){
	    JAG.Timers.WeatherTimer=setInterval(drawParticles, 36);
		for(var i=0; i<noOfParticles; i++){ 
           	var fallPart=new Object();
            fallPart.x=Math.random() * w;
		    fallPart.y=Math.random() * h;
    		fallingParticles.push(fallPart);
        };
   	};
	
	ParticleSetup();
},








/***********************************************************************************************/
// DAY/NIGHT CYCLING - $Scene.DayNightCycle(JAG);
/***********************************************************************************************/
DayNightCycle:function(JAG){
	var $Scene=$(this),
		startTime=false,
		animating=false,
		sD=JAG.DATA.sD,
		values=sD.day_night.split(','),
		dayLength=values[0].pF(),
		nightLength=values[1].pF(),
		transitionSpeed=values[2].pF();
		
		
		
	//////////////////////////////////////////////////
	// ADD DAY/NIGHT CYCLE LAYER [MUST BE EVERY SCENE]
	//////////////////////////////////////////////////
	if(!$Scene.find('div.JAG_DayNightCycle').length) $Scene.prepend('<div class="JAG_DayNightCycle"></div>');
	JAG.OBJ.$DayNight=$Scene.find('div.JAG_DayNightCycle');



	///////////////////////////////////
	// HIDE ANIMATION FOR INDOOR SCENES
	///////////////////////////////////
	if(sD.indoor){ JAG.OBJ.$DayNight[0].style.visibility='hidden'; return; };



	//////////////////////////////////////////
	// CUSTOMIZE DAY/NIGHT LAYER TO THIS SCENE
	//////////////////////////////////////////
	if(JAG.Load.DayNightOpacity){ var opacity=JAG.Load.DayNightOpacity.pF();
	}else{ var opacity=JAG.Story.Day ? sD.day_night_opacity.split(',')[0].pF() : sD.day_night_opacity.split(',')[1].pF(); };

	
	
	////////////////////////////////////////////////////
	// SET DAY/NIGHT TILE, COLOR, OPACITY AND VISIBILITY
	////////////////////////////////////////////////////
	JAG.OBJ.$DayNight.css({'background-color':sD.night_color, opacity:opacity, visibility:'visible',
		'background-image':sD.day_night_image ? ' url(Jaguar/tiles/bg_'+sD.day_night_image+'.png)' : 'none'});
		
		
		
	////////////////////////////
	// START DAY/NIGHT ANIMATION
	////////////////////////////
	JAG.Timers.DayNightTimer=setInterval(function(){
		// GET CURRENT TIME AND COMPARE TO START TIME
		var elapsed=startTime ? JAG.Timers.currentTime-startTime : JAG.Timers.currentTime;

		if(!animating && elapsed > (JAG.Story.Day ? dayLength : nightLength)){
			animating=true;
			var	opacity=JAG.Story.Day ? sD.day_night_opacity.split(',')[1].pF() : sD.day_night_opacity.split(',')[0].pF();
			
			
			//////////////////////////////////////////////////////////
			// DROP OPACITY OF FOG AND WEATHER LAYERS DURING NIGHTTIME
			//////////////////////////////////////////////////////////
			if(sD.weather) JAG.OBJ.$Weather.stop(true,false).animate({opacity : JAG.Story.Day ? sD.weather_opacity.pF() : 0.5},{queue:false});
			if(sD.fog) JAG.OBJ.$Fog.stop(true,false).animate({opacity : JAG.Story.Day ? sD.fog_opacity.pF() : 0.5},{queue:false});

			JAG.OBJ.$DayNight.stop(true,false).animate({opacity : opacity},{duration : transitionSpeed, queue:false,
				step:function(now){	JAG.Load.DayNightOpacity=now; },complete:function(){


					/////////////////////////////////////////
					// FLAG ANIMATION IS DONE AND RESET TIMER
					/////////////////////////////////////////
					animating=false;
					startTime=JAG.Timers.currentTime;
					JAG.Story.Day=JAG.Story.Day ? false : true; 
			}});
		};
	},150);
},







/***********************************************************************************************/
// FOG LAYER - JAG.OBJ.$currentScene.fogEffects(JAG);
/***********************************************************************************************/
fogEffects:function(JAG){
	var gD=JAG.DATA.gD,
		sD=JAG.DATA.sD;
	
	/////////////////////////
	// ADD FOG EFFECTS CANVAS
	/////////////////////////
	JAG.OBJ.$currentScene.prepend('<canvas id="JAG_Fog" width="'+gD.viewportW+'" height="'+sD.sceneH+'"></canvas>');	
	JAG.OBJ.$Fog=$('#JAG_Fog');
	
	
	
	/////////////////////
	// PARTICLE VARIABLES
	/////////////////////
	var particles=[],
		particleCount=sD.fog_density.pF(),
		maxVelocity=sD.fog_speed.pF(),
		targetFPS=33,
		canvas=JAG.OBJ.$Fog[0],
		ctx=canvas.getContext('2d'),
		w=canvas.width,
		h=canvas.height,
		img=new Image();



	//////////////////////////////
	// SET IMAGE FOR EACH PARTICLE
	//////////////////////////////
	img.onload=function(){
		sD.fogLoaded=true;
		particles.forEach(function(particle){ particle.setImage(img); });
	};
	img.src='Jaguar/tiles/bg_'+sD.fog_image+'.png';



	//////////////////
	// CREATE PARTICLE
	//////////////////
	function Particle(ctx){
		this.x=0; 
		this.y=0;
	    this.xVelocity=0; 
		this.yVelocity=0;
	    this.radius=60;
	    this.ctx=ctx;
	    this.draw=function(){
        	if(this.image){
            	this.ctx.drawImage(this.image, this.x-128, this.y-128);         
	            return;
    	    };
	    };



		//////////////////
	    // UPDATE PARTICLE
		//////////////////
    	this.update=function(){
        	// UPDATE POSITION BASED ON VELOCITY
	        this.x+=this.xVelocity; 
			this.y+=this.yVelocity;

			// BOUNDARIES
	        if(this.x >= w){ this.xVelocity=-this.xVelocity; this.x=w; 
			}else if(this.x <= 0){ this.xVelocity=-this.xVelocity; this.x=0; };
    	    if(this.y >= h){ this.yVelocity=-this.yVelocity; this.y=h;
	        }else if(this.y <= 0){ this.yVelocity=-this.yVelocity; this.y=0; };
    	};



		/////////////////////////////////////
	    // SET PARTICLE POSITION AND VELOCITY
		/////////////////////////////////////
	    this.setPosition=function(x, y){ this.x=x; this.y=y; };
	    this.setVelocity=function(x, y){ this.xVelocity=x; this.yVelocity=y; };
    	this.setImage=function(image){ this.image=image; };
	};



	/////////////////
	// INITIALIZE FOG
	/////////////////
	function init(){
	    var canvas=JAG.OBJ.$Fog[0],
	       	ctx=canvas.getContext('2d');



		///////////////////
        // CREATE PARTICLES
		///////////////////
 	    for(var i=0; i<particleCount; ++i){
            var particle=new Particle(ctx);
            particle.setPosition(JAG.FUNC.getRandomNumber(0,w), JAG.FUNC.getRandomNumber(0,h));
            particle.setVelocity(JAG.FUNC.getRandomNumber(-maxVelocity,maxVelocity), JAG.FUNC.getRandomNumber(-maxVelocity,maxVelocity));
   	        particles.push(particle);            
       	};
	};



	///////////
	// DRAW FOG
	///////////
	function draw(){
    	ctx.fillStyle='rgba(0,0,0,0)';
	    ctx.clearRect(0,0,w,h);		
    	particles.forEach(function(particle){ particle.draw(); });
	};



	/////////////
	// UPDATE FOG
	/////////////
	function update(){ particles.forEach(function(particle){ particle.update(); })};
	init();

    JAG.Timers.FogTimer=setInterval(function(){ update(); draw(); },1000/targetFPS);
},









/***********************************************************************************************/
// RUMBLE SPECIFIC ELEMENT - $Item.rumbleElement(JAG, value);
/***********************************************************************************************/
rumbleElement:function(JAG, value){
	var values=value.split(','),
		el=values[0].removeWS().toLowerCase(),
		x=values[1].pF(),
		y=values[2].pF(),
		rotation=values[3].pF(),
		speed=values[4].pF(),
		delay=values[5].pF(),
		duration=values[6].pF();



	/////////////////
	// SELECT ELEMENT
	/////////////////
	if(el==='scene'){ var $el=JAG.OBJ.$currentChapter;		
	}else if(el==='char'){ var $el=JAG.OBJ.$selectedChar.find('img');	
	}else if(el==='game'){ var $el=JAG.OBJ.$Game;		
	}else{ var $el=$('#JAG_ID_'+el).find('img'); };



	//////////////////////////////////////////////
	// OPTIONALLY STOP RUMBLE WHEN CHANGING SCENES
	//////////////////////////////////////////////
	JAG.Story.stopRumble=values[7].removeWS().toLowerCase()==='true' ? $el : false;




	//////////////////
	// INITIATE RUMBLE
	//////////////////
	JAG.Timers.rumbleTimer=setTimeout(function(){
		JAG.FUNC.clrTimeout('rumbleTimer');
		$el.rumble(x, y, rotation, speed, false, 0).trigger('startRumble');
	},delay);
	
	
	
	///////////////
	// PLAN TO STOP
	/////////////// 
	if(duration>0) stopRumble=setTimeout(function(){ $el.stopRumble(JAG, el); }, duration);
},








/***********************************************************************************************/
// STOP RUMBLE EFFECT - $Item.stopRumble(JAG, el);
/***********************************************************************************************/
stopRumble:function(JAG, el){
	/////////////////
	// SELECT ELEMENT
	/////////////////
	if(el==='scene'){ var $el=JAG.OBJ.$currentChapter;		
	}else if(el==='char'){ var $el=JAG.OBJ.$selectedChar;	
	}else if(el==='game'){ var $el=JAG.OBJ.$Game;		
	}else{ var $el=$('#'+el); };
	
	
	
	//////////////
	// STOP RUMBLE
	//////////////
	JAG.FUNC.clrTimeout('rumbleTimer');
	$el.trigger('stopRumble');
}});



$.fn.rumble=function(options){
	var defaults={
		x:2,
		y:2,
		rotation:1,
		speed:15,
		opacity:false,
		opacityMin:0.5
	},opt=$.extend(defaults,options);	
				
	return this.each(function(){
		var $this=$(this),				
			x=opt.x*2, y=opt.y*2,
			rot=opt.rotation*2,
			speed=opt.speed===0?1:opt.speed,			
			opac=opt.opacity,
			opacm=opt.opacityMin,
			inline, interval;
			
			
		//////////////////
		// RUMBLE FUNCTION
		//////////////////
		var rumbler=function(){				
			var rx=Math.floor(Math.random()*(x+1))-x/2,
				ry=Math.floor(Math.random()*(y+1))-y/2,
				rrot=Math.floor(Math.random()*(rot+1))-rot/2,
				ropac=opac ? Math.random()+opacm:1;
				
			// MAKE SURE NEW POSITION IS DIFFERENT
			rx=(rx===0 && x!==0) ? ((Math.random()<0.5) ? 1:-1):rx;
			ry=(ry===0 && y!==0) ? ((Math.random()<0.5) ? 1:-1):ry;	
			if($this.css('display')==='inline'){ inline=true; $this[0].style.display='inline-block'; };
				
			// RUMBLE ELEMENT
			$this.css({position:'relative', left:rx+'px', top:ry+'px', opacity:ropac, transform:'rotate('+rrot+'deg)'});
		};
			
			
		////////////
		// CSS RESET
		////////////
		var reset={ left:0, top:0, opacity:1, transform:'rotate(0deg)' };


		/////////////////
		// TRIGGER RUMBLE
		/////////////////
		$this.on({
			startRumble: function(e){
				e.stopPropagation();
				clearInterval(interval);
				interval=setInterval(rumbler, speed)
			},
			stopRumble: function(e){
				e.stopPropagation();
				clearInterval(interval);
				if(inline) $this[0].style.display='inline';
				$this.css(reset);
			}
		});		
	});
};