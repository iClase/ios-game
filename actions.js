/***********************************************************************************************/
// Jaguar - PRIMARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// ACTIONS [ CHARACTERS AND ITEMS ] - $obj.Action(JAG, itemType, callback, inInv);
/***********************************************************************************************/
Action:function(JAG, itemType, callback, inInv){
	var $Char=JAG.OBJ.$selectedChar,
		charName=JAG.FUNC.getName($Char),
		$Item=$(this),
		iD=JAG.FUNC.elType($Item);


	/////////////////////////////
	// EXIT IF ACTION IS OCCURING
	/////////////////////////////
	if(JAG.DATA.Chars[charName].action || JAG.Story.switchingScenes || JAG.Story.talking){
		JAG.OBJ.$Game.swapCursor(JAG, 300);
		return $(this);
	};
	

	/////////////////////////////////////
	// SET ACTION STATE IF USING CALLBACK
	/////////////////////////////////////
	if(callback) JAG.DATA.Chars[charName].action=true;



	//////////////////////////////////////////////////////////////////
	// CALL CORRECT ACTION [ GIVE/USE REQUIRE ADDITIONAL FUNCTIONALITY
	//////////////////////////////////////////////////////////////////
	switch(JAG.Story.ActionWord){


		///////
		// GIVE
		///////
		case 0:
			// TEST FOR JOINER WORD [ 3-CLICK VERB ]
			if(JAG.Story.joinWord){
				// PERFORM ACTION [ NOW OR AFTER CALLBACK ]
				if(callback){ 
					JAG.DATA.Chars[charName].callback=function(){ $Char.give(JAG, $Item); };
				}else{ 
					$Char.give(JAG, $Item); 
				};
				
			}else{
				// UPDATE DESCRIPTION BAR
				$Item.updateBar(JAG, 'click', 'item', ' '+iD.text);
				JAG.Story.joinWord=true;
			};
			
			return $(this);
		
		
		
		//////
		// USE
		//////
		case 6:
			// USE A SCENE ITEM DIRECTLY
			if(!inInv && !JAG.OBJ.$selectedItem){

				// PERFORM ACTION AFTER WALKING
				JAG.DATA.Chars[charName].callback=function(){ $Char.useScene(JAG, $Item, iD); };

			// USE INV ITEM WITH INV ITEM
			}else{
				// TEST FOR JOINER WORD [ 3-CLICK VERB ]
				if(JAG.Story.joinWord){
					// CURRENTITEM IS THE CLICKED SCENE TARGET
					if(JAG.OBJ.$currentItem){
						JAG.DATA.Chars[charName].callback=function(){ $Char.useInv(JAG, $Item, iD, false); };
					}else{
						$Char.useInv(JAG, $Item, iD, inInv);
					};
					
				// UPDATE DESCRIPTION BAR
				}else{
					$Item.updateBar(JAG, 'click', 'item', ' '+iD.text);
					JAG.Story.joinWord=true;
					JAG.OBJ.$currentItem=false;
				};
			};
			return $(this);

		case 1: var action='open'; break;
		case 2: var action='close'; break;
		case 3:	var action='pick_up'; break;
		case 4: var action='look_at'; break;
		case 5: var action='talk_to'; break;
		case 7: var action='push'; break;
		case 8: var action='pull'; break;
	};



	///////////////////////////////////////////
	// PERFORM ACTION [ NOW OR AFTER CALLBACK ]
	///////////////////////////////////////////
	if(callback){ 
		JAG.DATA.Chars[charName].callback=function(){ $Char.goAction(JAG, $Item, iD, inInv, action); };
	}else{ 
		$Char.goAction(JAG, $Item, iD, inInv, action); 
	};

	return $(this);
},









