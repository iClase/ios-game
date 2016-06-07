/***********************************************************************************************/
// Jaguar - SCENE MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SCENE LOADING - $(scene).loadScene(JAG);
/***********************************************************************************************/
loadScene:function(JAG){
	var $Scene=JAG.OBJ.$currentScene,
		sD=JAG.DATA.sD,
		gD=JAG.DATA.gD;


	////////////
	// CUTSCENES
	////////////
	if(sD.cutscene || sD.map){ $Scene.loadCutScene(JAG); return; };


	var	$Chap=JAG.OBJ.$currentChapter,
		src='Jaguar/scenes/'+sD.background,
		path_src=!sD.path ? src.slice(0, src.length-4)+'_path.png' : 'Jaguar/scenes/'+sD.path,
		foreG=sD.foreground ? 'Jaguar/scenes/'+sD.foreground : false,
		img=new Image(),
		HOR=sD.horizon.split(',');



	///////////////////////////
	// SET HORIZON/GROUND LINES
	///////////////////////////
	JAG.DATA.sD.horizonLine=HOR[0].pF(); 
	JAG.DATA.sD.groundLine=HOR[1].pF();
	
	
	
	//////////////////////////////////////
	// CHECK FOR CHANGED SRCs WHEN LOADING
	//////////////////////////////////////
	if(JAG.Load.game_name){
		var lS=localStorage,
			gameID=JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~_'+$Scene[0].id.clean();
		if(lS.getItem(gameID+'_savedBG')) var src='Jaguar/scenes/'+lS.getItem(gameID+'_savedBG');
		if(lS.getItem(gameID+'_savedFG')) var foreG='Jaguar/scenes/'+lS.getItem(gameID+'_savedFG');
		if(lS.getItem(gameID+'_savedPath')) var path_src='Jaguar/scenes/'+lS.getItem(gameID+'_savedPath');
	};



	/////////////	
	// LOAD SCENE
	/////////////
	$(img).one('load',function(){

		//////////////////
		// INSERT ELEMENTS
		//////////////////
		// BACKGROUND/FOREGROUND
		if(!$Scene.find('img.JAG_Background').length) $('<img src="'+src+'" class="JAG_Background"/>').appendTo($Scene);
		if(foreG){
			if(!$Scene.find('div.JAG_Foreground').length){ 
				$('<div class="JAG_Foreground"><img src="'+foreG+'"></div>').appendTo($Scene);
			}else{ 
				$Scene.find('div.JAG_Foreground img')[0].src=foreG; 
			};
			
			JAG.OBJ.$foreground=$Scene.find('div.JAG_Foreground'); 
		};


		///////////////////////////////////
		// ANIMATE DESCRIPTION BAR/PANEL IN
		///////////////////////////////////
		if(JAG.OBJ.$Panel.is(':hidden')){
			$([JAG.OBJ.$Panel[0], JAG.OBJ.$dBar[0]]).css('display','block').stop(true,false)
				.animate({opacity:1},{duration:sD.speed.split(',')[0].pF(),queue:false});
		};


		/////////////////////////////////////////////
		// SAVE SETTINGS [SCENE DIMENSIONS & PANNING]
		/////////////////////////////////////////////
		// CANNOT GET HEIGHT OF BACKGROUND IMAGE IF HIDDEN
		var masterWidth=sD.pan ? Math.floor(this.width * JAG.Scaling.gameScaled) : gD.viewportW;
		$Scene[0].style.width=masterWidth+'px';
		$Chap.removeClass('JAG_CutScene');

		JAG.Scaling.orgImgW=this.width;
		JAG.DATA.gD.viewportW=$Chap.outerWidth(); 
		JAG.DATA.gD.viewportH=$Chap.outerHeight();



		/////////////////////////////////////////////////////////////////////
		// DRAW SCENE PATH IMAGE TO CANVAS FOR BOUNDARY DETECTION [_PATH.JPG]
		/////////////////////////////////////////////////////////////////////
		if(!$Scene.find('canvas.JAG_Canvas').length) $('<canvas class="JAG_Canvas"></canvas>').appendTo($Scene);
		$Scene.loadPath(JAG, masterWidth, path_src, false);

				

		////////////////////////////////////
		// DAY & NIGHT CYCLING, WEATHER, FOG
		////////////////////////////////////
		if(sD.day_night) $Scene.DayNightCycle(JAG);					
		if(sD.weather && !sD.indoor) $Scene.weatherEffects(JAG);
		if(sD.fog) $Scene.fogEffects(JAG);
		
				
				
		//////////////////////////////////////////////////////////////////////////////		
		// LOOP THROUGH ALL SCENE ITEMS AND CHARACTERS TO SEE IF SCENE IS FULLY LOADED
		//////////////////////////////////////////////////////////////////////////////
		var $sceneItems=$Scene.find('div.JAG_Item'),
			$sceneChars=$Scene.find('div.JAG_Char_El'),
			numItems=$sceneItems.length,
			numChars=$sceneChars.length;


		JAG.Timers.fullyLoadedTimer=setInterval(function(){			
			var	allChars=[], 
				allItems=[];
				
				
			/////////////////////////
			// CHECK CHARACTERS/ITEMS
			/////////////////////////
			for(var i=0; i<numChars; i++) if(JAG.DATA.Chars[JAG.FUNC.getName($($sceneChars[i]))].loaded) allChars.push('loaded');
			for(var i2=0; i2<numItems; i2++){ 
				if($sceneItems[i2]!=undefined){
					var iD=JAG.DATA.Items[JAG.FUNC.getItemName($($sceneItems[i2]))]; 
					if(iD.loaded || iD.hidden) allItems.push('loaded'); 
				};
			};


			///////////////////////////////////////////////////////////
			// MAKE SURE ALL IMAGES ARE LOADED [ INCLUDING FOG IMAGES ]
			///////////////////////////////////////////////////////////
			if(allItems.length===numItems && allChars.length===numChars && JAG.OBJ.$canvas && ((sD.fog && sD.fogLoaded) || !sD.fog)){
				JAG.FUNC.clrInterval('fullyLoadedTimer');
				$Scene.fullyLoaded(JAG);
			};	
		},100); 
	})[0].src=src;	


	return $(this);	
},









