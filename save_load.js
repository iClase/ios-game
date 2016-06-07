/***********************************************************************************************/
// Jaguar - SAVE/LOAD GAMES
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// OPENS LOAD/SAVE MENU
/***********************************************************************************************/
openMenu:function(JAG){
	JAG.Story.showingSaveMenu=true;	

	/////////////////////////////////////////////////
	// FOR DEBUGGING PURPOSES [ CLEARS LOCALSTORAGE ]
	/////////////////////////////////////////////////
	//localStorage.clear(); console.log(localStorage);	
	
	var title=JAG.DATA.gD.title ? JAG.DATA.gD.title : 'Save or Load a Game',
		gameID=JAG.OBJ.$Game.attr('id');
	JAG.Load.loading=false;
	JAG.Load.deleting=false;		
	JAG.Load.saving=false;
	// RESETS REFERENCE TO CURRENT SAVE SLOT
	JAG.Load.$slot=false;  
			
	
	///////////////////////
	// CREATE MENU ELEMENTS
	///////////////////////
	JAG.OBJ.$Game.prepend('<div id="JAG_SaveMenu_Overlay"></div>\
		<div class="JAG_SaveMenu">\
			<p class="save_text">'+title+'</p>\
			<div class="JAG_SaveMenu_Left">\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
				<input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input>\
			</div>\
			<div class="JAG_SaveMenu_Right">\
				<div class="JAG_Save">Save</div>\
				<div class="JAG_Load">Load</div>\
				<div class="JAG_Checkpoint JAG_no_checkpoint">Checkpoint</div>\
				<div class="JAG_Delete">Delete</div>\
				<div class="JAG_Restart">Restart</div>\
				<div class="JAG_Quit">Quit</div>\
				<div class="JAG_Cancel">Cancel</div>\
			</div>\
		</div>');


	//////////////////////////
	// CACHE SAVEMENU ELEMENTS
	//////////////////////////
	var $saveMenu=JAG.OBJ.$SaveMenu=JAG.OBJ.$Game.find('div.JAG_SaveMenu'),
		$overlay=$('#JAG_SaveMenu_Overlay'),
		$left=$saveMenu.find('div.JAG_SaveMenu_Left'),
		$right=$saveMenu.find('div.JAG_SaveMenu_Right'),
		$title=$saveMenu.find('p.save_text');
		

	/////////
	// FADEIN
	/////////
	$overlay.stop(true,false).fadeTo(300, 0.85, function(){ $saveMenu.stop(true,false).fadeTo(300, 1); });


	//////////////////////////////////////////////////////////
	// LOOP LOCALSTORAGE AND FIND SAVED GAMES FOR THIS GAMEID	
	// GAMES ARE SAVED USING THE FORMAT:
	// myAdventure~	   [ FIRST PART OF STRING IS THE GAME ID ]
	// save_name~	   [ SECOND PART IS THE SAVE GAME NAME   ]
	// pan_pos		   [ LAST PART IS THE SETTING NAME       ]
	//////////////////////////////////////////////////////////
	for(var i=0, l=localStorage.length; i<l; i++){

		// ENTRY CONTAINS GAMEID [LOAD ONLY LOCALSTORAGE FOR THIS JAGUAR GAME]
		if(localStorage.key(i).indexOf(gameID) >- 1){

			/////////////////////
			// SAVEGAME VARIABLES			
			/////////////////////
			var gameStr=localStorage.key(i).replace(gameID+'~',''),
				lastChar=gameStr.lastIndexOf('~'),
				gameName=gameStr.substring(0, lastChar);

			////////////////////////////////////
			// LOOP TO FIND FIRST AVAILABLE SLOT
			////////////////////////////////////
			for(var i2=0; i2<10; i2++){
				var $inp=$left.find('input').eq(i2);
					value=$inp.val();

				// DON'T ALLOW POPULATING MULTIPLE INPUTS WITH THE SAME GAME
				if(gameName===value) break;

				// POPULATE SAVEGAME NAME IN LIST					
				if(value.removeWS()==='empty' && gameName.removeWS()!=='CHECKPOINT'){ $inp.val(gameName); break; };
				
				// CHECKPOINT HAS BEEN LOCATED
				if(gameName.removeWS()==='CHECKPOINT') $right.find('div.JAG_Checkpoint').removeClass('JAG_no_checkpoint');
			};
		};			
	};


	///////////////////
	// GAME SLOT EVENTS
	///////////////////
	$left.find('input').on('click',function(){
		// MUST INITIATE A BUTTON ACTION FIRST
		if(!JAG.Load.deleting && !JAG.Load.saving && !JAG.Load.loading){ $(this).blur(); return; };
		var $input=$(this),
			val=$input.val();


		//////////
		// LOADING
		//////////
		if(JAG.Load.loading){ 
			if(val.indexOf('empty') > -1){
				$title.html('No save game data found');
			}else{
				// DISABLE BUTTON CLICKING WHILE LOADING
				$right.find('div').add($left.find('div')).off('click');
				JAG.OBJ.$Game.loadGame(JAG, val); 
			};


		///////////		
		// DELETING
		///////////
		}else if(JAG.Load.deleting){
			JAG.Load.loading=false;
			JAG.Load.deleting=false;
			JAG.Load.saving=false;
			
			// TRYING TO DELETE AN EMPTY SAVE SLOT
			if(val.indexOf('empty') > -1){
				$input.blur();
				$title.html('No save game data found');

			// DELETE SLOT INFORMATION
			}else{
				/////////////////////////////////////////////////////////
				// LOOP LOCALSTORAGE AND FIND SAVED GAMES FOR THIS GAMEID		
				/////////////////////////////////////////////////////////		
				var	prefix=gameID+'~'+val+'~',
					myLength=prefix.length;

				Object.keys(localStorage).forEach(function(key){ 
					if(key.substring(0,myLength)==prefix) localStorage.removeItem(key); 
				}); 

				$input.val('empty').blur();
				$title.html('Save game has been deleted');
			};
			
			
		/////////
		// SAVING
		/////////
		}else if(JAG.Load.saving){
			JAG.Load.loading=false;
			JAG.Load.deleting=false;

			// SAVE SLOT REFERENCE
			JAG.Load.$slot=$input;
			JAG.Load.slot_name=val;
		
			// ALLOW FOR EDITING THIS INPUT ONLY
			$left.find('input').addClass('JAG_disabledInput').attr('readonly',true);
			$input.removeClass('JAG_disabledInput').attr('readonly',false);
		
			// CLEAR INPUT ONLY IF DEFAULT VALUE
			if(val.indexOf('empty') > -1) $input.val('');
			
			// UPDATE TITLE TEXT
			$title.html('Name your save game and click Save Game');
		};
	})
		
		
	////////////////////////////////////
	// NAVIGATING AWAY FROM EMPTY INPUTS
	////////////////////////////////////
	.on('blur',function(){
		var $input=$(this), val=$input.val().removeWS();
		if(val==' ' || !val) $input.val('empty');

		// DEACTIVATE INPUTS AND UPDATE TITLE
		$left.find('input').addClass('JAG_disabledInput');
		$title.html(title);
	})
	

	////////////////////////////////////////
	// SAVE GAME WHEN PRESSING ENTER IN SLOT
	////////////////////////////////////////
	.on('keyup.Jaguar',function(e){
 		var code=e.keyCode||e.which;
		if(code===13) $right.find('div.JAG_Save').trigger('click');
	});


	///////////////////////
	// RIGHT COLUMN BUTTONS
	///////////////////////
	$right.find('div').on('click',function(e){
		$button=e.currentTarget;
		JAG.Load.saving=JAG.Load.loading=JAG.Load.deleting=false;

		switch ($button){

			///////
			// SAVE
			///////
			case $right.find('div.JAG_Save')[0]:
				JAG.Load.saving=true;
				var $slot=JAG.Load.$slot ? JAG.Load.$slot : false;

				//////////////////////////////
				// SECOND CLICK SAVES THE GAME 
				//////////////////////////////
				if($slot){

					// USER NEEDS TO GIVE SAVEGAME A NAME!
					if($slot.val()==='empty' || $slot.val()===''){
						$title.html('Please use descriptive titles for save games'); 
						return;

					// USER RENAMED EXISTING SAVEGAME [OVERWRITE]
					}else if($slot.val()!==JAG.Load.slot_name){
						// FIRST DELETE ALL EXISTING INFO FOR THIS SAVEGAME
						var	prefix=gameID+'~'+JAG.Load.slot_name+'~',
							myLength=prefix.length;
						Object.keys(localStorage).forEach(function(key){ 
							if(key.substring(0,myLength)==prefix) localStorage.removeItem(key); 
						}); 
					};

					// DON'T ALLOW CHECKPOINT AS THE SAVEGAME NAME [ RESERVED ]
					if($slot.val().removeWS()==='CHECKPOINT'){ 
						$title.html('Name reserved for CHECKPOINT slot');
						return;
					};

					// SAVE THE GAME!
					JAG.OBJ.$Game.saveGame(JAG, $slot.val()); 	
			
			
				///////////////////////////////
				// FIRST CLICK TITLES SAVEGAMES
				///////////////////////////////							
				}else{
					// ACTIVATE INPUTS AND UPDATE TEXT
					$left.find('input').removeClass('JAG_disabledInput')
					$title.html('Select a save slot');
				};
			break;
			
			
			///////			
			// LOAD
			///////
			case $right.find('div.JAG_Load')[0]:
				JAG.Load.loading=true;		

				// ACTIVATE INPUTS AND UPDATE TEXT
				$left.find('input').removeClass('JAG_disabledInput')
				$title.html('Select a game slot to load');
			break;
			
			
			//////////////////
			// LOAD CHECKPOINT
			//////////////////
			case $right.find('div.JAG_Checkpoint')[0]:
				if($(this).hasClass('JAG_no_checkpoint')){ $title.html('Checkpoint not found.'); return; };
				JAG.OBJ.$Game.loadGame(JAG, 'CHECKPOINT');
			break;		
			
			
			/////////
			// DELETE
			/////////
			case $right.find('div.JAG_Delete')[0]:
				// ACTIVATE INPUTS AND UPDATE TEXT
				JAG.Load.deleting=true;			
				$left.find('input').removeClass('JAG_disabledInput')
				$title.html('Select a game slot to delete'); 
			break;
			
			
			/////////
			// CANCEL
			/////////
			case $right.find('div.JAG_Cancel')[0]:
				if(JAG.Load.saveORload) return;	
				JAG.OBJ.$Game.closeMenu(JAG); 
			break;
			
			///////
			// QUIT
			///////
			case $right.find('div.JAG_Quit')[0]:
				window.location.href=window.location.href;
			break;
			
			//////////
			// RESTART
			//////////
			case $right.find('div.JAG_Restart')[0]:
				$(this).restartGame(JAG);
			break;			
		};		
	});
},




/***********************************************************************************************/
// CLOSE LOAD/SAVE MENU
/***********************************************************************************************/
closeMenu:function(JAG){
	////////
	// RESET
	////////
	JAG.Load.deleting=JAG.Load.saving=JAG.Load.loading=JAG.Load.saveORload=false;
	JAG.FUNC.clrTimeout('menuTimer');


	/////////////////
	// MENU VARIABLES
	/////////////////
	var $saveMenu=JAG.OBJ.$Game.find('div.JAG_SaveMenu'),
		$overlay=$('#JAG_SaveMenu_Overlay');

		
	//////////////////////////////////////
	// FADEOUT MENU & OVERLAY, THEN REMOVE
	//////////////////////////////////////
	$saveMenu.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
		$overlay.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
			$saveMenu.add($overlay).remove();

			// INDICATE THAT SAVEMENU STATUS
			JAG.Story.showingSaveMenu=false;	
		}});
	}});	
},
	
	
	
	
/***********************************************************************************************/
// CHECK LOCALSTORAGE SUPPORT
/***********************************************************************************************/
supportsSave:function(){
  try{ return 'localStorage' in window && window.localStorage !== null;
  }catch(e){ return false; }
},




