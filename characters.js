/***********************************************************************************************/
// Jaguar - CHARACTERS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// CHARACTER LOADING FUNCTION - $scene.loadChar(JAG); [ HANDLES BOTH MAIN AND AUX CHARACTERS ]
/***********************************************************************************************/
loadChar:function(JAG){
	var $Char=$(this),
		$Scene=JAG.OBJ.$currentScene,
		charName=JAG.FUNC.getName($Char),
		cD=JAG.DATA.Chars[charName],
		sD=JAG.DATA.sD,
		CharImg=new Image();


	///////////////////////////////////////////////////////////
	// LOAD CHARACTER'S NEXT_DIR AND SRC [ SELECTED CHARACTER ]
	///////////////////////////////////////////////////////////
	if(JAG.NEXT.direction) JAG.DATA.Chars[charName].direction=JAG.NEXT.direction;
	if(!JAG.NEXT.image || JAG.Load.loading || $Char[0]!==JAG.OBJ.$selectedChar[0]){
		var src=$(CharImg).loadSprite(JAG, cD, 'stopping');
	}else{
		var src='Jaguar/chars/'+JAG.NEXT.image.removeWS()+'.gif';
	};
	


	//////////////
	// LOAD SPRITE
	//////////////
	$(CharImg).one('load',function(){


		////////////////
		// CHAR POSITION
		////////////////	
		// POSITION EXIT ITEMS USING NEXT_POS - ACCOUNT FOR REPEAT WALK_INS
		var ENT=JAG.NEXT.pos ? JAG.NEXT.pos.split(',') : cD.pos.split(','),
			X=ENT[0].pF()+'%', 
			Y=ENT[1].pF()+'%';
		
		
		
		///////////////////////////
		// LOAD SAVED GAME POSITION		
		///////////////////////////
		if(JAG.Load.CharX){
			var X=JAG.Load.CharX+'%', 
				Y=JAG.Load.CharY+'%'; 
			JAG.Load.CharX=false;
			JAG.Load.CharY=false;
		};


		
		///////////////////////////////////////////////////
		// SAVE DIMENSIONS FOR SCALING AND INSERT CHARACTER
		///////////////////////////////////////////////////
		JAG.DATA.Chars[charName].orgCharW=this.width;
		JAG.DATA.Chars[charName].orgCharH=this.height;
		$Char[0].style.left=X;
		$Char[0].style.top=Y;
		$Char[0].innerHTML='<img src='+src+' class="JAG_Char_El_Img">';
		


		////////////////////////////////////////////////////////
		// SCALE ALL CHARACTERS [ Y IS PASSED IN FOR INITIAL TOP 
		// POSITION SINCE ONLOAD CHARACTERS DO NOT HAVE LAYOUT
		////////////////////////////////////////////////////////
		$Char.scale(JAG, cD, Y);

	
		//////////////////////////
		// SAVE CHARACTER POSITION
		//////////////////////////
		JAG.DATA.Chars[charName].lastValidX=X.pF()/100*JAG.DATA.sD.sceneW;
		JAG.DATA.Chars[charName].lastValidY=Y.pF()/100*JAG.DATA.sD.sceneH;



		//////////////////////////////////////////////////////////
		// AVOID HASLAYOUT RACE CONDITIONS WITH LAYERITEM FUNCTION
		// BY STORING THE INITIAL TOP VALUE OF CHARACTER FOR REF
		//////////////////////////////////////////////////////////
		JAG.DATA.Chars[charName].initY=Y;
		JAG.DATA.Chars[charName].initX=X;



		///////////////////////////////////////////////////
		// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
		///////////////////////////////////////////////////
		if(!$Char.next('p').length) $('<p class="JAG_Char_Dialogue"></p>').insertAfter($Char);



		///////////////
		// DONE LOADING
		///////////////
		JAG.Load.loading=false;
		JAG.NEXT.pos=false;
		JAG.NEXT.image=false;
		JAG.NEXT.direction=false;
		JAG.DATA.Chars[charName].loaded=true;
	})[0].src=src;

	
	return $(this);
},






