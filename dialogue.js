/***********************************************************************************************/
// Jaguar - DIALOGUE TEXT MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// POSITION AND SHOW SPEECH TEXT  $item.saySomething(JAG, $Char, text, voiceFile, question_to_trigger_onstart);
/***********************************************************************************************/
saySomething:function(JAG, $Char, speech, voice, currentScene, startQuestion){
	if(speech === undefined || !speech) return;


	///////////////////
	// SPEECH VARIABLES
	///////////////////
	var $Item=$(this),
		charName=JAG.FUNC.getName($Char), 
		cD=JAG.DATA.Chars[charName],
		totalQuestions=speech.length;



	///////////////////////////////////////////
	// MAKE SURE ALL PREVIOUS TEXT IS DONE-DONE
	///////////////////////////////////////////
	if(!$Char.next('p.JAG_Char_Dialogue').length) $('<p class="JAG_Char_Dialogue"/>').insertAfter($Char);
	var $Text=$Char.next('p.JAG_Char_Dialogue');
	
	
	
	///////////////////////////////////////////////////
	// PREVENT THIS FUNCTION FROM FIRING MULTIPLE TIMES
	///////////////////////////////////////////////////
	if($Text.is(':visible')) return;	
	$Text[0].innerHTML='';



	////////////////////
	// FULL CONVERSATION
	////////////////////
	if($.isArray(speech) && speech[0] !== undefined){



		/////////////////////
		// ADD DIALOGUE PANEL
		/////////////////////
		if(!JAG.OBJ.$Dialogue){
			$('<div id="JAG_dialogue"/>').insertBefore($('#JAG_Panel'));
			JAG.OBJ.$Dialogue=$('#JAG_dialogue');
		};
		var questions='';



		///////////////////////////////////////////////////////////////////////
		// INSERT QUESTIONS: speech[question block][question || answer][string]
		///////////////////////////////////////////////////////////////////////
		for(var i=0; i<totalQuestions; i++) questions+='<div class="JAG_question">'+speech[i][0][0].split('||')[0]+'</div>'; 
		JAG.OBJ.$Dialogue.html(questions);
		
		
		
		///////////////////////////////////////////////////////////////
		// ANIMATE QUESTIONS INTO VIEW IF NOT AUTO-PLAYING CONVERSATION
		///////////////////////////////////////////////////////////////
		if(!JAG.DATA.Chars[charName].conversation){
			JAG.OBJ.$Dialogue.css('display','block').stop(true,false).animate({opacity:1},{duration:500,queue:false});
		};
		
		
		
		////////////////////////
		// SETUP QUESTION EVENTS
		////////////////////////
		JAG.OBJ.$Dialogue.find('div.JAG_question').on('click',function(){
			var $allText=JAG.OBJ.$currentScene.find('p.JAG_Char_Dialogue');
			// RETURN IF SOMEONE IS ALREADY TALKING			
			for(var i=0; i<$allText.length; i++){ if($($allText[i]).css('opacity').pF()>0) return; };
	
			// START CONVERSATION
			JAG.OBJ.$selectedChar.converse(JAG, $Item, $(this));
		});
		
		
		
		///////////////////////////////////////////////
		// AUTO-INITIATE CONVERSATION BY QUESTION INDEX
		///////////////////////////////////////////////
		if(startQuestion!==false) JAG.OBJ.$Dialogue.find('div.JAG_question').eq(startQuestion.pF()).click();




	///////////////////////////////////////////
	// SINGLE LINE RESPONSE FROM MAIN CHARACTER
	///////////////////////////////////////////
	}else{
		

		////////////////////////////////////////////////////
		// DIALOGUE WITH AN AUX CHARACTER HAS BEEN EXHAUSTED
		////////////////////////////////////////////////////		
		if($.isArray(speech)) var speech=JAG.Speech.talk_no_more_text;
		JAG.Story.talking=true;
		JAG.DATA.Chars[charName].conversation=false;
				
				
		
		///////////////////////////////////////////////////////////////
		// RANDOMIZER - ALLOWS FOR SAYING THE SAME THING... DIFFERENTLY
		///////////////////////////////////////////////////////////////
		var randomSpeech=$Char.randomTalk(JAG, speech);
		if(randomSpeech){ 
			var speech=randomSpeech.speech, 
				voiceIndex=randomSpeech.index; 
		};


		///////////////////
		// [ ADDON ] TALKIE
		///////////////////
		if($.isFunction($.fn.talkie) && voice){
			// RANDOMIZER AVAILABLE ON VOICE 
			// [ MATCH SPEECH TO VOICE USING VOICEINDEX ]
			if(voice.indexOf('%%') >-1){
				// RANDOMIZER NUMBER DOESN'T EXIST BECAUSE IT
				// IS NOT BEING USED ON _TEXT SETTING - GET ONE
				if(!voiceIndex){
					var voiceIndex=$Char.randomTalk(JAG, voice).index;
					$Char.talkie(JAG, voice.split('%%')[$Char.randomTalk(JAG, voice).index].removeWS());
				};
			}else{
				$Char.talkie(JAG, voice);				
			};
		};



		//////////////////////////////////////////////////////////		
		// MULTIPLE SENTENCES [LINES] WITHIN A SINGLE SPEECH VALUE
		// ARE SEPARATED USING THE || CHARACTER
		//////////////////////////////////////////////////////////
		var multiLines=speech.indexOf('||') ? true : false,
			text=multiLines ? speech.split('||')[0] : speech;



		///////////////////////////						
		// SWITCH TO TALKING SPRITE
		///////////////////////////
		if(!JAG.Story.walking) $Char.switchSprite(JAG, cD, 'talk');



		//////////////////////////////////
		// STYLE, INSERT AND POSITION TEXT
		//////////////////////////////////
		$Text[0].style.color=cD.text_color;
		$Text[0].style.display='block';
		$Text[0].style.opacity=1;
		$Text[0].innerHTML=text;
		$Text.textDims(JAG, $Char);

			

		//////////////////////////////
		// SETUP ACCURATE SPEECH TIMER
		//////////////////////////////		
		var startTime=JAG.Timers.currentTime,
			displayTime=Math.max(text.length * cD.text_time.pF(), 1500);

		JAG.Timers.TalkTimer=setInterval(function(){
			var currentTime=JAG.Timers.currentTime,
				elapsed=currentTime-startTime;
			if(elapsed >= displayTime){
				JAG.FUNC.clrInterval('TalkTimer');
						
								
				////////////
				// HIDE TEXT
				////////////
				$Text.stop(true,false).animate({opacity:0},{duration:500, queue:true, complete:function(){
					JAG.Story.talking=false;
					$Text[0].style.display='none';
					
					
					////////////////////////////////
					// SWITCH BACK TO STOPPED SPRITE
					////////////////////////////////
					if(!JAG.Story.walking) $Char.switchSprite(JAG, cD, 'stopping');
					
					
					//////////////////////////////////////////////////////////////////////
					// IF CHARACTER HAS MULTIPLE LINES, REMOVE LINE JUST SAID AND CONTINUE
					//////////////////////////////////////////////////////////////////////
					if(multiLines){
						var newSpeech=speech.split('||');
							// REMOVE FIRST TEXT
							newSpeech.shift(); 
							
						for(var i=0, l=newSpeech.length; i<l; i++){
							// REMOVE WHITESPACE AT BEGINNING OF TEXT AND TRAILING COMMAS
							newSpeech[i]=newSpeech[i].replace(/^\s+|\s+$/g,'');
							// ADD || AS A SEPARATOR ON ALL EXCEPT LAST TEXT
							if(i!==newSpeech.length-1) newSpeech[i]+=' ||';
						};

						// MERGE THE ARRAY WITHOUT ANY CHARACTERS
						var nextLine=newSpeech.join(' ');

						// CONTINUE WITH NEXT LINE
						if(nextLine && currentScene===JAG.OBJ.$currentScene){
							$Char.saySomething(JAG, $Char, nextLine, false, JAG.OBJ.$currentScene);
						}else{
							$Text[0].style.display='none';
							$Text[0].style.opacity=0;
							JAG.Story.talking=false;
						};
					};
				}});
			};
		},50);
	};
},