/***********************************************************************************************/
// LOAD PATHFINDING IMAGE - $Scene.loadPath(JAG, masterWidth, path_src, scaling);
// WHEN SCALING - THE MASTERWIDTH IS THE NEW DIMENSIONS TO LOAD AND LOOP IMAGE
/***********************************************************************************************/
loadPath:function(JAG, masterWidth, path_src, scaling){
	JAG.OBJ.$canvas=$(this).find('canvas.JAG_Canvas')[0];
	
	var $Scene=$(this),
		pathImg=new Image(),
		sceneH=$Scene.height(),
		canvas=JAG.OBJ.$canvas,
		ctx=canvas.getContext('2d');		
		

	///////////////////////////
	// UPDATE CANVAS DIMENSIONS
	///////////////////////////
	canvas.width=masterWidth;
	canvas.height=sceneH;
	JAG.DATA.sD.sceneH=sceneH;
	JAG.DATA.sD.sceneW=masterWidth;



	////////////////////////////////////////////
	// SETUP WIDTH/POS FOR ALL RELATED SCENE ELS
	////////////////////////////////////////////
	if(JAG.DATA.weather && JAG.OBJ.$Weather){
		JAG.OBJ.$Weather[0].style.width=masterWidth;
		JAG.OBJ.$Weather[0].style.height=sceneH;
	};
	
	if(JAG.DATA.sD.fog && JAG.OBJ.$Fog) JAG.OBJ.$Fog[0].style.height=sceneH;


	///////////////////////////////////////////////////////////
	// LOAD CHARACTER, ITEM ASSETS, DESCRIPTION BAR & AUX CHARS
	///////////////////////////////////////////////////////////
	if(!scaling){
		var $sceneChars=$Scene.find('div.JAG_Char_El'),
			numChars=$sceneChars.length;
		for(var i=0; i<numChars; i++) $($sceneChars[i]).loadChar(JAG);
		
		$Scene.loadItems(JAG).dBar(JAG);
	};


	/////////////////////////////
	// AFTER PATH IMAGE IS LOADED
	/////////////////////////////
	$(pathImg).one('load',function(){
		
		//////////////////////////////////////////////////////////
		// DRAW IMAGE AND SAVE PATH PIXELS TO JAG.DATA.sD.pathData
		//////////////////////////////////////////////////////////
		ctx.drawImage(pathImg, 0, 0, masterWidth, sceneH);
   		JAG.DATA.sD.pathData=ctx.getImageData(0, 0, masterWidth, sceneH).data;

		
		///////////////////////////////////////////////
		// UPDATE SCENE DIMS HERE AFTER SCALING IS DONE
		///////////////////////////////////////////////
		JAG.DATA.sD.sceneW=masterWidth;
		JAG.DATA.sD.sceneH=sceneH;
	})[0].src=path_src;	
},








