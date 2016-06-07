/***********************************************************************************************/
// Jaguar - SECONDARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOOP THROUGH SECONDARY ACTIONS
/***********************************************************************************************/
actionLoop:function(JAG, Actions){
	var $Char=JAG.OBJ.$selectedChar,
		charName=JAG.FUNC.getName($Char),
		$Item=$(this),
		itemType=$Item.hasClass('JAG_Char_El') ? 'character' : 'item',
		iD=$Item.data(itemType),
		numofActions=Actions.length;

	
	
	/////////////////////////////////////////////////
	// PERFORM SECONDARY ACTIONS AFTER PRIMARY ACTION
	/////////////////////////////////////////////////
	for(var i=0; i<numofActions; i++){
		var string=Actions[i][0].clean(),
			property=string.split(':')[0].clean(),
			value=Actions[i][0].split(':')[1];
		
		
		
		/////////////////////////////////////////////////////
		// PERFORM SECONDARY ACTIONS IF STRING MATCH IS FOUND
		/////////////////////////////////////////////////////
		switch(property){

			// PLAY SOUND
			case 'play_sound' : $Item.playSound(JAG, value); break;

			// SET MUSIC TIME
			case 'music_time' : JAG.OBJ.$Music[0].currentTime=value.pF(); break;

			// SHOW ITEM
			case 'show' : $Char.show_Hide(JAG, value.clean(), 'show'); break;

			// HIDE ITEM
			case 'hide' : $Char.show_Hide(JAG, value.clean(), 'hide'); break;

			// WALK TO LOCATION
			case 'walk_to' : $Char.s_Walk_to(JAG, value.split(',')); break;

			// REMOVE ITEM FROM INVENTORY
			case 'inv_remove' : $Char.s_rem_Inv(JAG, value.clean()); break;

			// ADD ITEM TO INVENTORY
			case 'inv_add' : $Char.s_add_Inv(JAG, value.clean()); break;

			// SAY SOMETHING
			case 'say' : $Item.s_Say(JAG, value, false, Actions); break;

			// SAY SOMETHING IN CALLBACK
			case 'say_after' : $Item.s_Say(JAG, value, true, Actions); break;

			// SWAP WALKING PATH IMAGE
			case 'swap_path' : $Item.swapSceneGraphics(JAG, value.removeWS(), 'path'); break;

			// SWAP BACKGROUND IMAGE
			case 'swap_background' : $Item.swapSceneGraphics(JAG, value.removeWS(), 'background'); break;

			// SWAP FOREGROUND IMAGE
			case 'swap_foreground' : $Item.swapSceneGraphics(JAG, value.removeWS(), 'foreground'); break;

			// BEGIN RUMBLE EFFECT
			case 'rumble' : $Item.rumbleElement(JAG, value); break;

			// STOP RUMBLE EFFECT
			case 'stop_rumble' : $Item.stopRumble(JAG, value.clean()); break;

			// KILL CHARACTER
			case 'die' : $Char.die(JAG, value); break;

			// MOVE CHARACTER
			case 'char_move' : $Char.moveChar(JAG, value); break;

			// CALL CUSTOM JQUERY FUNCTION
			case 'jquery': window[value]($Char, JAG); break;



			///////////////////////////////////////
			// [ ADDON ] SELECT DIFFERENT CHARACTER
			///////////////////////////////////////
			case 'select_char': 
				var charName=value.split(',')[0].clean(),
					$Char=JAG.OBJ.$selectedChar,
					currentCharName=JAG.FUNC.getName($Char),
					delay=value.split(',')[1].pF();
				
				setTimeout(function(){ 
					// OPEN THE CHARACTER SELECTION MENU
					if(charName==='menu'){
						JAG.OBJ.$selectedChar.openCharSelect(JAG);

					// SELECT A SPECIFIC CHARACTER
					}else{
						JAG.OBJ.$selectedChar.selectChar(JAG, $('#JAG_ID_Char_'+charName)); 
					};
				}, delay);
			break;



			///////////
			// AUTOSAVE
			///////////
			case 'checkpoint' : 
				// SAVING REQUIRES SLIGHT DELAY TO AVOID RACE CONDITIONS AND LOAD ERRORS
				var checkpointVal=value.clean();
				if(checkpointVal==='save'){ 				
					JAG.Timers.checkpoint=setTimeout(function(){ 
						JAG.FUNC.clrTimeout('checkpoint');
						JAG.OBJ.$Game.saveGame(JAG, 'CHECKPOINT'); 
					}, 350) 
				}else if(checkpointVal==='load'){ 
					JAG.OBJ.$Game.loadGame(JAG, 'CHECKPOINT'); 
				};				
			break;
			
			
			
			//////////////////
			// JUMP TO A SCENE
			//////////////////
			case 'goto' : 
				var goVal=value.split(',');
				JAG.Timers.jumpSceneTimer=setTimeout(function(){
					JAG.FUNC.clrTimeout('jumpSceneTimer');					
					$Char.jumpToScene(JAG, goVal[0]);
				}, goVal[1].pF());
			break;
			
			
			
			/////////////////////
			// CHANGE ITEM SPRITE
			/////////////////////
			case 'change_sprite' :
				var itemName=JAG.FUNC.getItemName($Item);
				$Item.find('img').attr('src','Jaguar/items/'+value.trim());
				JAG.DATA.Items[itemName].inv_image=value;
				JAG.DATA.Items[itemName].image=value;
			break;
			
			
			
			///////////////////////////////
			// [ ADDON ] START PUZZLE TIMER
			///////////////////////////////
			case 'start_timer' : $Item.startPuzzleTimer(JAG, value, false); break;
			
			
			//////////////////////////////
			// [ ADDON ] ENTER BATTLE MODE
			//////////////////////////////
			case 'enter_battle' : 
				var goVal=value.split(',');
					JAG.Timers.jumpSceneTimer=setTimeout(function(){
						JAG.FUNC.clrTimeout('jumpSceneTimer');
						JAG.Story.inBattle=true;											
						$Char.jumpToScene(JAG, goVal[0]);
					}, goVal[1].pF());
			break;
		};
		
		
		
					
		/////////////////////////////
		// CHARACTER STATS +/- POINTS
		/////////////////////////////
		if(property.indexOf('stat_') >-1){
			// GET STAT AND +/- VALUE TO UPDATE
			var changeStat=property.replace('stat_',''),
				CharStats=$Char.data('stats');

			// LOOP THROUGH STATS OBJECT TO GET CORRECT STAT
			for(var stat in CharStats){
				if(CharStats.hasOwnProperty(stat)){
					// LOCATED THE STAT TO MODIFY
					if(changeStat===stat.clean()){
						// MAKE SURE NEW VALUE IS WITHIN USER-DEFINED STAT RANGE
						var newStatVal=CharStats[stat].pF()+value.pF(),
							maxStatVal=CharStats[stat+'_max'].pF();
						CharStats[stat]=newStatVal > maxStatVal ? maxStatVal : Math.max(0, newStatVal);
					};
				
				};
			};
		};				
	};


	return $Item;
},






