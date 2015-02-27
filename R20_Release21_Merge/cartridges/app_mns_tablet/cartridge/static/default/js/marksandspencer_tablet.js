/* global tools */

var debug = (function(jQuery) {
 
  return {

    /* GLOBAL: debug.on() debug.off()*/
    log : alert,
    preprocessor : null,
    mode : 0,
    output : '',
    on : function() {
      debug.mode = 1;
    },
    off : function() {
      debug.mode = 0;
    },
    flush : function() {
      if (debug.mode === 0) {
        return;
      }
      debug.log(debug.output);
      debug.output = '';
    },
    debugTimerTrace : function() {
      /*
       USAGE
       var debugtimerInstance = new debug.debugTimerTrace()
       debugtimerInstance.init();
       debugtimerInstance.trace( "any debug message" );
       debug.flush(); // if desired. output can be preserved
       @constructor
       @returns debug.debugTimerTrace instance
       */
      ;
      this.d1 = null;
      this.d2 = null;
      this.init = function() {
        if (debug.mode === 0) {
          return;
        }
        this.d1 = new Date();
        this.d1 = this.d1.getTime();
      };
      this.reset = this.init;
      this.trace = function(message, preprocessor) {
        if (debug.mode === 0) {
          return;
        }
        var msg = preprocessor ? preprocessor(message) : debug.preprocessor ? debug.preprocessor(message) : message;
        this.d2 = new Date();
        debug.output += message + " ::at:: " + (this.d2.getTime() - this.d1) + "\n";
      }
      return this;
    },
    debug : function() {
      /* USAGE
       * debug.debug(item,item, ...[n])
       * @returns void
       */
      if (console) {
        console.log(arguments);
      } else {
        alert(arguments);
      }
    }
  }
})(jQuery);

/****  DEV  TODO: comment out before going live.*****/
debug.on();

/* set up M&S object */
'use strict';
var ms = ms || {};
ms.util = ms.util || {};/* basic utilities */
ms.tools = ms.tools || {};/* factories if possible */
ms.events = ms.events || {};/* machine responders */
ms.forms = ms.forms || {};/* forms customisations [NOTE: validation is in app.js] */

/* respond to ajax create event */

ms.events.init = function() {
  $(document).bind("ajaxSuccess", function() {
    ms.events.ajaxSuccess.apply(ms.events, arguments)
  });
  //Vertical Alignment in ajax pages
}
ms.events.ajaxSuccessTimeout = null;
ms.events.ajaxSuccessArgs = null;
ms.events.ajaxSuccess = function(event, XMLHttpRequest, ajaxOptions) {

  /* timeout sIFR replacement for ajax content */
  if (ms.events.ajaxSuccessTimeout) {
    clearTimeout(ms.events.ajaxSuccessTimeout)
  };
  ms.events.ajaxSuccessArgs = arguments;
  setTimeout(ms.events.ajaxSuccessHandler, 500)
  //console.log(event)
  //console.log(XMLHttpRequest)
  //console.log(ajaxOptions)
}
ms.events.ajaxSuccessHandler = function() {
  /*get preserved last-success arguments
   * if you need more
   * event, XMLHttpRequest, ajaxOptions*/
  arguments = ms.events.ajaxSuccessArgs;
  //Praveen:-Commented for '3954482'
  //ms.forms.showvalidfrom();
  //sifr_replace();
  //Cufon.replace('.helpsection h3.faqHead');Cufon.replace('.ms_header_4');Cufon.replace('div.top_banner_grey .banner_head');Cufon.replace('.content_grey_header');Cufon.replace('.content_grey_header2');Cufon.replace('.content_checkout_header');Cufon.replace('.category_banner_header,.category_banner_header_whiteHeading');Cufon.replace('.headerHolder div.caption h2, .headerHolder div.captionwhite h2');//Cufon Text in ajax pages
}
/* Category landing page specific */
ms.category_landing = ms.category_landing ? ms.category_landing : {}

