var ms = ms ? ms : {};
ms.util = ms.util ? ms.util : {}

ms.util.sIFRSplice = function( selector , maxchars , font, color, flashvars  ){
	/* crude. assumes plain text only 
	 * could do with speeding up.
	 * function cuts text to size for iSFR to replace. */
	var items = $(selector);
	if(!items.get(0)){return;}
	
	items.each(function(idx,item){
		
		item=$(item);
		/* added following two lines to fix 947 */
		var classname = item.attr('class');
		if(classname != null && classname.indexOf("sIFR-replaced") >= 0){
			return;
		}
		var content = item.text();
		content = jQuery.trim(content); //678
		var len = content.length;
		if(len < maxchars){return;}
		var container = item.parent();
		var aftertarget = item;
		/* split the text */
		content = content.replace('&#160;',' ');/*968*/
		content = content.replace(/\s{2,8}/,' ').split(' ');
		var localTotal = 0;
		var chunk=[];
		var i = 0;
		var isFirstLine = true;
		while(i <= content.length-1){
				localTotal += content[i].split('').length+1;
				if(localTotal > maxchars){
					/* limit reached, chunk */
					if(isFirstLine) {
						item.text(chunk.join(' '));
						isFirstLine = false;
					}else{
						container.append(item.clone().attr('id',item.attr('id')+'_'+i).empty().text(chunk.join(' ')));
					}
					localTotal=0;
					chunk=[];
				}
				chunk[i] = content[i];
				i++;
		}
		if (!isFirstLine) {
			container.append(item.clone().attr('id',item.attr('id')+'_'+i).empty().text(chunk.join(' ')));
		}
	});
	
	
	if(!color){
		sColor = '#333333';
	}
	if(!flashvars){
		flashvars = "";
	}
	/* do actual SiFR replacement */
	/* sIFR.replaceElement(named({sSelector:selector, sFlashSrc: font, sColor:color, sWmode:"transparent", sFlashVars : "textalign=center" })); */
	 sIFR.replaceElement(named({sSelector:selector, sFlashSrc: font, sColor:color, sWmode:"transparent", sFlashVars : flashvars }));
} 


