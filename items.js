/***********************************************************************************************/
// Jaguar - ITEMS & INVENTORY MODULE
// ITEM HANDLING: ALL ITEMS BEGIN IN SCENES WITH USER-ENTERED .DATA() ATTACHED
// ON SCENE LOAD, THE JAG.DATA.ITEMS[ITEMNAME] DATA OBJECT IS CREATED
// THIS REFERENCE IS A MERGING OF ALL ITEM-RELATED DATA, WITH THE DATA-ITEM-MAIN CHARACTER
// WHEN MOVED TO INVENTORY, THE ORIGINAL .DATA() IS PRESERVED FOR FUTURE MERGING
// ALL ENGINE REFERENCES SHOULD POINT TO THE JAG.DATA.ITEMS[ITEMNAME]
// AN ADDITIONAL DATA-CARRIED_BY ATTRIBUTE TELLS THE ENGINE WHO HAS THE ITEM
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD ITEMS - $scene.loadItems(JAG);
/***********************************************************************************************/
loadItems:function(JAG){
	var sD=JAG.DATA.sD,
		$sceneItems=JAG.OBJ.$currentScene.find('div.JAG_Item'),
		numItems=$sceneItems.length;



	/////////////
	// LOOP ITEMS
	/////////////
	for(var i=0; i<numItems; i++){
		var $Item=$($sceneItems[i]),
			itemName=JAG.FUNC.getItemName($Item);


			/////////////////////////////////////
			// MERGE ITEM DATA TO JAG.DATA OBJECT
			/////////////////////////////////////
			JAG.newItemData(JAG, $Item);
			var iD=JAG.DATA.Items[itemName],
				pos=iD.pos.split(',');



			///////////////////////////
			// RECORD DATA + STYLE ITEM
			///////////////////////////
			$Item[0].style.left=pos[0].pF()+'%';
			$Item[0].style.top=pos[1].pF()+'%';
			$Item[0].style.display='block';
			$Item[0].style.visibility=$Item.data('visibility');



			///////////////////////////////////////
			// PASS EVENTS THROUGH DECORATIVE ITEMS
			///////////////////////////////////////
			if(!iD.show_name && iD.type==='layer') $Item.css('pointer-events','none');



			/////////////
			// EXIT ITEMS
			/////////////
			if(iD.type==='exit'){
				$Item[0].style.zIndex=3;
				// STORE ALL VISIBLE EXIT ITEMS FOR THIS SCENE
				if($Item.css('visibility')==='visible') JAG.OBJ.exitItems.push($Item);
			};
		
		
		
			///////////////////////////////////
			// LOAD SCENE OBJECTS [ NOT EXITS ]
			///////////////////////////////////
			if(iD.image !== undefined && iD.image && !$Item.data('carried_by')){
				$Item.loadObject(JAG, iD, itemName);
			}else{
				iD.loaded=true;
			};
		
		
		
			////////////////////////////////////////////////
			// [ ADDON ] SET CURRENT MAP MARKER IF AVAILABLE 
			////////////////////////////////////////////////
			if(iD.current_marker) JAG.Story.currentMarker=iD.current_marker.clean();
	};


	return $(this);	
},