ms.category_landing.carousel = (function(jQuery) {
  return {

    /* user */
    animspeed : 750,
    interval : 6000, // was 6000 -  if 0 animation stopped | QC fix 954
    restart_delay : 15000,
    selectors : {
      item : ".category_banner_item, .home_banner_item",
      trigger : "#cat_banner_links li a, #home_banner_links li a",
      triggerLI : "#cat_banner_links li, #home_banner_links li"
    },
    button_active_class : 'active',

    /* internal */
    num_items : 0,
    items : null,
    triggers : null,
    triggersLI : null,
    current_item : null,
    last_item : null,
    animTimer : null,
    restartTimer : null,
    locked : false,

    init : function() {
      this.items = $(this.selectors.item);
      this.triggers = $(this.selectors.trigger);
      this.triggersLI = $(this.selectors.triggerLI);
      if (!this.items.get(0) || !this.triggers.get(0)) {
        /* nothing to execute on */
        return;
      }
      this.bindings();
      this.setup();
      this.current_item = 0;
      this.startTimer();
    },
    bindings : function() {
      this.items.bind('click', function(e) {
        ms.category_landing.carousel.item_click.apply(ms.category_landing.carousel, [e]);
      });
      this.triggers.bind('click', function(e) {
        ms.category_landing.carousel.trigger_click.apply(ms.category_landing.carousel, [e]);
      });
    },
    setup : function() {
      /*686803*/
      //$(this.items.get(0)).animate({
      if ($.browser.safari) {
        $(this.items.get(0)).css({
          opacity : 0.0,
          visibility : "visibile",
          "z-index" : 50
        }).animate({
          opacity : 1
        }, 1);
      } else {
        $(this.items.get(0)).css({
          opacity : 0.0,
          display : "block"
        }).animate({
          opacity : 1
        }, 1);
      }
      var len = this.items.length;
      if ($.browser.safari) {
        for (var i = 1; i < len; i++) {
          $(this.items.get(i)).animate({
            opacity : 0
            //}, 1 );
            /*686803*/
          }, 1).css({
            opacity : 0,
            visibility : "hidden",
            "z-index" : 0
          });

          //alert("bye")
        }
      } else {
        for (var i = 1; i < len; i++) {
          $(this.items.get(i)).animate({
            opacity : 0
            //}, 1 );
            /*686803*/
          }, 1).css({
            opacity : 0,
            display : "none"
          });
        }
      }

    },
    startTimer : function() {
      if (this.interval != 0) {
        this.animTimer = setInterval(function() {
          ms.category_landing.carousel.timerHandler.apply(ms.category_landing.carousel);
        }, this.interval)
      }
    },
    stopTimer : function() {
      if (this.interval != 0) {
        clearInterval(this.animTimer);
      }
    },
    timerHandler : function() {
      this.gotoItem();

    },
    gotoItem : function(num) {
      this.lock();
      this.hideItem(this.current_item);
      /*is now old item*/
      if (!num && num !== 0) {
        this.current_item++;
        if (this.current_item > this.items.length - 1) {
          this.current_item = 0;
        }
      } else {
        this.current_item = num;
      }
      this.showItem(this.current_item);
      this.setButton(this.current_item);
    },
    showItem : function(num) {
      /* 803353 */
      if ($.browser.safari) {
        $(this.items[this.current_item]).css({
          opacity : 0.0,
          visibility : "visible",
          "z-index" : 50
        }).animate({
          opacity : 1
        }, this.animspeed, this.release);
      } else {
        $(this.items[this.current_item]).css({
          opacity : 0.0,
          display : "block"
        }).animate({
          opacity : 1
        }, this.animspeed, this.release);
      }
    },
    hideItem : function(num) {
      /* 803353 */
      if ($.browser.safari) {
        $(this.items[this.current_item]).animate({
          opacity : 0
        }, this.animspeed, this.release).css({
          opacity : 0,
          visibility : "hidden",
          "z-index" : 0
        });
      } else {
        $(this.items[this.current_item]).animate({
          opacity : 0
        }, this.animspeed, this.release).css({
          opacity : 0,
          display : "none"
        });
      }
    },
    setButton : function(num) {
      this.triggersLI.each(function(idx, item) {
        $(item).removeClass(this.button_active_class)
      });
      $(this.triggersLI[num]).addClass(this.button_active_class);
    },
    suspend : function() {
      /* suspend all activity. usually used when item is hidden or out of view */
    },
    item_click : function(e) {
      if (this.locked == true) {
        return false;
      }
      /* currently not used */

    },
    trigger_click : function(e) {
      e.preventDefault();
      if (this.locked == true) {
        return false;
      }
      this.stopTimer();
      var target = e.target;
      for (var i = 0; i < this.triggers.length; i++) {
        if (this.triggers[i] == target) {
          this.gotoItem(i);
          break;
        }
      }

      return false;
    },
    lock : function() {
      ms.category_landing.carousel.locked = true;
    },
    release : function() {
      ms.category_landing.carousel.locked = false;
    }
  }
})(jQuery);

/**
* backToTop method is a part of ms.util namespace. It let user to scroll on the top of the page.
* It creates HTML part on the ready state and bind click functionality on the fly.
*
* @method backToTop
* @namespace ms.util
* @param NIL
* @return NIL
* @dependency jQuery
* @author Anoop Gupta
*/
ms.util.backToTop = {

  init : function() {
    ms.util.backToTop.initScroll();
  },

  initScroll : function() { 
  //check if form and image zoom overlay exist or not
 
  if(jQ('#modal-dialog:visible').length === 0){// performance tuning image native zoom
	    if ($('#to-top').length == 0) {
	      var backLinkHTML = '<div id="to-top" class="off-screen"><span class="back-top-link">' + app.resources["BACK_TO_TOP"]+ '</span></div>';
	      $(backLinkHTML).appendTo('body');
	    }
	 
	    var $toTop = $('#to-top');
	            
	    $(window).scroll(function(){
				
		      if (($(window).scrollTop() >= 1500) && (jQ('form').not('#SimpleSearchForm').length <= 2)) {    
		        $toTop.removeClass('off-screen');        	 
		      } 
		      else {
		        $toTop.addClass('off-screen');		        
		      }
	    
	   });
	
	    $toTop.live('click', function() {
	      $('body,html').animate({
	        scrollTop : 0
	      }, 800);
	
	    });
  } 
  }
},