/***********************************************************************************************/
// CHARACTER WALKING - $Char.walk(JAG, toX, toY);
/***********************************************************************************************/
walk:function(JAG, toX, toY){
	var $Char=$(this),
		charName=JAG.FUNC.getName($Char),
		cD=JAG.DATA.Chars[charName],
		sD=JAG.DATA.sD,		
		$Scene=JAG.OBJ.$currentScene,


		/////////////////////////////////////
		// CALCULATING NEW CHARACTER POSITION 
		/////////////////////////////////////
		X=toX + (JAG.DATA.sD.pan ? Math.abs(JAG.DATA.sD.panPos.pF()) : 0), 
		gotoX=(X/JAG.DATA.sD.sceneW) * 100+'%',
		gotoY=(toY/JAG.DATA.sD.sceneH) * 100+'%',


		/////////////////////////////////////
		// CALCULATE CONSISTENT WALKING SPEED
		/////////////////////////////////////
		charInfo=$Char[0].getBoundingClientRect(),
		oldX=$Char.css('left').pF(), 
		oldY=charInfo.bottom,
		distance=Math.sqrt(((X-oldX)*(X-oldX)) + ((toY-oldY)*(toY-oldY))),		
		// MAINTAIN SAME WALKING SPEED NO MATTER DISTANCE 
		avgSpeed=Math.round((distance / (1000/(cD.speed.pF()/1000))) * 1000),
		// MOVING OTHER CHARACTER
		isAux=charName!==JAG.FUNC.getName(JAG.OBJ.$selectedChar),
		sceneItems=$($Scene.find('div.JAG_Item')).add($Scene.find('div.JAG_Char_El').not($Char)),
		numItems=sceneItems.length;
		
		

	/////////////////////////////////////
	// [ ADDON ] FIRST PERSON PERSPECTIVE
	/////////////////////////////////////
	if(sD.first_person && !isAux){
		// STOP WALKING TO FIRE ALL CALLBACKS
		JAG.Story.walking=false;
		$Char.stop(true,false).stopWalking(JAG, false);
		return $(this);
	};
	
	

	///////////////////////////////
	// ACCOUNT FOR SLOWER Y WALKING
	///////////////////////////////
	var	distX=Math.floor(Math.max(X,oldX) - Math.min(X,oldX)), 
		distY=Math.floor(Math.max(toY,oldY) - Math.min(toY,oldY));	
	if(Math.max(distX,distY)===distY){ 
		var factorY=distY/JAG.DATA.sD.sceneH; 
		avgSpeed*=cD.y_speed+factorY; 
	};
	
	
	
	////////////////////////////
	// ACCOUNT FOR SPEED SCALING
	////////////////////////////
	avgSpeed/=JAG.Scaling.gameScaled;
	
	

	////////////////////////////////////////////////////////////
	// SET DIRECTION OF MOVEMENT AND RETRIEVE DIRECTIONAL SPRITE
	////////////////////////////////////////////////////////////
	if(distY > distX){ 
		JAG.DATA.Chars[charName].direction=toY > oldY ? 'down' : 'up';
	}else if(distY < distX){ 
		JAG.DATA.Chars[charName].direction=X > oldX ? 'right' : 'left'; 
	};


	////////////////////////////////////////////////////////
	// SET SPRITE [IF DIFFERENT] AND BEGIN WALKING ANIMATION
	////////////////////////////////////////////////////////
	$Char.switchSprite(JAG, cD, 'walk_to').stop(true,false).animate({left:gotoX, top:gotoY},{duration:avgSpeed, queue:false, easing:'linear',

		///////////////////////////
		// CHARACTER WALKING EVENTS
		///////////////////////////
		progress:function(){


			
			//////////////
			// NOW WALKING
			//////////////
			JAG.Story.walking=true;
			

			/////////////////////////////////////////////
			// SCALE, KEEP CHARACTER LAYERED AND INBOUNDS
			/////////////////////////////////////////////
			$Char.scale(JAG, cD, false).layerItem(JAG, sceneItems, numItems, false);
			
			
			///////////////////////////////////////////////////////
			// AUX CHARACTERS CAN MOVE OUT OF BOUNDS [ OFF-SCREEN ] 
			///////////////////////////////////////////////////////
			if(!isAux) $Char.inBounds(JAG, $Char.position());
			

			//////////////////
			// DIALOGUE FOLLOW
			//////////////////
			if(cD.text_follow && $Char.next('p.JAG_Char_Dialogue').is(':visible')) $Char.next('p.JAG_Char_Dialogue').textDims(JAG, $Char);


			//////////////////////
			// EXIT ITEM COLLISION
			//////////////////////
			$(JAG.OBJ.exitItems).each(function(i){ $(JAG.OBJ.exitItems[i]).collision(JAG); });

				
				
			//////////
			// PANNING 
			//////////
			if(sD.pan){
				// CHARACTER POSITION [ PERCENTAGE OF VIEWPORT ]
				var CharLeft=$Char.css('left').pF(),
					MidLine=JAG.DATA.gD.viewportW/2,
					CrossedMidLine=(CharLeft+sD.panPos) >= MidLine;
						
				// PAN LEFT OR RIGHT
				if(!CrossedMidLine && cD.direction==='left' || CrossedMidLine && cD.direction==='right') sD.panPos=-(CharLeft-MidLine); 

				// CHECK FULL LEFT PAN (0) AND FULL RIGHT PAN (TOTALPAN)
				if(sD.panPos > 0) sD.panPos=0;
				if(Math.abs(sD.panPos) > (sD.sceneW-JAG.DATA.gD.viewportW)) sD.panPos=-(sD.sceneW-JAG.DATA.gD.viewportW);

				/////////////////////////
				// APPLY NEW PAN POSITION
				/////////////////////////
				JAG.DATA.sD.panPos=sD.panPos; 
				JAG.OBJ.$currentScene[0].style.marginLeft=sD.panPos+'px';
			};



		///////////////
		// STOP WALKING
		///////////////
		},complete:function(){
			JAG.Story.walking=false;
			$Char.stopWalking(JAG, false);
	}});
	
	return $(this);	
},