/***********************************************************************************************/
// LOAD SCENE OBJECTS [ NOT EXITS ] - $Item.loadObject(JAG, iD);
/***********************************************************************************************/
loadObject:function(JAG, iD, itemName){
	var $Object=$(this),
		sD=JAG.DATA.sD,
		sceneObj=new Image(),
		src='Jaguar/items/'+iD.image;
		
		
		
	////////////////////////////////////
	// IF ITEM HASN'T BEEN USED [ DEAD ]
	////////////////////////////////////
	if($.inArray(itemName.replace(JAG.OBJ.$currentScene[0].id+'_',''), JAG.Story.DeadItems) ===-1){



		/////////////////////////////////////////////////
		// LOADING A GAME WHERE THE SCENE OBJECT HAS BEEN 
		// UPDATED WITH CHANGE_SPRITE SECONDARY ACTION	
		/////////////////////////////////////////////////	
		if(JAG.Load.game_name){
			var gameID=JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~'+$Object[0].id.clean(),
				savedSRC=localStorage.getItem(gameID+'_item_sprite');
			if(savedSRC) var src='Jaguar/items/'+savedSRC;
		};



		////////////////////
		// LOAD SCENE OBJECT
		////////////////////
		$(sceneObj).one('load', function(){


			//////////////////////////
			// OBJECT IMAGE DIMENSIONS
			//////////////////////////	
			var oW=((this.width*iD.scale.pF()*JAG.Scaling.gameScaled)/sD.sceneW)*100+'%',
				oH=((this.height*iD.scale.pF()*JAG.Scaling.gameScaled)/sD.sceneH)*100+'%';



			/////////////////////////////////////////////////////
			// STYLE OBJECT, SET IMAGE AND SETUP INVENTORY ARROWS
			/////////////////////////////////////////////////////
			$Object[0].style.width=oW;
			$Object[0].style.height=oH;
			$Object[0].style.zIndex=3;
			$Object[0].innerHTML='<img class="JAG_Item_Img" src='+src+'>';
			$Object.checkArrows(JAG);
		
		
			///////////////////////////////////////////
			// FLAG AS LOADED AND NOT CARRIED BY ANYONE
			///////////////////////////////////////////
			iD.loaded=true;
			$Object.data('carried_by',false);		
		
		})[0].src=src;	



	/////////////////////////////////////////
	// INDICATE DEAD ITEM ELEMENTS ARE LOADED
	/////////////////////////////////////////
	}else{
		iD.loaded=true;		
	};
},









/***********************************************************************************************/
// ADD ITEM TO INVENTORY - $Item.addToInv(JAG, charName);
/***********************************************************************************************/
addToInv:function(JAG, charName){
	var $Item=$(this),
		itemName=JAG.FUNC.getItemName($Item),
		iD=JAG.DATA.Items[JAG.FUNC.getItemName($Item)],
		$Inv=$('#JAG_Inv_For_'+charName),
		itemsinRow=$Inv.find('span.JAG_Inv_Set').find('li').length,
		$firstAvailable=$Inv.find('li:empty').first(),
		set='';
		
		
		
	//////////////////////////
	// INVENTORY ROWS ARE FULL
	//////////////////////////
	if($firstAvailable[0]===undefined){

		////////////////////////
		// ADD A NEW SET OF ROWS
		////////////////////////
		for(var i=0; i<itemsinRow; i++) set+='<li></li>';			
		$Inv.append('<span class="JAG_Inv_Set">'+set+'</span>');
		$firstAvailable=$Inv.find('span.JAG_Inv_Set:last').find('li:first');

		
		////////////////////////////////////////////
		// REBIND INVENTORY EVENTS AND UPDATE ARROWS
		////////////////////////////////////////////
		JAG.OBJ.$Inv.find('li').off('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv').end().checkArrows(JAG);
		JAG.OBJ.$Game.bindInv(JAG);
	};



	////////////////////////////////////////////////////////
	// SLOT AVAILABE - ADD TO INVENTORY, PASS DATA & FADE IN
	////////////////////////////////////////////////////////
	var src=iD.inv_image ? iD.inv_image : iD.image;
	


	///////////////////////////////////////////////
	// LOADING A GAME WHERE THE INV OBJECT HAS BEEN 
	// UPDATED WITH CHANGE_SPRITE SECONDARY ACTION
	///////////////////////////////////////////////
	if(JAG.Load.game_name){
		var gameID=JAG.OBJ.$Game[0].id+'~'+JAG.Load.game_name+'~_'+itemName,
			savedSRC=localStorage.getItem(gameID+'_item_sprite');
		if(savedSRC) var src=savedSRC;
	};



	//////////////////////////////////////////
	// ADD INVENTORY ITEM ELEMENT TO INVENTORY
	//////////////////////////////////////////
	$Item.html('<img class="JAG_Item_Img">').detach().appendTo($firstAvailable)
		.find('img').attr('src', 'Jaguar/items/'+src).css('visibility','visible')
		.stop(true,false).animate({opacity:1},{duration:350,queue:false});



	/////////////////////////
	// CONTROL ITEM OWNERSHIP
	/////////////////////////
	if($.inArray(itemName, JAG.DATA.Inv[charName]) ===-1){
		// REMOVE FROM MAIN CHARACTER'S INVENTORY ARRAY [ FIRST ]
		var mainCharInv=JAG.DATA.Inv[JAG.FUNC.getName(JAG.OBJ.$selectedChar)],
			invItemIndex=mainCharInv.indexOf(itemName);
			if(invItemIndex >-1) JAG.DATA.Inv[JAG.FUNC.getName(JAG.OBJ.$selectedChar)]=mainCharInv.splice(invItemIndex, 1);

		// ADD TO NEW CHARACTER'S INVENTORY ARRAY
		JAG.DATA.Inv[charName].push(itemName);
	};
	
	
	//////////////////////////////
	// UPDATE ITEM CARRIED_BY DATA
	//////////////////////////////
	$Item.data('carried_by', charName);

	return $Item;
},