/***********************************************************************************************/
// CHECK ACHIEVEMENTS - $Item.Achievements(JAG, Actions, JAG.OBJ.$selectedItem, verb);
/***********************************************************************************************/
Achievements:function(JAG, Actions, $invItem, verb){

	//////////////////////////////////////
	// ONLY CONTINUE FOR SECONDARY ACTIONS
	//////////////////////////////////////
	if(typeof Actions!=='object' && typeof Actions!=='boolean') return false;



	////////////////////////
	// ACHIEVEMENT VARIABLES
	////////////////////////
	var $Char=JAG.OBJ.$selectedChar,
		charName=JAG.FUNC.getName($Char),
		$Item=$(this),
		isChar=!$Item.hasClass('JAG_Item'),
		$el=isChar ? JAG.OBJ.$currentScene.find('div.JAG_Char_Settings_'+charName) : $Item,		
		inInv=false,
		beenThere=false,
		hasReqSprite=false,
		set_Inv=false,
		set_beenThere=false,
		set_req_sprite=false,
		riddle=false,
		hasTimer=false,
		timerRunning=false,
		solvedRiddle=false,
		riddleText=false,
		fireRandomEvent=false,
		randomEvent=false,
		// SET TO TRUE IN CASES LIKE "pick_up":true TO ALLOW ACHIEVEMENTS TO BE MET
		canRepeat=typeof Actions==='boolean' ? true : false,
		haveStats=true,
		l=Actions.length;



	/////////////////////////////////////////
	// RESOLVE CHARACTER OR ITEM DATA POINTER
	/////////////////////////////////////////	
	if(isChar){
		var charName=JAG.FUNC.getName($Item),
			iD=JAG.DATA.Chars[charName];
	}else{
		var itemName=JAG.FUNC.getItemName($Item),
			iD=JAG.DATA.Items[itemName];

		// IF LOADING GAME, USE SAVED JAG.DATA[ITEMNAME] DATA
		if(JAG.Load.game_name){
			var savediD=localStorage.getItem(JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~_'+itemName+'_itemData');
			if(savediD!=='undefined') var iD=JSON.parse(savediD);
		};
	};
	


	/////////////////////////
	// LOOP SECONDARY ACTIONS
	/////////////////////////
	for(var i=0; i<l; i++){
		var actionStr=Actions[i][0].split(':'),
			action=actionStr[0].clean(),
			value=actionStr[1];
			
		
		////////////////////////////////////////////////////////////////////////////
		// [ ADDON ] RANDOM EVENTS - DON'T CONTINUE UNLESS PROBABILITY SAYS TO
		// WHEN RANDOM EVENTS ADDON IS AVAILABLE AND SECONDARY ACTION "RANDOM EVENT"
		////////////////////////////////////////////////////////////////////////////
		if(action==='random_event'){ 
			var haveRandomEvent=true, 
				fireRandomEvent=$Item.randomEvents(JAG, value); 
		};

		
		
		/////////////////
		// MUST HAVE ITEM
		/////////////////
		if(action==='must_have'){
			var set_Inv=true, 
				inInv=JAG.DATA.Inv[charName].indexOf(value.removeWS()) >-1;
		};



		/////////////////////////////////////////////////////////////////
		// REQUIRED SPRITE [ COMBINING INVENTORY ITEMS TO CHANGE SPRITE ]
		/////////////////////////////////////////////////////////////////
		if(action==='req_sprite' && $invItem){
			var set_req_sprite=true,
				src=$invItem.find('img')[0].src,
				imageName=src.substring(src.lastIndexOf('/')+1, src.length).clean(),
				hasReqSprite=imageName===value.clean();
		};
		
		

		////////////////
		// BEEN TO SCENE
		////////////////
		if(action==='been_to'){
			var set_beenThere=true,
				beenTo=Actions[i][0].split(':')[1].clean();
			if($('#JAG_ID_Char_'+charName).data('been_to').indexOf(beenTo) >-1) var beenThere=true;
		};
		
		
		
		//////////////////////////
		// [ ADDON ] SOLVED RIDDLE
		//////////////////////////
		if(action==='riddle'){
			var riddle=true,
				riddleText=Actions[i][0].split(':')[1],
				riddleVoice=Actions['riddle_voice'] !== undefined ? Actions['riddle_voice'][0].split(':')[1] : false;
			if($Item.data('solvedRiddle')) var solvedRiddle=true;
		};
		
		
		
		//////////////////////////////
		// [ ADDON ] BEAT PUZZLE TIMER
		//////////////////////////////
		if(action==='stop_timer'){
			var hasTimer=true,
				timerName=Actions[i][0].split(':')[1].clean(),
				timer=JAG.Timers.puzzleTimers[timerName];



			////////////////////////////////
			// TIMER HAS BEEN STARTED BEFORE 
			////////////////////////////////
			if(JAG.Timers.puzzleTimers.hasOwnProperty(timerName)){
				
				/////////////////////////
				// TIMER IS STILL RUNNING
				/////////////////////////
				if(timer!==false){
					$('div.JAG_PuzzleTimer_'+timerName).stopPuzzleTimer(JAG, timerName, true);
					timerRunning=true;
				};


			////////////////////
			// NO TIMERS STARTED
			////////////////////
			}else{
				return false;

			};
		};

			
			
		//////////////////////////////////////////////////////////////////
		// REPEAT SECONDARY ACTIONS X NUMBER OF TIMES [ EXIT IS COMPLETE ]
		//////////////////////////////////////////////////////////////////
		if(action==='repeat_count' && ($Item.data('solvedRiddle') || !riddle)){


			//////////////////////////////////////////////////////////
			// CHECK ANY SAVED GAME DATA FOR REPEAT_COUNT [ ENTRANCE ]
			// ALL REPEAT VALUES ARE NULL UNTIL ENGAGED FOR THE FIRST TIME.
			// THEY ARE THEN EITHER SAVED TO THE ITEM/CHAR .DATA() AS A COUNTER
			// OR SET TO 0 IF THE USER DIDN'T SUPPLY A REPEAT COUNT.
			// SAVE/LOAD THEN ALWAYS CHECKS THE .DATA() COUNTER. IF IT DOESN'T
			// EXIST, JAGUAR NEVER ENCOUNTER THE SECONDARY ACTION AND ALL
			// SHOULD PLAY OUT AS IT NORMALLY WOULD
			//////////////////////////////////////////////////////////
			if(JAG.Load.game_name){
				var gameID=JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~_',
					sceneName=JAG.OBJ.$currentScene[0].id,
					savedCount=localStorage.getItem(gameID+sceneName+'_'+verb+'_fired');
				if(savedCount && $el.data(verb+'_fired')==undefined) $el.data(verb+'_fired', savedCount);
				
			};


			////////////////////////////////////////
			// SET INITIAL 0 _FIRED VALUE IF NOT SET
			////////////////////////////////////////
			if($el.data(verb+'_fired')==undefined || $el.data(verb+'_fired')==null) $el.data(verb+'_fired', 0);


			/////////////////////////////
			// CAN FIRE SECONDARY ACTIONS
			/////////////////////////////
			if($el.data(verb+'_fired').pF() < value.pF()){
				// INCREMENT COUNTER
				var canRepeat=true,
					current=$el.data(verb+'_fired');
				$el.data(verb+'_fired', current.pF()+1);
				
			// DON'T FIRE SECONDARY ACTIONS AGAIN!
			}else{
				return false;
			};
			
			
		///////////////////////////////////////////////
		// REPEAT COUNT NOT PROVIDED - RUN INDEFINITELY
		///////////////////////////////////////////////
		}else{
			var canRepeat=true;
		};
		

		///////////////
		// PLAYER STATS
		///////////////
		if(action.indexOf('req_stat_') >-1){
			// FLAG ANY STAT THAT DOESN'T MEET THE REQ POINTS
			var CharStats=$Char.data('stats');
			if(CharStats[action.replace('req_stat_','')] < value.pF()) var haveStats=false;
		};		
	};
	


	///////////////////////
	// ALL ACHIEVEMENTS MET
	///////////////////////
	if(canRepeat && haveStats && 							    // CAN STILL FIRE SECONDARY ACTIONS AND HAVE STAT POINTS
	  (!hasTimer || (hasTimer && timerRunning)) &&			    // IF TIMER EXISTS AND CHARACTER BEAT TIMER
	  (!set_Inv || (set_Inv && inInv)) && 					    // HAS THE REQUIRED INVENTORY ITEM
	  (!riddle || (riddle && solvedRiddle)) &&				    // SOLVED RIDDLE IF EXISTS
	  (!set_beenThere || (set_beenThere && beenThere)) &&	    // HAS BEEN TO SPECIFIC SCENE
	  (!set_req_sprite || (set_req_sprite && hasReqSprite)) &&  // INVENTORY ITEM IS A SPECIFIC SPRITE
	  (!haveRandomEvent || (haveRandomEvent && fireRandomEvent))// [ ADDON ] RANDOM EVENTS
	){ 
		return true;
		

		
	///////////////////////////
	// NOT ALL ACHIEVEMENTS MET
	///////////////////////////
	}else{



		/////////////////////////////////////////////////////////
		// RIDDLE HAS NOT BEEN SOLVED
		// SECONDARY ACTIONS ARE NOT FIRED UNTIL RIDDLE IS SOLVED
		/////////////////////////////////////////////////////////
		if(riddle && !solvedRiddle){
			$Item.riddle(JAG, iD, riddleText, riddleVoice, verb);

		}else{


			/////////////////////////////////////////////////////////
			// RESET THE FIRED COUNT TO INDICATE PUZZLE IS NOT SOLVED
			/////////////////////////////////////////////////////////
			iD[verb+'_fired']=0;
			$Item.saySomething(JAG, JAG.OBJ.$selectedChar, iD.not_ready_text, iD.not_ready_voice, JAG.OBJ.$currentScene, false);
			
			
			
			/////////////////////////////////////////////
			// REMOVE TIMER NAME FROM PUZZLETIMERS OBJECT
			// TO PREVENT REPEATING NOT_READY_TEXT
			/////////////////////////////////////////////
			if(hasTimer) delete JAG.Timers.puzzleTimers[timerName];
		};
		
		return false;		
	};
},





/***********************************************************************************************/
// WALK CHARACTER TO COORDINATES
/***********************************************************************************************/
s_Walk_to:function(JAG, walk_to){
	var $Char=$(this),
		gD=JAG.DATA.gD;
	

	////////////////////////////////
	// CREATE A SCENE ENTRANCE DELAY
	////////////////////////////////
	JAG.Timers.waitForIt=setTimeout(function(){	
		// BY DEFAULT, THE DESTINATION COORDINATES FOR WALK_TO
		// SECONDARY ENTRANCE ACTIONS ARE ON THE CHARACTER.
		// OVERRIDEN BY PLACING THEM ON EXITS [ SAVED TO JAG.DATA.SD.ENT_WALK ]
		if(!JAG.NEXT.walk_to){
			var toX=(walk_to[0].pF()/100) * gD.viewportW.pF(),
				toY=(walk_to[1].pF()/100) * gD.viewportH.pF();
		}else{
			var newWalk=JAG.NEXT.walk_to.split(','),
				toX=(newWalk[0].pF()/100) * gD.viewportW.pF(),
				toY=(newWalk[1].pF()/100) * gD.viewportH.pF();
			JAG.NEXT.walk_to=false;	
		};

		$Char.walk(JAG, toX, toY);
		JAG.FUNC.clrTimeout('waitForIt');
	},walk_to[2].pF());
},






/***********************************************************************************************/
// SHOW/HIDE OTHER OBJECTS
/***********************************************************************************************/
show_Hide:function(JAG, value, showHide){ 
	var $El=$('#JAG_ID_'+value.split(',')[0].clean()),
		speed=value.split(',')[1].pF(),
		itemType=$El.hasClass('JAG_Item') ? 'item' : 'character',
		show=showHide.clean()==='show';
		
		
	////////////////////////
	// ANIMATE THE SHOW/HIDE
	////////////////////////
	if(speed > 0){
		if(show){
			$El.css({visibility:'visible', opacity:0}).stop(true,false).animate({opacity:1},{duration:speed,queue:false});
		}else{
			$El.stop(true,false).animate({opacity:0},{duration:speed,queue:false,complete:function(){
				$El[0].style.visibility='hidden';
			}});
		};

		
		
	///////////////
	// NO ANIMATION
	///////////////
	}else{
		$El[0].style.visibility=show ? 'visible' : 'hidden';
	};
	
	

	///////////////////
	// UPDATE ITEM DATA
	///////////////////
	$El.data('visibility', show ? 'visible' : 'hidden');

	if(itemType==='character'){
		JAG.DATA.Chars[JAG.FUNC.getName($El)].hidden=show ? false : true;	
	}else{
		JAG.DATA.Items[JAG.FUNC.getItemName($El)].hidden=show ? false : true;		
	};
},





/***********************************************************************************************/
// SECONDARY SAY
/***********************************************************************************************/
s_Say:function(JAG, say, callback, Actions){ 
	var $Char=JAG.OBJ.$selectedChar,
		charName=JAG.FUNC.getName($Char),
		$Scene=JAG.OBJ.$currentScene,
		voice=false;



	////////////////////////////////////////////////////////
	// HIDE EXISTING TEXT FIRST - INSURES SAYSOMETHING FIRES
	////////////////////////////////////////////////////////
	JAG.Story.talking=false;
	$('p.JAG_Char_Dialogue')[0].style.display='none';



	///////////////////////////////////////////////
	// GET SECONDARY ACTION VOICE SETTING IF EXISTS
	///////////////////////////////////////////////
	for(var i=0, l=Actions.length; i<l; i++){
		var string=Actions[i][0].clean(), 
			property=string.split(':')[0];

		if(property.indexOf('voice') >=0){ var voice=Actions[i][0].split(':')[1].removeWS(); break; };
	};



	///////////////////////////////////////
	// SAY SOMETHING WHILE WALKING OR AFTER
	///////////////////////////////////////
	if(callback){
		JAG.DATA.Chars[charName].action=true;
		JAG.DATA.Chars[charName].callback=function(){ $Char.saySomething(JAG, $Char, say, voice, $Scene, false); };
	}else{
		$Char.saySomething(JAG, $Char, say, voice, $Scene, false);
	};
},






/***********************************************************************************************/
// ADD/REMOVE ITEM TO INVENTORY
/***********************************************************************************************/
s_add_Inv:function(JAG, addInv){ 
	var $Item=$('#JAG_ID_'+addInv);
	$Item.addToInv(JAG, JAG.FUNC.getName(JAG.OBJ.$selectedChar)); 
},
s_rem_Inv:function(JAG, rem_Inv){ 
	var $Item=$('#JAG_ID_'+rem_Inv),
		iD=JAG.DATA.Items[JAG.FUNC.getItemName($Item)];
	if(JAG.OBJ.$Inv.find($Item).length) $Item.remFromInv(JAG, iD.text.clean());
},






/***********************************************************************************************/
// SWAPS SCENE FOREGROUND/BACKGROUND/PATH - $Item.swapSceneGraphics(JAG, value, 'foreground');
/***********************************************************************************************/
swapSceneGraphics:function(JAG, value, type){
	var $forScene=$('#'+value.split(',')[0].toLowerCase()),
		fileName=value.split(',')[1],
		applyHere=value.split(',')[2].toLowerCase();


	///////////////////////////////////////////////
	// SWAP BACKGROUND, FOREGROUND OR PATH GRAPHICS
	///////////////////////////////////////////////
	switch(type){
		case 'background':
			$forScene.data('scene').background=fileName; 
			// APPLY TO CURRENT SCENE
			if(applyHere=='true') $forScene.find('img.JAG_Background')[0].src='Jaguar/scenes/'+fileName;
		break;
		
		case 'foreground': 
			$forScene.data('scene').foreground=fileName;
			// APPLY CURRENT FOREGROUND
			if(applyHere=='true') $forScene.find('div.JAG_Foreground img')[0].src='Jaguar/scenes/'+fileName;
		break;
		
		case 'path': 
			// UPDATE CURRENT WALKING PATH IMAGE		
			$forScene.data('scene').path=fileName; 
			if(applyHere=='true') $forScene.loadPath(JAG, JAG.DATA.sD.sceneW, 'Jaguar/scenes/'+fileName, true);
		break;
	};
},






/***********************************************************************************************/
// CHARACTER DIES - $Char.die(JAG, D);
/***********************************************************************************************/
die:function(JAG, text){
	JAG.OBJ.$Game.prepend('<div id="JAG_Die_Overlay"><p>'+text+'</p><div class="JAG_Die_Restart">Click to Continue</div></div>');
	var $DieOver=$('#JAG_Die_Overlay'),
		speed=JAG.DATA.sD.death_speed.split(',');
	
	
	
	/////////////////
	// FADE OUT SCENE
	/////////////////
	JAG.OBJ.$currentScene.stop(true,false).animate({opacity:0},{duration:speed[0].pF(),queue:false});
	
	
	
	///////////////////////
	// FADEIN DEATH OVERLAY
	///////////////////////
	$DieOver.css({display:'block', opacity:0}).animate({opacity:1},{duration:speed[0].pF(),queue:false,complete:function(){
		JAG.OBJ.$Panel[0].style.display='none';	
	
	
	/////////////////////////////////
	// CLICKING OVERLAY RESTARTS GAME
	/////////////////////////////////
	}}).one('click',function(){
		$DieOver.restartGame(JAG);
	});
},






/***********************************************************************************************/
// MOVE AN AUX CHARACTER - $Char.moveChar(JAG, value);
/***********************************************************************************************/
moveChar:function(JAG, value){
	var AuxCharName=value.split(',')[0].clean(),
		$AuxChar=$('#JAG_ID_Char_'+AuxCharName),
		currentScene=JAG.OBJ.$currentScene[0].id.clean(),
		toScene=value.split(',')[1].clean(),
		walkX=(value.split(',')[2].pF()/100)*JAG.DATA.sD.sceneW,
		walkY=(value.split(',')[3].pF()/100)*JAG.DATA.sD.sceneH;
		
		
		
	//////////////////////////////////////////
	// DON'T MOVE CURRENTLY SELECTED CHARACTER
	//////////////////////////////////////////
	if(JAG.FUNC.getName(JAG.OBJ.$selectedChar)===AuxCharName) return;
	
	
	
	/////////////////////////////////////////////
	// WALK CHARACTER, THEN MOVE TO ANOTHER SCENE
	/////////////////////////////////////////////
	if(!isNaN(walkX) && !isNaN(walkY)){
		// SETUP CALLBACK
		JAG.DATA.Chars[AuxCharName].action=true;
		JAG.DATA.Chars[AuxCharName].callback=function(){
			// MOVE CHARACTER AND UPDATE LOCATION
			$AuxChar.detach().prependTo($('#'+toScene));
			JAG.DATA.Chars[AuxCharName].current_location=toScene;
		};
		
		$AuxChar.walk(JAG, walkX, walkY); 


	
	/////////////////////////////
	// JUST MOVE TO ANOTHER SCENE
	/////////////////////////////
	}else{
		// MOVE CHARACTER AND UPDATE LOCATION
		$AuxChar.detach().prependTo($('#'+toScene));
		JAG.DATA.Chars[AuxCharName].current_location=toScene;
	};
}});