/***********************************************************************************************/
// RETURNS RANDOMLY SELECTED TEXT
/***********************************************************************************************/
randomTalk:function(JAG, speech){
	// RANDOM LINES ARE SEPARATED WITH THE % SYMBOL
	if(speech.indexOf('%%') <0) return false;

	//////////////////////////////////////////////
	// CONTINUE IF THERE ARE MULTIPLE CHOICES FOR 
	// SPEECH RETURN RANDOMLY SELECTED ARRAY INDEX
	//////////////////////////////////////////////
	var choiceArray=speech.split('%%'),
		randomArrayIndex=JAG.FUNC.getRandomNumber(0, choiceArray.length);
		
	return { speech:choiceArray[randomArrayIndex], index:randomArrayIndex };
},





/***********************************************************************************************/
// CONVERSATIONS - $Char.converse(JAG, $AuxChar, $question);
/***********************************************************************************************/
converse:function(JAG, $AuxChar, $question){
	JAG.Story.talking=true;

	var $Char=$(this),
		charName=JAG.FUNC.getName($Char),
		cD=JAG.DATA.Chars[charName],
		$Dialogue=JAG.OBJ.$Dialogue,
		$Text=$Char.next('p.JAG_Char_Dialogue'),
		AcD=JAG.DATA.Chars[JAG.FUNC.getName($AuxChar)],
		$AuxText=$AuxChar.next('p.JAG_Char_Dialogue'),
		question=$question.text().split('||')[0],
		textTime=AcD.text_time.pF(),
		// INDEX OF QUESTION CLICKED
		Q_Index=$question.index(),
		display='block';
		
		

	///////////////////////////
	// SWITCH TO TALK_TO SPRITE
	///////////////////////////
	$Char.switchSprite(JAG, cD, 'talk');



	//////////////////////////////////////////
	// [ ADDON ] TALKIE - ASK QUESTION CLICKED
	//////////////////////////////////////////
	if($.isFunction($.fn.talkie) && AcD.talk_to_voice){
		// MATCH INDEX OF CLICKED QUESTION TO INDEX OF TALK_TO_VOICE ARRAY QUESTION FILENAME || ANSWER FILENAME
		if(AcD.talk_to_voice[Q_Index]) $Char.talkie(JAG, AcD.talk_to_voice[Q_Index][0][0].split('||')[0].removeWS());
	};



	///////////////////////////////////////////////////////////////////////////////
	// POSE QUESTION - POSITION TEXT [ MAKE SURE IN VIEWPORT ] & SET TALKING SPRITE
	///////////////////////////////////////////////////////////////////////////////
	$Text[0].style.color=cD.text_color;
	$Text[0].style.display=display;
	$Text[0].style.opacity=1;
	$Text[0].innerHTML=question;
	$Text.textDims(JAG, $Char)



	//////////////////////////////////////////////
	// FADEOUT QUESTION - HIDE TEXT & STOP TALKING
	//////////////////////////////////////////////
	.delay(Math.max(question.length.pF() * textTime, 1500)).animate({opacity:0},{duration:500, queue:true, complete:function(){		


		////////////
		// HIDE TEXT
		////////////
		JAG.Story.talking=false;
		$Text[0].style.display='none';



		////////////////////////////////
		// SWITCH BACK TO STOPPED SPRITE
		////////////////////////////////
		if(!JAG.Story.walking) $Char.switchSprite(JAG, cD, 'stopping');



		//////////////////////
		// FOLLOW-UP QUESTIONS
		//////////////////////	
		var relatedQs=AcD.talk_to_text[Q_Index],
			numQs=relatedQs.length;
			
			
			
		///////////////////////////
		// LOOP FOLLOW-UP QUESTIONS
		///////////////////////////
		for(var i=0; i<numQs; i++){
			var response=AcD.talk_to_text[Q_Index][i][0].split('||')[1];


			/////////////////////////////////////////////////
			// [ ADDON ] TALKIE - RESPONSE FROM AUX CHARACTER
			/////////////////////////////////////////////////
			if($.isFunction($.fn.talkie) && AcD.talk_to_voice){
				// MATCH INDEX OF CLICKED QUESTION TO INDEX OF TALK_TO_VOICE ARRAY
				// QUESTION FILENAME || ANSWER FILENAME
				if(AcD.talk_to_voice[Q_Index][i][0]) $AuxChar.talkie(JAG, AcD.talk_to_voice[Q_Index][i][0].split('||')[1].removeWS());	
			};
			
			
			
			/////////////////////////////////////////////
			// UPDATE QUESTION - POSITION WITHIN VIEWPORT
			/////////////////////////////////////////////
			$AuxText[0].style.color=AcD.text_color;
			$AuxText[0].style.display='block';
			$AuxText[0].style.opacity=1;
			$AuxText[0].innerHTML=response;
			$AuxText.textDims(JAG, $AuxChar);
			
			
			
			///////////////////////////
			// SWITCH TO TALKING SPRITE
			///////////////////////////
			JAG.Story.talking=true;			
			$AuxChar.switchSprite(JAG, AcD, 'talk');
			var timeToShowResponse=Math.max(response.length*textTime, 1500);



			////////////////////////////
			// UPDATE OR REMOVE QUESTION
			////////////////////////////
			if(i!==numQs-1){
				$question[0].innerHTML=AcD.talk_to_text[Q_Index][i+1][0].split('||')[0]; 
			}else{
				// NO MORE FOLLOW-UP QUESTIONS
				$question.remove();
			};



			///////////////////////////////////////
			// REMOVE FOLLOW-UP QUESTION FROM ARRAY
			///////////////////////////////////////
		    AcD.talk_to_text[Q_Index].splice(i, 1);
			
			// REMOVE WRAPPER ARRAY IF NO MORE FOLLOW-UP QUESTIONS
			if(AcD.talk_to_text[Q_Index].length===0) AcD.talk_to_text.splice(Q_Index, 1);

			
			
			/////////////////////////////////////////////////////////////////////////
			// [ ADDON ] TALKIE - REMOVE WRAPPER ARRAY IF NO MORE FOLLOW-UP QUESTIONS
			/////////////////////////////////////////////////////////////////////////
			if(AcD.talk_to_voice){
				AcD.talk_to_voice[Q_Index].splice(i, 1);
				if(AcD.talk_to_voice[Q_Index].length===0) AcD.talk_to_voice.splice(Q_Index, 1);
			};
			
			break;
		};
		
		
		
		///////////////////////////////
		// STOP TALKING - AUX CHARACTER
		///////////////////////////////
		$AuxText.stop(true,false).delay(timeToShowResponse).animate({opacity:0},{duration:500, queue:true, complete:function(){
			JAG.Story.talking=false;
			$AuxText[0].style.display='none';
			
			
			
			///////////////////////////
			// SWITCH TO STOPPED SPRITE
			///////////////////////////
			$AuxChar.switchSprite(JAG, AcD, 'stopping');



			////////////////////
			// NO QUESTIONS LEFT
			////////////////////
			if(!$Dialogue.find('div.JAG_question').length){
				
				// CLOSE DIALOG PANEL AND PERFORM ANY SECONDARY ACTIONS
				$Dialogue.closeDiag(JAG);
				JAG.DATA.Chars[charName].conversation=false;				
				if(AcD.done_talking) $AuxChar.actionLoop(JAG, AcD.done_talking, 'done_talking');


			////////////////////
			// PLAY-CONVERSATION
			////////////////////
			}else if(AcD.play_conversation.isB()){				
				$Dialogue.find('div.JAG_question').eq(0).click();
			};
		}});
	}});
},