/**
* scene7ImageZoom method is a part of ms.util namespace. It let user to zoom scene7 image.
* It creates HTML part on the ready state and bind carousel functionality on the fly.
*
* @method scene7ImageZoom
* @namespace ms.util
* @param NIL
* @return NIL
* @dependency jQuery/ Zepto/ Gesture.js for Pinch To Zoom
* @author Anoop Gupta
*/
ms.util.scene7ImageZoom = {

  init : function() {
    ms.util.scene7ImageZoom.setImageZoom();

  },
  createTabletOverlay : function() {
    var $modelBox = $('#modal-dialog'), totalHeight = $(document).height(),modelHTML;
    //if model box do not exits, create the HTML
    if (!$modelBox.length) {
      modelHTML = '<div id="modal-dialog">' + '<div>' + '<div class="modal-dialog-content">' + '</div>' + '</div>' + '</div>';

      $('body').append(modelHTML);
    } else {
      $modelBox.show();      
    }
     $('#to-top').hide();
    //caching object
    $modelBox = $('#modal-dialog');
    $modelBox.css('height', totalHeight + 'px');
    
    // close button functionality to close model box used for Image Zoom
    $('.close-img-zoom').live('click', function() {
      $modelBox.hide();
      //$('#to-top').show();
    });
   //scrolling to top so that user can see image zoom model box from the top
   $('body,html').animate({
        scrollTop : 0
      }, 800);
  },

  setImageZoom : function() {

    $('.scene7mainimage,.btn-large').live('click', function(e) {
    
       e.preventDefault();
      // prevent click if quick view open
     
      var elem = $(e.target);     
      if(elem.parents('#QuickViewDialog').length )      
      return false;
       // prevent click if quick view open	 ends
    
     
      ms.util.scene7ImageZoom.createTabletOverlay();
      var scene7OverlayHTML,      
      currentThumbImgSet,
      overlay_thumbarea,
      overlay_thumb_list,
      overlay_li_item,
      overlay_itemclass,
      overlay_tlen,
      img;
      
          
      scene7OverlayHTML = '<div class="img-zoom-prev" ></div>' + '<div class="img-zoom-next" ></div>' + '<div class="img-zoom-viewer">' + '<a href="#close" title="Close" class="close-img-zoom">X</a>' + '<div class="img-zoom-container" >' + '<img alt="scene7" class="img-zoom-main" src=""/>' + '</div>' + '<div class="img-zoom-thumbs-wrap">' + '<a href="" class="img-zoom-thumbs-prev" title=""></a>' + '<div class="img-zoom-thumbs">' + '</div>' + '<a href="" class="img-zoom-thumbs-next" title="}"></a>' + '</div>' + '</div>', modelWrapper = $('.modal-dialog-content'), currentimageSrc = $('.scene7mainimage').attr('src').replace(/\?.+/, "");
      modelWrapper.remove(scene7OverlayHTML).empty().html(scene7OverlayHTML);    
      $('.img-zoom-container').html('<div class="ajax-loader"></div>');
      loadMainImage(currentimageSrc);
 

      currentThumbImgSet = $('.scene7flyoutcontrol_thumbs').find('img');

      overlay_thumbarea = $('.img-zoom-thumbs');

      /* populate the thumbnails */
      overlay_thumbarea.empty();
      overlay_thumb_list = $('<ul></ul>');      
      overlay_tlen = $(currentThumbImgSet).length;

      $(currentThumbImgSet).each(function(indx, item) {

        overlay_itemclass = indx == overlay_tlen - 1 ? 'class="last"' : indx == 0 ? 'class="first"' : '';
        activeclass = currentimageSrc === item.src.replace(/\?.+/, "") ? ' borderinsideactive' : '';
        overlay_li_item = $('<li ' + overlay_itemclass + '><span class="borderinside ' + activeclass + '"></span></li>');
        overlay_li_item.append("<img src='" + item.src.replace(/\?.+/, "") + "?$Test2$&wid=102&hei=150'>");
        overlay_thumb_list.append(overlay_li_item);
      });
      overlay_thumbarea.append(overlay_thumb_list);
      $(overlay_thumbarea).find('.borderinside').bind('mouseenter', function(e) {
        mouseenterhandler(e);
      });

      // Bind Carousel
      window.imgZoomCarousel = overlay_thumbarea.find('ul').eq(0).jcarousel();

      //Swipe Events
      jQ('.img-zoom-thumbs').bind('swipeleft', function() {
        jQ(this).find('.jcarousel-next').trigger('click');

      });
      jQ('.img-zoom-thumbs').bind('swiperight', function() {
        jQ(this).find('.jcarousel-prev').trigger('click');
      });

      //main image traversing through next button functionality
      $('.img-zoom-next').live('click', function() {       
        
        var activeItem = $('.img-zoom-thumbs').find('.borderinsideactive').parents('li'),
        flyoutimage;
        if (!activeItem.hasClass('last')) {
          flyoutimage = activeItem.next('li').find('img').attr('src').replace(/\?.+/, "");
          activeItem.find('span').removeClass('borderinsideactive').end()
          			.next('li').find('span').addClass('borderinsideactive');
          $('.img-zoom-container').html('<div class="ajax-loader"></div>');
          loadMainImage(flyoutimage);
           return false;
        }
        else{

          activeItem = $('.img-zoom-thumbs').find('li');
          flyoutimage =  activeItem.eq(0).find('img').attr('src').replace(/\?.+/, "");
          activeItem.find('span').removeClass('borderinsideactive').end()
          .eq(0).find('span').addClass('borderinsideactive');
           $('.img-zoom-container').html('<div class="ajax-loader"></div>');
          loadMainImage(flyoutimage);
          return false;
        }
		
      });

      //main image traversing through prev button functionality
      $('.img-zoom-prev').live('click', function() {
       
        var activeItem = $('.img-zoom-thumbs').find('.borderinsideactive').parents('li'),
        flyoutimage;
        if (!activeItem.hasClass('first')) {
          flyoutimage = activeItem.prev('li').find('img').attr('src').replace(/\?.+/, "");
          activeItem.find('span').removeClass('borderinsideactive').end()
          			.prev('li').find('span').addClass('borderinsideactive');
          $('.img-zoom-container').html('<div class="ajax-loader"></div>');
          loadMainImage(flyoutimage);
           return false;
        }
         else{
         
          activeItem = $('.img-zoom-thumbs').find('li'),
          lastIndex = activeItem.length-1,
          flyoutimage =  activeItem.eq(lastIndex).find('img').attr('src').replace(/\?.+/, "");
          activeItem.find('span').removeClass('borderinsideactive').end()
          .eq(lastIndex).find('span').addClass('borderinsideactive');
           $('.img-zoom-container').html('<div class="ajax-loader"></div>');
          loadMainImage(flyoutimage);
          return false;
        }
       
      });

      //load main image 
      function loadMainImage(currentImgSrc){
         img = $("<img />").attr({
            'src' : currentImgSrc + '?$Test2$&wid=1168&hei=1743&fit=fit,1',
            'class' : 'img-zoom-main'
          }).load(function() {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
              alert('broken image!');
            } else {
              $('.img-zoom-container').empty().append(img);
              //Bind Touch Panel
			
			/*	commented out - 24 Jan -13 - As required only native zoom
              $('.img-zoom-main').touchPanView({
                width : 550,
                height : 821
              });
              */
            }

          });

      };

      //Thumnail mouseenter , reload main image
      function mouseenterhandler(e) {

        var flyoutimage = $(e.target).parents('li').eq(0).find('img').eq(0).attr("src").replace(/\?.+/, "");
        //$('.img-zoom-main').attr("src",flyoutimage+'?$Test2$&wid=1168&hei=1743&fit=fit,1')
        $('.img-zoom-container').html('<div class="ajax-loader"></div>');
        img = $("<img />").attr({
          'src' : flyoutimage + '?$Test2$&wid=1168&hei=1743&fit=fit,1',
          'class' : 'img-zoom-main'
        }).load(function() {
          if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
            alert('broken image!');
          } else {
            $('.img-zoom-container').empty().append(img);
            //Bind Touch Panel
			/*	commented out - 24 Jan -13 - As required only native zoom
            $('.img-zoom-main').touchPanView({
              width : 550,
              height : 821
            });
            */
          }
        });

        $(e.target).parents('ul').find('.borderinside').removeClass('borderinsideactive');
        $(e.target).addClass('borderinsideactive');
        //$('.img-zoom-main').touchPanZoom(1);

      }

    });
  }
}, ms.util.scene7helpers = {
  paused : false,
  timer : null,
  init : function() {
    $(document).ready(function() {

      $(".categorymenu ul.dropnavholder").bind("mouseenter", function() {
        if (ms.util.scene7helpers.timer !== null) {
          clearTimeout(ms.util.scene7helpers.timer);
        };
        ms.util.scene7helpers.pause();
      });

      $(".categorymenu ul.dropnavholder").bind("mouseleave", function() {
        ms.util.scene7helpers.timer = setTimeout(function() {
          ms.util.scene7helpers.resume();
        }, 500);
      });
    });
  },
  pause : function(e) {
    ms.util.scene7helpers.paused = true;
    $('*[id^=contflyzoom],*[id^=lupaflyzoom],*[id^=lupaImgflyzoom],*[id^=,*[id^=lupaImgflyzoom]]').css('z-index', '1')
  },
  resume : function(e) {
    //console.log("resume s7 viewer");
    ms.util.scene7helpers.paused = false;
    $('*[id^=contflyzoom]').css('z-index', '10000');
    $('*[id^=lupaflyzoom]').css('z-index', '9998');
    $('*[id^=lupaImgflyzoom]').css('z-index', '9997');
    $('*[id^=lupaVflyzoom]').css('z-index', '9999');
  }
}