/***********************************************************************************************/
// REMOVE ITEM FROM INVENTORY - $Item.remFromInv(JAG, itemName);
/***********************************************************************************************/
remFromInv:function(JAG, itemName){
	var $Item=$(this);

	////////////////////////
	// REMOVE FROM INVENTORY
	////////////////////////
	$Item.stop(true,false).animate({opacity:0},{duration:350,queue:false,complete:function(){

		////////////////////////////////
		// PUSH ITEM TO DEAD ITEMS ARRAY
		////////////////////////////////
		JAG.Story.DeadItems.push(itemName);

		
		////////////////////////////////////
		// REMOVE FROM INVENTORY AND SHUFFLE
		////////////////////////////////////
		$Item.remove().shuffleInv(JAG);


		///////////////////////////////////
		// REMOVE ITEM FROM INVENTORY ARRAY
		///////////////////////////////////
		// REMOVE FROM MAIN CHARACTER'S INVENTORY ARRAY [ FIRST ]
		var mainCharInv=JAG.DATA.Inv[JAG.FUNC.getName(JAG.OBJ.$selectedChar)],
			invItemIndex=mainCharInv.indexOf(itemName);
			if(invItemIndex >-1) JAG.DATA.Inv[JAG.FUNC.getName(JAG.OBJ.$selectedChar)]=mainCharInv.splice(invItemIndex, 1);
	}});
},






/***********************************************************************************************/
// RESHUFFLE INVENTORY [ WHEN COMBINING OR REMOVING OBJECTS ] - $Item.shuffleInv(JAG);
/***********************************************************************************************/
shuffleInv:function(JAG){
	var $Inv=JAG.OBJ.$Inv.find('li'),
		totalSpaces=$Inv.length,
		$InvBlocks=JAG.OBJ.$Inv.find('span.JAG_Inv_Set'),
		totalBlocks=$InvBlocks.length,
		invCount=JAG.Story.invCount.pF();

		
	/////////////////////
	// INVENTORY IS EMPTY
	/////////////////////
	if(!$Inv.find('img').length) return;


	//////////////////////////////////////////
	// REMOVE AN EMPTY CONTAINER IN THE MIDDLE
	//////////////////////////////////////////
	for(var i=0; i<totalSpaces; i++) if($($Inv[i]).is(':empty')) $($Inv[i]).remove();
	
	
	//////////////////////////////////////////////////////////////////
	// REMOVE ALL SPAN ELEMENTS [ THEY DEFINE SETS OF invCount ITEMS ]
	//////////////////////////////////////////////////////////////////
	for(var i2=0; i2<totalBlocks; i2++) $($($InvBlocks[i2])).replaceWith($($($InvBlocks[i2])).contents());


	/////////////////////////////////////////////////////
	// REMOVE EMPTY SETS - LEFT WITH JUST A LIST OF ITEMS
	/////////////////////////////////////////////////////
	JAG.OBJ.$Inv.find('span.JAG_Inv_Set:empty').remove();
	
	
	///////////////////////////////////////////////
	// LOOP ITEMS - REBUILD SETS [ invCount ITEMS ]
	///////////////////////////////////////////////
	var $newInv=JAG.OBJ.$Inv.find('li'),
		numSets=$newInv.length;
	for(var i=0; i<numSets; i+=invCount){
	    var $span=$("<span/>",{class: 'JAG_Inv_Set'});
   		$newInv.slice(i, i+invCount).wrapAll($span);
	};
	
	
	///////////////////////////////////////////////////
	// CHECK LAST SET IF THERE ARE invCount EMPTY ITEMS
	///////////////////////////////////////////////////
	var $lastBlock=JAG.OBJ.$Inv.find('span.JAG_Inv_Set:last');
	for(var i3=0; i3<invCount; i3++) if($lastBlock.find('li').length < invCount) $lastBlock.append('<li/>');


	///////////////////////////////////////////////
	// MOVE INVENTORY TO FIRST SET AND RESET MARGIN
	///////////////////////////////////////////////
	JAG.OBJ.$Inv.css('margin-top',0).find('span.JAG_Inv_Set:first').addClass('JAG_currentSet');


	//////////////////////////////////
	// REBIND EVENTS AND UPDATE ARROWS
	//////////////////////////////////
	$('#JAG_Inventory li').off('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv').checkArrows(JAG);	
	JAG.OBJ.$Game.bindInv(JAG);
	
	return $(this);
},