/***********************************************************************************************/
// CHARACTER STOPPING - $Char.stopWalking(JAG, scaling);
/***********************************************************************************************/
stopWalking:function(JAG, scaling){
	var	$Char=$(this),
		charName=JAG.FUNC.getName($Char),
		$Item=JAG.OBJ.$currentItem,
		sD=JAG.DATA.sD,
		cD=JAG.DATA.Chars[charName],
		left=($Char.css('left').pF()/sD.sceneW)*100,
		top=($Char.css('top').pF()/sD.sceneH)*100;


	///////////////////////////////	
	// LOAD STOPPED MOVEMENT SPRITE
	///////////////////////////////
	$Char.switchSprite(JAG, cD, 'stopping');


	if(!JAG.Story.walking && !$Char.is(':animated')){


		///////////////////////////////////
		// ACTION CALLBACK, RESET WHEN DONE
		///////////////////////////////////
		if(!scaling && (cD.action && typeof cD.callback==='function')){


			/////////////////////////////////////////////////////////
			// MOVE AUX CHARACTER FROM SECONDARY ACTION [ MOVE_CHAR ]
			/////////////////////////////////////////////////////////			
			if($Char[0]!==JAG.OBJ.$selectedChar[0]){ 
				cD.callback.apply(); 
				// SET STOPPING FLAGS
				JAG.DATA.Chars[charName].callback=false;	
				JAG.DATA.Chars[charName].action=false;
				JAG.Story.walking=false;
				return $Char;
			};
			
			

			/////////////////////////////
			// MAIN CHARACTER IS STOPPING
			/////////////////////////////
			if($Item){
		
		
				//////////////////////////////////////////////////////
				// PREVENT FIRING CALLBACK WHEN WALKING AWAY FROM ITEM
				//////////////////////////////////////////////////////
				if($Item.hasClass('JAG_Item') || $Item.hasClass('JAG_Char_El')){


					/////////////////
					// FIND PROXIMITY
					/////////////////
					var	eD=JAG.FUNC.elType($Item),
						proximity=eD.proximity.pF() * JAG.Scaling.gameScaled;


					///////////////////////
					// GET CURRENT DISTANCE
					///////////////////////
					$Char.returnDist($Item);
			
			
					////////////
					// FACE ITEM
					////////////
					JAG.DATA.Chars[charName].direction=Diff.Left ? 'right' : 'left';
	
	
					//////////////////////////
					// LOAD DIRECTIONAL SPRITE
					//////////////////////////
					$Char.switchSprite(JAG, cD, 'stopping');
					
					
					////////////////////////////////////////////////////////
					// PERFORM ACTION IF CLOSE ENOUGH [ OR IN FIRST PERSON ]
					////////////////////////////////////////////////////////
					if((proximity > Diff.distance) || sD.first_person){
						cD.callback.apply();
					}else{
						// NOT CLOSE ENOUGH
						$Char.saySomething(JAG, $Char, eD.too_far, eD.too_far_voice, JAG.OBJ.$currentScene, false);
					};
				};
				


			////////////////////////////
			// ENTRANCES DON'T USE ITEMS
			////////////////////////////	
			}else{
				// STOP WALK_TO ENTRANCES
				$Char.switchSprite(JAG, cD, 'stopping');
				cD.callback.apply();
			};
		};
		
		
		
		/////////////////////////////////////////////////		
		// [ ADDON ] TURN-BASED COMBAT - ATTACK CHARACTER
		/////////////////////////////////////////////////
		if($.isFunction($.fn.combat) && JAG.Story.inBattle && !scaling){
			// HERO IS ATTACKING
			if(JAG.Story.attack){
				$Char.attack(JAG, cD, charName);
			// HERO IS NOT ATTACKING
			}else{
				$Char.switchPlayer(JAG);
			};
		};
		
		
		/////////////////////
		// SET STOPPING FLAGS
		/////////////////////
		JAG.DATA.Chars[charName].callback=false;	
		JAG.DATA.Chars[charName].action=false;
	};
	


	//////////////
	// NOT WALKING
	//////////////
	JAG.Story.walking=false;

	return $Char;
},