ms.util.gotopage = (function(jQuery) {

  return {
    _product_href : null,
    init : function() {
      // Commented the line below and added new line after it to fix QC defect 338
      //$(".quickviewbutton a").live("mousedown",this.preserveProductHref);
      $("#QuickViewDialog .ms_call_to_action_2").live("mousedown", this.preserveProductHref);
      $("#QuickViewDialog .ms_call_to_action_2").live("click", this.clickhandler);
    },
    clickhandler : function(e) {
      e.preventDefault();
      return document.location = ms.util.gotopage._product_href;
    },
    preserveProductHref : function(e) {
      ms.util.gotopage._product_href = e.target.href;
    }
  }
})(jQuery);

/* FORMS extras */
ms.forms.init = function() {
  jQuery("input[type=text]").bind('focus', ms.forms.focus).bind('blur', ms.forms.blur);
  //Praveen:-Commented for '3954482'
  //jQuery(".creditcardpayment").find("select").bind("change" , ms.forms.showvalidfrom);
  //ms.forms.showvalidfrom();

}
/*Praveen:-Commented for '3954482'
 ms.forms.showvalidfrom = function(){
 var cardselect = jQuery("#dwfrm_billing_paymentMethods_creditCard_type");
 var validfromfields = jQuery(".validfromdate");
 if(!cardselect.get(0) || !validfromfields.get(0) || !app.resources["creditcard_validfrom_map"]){return false;}
 var optselected = cardselect.find("option:selected");

 if(app.resources["creditcard_validfrom_map"][cardselect.attr("selectedIndex")]){
 validfromfields.show();
 }else{
 validfromfields.hide();
 }

 }
 */
ms.forms.focus = function(e) {
  var t = e.target;
  if (t.value == t.defaultValue && jQuery(t).hasClass("example_content")) {
    t.value = "";
  }
}
ms.forms.blur = function(e) {
  var t = e.target;
  if (t.value === "" && jQuery(t).hasClass("example_content")) {
    t.value = t.defaultValue;
  }
}

