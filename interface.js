/***********************************************************************************************/
// Jaguar - INTERFACE MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// MAP GAME KEYS - JAG.OBJ.$Game.mapKeys(JAG);
/***********************************************************************************************/
mapKeys:function(JAG){
	$(document).on('keyup.Jaguar', function(e){
 		var code=e.keyCode||e.which,
			$Game=JAG.OBJ.$Game,
			gD=JAG.DATA.gD,
			sD=JAG.DATA.sD;
		


		///////////////////////////////////
		// SWITCH CHARACTER [ DEFAULT = + ]
		///////////////////////////////////
		if($.isFunction($.fn.selectChar) && code===gD.swapCharKey){

			/////////////////////
			// CAN SWAP CHARACTER
			/////////////////////
			if(!JAG.Story.swappingChar && JAG.FUNC.noSpecialScene() && !JAG.Story.switchingScenes && window==window.top && 
			   !JAG.Story.isPaused && !JAG.Story.showingSaveMenu && !JAG.Story.walking && !JAG.Story.talking &&
			   !JAG.Story.inBattle){ 


			   ////////////////////////////////////////
			   // OPEN/CLOSE CHARACTER SELECTION SCREEN
			   ////////////////////////////////////////
			   if(!JAG.Story.showingCharSelect){ 
			   		JAG.OBJ.$selectedChar.openCharSelect(JAG);			   
			   }else{
				   JAG.OBJ.$selectedChar.closeCharSelect(JAG);				   
			   };
			   				   
			
			///////////////////////	
			// CAN'T SWAP CHARACTER
			///////////////////////
			}else{
				$Game.swapCursor(JAG, 300);
			};
		};
		
		



		////////////////////////////////
		// CHARACTER DIRECTIONAL CONTROL
		////////////////////////////////
		if(gD.keyboardNav && (code===37 || code===38 || code===39 || code===40) && JAG.FUNC.noSpecialScene() && !JAG.Story.showingSaveMenu &&
			!JAG.Story.switchingScenes && !JAG.Story.isPaused && !JAG.Story.talking &&  !JAG.Story.showingDebug && !JAG.Story.showingStats && 
			JAG.OBJ.$selectedChar && !JAG.Story.inBattle){
			var $Char=JAG.OBJ.$selectedChar,
				charName=JAG.FUNC.getName($Char);
				
			
			///////////////////////////////////////////
			// [ ADDON ] FIRST PERSON MOVEMENT CONTROLS
			///////////////////////////////////////////
			if($.isFunction($.fn.firstPerson) && JAG.DATA.sD.first_person){ $Char.firstPerson(JAG, code); return; };
			
				
			////////////////////////////////////
			// LEFT:37, UP:38, RIGHT:39, DOWN:40
			////////////////////////////////////			
			switch(code){
				case 37: var toX=0, toY=JAG.DATA.Chars[charName].lastValidY;  break;
				case 38: var toX=JAG.DATA.Chars[charName].lastValidX, toY=0; break;
				case 39: var toX=sD.sceneW, toY=JAG.DATA.Chars[charName].lastValidY; break;
				case 40: var toX=JAG.DATA.Chars[charName].lastValidX, toY=sD.sceneH; break;
			};
			

			/////////////////////////////////////////
			// MAKE CHARACTER WALK TO NEW DESTINATION
			/////////////////////////////////////////
			if(JAG.Story.walking){ 
				$Char.stop(true,false).stopWalking(JAG, true);
				
				////////////////////////////////////////////
				// IF CHANGING DIRECTIONS - CONTINUE WALKING
				////////////////////////////////////////////
				var curDr=JAG.DATA.Chars[charName].direction;
				if(curDr==='left' && code!==37 || curDr==='right' && code!==39 || curDr==='up' && code!==38 || curDr==='down' && code!==40){
					$Char.walk(JAG, toX, toY);					
				};
			}else{
				$Char.walk(JAG, toX, toY);
			};
		};




		////////////////////////////////
		// DEBUG WINDOW [ DEFAULT = F2 ]
		////////////////////////////////
		if(code===gD.debugKey){
			if(!JAG.Story.showingDebug && !JAG.Story.swappingChar){
				JAG.OBJ.$Debug.openDebug(JAG);
			}else{ 
				JAG.OBJ.$Debug.closeDebug(JAG); 
			};
		};




		////////////////////////////////////
		// SAVE/LOAD WINDOW [ DEFAULT = F8 ]
		////////////////////////////////////
		if(code===gD.menuKey){
			
			
			////////////////////////
			// OPEN SAVE/LOAD WINDOW
			////////////////////////
			if(!JAG.Story.showingSaveMenu){
				
				/////////////////////////////////////////////////////////////
				// DON'T ALLOW ON CUTSCENES, WHEN SWITCHING SCENES OR IFRAMES
				/////////////////////////////////////////////////////////////
				if(JAG.FUNC.noSpecialScene() && !JAG.Story.switchingScenes && !JAG.Story.inBattle &&
				   window==window.top && !JAG.Story.isPaused && !JAG.Story.swappingChar){
					// CLOSE PLAYER STATS
					if(JAG.Story.showingStats) $Game.closeStats(JAG);
					$Game.openMenu(JAG);
				}else{
					$Game.swapCursor(JAG, 300);
				};
				
				
			/////////////////////////
			// CLOSE SAVE/LOAD WINDOW
			/////////////////////////
			}else{
				$Game.closeMenu(JAG);
			};
		};





		////////////////////////////////////////
		// PLAYER STATS WINDOW [ DEFAULT = TAB ]
		////////////////////////////////////////
		if(code===gD.statsKey){
			
			///////////////////////////
			// OPEN PLAYER STATS WINDOW
			///////////////////////////
			if(!JAG.Story.showingStats && !JAG.Story.swappingChar && !JAG.Story.inBattle){
				
				/////////////////////////////////////////////////////////////
				// DON'T ALLOW ON CUTSCENES, WHEN SWITCHING SCENES OR IFRAMES
				/////////////////////////////////////////////////////////////
				if(JAG.FUNC.noSpecialScene() && !JAG.Story.switchingScenes && window==window.top && !JAG.Story.isPaused){
					// CLOSE SAVE/LOAD WINDOW
					if(JAG.Story.showingSaveMenu) $Game.closeMenu(JAG);
					$Game.openStats(JAG); 
				}else{
				   $Game.swapCursor(JAG, 300);
				};

				
			////////////////////////////
			// CLOSE PLAYER STATS WINDOW
			////////////////////////////
			}else{
				$Game.closeStats(JAG);				
			};
		};
			
			
			
			
		/////////////////////////////////////////
		// LAUNCH FULLSCREEN MODE [ DEFAULT = ~ ]
		/////////////////////////////////////////
		if(code===gD.fullScreenKey){
			if(!JAG.Story.switchingScenes && !JAG.Story.swappingChar && !JAG.Load.loading && 
			  JAG.Timers.fullyLoadedTimer===false && JAG.Timers.ActionTimer===false){
				$Game.fullScreen(); 
			}else{
				$Game.swapCursor(JAG, 400);		
			};
		};
			
			
			
			
		/////////////////
		// SKIP CUTSCENES
		/////////////////
		if(code===sD.skip_key){
			if(sD.skip_to) JAG.OBJ.$currentScene.jumpToScene(JAG, sD.skip_to); 
		};
		
		
		
		
		/////////////////////////////////
		// PAUSE GAME [ DEFAULT = SPACE ]
		/////////////////////////////////
		if(code===gD.pauseKey){

			/////////////
			// PAUSE GAME
			/////////////
			if(!JAG.Story.isPaused){
				if(!JAG.Story.swappingChar && !JAG.Story.switchingScenes && !JAG.Story.talking && !JAG.Story.walking && !JAG.Load.loading && 
					JAG.FUNC.noWindows() && JAG.FUNC.noTimersRunning() && JAG.FUNC.noSpecialScene()){

					//////////////////////////////////////////////////////////
					// INSERT PAUSE BAR [ AND OVERLAY TO PREVENT INTERACTION ]
					//////////////////////////////////////////////////////////
					$Game.prepend('<div id="JAG_Pause"><p>'+gD.pause_text+'</p></div>');
					$('#JAG_Pause').stop(true,false).animate({opacity:1},{duration:200,queue:false});
						
					//////////////////
					// PAUSE ALL AUDIO
					//////////////////
					JAG.OBJ.$Music[0].pause();
					JAG.OBJ.$Ambient[0].pause();
					JAG.OBJ.$Effect[0].pause();
					JAG.OBJ.$Voice[0].pause();
					JAG.Story.isPaused=true;
				

				//////////////
				// CAN'T PAUSE
				//////////////
				}else{
					$Game.swapCursor(JAG, 300);
				};
					
			
			///////////////
			// UNPAUSE GAME
			///////////////
			}else{
				$('#JAG_Pause').stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
					$(this).remove();
				}});
					
				//////////////////////	
				// START PLAYING AUDIO
				//////////////////////
				JAG.OBJ.$Music[0].play();
				JAG.OBJ.$Ambient[0].play();
				JAG.OBJ.$Effect[0].play();
				JAG.OBJ.$Voice[0].src='';
				JAG.Story.isPaused=false;						
			};
		};
			
			
			
			
			
		////////////////////////////////////
		// CLOSE MENUS WHEN PRESSING [ ESC ]
		////////////////////////////////////
		if(code===27){
			// CLOSE SAVE MENU
			if(JAG.Story.showingSaveMenu) $Game.closeMenu(JAG);
			
			// CLOSE CHARACTER SELECTION MENU
			if($.isFunction($.fn.selectChar) && JAG.Story.showingCharSelect) JAG.OBJ.$selectedChar.closeCharSelect(JAG);				   

			// CLOSE PLAYER STATS
			if(JAG.Story.showingStats) $Game.closeStats(JAG);
		};
	});
	
	return $(this);
},