/***********************************************************************************************/
// MAKE SURE EVERYTHING IN SCENE IS COMPLETELY LOADED 
/***********************************************************************************************/
fullyLoaded:function(JAG){
	var $Scene=$(this),
		sD=JAG.DATA.sD,
		gD=JAG.DATA.gD,
		charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar),
		cD=JAG.DATA.Chars[charName];


	////////////////////////
	// PANNING [ SET PAN % ]
	////////////////////////
	if(sD.pan){
		// USE ENT_PAN SETTING WHEN PRESENT
		JAG.NEXT.pan_pos=JAG.NEXT.pan_pos!==false && JAG.NEXT.pan_pos!=='false' ? JAG.NEXT.pan_pos.pF()/100 : sD.pan_pos.pF()/100;
		var panPos=sD.panPos=-(JAG.NEXT.pan_pos * (sD.sceneW-gD.viewportW));


		//////////////////////////////////////////
		// LOADING A GAME - GET SAVED PAN POSITION
		//////////////////////////////////////////
		if(JAG.Load.pan_pos){ 
			var panPos=(JAG.Load.pan_pos.pF()/JAG.Load.pan_pos_width) * sD.sceneW;
			JAG.DATA.sD.panPos=panPos; 
		};


		///////////////////////////
		// SET INITIAL PAN POSITION
		///////////////////////////
		$Scene[0].style.marginLeft=(panPos/gD.viewportW)*100+'%';

	}else{ 
		$Scene[0].style.marginLeft=0;
	};



	///////////////////////////
	// RESET SAVE PAN INDICATOR
	///////////////////////////
	JAG.Load.pan_pos=false;	



	////////////
	// SUBTITLES
	////////////
	if(sD.subtitle) $Scene.subTitle(JAG, sD.subtitle, false);
	
	
	
	///////////////////////////////
	// [ ADDON ] VERB CUSTOMIZATION
	///////////////////////////////
	if($.isFunction($.fn.verbs)) $Scene.verbs(JAG, sD);



	/////////////////////////////////////
	// [ ADDON ] FIRST PERSON PERSPECTIVE
	/////////////////////////////////////
	if($.isFunction($.fn.firstPerson) && sD.first_person){
		JAG.OBJ.$selectedChar[0].style.visibility='hidden';
	}else{
		JAG.OBJ.$selectedChar[0].style.visibility='visible';
	};
	

	//////////////////////////////////
	// LAYER CHARACTER AND SCENE ITEMS
	//////////////////////////////////
	var $sceneItems=$($Scene.find('div.JAG_Item')).add($Scene.find('div.JAG_Char_El').not(JAG.OBJ.$selectedChar));
	JAG.OBJ.$selectedChar.layerItem(JAG, $sceneItems, $sceneItems.length, true);	



	//////////////////////
	// TRANSITION SCENE IN
	//////////////////////
	$Scene.transSceneIn(JAG);	
},









