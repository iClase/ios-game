/***********************************************************************************************/
// Jaguar - BUILD ASSIST / DEBUG MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD DEBUG ASSIST TOOLS - $scene.buildDebug(JAG);
/***********************************************************************************************/
buildDebug:function(JAG){
	
	
	///////////////////////////
	// ADD DEBUG WINDOW TO PAGE
	///////////////////////////
	$('<div id="JAG_Debug_Window">\
		<h2>JAGUAR ENGINE CONSOLE</h2>\
		<p id="JAG_Debug_currentScene">SCENE: </p>\
		<div id="JAG_mouseCoords"><p>mouse coordinates = X:0 Y:0</p></div>\
		<div class="JAG_Debug_Left">\
		<div class="JAG_Debug_Line"><label><input type="checkbox" name="Show_Path"/><span>Walking Path</span></label></div>\
		<div class="JAG_Debug_Line"><label><input type="checkbox" name="Char_Lines"/><span>Character Boundaries</span></label></div>\
			<div class="JAG_Debug_Line"><label><input type="checkbox" name="Item_Lines"/><span>Item Borders</span></label></div>\
			<div class="JAG_Debug_Line"><label><input type="checkbox" name="opacity"/><span>Hide Items</span></label></div>\
		</div>\
		<div class="JAG_Debug_Right">\
			<div class="JAG_Debug_Line"><label><input type="checkbox" name="hide_FG"/><span>Hide Foreground</span></label></div>\
			<div class="JAG_Debug_Line"><label><input type="checkbox" name="horizon_Line"/><span>Horizon & Ground Lines</span></label></div>\
			<div class="JAG_Debug_Line"><label><input type="checkbox" name="show_Clip"/><span>Panning Scene Guide</span></label></div>\
		</div><div class="JAG_clear"></div>\
		<div class="JAG_Debug_JumpWrapper"><p>Jump to Scene [ID]</p><input type="text" name="jumpTo"/><div id="JAG_jumpToScene">GO</div></div></div>\
	</div>').prependTo(JAG.OBJ.$Game);
		
		
		
	////////////////////////////////////////
	// SETUP DEBUG EVENTS AND MAKE DRAGGABLE
	////////////////////////////////////////
	JAG.OBJ.$Debug=$('#JAG_Debug_Window');
	JAG.OBJ.$Debug.dragDebug().on('change',function(e){
		var $target=e.target;
		switch(e.target){
			case JAG.OBJ.$Debug.find('input[name="Show_Path"]')[0] 		:  $(e.target).debugPath(JAG); break;
			case JAG.OBJ.$Debug.find('input[name="Item_Lines"]')[0] 	:  $(e.target).debugItemLines(JAG); break;				
			case JAG.OBJ.$Debug.find('input[name="hide_FG"]')[0] 		:  $(e.target).debugForeground(JAG); break;				
			case JAG.OBJ.$Debug.find('input[name="horizon_Line"]')[0] 	:  $(e.target).debugHorizon(JAG); break;				
			case JAG.OBJ.$Debug.find('input[name="Char_Lines"]')[0] 	:  $(e.target).debugCharLines(JAG); break;				
			case JAG.OBJ.$Debug.find('input[name="show_Clip"]')[0] 		:  $(e.target).debugSceneClipping(JAG); break;				
			case JAG.OBJ.$Debug.find('input[name="opacity"]')[0] 		:  $(e.target).debugOpacity(JAG); break;								
		};
			


	//////////////////////
	// SETUP JUMP TO INPUT
	//////////////////////
	}).find('input[name="jumpTo"]').on('keypress',function(e){ 
		var code=e.keyCode||e.which; 
		if(code===13) $(this).jumpToScene(JAG, JAG.OBJ.$Debug.find('input[name="jumpTo"]').val()); 
	});

	$('#JAG_jumpToScene').on('click',function(){ 
		$(this).jumpToScene(JAG, JAG.OBJ.$Debug.find('input[name="jumpTo"]').val()); 
	});

	return $(this);
},