/***********************************************************************************************/
// ANIMATED MOUSE CURSOR: KEEPIN IT REAL - JAG.aniCursor($GAME);
/***********************************************************************************************/
aniCursor:function(JAG){
	if(!$('#JAG_Cursor').length){
		JAG.OBJ.$Game.prepend('<div id="JAG_Cursor"></div>');
		JAG.OBJ.$Cursor=$('#JAG_Cursor');
	};


	///////////////////////
	// GET COMPUTED MARGINS
	///////////////////////
	var $cur=JAG.OBJ.$Cursor,
		curStyle=$cur[0].currentStyle || window.getComputedStyle($cur[0]);


	/////////////////
	// BIND MOUSEMOVE
	/////////////////
	JAG.OBJ.$Game.on('mousemove', function(e){
		$cur.offset({ 
			left:e.pageX-curStyle.marginLeft.pF(), 
			top:e.pageY-curStyle.marginTop.pF() 
		});
	});	
},









/***********************************************************************************************/
// SWAPS TO WAITING CURSOR - JAG.OBJ.$Game.swapCursor(JAG, duration);
/***********************************************************************************************/
swapCursor:function(JAG, duration){
	// ALREADY ON WAITING CURSOR
	if(JAG.Timers.NotAllowedTimer || !JAG.DATA.gD.ani_cursor) return;
	
	var $cursor=JAG.OBJ.$Cursor,
		startTime=JAG.Timers.currentTime;

	$cursor.addClass('JAG_Wait_Cursor');

	JAG.Timers.NotAllowedTimer=setInterval(function(){ 
		var currentTime=JAG.Timers.currentTime,
			elapsed=currentTime-startTime;
		if(elapsed >= duration){
			JAG.FUNC.clrInterval('NotAllowedTimer');
			$cursor.removeClass('JAG_Wait_Cursor'); 
		};
	},100);
},