/***********************************************************************************************/
// SCENE IN TRANSITIONS $newScene.transSceneIn(JAG) 
/***********************************************************************************************/
transSceneIn:function(JAG){ 
	var	$newScene=$(this),
		sD=JAG.DATA.sD,	
		speed_In=sD.speed.split(',')[0].pF(),
		charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar);


	///////////////////////
	// TRANSITION FOG LAYER
	///////////////////////
	if(sD.fog){
		JAG.OBJ.$Fog[0].style.opacity=sD.fog_opacity.pF();
		JAG.OBJ.$Fog[0].style.visibility=sD.fog ? 'visible' : 'hidden';
	};



	///////////////////
	// FADEIN NEW SCENE
	///////////////////
	$newScene[0].style.display='block';
	$newScene.stop(true,false).animate({opacity:1},{duration:speed_In,queue:false,complete:function(){
		JAG.Story.switchingScenes=false;


		////////////////////
		// [ NOT CUTSCENES ]
		////////////////////
		if(!JAG.FUNC.isCutscene()){ 
		

			///////////////////////////////////////
			// LOAD GAME ENTRANCE SECONDARY ACTIONS
			///////////////////////////////////////
			var cD=JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)];	
			if(JAG.Load.play_entrance && cD.entrance && JAG.OBJ.$selectedChar.Achievements(JAG, cD.entrance, false, 'entrance')){
				JAG.OBJ.$selectedChar.actionLoop(JAG, cD.entrance);	
			};
			JAG.Load.play_entrance=true;		

					
					
			//////////////////////////////////////////
			// SETUP SCENE EVENTS AFTER SCENE IS READY
			//////////////////////////////////////////
			$newScene.off('click dblclick').on('click dblclick',function(e){
				e.preventDefault(); 
				e.stopPropagation();
			

				//////////////////
				// EVENT VARIABLES
				//////////////////
				var $tar=$(e.target),
					tarClass=$tar.attr('class'),
					$win=$(window),
					charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar),
					cD=JAG.DATA.Chars[charName],
					gD=JAG.DATA.gD,
					mouseX=e.clientX-gD.offset.left+$win.scrollLeft(),
					mouseY=e.clientY-gD.offset.top+$win.scrollTop(),
					// RESOLVE TARGET [ CAN CLICK INNER IMAGES ]			
					$target=tarClass.indexOf('Img') >-1 ? $tar.parent('div:first') : $tar,					
					isChar=tarClass.indexOf('JAG_Char_El') >-1,
					isItem=tarClass.indexOf('JAG_Item') >-1,
					isExit=isItem && $target.data('item').type.clean()==='exit' ? true : false,
					isRiddle=$('#JAG_Riddle_Answer').is(':visible'),
					charAction=isChar ? JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].action : false;


				///////////////////////////////////////////////////////////////////
				// SOME USER ACTIONS PREVENT EVENTS FROM FIRING - RETURN THOSE HERE
				///////////////////////////////////////////////////////////////////
				if(JAG.Story.switchingScenes || charAction || JAG.Story.talking  || isRiddle){
					JAG.OBJ.$Game.swapCursor(JAG, 300);
					if(isRiddle) $('#JAG_Riddle_Answer').find('input').focus();
					return;
				};



				/////////////////////
				// HANDLE EVENT TYPES
				/////////////////////		
				switch(e.type){
					
					
					///////////////
					// SINGLE CLICK
					///////////////
					case 'click':
						// SET TARGET AS CURRENT ITEM & REMOVE ANY CLICKED EXIT REFERENCES
						JAG.OBJ.$currentItem=$target;
						JAG.OBJ.$selectedExit=false;
						
						
						/////////////////////////////////////
						// CLOSE CONVERSATION DIALOGUE WINDOW
						/////////////////////////////////////
						if(JAG.OBJ.$Dialogue) JAG.OBJ.$Dialogue.closeDiag(JAG);


						////////////////////////////////////
						// CLICKING AUX CHARACTER OR OBJECTS
						////////////////////////////////////
						if(JAG.Story.ActionWord!==false && (isChar || (isItem && $target.data('item').text!==false))){


							/////////////////
							// PERFORM ACTION
							/////////////////
							$target.Action(JAG, (isChar ? 'character' : 'item'), true, false);

					
							
							/////////////////////////
							// SETUP TARGET VARIABLES
							/////////////////////////
							var tarInfo=$target[0].getBoundingClientRect(),
								mL=Math.abs($target.css('margin-left').pF()),
								mouseY=tarInfo.y-gD.offset.top+tarInfo.height,
								mouseX=tarInfo.x-gD.offset.left+tarInfo.width;
								


							/////////////////////////////////////////////////
							// GET CHARACTER'S DIRECTION [ FOR FACE-TO-FACE ]
							/////////////////////////////////////////////////
							JAG.OBJ.$selectedChar.returnDist($target);
							
							if(Diff.AcD){
								/////////////////////////////////////////
								// DIRECTION THAT AUX CHARACTER IS FACING
								/////////////////////////////////////////
								switch(Diff.AcD.direction){
									case 'left' || 'right':
										var mouseX=(tarInfo.x+mL)-gD.offset.left-JAG.OBJ.$selectedChar.width(),
											mouseY=$target.position().top; 
									break;
									
									case 'up' || 'down':
										var mouseX=(tarInfo.x+mL)-gD.offset.left+(JAG.OBJ.$selectedChar.width()/2),
											mouseY=$target.position().top+(JAG.OBJ.$selectedChar.height()/2); 
									break;
								};
							};
							
							
							
						/////////////////////
						// CLICKING EXIT ITEM
						/////////////////////
						}else{
							JAG.OBJ.$selectedItem=false;
													
							if(isExit){
								//////////////////////////////////////
								// SAVE REFERENCE TO CLICKED EXIT ITEM
								//////////////////////////////////////								
								JAG.OBJ.$selectedExit=$target;
																
								if(JAG.Story.talking && JAG.OBJ.$Dialogue.length >-1){
									JAG.OBJ.$Game.swapCursor(JAG, 300);
									return;
								};
							};
						};

						
						
						
						/////////////////////////////////////////////////////////
						// DISABLE DESC BAR ACTION WORD AND WALK TO CLICKED POINT
						/////////////////////////////////////////////////////////
						JAG.Story.ActionWord=false;
						JAG.Story.joinWord=false;
						$target.updateBar(JAG, 'exit', false, ' ');
						if(!JAG.Story.inBattle) JAG.OBJ.$selectedChar.walk(JAG, mouseX, mouseY);
					break;
				
				
				
				
					////////////////////////////////////////////
					// DOUBLE CLICK - FAST-ADVANCE TO NEXT SCENE
					////////////////////////////////////////////
					case 'dblclick':
						if(isExit){
							var allowAdvance=$target.data('item').exit_style.split(',')[1].removeWS().isB();

							if((JAG.Story.talking && JAG.OBJ.$Dialogue.length >-1) || !allowAdvance){
								JAG.OBJ.$Game.swapCursor(JAG, 300);
								return;
							};
							
							////////////////////////
							// ADVANCE TO NEXT SCENE
							////////////////////////
							if(allowAdvance) $newScene.transSceneOut(JAG, $('#'+$target.data('item').goto)[0], $target);
						};
					break;
				};
			});
		
		
		
			////////////////////////////////
			// [ ADDON ] ENTERED BATTLE MODE
			////////////////////////////////
			if(JAG.Story.inBattle) $newScene.combat(JAG);		
		};
		



		//////////////////////////////////////////////////////////////
		// NOTE CHARACTER WAS HERE [ COMMA SEPARATE LIST OF SCENE IDS]
		//////////////////////////////////////////////////////////////
		var beenTo=$('#JAG_ID_Char_'+charName).data('been_to'),
			sceneID=$newScene[0].id.clean(),
			notBeen=beenTo.indexOf(sceneID)===-1;



		////////////////////
		// SAVE BEEN TO DATA
		////////////////////				
		$('#JAG_ID_Char_'+charName).data('been_to', beenTo+','+sceneID);



		///////////////
		// ROLL CREDITS
		///////////////
		if(sD.roll_credits && (notBeen || sD.repeat_credits)) $newScene.rollCredits(JAG);		
		
		
		
		///////////////////////////
		// CANNOT CHANGE CHARACTERS
		///////////////////////////
		JAG.Timers.swapCharTimer=setTimeout(function(){ 
			JAG.FUNC.clrTimeout('swapCharTimer');
			JAG.Story.swappingChar=false; 
		},3000);
	}}); 




	//////////////////
	// UPDATE DEBUGGER
	//////////////////
	if(JAG.DATA.gD.debugKey && JAG.OBJ.$Debug){
		if($newScene.find('div.JAG_Char_El').length) JAG.OBJ.$Debug.find('input[name="Char_Lines"]').debugCharLines(JAG);
		JAG.OBJ.$Debug.find('input[name="horizon_Line"]').debugHorizon(JAG);
		JAG.OBJ.$Debug.find('input[name="Show_Path"]').debugPath(JAG);
		JAG.OBJ.$Debug.find('input[name="Item_Lines"]').debugItemLines(JAG);
		JAG.OBJ.$Debug.find('input[name="hide_FG"]').debugForeground(JAG);
		JAG.OBJ.$Debug.find('input[name="show_Clip"]').debugSceneClipping(JAG);
		$('#JAG_Debug_currentScene').html($newScene[0].id);
	};
	
	return $(this);	
},