/***********************************************************************************************/
// BUILD DESC BAR, VERBS AND INVENTORY PANEL + INV SCROLLING
/***********************************************************************************************/
buildInv:function(JAG){
	var itemCount=JAG.Story.invCount.pF(), 
		InvItems='';
		
		
	////////////////////////////////////////
	// BUILD LIST ELEMENTS & INVENTORY PANEL
	////////////////////////////////////////
	for(var i=0; i<itemCount; i++) InvItems+='<li></li>';
	var $els='<div id="JAG_Desc"><p>\
		<span class="JAG_ActionWord"></span>\
		<span class="JAG_Item1Word"></span>\
		<span class="JAG_JoinWord"></span>\
		<span class="JAG_Item2Word"></span></p></div>\
		<div id="JAG_Panel">\
		<div id="JAG_Verbs">\
		<ul class="JAG_Column1">\
		<li class="JAG_Word" id="JAG_verb_give">Give</li>\
		<li class="JAG_Word" id="JAG_verb_open">Open</li>\
		<li class="JAG_Word" id="JAG_verb_close">Close</li>\
		</ul><ul class="JAG_Column2">\
		<li class="JAG_Word" id="JAG_verb_pick_up">Pick up</li>\
		<li class="JAG_Word" id="JAG_verb_look_at">Look at</li>\
		<li class="JAG_Word" id="JAG_verb_talk_to">Talk to</li>\
		</ul><ul class="JAG_Column3">\
		<li class="JAG_Word" id="JAG_verb_use">Use</li>\
		<li class="JAG_Word" id="JAG_verb_push">Push</li>\
		<li class="JAG_Word" id="JAG_verb_pull">Pull</li>\
		</ul></div>\
		<div id="JAG_Inventory">\
		<div id="JAG_Inv_Arrows"><div class="JAG_Arrow_Up"></div><div class="JAG_Arrow_Down"></div></div>';
		

	/////////////////////////////////////////////////
	// EACH CHARACTER NEEDS THEIR OWN INVENTORY PANEL
	/////////////////////////////////////////////////
	var $Chars=$('div.JAG_Char_El'),
		numChars=$Chars.length;
	for(var i2=0; i2<numChars; i2++){
		$els+='<ul id="JAG_Inv_For_'+JAG.FUNC.getName($($Chars[i2]))+'"><span class="JAG_Inv_Set JAG_currentSet">'+InvItems+'</span></ul>';
	};

		
		
	/////////////////////////////
	// CLOSE TAGS AND ADD TO GAME
	/////////////////////////////
	$els+='</div></div></div>';
	JAG.OBJ.$Game.append($els).bindInv(JAG);
	
	

	////////////////////
	// UPDATE REFERENCES
	////////////////////
	JAG.OBJ.$Panel=$('#JAG_Panel');
	JAG.OBJ.$Inv=$('#JAG_Inv_For_'+JAG.FUNC.getName(JAG.OBJ.$selectedChar));	
	JAG.OBJ.$dBar=$('#JAG_Desc');
	
	
	
	//////////////////////
	// INVENTORY SCROLLING
	//////////////////////
	$('#JAG_Inv_Arrows').on('click',function(e){
		var $Arrow=$(e.target),
			$Inv=JAG.OBJ.$Inv,
			$Scroll=$('#JAG_Scroll'),
			numSets=$Inv.find('span.JAG_Inv_Set').length,
			$currentSet=$Inv.find('span.JAG_currentSet'),
			currentIndex=$currentSet.index(),
			H=$currentSet.find('li:first').outerHeight(true)*2;


		//////////////////////
		// CANNOT BE NAVIGATED
		//////////////////////
		if(numSets <= 1) return;		



		//////////////////////
		// SCROLL INVENTORY UP
		//////////////////////
		if($Arrow.hasClass('JAG_Arrow_Up')){
			if(!$currentSet.prev('span.JAG_Inv_Set').length) return;
			
			
			////////////////////////////////////////
			// UPDATE CURRENT SET & SCROLL INVENTORY
			////////////////////////////////////////
			$Scroll[0].src='Jaguar/audio/'+JAG.DATA.gD.scroll_sound+'.mp3';
			$Scroll[0].play();			
			$currentSet.removeClass('JAG_currentSet').prev('span.JAG_Inv_Set').addClass('JAG_currentSet');
			$Inv[0].style.marginTop=-(H*(currentIndex-1))+'px';
			
			
			
			
		////////////////////////
		// SCROLL INVENTORY DOWN
		////////////////////////
		}else if($Arrow.hasClass('JAG_Arrow_Down')){
			if(!$currentSet.next('span.JAG_Inv_Set').length) return;
			
			//////////////////////////////////////////
			// UPDATE CURRENT SET AND SCROLL INVENTORY
			//////////////////////////////////////////
			$currentSet.removeClass('JAG_currentSet').next('span.JAG_Inv_Set').addClass('JAG_currentSet');
			$Inv[0].style.marginTop=-(H*(currentIndex+1))+'px';
			$Scroll[0].src='Jaguar/audio/'+JAG.DATA.gD.scroll_sound+'.mp3';
			$Scroll[0].play();
		};
		
		
		
		////////////////
		// UPDATE ARROWS
		////////////////
		$Inv.checkArrows(JAG);
	});
	
	return $(this);
},








