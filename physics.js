/***********************************************************************************************/
// Jaguar - PHYSICS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// BOUNDARY DETECTION - $Char.inBounds(JAG, pos);
/***********************************************************************************************/
inBounds:function(JAG, pos){
	var	$Char=$(this),
		charName=JAG.FUNC.getName($Char),
		CH=$Char.outerHeight(true),
		CW=$Char.outerWidth(true),
		X=Math.round(pos.left+(CW/2)),
		Y=Math.round(pos.top+CH),
		sD=JAG.DATA.sD;
	if(sD.sceneW==undefined) return;
	var isWhite=sD.pathData[(Y * sD.sceneW.pF() + X) * 4] > 200;



	////////////
	// IN BOUNDS
	////////////
    if(isWhite){
		// SAVE LAST VALID POSITION [ ALSO USED FOR SAVE/LOAD ]
		JAG.DATA.Chars[charName].lastValidX=X; 
		JAG.DATA.Chars[charName].lastValidY=Y;


	////////////////////////////////////////////////
	// OUT OF BOUNDS - RETURN TO LAST VALID POSITION
	////////////////////////////////////////////////
    }else{
		JAG.Story.walking=false;
		
		
		// CHECK UNDEFINED [ CIRCUMVENTS ERROR ON FIRST RUN ]
		if(typeof JAG.DATA.Chars[charName].lastValidX != undefined || typeof JAG.DATA.Chars[charName].lastValidY != undefined){ 
			X=JAG.DATA.Chars[charName].lastValidX; 
			Y=JAG.DATA.Chars[charName].lastValidY; 
		};


		/////////////////////////////////////////////////
		// STOP WALKING AND MOVE CHARACTER BACK IN BOUNDS
		/////////////////////////////////////////////////
		$Char.stop(true,false).stopWalking(JAG, false);
		$Char[0].style.top=((Y-CH)/sD.sceneH)*100+'%';
		$Char[0].style.left=((X-(CW/2))/sD.sceneW)*100+'%';
	};

	return $(this);
},




/***********************************************************************************************/
// GETS POSITION/SIZING CURRENT CHARACTER - $Char.getCharData();
/***********************************************************************************************/
getDimsPos:function(){
	var elInfo=$(this)[0].getBoundingClientRect();

	return { 
		$el:$(this),
		W:elInfo.width,
		H:elInfo.height,
		Left:elInfo.x,
		Top:elInfo.y,
		Bottom:elInfo.y+elInfo.height,
		Right:elInfo.x+elInfo.width 
	};
},




/***********************************************************************************************/
// OBJECT COLLISION LOGIC - $obj.collision(JAG);
/***********************************************************************************************/
collision:function(JAG){
	var charName=JAG.FUNC.getName(JAG.OBJ.$selectedChar);
	if(JAG.Story.switchingScenes || JAG.DATA.Chars[charName].action) return;

	
	///////////////////////////////////////////////
	// GET CHARACTER AND OBJECT POSITION/DIMENSIONS
	///////////////////////////////////////////////
	var Char=JAG.OBJ.$selectedChar.getDimsPos(),
		Obj=$(this).getDimsPos();	
	
	
	////////////
	// COLLISION
	////////////
	if((Char.Right > Obj.Left && Char.Left < Obj.Right) && (Char.Bottom > Obj.Top && Char.Top < Obj.Bottom) && Obj.$el.hasClass('JAG_Item')){

		///////////////////////////////////////////////////
		// OBJECT IS AN EXIT ITEM THAT CAN BE COLLIDED WITH
		///////////////////////////////////////////////////
		var oD=Obj.$el.data('item');
		if((oD.type==='exit' && oD.exit_style.split(',')[0].removeWS().isB()) && JAG.OBJ.$selectedExit[0]===Obj.$el[0]){

			//////////////////////////////////////////////////////////////////
			// SEE HOW MUCH CHARACTER OVERLAPS EXIT TO DETERMINE IF GOTO FIRES
			//////////////////////////////////////////////////////////////////
			var diffBottom=Math.max(Char.Bottom, Obj.Bottom) - Math.min(Char.Bottom, Obj.Bottom),
				diffLeft=Math.max(Char.Left, Obj.Left) - Math.min(Char.Left, Obj.Left),
				perBottom=((Obj.H - diffBottom)/Obj.H)*100,
				perLeft=((Obj.W-diffLeft)/Obj.W)*100,
				overlap=oD.exit_overlap.split(',');


			///////////////////////////////////////////////////////////////
			// CHARACTER IS OVERLAPPING EXIT ENOUGH - PROCEED TO NEXT SCENE
			///////////////////////////////////////////////////////////////
			if(perLeft > overlap[0].pF() && perBottom > overlap[1].pF()){
				// STOP CHARACTER WALKING [ PREVENTS MULTIPLE TRANSITIONS ]
				Char.$el.stop(true,false);
				$(JAG.OBJ.$currentScene).transSceneOut(JAG, $('#'+oD.goto)[0], Obj.$el);
			};
		};
	};
},





