/******************** LIGHT BOX PLUGIN *********************/
(function($){
	$.fn.mnsEUCountryOverlay = function(){
		return this.each(function(){
			//get Document Height to place on shadow
			var getFHeight = $(document).height();
			//get the close button
			var close = $(this).find("div.close");
			var obj = $(this);
			obj.before("<div id='countryShadow'></div>");
			var shadow = $(this).prev("#countryShadow");
			shadow.height(getFHeight).css("opacity","0.7");
			close.click(function(){
				shadow.fadeOut();
				obj.fadeOut();
			});
		});
	}
})(jQuery);
/****************** LIGHT BOX PLUGIN ENDS ******************/