/***********************************************************************************************/
// goAction - SHORTCUT FUNCTION TO PERFORM SPECIFIC ACTIONS
/***********************************************************************************************/
goAction:function(JAG, $Item, iD, inInv, action){


	///////////////////////
	// ITEM IS IN INVENTORY
	///////////////////////
	if(inInv){


		////////////////////////////
		// CAN ACTION INVENTORY ITEM
		////////////////////////////
		if(iD['inv_'+action]!=false && iD['inv_'+action]!=='_') $Item.actionTimer(JAG, iD['inv_'+action], 'inv_'+action, $Item);


		///////////////////////////////////
		// MAKE SURE A RESPONSE CAN BE SAID
		///////////////////////////////////
		$Item.checkSay(JAG, iD['inv_'+action], iD['inv_'+action+'_text'], iD['inv_'+action+'_voice'], false, false);
		
		
		
		
	///////////////////
	// ITEM IS IN SCENE
	///////////////////
	}else{
		

		////////////////////////
		// CAN ACTION SCENE ITEM
		////////////////////////
		if(iD[action]!=false && iD[action]!=='_') $Item.actionTimer(JAG, iD[action], action, false);
		
		
		////////////////////
		// PLAY CONVERSATION
		////////////////////
		if(action==='talk'){
			var startQuestion=iD.play_conversation.isB() ? 0 : false;
			if(iD.play_conversation) JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].conversation=true;			
		};
		
		
		///////////////////////////////////////////////////////
		// MAKE SURE A RESPONSE CAN BE SAID
		// SPEECH LINES AFTER PICK UP HANDLED IN SEC ACTION SAY
		///////////////////////////////////////////////////////
		if(action==='pick_up' && iD[action]===false){
			// WHEN CANNOT PICKUP ITEM, BUT WANT TO SAY SOMETHING SPECIFIC
			$Item.saySomething(JAG, JAG.OBJ.$selectedChar, iD.pick_up_text, iD.pick_up_voice, JAG.OBJ.$currentScene, false);
		}else{


			/////////////////////////////////////
			// WALKING THROUGH TALK_TO_TEXT ARRAY
			/////////////////////////////////////
			if(iD[action+'_text']!=false){
				var sayText=iD[action+'_text'],
					sayVoice=iD[action+'_voice'];				
	
	
			////////////////////////////////////////////////////////
			// TALK_TO_TEXT ARRAY IS DEPLETED, USE TALK_NO_MORE_TEXT
			////////////////////////////////////////////////////////
			}else if(action==='talk_to' && iD.talk_no_more_text){
				var sayText=iD.talk_no_more_text,
					sayVoice=iD.talk_no_more_voice;
			};

			$Item.checkSay(JAG, iD[action], sayText, sayVoice, startQuestion || false, false);
		};
	};
	
	
	//////////////////
	// ACTION COMPLETE
	//////////////////
	$Item.actionComplete(JAG);
},








