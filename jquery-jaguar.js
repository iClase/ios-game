/*********************************************************************************************/
// $Jaguar v5.5 || Crusader12
/*********************************************************************************************/	
;(function($){
var Jaguar={
	/////////////////////////////
	// REFERENCE TO HTML ELEMENTS
	/////////////////////////////
	OBJ:{
		$Game:false,				// MAIN GAME CONTAINER/VIEWPORT
		$selectedChar:false,		// CURRENT CHARACTER ELEMENT
		$currentScene:false,		// CURRENT SCENE LIST ITEM
		$currentChapter:false,		// CURRENT CHAPTER UL ITEM
		$currentItem:false,			// LAST CLICKED ITEM
		$selectedItem:false,		// ITEM IN ACTION [ GIVE/USE ]
		$selectedExit:false,		// CLICKED EXIT
		$canvas:false,				// CANVAS/WALKING PATH ELEMENT
		$foreground:false,			// SCENE FOREGROUND
		$Dialogue:false,			// QUESTIONS CONTAINER
		$Subtitle:false,			// SCENE SUBTITLE
		$dBar:false,				// DESCRIPTION BAR
		$Inv:false,					// INVENTORY
		$Panel:false,				// LOWER GAME PANEL
		$Debug:false,				// DEBUG POPUP
		$Music:false,				// MUSIC AUDIO TAG
		$Ambient:false,				// AMBIENT SOUND TAG
		$Effect:false,				// EFFECT AUDIO TAG
		$Voice:false,				// VOICE AUDIO TAG
		$DayNight:false,			// DAY/NIGHT CYCLE LAYER
		$Weather:false,				// WEATHER EFFECTS CANVAS
		$Fog:false,					// FOG EFFECTS CANVAS
		$Cursor:false,				// ANIMATED CURSOR
		$SaveMenu:false,			// SAVE/LOAD MENU
		$Stats:false,				// PLAYER STATS MENU
		exitItems:[],				// ARRAY OF EXIT ITEMS WITHIN THE SCENE
		$defender:false,			// [ ADDON ] CURRENT CHARACTER DEFENDING
		$attacker:false				// [ ADDON ] CURRENT CHARACTER ATTACKING
	},

	
	
	//////////////////////////
	// MAIN JAGUAR DATA OBJECT
	//////////////////////////
	DATA:{
		gD:false,					// MERGED GAME DATA
		sD:false,					// MERGED SCENE DATA
		Chars:{},					// CURRENT DATA FOR ALL GAME CHARACTERS AND THEIR SETTINGS		
		Inv:{},						// CURRENT INVENTORY FOR EACH CHARACTER [ AVOID MERGING ]
		Items:{}					// CURRENT DATA FOR ALL GAME ITEMS SCENENAME_ITEMNAME
	},
	


	/////////////////////////////
	// SHORTCUT UTILITY FUNCTIONS
	/////////////////////////////
	FUNC:{
		// CLEAR TIMERS AND INTERVALS
		clrTimeout:function(timerName){ clearTimeout(Jaguar.Timers[timerName]); Jaguar.Timers[timerName]=false; },
		clrInterval:function(timerName){ clearInterval(Jaguar.Timers[timerName]); Jaguar.Timers[timerName]=false; },
		
		// MAKE SURE NO TIMERS ARE RUNNING BEFORE CONTINUING
		noTimersRunning:function(){
			return (Jaguar.Timers.TalkTimer===false && Jaguar.Timers.fullyLoadedTimer===false && 
				    Jaguar.Timers.NotAllowedTimer===false && Jaguar.Timers.ActionTimer===false && 
					Jaguar.Timers.riddleTimer===false && Jaguar.Timers.cutSceneTimer===false && 
					Jaguar.Timers.rumbleTimer==false && Jaguar.Timers.swapCharTimer===false); 
			},
			
		// MAKE SURE NO WINDOWS ARE OPEN BEFORE CONTINUING
		noWindows:function(){ 
			return (!Jaguar.Story.showingSaveMenu && !Jaguar.Story.showingStats && 
				    !Jaguar.Story.showingDebug && !Jaguar.Story.showingCharSelect); 
			},

		// MAKE SURE JAGUAR IS NOT ON A SPECIAL SCENE BEFORE CONTINUING
		noSpecialScene:function(){ 
			return (Jaguar.OBJ.$currentScene[0].id!=='credits' && Jaguar.OBJ.$currentScene[0].id!=='titlescreen' && 
				    !Jaguar.DATA.sD.cutscene && !Jaguar.DATA.sD.map && !$('#JAG_Teaser').length && 
					!$('#JAG_Riddle_Answer').is(':visible')); 
			},

		// CHECK IF CURRENT SCENE IS A CUTSCENE
		isCutscene:function(){ return (Jaguar.DATA.sD.cutscene || Jaguar.DATA.sD.map || $('#JAG_Teaser').length); },
		
		// CHECK IF VALUE HAS BEEN PROVIDED
		hasVal:function(value){ return (value!=null && value!=undefined); },
		
		// GET RANDOM NUMBER
		getRandomNumber:function(min,max){ return Math.floor(Math.random()*(max - min)+min); },
		
		// GET CHARACTER'S NAME
		getName:function($Char){ return $Char[0].id.replace('JAG_ID_Char_','').clean(); },
				
		// GET ITEM'S NAME
		getItemName:function($Item){ return $Item[0].id.replace('JAG_ID_','').clean(); },
		
		// CHECK TO SEE IF SCENE CAN BE LEFT
		canExitScene:function(){ 
			return (!Jaguar.Story.talking && !Jaguar.Story.isPaused && !Jaguar.Story.switchingScenes && !Jaguar.Story.showingCharSelect); 
		},
		
		// GET ELEMENT TYPE [ CHARACTER OR ITEM ]
		elType:function($El){ 
			return $El.hasClass('JAG_Char_El') ? Jaguar.DATA.Chars[Jaguar.FUNC.getName($El)] : Jaguar.DATA.Items[$El[0].id.replace('JAG_ID_','')]; 
		}
	},

	
	
	
	////////////////////////////
	// SAVEGAME REFERENCE OBJECT
	////////////////////////////
	Load:{
		saveORload:false,	    	// CURRENTLY SAVING/LOADING A GAME [ INSIDE MENU ]
		loading:false,				// FLAGS LOADING GAME [ INSIDE MENU ]
		saving:false,				// FLAGS SAVING GAME [ INSIDE MENU ]
		deleting:false,				// FLAGS DELETING GAME [ INSIDE MENU ]
		$slot:false,				// SELECTED GAME SLOT [ INSIDE MENU ]
		slot_name:false,			// NAME OF SAVE GAME [ INSIDE MENU - USED TO SEE IF PLAYERS CHANGE THE SAVEGAME NAME ]
		game_name:false,			// NAME OF SAVE GAME [ USED THROUGHOUT JAGUAR ]
		CharX:false,				// X POSITION FOR CHAR TO RETURN TO ['LEFT']
		CharY:false,				// Y POSITION FOR CHAR TO RETURN TO ['TOP']
		CharDirection:false,		// DIRECTION FOR CHAR TO RETURN TO
		DayNightOpacity:false,		// SETS THE OPACITY OF THE DAY/NIGHT CYCLE LAYER
		pan_pos:false,				// GETS THE PAN POS IN PX
		pan_pos_width:false,		// GETS THE SAVED PANNED SCENE WIDTH [ FOR SCALING CALCULATION ]
		play_entrance:true,			// DON'T PLAY ENTRANCES WHEN LOADING A SCENE
		loadpuzzleTimers:{}			// [ ADDON: TIMERS ] STORES ORIGINAL VALUE STRING TO RESTART TIMERS
	},
	
	
	
	////////////////////////////////////////////////////
	// SCALING OBJECT [ HOLDS REFERENCES TO DIMENSIONS ]
	////////////////////////////////////////////////////
	Scaling:{
		baseDimensions:'0,0',		// BASE VIEWPORT DIMENSIONS [ USED TO COMPARE NEW DIMENSIONS AGAINST ]
		orgImgW:0,					// ORIGINAL IMAGE DIMENSIONS [ USED IN SCENE SCALING ]
		orgCharW:0,					// ORIGINAL CHARACTER IMAGE DIMENSIONS [ USED IN CHARACTER SCALING ]
		orgCharH:0,					// ORIGINAL CHARACTER IMAGE DIMENSIONS [ USED IN CHARACTER SCALING ]
		gameScaled:1				// REFERENCE TO THE % THAT GAME IS SCALED - USED ON JAG_ADVENTURE FONT-SIZE
	},
	
	
	
	////////////////////////////////////////////////////////////
	// INTERNAL TIMERS [ HOLDS REFERENCES TO ALL JAGUAR TIMERS ]
	////////////////////////////////////////////////////////////
	Timers:{
		currentTime:0,				// RAF IS USED TO CONSTANTLY UPDATE THIS AS A MASTER TIME REFERENCE
		DayNightTimer:false,		// SETINTERVAL TIMER FOR DAY/NIGHT CYCLE
		WeatherTimer:false,			// SETINTERVAL TIMER FOR WEATHER EFFECTS
		FogTimer:false,				// SETINTERVAL TIMER FOR FOG EFFECTS
		cutSceneTimer:false,		// SETINTERVAL TIMER FOR CUTSCENE DISPLAY
		riddleTimer:false,			// [ ADDON ] SETINTERVAL TIMER FOR RIDDLE ANSWER BOX DISPLAY ]
		fullyLoadedTimer:false,		// SETINTERVAL TIMER FOR LOADING ALL ELEMENTS IN A SCENE		
		NotAllowedTimer:false,		// SETINTERVAL TIMER FOR NOT-ALLOWED CURSOR		
		ActionTimer:false,			// SETINTERVAL TIMER FOR SWAPPING ACTION SPRITES
		TalkTimer:false,			// SETINTERVAL TIMER FOR CHARACTER TALKING
		subtitleTimer:false,		// SETTIMEOUT TIMER FOR SUBTITLE TEXT
		rumbleTimer:false,			// SETTIMEOUT TIMER FOR RUMBLE EFFECT
		menuTimer:false,			// SETTIMEOUT USED TO CLOSE SAVE/LOAD MENU [ FILE SIMULATION ]
		windowResizeTimer:false,	// SETTIMEOUT TO ACHIEVE WINDOW RESIZEEND EVENT
		waitForIt:false,			// SETTIMEOUT USED WITH WALK_TO ENTRANCE ACTIONS
		checkpoint:false,			// SETTIMEOUT USED TO CREATE A DELAY BEFORE SAVING CHECKPOINT
		jumpSceneTimer:false,		// SETTIMEOUT USED WITH JUMPING SCENES
		swapCharTimer:false,		// SETTIMEOUT USED TO PREVENT RAPID CHARACTER SWAPPING
		MapTravelTimer:false,		// [ ADDON ] DELAY USED WHEN TRAVLING BETWEEN MAP DESTINATIONS
		puzzleTimers:{},			// [ ADDON ] ARRAY CONTAINING CURRENT PUZZLE-BASED TIMERS		
		puzzleTimer:{},				// [ ADDON ] PUZZLE TIMERS
		attackTimer:false			// [ ADDON ] TURN-BASED RPG ATTACK TIMER
	},
	
	
	
	//////////////////////////////////////////
	// STORYLINE EVENT SWITCHES	AND CONDITIONS
	//////////////////////////////////////////
	Story:{
		isPaused:false,				// IF THE GAME IS CURRENTLY PAUSED
		showingSaveMenu:false,		// IF SAVE/LOAD MENU IS VISIBLE
		showingStats:false,			// IF PLAYER STATS MENU IS VISIBLE
		showingDebug:false,			// IF DEBUG CONSOLE IS VISIBLE
		showingCharSelect:false,	// IF CHARACTER SELECTION IS VISIBLE
		switchingScenes:false,		// IF THE GAME IS CURRENTLY TRANSITIONING SCENES
		Day:true,					// INDICATES IF DAY
		ActionWord:false,			// CURRENT ACTION WORD IN DESCRIPTION BAR [ AS INDEX OF VERB 0-8 ]
		joinWord:false,				// INDICATES THE JOIN WORD 'TO' OR 'WITH' IS ON
		currentSong:false,			// INDICATES NAME OF CURRENT MUSIC TRACK
		currentAmbient:false,		// INDICATES NAME OF CURRENT AMBIENT SOUND TRACK
		DeadItems:[],				// ARRAY OF ITEMS THAT HAVE BEEN USED/DESTROYED [ LOADING ]		
		invCount:8,					// NUMBER OF VISIBLE INVENTORY ITEMS AT ONCE [ INTERFACE ]
		stopRumble:false,			// INDICATES IS RUMBLE SHOULD STOP WHEN MOVING TO NEXT SCENE	
		currentMarker:false,		// [ ADDON ] USED TO REFERENCE THE CURRENT ACTIVE MAP MARKER
		walking:false,				// INDICATES A CHARACTER IN THIS SCENE IS WALKING
		talking:false,				// INDICATES THAT A CHARACTER IS TALKING		
		swappingChar:false,			// INDICATES THAT JAGUAR IS SWAPPING A CHARACTER
		inBattle:false,				// [ ADDON ] INDICATES THAT THE CHARACTER IS IN BATTLE MODE
		attack:false,				// [ ADDON ] INDICATES A CHARACTER IS CURRENTLY ATTACKING
		heroTurn:true,				// [ ADDON ] INDICATES IT IS THE HERO'S TURN TO ATTACK
		attackPosX:0,				// [ ADDON ] THE X% POSITION THE ATTACKER WALKS TO
		attackPosY:0				// [ ADDON ] THE Y% POSITION THE ATTACKER WALKS TO
	},	
	
	
	
	//////////////////////////////////////////////////////////////////
	// PROPERTIES OF HOW CHARACTER SHOULD ACT WHEN ENTERING NEXT SCENE
	//////////////////////////////////////////////////////////////////
	NEXT:{
		pos:false,					// INTERNAL REFERENCE FOR NEXT_POS SETTING
		image:false,				// INTERNAL REFERENCE FOR NEXT_IMG SETTING
		direction:false,			// INTERNAL REFERENCE FOR NEXT_DIR SETTING
		pan_pos:false,				// INTERNAL REFERENCE FOR NEXT_PAN SETTING
		walk_to:false				// INTERNAL REFERENCE FOR NEXT_WALK_TO SETTING		
	},
	
	
	
	
	
	/*********************************************************************************************/
	// PLUGIN SETTINGS -- USER CONFIGURABLE
	/*********************************************************************************************/	
	
	
	////////////////////////////////////////////////
	// GENERIC DIAGLOGUE LINES [ MERGES WITH ITEMS ]	
	////////////////////////////////////////////////
	Speech:{
		give_text:	   "I don't think that will work.",
		open_text: 	   "I can't open that.",
		close_text:    "I can't close that.",
		pick_up_text:  "I can't pick that up.",
		look_at_text:  "I don't see anything special about it.",
		talk_to_text:  "Hmm, no response.",
		use_text: 	   "That won't work.",
		push_text: 	   "It won't budge.",
		pull_text: 	   "It isn't moving.",
		// INVENTORY GIVE TEXT IS USED WHEN AN ITEM CANNOT BE GIVEN
		inv_give_text: "That isn't working.", 
		inv_open_text:    "It isn't opening.",
		inv_close_text:   "It isn't closing.",
		inv_pick_up_text: "I already have that.",
		inv_look_at_text: "I don't see anything special about it.",
		inv_talk_to_text: "It doesn't want to talk to me.",
		inv_use_text: 	  "That doesn't seem to work.",
		inv_push_text: 	  "It doesn't seem like that would work.",
		inv_pull_text: 	  "I don't see anything to pull.",
		// MISC
		too_far: "You're not close enough.",
		talk_no_more_text: "They don't seem to want to talk anymore.",
		not_ready_text: "It isn't quite ready.",
		riddle_correct_text: "That is correct.",
		riddle_incorrect_text: "That is incorrect.",
		// [ ADDON ] TALKIE SPEECH SETTINGS
		give_voice: false, open_voice: false, close_voice: false, pick_up_voice: false,
		look_at_voice: false, talk_to_voice: false, use_voice: false, push_voice: false, pull_voice: false,
		inv_give_voice: false, inv_open_voice: false, inv_close_voice: false, inv_pick_up_voice: false,
		inv_look_at_voice: false, inv_talk_to_voice: false, inv_use_voice: false, inv_push_voice: false, inv_pull_voice: false,
		too_far_voice: false, talk_no_more_voice: false, not_ready_voice: false, riddle_correct_voice: false, riddle_incorrect_voice: false
	},
	
	
	
	//////////////////////////////////////////////////////////////
	// GENERIC ACTIONS OBJECT [ MERGED WITH CHARACTERS AND ITEMS ]
	// NOTE: THERE IS NO INV_GIVE
	//////////////////////////////////////////////////////////////
	Actions:{
		give:	 	 false,		
		open:    	 false,
		inv_open:	 false,		
		close:   	 false,
		inv_close:	 false,
		pick_up: 	 false,
		inv_pick_up: false,
		look_at: 	 true,
		inv_look_at: true,
		talk_to: 	 false,
		inv_talk_to: false,
		use:     	 false,
		inv_use:	 false,
		push:    	 false,
		inv_push:	 false,
		pull:    	 false,
		inv_pull:	 false	
	},
	
	
	
	////////////////////////////////////////////////////////////
	// CHARACTER SETTINGS [ APPLIES TO MAIN AND AUX CHARACTERS ]
	////////////////////////////////////////////////////////////
	Character:{
		// INTERNAL SETTINGS
		callback:false,				// FUNCTION TO CALL WHEN DONE WALKING
		action:false,				// THIS CHARACTER IS PERFORMNING AN ACTION
		lastValidX:0,				// LAST VALID IN-BOUNDARY X COORDINATES [ BOUNDARY DETECTION ]
		lastValidY:0,				// LAST VALID IN-BOUNDARY Y COORDINATES [ BOUNDARY DETECTION ]
		loaded:false,				// COMPLETED SPRITE IMAGE LOADING
		conversation:false,			// INDICATES CHARACTER IS HAVING A PLAY_CONVERSATION
		current_location:false,		// SCENE ID WHERE CHARACTER IS CURRENTLY LOCATED
		// GENERAL SETTINGS
		start_scene:false,			// SCENE CHARACTER STARTS GAME IN
		stats:[],					// HOLDS USER-CREATED STATS [ GENERATED IN BUILDSTATS METHOD > CHARACTERS.JS MODULE ]
		layer:true,					// DISABLES LAYERING OF AUX CHARACTERS 
		scale:'0.25,0.75',			// MINIMUM/MAXIMUM SCALABLE CHARACTER SIZE
		pos:'0,0',					// INITIAL STARTING POSITION FOR CHARACTER
		entrance:false,				// PERFORM SECONDARY ACTIONS WHEN CHARACTER ENTERS SCENE
		speed:6500,					// CHARACTER TRAVEL SPEED
		y_speed:1.75,				// A FACTOR TO REDUCE SPEED PROPORTIONATELY ALONG THE Y AXIS
		text_color:'#FFF',			// THIS CHARACTER'S DIALOGUE TEXT COLOR
		voice_volume:1,				// [ ADDON ] THIS CHARACTER'S TALKIE VOICE VOLUME
		proximity:150,				// CLOSEST PIXEL DISTANCE FROM CHARACTER TO AUX CHARACTER BEFORE ACTION CAN OCCUR
		hidden:false,				// DETERMINES CHARACTER'S VISIBILITY
		done_talking:false,			// ARRAY OF SECONDARY ACTIONS TO PERFORM WHEN DONE TALKING TO CHARACTER [ ALL QUESTIONS ]
		play_conversation:false,	// PLAYS COMPLETE CONVERSATION THROUGH WHEN TALKING TO CHARACTER
		direction:'right',			// DIRECTION THIS CHARACTER IS FACING
		show_name:true,				// SHOW/HIDE TEXT OF THIS CHARACTER WHEN HOVERED [ OR USE CUSTOM TEXT ]
		action_time:350,			// DEFAULT TIME IT TAKES TO EXECUTE VERB ACTION [ ARRAY OF VERBS ]
		text_time:60,				// SPEED THAT THIS CHARACTER'S TEXT IS DISPLAYED [ PER LETTER ]	
		text_follow:true,			// IF TEXT SHOULD FOLLOW CHARACTER WHEN WALKING
		battle_die_sound:false,		// [ ADDON ] SOUND PLAYED WHEN CHARACTER DIES IN COMBAT
		battle_attack_sound:false,	// [ ADDON ] SOUND PLAYED WHEN CHARACTER ATTACKS IN COMBAT
		// CHARACTER SPRITES
		image:false, up:false,	down:false,	right:false, left:false, 										// MAIN SPRITES
		give_image:false, give_up:false, give_down:false, give_right:false, give_left:false,				// GIVE SPRITES
		open_image:false, open_up:false, open_down:false, open_right:false, open_left:false,				// OPEN SPRITES
		close_image:false, close_up:false, close_down:false, close_right:false, close_left:false,			// CLOSE SPRITES
		pick_up_image:false, pick_up_up:false, pick_up_left:false, pick_up_right:false, pick_up_down:false,	// PICK UP SPRITES
		look_image:false, look_right:false, look_up:false, look_left:false, look_down:false,				// LOOK SPRITES
		talk_image:false, talk_up:false, talk_left:false, talk_right:false, talk_down:false,				// TALKING SPRITES
		use_image:false, use_up:false, use_down:false, use_left:false, use_right:false,						// USE SPRITES
		push_image:false, push_up:false, push_down:false, push_left:false, push_right:false,				// PUSH SPRITES
		pull_image:false, pull_up:false, pull_down:false, pull_right:false,	pull_left:false					// PULL SPRITES		
	},
	
	
	
	/////////////////
	// SCENE SETTINGS
	/////////////////
	Scene:{
		// INTERNAL SETTINGS
		pathData:false,				// ARRAY CONTAINING BLACK/WHITE PIXELS
		fogLoaded:false,			// INTERNAL REFERENCE IF FOG IMAGE IS ENTIRELY LOADED
		path:false,					// FALSE LOADS BACKGROUND FILENAME_PATH IMAGE [ USED FOR PATH SWAPPING ]
		// GENERAL SCENE SETTINGS
		background:false, 			// THE BACKGROUND IMAGE FOR A SCENE
		foreground:false,			// THE FOREGROUND IMAGE FOR A SCENE
		speed:'300,200',			// TRANSITION SPEED FOR SCENES [ IN,OUT ]
		pan:false,					// IF THIS IS A PANNING SCENE [ TRUE/FALSE ]
		pan_pos:0,					// SETS INITIAL PAN POSITION [ % TO PAN TO ]
		horizon:'50,90',			// DEFINES THE HORIZON LINE/GROUND LINE [ WHICH CONTROLS SCALING AREA OF CHARACTERS ]
		death_speed:'250,250',		// ANIMATION TIMING FOR DEATH OVERLAY [ SCENE OUT, DEATH IN ]
		// SCENE SUBTITLE SETTINGS
		subtitle:false,				// SUBTITLE TEXT
		subtitle_speed:'1500,1500',	// SPEED/DISPLAY TIME - HOW LONG TO SHOW THE SCENE SUBTITLE (0=INFINITY)
		subtitle_repeat:false,		// DECIDES IF SUBTITLES SHOULD BE REPEATED WHEN RETURNING TO THIS SCENE
		subtitle_color:'#FFF',		// COLOR OF THIS SUBTITLE
		subtitle_pos:55,			// POSITION OF THIS [ % FROM TOP ]
		subtitle_size:150,			// SIZE OF THIS SUBTITLE [ SCALABLE FONT-SIZE % ]
		// SCENE AUDIO SETTINGS		
		music:false,				// BACKGROUND MUSIC MP3
		music_volume:1,				// VOLUME OF MUSIC IN THIS SCENE [ 0-1 ]
		music_vol_speed:1000,		// ANIMATION SPEED USED WHEN ADJUSTING MUSIC VOLUME
		music_time:false,			// JUMPS BACKGROUND TRACK TO SPECIFIC CUE IN MP3
		sync_music:true,			// SYNCS AUDIO TRACK WHEN RETURNING TO THIS SCENE [ SAVES CURRENT MP3 POSITION ]
		loop_music:true,			// LOOP BACKGROUND MUSIC FOR THIS SCENE
		ambient:false,				// AMBIENT EFFECTS MP3
		ambient_volume:1,			// VOLUME OF AMBIENT EFFECTS IN THIS SCENE [ 0-1 ]
		ambient_vol_speed:1000,		// ANIMATION SPEED USED WHEN ADJUSTING AMBIENT EFFECTS VOLUME
		sync_ambient:false,			// SYNCS AMBIENT TRACK WHEN RETURNING TO THIS SCENE [ SAVES CURRENT MP3 POSITION ]
		loop_ambient:true,			// LOOP AMBIENT EFFECTS FOR THIS SCENE
		// CUTSCENE SETTINGS
		cutscene:false,				// IF THIS SCENE IS A CUTSCENE
		next_scene:false,			// INDICATE THE NEXT CUTSCENE/SCENE TO ADVANCE TO
		show_inv:false,				// DETERMINES IS THE BOTTOM INVENTORY IS VISIBLE IN THIS CUTSCENE
		allow_click:false,			// ALLOWS CLICKING TO ADVANCE TO ANOTHER SCENE [ SCENE_ID ]
		display_time:0,				// TIME TO DISPLAY THIS CUTSCENE [ 0 FOR DISABLED ]
		skip_to:false,				// ADVANCES TO ANOTHER SCENE WHEN USER PRESSES SKIP_KEY [ SCENE_ID ]
		skip_key:13,				// KEY TO PRESS FOR SKIPPING THIS CUTSCENE [ DEFAULTS TO ENTER ]
		skip_text:false,			// DISPLAYS SKIP CUTSCENE TEXT
		advance_video_end:true,		// ADVANCE TO NEXT SCENE WHEN VIDEO ENDS
		// CREDITS SETTINGS
		roll_credits:false,			// ROLL CREDITS IN THIS SCENE
		credits_speed:35000, 		// SPEED OF ROLLING CREDITS
		repeat_credits:false,		// IF ROLLING CREDITS SHOULD BE REPEATED WHEN RETURNING TO THIS SCENE
		// DAY/NIGHT CYCLE EFFECTS
		day_night:false, 			// DAY/NIGHT CYCLING [ DAY LENGTH, NIGHT LENGTH, TRANSITION TIME ]
		indoor:false,				// INDICATES THAT THIS SCENE IS INDOORS AND DAY/NIGHT CYCLES SHOULDN'T BE VISIBLE
		day_night_image:false,		// IMAGE TO LOAD FOR DAY/NIGHT CYCLING LAYER [ FROM JAGUAR TILES ]
		night_color:'#000829',		// COLOR TO ANIMATE DAY/NIGHT LAYER TO DURING NIGHT
		day_night_opacity:'0,0.5',	// OPACITY TO ANIMATE LAYER TO 'DAY,NIGHT'
		// WEATHER EFFECTS
		weather:false,				// WEATHER TYPE [ RAIN OR SNOW ]
		weather_speed:15,			// WEATHER SPEED
		weather_density:700,		// SEVERITY OF WEATHER
		weather_opacity:0.7,		// OPACITY OF WEATHER EFFECTS CANVAS
		weather_color:["#FFFFFF","#ccffff"], // ARRAY OF COLORS FOR WEATHER EFFECTS PARTICLES	
		weather_size:'0.75,20',		// WEATHER PARTICLE SIZE [ RANDOM*FACTOR, MAXIMUM SIZE ]
		// FOG EFFECTS
		fog:false,					// FOG EFFECTS
		fog_image:114,				// FOG IMAGE TO LOAD [ FROM JAGUAR TILES ]
		fog_density:100,			// DENSITY OF FOG
		fog_speed:2,				// FOG MOVEMENT SPEED
		fog_opacity:0.75,			// OPACITY OF FOG LAYER
		// [ ADDON ] VERBS AND ACTIONS CUSTOMIZER
		verb_give: 'Give,true',		verb_pick_up: 'Pick up,true',	verb_use: 'Use,true',
		verb_open: 'Open,true',		verb_look_at: 'Look at,true', 	verb_push: 'Push,true',
		verb_close: 'Close,true',	verb_talk_to: 'Talk to,true',	verb_pull: 'Pull,true',
		// [ ADDON ] MAP CUSTSCENES
		map:false,					// INDICATES IF THIS SCENE IS A MAP CUTSCENE
		// [ ADDON ] FIRST PERSON
		first_person:false,			// ENABLES FIRST-PERSON PERSPECTIVE FOR THIS SCENE
		key_exits:'false,false,false,false', // MAPS KEYBOARD ARROWS TO EXITS [ BY ID ]
		// [ ADDON ] TURN-BASED COMBAT
		battle_orientation:'horizontal'	// ORIENTATION VERTICAL OR HORIZONTAL FOR BATTLE SCENES
	},
	
	
	
	////////////////
	// ITEM SETTINGS
	////////////////
	Item:{
		// INTERNAL SETTINGS
		loaded:false, 				// THIS ITEM HAS COMPLETED LOADING
		from_scene:false,			// NAME OF SCENE WHERE THIS ITEM ORIGINATED
		// GENERAL ITEM SETTINGS
		show_name:true,				// SHOW/HIDE TEXT OF THIS ITEM WHEN HOVERED [ OR USE CUSTOM TEXT ]
		play_conversation:false,	// PLAYS COMPLETE CONVERSATION THROUGH WHEN TALKING TO ITEM
		layer:true,					// INDICATES LAYER ITEM [ ALSO MANUALLY SETS ITEM ZINDEX ]
		scale:1,					// SCALING OF ITEM IN SCENE
		type:false,					// REFERS TO THE TYPE OF ITEM [ OBJECT, LAYER OR EXIT ]
		pos:'0,0',					// INITIAL STARTING POSITION OF ITEM 
		image:false,				// ASSIGNED ITEM IMAGE [ FILENAME OF ITEM IN ITEMS FOLDER ]
		inv_image:false,			// ASSIGNED ITEM IMAGE WHEN IN INVENTORY [ FILENAME OF ITEM IN ITEMS FOLDER ]
		hidden:false,				// VISIBILITY OF ITEM
		text:false,					// THE ITEM'S NAME
		proximity:150,				// CLOSEST PIXEL DISTANCE FROM CHARACTER TO ITEM BEFORE ACTION CAN OCCUR
		highlight_verb:false,		// HIGHLIGHTS A SPECIFIC VERB WHEN HOVERING THIS ITEM
		// EXIT SETTINGS
		exit_style:'true,true', 	// DETERMINES BEHAVIOR OF EXIT ITEM [ EXIT ON COLLISION, EXIT ON DOUBLE-CLICK ]
		exit_overlap:'70,80',		// FOR COLLISION EXITS, SETS THE X/Y CHARACTER OVERLAP % REQUIRED TO FIRE EXIT
		goto:false,					// DEFINES WHERE THIS EXIT ITEM LEADS [ SCENE_ID ]
		next_walk_to:false,			// ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE WALK_TO ENTRANCE ANIMATIONS		
		next_pos:false,				// ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE ENTRANCE POSITIONS
		next_image:false,			// IMAGE TO ASSIGN CHARACTER WHEN USING THIS EXIT ITEM TO ENTER NEXT SCENE
		next_direction:false,		// DIRECTION CHARACTER SHOULD BE FACING WHEN ENTERING NEXT SCENE
		next_pan:false,				// ASSIGN A PAN_TO % VALUE FOR NEXT SCENE
		// [ ADDON ] MAP CUTSCENE SETTINGS
		travel_time:500,			// DELAY AFTER CLICKING DESTINATION
		current_marker:false		// INDICATES CURRENT MAP POSITION
	},

	
	
	
	
	
	
	
	
	
/***********************************************************************************************/
// INITIALIZE
/***********************************************************************************************/
init:function(options){	
	var JAG=Jaguar,
		$teaser=$('#JAG_Teaser'),
		$GAME=JAG.OBJ.$Game=$(this), 
		$Chapters=$GAME.find('ul'), 
		$Scenes=$Chapters.find('li'),
		numScenes=$Scenes.length,
		o=options,
		href=window.location.href;



	///////////////////////////////////////////////////
	// ADD CLASSES, APPLY SELECTED SKIN AND SHOW TEASER
	///////////////////////////////////////////////////
	$GAME.addClass('JAG_Adventure').find('ul').addClass('JAG_Chapter').find('li').addClass('JAG_Scene');
	$('head').append('<link href="Jaguar/css/'+o.skin+'.css" rel="stylesheet" type="text/css"/>');
	$teaser.animate({opacity:1},{duration:700,queue:false});	



	/////////////////////////////////////////////////////////////
	// SAVE MASTER SETTINGS [ PASSED IN THROUGH THE PLUGIN CALL ]
	/////////////////////////////////////////////////////////////
	JAG.DATA.gD={
		title			:	JAG.FUNC.hasVal(o.title) ? o.title : false,
		debugKey		: 	JAG.FUNC.hasVal(o.debug_key) ? o.debug_key : 113,
		menuKey			:   JAG.FUNC.hasVal(o.menu_key) ? o.menu_key.pF() : 119,
		statsKey		:	JAG.FUNC.hasVal(o.stats_key) ? o.stats_key.pF() : 20,
		fullScreenKey	:	JAG.FUNC.hasVal(o.fullscreen_key) ? o.fullscreen_key.pF() : 192,
		startFullScreen :   JAG.FUNC.hasVal(o.start_fullscreen) ? o.start_fullscreen.isB() : false,
		pauseKey		: 	JAG.FUNC.hasVal(o.pause_key) ? o.pause_key.pF() : 32,
		keyboardNav		: 	JAG.FUNC.hasVal(o.allow_keyboard_nav) ? o.allow_keyboard_nav.isB() : true,
		pause_text		: 	JAG.FUNC.hasVal(o.pause_text) ? o.pause_text : 'GAME PAUSED... press SPACEBAR to continue',
		load_text		:	JAG.FUNC.hasVal(o.preloader_text) ? o.preloader_text : 'loading...',
		preload_time	:	JAG.FUNC.hasVal(o.preloader_time) ? o.preloader_time.pF() : 500,
		preload_image	:	JAG.FUNC.hasVal(o.preload_image) ? o.preload_image.removeWS() : 'preloader.gif',
		viewportW		:	0,
		viewportH		:	0,
		offset			:	$GAME.offset(),
		scroll_sound	:	JAG.FUNC.hasVal(o.scroll_sound) ? o.scroll_sound : 'scroll',
		ani_cursor		:	JAG.FUNC.hasVal(o.ani_cursor) ? o.ani_cursor.isB() : true,
		start_as		:	JAG.FUNC.hasVal(o.start_as) ? o.start_as.clean() : false,
		swapCharKey		:	JAG.FUNC.hasVal(o.swap_char_key) ? o.swap_char_key.pF() : 107
	};


	
	/////////////////////////////////////////
	// ADD AUDIO, STATS AND SUBTITLE ELEMENTS
	/////////////////////////////////////////
	$GAME.prepend('<audio id="JAG_Music" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Ambient" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Effect" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Scroll" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<audio id="JAG_Talkie" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>\
		<div id="JAG_Stats_Overlay"></div><div id="JAG_ID_Stats"><div class="JAG_clear"></div></div></div>\
		<p id="JAG_Scene_Dialogue"></p>');


	
	//////////////////////////
	// SAVE JAG.OBJ REFERENCES		
	//////////////////////////
	JAG.OBJ.$currentChapter=$($Chapters[0]);
	JAG.OBJ.$currentScene=$($Scenes[0]);
	JAG.OBJ.$Music=$('#JAG_Music');
	JAG.OBJ.$Ambient=$('#JAG_Ambient');
	JAG.OBJ.$Effect=$('#JAG_Effect');	
	JAG.OBJ.$Voice=$('#JAG_Talkie');
	JAG.OBJ.$Stats=$('#JAG_ID_Stats');
	JAG.Scaling.baseDimensions=$GAME.width()+','+$GAME.height();	



	///////////////////////////////////////////////////////
	// ASSIGN START_SCENES AND UNIQUE IDS TO ALL GAME ITEMS
	///////////////////////////////////////////////////////
	for(var i=0; i<numScenes; i++){
		var $thisScene=$($Scenes[i]),
			$Items=$thisScene.find('div.JAG_Item'),
			numItems=$Items.length,
			$Chars=$thisScene.find('div.JAG_Char'),
			numChars=$Chars.length;
			

		///////////////////////////////////////////
		// SET INITIAL DEFAULT SYNC TIMES FOR AUDIO
		///////////////////////////////////////////
		$thisScene.data('sync_music',0);
		$thisScene.data('sync_ambient',0);



		//////////////////////////////////
		// LOOP THROUGH THIS SCENE'S ITEMS
		//////////////////////////////////
		for(var i2=0; i2<numItems; i2++){
			// MERGE ITEM'S DATA WITH DEFAULT ITEM DATA
			var $Item=$($Items[i2]),
				iD=$Item.data('item'),
				itemD=$.extend({}, JAG.Item, !iD?{}:iD);


			/////////////////////////////////
			// ASSIGN UNIQUE IDS TO ALL ITEMS
			/////////////////////////////////
			if($Item.data('name')){ 
				$Item[0].id='JAG_ID_'+$Item.parents('li.JAG_Scene')[0].id.clean()+'_'+$Item.data('name').clean();
			}else{ 
				console.log("WARNING: TEXT setting not set for: "); 
				console.log($Item) 
			};

			
			//////////////////////////////////////////////////////
			// INDICATE ITEM'S ORIGIN AND NAME, UPDATE DATA OBJECT
			//////////////////////////////////////////////////////
			itemD.from_scene=$thisScene[0].id; 
			itemD.text=$Item.data('name');
			$Item.data('item', itemD);


			///////////////////////////////////////////////////
			// [ ADDON ] MAP CUTSCENES - DESTINATION VISIBILITY
			// AND ITEM VISIBILITY FROM SAVED GAMES
			///////////////////////////////////////////////////			
			var	visibility=itemD.hidden ? 'hidden' : 'visible';
			if(JAG.Load.game_name){
				var itemName=$Item[0].id.clean(),
					savedVis=localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~'+itemName+'_item_visibility');
				if(savedVis) var visibility=savedVis;
				// CHECK IF ITEM IS DEAD [ ALREADY BEEN USED ]
				if($.inArray(itemName, JAG.Story.DeadItems) > -1) var visibility='hidden';
			};
			$Item[0].style.visibility=visibility;
		};



		//////////////////////////////////////////
		// LOOP THROUGH CHARACTERS IN THIS SCENE
		// CHARACTER HTML ELEMENTS ARE ADDED HERE 
		// AND INITIALLY STORED AT TOP OF UL UNTIL 
		// THEY'RE CALLED INTO THE CORRECT SCENE
		//////////////////////////////////////////
		for(var i3=0; i3<numChars; i3++){		
			var $Char=$($Chars[i3]),
				cD=$Char.data('character'),
				charName=$Char.data('name').clean(),
				globalSpeechD=$.extend({}, JAG.OBJ.$currentChapter.data('speech-'+charName), JAG.Speech),				
				globalCharD=JAG.OBJ.$currentChapter.data('character-'+charName),
				newCD=$.extend({}, JAG.Character, !globalCharD?{}:globalCharD, !globalSpeechD?{}:globalSpeechD, !cD?{}:cD );


			/////////////////////////////////////////////
			// SAVE CURRENT LOCATION AND CHARACTER'S NAME
			/////////////////////////////////////////////
			newCD.current_location=$thisScene[0].id.clean();
			cD.text=$Char.data('name');
			
			
			////////////////////////////////////////////////////////////////				
			// ADD REFERENCE CLASS [ INDICATING THIS EL IS FOR SETTINGS ONLY
			////////////////////////////////////////////////////////////////
			$Char.addClass('JAG_Char_Settings_'+charName);
			

			/////////////////////////////////////////////////////////////////////////////				
			// ADD FIRST INSTANCE OF CHARNAME TO JAG.DATA.CHARS OBJECT [ USING DEFAULTS ]
			/////////////////////////////////////////////////////////////////////////////
			if(!JAG.DATA.Chars[charName]){
				JAG.DATA.Chars[charName]=newCD;
				JAG.DATA.Inv[charName]=[];				
			};

			
			/////////////////////////////////////////////////////////
			// CREATE ACTUAL CHAR HTML ELEMENT IN CORRECT START_SCENE
			/////////////////////////////////////////////////////////
			if(newCD.start_scene!==false && newCD.start_scene.clean()===$thisScene[0].id.clean() && !$('#JAG_ID_Char_'+charName).length){
				$thisScene.prepend('<div id="JAG_ID_Char_'+charName+'" class="JAG_Char_El" data-name="'+$Char.data('name')+'"/>');
				
				/////////////////////////////////////////////////////////
				// ADD BEEN_TO DATA [ COMMA-SEPARATED LIST OF SCENE IDS ]
				/////////////////////////////////////////////////////////
				$('#JAG_ID_Char_'+charName).data('been_to','');

				////////////////////////////
				// SELECT STARTING CHARACTER
				////////////////////////////
				if(JAG.DATA.gD.start_as === charName) JAG.OBJ.$selectedChar=$('#JAG_ID_Char_'+charName);


				/////////////////////////
				// FORMAT CHARACTER STATS
				/////////////////////////
				$Char.setupStatPoints(JAG, charName);
			};
		};
	};



	/////////////////////////////////////////////////////
	// BUILD DEBUG WINDOW IF GAMEPLAY DEBUGGER IS ENABLED
	/////////////////////////////////////////////////////
	if(JAG.DATA.gD.debugKey) $GAME.buildDebug(JAG);	



	//////////////////////////////////////////////////////
	// BUILD INVENTORY PANELS - CLICK TEASER TO START GAME
	//////////////////////////////////////////////////////
	$GAME.buildInv(JAG).one('click.Jaguar', function(){
		
		
		////////////////////////////
		// GO FULLSCREEN IF SELECTED 
		////////////////////////////
		if(JAG.DATA.gD.startFullScreen) $GAME.fullScreen();


		//////////////////////////////////////////
		// INTIALLY PLAY BLANK.MP3 ON TEASER CLICK 
		//////////////////////////////////////////
		JAG.OBJ.$Music[0].play(); 
		JAG.OBJ.$Ambient[0].play();
		JAG.OBJ.$Effect[0].play();
		JAG.OBJ.$Voice[0].play();


		///////////////
		// PRELOAD GAME
		///////////////
		$teaser.stop(true,false).animate({opacity:0},{duration:300, queue:false, complete:function(){ 
			$teaser.remove(); 
			JAG.preloadGame(JAG);
		}});


	//////////////////////////////////
	// DISABLE DRAGGING + CONTEXT MENU
	//////////////////////////////////
	}).on('dragstart contextmenu',function(){ return false; })

	
	
	//////////////////////////////////////////////
	// MAP GAME KEYS AND SET INTIAL VIEWPORT SCALE
	//////////////////////////////////////////////
	.mapKeys(JAG).scaleViewport(JAG);



	/////////////////////////////////////////////////////
	// APPLY ANIMATED CURSORS AND START MASTER GAME TIMER
	/////////////////////////////////////////////////////
	if(JAG.DATA.gD.ani_cursor) $GAME.aniCursor(JAG);
	JAG.startTime(JAG);
	
	

	//////////////////////////////////////////
	// SCALE THE VIEWPORT WHEN RESIZING WINDOW
	//////////////////////////////////////////
	$(window).on('resize', function(){ 
		JAG.FUNC.clrTimeout('windowResizeTimer');
		JAG.Timers.windowResizeTimer=setTimeout(function(){ JAG.OBJ.$Game.scaleViewport(JAG) }, 500);
	});



	/////////////////
	// LOADING A GAME
	/////////////////
	if(href.indexOf('?save_game') >= 0){
		var index=href.indexOf('?save_game='),
			gameName=href.substr(index+1).replace('save_game=',''),
			gameID=$GAME[0].id;
			

		////////////////////////////////////
		// REMOVE CLICK TO INITIALIZE JAGUAR
		////////////////////////////////////		
		JAG.Load.game_name=gameName.replace(/\+/g,' ');
		$GAME.off('click.Jaguar').loadGame(JAG, gameName);
		JAG.Load.saveORload=false;


		/////////////////////////////////////////////////////
		// UPDATE THE URL TO REMOVE THE LOADING+SAVEGAME NAME
		/////////////////////////////////////////////////////
		window.history.pushState('', '', href.replace(href.substr(index),''));		
		

		////////////////////////////////
		// LOAD PREVIOUSLY SELECTED CHAR		
		////////////////////////////////
		JAG.DATA.gD.start_as=localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~'+'JAG_Selected_Char');
		JAG.OBJ.$selectedChar=$('#JAG_ID_Char_'+JAG.DATA.gD.start_as);

		
		//////////////////////////
		// UPDATE DEAD ITEMS ARRAY
		//////////////////////////
		JAG.Story.DeadItems=localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~'+'JAG_DeadItems').split(',');


		//////////////////////////////////////////////////////
		// TELL JAGUAR WHAT CHARACTERS ARE CARRYING WHAT ITEMS
		//////////////////////////////////////////////////////
		var $Items=$('div.JAG_Item'),
			numItems=$Items.length;
			
		for(var i=0; i<numItems; i++){
			var $Item=$($Items[i]),
				itemName=JAG.FUNC.getItemName($Item),
				carried_by=localStorage.getItem(JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~_'+itemName+'_carried_by');
			
			
			//////////////////////
			// MUST HAVE ITEM DATA				
			//////////////////////
			JAG.newItemData(JAG, $Item);

			
			//////////////////////////////////////////////////////////////////////////////
			// CHARACTER WAS CARRYING THIS ITEM IN SAVEGAME PUT IT BACK IN THEIR INVENTORY
			//////////////////////////////////////////////////////////////////////////////
			if(carried_by && carried_by!=='undefined' && carried_by!=='false') $Item.addToInv(JAG, carried_by);
			
			
			/////////////////////////////////////////////////////////
			// [ ADDON ] RIDDLES - INDICATE IF ITEMS HAVE BEEN SOLVED
			/////////////////////////////////////////////////////////			
			$Item.data('solvedRiddle', localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~_'+itemName+'_solvedRiddle'));


			////////////////////////////
			// GET SAVED ITEM VISIBILITY
			////////////////////////////
			$Item.data('visibility', localStorage.getItem(gameID+'~'+JAG.Load.game_name+'~_'+itemName+'_itemVisibility'));
		};
		
		
		
	////////////////////////////////////////
	// RESTARTING A GAME=JUMP TO TITLESCREEN
	////////////////////////////////////////
	}else if(href.indexOf('?restart') >= 0){
		$GAME.off('click.Jaguar').restartGame(JAG);
	};
},











/***********************************************************************************************/
// SCENE RESETS [BETWEEN TRANSITIONS]
/***********************************************************************************************/
resetScene:function(JAG, scene){
	JAG.OBJ.$foreground=false;
	JAG.OBJ.$canvas=false;
	JAG.OBJ.$currentItem=false;
	JAG.OBJ.$selectedItem=false;
	JAG.OBJ.$currentScene=$(scene);
	JAG.OBJ.exitItems=[];
	JAG.Story.joinWord=false;
	JAG.FUNC.clrInterval('WeatherTimer');
	JAG.FUNC.clrInterval('FogTimer');
	JAG.FUNC.clrInterval('fullyLoadedTimer');
	JAG.FUNC.clrInterval('NotAllowedTimer');
	JAG.FUNC.clrInterval('ActionTimer');
	JAG.FUNC.clrInterval('TalkTimer');
	JAG.FUNC.clrInterval('riddleTimer');
	JAG.FUNC.clrInterval('cutSceneTimer');
	JAG.FUNC.clrTimeout('subtitleTimer');
	JAG.FUNC.clrTimeout('menuTimer');
	JAG.FUNC.clrTimeout('waitForIt');
	JAG.FUNC.clrTimeout('swapCharTimer');
	JAG.FUNC.clrTimeout('attackTimer');



	///////////////////
	// GAME INFORMATION
	///////////////////
	JAG.Story.switchingScenes=false;
	JAG.Story.talking=false;
	JAG.Story.walking=false;
	
	
	
	///////////////////////////////
	// STOP SOUND EFFECTS AND VOICE
	///////////////////////////////	
	JAG.OBJ.$Effect[0].src='';
	JAG.OBJ.$Voice[0].src='';
	
	
	
	//////////////////////////////////////
	// MAKE SURE GAME IS ON DEFAULT CURSOR
	//////////////////////////////////////	
	JAG.OBJ.$Cursor.removeClass('JAG_Wait_Cursor'); 



	////////////////////////////////////////
	// MARK THIS SCENE'S ITEMS AS NOT LOADED
	////////////////////////////////////////
	var $sceneItems=JAG.OBJ.$currentScene.find('div.JAG_Item'),
		numItems=$sceneItems.length;
	for(var i=0; i<numItems; i++) $($sceneItems[i]).data('item').loaded=false;
	
	
	
	////////////////////////////////
	// OPTIONALLY STOP RUMBLE EFFECT
	////////////////////////////////
	if(JAG.Story.stopRumble){
		JAG.FUNC.clrTimeout('rumbleTimer');
		JAG.Story.stopRumble.trigger('stopRumble');
	};	
	


	/////////////////////////////////////////////////
	// UPDATE JAG.DATA.SD SCENE OBJECT FOR THIS SCENE
	/////////////////////////////////////////////////
	// MERGE UL GLOBAL SCENE DATA TO CURRENT SCENE
	var	$Scene=JAG.OBJ.$currentScene,
		globalSceneD=JAG.OBJ.$currentChapter.data('scene'),
		sceneSceneD=$Scene.data('scene');
	JAG.DATA.sD=$.extend({}, JAG.Scene, !globalSceneD?{}:globalSceneD||{}, !sceneSceneD?{}:sceneSceneD||{} );
	
	

	///////////////////////////////////////////////
	// RESOLVE CURRENTLY SELECTED CHARACTER
	// MOVE SELECTED CHARACTER INTO THE NEW SCENE
	// MARK CHARACTER AS SELECTED AND SAVE LOCATION
	///////////////////////////////////////////////
	var charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar),
		$selectedChar=$('#JAG_ID_Char_'+charName);
		$selectedChar.addClass('JAG_noPointer');

	if(!JAG.FUNC.isCutscene()){
		$selectedChar.detach().prependTo($Scene);
		JAG.OBJ.$selectedChar=$selectedChar;	
		// ONLY USE START_AS ONCE [ WHAT CHARACTER TO START GAME AS ]
		JAG.DATA.gD.start_as=false;	
	};


	
	////////////////////////////////
	// UPDATE JAG.DATA.CHARS OBJECT
	// .JAG_Char_El = ACTUAL CHAR EL
	// .JAG_Char = SETTINGS ELEMENT
	////////////////////////////////
	var $CharSettings=$Scene.find('div.JAG_Char'), 
		numChars=$CharSettings.length;
	for(var i=0; i<numChars; i++) JAG.newCharData(JAG, $($CharSettings[i]));



	///////////////////////////////////
	// MARK CURRENT CHARACTER LOCATIONS
	///////////////////////////////////
	var $Chars=$('div.JAG_Char_El'), numCharEls=$Chars.length;
	for(var i2=0; i2<numCharEls; i2++){
		var $CharEl=$($Chars[i2]),
			charName=JAG.FUNC.getName($CharEl),
			current_location=$CharEl.parents('li.JAG_Scene:first')[0].id.clean();
		JAG.DATA.Chars[charName].current_location=current_location;
	};
	


	//////////////////////////////////////////
	// LOAD SCENE MUSIC [ WHICHS LOADS SCENE ]
	//////////////////////////////////////////
	$(scene).loadMusic(JAG);
},











/***********************************************************************************************/
// MANAGES CHARACTER DATA MERGING
/***********************************************************************************************/
newCharData:function(JAG, $thisChar){
	var $chapter=JAG.OBJ.$currentChapter,
		charName=$thisChar.data('character').text.clean(),
		current_location=$thisChar.parents('li.JAG_Scene:first')[0].id.clean(),


		///////////////////////////////////////////////////////
		// SAVE LASTVALID X/Y POSITIONS FOR KEYBOARD NAVIGATION
		///////////////////////////////////////////////////////
		lastValidX=JAG.DATA.Chars[charName].lastValidX,
		lastValidY=JAG.DATA.Chars[charName].lastValidY,


		///////////////////
		// 1. GAME DEFAULTS
		///////////////////
		gameDefaults=$.extend({}, JAG.Character, JAG.Actions, JAG.Speech),


		/////////////////////////////////////////////////////
		// 2. SETTINGS APPLIED AT UL ARE INHERITTED BY SCENES
		/////////////////////////////////////////////////////
		chapCharSettings=$chapter.data('character-'+charName),
		chapSpeechSettings=$chapter.data('speech-'+JAG.FUNC.getName(JAG.OBJ.$selectedChar)),
		chapActionSettings=$chapter.data('actions-'+charName),
		chapterSettings=$.extend({}, chapCharSettings, chapSpeechSettings, chapActionSettings),

		
		/////////////////////////////////////////////////////////////////////////////////////
		// 3. SCENES HAVE GENERIC AND CHARACTER-SPECIFIC DATA [ BASED ON SELECTED CHARACTER ]
		/////////////////////////////////////////////////////////////////////////////////////
		genericCharSettings=$thisChar.data('character'),
		specificCharSettings=$thisChar.data('character-'+JAG.FUNC.getName(JAG.OBJ.$selectedChar)),
		charSettings=$.extend({}, genericCharSettings, specificCharSettings);


	/////////////////////////////
	// 4. FLUSH EXISTING SETTINGS
	/////////////////////////////
	JAG.DATA.Chars[charName]={};
	
	
	/////////////////////////////////////
	// 5. COMPLETE MERGED SETTINGS OBJECT
	/////////////////////////////////////
	JAG.DATA.Chars[charName]=$.extend({}, gameDefaults, chapterSettings, charSettings);
	

	//////////////////////////////////////////////////////////////
	// 6. MUST UPDATE CURRENT LOCATION SINCE SETTINGS WERE FLUSHED
	//////////////////////////////////////////////////////////////
	JAG.DATA.Chars[charName].current_location=current_location;	
	
	
	/////////////////////////////////////////////////////////////////
	// 7. REWRITE THE LASTVALID X/Y POSITIONS FOR KEYBOARD NAVIGATION
	/////////////////////////////////////////////////////////////////
	JAG.DATA.Chars[charName].lastValidX=lastValidX;
	JAG.DATA.Chars[charName].lastValidY=lastValidY;
},











/***********************************************************************************************/
// MANAGES ITEM DATA MERGING
/***********************************************************************************************/
newItemData:function(JAG, $thisItem){
	var $chapter=JAG.OBJ.$currentChapter,
		charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar),
		itemName=JAG.FUNC.getItemName($thisItem),
		
		// 1. GAME DEFAULTS
		gameDefaults=$.extend({}, JAG.Item, JAG.Actions, JAG.Speech),
		
		// 2. SOME CHAPTER OBJECTS WILL BE INHERITTED BY ITEMS
		chapSpeechSettings=$chapter.data('speech-'+charName)
		
		// 3. SCENES HAVE GENERIC AND CHARACTER-SPECIFIC ITEM DATA [ BASED ON SELECTED CHARACTER ]
		genericItemSettings=$thisItem.data('item'),
		specificItemSettings=$thisItem.data('item-'+charName);

	// 4. FLUSH EXISTING SETTINGS
	JAG.DATA.Items[itemName]={};

	// 5. UPDATE DATA
	JAG.DATA.Items[itemName]=$.extend({}, gameDefaults, chapSpeechSettings, genericItemSettings, specificItemSettings);
},










/***********************************************************************************************/
// PRELOAD GAME - LOAD ALL GAME ASSETS
/***********************************************************************************************/
preloadGame:function(JAG){
	var $Game=JAG.OBJ.$Game,
		$Chapters=$Game.find('ul.JAG_Chapter'), 
		$Scenes=$Chapters.find('li.JAG_Scene'),
		numScenes=$Scenes.length,
		imgsArray=[],
		preL=new Image(),
		src='Jaguar/images/'+JAG.DATA.gD.preload_image,
		//////////////////////////////////////////////////////
		// BUILD ARRAY CONTAINING ALL POSSIBLE SPRITE SETTINGS
		//////////////////////////////////////////////////////
		spriteKey=['image','up','down','left','right',
		'give_image','give_up','give_down','give_left','give_right',
		'open_image','open_up','open_down','open_left','open_right',
		'close_image','close_up','close_down','close_left','close_right',
		'pick_up_image','pick_up_up','pick_up_down','pick_up_left','pick_up_right',
		'look_image','look_up','look_down','look_left','look_right',						
		'talk_image','talk_up','talk_down','talk_left','talk_right',
		'use_image','use_up','use_down','use_left','use_right',
		'push_image','push_up','push_down','push_left','push_right',
		'pull_image','pull_up','pull_down','pull_left','pull_right',
		'attack_image','attack_up','attack_down','attack_left','attack_right'];
		


	/////////////////////////////////////////////////////
	// PRELOAD ALL CHARACTER SPRITES TO AVOID SKATING BUG
	/////////////////////////////////////////////////////
	for(var char in JAG.DATA.Chars){
		if(JAG.DATA.Chars.hasOwnProperty(char)){
			var cD=JAG.DATA.Chars[char];
			for(var key in cD){
				if(cD.hasOwnProperty(key)){
					////////////////////
					// IF SPRITE SETTING
					////////////////////
					if($.inArray(key, spriteKey) >-1){
						var value=JAG.DATA.Chars[char][key];
						if(value!=false){
							// SOME SPRITE SETTINGS ALLOW FOR COMMAS
							if(value.indexOf(',') >-1){
								// ADD TO ARRAY ONCE
								if($.inArray('Jaguar/chars/'+value.split(',')[0].removeWS()+'.gif', imgsArray)===-1){
									imgsArray.push('Jaguar/chars/'+value.split(',')[0].removeWS()+'.gif');
								};
								if($.inArray('Jaguar/chars/'+value.split(',')[1].removeWS()+'.gif', imgsArray)===-1){
									imgsArray.push('Jaguar/chars/'+value.split(',')[1].removeWS()+'.gif');
								};
							}else{
								// ADD TO ARRAY ONCE
								if($.inArray('Jaguar/chars/'+value.removeWS()+'.gif', imgsArray)===-1){
									imgsArray.push('Jaguar/chars/'+value.removeWS()+'.gif');
								};
							};
						};
					};
				};
			};
		};
	};



	/////////////////
	// LOAD PRELOADER
	/////////////////
	$(preL).one('load', function(){


		/////////////////////
		// ADD PRELOADER HTML
		/////////////////////
		$Game.prepend('<div class="JAG_Preloader"><img src="'+src+'"><p>'+JAG.DATA.gD.load_text+'</p></div>');
		
		
		/////////////////
		// PRELOAD ASSETS
		/////////////////
		for(var i=0; i<numScenes; i++){
			var sD=$($Scenes[i]).data('scene'),
				$sceneItems=$($Scenes[i]).find('div.JAG_Item'),
				numItems=$sceneItems.length;
				
				
			///////////////////////////////////////
			// PRELOAD BACKGROUND+FOREGROUND IMAGES
			///////////////////////////////////////
			if(sD.background) imgsArray.push('Jaguar/scenes/'+sD.background);
			if(sD.foreground) imgsArray.push('Jaguar/scenes/'+sD.foreground);

			
			//////////////////////
			// PRELOAD ITEM IMAGES
			//////////////////////
			for(var i2=0; i2<numItems; i2++){
				var iD=$($sceneItems[i2]).data('item');
				if(iD.image) imgsArray.push('Jaguar/items/'+iD.image);
			};
		};
		


		////////////////////////////////////////////////
		// SAVE START TIME AND LOOP THROUGH IMAGES ARRAY
		////////////////////////////////////////////////
    	var startTime=JAG.Timers.currentTime,
			loaded=0, 
			totalAssets=imgsArray.length;

    	$(imgsArray).each(function(){
        	$('<img>').attr('src', this).one('load',function(){
	            loaded++;


				////////////////////////////////
				// TEST IF ALL ASSETS ARE LOADED
				////////////////////////////////
        	    if(loaded===totalAssets){
					var preloaderTimer=setInterval(function(){
						var currentTime=JAG.Timers.currentTime,
							elapsed=currentTime-startTime;


							//////////////////////////////////////////////
							// LOAD GAME [ MINIMUM PRELOADER SCREEN TIME ]
							//////////////////////////////////////////////
							if(elapsed >= JAG.DATA.gD.preload_time.pF()/1000){
								clearInterval(preloaderTimer);								


								///////////////////
								// REMOVE PRELOADER
								///////////////////
								var $preloader=$('div.JAG_Preloader');
								$preloader.stop(true,false).animate({opacity:0},{duration:400,queue:false,complete:function(){
									$preloader.remove();
									$([$('#JAG_Verbs')[0],$('ul.JAG_Chapter')[0],$('#JAG_Inventory')[0]]).css('display','block');


									//////////////////////////////////////
									// SHOW SELECTED CHARACTER'S INVENTORY
									//////////////////////////////////////
									$('#JAG_Inv_For_'+JAG.FUNC.getName(JAG.OBJ.$selectedChar)).css({display:'block', opacity:1});


									/////////////////////////////
									// RESET AND LOAD FIRST SCENE
									/////////////////////////////
									JAG.resetScene(JAG, JAG.OBJ.$currentScene);
								}});
							};
					},150);
				};
			})


			//////////////////////	
			// ERROR LOADING ASSET
			//////////////////////
			.on('error',function(){ 
				console.log("Error loading: "); 
				console.log(this); 
			});
	    });
	})[0].src=src;
},







/***********************************************************************************************/
// TIMER FOR GAME SESSION [ RECORDS REAL-TIME MILLISECONDS TO JAG.Timers.currentTime ]
/***********************************************************************************************/
startTime:function(JAG){
	window.requestAnimationFrame=function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame   || function(f){ window.setTimeout(f,1e3/60); };
	}();
	
	///////////////////
	// TIMING VARIABLES
	///////////////////
	var fps=30, 
		now, 
		then=Date.now(), 
		interval=1000/fps, 
		delta;
		  
	function timeIt(){
	    requestAnimationFrame(timeIt);
        now=Date.now();
	    delta=now-then;
     
	    if(delta > interval){
	        then=now-(delta%interval);
			JAG.Timers.currentTime=now;
	    };
	};
 	timeIt();
}};




/***********************************************************************************************/
// PLUGIN DEFINITION
/***********************************************************************************************/
$.fn.Jaguar=function(method){
	if(Jaguar[method]){ return Jaguar[method].apply(this,Array.prototype.slice.call(arguments,1));
	}else if(typeof method==='object'||!method){ return Jaguar.init.apply(this,arguments);
	}else{ $.error('Method '+method+' does not exist'); }
}})(jQuery);

String.prototype.removeWS=function(){return this.replace(/\s/g, ''); };
String.prototype.clean=function(){ return this.toLowerCase().removeWS(); };
String.prototype.pF=function(){ return parseFloat(this); };
Number.prototype.pF=function(){ return parseFloat(this); };
String.prototype.isB=function(){ return this=='true' ? true : false; };
Boolean.prototype.isB=function(){ return this==true ? true : false; };