/***********************************************************************************************/
// SAVE GAME
/***********************************************************************************************/
saveGame:function(JAG, gameName){
	// CHECK SUPPORT & IF CURRENTLY SAVING/LOADING
	if(!$(this).supportsSave() || JAG.Load.saveORload) return;
	JAG.Load.saveORload=true;
	
	///////////////////////////////////////////////////////////////////////////////
	// THE GAMEID [MAIN ADVENTURE HTML ELEMENT] ALONG WITH THE NAME OF THE SAVEGAME
	// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
	// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
	///////////////////////////////////////////////////////////////////////////////
	var	gameID=JAG.OBJ.$Game[0].id,
		prefix=gameID+'~'+gameName+'~',
		$Chars=$('div.JAG_Char_El'),
		numChars=$Chars.length,
		$selectedChar=JAG.OBJ.$selectedChar,
		$Scene=JAG.OBJ.$currentScene,
		$Scenes=JAG.OBJ.$Game.find('li.JAG_Scene'),
		numScenes=$Scenes.length,
		lS=localStorage;
	
	
	
	///////////////////
	// I. GAME SETTINGS
	///////////////////
	// [ ADDON: MAPS ] CURRENT MARKER POSITION
	lS.setItem(prefix+'JAG_currentMarker', JAG.Story.currentMarker);
	// [ ADDON: TIMERS ] CURRENT RUNNING TIMERS
	lS.setItem(prefix+'JAG_Timers', JSON.stringify(JAG.Timers.puzzleTimers));
	lS.setItem(prefix+'JAG_TimerValues', JSON.stringify(JAG.Load.loadpuzzleTimers));
	// ARRAY OF ALL DEAD [ USED AND NOBODY IS CARRYING THEM ] ITEMS
	lS.setItem(prefix+'JAG_DeadItems', JAG.Story.DeadItems);
	// SAVE CURRENTLY SELECTED CHAR
	lS.setItem(prefix+'JAG_Selected_Char', JAG.FUNC.getName(JAG.OBJ.$selectedChar));
	
	
	
	/////////////////////////
	// II. CHARACTER SETTINGS
	/////////////////////////
	for(var i=0; i<numChars; i++){
		var $thisChar=$($Chars[i]),
			thisCharName=JAG.FUNC.getName($thisChar),
			thisCharData=JAG.DATA.Chars[thisCharName];
			
		// SAVE THIS CHARACTER'S STATS
		if($('#JAG_ID_Char_'+thisCharName).data('stats')){
			lS.setItem(prefix+'JAG_Stats_'+thisCharName, JSON.stringify($('#JAG_ID_Char_'+thisCharName).data('stats')));
		};
		
		// [ ADDON ] SOLVED RIDDLE
		if($thisChar.data('solvedRiddle')) lS.setItem(prefix+'JAG_CharData_'+thisCharName+'_solvedRiddle', $thisChar.data('solvedRiddle'));
		
		// SAVE WHERE THIS CHARACTER HAS BEEN
		lS.setItem(prefix+'JAG_CharData_'+thisCharName+'_been_to', JSON.stringify($('#JAG_ID_Char_'+thisCharName).data('been_to')));
		
		// MAIN CHARACTER
		if($thisChar[0]===$selectedChar[0]){
			// CHARACTER'S POSITION AND DIRECTION
			lS.setItem(prefix+'JAG_CharX', ($selectedChar.css('left').pF()/JAG.DATA.sD.sceneW)*100);
			lS.setItem(prefix+'JAG_CharY', ($selectedChar.css('top').pF()/JAG.DATA.sD.sceneH)*100);
			lS.setItem(prefix+'JAG_CharDirection', thisCharData.direction);
		};
	};



	//////////////////////
	// III. SCENE SETTINGS
	//////////////////////
	// SAVE CURRENT SCENE AND PAN POSITION FOR SCALING
	lS.setItem(prefix+'JAG_CurrentScene', $Scene[0].id.clean());
	lS.setItem(prefix+'pan_pos', $Scene.css('margin-left'));
	lS.setItem(prefix+'pan_pos_width', $Scene.css('width').pF());
	// SAVE CURRENT DAY/NIGHT POSITION
	lS.setItem(prefix+'day_night_time', JAG.OBJ.$DayNight ? JAG.OBJ.$DayNight.css('opacity') : 0);
	
	
	//////////////////////////
	// LOOP THROUGH ALL SCENES
	//////////////////////////
	var $Scenes=$('li.JAG_Scene'),
		numScenes=$Scenes.length;
	for(var i3=0; i3<numScenes; i3++){
		var $thisScene=$($Scenes[i3]),
			sceneName=$thisScene[0].id.clean();
		
		////////////////////////////////
		// SAVE CURRENT BACKGROUND IMAGE
		////////////////////////////////
		if($thisScene.find('img.JAG_Background').length){
			var bgImg=$thisScene.find('img.JAG_Background')[0].src;
			lS.setItem(prefix+'_'+sceneName+'_savedBG',	bgImg.substring(bgImg.lastIndexOf('/scenes/'), bgImg.length).replace('/scenes/',''));
		};
		
		///////////////////////////////
		// SAVE CURRENT FORGROUND IMAGE
		///////////////////////////////		
		if($thisScene.find('div.JAG_Foreground').length){
			var foreImg=$thisScene.find('div.JAG_Foreground').find('img')[0].src;
			lS.setItem(prefix+'_'+sceneName+'_savedFG', foreImg.substring(foreImg.lastIndexOf('/scenes/'), foreImg.length).replace('/scenes/',''));
		};
		
		////////////////////
		// SAVE CURRENT PATH
		////////////////////		
		if($thisScene.data('scene').path){
			var path=$thisScene.data('scene').path;
			lS.setItem(prefix+'_'+sceneName+'_savedPath', path.substring(path.lastIndexOf('/scenes/'), path.length).replace('/scenes/',''));		
		};
		
		
		////////////////////////////////////////
		// LOOP THROUGH CHARACTERS IN THIS SCENE
		////////////////////////////////////////
		for(var i4=0; i4<numChars; i4++){
			var $thisChar=$($Chars[i4]),
				thisCharName=JAG.FUNC.getName($thisChar),
				$el=$thisScene.find('div.JAG_Char_Settings_'+thisCharName);

			/////////////////////////////
			// SAVE SCENE ENTRANCE REPEAT
			/////////////////////////////
			if($el.length && $el.data('entrance_fired')){
				lS.setItem(prefix+'_'+sceneName+'_entrance_fired', $el.data('entrance_fired'));		
			};
		};
	};
	


	/////////////////////////
	// LOOP THROUGH ALL ITEMS
	/////////////////////////
	var $Items=$('div.JAG_Item'),
		numItems=$Items.length;
	for(var i5=0; i5<numItems; i5++){
		var $Item=$($Items[i5]),
			itemName=JAG.FUNC.getItemName($Item);
				
		// TRACK WHO CURRENTLY HAS THIS ITEM
		lS.setItem(prefix+'_'+itemName+'_carried_by', $Item.data('carried_by'));

		// SAVE ITEM DATA
		lS.setItem(prefix+'_'+itemName+'_itemData', JSON.stringify(JAG.DATA.Items[itemName]));
		
		// SAVE ITEM VISIBILITY
		lS.setItem(prefix+'_'+itemName+'_itemVisibility', $Item.css('visibility'));
		
		// [ ADDON ] SOLVED RIDDLE
		if($Item.data('solvedRiddle')) lS.setItem(prefix+'_'+itemName+'_solvedRiddle', $Item.data('solvedRiddle'));
		
		// SAVE CURRENT SPRITE FOR THIS ITEM [ FROM CHANGE_SPRITE SECONDARY ACTION ]
		if($Item.find('img').length){
			var imgPath=$Item.find('img')[0].src;
			lS.setItem(prefix+'_'+itemName+'_item_sprite', imgPath.substring(imgPath.lastIndexOf('/items/'), imgPath.length).replace('/items/',''));
		}else{
			lS.setItem(prefix+'_item_sprite', false);
		};
	};
	

	/////////////////////////
	// SAVE GAME & CLOSE MENU
	/////////////////////////
	$('div.JAG_SaveMenu').find('p').text('Saving Game...');
	JAG.Timers.menuTimer=setTimeout(function(){
		JAG.FUNC.clrTimeout('menuTimer');
		JAG.OBJ.$Game.closeMenu(JAG);
	}, 800);
},