/***********************************************************************************************/
// OPEN DEBUG WINDOW - JAG.OBJ.$Debug.openDebug(JAG);
/***********************************************************************************************/
openDebug:function(JAG){
	
	///////////////////////////////////
	// CUTSCENE DEBUGGING NOT SUPPORTED
	///////////////////////////////////
	if(!JAG.FUNC.noSpecialScene()){ 
		JAG.OBJ.$Game.swapCursor(JAG, 500); 
		return; 
	};


	JAG.Story.showingDebug=true;		
	JAG.OBJ.$Debug[0].style.display='block';
	JAG.OBJ.$Debug.stop(true,false).animate({opacity:1},{duration:400,queue:false,complete:function(){


		////////////////////////////////
		// MOUSEMOVE COORDINATE TRACKING
		////////////////////////////////
		JAG.OBJ.$Game.on('mousemove.Jaguar_Debugger',function(e){ 
			var X=Math.round(((e.pageX-JAG.DATA.gD.offset.left)/JAG.DATA.gD.viewportW)*100),
				Y=Math.round(((e.pageY-JAG.DATA.gD.offset.top)/JAG.DATA.gD.viewportH)*100);
			$('#JAG_mouseCoords')[0].innerHTML='<p>mouse coordinates = X:'+X+'% Y:'+Y+'%</p>'; 
		});			
	}});
},








/***********************************************************************************************/
// CLOSE DEBUG WINDOW - JAG.OBJ.$Debug.closeDebug(JAG);
/***********************************************************************************************/
closeDebug:function(JAG){
	JAG.Story.showingDebug=false;
	JAG.OBJ.$Debug.stop(true,false).animate({opacity:0},{duration:400,queue:false,complete:function(){
		JAG.OBJ.$Debug[0].style.display='none';
		JAG.OBJ.$Game.off('mousemove.Jaguar_Debuggger');
	}});
},








/***********************************************************************************************/
// DEBUG - HORIZON LINES
/***********************************************************************************************/
debugHorizon:function(JAG){
	var $Chap=JAG.OBJ.$currentChapter;		


	/////////////////////////////////////
	// DEBUGGING HORIZON/FOREGROUND LINES
	/////////////////////////////////////
	if($(this)[0].checked){			
		var HOR=JAG.DATA.sD.horizon.split(','),
			HLTop=((HOR[0].pF()/100)*JAG.DATA.sD.sceneH.pF()),
			FLTop=((HOR[1].pF()/100)*JAG.DATA.sD.sceneH.pF());


		////////////////////////////////
		// ADD LINES IF THEY DON'T EXIST
		////////////////////////////////
		if(!$Chap.find('div.JAG_horizonLine').length){
			$('<div class="JAG_horizonLine"><div class="JAG_Circle"/></div><div class="JAG_GroundLine"><div class="JAG_Circle"/></div></div>')
			.prependTo($Chap);
		};


		//////////////
		// STYLE LINES
		//////////////
		var $HL=$Chap.find('div.JAG_horizonLine'),
			$GL=$Chap.find('div.JAG_GroundLine');
		$HL[0].style.width='100%';
		$HL[0].style.left=0;
		$HL[0].style.top=HLTop+'px';
		$GL[0].style.width='100%';
		$GL[0].style.left=0;
		$GL[0].style.top=FLTop+'px';

	}else{
		

		///////////////
		// REMOVE LINES
		///////////////
		if($Chap.find('div.JAG_horizonLine').length){ 
			$Chap.find('div.JAG_horizonLine').add($Chap.find('div.JAG_GroundLine')).remove(); 
		};
	};
},








/***********************************************************************************************/
// DEBUG - FOREGROUND SHOW/HIDE
/***********************************************************************************************/
debugForeground:function(JAG){ 
	if(JAG.OBJ.$foreground) JAG.OBJ.$foreground[0].style.display=$(this)[0].checked ? 'none' : 'block'; 
},




/***********************************************************************************************/
// DEBUG - PATH SHOW/HIDE
/***********************************************************************************************/
debugPath:function(JAG){ 
	if(JAG.OBJ.$canvas) JAG.OBJ.$canvas.style.display=$(this)[0].checked ? 'block' : 'none'; 
},





/***********************************************************************************************/
// DEBUG - ITEM BOUNDARY LINES
/***********************************************************************************************/
debugItemLines:function(JAG){
	if($(this)[0].checked){ 
		JAG.OBJ.$currentScene.find('div.JAG_Item').addClass('JAG_itemLines');
	}else{ 
		JAG.OBJ.$currentScene.find('div.JAG_Item').removeClass('JAG_itemLines'); 
	};
},