/***********************************************************************************************/
// ITEM LAYERING [ TYPE=LAYER ] - $Char.layerItem(JAG, $sceneItems, l, initial); 
// WHEN LAYERING INITIALLY, UNITS ARE IN %, THEN SWITCH TO PX
/***********************************************************************************************/
layerItem:function(JAG, $sceneItems, l, initial){

	//////////////////////////////
	// GET CHARACTER FEET POSITION
	//////////////////////////////
	var $Char=$(this),
		sD=JAG.DATA.sD,
		CharInfo=$Char[0].getBoundingClientRect(),
		Char_Feet=!initial ? CharInfo.bottom : (JAG.DATA.Chars[JAG.FUNC.getName($Char)].initY.pF()/100) * sD.sceneH;


	///////////////////////////
	// LOOP THROUGH SCENE ITEMS
	///////////////////////////
	for(var i=0; i<l; i++){
		
		
		//////////////////////////////////
		// MIDDLEGROUND ITEMS & CHARACTERS
		//////////////////////////////////
		var $El=$($sceneItems[i]),
			elInfo=$El[0].getBoundingClientRect(),
			isChar=$El.hasClass('JAG_Char_El'),
			eD=isChar ? JAG.DATA.Chars[JAG.FUNC.getName($El)] : JAG.DATA.Items[JAG.FUNC.getItemName($El)];


		///////////////////////////////////
		// ADJUST zINDEX [FRONT=6] [BACK=3]
		///////////////////////////////////
		if(eD!==undefined && eD.type==='layer' || isChar){
				

			///////////////////////////////////////////
			// NOT INITIAL LOAD [ HASLAYOUT / WALKING ]
			///////////////////////////////////////////
			if(!initial){
				var El_Height=elInfo.height,
					El_Top=isChar ? (JAG.DATA.Chars[JAG.FUNC.getName($El)].initY.pF()/100) * sD.sceneH : elInfo.top,
					El_Bottom=isChar ? El_Top : El_Top + El_Height;
				
				
			//////////
			// INITIAL
			//////////
			}else{
				var El_Height=($El.height()/100) * sD.sceneH,
					El_Top=($El.css('top').pF()/100) * sD.sceneH,
					El_Bottom=isChar ? El_Top : El_Top + El_Height;					
			};
				
				

			//////////////////////////
			// IF ITEM IS SET TO LAYER
			//////////////////////////
			if(eD.layer){

				
				//////////////////
				// AUTO SET ZINDEX
				//////////////////
				if(eD.layer==true || isNaN(eD.layer)){
					// CHARACTER IN FRONT
					if(Char_Feet > El_Bottom){ 
						$El[0].style.zIndex=3;

					// CHARACTER IS BEHIND
					}else if(Char_Feet < El_Bottom){ 
						$El[0].style.zIndex=6;	
					};
				
				//////////////////////
				// MANUALLY SET ZINDEX
				//////////////////////
				}else{
					$El[0].style.zIndex=eD.layer;
				};


			/////////////////////////////////////////////////////////////////
			// ALLOW FOR PLACING SCENE ITEMS ON TOP OF SCENE ITEMS THAT LAYER
			/////////////////////////////////////////////////////////////////
			}else{
				$El[0].style.zIndex=3;
			};
		};
	};
	
	return $(this);
},





