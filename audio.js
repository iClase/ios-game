/***********************************************************************************************/
// Jaguar - MUSIC AND SOUND EFFECTS MODULE
/***********************************************************************************************/
$.fn.extend({
	
/***********************************************************************************************/
// LOAD SCENE MUSIC - $Scene.loadMusic(JAG);
/***********************************************************************************************/
loadMusic:function(JAG){
	var $Scene=$(this),
		sD=JAG.DATA.sD,
		$Music=JAG.OBJ.$Music,
		$Ambient=JAG.OBJ.$Ambient;


	//////////////////
	// SCENE HAS MUSIC
	//////////////////
	if(sD.music){
		
		
		///////////
		// NEW SONG
		///////////
		if(sD.music !== JAG.Story.currentSong){
			JAG.Story.currentSong=sD.music;
			$Music[0].src='';
			$Music[0].src='Jaguar/audio/'+sD.music+'.mp3';


			//////////////////////////////////
			// WAIT FOR MP3 TO COMPLETELY LOAD
			//////////////////////////////////
			$Music.on('canplay',function(){
				
				
				/////////////
				// SYNC MUSIC
				/////////////
				if(sD.sync_music) $Music[0].currentTime=$Scene.data('sync_music').pF();
				
				
				////////////////////////////////////////////			
				// MOVE MUSIC TO NEW TIME [ OVERRIDES SYNC ]
				////////////////////////////////////////////
				if(sD.music_time) $Music[0].currentTime=sD.music_time;

				// SET VOLUME AND LOOPING
				$Music.setVolume(sD.music_volume, sD.music_vol_speed)
					  .attr('loop', sD.loop_music ? true : false).off('canplay')[0].play();

				//////////////////////////////////////////////////////
				// AFTERR LOADED, LOAD SCENE [KEEPS CUTSCENES IN SYNC]
				// AVOID FIRING CANPLAYTHOUGH EVENT AGAIN WHEN LOOPING
				//////////////////////////////////////////////////////
				$Scene.loadScene(JAG);
			});
			


		///////////////////////////////
		// SAME MUSIC - JUST LOAD SCENE
		///////////////////////////////
		}else{
			
			// MOVE MUSIC TO NEW TIME
			if(sD.music_time) $Music[0].currentTime=sD.music_time;

			// SET VOLUME			
			$Music.setVolume(sD.music_volume, sD.music_vol_speed);
			
			$Scene.loadScene(JAG);			
		};
		
	
	
	///////////////////////////
	// SCENE DOESN'T HAVE MUSIC
	///////////////////////////
	}else{
		JAG.Story.currentSong=false;
		$Music[0].src='';
		$Scene.loadScene(JAG);	
	};




	//////////////////////////
	// SCENE HAS AMBIENT SOUND
	//////////////////////////
	if(sD.ambient){
		
		
		////////////////////
		// NEW AMBIENT SOUND
		////////////////////
		if(sD.ambient !== JAG.Story.currentAmbient){
			JAG.Story.currentAmbient=sD.ambient;

			///////////////
			// SYNC AMBIENT
			///////////////
			if(sD.sync_ambient) $Ambient[0].currentTime=$Scene.data('sync_ambient').pF();		


			//////////////////////////////
			// SET LOOPING, VOLUME AND SRC
			//////////////////////////////
			$Ambient.setVolume(sD.ambient_volume, sD.ambient_vol_speed)
     				.attr({'loop':sD.loop_ambient ? true : false, 'src':'Jaguar/audio/'+sD.ambient+'.mp3'})[0].play();



		//////////////////////////////////////
		// SAME AMBIENT SONG - DIFFERENT SCENE
		//////////////////////////////////////
		}else{
			$Ambient.setVolume(sD.ambient_volume, sD.ambient_vol_speed);
		};
		
		
	///////////////////////////////////
	// SCENE DOESN'T HAVE AMBIENT SOUND
	///////////////////////////////////
	}else{
		JAG.Story.currentAmbient=false;
		$Ambient[0].src='';
	};
},




/***********************************************************************************************/
// SET THE VOLUME - $Music.setVolume(toVolume, speed);
/***********************************************************************************************/
setVolume:function(toVolume, speed){
	var $audio=$(this);
	
	/////////////////
	// WITH ANIMATION
	/////////////////
	if(speed > 0){
		var fromVol={property : $audio[0].volume.pF()},
			toVol={property : toVolume.pF()};
		$(fromVol).animate(toVol,{duration:speed.pF(),step:function(){
			$audio[0].volume=this.property;			
    	}});
		
	///////////////
	// NO ANIMATION
	///////////////
	}else{ 
		$audio[0].volume=toVolume.pF(); 
	};	
	
	return $(this);
},




/***********************************************************************************************/
// PLAY SOUND EFFECT
/***********************************************************************************************/
playSound:function(JAG, file){
	var $Effect=JAG.OBJ.$Effect,
		volume=file.removeWS().split(',')[1].pF(),
		fileName=file.removeWS().split(',')[0];
	
	$Effect.setVolume(volume, 0)[0].src='Jaguar/audio/'+fileName+'.mp3';
	$Effect[0].play();
}});