/***********************************************************************************************/
// FULLSCREEN ADVENTURE MODE
/***********************************************************************************************/
fullScreen:function(JAG){
	var d=document,
		$GAME=$(this).parent()[0];

	/////////////////////////////////////
	// CHECK FOR HTML5 FULLSCREEN SUPPORT
	/////////////////////////////////////
	if(d.fullscreenEnabled || d.webkitFullscreenEnabled || d.mozFullScreenEnabled || d.msFullscreenEnabled){


		////////////////
		// GO FULLSCREEN
		////////////////		
		if(!d.fullscreenElement && !d.mozFullScreenElement && !d.webkitFullscreenElement && !d.msFullscreenElement){
			if($GAME.requestFullscreen){				$GAME.requestFullscreen();
			}else if($GAME.webkitRequestFullscreen){	$GAME.webkitRequestFullscreen();
			}else if($GAME.mozRequestFullScreen){		$GAME.mozRequestFullScreen();
			}else if($GAME.msRequestFullscreen){		$GAME.msRequestFullscreen(); };


		///////////////////////////////
		// CURRENTLY FULL SCREEN - EXIT
		///////////////////////////////
		}else{
			if(d.exitFullscreen){ d.exitFullscreen();
			}else if(d.webkitExitFullscreen){ d.webkitExitFullscreen();
			}else if(d.mozCancelFullScreen){ d.mozCancelFullScreen();
			}else if(d.msExitFullscreen){ d.msExitFullscreen(); };
		};
	};
},