/***********************************************************************************************/
// SPRITE SWAPPING - $Char.loadSprite(JAG, cD, type);
/***********************************************************************************************/
loadSprite:function(JAG, cD, type){

	////////////////
	// SPRITE ACTION
	////////////////
	if(type==='walk_to'){
		var initSprite=cD.image, 
			right=cD.right ? cD.right.split(',')[0] : false, 
			left=cD.left ? cD.left.split(',')[0] : false, 
			up=cD.up ? cD.up.split(',')[0] : false, 
			down=cD.down ? cD.down.split(',')[0] : false;

	}else if(type==='stopping'){
		var initSprite=cD.image,
			right=cD.right ? cD.right.split(',')[1] : false, 
			left=cD.left ? cD.left.split(',')[1] : false,
			up=cD.up ? cD.up.split(',')[1] : false, 
			down=cD.down ? cD.down.split(',')[1] : false;

	}else{
		var initSprite=cD[type+'_image'], 
			right=cD[type+'_right'],
			left=cD[type+'_left'], 
			up=cD[type+'_up'], 
			down=cD[type+'_down'];
	};



	///////////////////////////////////////
	// DIRECTIONAL SPRITE [ USE FALLBACKS ]
	///////////////////////////////////////
	if(JAG.Load.CharDirection){ 
		cD.direction=JAG.Load.CharDirection; 
		JAG.Load.CharDirection=false; 
	};
	
	switch(cD.direction){
		case 'right': var newSprite=right ? right : initSprite;  break;
		case 'left' : var newSprite=left  ? left  : initSprite;  break;
		case 'up'   : var newSprite=up    ? up    : initSprite;  break;
		case 'down' : var newSprite=down  ? down  : initSprite;  break; 
	};


	
	///////////////////////////////////////////////////
	// SOME [ DEFAULT ] SETTINGS MAY NOT BE SET BY USER
	///////////////////////////////////////////////////
	return !newSprite ? false : 'Jaguar/chars/'+newSprite.removeWS()+'.gif';
},








/***********************************************************************************************/
// HELPER FUNCTION TO CHECK IF SPRITE SHOULD CHANGE - $Char.switchSprite(JAG, data, sprite);
/***********************************************************************************************/
switchSprite:function(JAG, data, sprite){
	var $Char=$(this),
		$CharImg=$Char.find('img'),
		src=$Char.loadSprite(JAG, data, sprite),
		current=$CharImg[0].src,
		current_src=current.substring(current.lastIndexOf('/')+1);


	/////////////////////////////////////////////
	// DON'T CHANGE THE SPRITE IF IT IS THE SAME!
	/////////////////////////////////////////////
	if(src && src.substring(src.lastIndexOf('/')+1)!==current_src) $CharImg[0].src=src;

	return $Char;
},








/***********************************************************************************************/
// SETUP STATS FOR USE IN ENGINE
/***********************************************************************************************/
setupStatPoints:function(JAG, charName){
	if(JAG.DATA.Chars[charName].stats[0]==undefined) return
	
	var charStats=JAG.DATA.Chars[charName].stats[0].split(','),
		numStats=charStats.length,
		playerStats={};
	
	for(var i=0; i<numStats; i++){
		var stat=charStats[i].trim().split('='),
			points=stat[1].split('/');
		playerStats[stat[0]+'_max']=points[1].pF();
		playerStats[stat[0]]=points[0].pF();
	};

	// AVOID DATA MERGING ISSUES
	$('#JAG_ID_Char_'+charName).data('stats', playerStats);
},