/************************************
 *
 *  Functionality to provide FAQs
 *  Includes
 *  - Left hand nav
 *  - Right hand popular questions links
 *  - landing page links
 *
 */

ms.util.helppages = (function(jQuery) {

  return {

    // external vars

    // set up bindings for links / or external vars
    // left hand side links	// use "#leftcolumn"
    // main column links // use "#hp-maincolumn"
    // right hand side links // use "#hp-rightcolumn"
    /* changed rightColumn to add .sideFaqs to make the click function very specific to top 5 questions links.
     otherwise function was applicable on Need help links also | changed on 29th Sept*/

    htmlStruct : {
      leftColumn : ".helpsection #leftcolumn",
      mainColumn : ".helpsection #hp-maincolumn",
      rightColumn : ".helpsection #hp-rightcolumn .sideFaqs"
    },

    defaultPanel : "#faq-00-00",
    accordionContentClass : "content",

    faqIDHistory : [],

    //var currentFAQ = {},

    init : function() {

      oThis = this;
      // set initial context - used for variable ref later

      /***************************
       *
       *   Notes:
       *
       *   Help Page made up of
       *
       *   Top level SECTIONS - "Your account and personal detail" | "Ordering" etc
       *   Individual FAQs - "How can I change my email address?"  | "Delivering an item." etc
       *
       *   Using href to target faq - in form of
       *
       *   id="faq-00-00-00" || a href="#faq-00-00-00"
       *
       *   - allows external linking
       *
       * 	 Specify landing section by
       * 	-  ".faqlanding" or "#faq-00-00"
       *
       */

      /*
      *  Add javascript specific classes to content areas
      */

      // left column set up
      //Commenting the following line as it adds the 'content' class in LHN on category landing pages and thus hides the refinement values. | Naveen Kumar
      $(oThis.htmlStruct.leftColumn).find("ul").addClass(oThis.accordionContentClass).hide();

      // Add toggle classes and wrap h3 content with an href for accessibility
      $(oThis.htmlStruct.leftColumn).find("h3.accordionToggle").addClass("closed").wrapInner('<a href="#"></a>');

      // add content class to main content accordion divs
      //$(oThis.htmlStruct.mainColumn).find(".accordion div").addClass("content");

      /*
      * left hand column starts with
      * 00-00-00 - this is the landing page
      * then divs are numbered
      *
      * Section 1
      * 01-00
      * 		01-00-00
      * 		01-00-01
      * 		01-00-02
      * 		01-00-03
      *
      * 01-01
      * 		01-01-00
      * 		01-01-01
      *
      * 01-02
      * 01-03
      *
      * Section 2
      * 02-00
      * 02-01
      *
      * etc
      *
      * 		 *
      */

      // add div ids to left hand nav
      $(".helpsection .navgroup").each(function(index, element) {
        var divIDString = "div-" + oThis.doubleDigit(index);
        $(this).attr("id", divIDString);
        var lhnIDString = "lhn-" + oThis.doubleDigit(index);
        $(this).find("h3").attr("id", lhnIDString);
        $(this).find("li").each(function(idx, elem) {
          $(this).find("a").attr("id", lhnIDString + "-" + oThis.doubleDigit(idx));
        });
      });

      // add div ids to maincontent divs - left in for integration with backend
      /*
      $(".faqsection").each(function(index, element){

      var divIDString = "div-" + oThis.doubleDigit(index);

      //oThis.doubleDigit(index)
      $(this).attr("id", divIDString );
      });
      */

      /*
      *  Setup link binding
      */

      // Left Column Link Binding - H3

      $(oThis.htmlStruct.leftColumn + " h3.accordionToggle").bind("click", function(e) {
        e.preventDefault();

        // if panel is already open when clicked it needs to be closed - along with all other panels
        // below line is commented to make arrow working in left hand navigation links
        //setFaqId(e);
        openLeftNav(e);

      });

      // FaqID Must be set before triggering links
      var setFaqId = function(e) {

        var linkId = $(e.target).attr("href");
        if ( typeof linkId != 'undefined') {
          var newFAQId = linkId;
          oThis.faqIDHistory.push(newFAQId);
          return newFAQId;
        } else {
          throw ("faqID is undefined");
        }
        return false;
      };

      /**
       * Opens category page
       */
      var openPanels = function(faqID) {

        clearContentPanels();

        // faqID should be in 3 formats depending on link
        // #00-00-00 | #00-00 | #00
        // need to split faqID -
        // first two numbers denotes section
        // second two numbers denote faq

        var faqIdArray = faqID.split("-");
        var currentSection = faqIdArray[0] + "-" + faqIdArray[1] + "-" + faqIdArray[2];
        $(".faqsection").hide();
        var currentFaq = faqID;
        $(currentSection).show();

        //display content if trigger is a top 5 faq link
        if (currentFaq.length > 10) {
          $(currentFaq).find(".content").slideDown();
          $(currentFaq).find("span.pmButton").removeClass("plus").addClass("minus").html("minus");
        }
      };

      /**
       * Resets main content drop down panels
       */
      var clearContentPanels = function() {
        // clear all main content panels
        //$(".accordion .content").hide();
        //$(".accordion h3").find("span.pmButton").removeClass("minus").addClass("plus").html("plus");

      };

      /**
       *  function openLeftNav - expects a  link address in the format
       *  #lhn-01 - to open a header
       *  #faq-01-01 - to open a subcategory
       *  #faq-01-01-01 - to open a link with opening faq
       */

      var openLeftNav = function(faqId) {
        var lhnlink = false;
        if ( typeof faqId == "string") {

          // need to target the left hand nav specifically
          var lhnId = faqId.replace("faq", "lhn");

          // left hand nav ids have a maximum character length of 10

          lhnId.replace("#", "");

          var sectionIDArray = lhnId.split("-");
          var splitcategoryId = sectionIDArray[0];
          splitcategoryId = splitcategoryId + "-" + sectionIDArray[1];
          var splitsubCategoryId = sectionIDArray[2];
          var splitfaqId = sectionIDArray[3];

          _this = splitcategoryId;

        } else if ( typeof faqId == "object") {
          _this = faqId.currentTarget;
          lhnlink = true;
        }
        if ($(_this).hasClass("accordionToggle") && $(_this).hasClass("open") && lhnlink) {
          $(_this).parent().removeClass("active");
          $(_this).parent().siblings().removeClass("active");

          // clear on list element
          $(_this).removeClass("open").addClass("closed");
          $(_this).next(".content").slideUp();
          $(_this).next().find("li").removeClass("selected");

        } else {
          // sort out open and close methods across all panels
          // reset all other panels
          $(_this).parent().siblings().each(function() {
            if ($(this).hasClass("active")) {
              $(this).find(".content").slideUp();
              $(this).find("li").removeClass("selected");
              $(this).removeClass("active");
              $(this).find("h3").removeClass("open").addClass("closed");
            }
          });
          $(_this).siblings().each(function() {
            $(this).find("li").removeClass("selected");
          });

          $(_this).parent().addClass("active");
          $(_this).next(".content").slideDown();
          $(_this).addClass("open").removeClass("closed");
        }

        // panel has now been opened now open links if applicable

        var lhnLinkID = splitcategoryId + "-" + splitsubCategoryId;
        var actualFaqID = splitcategoryId + "-" + splitsubCategoryId + "-" + splitfaqId;

        if (lhnLinkID.length == 7) {
          // option for cat only
        }

        if (lhnLinkID.length == 10) {
          // option for cat and sub cat only
          $(lhnLinkID).parent().addClass("selected");
        }

        if (lhnLinkID.length == 13) {
          // option for cat, sub cat and link
        }

      };

      // resets left hand nav and all content blocks
      clearAll = function() {

        // left hand nav
        $(oThis.htmlStruct.leftColumn + ".navgroup").each(function() {
          if ($(this).hasClass("active")) {
            $(this).find(".content").slideUp();
            $(this).find("li").removeClass("selected");
            $(this).removeClass("active");
            $(this).find("h3").removeClass("open").addClass("closed");
          }
        });

        // main content
        clearContentPanels();
      };

      $(oThis.htmlStruct.leftColumn + " li a").bind("click", function(e) {
        e.preventDefault();
        try {
          setFaqId(e);
          openPanels(setFaqId(e))
        } catch (error) {
          //console.log("Error = ", error );
        }
        $(this).parent("li").addClass("selected").siblings().removeClass("selected");
      });

      // Maincolumn | Landing Links

      $(oThis.htmlStruct.mainColumn + " .faqlanding").bind("click", function(e) {
        e.preventDefault();
        try {
          setFaqId(e);
          openPanels(setFaqId(e));
          openLeftNav(setFaqId(e));
        } catch (error) {
          //console.log("Error = ", error );
        }
      });

      // Maincolumn | Content Heading Links

      $(oThis.htmlStruct.mainColumn + " h3").bind("click", function(e) {
        e.preventDefault();

        if ($(this).parent().hasClass("showContent")) {
          $(this).next("div.content").slideUp();
          $(this).find("span").removeClass("minus").addClass("plus").html("minus");
          $(this).parent().removeClass("showContent");
        } else {
          $(this).next("div.content").slideDown();
          $(this).find("span").removeClass("plus").addClass("minus").html("minus");
          $(this).parent().addClass("showContent");
        };
      });

      // maincolumn separate links to style page
      $(oThis.htmlStruct.mainColumn + " p a").bind("click", function(e) {
        e.preventDefault();
      }).css({
        'color' : "black",
        'font-weight' : "bold"
      });

      // RightColumn faq links

      $(oThis.htmlStruct.rightColumn + " ").bind("click", function(e) {
        e.preventDefault();
        setFaqId(e);
        clearAll();
        openPanels(setFaqId(e));
        openLeftNav(setFaqId(e));
      });

      // Hide accordion content faqs
      //$(oThis.htmlStruct.mainColumn).find(".accordion .content").hide();

      // Iterate through all accordion panels and hide elements
      // Hide main sections
      $(".faqsection").hide();

      // show default section
      $(oThis.defaultPanel).show();
    },

    // utility functions
    isdefined : function(variable) {
      var checkValue = ( typeof (window[variable]) == "undefined") ? false : true;
      return ( typeof (window[variable]) == "undefined") ? false : true;
    },

    doubleDigit : function(intX) {
      if (intX < 10) {
        return "0" + intX;
      } else {
        return intX;
      };
    }
  }
})(jQuery);

  //ui-daialog reposition fix
  var resetPosition =  function(element,pos) {
 
  var wnd = $(window), doc = $(document),
			pTop = doc.scrollTop(),
			
		pTop = (pTop > 5) ? (pTop+ (wnd.height() - element.outerHeight()) / 2) : (wnd.height() - element.outerHeight()) / 2;	
		pTop = (pTop < 0) ? 5 : pTop;// if negative value
		
		element.css({top: pTop+'px'});
		// element.dialog("option", "position", "center");
	};
  
  //ui-dialog reposition fix ends
	
	
	