function sifr_replace() {
	if(!sIFR.replaceElement){return}
	/* TODO: respond to dialog create
	 * http://docs.jquery.com/UI/Dialog/dialog#events: create
	 * should be able to prototype the Dialog default or use default {params}
	 * for Quickview header for example.
	 * 
	 * Also respond to DOM injection. [to be researched]*/
	ms.util.sIFRSplice( ".productdetailcolumn .ms_header_4" , 42, sifr_fonts["helvNeueUltraLight"]); /*30-may-2011 - Altered character length - was 80*/
	ms.util.sIFRSplice( ".ms_header_cart" , 75 , sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".ms_header_1" , 40 , sifr_fonts["helvNeueUltraLight"]); 
	ms.util.sIFRSplice( ".ms_header_3" , 80 , sifr_fonts["helvNeueUltraLight"]); /*07-apr-2011*/ /* 30-may-2011 - Altered character length - was 80 */ 
	ms.util.sIFRSplice( ".ms_header_4" , 80 , sifr_fonts["helvNeueUltraLight"]); /*30-may-2011 - Altered character length - was 80 */
	//ms.util.sIFRSplice( ".ms_header_5" , 20 , sifr_fonts["helvNeueUltraLight"]); 
	ms.util.sIFRSplice( ".category_banner_header" , 25 ,sifr_fonts["helvNeueUltraLight"],"#4b4b4b"); //slide 10 | Patch required for sIFR 30th August -- //CR 117
	ms.util.sIFRSplice( ".category_banner_header_whiteHeading" , 25 ,sifr_fonts["helvNeueUltraLight"],"#ffffff"); // QC 949 
	ms.util.sIFRSplice( ".ms_header_login" , 40 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".content_grey_header" , 45 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".ms_header_cartlinks" , 45 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".ms_header_bottomsection2" , 25 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".ms_header_bottomsection3" , 60 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".content_grey_header2" , 40 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".overviewHead" , 40 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".content_checkout_header" , 30 ,sifr_fonts["helvNeueUltraLight"]); /*11-apr*/
	//ms.util.sIFRSplice( ".account_heading" , 20 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".account_heading span" , 20 ,sifr_fonts["helvNeueUltraLight"]); /* 1028 */
	//ms.util.sIFRSplice( ".ui-dialog-title" , 30 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".small_content_module h3" , 24 ,sifr_fonts["helvNeueUltraLight"],"#4b4b4b"); //CR 117
	ms.util.sIFRSplice( ".ms_header_account_login" , 24 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".home_banner_copy h2" , 20 ,sifr_fonts["helvNeueUltraLight"],"#4b4b4b"); //Hero Image | home-main | Black Color
	ms.util.sIFRSplice( ".home_banner_copy_whiteTextHeading h2" , 20 ,sifr_fonts["helvNeueUltraLight"],"#ffffff");// Hero Image | home-main | White Color
	ms.util.sIFRSplice( ".banner_head h2" , 45 ,sifr_fonts["helvNeueUltraLight"]); //CR 117
	ms.util.sIFRSplice( ".banner_head p" , 65 ,sifr_fonts["helvNeueUltraLight"]); //CR 117
	ms.util.sIFRSplice( "div.secondary_cat div.secondary_cat_style2 .promo_ad p" , 85 ,sifr_fonts["helvNeueUltraLight"],"#333333");
	ms.util.sIFRSplice( "div.secondary_cat .promo_ad p" , 55 ,sifr_fonts["helvNeueUltraLight"],"#ffffff");
	ms.util.sIFRSplice( ".category_banner_3_header h3" , 65 ,sifr_fonts["helvNeueUltraLight"],"#4b4b4b"); //23 sep
	ms.util.sIFRSplice( ".top_banner_txtimg h3" , 48 ,sifr_fonts["helvNeueUltraLight"]); //QC 949
	
	/*821*/
	//ms.util.sIFRSplice( ".product_category .title" , 16 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".sitemap h1" , 13 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( ".sitemap h2" , 40 ,sifr_fonts["helvNeueUltraLight"]);
	//ms.util.sIFRSplice( ".sideFaqs h3" , 15 ,sifr_fonts["helvNeueUltraLight"]);
	//ms.util.sIFRSplice( ".sideNeedHelp h3" , 15 ,sifr_fonts["helvNeueUltraLight"]);
	ms.util.sIFRSplice( "#homeSmallCarousel h3" , 20 ,sifr_fonts["helvNeueUltraLight"],'#4b4b4b');// CR 117
	ms.util.sIFRSplice( ".category_banner_2_headerSifr h2" , 24 ,sifr_fonts["helvNeueUltraLight"],'#4b4b4b'); //CR 117
	ms.util.sIFRSplice( "h3.faqHead" ,25 ,sifr_fonts["helvNeueUltraLight"],'', "");
	ms.util.sIFRSplice( ".contentArea h1" , 800 ,sifr_fonts["helvNeueUltraLight"], '', flashvars); // Content creation Aug 29, 2011
	ms.util.sIFRSplice( ".secondary_cat .headerHolder div.caption h2" , 23 ,sifr_fonts["helvNeueUltraLight"],'#4b4b4b'); //  Category Landing - Image Banner Text Sep 5, 2011 -- CR 117
	ms.util.sIFRSplice( ".secondary_cat .headerHolder div.captionwhite h2" , 23 ,sifr_fonts["helvNeueUltraLight"],'#ffffff'); //  Category Landing - Image Banner Text Sep 5, 2011
	ms.util.sIFRSplice( ".pt_productsearchresult_body .producthits .headerHolder div.caption h2" , 35 ,sifr_fonts["helvNeueUltraLight"],'#4b4b4b'); //  Category Landing - Image Banner Text Sep 5, 2011 -- CR 117
	ms.util.sIFRSplice( ".pt_productsearchresult_body .producthits .headerHolder div.captionwhite h2" , 35 ,sifr_fonts["helvNeueUltraLight"],'#ffffff'); //  Category Landing - Image Banner Text Sep 5, 2011
	ms.util.sIFRSplice( ".flTitleHolder .title" , 15 ,sifr_fonts["helvNeueUltraLight"]); //  CR 117
	
	var flashvars = "textalign=center";
	ms.util.sIFRSplice( ".sifr-pw" , 35 ,sifr_fonts["helvNeueUltraLight"], '', flashvars);	
	ms.util.sIFRSplice( ".errorHeader" , 300 ,sifr_fonts["helvNeueUltraLight"], '', flashvars);	
	
	
}

jQuery(document).ready(function(){
	sifr_replace();
});