/***********************************************************************************************/
// SCENE OUT TRANSITIONS - $oldScene.transSceneOut(JAG, newScene, $ExitItem);
/***********************************************************************************************/
transSceneOut:function(JAG, newScene, $Item){
	

	//////////////////////////////////
	// CANNOT EXIT THIS SCENE JUST YET
	//////////////////////////////////
	if(!JAG.FUNC.canExitScene()){
		var $Char=JAG.OBJ.$selectedChar,
			cD=JAG.DATA.Chars[JAG.FUNC.getName($Char)];		

		$Char.stopWalking(JAG, false);
		JAG.OBJ.$Game.swapCursor(JAG, 400);
		return $(this);
	};
	


	JAG.Story.switchingScenes=true;
	var $oldScene=$(this),
		sD=JAG.DATA.sD,	
		speed_Out=sD.speed.split(',')[1].pF();
	

	
	////////////////////////////////////////////////////////
	// STOP WALKING TO PREVENT INBOUNDS ISSUES IN NEXT SCENE
	////////////////////////////////////////////////////////
	if(JAG.OBJ.$selectedChar) JAG.OBJ.$selectedChar.stop(true,false);


	
	/////////////////////////////////////
	// CLOSE CONVERSATION DIALOGUE WINDOW
	/////////////////////////////////////
	if(JAG.OBJ.$Dialogue) JAG.OBJ.$Dialogue.closeDiag(JAG);					



	/////////////////////
	// ORGANIZE INVENTORY
	/////////////////////
	$oldScene.shuffleInv(JAG);	


	//////////////////////////////////////
	// HANDLE SPECIAL NEXT SCENE VARIABLES
	//////////////////////////////////////
	if($Item){
		var iD=JAG.DATA.Items[JAG.FUNC.getItemName($Item)];
		if(iD.next_pos) JAG.NEXT.pos=''+iD.next_pos.split(',')[0].pF()+','+iD.next_pos.split(',')[1].pF()+'';
		JAG.NEXT.image=iD.next_image ? iD.next_image : false;
		JAG.NEXT.direction=iD.next_direction ? iD.next_direction : false;
		JAG.NEXT.pan_pos=iD.next_pan!==false && iD.next_pan!=='false' ? iD.next_pan : false;
		JAG.NEXT.walk_to=iD.next_walk_to!==false && iD.next_walk_to!=='false' ? iD.next_walk_to : false;
	};



	/////////////////////////
	// SYNC MUSIC AND AMBIENT
	/////////////////////////
	if(sD.sync_music!=false) $oldScene.data('sync_music',JAG.OBJ.$Music[0].currentTime);
	if(sD.sync_ambient!=false) $oldScene.data('sync_ambient',JAG.OBJ.$Ambient[0].currentTime);


	////////////////////
	// FADEOUT OLD SCENE
	////////////////////
	$oldScene.stop(true,false).animate({opacity:0},{duration:speed_Out, queue:false,complete:function(){



		///////////////////////
		// HIDE ROLLING CREDITS
		///////////////////////
		if(sD.roll_credits) $oldScene.find('div.JAG_Credits').stop(true,false).css({display:'none', top:'100%'});
	
	
	
		//////////////////////////////////////////
		// HIDE DIALOGUE ELEMENTS AND CLEAR TIMERS
		//////////////////////////////////////////
		$oldScene.find('p.JAG_Char_Dialogue').add($('#JAG_Scene_Dialogue')).css({display:'none', opacity:0});
		JAG.FUNC.clrTimeout('subtitleTimer');
		
		
		
		////////////////////////////////////////////
		// HIDE SPECIAL EFFECTS AND DAY/NIGHT LAYERS
		////////////////////////////////////////////
		if(JAG.OBJ.$Weather) JAG.OBJ.$Weather.remove();
		if(JAG.OBJ.$Fog) JAG.OBJ.$Fog.remove();
		if(JAG.OBJ.$DayNight){ 
			JAG.OBJ.$DayNight.stop(true,false); 
			JAG.FUNC.clrInterval('DayNightTimer'); 
		};
		
		
		
		//////////////////////////
		// RESET SCENE TO DEFAULTS
		//////////////////////////
		$oldScene[0].style.display='none';		
		JAG.resetScene(JAG, newScene);
	}}); 
	
	return $(this);	
},