/***********************************************************************************************/
// LOAD GAME - LOGGING - for(var key in localStorage){ console.log(key + ':' + localStorage[key]); };
/***********************************************************************************************/
loadGame:function(JAG, gameName){
	// CHECK LOCALSTORAGE SUPPORT & IF CURRENTLY SAVING/LOADING
	if(!$(this).supportsSave() || JAG.Load.saveORload) return; 
	JAG.Load.saveORload=true;
	var href=window.location.href;


	//////////////////////////////////////////////////////////////
	// RESTART THE PAGE TO FLUSH ALL ITEMS/INVENTORY, CLASSES, ETC
	//////////////////////////////////////////////////////////////
	if(href.indexOf('?save_game') <= 0){
		$('div.JAG_SaveMenu').find('p.save_text').text('Loading Game...');
		JAG.Timers.menuTimer=setTimeout(function(){
			window.location.href+='?save_game='+gameName.replace(/ /g,'+');
		}, 1000);
		
		

	//////////////////////////
	// LOAD GAME AFTER FLUSHED
	//////////////////////////
	}else{
		/////////////////////////////////////////////////////////////////////////////////
		// THE GAMEID [ MAIN ADVENTURE HTML ELEMENT ] ALONG WITH THE NAME OF THE SAVEGAME
		// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
		// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
		/////////////////////////////////////////////////////////////////////////////////
		var	gameID=JAG.OBJ.$Game.attr('id'),
			lS=localStorage,
			prefix=gameID+'~'+gameName.replace(/\+/g,' ')+'~',
			$currentScene=$('#'+lS.getItem(prefix+'JAG_CurrentScene')),
			$Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
			numScenes=$Scenes.length,
			$teaser=$('#JAG_Teaser'),
			$Chars=$('div.JAG_Char_El'),
			numChars=$Chars.length,
			$selectedChar=JAG.OBJ.$selectedChar;


		///////////////////////////////////////////////////////////////////////
		// I. UPDATE SETTINGS THAT NEED TO TAKE AFFECT BEFORE LOADING THE SCENE
		///////////////////////////////////////////////////////////////////////
		// LOOP ALL GAME CHARACTERS
		for(var i=0; i<numChars; i++){
			var $thisChar=$($Chars[i]),
				thisCharName=JAG.FUNC.getName($thisChar);
			
			// LOAD THIS CHARACTER'S STATS
			if(lS.getItem(prefix+'JAG_Stats_'+thisCharName)){
				$thisChar.data('stats', JSON.parse(lS.getItem(prefix+'JAG_Stats_'+thisCharName)));
			};		
			
			// LOAD THIS CHARACTER'S BEEN_TO
			$thisChar.data('been_to', lS.getItem(prefix+'JAG_CharData_'+thisCharName+'_been_to'));
			
			// [ ADDON ] LOAD THIS CHARACTER'S SOLVEDRIDDLE
			$thisChar.data('solvedRiddle', lS.getItem(prefix+'JAG_CharData_'+thisCharName+'_solvedRiddle'));

			// MAIN CHARACTER
			if($thisChar[0]===$selectedChar[0]){
				// CHARACTER'S POSITION AND DIRECTION ON SCREEN 
				JAG.Load.CharX=lS.getItem(prefix+'JAG_CharX').pF();
				JAG.Load.CharY=lS.getItem(prefix+'JAG_CharY').pF();
				JAG.Load.CharDirection=lS.getItem(prefix+'JAG_CharDirection');
			};
		};
		
					
					
		///////////////////////////////////////////////
		// GET SCENE PAN POSITION AND DAY/NIGHT OPACITY
		///////////////////////////////////////////////
		JAG.Load.pan_pos=lS.getItem(prefix+'pan_pos');
		JAG.Load.pan_pos_width=lS.getItem(prefix+'pan_pos_width');		
		JAG.Load.DayNightOpacity=lS.getItem(prefix+'day_night_time');
		// [ ADDON: MAPS ] CURRENT MARKER POSITION
		JAG.Story.currentMarker=lS.getItem(prefix+'JAG_currentMarker');


		/////////////////////////////////////////////
		// III. LOAG GAME > TRANSITION TO SAVED SCENE
		/////////////////////////////////////////////
		// REMOVE TEASER SCREEN
		if($teaser.length){
			$teaser.animate({'opacity':0},{duration:400,queue:false,complete:function(){ 
				JAG.startTime(JAG);
				$teaser.remove(); 
				
				
				////////////////////////////////////////////////////////////////////
				// UPDATE REFERENCES [ RESETSCENE HAPPENS AT END OF PRELOADGAME(); ]
				////////////////////////////////////////////////////////////////////
				JAG.OBJ.$currentScene=$currentScene;
				JAG.OBJ.$currentChapter=JAG.OBJ.$currentScene.parents('ul:first');
				
				
				///////////////
				// PRELOAD GAME
				///////////////
				JAG.Load.play_entrance=false;
				JAG.preloadGame(JAG);
				
				
				///////////////////////////////////////////
				// [ ADDON: TIMERS ] CURRENT RUNNING TIMERS
				///////////////////////////////////////////
				if($.isFunction($.fn.startPuzzleTimer)){
					var orgTimerSettings=JSON.parse(lS.getItem(prefix+'JAG_TimerValues')),
						remainingTime=JSON.parse(lS.getItem(prefix+'JAG_Timers'));

					/////////////////////////////
					// LOOP THROUGH TIMERS OBJECT
					/////////////////////////////
					for(var key in orgTimerSettings){
		 				if(orgTimerSettings.hasOwnProperty(key)){
							// GET THE TIMER NAME
							var timerName=orgTimerSettings[key].split('||')[0].clean(),
								// REFERENCE remaingTime FOR TIME REMAINING
								// PASS IT IN AS 00/00/00/00 FORMAT
								timeLeft=remainingTime[timerName].split(':').reverse(),
								days=timeLeft[3] || '00', hours=timeLeft[2] || '00',
								minutes=timeLeft[1] || '00', seconds=timeLeft[0] || '00';
							$(this).startPuzzleTimer(JAG, orgTimerSettings[key], days+'/'+hours+'/'+minutes+'/'+seconds);
						};
					};
				};					
				
			}});
		};
	};
},






