/***********************************************************************************************/
// Jaguar - ACTIONS PARSER MODULE [DESCRIPTION BAR]
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SETUP EVENTS TO POPULATE DESCRIPTION BAR
/***********************************************************************************************/
dBar:function(JAG){
	
	////////////////////////////////////////////////
	// UPDATE DESCRIPTION BAR [OBJECTS & CHARACTERS]
	////////////////////////////////////////////////
	JAG.OBJ.$currentScene.find('div').off('mouseenter mouseleave').end()
	.on('mouseenter mouseleave', 'div', function(e){

		var $El=$(this),
			elClass=$El.attr('class'),
			isChar=elClass.indexOf('JAG_Char_El') >-1 ? true : false,
			isItem=elClass.indexOf('JAG_Item') >-1 ? true : false,
			isExit=isItem && $El.data('item').type.toString().clean()==='exit',
			data=JAG.FUNC.elType($El);
			
			
			
		//////////////////////////////////////////////////////////////
		// [ ADDON ] RIDDLES > RETURN IF RIDDLE & PASSWORDS IS VISIBLE
		//////////////////////////////////////////////////////////////
		if($.isFunction($.fn.riddle)){ if($('#JAG_Riddle_Answer').is(':visible')) return; };



		///////////////////////////
		// ITEMS AND AUX CHARACTERS
		///////////////////////////
		switch(e.type){	
				

			//////////
			// MOUSEIN
			//////////
			case 'mouseenter':
				// DON'T ALLOW USE ON CHARACTERS/EXITS WHEN THERE'S A JOINWORD OR WHEN SHOW_NAME IS FALSE
				if((isExit && JAG.Story.joinWord) || (isChar && JAG.Story.ActionWord===6) || !data.show_name) return;
					
				////////////////////////////////////////////////////////////////////////////
				// SHOW_NAME CAN REPLACE THE TEXT USED IN THE DESCRIPTION BAR WHEN HOVERING 
				// CHARACTERS AND ITEMS. USEFUL FOR MORE COMPLICATED SCENARIONS THAT REQUIRE
				// THE SAME ITEM TO BE USED MULTIPLE TIMES IN DIFFERENT WAYS
				////////////////////////////////////////////////////////////////////////////
				if(data.text!==false){
					var text=data.show_name && data.show_name!==true && data.show_name!=='true' ? data.show_name : data.text;
					$El.updateBar(JAG, 'enter', (isChar ? 'character' : 'item'), text);
				};
					
				
				//////////////////////////////////////
				// VERB HIGHLIGHTING [ NO ITEM EXITS ]
				//////////////////////////////////////
				if(data.highlight_verb && !isExit){
					var $verb=$('#JAG_verb_'+data.highlight_verb);
					$verb.addClass('verb_hovered');
				};					
			break;
			
			

			///////////
			// MOUSEOUT
			///////////
			case 'mouseleave': 
			
				///////////////////////////
				// REMOVE VERB HIGHLIGHTING
				///////////////////////////
				JAG.OBJ.$Panel.find('li.JAG_Word').removeClass('verb_hovered');
				
				////////////////////////
				// CLEAR DESCRIPTION BAR
				////////////////////////
				$El.updateBar(JAG, 'exit', false, false);
			break;
		};
	});
	
	
	
	//////////////
	// VERB EVENTS
	//////////////
	$('#JAG_Verbs').on('mouseenter mouseleave click', 'li', function(e){
		var $Verb=$(this),
			text=$Verb[0].innerHTML;
			
		switch(e.type){

			//////////
			// MOUSEIN
			//////////
			case 'mouseenter': 
				$Verb.addClass('verb_hovered');
				if(JAG.Story.ActionWord!==6 && JAG.Story.ActionWord!==0) $Verb.updateBar(JAG, 'enter', 'actionWord', text); 
			break;

			
			///////////
			// MOUSEOUT
			///////////
			case 'mouseleave': 
				$Verb.removeClass('verb_hovered').updateBar(JAG, 'exit', false, false); 
			break;
			
			
			////////
			// CLICK
			////////
			case 'click':
				// GET THE EXACT INDEX OF VERB
				JAG.Story.ActionWord=($Verb.parent('ul:first').index()*3)+$Verb.index();
				JAG.Story.joinWord=false;
				$Verb.updateBar(JAG, 'enter', 'actionWord', text);			
			break;
		};
	});
},




/***********************************************************************************************/
// UPDATE DESCRIPTION BAR - $Item.updateBar(JAG, mouseSTATUS, itemType, text);
/***********************************************************************************************/
updateBar:function(JAG, status, itemType, text){
	var $Item=$(this),
		$dBar=JAG.OBJ.$dBar,
		$ActionWord=$dBar.find('span.JAG_ActionWord'),
		$Item1Word=$dBar.find('span.JAG_Item1Word'),
		$JoinWord=$dBar.find('span.JAG_JoinWord'),
		$Item2Word=$dBar.find('span.JAG_Item2Word'),
		AW=JAG.Story.ActionWord,
		GIVE=AW===0 ? true : false,
		USE=AW===6 ? true : false,
		// SIGNALS USER HAS SELECTED AN ITEM TO GIVE/USE
		isGIVE=$JoinWord.text()===' to';



	//////////////
	// TEST STATUS
	//////////////
	switch(status){

		////////
		// ENTER 
		////////
		case 'enter':
			switch (itemType){	
			
			
				///////
				// VERB
				///////
				case 'actionWord': 					
					if(!isGIVE){ 
						$ActionWord[0].innerHTML=text; 
					}else{
						$ActionWord[0].innerHTML=text;
						$Item1Word[0].innerHTML=''; 
						$JoinWord[0].innerHTML=''; 
					};
				break;
				
				
				////////////
				// CHARACTER
				////////////
				case 'character':
					if(GIVE || USE){ 
						$Item2Word[0].innerHTML=' '+text;
					}else{ 
						$Item1Word[0].innerHTML=' '+text; 
					};
				break;
				
				
				///////
				// ITEM
				///////
				case 'item':
					// MAKE INVENTORY CHECK
					if(isGIVE) return;
					$Item2Word[0].innerHTML=USE ? ' '+text : text;
				break;
			};			
		break;
		
		
		
		///////
		// EXIT
		///////
		case 'exit':
			$ActionWord[0].innerHTML=JAG.Story.ActionWord!==false ? $($('#JAG_Verbs').find('li')[JAG.Story.ActionWord]).html() : ' ';
			if(!GIVE && !USE) $Item1Word.add($JoinWord).text(' ');
			$Item2Word.text(' ');
		break;
		
		
		
		////////
		// CLICK
		////////
		case 'click':
			$ActionWord[0].innerHTML=$($('#JAG_Verbs').find('li')[JAG.Story.ActionWord]).html();
			$Item1Word[0].innerHTML=text;
			$JoinWord[0].innerHTML=GIVE ? ' to' : USE ? ' with ' : '';
			$Item2Word[0].innerHTML=' ';
		break;		
	};
	
}});