/***********************************************************************************************/
// GIVE - $Char.give(JAG, $Item);
/***********************************************************************************************/
give:function(JAG, $Item){
	var $target=JAG.OBJ.$currentItem ? JAG.OBJ.$currentItem : $Item,
		invItemName=JAG.FUNC.getItemName(JAG.OBJ.$selectedItem),
		iD=JAG.DATA.Items[invItemName],
		// CAN'T GIVE ITEMS TO OTHER ITEMS
		inInv=$target.hasClass('JAG_Item') ? false : !$Item.data('carried_by');


	/////////////////////////
	// GIVE ITEM IN INVENTORY
	/////////////////////////
	if(inInv){
		//////////////////////////////////////////////////
		// LOOP GIVE COMMANDS AND FIND WHO TO GIVE ITEM TO
		//////////////////////////////////////////////////
		var l=iD.give.length, 
			canGive=false;
		for(var i=0; i<l; i++){
			// TO: ACTION
			if(iD.give[i][0].split(':')[0].clean()==='to'){
				// CURRENT CHARACTER IS SAME AS "GIVE ITEM TO" CHARACTER
				var toChar=iD.give[i][0].split(':')[1].clean();
				if($('#JAG_ID_Char_'+toChar)[0]===$target[0]) var canGive=true;
			};
		};


		//////////////////////////
		// CAN GIVE INVENTORY ITEM
		//////////////////////////
		if(canGive && iD.give!=false && iD.give!=='_'){


			//////////////////////////////////////
			// SWAP SPRITES AND CHECK ACHIEVEMENTS
			//////////////////////////////////////
			$Item.actionTimer(JAG, iD.give, 'give', $Item);
			
			
			//////////////////////////////////////////////////////
			// MERGE INV_GIVE TEXT WITH AUX CHARACTER SPEECH ARRAY
			//////////////////////////////////////////////////////
			if($target.hasClass('JAG_Char_El')){
				var AuxCharName=JAG.FUNC.getName($target),
					charData=JAG.DATA.Chars[AuxCharName];

				
				/////////////////////////////////////////////////////////////////////				
				// IF GIVE_TEXT IS AN ARRAY - EXTEND CONVERSATION BY MERGERING ARRAYS
				/////////////////////////////////////////////////////////////////////
				if($.isArray(iD.give_text)){
					JAG.DATA.Chars[AuxCharName].talk_to_text=$.merge($.merge([], iD.give_text), charData.talk_to_text);

				///////////////////////////////////////////////////////////////////////////
				// OR DEFAULT GIVE_TEXT [ USE FALSE FOR GIVE_TEXT IF USING SEC ACTION SAY ]
				///////////////////////////////////////////////////////////////////////////
				}else{
					JAG.DATA.Chars[AuxCharName].talk_to_text=iD.give_text;
				};


				////////////////////////////////////
				// BEGIN DIALOGUE [ SAY FIRST LINE ]
				////////////////////////////////////
				if(charData.play_conversation){
					JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].conversation=true;
					JAG.DATA.Chars[AuxCharName].conversation=true;
				};
				
				///////////////////////////////////
				// MAKE SURE A RESPONSE CAN BE SAID
				///////////////////////////////////
				$target.checkSay(JAG, charData.talk_to, charData.talk_to_text, charData.talk_to_voice, 0, false);
			};

			

		////////////////////////////
		// CAN'T GIVE INVENTORY ITEM
		////////////////////////////
		}else{
			
			///////////////////////////////////
			// MAKE SURE A RESPONSE CAN BE SAID
			///////////////////////////////////
			$Item.checkSay(JAG, iD.give, iD.inv_give_text, iD.inv_give_voice, false, false);
		};
	};


	//////////////////
	// ACTION COMPLETE
	//////////////////
	$Item.actionComplete(JAG);
},







/***********************************************************************************************/
// USE SCENE ITEM - $Char.useScene(JAG, $Item, iD);
/***********************************************************************************************/
useScene:function(JAG, $Item, iD){

	////////////////////////
	// CAN USE ITEM IN SCENE
	////////////////////////
	if(iD.use!=false && iD.use!=='_'){

		//////////////////////////////////////
		// SWAP SPRITES AND CHECK ACHIEVEMENTS
		//////////////////////////////////////
		$Item.actionTimer(JAG, iD.use, 'use', false);


	//////////////////////////
	// CAN'T USE ITEM IN SCENE
	//////////////////////////
	}else{

		///////////////////////////////////
		// MAKE SURE A RESPONSE CAN BE SAID
		///////////////////////////////////
		$Item.checkSay(JAG, iD.use, iD.use_text, iD.use_voice, false, false);
	};


	//////////////////
	// ACTION COMPLETE
	//////////////////
	$Item.actionComplete(JAG);
},