/***********************************************************************************************/
// CHARACTER PERSPECTIVE SCALING - $Char.scale(JAG, cD, Y);
/***********************************************************************************************/
scale:function(JAG, cD, Y){
	var $Char=$(this),
		SceneH=JAG.OBJ.$currentScene.height(), 
		sD=JAG.DATA.sD,
		From=(sD.horizonLine.pF()/100) * SceneH,
		To=(sD.groundLine.pF()/100) * SceneH,
		//////////////////////////////////////////
		// ON INITIAL LOAD CHARS DON'T HAVE LAYOUT
		// SO PASS IN TOP POSITION OF CHARACTER
		//////////////////////////////////////////
		charTop=Y ? (Y.pF()/100)*SceneH : $Char[0].getBoundingClientRect().bottom,
		scaleTo=Math.abs((charTop-From)/(To-From)),
		scale=cD.scale.split(',');


	//////////////////////////////////////////////////
	// KEEP WITHIN USER-DEFINED MIN/MAX SCALING RANGES
	//////////////////////////////////////////////////
	if(scaleTo < scale[0].pF() || scaleTo < 0) scaleTo=scale[0].pF();
	if(scaleTo > scale[1].pF()) scaleTo=scale[1].pF();

	var SW=(((cD.orgCharW * JAG.Scaling.gameScaled)/sD.sceneW)*100)*scaleTo, 
		SH=(((cD.orgCharH * JAG.Scaling.gameScaled)/SceneH)*100)*scaleTo,
		mT=-((SH/100)*SceneH);



	//////////////////////////////////////////////////////////////////////////////
	// IMPORTANT - CHARACTER CONTAINER IS POSITIONED BY DEFAULT AT TOP/LEFT CORNER
	// THIS HAS NO BEARING WHEN SCALING/RESIZING THE CHARACTER OR GAME
	// FOR THE APPEARANCE OF WALKING TO CORRECT LOCATION, NEGATIVE MARGINS ARE 
	// USED. PAY CLOSE ATTENTION TO USING OUTERWIDTH/OUTERHEIGHT ON CHARACTERS
	// ONLY SCALE IF CHARACTER IS BETWEEN THE HORIZON AND GROUND LINES 
	///////////////////////////////////////////////////////////////////////////////
	if(charTop > From && charTop < To || Y){
		$Char[0].style.width=SW+'%';
		$Char[0].style.height=SH+'%';
		$Char[0].style.marginLeft=-(SW.pF()/2)+'%';
		$Char[0].style.marginTop=mT+'px';
	};
	

	return $Char;		
},










/***********************************************************************************************/
// RETURN DISTANCE BETWEEN 2 OBJECTS - $obj1.returnDist($obj2);
/***********************************************************************************************/
returnDist:function($obj2){
	
	//////////////////////////////////////////////////
	// PYTHAGOREAN MEASURE BETWEEN OBJECT CENTERPOINTS
	//////////////////////////////////////////////////
	var $obj1=$(this).find('img'),
		AcD=$obj2.hasClass('JAG_Char_El') ? $obj2.data('character') : $obj2.data('item'),		
		obj1Data=$obj1[0].getBoundingClientRect(),
		obj1Left=obj1Data.left + obj1Data.width/2,
		obj1Top=obj1Data.top + obj1Data.height/2,
		obj2Data=$obj2[0].getBoundingClientRect(),
		obj2Left=obj2Data.left + obj2Data.width/2,
		obj2Top=obj2Data.top + obj2Data.height/2,
		distance=Math.sqrt(Math.pow(obj1Left-obj2Left,2) + Math.pow(obj1Top-obj2Top,2));
		
	return Diff={
		AcD:AcD,
		Left:obj1Left < obj2Left ? true : false,
		Higher:obj1Top < obj2Top ? true : false,
		X:obj2Left,
		Y:obj2Top,
		distance:distance
	};
}});