/***********************************************************************************************/
// DEBUG - CHARACTER BOUNDARY LINES
/***********************************************************************************************/
debugCharLines:function(JAG){
	var $Scene=JAG.OBJ.$currentScene,
		$Char=JAG.OBJ.$selectedChar;
	if($Scene.find('div.JAG_Char_El').length){	
		if($(this)[0].checked){ 
			$Char.addClass('JAG_charLines');
			if(!$Char.find('.JAG_charSpot').length) $Char.append('<div class="JAG_charSpot"/>');	
		}else{
			$Char.removeClass('JAG_charLines').find('div.JAG_charSpot').remove();
		};
	};
},






/***********************************************************************************************/
// DEBUG - SCENE PANNING [ SHOW CLIPPING ]
/***********************************************************************************************/
debugSceneClipping:function(JAG){
	var $Chap=JAG.OBJ.$currentChapter;
	
	if($(this)[0].checked && JAG.DATA.sD.pan){

		//////////////
		// ADD MIDLINE
		//////////////
		if(!$Chap.find('div.JAG_midLine').length) $('<div class="JAG_midLine"/>').prependTo($Chap);


		////////////////////////////////		
		// SHOW CLIPPING + STYLE MIDLINE
		////////////////////////////////		
		$Chap[0].style.overflow='visible';

	}else{
		
		///////////////////////////////////
		// REMOVE MIDLINE AND HIDE CLIPPING
		///////////////////////////////////
		$Chap[0].style.overflow='hidden';		
		$Chap.find('div.JAG_midLine').remove();
	};			
},








/***********************************************************************************************/
// DEBUG - TOGGLE ITEM VISIBILITY (HELPS WITH POSITIONING ITEMS)
/***********************************************************************************************/
debugOpacity:function(JAG){ 
	JAG.OBJ.$currentChapter.find('div.JAG_Item')[0].style.opacity=$(this)[0].checked ? 0 : 1; 
},





/***********************************************************************************************/
// DEBUG - JUMP TO SCENE
/***********************************************************************************************/
jumpToScene:function(JAG, $goto){

	/////////////////////////////////////////////////////
	// RETURN IF SCENE VALUE LENGTH IS TOO SMALL OR EMPTY
	/////////////////////////////////////////////////////
	if(!$goto.length || $goto==undefined || JAG.Story.switchingScenes){ 
		if(JAG.Story.showingDebug) alert("Invalid Scene"); 
		return; 
	};
	
	
	////////////////////////
	// CHECK IF SCENE EXISTS
	////////////////////////
	if(!$('#'+$goto.removeWS()).length){ 
		alert("Scene does not exist"); 
		return; 
	};



	///////////////////////////
	// TRANSITION TO NEXT SCENE
	///////////////////////////
	$(JAG.OBJ.$currentScene).transSceneOut(JAG, $('#'+$goto.removeWS())[0], false);
}});








/***********************************************************************************************/
// DRAG FUNCTIONALITY FOR DEBUG WINDOW
/***********************************************************************************************/
(function($) {
    $.fn.dragDebug=function(opt){
        opt=$.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle===""){ var $el=this;
        }else{ var $el=this.find(opt.handle); };

        return $el.css('cursor', opt.cursor).on("mousedown", function(e){
			// ALLOW TYPING IN TEXT FIELD
			if(e.target===$('#JAG_Debug_Window').find('input[name=jumpTo]')[0]) return;

            if(opt.handle===""){
                var $drag=$(this).addClass('draggable');
            }else{
                var $drag=$(this).addClass('active-handle').parent().addClass('draggable');
            };
			
            var z_idx=$drag.css('z-index'),
                drg_h=$drag.outerHeight(),
                drg_w=$drag.outerWidth(),
                pos_y=$drag.offset().top+drg_h-e.pageY,
                pos_x=$drag.offset().left+drg_w-e.pageX;
				
            $drag.css('z-index', 999999999).parents().on("mousemove", function(e){
                $('.draggable').offset({
                    top:e.pageY+pos_y-drg_h,
                    left:e.pageX+pos_x-drg_w

                }).on("mouseup", function(){
					$(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); 
			
        }).on("mouseup", function(){
            if(opt.handle===""){ $(this).removeClass('draggable');
            }else{ $(this).removeClass('active-handle').parent().removeClass('draggable'); };
        });
    };
})(jQuery);