/***********************************************************************************************/
// USE ITEM WITH - $Char.useInv(JAG, $Item, iD, inInv); 
/***********************************************************************************************/
useInv:function(JAG, $Item, iD, inInv){
	//////////////////////////////////////
	// DON'T ALLOW USE WITH AUX CHARACTERS
	//////////////////////////////////////
	if(!$Item.hasClass('JAG_Char_El')){
		var $invItem=JAG.OBJ.$selectedItem,
			iD=JAG.DATA.Items[JAG.FUNC.getItemName($invItem)],

			/////////////////////////////////////////////////
			// LOOP USE COMMANDS & FIND WHAT TO USE ITEM WITH
			/////////////////////////////////////////////////
			l=iD.inv_use.length, 
			canUse=false;
			
		for(var i=0; i<l; i++){
			if(iD.inv_use[i][0].split(':')[0].clean()==='with'){
				// IF TARGET OBJECT IS SAME AS "USE WITH" OBJECT				
				if($('#JAG_ID_'+iD.inv_use[i][0].split(':')[1].clean())[0]===$Item[0]) var canUse=true;
			};
		};


		//////////////////////////////
		// USE INVENTORY ITEM ON SCENE
		//////////////////////////////
		if(!inInv){
			if(iD.inv_use!=false && iD.inv_use!=='_' && canUse){

				////////////////////////////////////////////////
				// CHECK ACHIEVEMENTS => PERFORM SEC USE ACTIONS
				////////////////////////////////////////////////
				JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].action=true;
				$invItem.actionTimer(JAG, iD.inv_use, 'use', $invItem); 
				

			///////////////////////////////////////////
			// CAN'T USE INVENTORY ITEM WITH SCENE ITEM
			///////////////////////////////////////////
			}else{
				JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].action=false;
	
				///////////////////////////////////
				// MAKE SURE A RESPONSE CAN BE SAID
				///////////////////////////////////
				$invItem.checkSay(JAG, iD.inv_use, iD.inv_use_text, iD.inv_use_voice, false, true);
			};
			

		/////////////////////////////////////////////
		// USE INVENTORY ITEM ON OTHER INVENTORY ITEM
		/////////////////////////////////////////////
		}else{
			
			///////////////
			// CAN USE ITEM
			///////////////
			if(iD.inv_use!=false && iD.inv_use!=='_' && canUse){
				$Item.actionTimer(JAG, iD.inv_use, 'inv_use', $invItem);


			/////////////////
			// CAN'T USE ITEM
			/////////////////
			}else{
				////////////////////////////////////////////////////////////////
				// CAN'T USE INVENTORY ITEM, DON'T JUMP TO CHECKSAY HERE BECAUSE
				// IT WILL CHECK FOR EXISTANCE OF SECONDARY SAY SETTINGS
				////////////////////////////////////////////////////////////////
				$invItem.saySomething(JAG, JAG.OBJ.$selectedChar, iD.inv_use_text, iD.inv_use_voice, JAG.OBJ.$currentScene, false);
			};

			JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].action=false;
		};
	};


	//////////////////
	// ACTION COMPLETE
	//////////////////
	JAG.OBJ.$selectedItem=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;
	JAG.OBJ.$dBar.find('span').text(' ');
},







/***********************************************************************************************/
// CHECK IF CHARACTER CAN RESPOND - $Item.checkSay(JAG, action, say, voice, startQuestion, ignoreSecSay);
// IGNORE SECONDARY SAY ALLOWS FOR FALLING BACK TO DEFAULT SPEECH ON THINGS LIKE USE:WITH
/***********************************************************************************************/
checkSay:function(JAG, action, say, voice, startQuestion, ignoreSecSay){
	var toSpeak=true,
		$Item=$(this),
		iD=JAG.FUNC.elType($Item),
		hasSay=false,
		hasRiddle=false;


	/////////////////////////
	// LOOP SECONDARY ACTIONS
	/////////////////////////
	for(var i=0; i<action.length; i++){
		var actionX=action[i][0].clean();
		
		////////////////////////////////////////////////////////////
		// CHECK IF SECONDARY SAY, SAY_AFTER OR RIDDLE ACTION EXISTS
		////////////////////////////////////////////////////////////
		if(actionX.indexOf('say') >-1 && !ignoreSecSay) var hasSay=true;
		if(actionX.indexOf('riddle') >-1) var hasRiddle=true;
	};
	

	//////////////////////////////////
	// HANDLE TEXT IN SECONDARY ACTION
	//////////////////////////////////
	if(hasSay || hasRiddle) var toSpeak=false;
	
	
	////////////////////////////////////////////////
	// IF A RIDDLE HAS BEEN SOLVED, HANDLE TEXT HERE
	////////////////////////////////////////////////
	if($Item.data('solvedRiddle') && $Item.hasClass('JAG_Char_El')) var toSpeak=true;


	///////
	// TALK
	///////
	if(toSpeak) $Item.saySomething(JAG, JAG.OBJ.$selectedChar, say, voice, JAG.OBJ.$currentScene, startQuestion);
},