/***********************************************************************************************/
// SCENE SUBTITLES - $Scene.subTitle(JAG, subText, multiLine);
/***********************************************************************************************/
subTitle:function(JAG, subText, multiLine){
	JAG.OBJ.$Subtitle=$('#JAG_Scene_Dialogue');

	var $Scene=$(this),
		sD=JAG.DATA.sD,
		sub_options=sD.subtitle_speed.split(','),
		subDelay=sub_options[1].pF(),
		subSpeed=sub_options[0].pF(),	
		multiSub=subText.indexOf('||') ? true : false,
		text=multiSub ? subText.split('||')[0] : subText;



	//////////////////////////////////////
	// STOP HERE IF CANNOT REPEAT SUBTITLE
	//////////////////////////////////////
	if(!JAG.FUNC.isCutscene()){
		var beenHere=$('#JAG_ID_Char_'+JAG.FUNC.getName(JAG.OBJ.$selectedChar)).data('been_to').indexOf($Scene[0].id) >-1;
		if(!multiLine && beenHere && !sD.subtitle_repeat.isB()) return;		
	};



	//////////////////////////////////
	// STYLE SUBTITLE AND GET POSITION
	//////////////////////////////////
	JAG.OBJ.$Subtitle[0].style.fontSize=sD.subtitle_size.pF()+'%';
	JAG.OBJ.$Subtitle[0].style.color=sD.subtitle_color;
	JAG.OBJ.$Subtitle[0].style.top=sD.subtitle_pos.pF()+'%';
	JAG.OBJ.$Subtitle[0].style.opacity=0;
	JAG.OBJ.$Subtitle[0].style.display='block';
	JAG.OBJ.$Subtitle[0].innerHTML=text;
	JAG.OBJ.$Subtitle.stop(true,false).animate({opacity:1},{duration:subSpeed, queue:false});
			
			
			
	/////////////////
	// CREATE A DELAY
	/////////////////
	if(subDelay > 0){
		JAG.Timers.subtitleTimer=setTimeout(function(){
			JAG.FUNC.clrTimeout('subtitleTimer');


			///////////////////////////////
			// FADEOUT SINGLE LINE SUBTITLE
			///////////////////////////////
			if(!multiSub){
				JAG.OBJ.$Subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false});


			/////////////////////////////////////////////////////
			// FADEOUT SINGLE SUBTITLE WITHIN MULTI-LINE SUBTITLE
			/////////////////////////////////////////////////////
			}else{
			
				/////////////////////////////////
				// REMOVE FIRST SUBTITLE LINE AND
				// MERGE ARRAY W/O ANY CHARACTERS				
				/////////////////////////////////
				var newSub=subText.split('||');
				newSub.shift(); 
							
				for(var i=0, l=newSub.length; i<l; i++){
					// REMOVE WHITESPACE AT BEGINNING OF TEXT AND TRAILING COMMAS
					newSub[i]=newSub[i].replace(/^\s+|\s+$/g,'');
					// ADD || AS A SEPARATOR ON ALL EXCEPT LAST TEXT
					if(i!==newSub.length-1) newSub[i]+=' ||';
				};

				var nextSub=newSub.join(' ');

			
				//////////////////////////				
				// CONTINUE WITH NEXT LINE
				//////////////////////////
				JAG.OBJ.$Subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false,complete:function(){
					if(nextSub) JAG.OBJ.$currentScene.subTitle(JAG, nextSub, true);
				}});
			};
		}, subDelay); 
	};
}});