/***********************************************************************************************/
// RESTART GAME TO TITLESCREEN
/***********************************************************************************************/
restartGame:function(JAG){
	var href=window.location.href;



	//////////////////////////////////////////////////////////////
	// RESTART THE PAGE TO FLUSH ALL ITEMS/INVENTORY, CLASSES, ETC
	//////////////////////////////////////////////////////////////
	if(href.indexOf('?restart')<=0){
		$('div.JAG_SaveMenu').find('p.save_text').text('Restarting...');
		JAG.Timers.menuTimer=setTimeout(function(){
			window.location.href=window.location.href+'?restart';
		}, 700);



	/////////////////////////////
	// RESTART GAME AFTER FLUSHED
	/////////////////////////////
	}else{
		// REMOVE RESTART FROM URL
		var trim=href.substr(href.indexOf('?restart')),
			$teaser=$('#JAG_Teaser');
		window.history.pushState('', '', href.replace(trim,''));		
		
		// REMOVE TEASER SCREEN
		if($teaser.length){
			$teaser.animate({'opacity':0},{duration:400,queue:false,complete:function(){ 
				JAG.startTime(JAG);
				$teaser.remove(); 		
		
				// JUMP TO APPROPRIATE SCENE
				JAG.OBJ.$currentScene=$('#titlescreen');
				JAG.preloadGame(JAG);
			}})
		};
	};	
}});