
/*
 * Superfish v1.4.8 - jQuery menu widget
 * Copyright (c) 2008 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	http://www.gnu.org/licenses/gpl.html
 *
 * CHANGELOG: http://users.tpg.com.au/j_birch/plugins/superfish/changelog.txt
 */

;(function($){
	$.fn.superfish = function(op){

		var sf = $.fn.superfish,
			c = sf.c,
			$arrow = $(['<span class="',c.arrowClass,'"> &#187;</span>'].join('')),
			over = function(){
				var $$ = $(this), menu = getMenu($$);
				clearTimeout(menu.sfTimer);
				$$.showSuperfishUl().siblings().hideSuperfishUl();
			},
			out = function(){
				var $$ = $(this), menu = getMenu($$), o = sf.op;
				clearTimeout(menu.sfTimer);
				menu.sfTimer=setTimeout(function(){
					o.retainPath=($.inArray($$[0],o.$path)>-1);
					$$.hideSuperfishUl();
					if (o.$path.length && $$.parents(['li.',o.hoverClass].join('')).length<1){over.call(o.$path);}
				},o.delay);	
			},
			getMenu = function($menu){
				var menu = $menu.parents(['ul.',c.menuClass,':first'].join(''))[0];
				sf.op = sf.o[menu.serial];
				return menu;
			},
			addArrow = function($a){ $a.addClass(c.anchorClass).append($arrow.clone()); };
			
		return this.each(function() {
			var s = this.serial = sf.o.length;
			var o = $.extend({},sf.defaults,op);
			o.$path = $('li.'+o.pathClass,this).slice(0,o.pathLevels).each(function(){
				$(this).addClass([o.hoverClass,c.bcClass].join(' '))
					.filter('li:has(ul)').removeClass(o.pathClass);
			});
			sf.o[s] = sf.op = o;
			
			$('li:has(ul)',this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over,out).each(function() {
				if (o.autoArrows) addArrow( $('>a:first-child',this) );
			})
			.not('.'+c.bcClass)
				.hideSuperfishUl();
			
			var $a = $('a',this);
			$a.each(function(i){
				var $li = $a.eq(i).parents('li');
				//$a.eq(i).focus(function(){over.call($li);}).blur(function(){out.call($li);}); // QC 925
			});
			o.onInit.call(this);
			
		}).each(function() {
			menuClasses = [c.menuClass];
			if (sf.op.dropShadows  && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
			$(this).addClass(menuClasses.join(' '));
		});
	};

	var sf = $.fn.superfish;
	sf.o = [];
	sf.op = {};
	sf.IE7fix = function(){
		var o = sf.op;
		if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity!=undefined)
			this.toggleClass(sf.c.shadowClass+'-off');
		}; 
	sf.c = {
		bcClass     : 'sf-breadcrumb',
		menuClass   : 'sf-js-enabled',
		anchorClass : 'sf-with-ul',
		arrowClass  : 'sf-sub-indicator',
		shadowClass : 'sf-shadow'
	};
	sf.defaults = {
		hoverClass	: 'sfHover',
		pathClass	: 'overideThisToUse',
		pathLevels	: 1,
		delay		: 0,           /* was 800 */
		animation	: {opacity:'show'},
		speed		: 'normal',
		autoArrows	: true,
		dropShadows : true,
		disableHI	: false,		// true disables hoverIntent detection | 673 QC Fix
		onInit		: function(){}, // callback functions
		onBeforeShow: function(){
			

		/* MattS : TODO - Rework UL variable passed through - 
		 * contains multiple Nav elements  as an array - we only need the current UL */ 
			var _this = $(this[0]); // /* MattS - TODO requires first variable, array is sent through. Should be sent through as single object.  */
			//var _this = $(this);  // Original setting
			var _parent = _this.parent(); 
			var ulWidth, docWidth, 
				pageWidth = 960, // Width of main content column docHalfWidth, 
				pageMarginOffset,offset,leftOffset, vardiff, parentLIWidth;
				
				docWidth = $(document).width();				
				docHalfWidth = (docWidth - pageWidth) / 2; // Width of left hand side margin				
				
				pageWidthWithGutter = pageWidth + docHalfWidth;
				
				offset = _this.parent().offset();
				leftOffset = offset.left;	// distance of li element to left hand side of document				
				ulWidth = _this.width();	// Width of UL			
				
				widthDiff = pageWidth - ulWidth;
				newLeftPos = widthDiff;
				
				parentLIWidth = _parent.width();  				
				
				// need to display the dropdown to the left if there is no space on the right
				if(leftOffset + ulWidth > pageWidthWithGutter){
					widthDiff = ulWidth - parentLIWidth + 6;										
					newLeftPos =  leftOffset - (widthDiff + docHalfWidth); 	
					_this.css("left", "-" + widthDiff + "px");
					
					// if there are more than 3 columns and displaying to left pushes the dropdown over the edge of the page
					if ( ulWidth > leftOffset ){
						var newOffsetDiff = leftOffset - docHalfWidth + 1;
						var bname = navigator.appName;
						if (bname == "Microsoft Internet Explorer") {
							newOffsetDiff = newOffsetDiff + 10;
						}
						_this.css("left", "-" + newOffsetDiff + "px");	
					}
					
				}	
		},
		onShow		: function(){	
			// remove this line here
			//$(this).parent().children('a').addClass("highlight");	
			$(this).find(".subUL").css('display', 'block');
			$('[id^="contflyzoom"]').css('display', 'none'); // PDP zoom fix on ipad
		},
		onHide		: function(){	
			// remove this line here
			//$(this).parent().children('a').removeClass("highlight");
			$(this).parent().find('a').removeClass("highlight");
			$('[id^="contflyzoom"]').css('display', 'block'); // PDP zoom fix on ipad
		}
	};
	$.fn.extend({
		hideSuperfishUl : function(){
			var o = sf.op,
				not = (o.retainPath===true) ? o.$path : '';
			o.retainPath = false;			
			var $ul = $(['li.',o.hoverClass].join(''),this).add(this).not(not).removeClass(o.hoverClass).find('>ul:not(:first-child)').hide().css('visibility','hidden');	
			
			o.onHide.call($ul); 
			
			// line added here
			$(this).children('a').removeClass("highlight");
			return this;
		},
		showSuperfishUl : function(){
		
			var o = sf.op,
				sh = sf.c.shadowClass+'-off',
				$ul = this.addClass(o.hoverClass)
					.find('ul:hidden').css('visibility','visible');
			sf.IE7fix.call($ul);
			o.onBeforeShow.call($ul);
			$ul.animate(o.animation,o.speed,function(){ sf.IE7fix.call($ul); o.onShow.call($ul); });
			
			// line added here
			$(this).children('a').addClass("highlight");	
			return this;
		}
	});

})(jQuery);
//INC000006656850
$(document).ready(function(){
	//Where there are 4 columns, their left will start from the parent UL.
	$(".categorymenu > ul > li > ul.cols4").parent().css("position","static");
	
	//first five LI given class "leftPosCols3" if there is submenu with class "cols3" will start from the parent UL left
	//only for the first five LIs. rest will behave normal as per the plugin.
	for(i=0;i<5;i++){
		$(".categorymenu > ul > li:eq("+i+")").addClass("leftPosCols3");
		$(".categorymenu > ul > li:eq("+i+") > ul.cols3").parent().css("position","static");
	}
});