$(document).ready(function() {
  ms.category_landing.carousel.init();
  ms.util.gotopage.init();
  ms.events.init();
  ms.forms.init();
  ms.util.scene7helpers.init();
  ms.util.helppages.init();
  ms.util.backToTop.init();
  ms.util.scene7ImageZoom.init();
  
  //ipad orientation zoom fix 
  //refer http://upstatement.com/blog/2011/06/6758536887/
  if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
  var viewportmeta = document.querySelector('meta[name="viewport"]');
  if (viewportmeta) {
    viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
    document.body.addEventListener('gesturestart', function() {
      viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=8';
    }, false);
  }
}
  //ipad orientation zoom fix ends
  
  

  
  
  //tooltip repositioned on orientation change // Hack
  // Orientation Change Logic
	var mql = window.matchMedia("(orientation: portrait)");
	// Add a media query change listener
	mql.addListener(function(m) {
	var $activeToolTip = jQuery('.tooltip.bt-active'),
	$visibleUIdialog = jQuery('.ui-dialog:visible');
	
	  if(m.matches) {
	   		
		   //Portrait orientation 
		   if($activeToolTip.length)
		   {
		   $activeToolTip.trigger('blur').trigger('focus');
		   }
		   
		   if($visibleUIdialog.length)
		   {
		   resetPosition($visibleUIdialog,'center');
		   }
	 
	    }
	  else {
	   
		   //Landscape orientation	
		   if($activeToolTip.length)
		   {
		   $activeToolTip.trigger('blur').trigger('focus');
		   }
		  
		   if($visibleUIdialog.length)
		   {
		    resetPosition($visibleUIdialog,'center');
		   }
	   
	  }
	});
// Orientation Change Logic Ends
//tooltip repositioned on orientation change // Hack ends 

// Acount Dashboard -  Whole Area Tappable/ Clikable
jQ('ul.dashTabs').on('click','li div','click touchstart',function(e)
{
var elem = jQ(this),
link = elem.find('p a').attr('href');
window.location.href = link;
});	
// Acount Dashboard -  Whole Area Tappable/ Clikable Ends
  // Swipe Event Binding

  jQ('.scene7flyoutcontrol_thumbs,.recommendations_cross-sell').bind('swipeleft', function() {
    jQ(this).find('.jcarousel-next').trigger('click');
    return false;

  });
  jQ('.scene7flyoutcontrol_thumbs,.recommendations_cross-sell').bind('swiperight', function() {
    jQ(this).find('.jcarousel-prev').trigger('click');
    return false;
  });
  //Swipe Event Binding Ends

  $(".accordion h3").live("click", function(e) {
    e.preventDefault();

    if ($(this).parent().hasClass("showContent")) {
      $(this).next("div").slideUp();
      $(this).find("span").removeClass("minus").addClass("plus").html("minus");
      $(this).parent().removeClass("showContent");
    } else {
      $(this).next("div").slideDown();
      $(this).find("span").removeClass("plus").addClass("minus").html("minus");
      $(this).parent().addClass("showContent");
    };
  });

  //All Account Pages | Vertical Alignment of Balloon | 849
  (function($) {
    $.fn.vAlign = function() {
      return this.each(function(i) {
        var h = $(this).height();
        var oh = $(this).outerHeight();
        var mt = (h + (oh - h)) / 2;
        $(this).css("margin-top", "-" + mt + "px");
        $(this).css("top", "50%");
        $(this).css("position", "absolute");
      });
    };
  })(jQuery);

  $(document).ready(function() {
    $(".holder").vAlign();
    $(".holder").css("width", "92%");
    $(".product_box_heading h3").vAlign();
    $(".headerHolder div.caption").vAlign();
    /*CR 117 21 sep*/
    $(".headerHolder div.captionwhite").vAlign();
    /*CR 117 21 sep*/
    //$("div.top_banner_grey .banner_head h2").vAlign(); /*outstanding 20 sep*/
    //$(".small_content_module h3").vAlign();/*slide 4 */
    $("#cat_banner_links li:last a").css('background-position', 'center');
    // slide 10
    $(".ms_call_to_action_1").mouseover(function() {
      $(this).css("text-decoration", "underline");
    })
    $(".ms_call_to_action_1").mouseout(function() {
      $(this).css("text-decoration", "none");
    })
    $(".variationattributes .color li a").focus(function() {
      $(this).parent().addClass("focused");
    })
    $(".variationattributes .color li a").blur(function() {
      $(this).parent().removeClass("focused");
    })
    $('#refinement-category .refineattributes').addClass("refineattributes1");
    $('#refinement-category .refineattributes1').removeClass("refineattributes").wrap("<div class='new' />");
    //$('.refineattributes').jScrollPane({showArrows: true});
    //$('#refinement-category .refineattributes').jScrollPane({showArrows: true});
    if (navigator.userAgent.indexOf('iPad') > -1) {
      $('.expire_month').blur(function() {
        $('.expire_year').focus();
      })
    }

    $(".categorymenu .dropnavholder").each(function() {
      var getImagesCont = $(this).find("li.imageSlots").length > 0;

      if (getImagesCont) {
        $(this).addClass("hasImages");
      }

    });
    /************** Davinder Kumar :: adding for new home page banner ***************/
    $(".newHomePage #large_home_landing_banner").each(function() {
      var getImageHeight = $(this).find(".home_banner_item img").height();
      $(this).height(getImageHeight);
    });
    $(".newHomePage #home_banner_links").each(function() {
      var getWidth = $(this).width();
      $(this).css("margin-left", -((getWidth + 5) / 2));
    });

    /************** Davinder Kumar :: adding for new home page banner ENDS ***************/

  });

  $("div#header div.cSelector").hover(function() {
    $(this).find(".sSelected").addClass("sHover");
  }, function() {
    var visibleUL = $(this).find("ul:visible").length;
    if (visibleUL) {
      //alert("visible");
    } else {
      $(this).find(".sSelected").removeClass("sHover");
    }
  }).click(function(e) {
    e.stopPropagation();
  });

  $(document).click(function() {
    $("div.cSelector ul").removeClass("showDD");
    $("div.cSelector .sSelected").removeClass("sHover");
  });

  $("div#header div.sSelected").click(function() {
    $(this).addClass("sHover").next("ul").addClass("showDD");
  });

  if ($("#countryOverlay").html() != null) {
    $("#countryOverlay").mnsEUCountryOverlay();
  }

  //change the same locale link as the close button. i.e. if user clicks on the same locale as the background locale, the overlay will be closed and no server will hit happen
  //this change is done to stop the overlay coming again and again because of the URL caching done by DW.
  $("a.localeClass").click(function() {
    var curLocale = $(this).attr("name");
    var userLocale = $("div.cSelector").find(".varValue").text();
    var url = $(this).attr("href");
    changeLocale(curLocale, url);
    return false;
  });

  $("div.cSelector").each(function() {
    var getVarValue = $(this).find(".varValue").text();
    var selectedCountry = $(this).find("ul li a." + getVarValue);
    var selectedCountryHTML = selectedCountry.html();
    var changeCountry = $(this).find("div.sSelected .aero a");
    changeCountry.append(selectedCountryHTML);
    $(this).find(".varValue").remove();
    selectedCountry.hide();
    selectedCountry.parent('li').prependTo(selectedCountry.parent().parent('ul'));

  });

  $("#mainNav").each(function() {
    var thisNav = $(this);
    
    
  //Davinder Kumar: Remove Sub Categories if more than 8. QC ID - 4792.
    thisNav.find(".subCatsCont").find(".subCats").each(function(){
    	$(this).find("ul.subUL:gt(7)").hide();
    });
    
    var subNav = thisNav.find("#subNav"),
    closeMenu = thisNav.find(".subCats div.closeMenu"),
    mainCatsHeight = subNav.show().find("ul.mCats").height(),
    firstSubNavHeight = subNav.show().find(".subCatsCont .subCats:first").height();
    
    
    
    if (mainCatsHeight > firstSubNavHeight) {
      subNav.css("height", mainCatsHeight);
    } else {
      subNav.css("height", firstSubNavHeight);
    };
    thisNav.find("a.showByDept:first").click(function() {
      $(this).toggleClass("show");
      subNav.slideToggle();
    });
    closeMenu.click(function() {
      subNav.slideUp();
      thisNav.find("a.showByDept:first").removeClass("show");
    });
    thisNav.find(".mCats li:first").addClass("active");
    thisNav.find(".subCatsCont .subCats:first").show().addClass("active");
    jQ(window).bind( 'orientationchange', function(e){
      var resizedHeight = subNav.show().find(".subCatsCont .active").height();
      if (thisNav.find("a.showByDept:first").hasClass("show")) {
        subNav.show();
      } else {
        subNav.hide();
      }
      if (resizedHeight > mainCatsHeight) {
        subNav.css({
          'height' : resizedHeight
        });
      } else {
        subNav.css({
          'height' : mainCatsHeight
        });
      };
    });
    thisNav.find("ul.mCats li").click(function(e) {
      if (thisNav.find(".subCatsCont .subCats:eq(" + $(this).prevAll().length + ") .onlyCats").children('ul').length != 0) {
        e.preventDefault();
        var getMainCatsIndex = $(this).prevAll().length;
        $(this).addClass("active").siblings().removeClass("active");

        var adjustHeight = thisNav.find(".subCatsCont .subCats:eq(" + getMainCatsIndex + ")").height();

        thisNav.find(".subCatsCont .subCats:eq(" + getMainCatsIndex + ")").addClass("active").fadeIn().siblings().removeClass("active").hide();

        if (mainCatsHeight > adjustHeight) {
          subNav.animate({
            'height' : mainCatsHeight
          });
        } else {
          subNav.animate({
            'height' : adjustHeight
          });
        };
        /* Abdul Rahim: INT-575 Gnav omniture functioanlity is not working for Tablet sites. 
           To record Click Event on Omniture */
        s.tl(this,'o',$(this).text());
      }
    });
    subNav.hide();
  });
  
  //Davinder Kumar :: for home page category //
  jQ("div.tabletCategories").each(function(){
	  jQ(this).find(".dw-object-rinclude").remove();
	  jQ(this).find(".htmlslotcontainer li").unwrap();
	  jQ(this).find("li:nth-child(3n)").addClass("last");
  });
  //Davinder Kumar :: for home page category END //
  
  //Davinder: brand logos equal height, responsive.
  var brandLogos = function(){
	  var max1 = 0,
	  thisLi = jQ(".brandLogoModule").find("li");
	  thisLi.each(function(){
		  var h1 = jQ(this).height();
		  max1 = h1 > max1 ? h1 : max1;
	  });
	  thisLi.each(function(){
		  jQ(this).height(max1);
	  });
  };
  brandLogos();
  jQ(window).bind( 'orientationchange', function(){
	  jQ(".brandLogoModule").find("li").removeAttr("style");
	  brandLogos();
  });
//Davinder: brand logos equal height, responsive ENDS.

  
});