/***********************************************************************************************/
// POSITION TEXT WITHIN VIEWPORT AND CENTER OVER CHARACTER
/***********************************************************************************************/
textDims:function(JAG, $Char){
	var	$Text=$(this),
		textInfo=$Text[0].getBoundingClientRect(),
		charInfo=$Char[0].getBoundingClientRect(),
		mT=$Char.css('margin-top').pF(),
		sD=JAG.DATA.sD,		
		vW=sD.sceneW.pF(),
		vH=JAG.DATA.gD.viewportH.pF();
		
		
	//////////////////////////////////////////////////////
	// ADJUST WIDTH OF TEXT IF LARGER THAN 70% OF VIEWPORT
	//////////////////////////////////////////////////////
	if(textInfo.width > vW*0.7){
		$Text[0].style.width=vW * 0.7;
		var textInfo=$Text[0].getBoundingClientRect();
	};
	
	
	/////////////
	// TOP / LEFT
	/////////////
	var T_Top=charInfo.bottom + mT - textInfo.height,
		T_Left=$Char.css('left').pF() - (textInfo.width/2);



	////////////////////////////
	// KEEP TEXT INSIDE VIEWPORT
	////////////////////////////
	if(T_Top > (vH-textInfo.height)) var T_Top=vH-textInfo.height;
	if(T_Left > (vW-textInfo.width)) var T_Left=vW-textInfo.width;
	
	
	
	/////////////////////////////////////
	// [ ADDON ] FIRST PERSON PERSPECTIVE
	/////////////////////////////////////
	if($.isFunction($.fn.firstPerson) && sD.first_person){
		$Text[0].style.width='90%';
		$Text[0].style.top='10%';
		$Text[0].style.left='5%';
	}else{
		$Text[0].style.top=Math.max((T_Top/sD.sceneH), 0.01) * 100+'%';
		$Text[0].style.left=Math.max((T_Left/sD.sceneW), 0.01) * 100+'%';
	};


	return $Text;
},





/***********************************************************************************************/
// CLOSE DIALOG PANEL - $DiagPanel.closeDiag(JAG);
/***********************************************************************************************/
closeDiag:function(JAG){
	var $Dialogue=$(this);
	$Dialogue.stop(true,false).animate({opacity:0},{duration:500,queue:false,complete:function(){
		JAG.Story.talking=false;
		$Dialogue[0].style.display='none';
	}});			
}});