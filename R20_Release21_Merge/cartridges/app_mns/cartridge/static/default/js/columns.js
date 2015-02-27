/**
 *   This file will allow us to render the SEO text in columns for non-supporting browsers of CSS columns
 *   IE 9 and below
 */
/**  This file is unused now. INT 1207.
 *   $(document).ready(function(){
 *	if($('.seoContent').html() !== null){
 *		var content = $(".seoContent").html().split(" ");
 *		var contentLen = content.length;
 *		var splitIndex = Math.floor(contentLen/2);
 *		
 *		$(".seoContent").html("");
 *		$(".seoContent").append("<div class = 'seoContentLeft'></div>");
 *		$(".seoContent").append("<div class = 'seoContentRight'></div>");
 *		
 *		for(var i = 0; i < splitIndex; i++){
 *			$(".seoContentLeft").append(content[i] + " ");
 *
 *		}
 *		for(var i = splitIndex; i < contentLen; i++){
 *			$(".seoContentRight").append(content[i] + " ");
 *		}
 *	}
 *  });
 */