/***********************************************************************************************/
// OPENS STAT WINDOW [ TAB ]
/***********************************************************************************************/
openStats:function(JAG){
	
	// INDICATE STATS STATUS
	JAG.Story.showingStats=true;

	var $GAME=$(this),
		$Overlay=$('#JAG_Stats_Overlay'),
		$Stats=JAG.OBJ.$Stats,
		charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar),
		$Statlines=$Stats.find('div.JAG_Player_Points').find('div.JAG_Stat_Line'),
		charStats=$('#JAG_ID_Char_'+charName).data('stats'),
		insertLeft='', 
		insertRight='',
		statName=[], 
		currentValue=[], 
		maxValue=[];
		
		
	///////////////////////////////////////////////
	// USER DIDN'T PROVIDE STATS FOR THIS CHARACTER
	///////////////////////////////////////////////
	if(charStats==undefined || charStats.length < 1) return;		



	///////////////
	// SETUP ARRAYS
	///////////////
	for(var stat in charStats){
		if(charStats.hasOwnProperty(stat)){
			// STORE STAT INDEX
			var i=Object.keys(charStats).indexOf(stat);
			if(i%2){ statName.push(stat); currentValue.push(charStats[stat]); 
			}else{ maxValue.push(charStats[stat]); };
		};
	};
	


	////////////////////////////////////
	// LOOP STAT ARRAYS TO BUILD COLUMNS
	////////////////////////////////////
	var numStats=statName.length;
	for(var i=0; i<numStats; i++){
		var insert='<div class="JAG_Stat_Line" id="JAG_Stat_'+statName[i].clean()+'"><p class="JAG_Stat">'+statName[i]+':</p>\
			<span class="JAG_Score">'+currentValue[i]+'/'+maxValue[i]+'</span><p class="JAG_Progress"><span></span></p></div>';

		// EVEN NUMBER GOES ON LEFT SIDE OF WINDOW / ODD ON RIGHT
		if(i%2===0){ 
			insertLeft+=insert; 
		}else{ 
			insertRight+=insert; 
		};			
	};



	///////////////////////////////////
	// BUILD THE CHARACTER STATS WINDOW
	///////////////////////////////////
	$('#JAG_ID_Stats')[0].innerHTML='<p class="game_title">'+JAG.DATA.gD.title+'</p><h2>'+JAG.OBJ.$selectedChar.data('name')+'</h2>\
		<div class="JAG_Player_Points"><div class="JAG_Stats_Left">'+insertLeft+'</div>\
		<div class="JAG_Stats_Right">'+insertRight+'</div>\
   	    <div class="JAG_clear"></div></div></div>';



	/////////////////////
	// ANIMATE OVERLAY IN
	/////////////////////
	$Overlay[0].style.display='block';
	$Overlay.stop(true,false).animate({opacity:1},{duration:200,queue:false,complete:function(){


		//////////////////////////
		// ANIMATE STATS WINDOW IN
		//////////////////////////
		$Stats[0].style.display='block';
		$Stats.stop(true,false).animate({opacity:1},{duration:200,queue:false,complete:function(){
				
				//////////////////////////////////////////////////
				// LOOP THROUGH STATS AND SET THEIR CURRENT VALUES
				//////////////////////////////////////////////////
				var numStats=statName.length;
				for(var i=0; i<numStats; i++){
					var $thisStat=$('#JAG_Stat_'+statName[i].clean());
					$thisStat.find('span.JAG_Score')[0].innerHTML=currentValue[i]+'/'+maxValue[i];
					$thisStat.find('p.JAG_Progress').find('span')[0].style.width=(currentValue[i]/maxValue[i])*100+'%';
				};
				
				// ALLOW CLICKING THE OVERLAY TO CLOSE STATS WINDOW
				$Overlay.on('click',function(){ $GAME.closeStats(JAG); });
		}});		
	}});
	
},









/***********************************************************************************************/
// CLOSES STAT WINDOW - JAG.OBJ.$Game.closeStats(JAG);
/***********************************************************************************************/
closeStats:function(JAG){
	var $Overlay=$('#JAG_Stats_Overlay'),
		$Stats=$('#JAG_ID_Stats');

	/////////////////////////		
	// UNBIND THE CLICK EVENT
	/////////////////////////
	$Overlay.off('click');
	

	/////////////////////////
	// CLOSE THE STATS WINDOW
	/////////////////////////
	$Stats.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
		
		//////////////////////////
		// ANIMATE THE OVERLAY OUT
		//////////////////////////
		$Overlay.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
			$Stats[0].style.display='none';
			$Overlay[0].style.display='none';
			$Stats.find('div.JAG_Player_Points').find('p.JAG_Progress').find('span').css('width','0%');			
		
			// INDICATE THE STATS STATUS
			JAG.Story.showingStats=false;
		}});
	}});		
}});