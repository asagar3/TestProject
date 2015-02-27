/* Ajax Specific Calls*/
(function ($) {
		$.fn.vAlignAjax = function() {
			return this.each(function(i){
			var h = $(this).height();
			var oh = $(this).outerHeight();
			var mt = (h + (oh - h)) / 2;	
			$(this).css("margin-top", "-" + mt + "px");	
			$(this).css("top", "50%");
			$(this).css("position", "absolute");	
			});	
		};
		})(jQuery);
		$(".headerHolder div.caption").vAlignAjax(); /*CR 117 29 sep*/
		$(".headerHolder div.captionwhite").vAlignAjax(); /*CR 117 29 sep*/