/***********************************************************************************************/
// GAME VIEWPORT SCALER  [ CALLED INITIALLY AND ON WINDOW RESIZE ]
/***********************************************************************************************/
scaleViewport:function(JAG){
	
		////////////////////////////////////////////////////////
	// DON'T RESIZE VIEWPORT WHEN A CHARACTER IS 
	// ATTACKING IN BATTLE [ ATTACK IS TIED TO STOPWALKING ]
	////////////////////////////////////////////////////////
	if(JAG.Story.inBattle && JAG.Story.walking) return;
	
	
	var $GAME=$(this),
		sD=JAG.DATA.sD,
		$Scene=$(JAG.OBJ.$currentScene),
		SceneW=$Scene.width().pF(),
		$wrapper=$GAME.parent(),
		wrapperInfo=$wrapper[0].getBoundingClientRect(),
		wrapperW=wrapperInfo.width,
		wrapperH=wrapperInfo.height,
		gameW=JAG.Scaling.baseDimensions.split(',')[0].pF(),
		gameH=JAG.Scaling.baseDimensions.split(',')[1].pF(),
		winW=$(window).width(),
		winH=$(window).height();



	////////////////////////////////////////////////////
	// WHEN PAGE LOADS - VIEWPORT IS AT BASE DIMENSIONS
	// COMPARE TO THE PARENT [WRAPPER] DIMENSIONS FOR %
	// ROUND UP WIDTH SINCE SCENE IMAGES ARE HEIGHT AUTO
	////////////////////////////////////////////////////

	//////////////////
	// WINDOW IS WIDER
	//////////////////
	if(winW > winH){
		var change=Math.abs(wrapperW/gameW),
			newGameW=Math.ceil(gameW*change),
			newGameH=gameH*change;

		////////////////////////////////			
		// MAKE SURE GAME ISN'T TOO TALL
		////////////////////////////////
		if(newGameH > winH){
			var change=Math.abs(winH/gameH),
				newGameW=Math.ceil(gameW*change),
				newGameH=gameH*change;
		};
			
			
	///////////////////
	// WINDOW IS TALLER
	///////////////////
	}else{
		var change=Math.abs(wrapperH/gameH),
			newGameW=Math.ceil(gameW*change),
			newGameH=gameH*change;

		////////////////////////////////
		// MAKE SURE GAME ISN'T TOO WIDE
		////////////////////////////////
		if(newGameW > winW){
			var change=Math.abs(winW/gameW),
				newGameW=Math.ceil(gameW*change),
				newGameH=gameH*change;
		};
	};



	///////////////////////////////////////////////////////
	// UPDATE SCALING AMOUNTS [ FOR USE THROUGHOUT ENGINE ]
	///////////////////////////////////////////////////////
	JAG.Scaling.gameScaled=change;



	//////////////////////////////
	// STOP CHARACTER FROM WALKING
	//////////////////////////////
	if(JAG.OBJ.$currentScene && $(JAG.OBJ.$currentScene).find('div.JAG_Char_El').length && JAG.OBJ.$selectedChar && JAG.FUNC.noSpecialScene()){
		var charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar);
		JAG.OBJ.$selectedChar.stop(true,false).stopWalking(JAG, true)
	};



	/////////////////////////////
	// UPDATE VIEWPORT DIMENSIONS
	/////////////////////////////
	$GAME[0].style.width=newGameW+'px';
	$GAME[0].style.height=newGameH+'px';
	$GAME[0].style.fontSize=change*100+'%';
	JAG.DATA.gD.viewportW=newGameW;
	JAG.DATA.gD.viewportH=newGameH;
	JAG.DATA.gD.offset=$GAME.offset();



	////////////////////////////////////////////////
	// UPDATE SCENE DIMENSIONS AND PATHFINDING ARRAY
	////////////////////////////////////////////////
	if(!$('#JAG_Teaser').length){
		var	masterWidth=sD.pan ? Math.floor(JAG.Scaling.orgImgW * change) : newGameW,
			src='Jaguar/scenes/'+sD.background,
			path_src=!sD.path ? src.slice(0, src.length-4)+'_path.png' : 'Jaguar/scenes/'+sD.path;
		$Scene[0].style.width=masterWidth+'px';

		if(!JAG.FUNC.isCutscene()) $Scene.loadPath(JAG, masterWidth, path_src, true);



		//////////////////////////////////////////////
		// SINCE CHARACTER MARGIN-TOP MUST BE IN PX,
		// NEED TO RECALCULATE HERE FOR ALL CHARACTERS
		//////////////////////////////////////////////
		var $Chars=$Scene.find('div.JAG_Char_El'),
			numChars=$Chars.length;

		for(var i=0; i<numChars; i++){
			var $Char=$($Chars[i]);
			$Char[0].style.marginTop=-$Char.height()+'px';
		};
		
		
		/////////////////
		// PANNING SCENES
		/////////////////
		if(sD.pan){
			// GET PERCENTAGE PANNED, MULTIPLY BY NEW SCENEW
			var newPan=(sD.panPos/SceneW) * masterWidth;

			// APPLY NEW PAN
			JAG.OBJ.$currentScene[0].style.marginLeft=newPan+'px';
			JAG.DATA.sD.panPos=newPan;
		};
	};
}});