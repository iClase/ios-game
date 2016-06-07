/***********************************************************************************************/
// Jaguar - CUTSCENES MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD CUTSCENE - $Scene.loadCutScene(JAG);
/***********************************************************************************************/
loadCutScene:function(JAG){
	var	$Scene=JAG.OBJ.$currentScene,
		sD=JAG.DATA.sD,
		src='Jaguar/scenes/'+sD.background,
		foreG=sD.foreground ? 'url(Jaguar/scenes/'+sD.foreground+')' : false,
		img=new Image();


	////////////////
	// LOAD CUTSCENE
	////////////////
	$(img).one('load',function(){


		///////////////////////////
		// SAVE CUTSCENE DIMENSIONS
		///////////////////////////
		JAG.DATA.sD.sceneW=this.width; 
		JAG.DATA.sD.sceneH=this.height;
		
		
		
		////////////////////////
		// HTML5 VIDEO CUTSCENES
		////////////////////////
		var $video=$Scene.find('video');
		if($video.length){
			$video[0].width=this.width;
			$video[0].play();

			////////////////////////////////////////
			// ADVANCE TO NEXT SCENE WHEN VIDEO ENDS
			////////////////////////////////////////			
			if(sD.advance_video_end){
				sD.display_time=0;
				$video.on('ended',function(){
					var $nextScene=sD.next_scene ? $('#'+sD.next_scene.clean()) : $Scene.next('li');
					$Scene.transSceneOut(JAG, $nextScene, false);			
				});
			};
		};



		//////////////////////
		// FULLSCREEN CUTSCENE
		//////////////////////
		JAG.OBJ.$currentChapter.addClass('JAG_CutScene');
		JAG.OBJ.$Panel[0].style.display=!sD.show_inv ? 'none' : 'block';
		JAG.OBJ.$dBar[0].style.display=!sD.show_inv ? 'none' : 'block';

		

		///////////////
		// ADD ELEMENTS
		///////////////
		// BACKGROUND/FOREGROUND
		if(!$Scene.find('img.JAG_Background').length) $('<img src="'+src+'" class="JAG_Background"/>').appendTo($Scene);
		if(foreG){
			if(!$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground" style="background:'+foreG+'"></div>').appendTo($Scene);
			JAG.OBJ.$foreground=$Scene.find('div.JAG_Foreground');
		};
		
		
		
		////////////
		// SUBTITLES
		////////////
		if(sD.subtitle) $Scene.subTitle(JAG, sD.subtitle, false);
		
		
				
		////////////////////////
		// CUTSCENE DISPLAY TIME
		////////////////////////
		if(!sD.map && sD.display_time.pF() > 0){
			var startTime=JAG.Timers.currentTime;
			
			////////////////////////
			// ADVANCE TO NEXT SCENE
			////////////////////////
			JAG.Timers.cutSceneTimer=setInterval(function(){					
				if((JAG.Timers.currentTime-startTime) >= sD.display_time.pF()){
					JAG.FUNC.clrInterval('cutSceneTimer');
					var $nextScene=sD.next_scene ? $('#'+sD.next_scene.clean()) : $Scene.next('li');
					$Scene.transSceneOut(JAG, $nextScene, false);
				};
			},50);
		};
		
		
		
		//////////////////////////////////////////
		// LOAD ITEMS [ EXITS FOR CUTSCENES/MAPS ]
		//////////////////////////////////////////
		$Scene.loadItems(JAG);
		


		//////////////////////////////////////////
		// TRANSITION CUTSCENE IN AND SETUP EVENTS
		//////////////////////////////////////////
		$Scene.transSceneIn(JAG).on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();


			////////////////////////////////////////////////
			// FLUSH RESTART WHEN CLICKING ON CREDITS SCENES
			////////////////////////////////////////////////
			if($Scene[0].id==='credits'){
				$Scene.restartGame(JAG);
			}else{
				// ADVANCE TO NEXT SCENE IF ALLOWED
				if(!sD.map && sD.allow_click) $Scene.jumpToScene(JAG, sD.allow_click);
			};
		});
		
		
		
		////////////////////////
		// TEXT TO SKIP CUTSCENE
		////////////////////////
		if(sD.skip_to && sD.skip_text) $Scene.prepend('<p id="JAG_Scene_Skip">'+sD.skip_text+'</p>');
		
		
		
		//////////////////////////
		// [ ADDON ] MAP CUTSCENES
		//////////////////////////
		if(sD.map) $Scene.map_Scene(JAG);				
		
		
	})[0].src=src;	
	
	return $(this);	
},





/***********************************************************************************************/
// ROLL CREDITS - $Scene.rollCredits(JAG);
/***********************************************************************************************/
rollCredits:function(JAG){
	var $Scene=$(this),
		sD=JAG.DATA.sD,
		$Char=JAG.OBJ.$selectedChar,
		charName=JAG.FUNC.getName($Char),
		beenHere=$('#JAG_ID_Char_'+charName).data('been_to').indexOf($Scene[0].id) >-1;


	////////////////////////////////
	// BUILD AND INSERT CREDITS HTML		
	////////////////////////////////	
	if(!$Scene.find('div.JAG_Credits').length){
		var credits=sD.roll_credits,
			numCredits=credits.length,
			creditsHTML='<div class="JAG_Credits"><ul>';

		for(var i=0; i<numCredits; i++){
			var credit=credits[i][0].split(':');
			creditsHTML+='<li><span class="JAG_Credits_Title">'+credit[0]+'</span><br/>\
			<span class="JAG_Credits_Names">'+credit[1]+'</span></li>'; 
		};
		
		$Scene.prepend(creditsHTML+='</ul></div>');
	};	


	///////////////////
	// ROLL THE CREDITS
	///////////////////
	var $credits=$Scene.find('div.JAG_Credits'),
		CreditsTop=-($credits.outerHeight(true)/sD.sceneH)*100+'%',
		creditsSpeed=sD.credits_speed.pF()*JAG.Scaling.gameScaled;


	$credits.stop(true,false).css('display','block')
		.animate({top:CreditsTop},{duration:creditsSpeed,queue:false,easing:'linear'});
}});