/***********************************************************************************************/
// TIMER FOR ACTION SPRITE - $Item.actionTimer(JAG, action, actionText, $invItem);
/***********************************************************************************************/
actionTimer:function(JAG, action, actionText, $invItem){
	JAG.FUNC.clrTimeout('ActionTimer');


	//////////////////////////
	// SWITCH TO ACTION SPRITE
	//////////////////////////
	var $Item=$(this),
	  	startTime=JAG.Timers.currentTime,
		$Char=JAG.OBJ.$selectedChar,
		charName=JAG.FUNC.getName($Char),
		action_time=JAG.DATA.Chars[charName].action_time;



	if(actionText!=='talk_to') $Char.switchSprite(JAG, JAG.DATA.Chars[charName], actionText);


	////////////////////////////////////////////////////////////////////////////////////////////////
	// ALLOW USERS TO SET TIMES FOR VERBS USING THE ACTION_TIMER SETTING // CONTRIBUTED BY PVISINTIN
	////////////////////////////////////////////////////////////////////////////////////////////////
	if($.isArray(action_time)){
		var l=action_time.length;
		for(var i=0; i<l; i++){
			var value=action_time[i][0].clean().split(':');
			if(value[0]===actionText) action_time=value[1];
		};
	};


	////////////////////////////////
	// SWITCH BACK TO STOPPED SPRITE
	////////////////////////////////
	JAG.Timers.ActionTimer=setInterval(function(){
		var currentTime=JAG.Timers.currentTime,
			elapsed=currentTime-startTime;
		
		
		////////////////////////////
		// TRIGGER ACTION WHEN READY
		////////////////////////////
		if(elapsed >= action_time.pF()){
			JAG.FUNC.clrInterval('ActionTimer');
			if(!JAG.Story.walking) $Char.switchSprite(JAG, JAG.DATA.Chars[charName], 'stopping');
	
	
			//////////////////////////////////////////////////
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY ACTIONS
			//////////////////////////////////////////////////
			if($Item.Achievements(JAG, action, $invItem, actionText)){
				$Item.actionLoop(JAG, action);
				
				
				//////////////////////////////////////				
				// ACHIVEMENTS MET - SPECIAL SCENARIOS
				//////////////////////////////////////
				switch(actionText){
					case 'pick_up': 
						$Item.addToInv(JAG, charName).shuffleInv(JAG); 
					break;
					
					case 'give':
						////////////////////////////////////////////////////////
						// MOVE THE ITEM HTML ELEMENT TO NEW CHARACTER INVENTORY
						////////////////////////////////////////////////////////
						var $toChar=$Item,
							toCharName=JAG.FUNC.getName($toChar),
							$giveItem=JAG.OBJ.$selectedItem,
							giveItemName=JAG.FUNC.getItemName($giveItem);
							
						$giveItem.addToInv(JAG, toCharName).shuffleInv(JAG);
					break;
				};
			};
		};
	}, 50);
},






/***********************************************************************************************/
// CLEARS ACTION VARIABLES - $Item.actionComplete(JAG);
/***********************************************************************************************/
actionComplete:function(JAG){
	JAG.DATA.Chars[JAG.FUNC.getName(JAG.OBJ.$selectedChar)].action=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;
	$(this).updateBar(JAG, 'exit', false, ' ');
}});