/***********************************************************************************************/
// BIND INVENTORY EVENTS
/***********************************************************************************************/
bindInv:function(JAG){

	///////////////////
	// INVENTORY EVENTS
	///////////////////
	$('#JAG_Inventory').find('li').on('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv',function(e){

	
		/////////////
		// EMPTY SLOT
		/////////////
		if(!$(this).find('img').length) return;
		var $li=$(this),
			$Item=$li.find('div'),
			iD=JAG.DATA.Items[JAG.FUNC.getItemName($Item)];


		//////////////////////////
		// TYPE OF INVENTORY EVENT
		//////////////////////////
		switch(e.type){


			//////////////////
			// CLICK INVENTORY
			//////////////////			
			case 'click':
				if(JAG.Story.ActionWord!==false){
					// THE JOINWORD INDICATES THE PRESENCE OF 'TO' OR 'WITH' - SET AS SELECTED ITEM [FIRST INV CLICK]
					if(!JAG.Story.joinWord) JAG.OBJ.$selectedItem=$Item;
					$Item.Action(JAG, 'item', false, true);
				};
			break;
			
			
			
			//////////
			// MOUSEIN
			//////////
			case 'mouseenter': 
				// SHOW_NAME CAN REPLACE THE TEXT USED IN THE DESCRIPTION BAR WHEN HOVERING CHARACTERS
				// AND ITEMS. USEFUL FOR MORE COMPLICATED SCENARIONS THAT REQUIRE THE SAME ITEM TO BE
				// USED MULTIPLE TIMES IN DIFFERENT WAYS			
				var text=iD.show_name && iD.show_name!==true && iD.show_name!=='true' ? iD.show_name : iD.text;				
				$Item.updateBar(JAG, 'enter', 'item', ' '+text); 
			break;				
			
			
			///////////
			// MOUSEOUT
			///////////
			case 'mouseleave': $Item.updateBar(JAG, 'exit', false, false); break;
		};
	});	
},








/***********************************************************************************************/
// INVENTORY ARROW VISIBILITY
/***********************************************************************************************/
checkArrows:function(JAG){
	var $Panel=JAG.OBJ.$Panel,
		$Inv=JAG.OBJ.$Inv,
		$Up=$Panel.find('div.JAG_Arrow_Up'),
		$Down=$Panel.find('div.JAG_Arrow_Down'),
		numSets=$Inv.find('span.JAG_Inv_Set').length,
		$currentSet=$Inv.find('span.JAG_currentSet'),
		currentIndex=$currentSet.index()+1;


	////////////////////
	// UPDATE VISIBILITY
	////////////////////
	$Up[0].style.visibility=currentIndex > 1 ? 'visible' : 'hidden';
	$Down[0].style.visibility=currentIndex < numSets ? 'visible' : 'hidden';		
}});