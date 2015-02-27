/*
 * All java script logic for the application.
 *
 * The code relies on the jQuery JS library to
 * be also loaded.
 */

var app = (function(jQuery){

	if (!jQuery) {
		alert(app.resources["MISSING_LIB"]);
		return null;
	}
	
	// Global dw private data goes here	

	// dw scope public
	return {
		URLs			: {}, // holds dw specific urls, check htmlhead.isml for some examples
		resources		: {},  // resource strings used in js
		constants		: {}, // platform constants, initialized in htmlhead.isml
		containerId		: "content",
		ProductCache	: null,  // app.Product object ref to the current/main product
		clearDivHtml	: "<div class=\"clear\"><!-- W3C Clearing --></div>",
		currencyCodes	: {}, // holds currency code/symbol for the site

		// default dialog box settings
		dialogSettings: {
				bgiframe: true, // this is required mainly for IE6 where drop downs bleed into dialogs!!! it depends on 
				autoOpen: false,
				buttons: {},
				modal: true,
				overlay: {
		    		opacity: 0.5,
		     		background: "black"
				},
		    	
		    	width: 820,
		    	title: '',
		    	// show: "slow", This is causing dialog to break in jquery 1.3.2 rel, show: "slide" works but not desired
		    	hide: "normal",
		    	resizable: false
		},

		// default tooltip settings
		tooltipSettings: {
				delay: 0,
				showURL: false,
				extraClass: "tooltipshadow tooltipshadow02",
				top:-30,
				left: 5
		},

		// global form validator settings
		/*Fixed: 851822 | Start*/
		validatorSettings: {
			errorClass : 'errorclient',
			errorElement: 'div',
			onfocusout: function(element) {
				if ($(element).is('#birthday_day, #birthday_month, #birthday_year')) {
					$(element).parent().find("div.errorclient").next().removeClass("errorIcon");
				}
				if ( !this.checkable(element) && !$(element).is('#birthday_day, #birthday_month, #birthday_year')) {
					this.element(element);
					$(element).parent().find("div.errorclient").next().removeClass("successIcon")/*To Remove Backend success icon*/
					$(element).parent().find("div.errorclient").next().removeClass("errorIcon");/*To Remove Backend error icon*/
				}
			},
			highlight: function(element, errorClass) {
				if ($(element).attr("name") == "birthday_day" || $(element).attr("name") == "birthday_month" || $(element).attr("name") == "birthday_year"){ 
					$(element).parents(".formfield").find(".errorclient").remove();
				}else{
					$(element).addClass( errorClass ); /*Add 'errorclient' class to the element*/
					$(element).next(".successIcon").removeClass("successIcon").addClass("errorIcon"); /*change from success icon to error icon*/
					$(element).prev(".genericinputbox_leftcurve").removeClass("genericinputbox_leftcurve").addClass("errorinputbox_leftcurve"); /*changes the left curve for textbox in red color*/
					$(element).parents(".formfield").find(".labeltext").addClass("errorlabel"); /*Mark Label as red*/
					$(element).parents(".formfield").find(".errormessage").remove();/*Remove Backend errror message*/
					//QC Defect 828 | The focus is not transferred to submit button on click of Enter key. | Naveen Kumar
					//$(element).parents(".formfield").find(".errorclient").empty();/*Remove Backend errror message*/
				}
			},
			unhighlight: function(element, errorClass) {
				//aliddl :  code for handling klarna DOB validation
				//aliddl : not required as of 18 Sept 2012
				if ($(element).attr("name") == "birthday_day" || $(element).attr("name") == "birthday_month" || $(element).attr("name") == "birthday_year"){ 
					$('#birthday_day, #birthday_month, #birthday_year').removeClass( errorClass );
					$('#birthday_day, #birthday_month, #birthday_year').next(".errorIcon").addClass("successIcon");				
					$('#birthday_day, #birthday_month, #birthday_year').prev(".errorinputbox_leftcurve").removeClass('errorinputbox_leftcurve').addClass("genericinputbox_leftcurve");
					$('#birthday_day, #birthday_month, #birthday_year').parents(".formfield").find(".errorlabel").removeClass("errorlabel"); 
					$('#birthday_day, #birthday_month, #birthday_year').parents(".formfield").find(".errormessage").remove(); 
					
				}else{
					$(element).removeClass( errorClass );
					$(element).next(".errorIcon").addClass("successIcon");				
					$(element).prev(".errorinputbox_leftcurve").removeClass('errorinputbox_leftcurve').addClass("genericinputbox_leftcurve");/*Apply left curve for textboxes*/
					$(element).parents(".formfield").find(".errorlabel").removeClass("errorlabel"); /*Mark Label as red*/
					$(element).parents(".formfield").find(".errormessage").remove(); /*Remove Backend errror message*/
					$(element).parents(".dob").find(".errorIcon").removeClass("errorIcon"); /*Date Of Birth | Remove error icon*/
					//QC Defect 828 | The focus is not transferred to submit button on click of Enter key. | Naveen Kumar
					//$(element).parents(".formfield").find(".errorclient").empty();/*Remove Backend errror message*/
				}
			},
			// make fieldset error placements
			errorPlacement: function(error, element)
		    {
	            /* generic handling */
				if (element.attr("type") != "checkbox"){
					var errorIconVar=$('<span class="errorIcon" />');	
					if (element.attr("name") == "birthday_day" || element.attr("name") == "birthday_month" || element.attr("name") == "birthday_year"){ 
						error = jQuery('div.klarnaDoB > label').text(); error = '<div class="errorclient" htmlfor="dateOfBirth" generated="true">' + jQuery.format(app.resources["MISSINGVAL"], error.replace(':*', '')) + '</div>';
				        jQuery('.dobError').html(error);
						jQuery('#birthday_year').next('span.errorIcon').remove();
						errorIconVar.insertAfter('#birthday_year');
						jQuery('.klarnaDoB').find('span.labeltext').addClass('errorlabel');
					}else{ 
				        error.insertAfter(element);
		        		errorIconVar.insertAfter(element);
					}
	        	}
	        	else{
	        		error.insertAfter(element.parents(".checkbox").find("div.clear"));		        	
        		}
				
		    },
		    success: function(label){
		            /* generic handling */
		    	
		    },
		    rules: {
		    	birthday_day : {invalidKlarnaDOB: true},
		    	birthday_month : {invalidKlarnaDOB: true},
		    	birthday_year : {invalidKlarnaDOB: true}
	        },
		    groups: {
		    	dateOfBirth: "birthday_day birthday_month birthday_year"
		    }


		},
		/*Fixed: 851822 | End*/
		
		// app initializations called from jQuery(document).ready at the end of the file
		init: function() {
			// register initializations here
			
			// quick view dialog div
			jQuery("<div/>").attr("id", "QuickViewDialog").html(" ").appendTo(document.body);

			// micicart object initialization
			this.minicart.init();
			
			// execute unobtrusive js code
			this.execUjs();
			
			// renders horizontal/vertical carousels for product slots
			jQuery('#horicarousel').jcarousel({
	        	scroll: 1,
				itemVisibleInCallback: app.captureCarouselRecommendations
		    });

		    jQuery('#vertcarousel').jcarousel({
		        scroll: 1,
				vertical: true,
				itemVisibleInCallback: app.captureCarouselRecommendations
		    });	
		    
		    /*jQuery('#homeSmallCarousel').jcarousel({
	        	scroll: 1,
	        	wrap: 'circular',
	        	easing: 'linear',
				itemVisibleInCallback: app.captureCarouselRecommendations
		    });*/
		    

		},
	
		// sub namespace app.ajax.* contains application specific ajax components
		ajax: {
			Success: "success",
			currentRequests: {}, // request cache

			// ajax request to get json response
			// @param - reqName - String - name of the request
			// @param - async - boolean - asynchronous or not
			// @param - url - String - uri for the request
			// @param - data - name/value pair data request
			// @param - callback - function - callback function to be called
			getJson: function(options) {
				var thisAjax = this;

				// do not bother if the request is already in progress
				// and let go null reqName
				if (!options.reqName || !this.currentRequests[options.reqName]) {
					this.currentRequests[options.reqName] = true;
					if(options.async == "undefined") options.async = true;
					// make the server call
					jQuery.ajax({
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						url		: options.url,
						cache	: true,
						async	: options.async,
						data	: options.data,

						success: function(response, textStatus) {
							thisAjax.currentRequests[options.reqName] = false;

							if (!response.Success) {
								// handle failure
							}

							options.callback(response, textStatus);
						},

						error: function(request, textStatus, error) {
							if (textStatus === "parsererror") {								
								alert(app.resources["BAD_RESPONSE"]);
							}
							
							options.callback({Success: false, data:{}});
						}
					});
				}
			},

			// ajax request to load html response in a given container
			// @param - reqName - String - name of the request
			// @param - url - String - uri for the request
			// @param - data - name/value pair data request
			// @param - callback - function - callback function to be called
			// @param - selector - string - id of the container div/span (#mycontainer) - it must start with '#'
			load: function(options) {

				var thisAjax = this;

				// do not bother if the request is already in progress
				// and let go null reqname
				if (!options.reqName || !this.currentRequests[options.reqName]) {
					this.currentRequests[options.reqName] = true;
					// make the server call
					jQuery.ajax({
						dataType: "html",
						url		: options.url,
						cache	: true,
						data	: options.data,

						success: function(response, textStatus) {
							thisAjax.currentRequests[options.reqName] = false;
							
							if (options.selector) {
								jQuery(options.selector).html(response);
							}

							(options.callback != undefined ? options.callback(response, textStatus): null)
						},

						error: function(request, textStatus, error) {
							if (textStatus === "parsererror") {								
								alert(app.resources["BAD_RESPONSE"]);
							}

							options.callback(null, textStatus);
						}
					});
				}
			}
		},

		// loads a product into a given container div
		// params
		// 		containerId - id of the container div, if empty then global app.containerId is used
		//		source - source string e.g. search, cart etc.
		//		label - label for the add to cart button, default is Add to Cart
		//		url - url to get the product
		//		id - id of the product to get, is optional only used when url is empty
		getProduct: function(options) { // id, source, start
			var cId 		= options.containerId || app.containerId;
			var source 		= options.source || "";
			var a2cBtnLabel = options.label || null;
			
    		/* bug 914452 - added callback code */
			var callback 	= typeof options.callback === "function" ? options.callback : function(){};
		

			// show small loading image
			jQuery("#"+cId).html(app.showProgress("productloader"));

			var productUrl = options.url ? options.url : app.util.appendParamToURL(app.URLs.getProductUrl, "pid", options.id);
						
			productUrl = app.util.appendParamToURL(productUrl, "source", source);

			app.ajax.load({selector: "#"+cId, url: productUrl, callback: function(responseText, textStatus){
				
				 /* bug 914452 - added callback code */
				 callback(responseText, textStatus);
				 
				// update the Add to cart button label if one provided
				(a2cBtnLabel != null ? jQuery("#"+cId+" .addtocartbutton:last").html(a2cBtnLabel) : '');
			}});
		},

		// sub name space app.minicart.* provides functionality around the mini cart
		minicart: {
			url   : '',  // during page loading, the Demandware URL is stored here
			timer : null, // timer for automatic close of cart item view

			// initializations
			init: function() {
				// reset all the existing event bindings
				app.minicart.reset();

				// bind hover event to the cart total link at the top right corner
				//Asha | Changed to make slide effect
				//jQuery(".minicartArrow").click(function(e){(app.minicart.slide() ? '': app.minicart.slide());});
				/*removed mouseenter and  mouseleave functions of basketWrapper for QC 996 to increase time interval for minibasket */
				/*jQuery(".basketWrapper").mouseenter(function(e){
					if(!app.minicart.isShow()) { 
						app.minicart.slideclick();
						app.minicart.shoppingBagPosition();
						//jQuery(".minicarttotal").addClass("sel");
					}
				});
				jQuery(".basketWrapper").mouseleave(function(e){
					//if(jQuery(".minicarttotal").hasClass("sel")) { 
						app.minicart.reset();
						app.minicart.close(0);
						
					//}
				});*/
				$(".basketWrapper")[($.fn.hoverIntent) ? 'hoverIntent' : 'hover'](app.minicart.basketover,app.minicart.basketout); /*added for QC 996 to increase time interval for minibasket */
				jQuery(".basketWrapper").mouseleave(function(e){/*added for QC 996 to increase time interval for minibasket */
					app.minicart.basketout();
				});
				jQuery(".minicartcontent").mouseenter(function(e){
						//jQuery(".minicarttotal").addClass("sel");
						app.minicart.shoppingBagPosition();
						app.minicart.reset();
				});				
				jQuery(".minicartcontent").mouseleave(function(e){
					if(jQuery("#container").hasClass(".pt_productdetails")) { 
						app.minicart.close(0);
						app.minicart.reset();
					}
				});
				jQuery(window).scroll(function(e){
					app.minicart.shoppingBasketOpened();
				}); /*Fixed scrolling of mini basket*/
				
				
				/*jQuery('.minicartcontent')
				.mouseenter(function(e) {
					clearTimeout(app.minicart.timer);
					app.minicart.timer = null;
				})
				.mouseleave(function(e) {
					clearTimeout(app.minicart.timer);
					app.minicart.timer = null;
					// after a time out automatically close it
					app.minicart.timer = setTimeout( 'app.minicart.close()', 30 );
				});*/

				// register close button event
				jQuery('.minicartclose').click(function() {
					// reset all the events bindings
					//app.minicart.reset();
					app.minicart.close(0);
				});
			},
			
			// returns a boolean if a minicart is visible/shown or hidden
			isShow: function() {
				return jQuery('.minicartcontent').css('display') == 'none' ? false : true;
			},
			/*added for QC 996 to increase time interval for minibasket */
			basketover: function() {
				if(!app.minicart.isShow()) { 
					app.minicart.slideclick();
					app.minicart.shoppingBagPosition();
					//jQuery(".minicarttotal").addClass("sel");
				}
			},
			/*added for QC 996 to increase time interval for minibasket */
			basketout: function() {
				app.minicart.reset();
				app.minicart.close(0);
			},
			// reset minicart
			reset: function() {
				jQuery(".minicartBox").unbind("hover");
				jQuery('.minicartcontent').unbind("mouseenter").unbind("mouseleave");
				//jQuery('.minicartcontent .minicartclose').unbind("click");
			},
			
			shoppingBagPosition: function() {
				if(jQuery(".minicarttotal").height()> 48){ // IE9 fix
						jQuery('.minicartcontent').css({top: $(window).scrollTop() + 75}); /*820053*/
				}
				else if(jQuery(".minicarttotal").height()<48){  // IE9 fix
						jQuery('.minicartcontent').css({top: $(window).scrollTop() + 30}); /*820053*/
				}
				app.minicart.slideclick(); //minibasket change | 15 sep
			},
			
			shoppingBagPositionTop: function() {
				window.location.hash = "top";
				app.minicart.shoppingBagPosition();
			},
			
			shoppingBasketOpened: function() {
				if (jQuery('.minicartcontent').is(':visible') ) {
					//app.minicart.shoppingBagPosition();
					if(jQuery(".minicarttotal").height()> 48){  // IE9 fix
						jQuery('.minicartcontent').css({top: $(window).scrollTop() + 30}); /*820053*/
						app.minicart.slide();
				}
				else if(jQuery(".minicarttotal").height()<48){  // IE9 fix
						jQuery('.minicartcontent').css({top: $(window).scrollTop() + 30}); /*820053*/
						app.minicart.slide(); //minibasket change | 6 sep
				}	
					}	
			},

			// shows the given content in the mini cart
			show: function(html) {
				jQuery('#minicart').html(html);
				
				// bind all the events
				app.minicart.init();
				
				if(app.minicart.suppressSlideDown && app.minicart.suppressSlideDown()) {
					// do nothing
					// the hook 'MiniCart.suppressSlideDown()' should have done the refresh
				}
				else {
					app.minicart.slide();
				}
			},
			
			// slide down and show the contents of the mini cart
			slideclick: function() {
				if(app.minicart.suppressSlideDown && app.minicart.suppressSlideDown()) {
					return;
				}
				// show the item
				jQuery('.minicartcontent').slideDown('slow');//show("slide", { direction: "up" }, 1000);
				clearTimeout(app.minicart.timer);
				app.minicart.timer = null;
				
			},
			slideTop: function() {
				if(app.minicart.suppressSlideDown && app.minicart.suppressSlideDown()) {
					return;
				}
				// show the item
				jQuery('.minicartcontent').slideDown('slow');//show("slide", { direction: "up" }, 1000);
				clearTimeout(app.minicart.timer);
				app.minicart.timer = null;
				// after a time out automatically close it
				app.minicart.timer = setTimeout( 'app.minicart.close()', 6000 );	/*820083*/			
			},
			
			// slide down and show the contents of the mini cart
			slide: function() {
				if(app.minicart.suppressSlideDown && app.minicart.suppressSlideDown()) {
					return;
				}
					
				// show the item
				jQuery('.minicartcontent').slideDown('slow');//show("slide", { direction: "up" }, 1000);
				clearTimeout(app.minicart.timer);
				app.minicart.timer = null;
					
				// after a time out automatically close it
				app.minicart.timer = setTimeout( 'app.minicart.close()', 6000 );	/*820083*/
					
			},

			// adds a product to the mini cart
			// @params
			// progressImageSrc - source/url of the image to show when the item is being added to the cart
			// postdata - form data containing the product information to be added to mini-cart
			// callback - call back function/handler
			add: function(progressImageSrc, postdata, callback)
			{
				// get the data of the form as serialized string
				var postdata = postdata;

				// get button reference
				var addButtons = [];

				// the button to update
				var addButton = null;
				
				// it is an array of buttons, but we need only one all
				// other combinations are strange so far
				if (addButtons.length == 1)	{
					addButton = addButtons[0];
				}

				var previousImageSrc = null;

				// show progress indicator
				if (addButton != null) {
					previousImageSrc = addButton.src;
					addButton.src = progressImageSrc;
				}

				// handles successful add to cart
				var handlerFunc = function(req)	{
					// hide progress indicator
					if (addButton != null) {
						addButton.src = previousImageSrc;
					}

					// replace the content
					jQuery('#minicart').html(req);

					app.minicart.shoppingBagPositionTop();/**682233**/
					
					// bind all the events
					app.minicart.init();

					if(app.minicart.suppressSlideDown && app.minicart.suppressSlideDown()) {
						// do nothing
						// the hook 'MiniCart.suppressSlideDown()' should have done the refresh
					}
					else {
						app.minicart.slide();

						if (callback) callback();
					}
				}

				// handles add to cart error
				var errFunc = function(req) {
					// hide progress indicator
					if (addButton != null) {
						addButton.src = previousImageSrc;
					}				}

				// closes a previous mini cart
				app.minicart.close();

				// add the product
				jQuery.ajax({
								type	: "POST",
								url		: app.minicart.url,
								cache	: true,
								data	: postdata,
								success	: handlerFunc,
								error	: errFunc
							});
			},

			// closes the mini cart with given delay
			close: function(delay) {
				if ( app.minicart.timer != null || delay == 0) {
					clearTimeout( app.minicart.timer );
					app.minicart.timer = null;					
					//Added by asha to change basket icon on hover
					//jQuery('.minicarttotal span').removeClass('mini_basket_hover').addClass('mini_basket_header');
					//jQuery('.minicartcontent').fadeOut(); // hide with "slide" causes to fire mouse enter/leave events sometimes infinitely thus changed it to fadeOut
					jQuery(".minicartcontent").slideUp('slow'); // hide with "slide" causes to fire mouse enter/leave events sometimes infinitely thus changed it to fadeOut
					app.minicart.reset();
				}
			},

			// hook which can be replaced by individual pages/page types (e.g. cart)
			suppressSlideDown: function() {
				return false;
			}
		},

		// close quick view dialog if open and refresh the page
		refreshCart: function() {
			app.quickView.close();

			// refresh without posting
			location.href = location.href;
		},

		// Product quick view object
		quickView: {
			// bind browser events
			// options
			// buttonSelector - css selector for the quickview button
			// imageSelector - css selector for product image
			// buttonLinkSelector - css selector for quickview button link (a tag)
			// productNameLinkSelector - css selector for product name link (a tag)
			bindEvents: function(options) {
				// hide quickview buttons
				jQuery(options.buttonSelector).hide();

				// hovering
				jQuery(options.imageSelector).hover(
					function(e) {
						jQuery(this).children(options.buttonSelector).show();
						return false;
					},
					function(e) {
						jQuery(this).children(options.buttonSelector).hide();
						return false;
					}
				);

				// click binding for quick view
				jQuery(options.buttonLinkSelector).click(function(e) {
					app.quickView.show({url: this.href, source: "quickview"});
					return false;
				});

				/*
				To make bookmarking and browser back-button work correctly the browser URL needs 
				to change. To force that change we do a full-page load (not AJAX) when going from 
				search result page to product detail page.
				The implementation supports loading the product detail content with AJAX: just 
				uncomment this code block to bind the event handler.
				
				// click binding for name link
				if(options.productNameLinkSelector) {
					jQuery(options.productNameLinkSelector).click(function(e) {
						app.getProduct({url: this.href, source: "search"});
						return false;
					});
				}
				*/
			},

			// show quick view dialog and send request to the server to get the product
			// options.source - source of the dialog i.e. search/cart
			// options.url - product url
			show: function(options) {
				app.createDialog({id: 'QuickViewDialog', options: {
			    	
			    	width: 772,
			    	minHeight: 650,
			    	dialogClass: 'quickview',
			    	closeText: testGlobalNew,
			    	resizable: false,
			    	beforeclose: function(e){app.quickView.removequickviewScene7();}
				}});

			 
			    jQuery('#QuickViewDialog').dialog('open');
			    /* bug 914452 - added callback code */
			    app.getProduct({containerId: "QuickViewDialog", source: options.source, url: options.url, label: options.label,callback:function(){
			    	// callback repositions dialog after ajax call to get content
			    	jQuery('#QuickViewDialog').dialog("option", "position", jQuery('#QuickViewDialog').dialog('option','position'));
			    }});
			},
			// close the quick view dialog
			close: function() {
				jQuery('#QuickViewDialog').dialog('close');
			},
			removequickviewScene7 : function(){
				var quickviewflyoutassets = [
				     						$('*[id^=lupaflyzoom]'),
				     						$('*[id^=lupaVflyzoom]'),
				     						$('*[id^=lupaImgflyzoom]'),
				     						$('*[id^=contflyzoom]')
				     						]
				     						$(quickviewflyoutassets).each(
				     								function(idx,item){
				     									item.eq(item.length-1).remove();
				     									});
			}
		},

		// helper method to create a dialog with the given options
		// options - dialog box options along with id of the container
		createDialog: function(options) {
			jQuery('#'+options.id).dialog(jQuery.extend({}, app.dialogSettings, options.options));
		},

		// shows tooltip popup
		// options
		// id - id of the container
		// options - tooltip popup options
		tooltip: function(options) {
			if (options.id.charAt(0) !== '#') {
				options.id = "#"+options.id;
			}
			jQuery(options.id).tooltip(jQuery.extend({}, app.tooltipSettings, options.options));
		},
		
		/**
		 * Unobtrusively build tooltips on the page.
		 * it looks for a tooltip class anchor which contains a div with tooltip-body class as the body container.
		 */
		tooltipDefault: function () {	 
			 jQuery(document).ready(function() {
				 //jQuery('div.tooltip, div.tooltip1').attr('tabindex', '0');// to add keyboard focus
				 
				//commented to disable jquery.tooltip plugin, and will now just use beautytip plugin
				 /*jQuery(".tooltip1").tooltip(jQuery.extend({}, app.tooltipSettings, {	
						bodyHandler: function() {
							return jQuery(this).children(".tooltip-body").html();
						}
					}

				 ));*/
				 
				 jQuery('.tooltip1 .tooltip-body').hide();
				 if (navigator.userAgent.indexOf('iPad') > -1){
						jQuery('.tooltip1').each(function() {
			                $(this).bt({
			                	trigger: ['focus mouseover', 'blur mouseout'],
			                	contentSelector: "jQuery(this).find('.tooltip-body').html()", 
			                	fill: '#FFF', positions: ['right','left','top', 'bottom'], cornerRadius: 1, strokeWidth: 1, shadow: true, shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 5, shadowColor: 'rgba(0,0,0,.4)', shadowOverlap: false, noShadowOpts: {strokeStyle: '#ccc', strokeWidth: 1}
		                	});  
			          	});
		          	}else{
		          		jQuery('.tooltip1').each(function() {
		          			$(this).bt({
		          				trigger: ['focus mouseover', 'blur mouseout'],
		          				contentSelector: "jQuery(this).find('.tooltip-body').html()", 
		          				fill: '#FFF', positions: ['right','left','top', 'bottom'], cornerRadius: 1, strokeWidth: 1, shadow: true, shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 5, shadowColor: 'rgba(0,0,0,.4)', shadowOverlap: false, noShadowOpts: {strokeStyle: '#ccc', strokeWidth: 1}
		          			});
		          		});
	          		}
			 });			
		},

		// renders a progress indicator on the page; this function can be used
		// to indicate an ongoing progress to the user; the optional parameter "className"
		// can be used to attach an additional CSS class to the container
		showProgress : function(className) {
			var clazz = "loading";
			if (className) clazz += " " + className;
			return jQuery("<div class=\"" + clazz + "\"/>").append(jQuery("<img/>").attr("src", app.URLs.loadingSmallImg));
		},

		// validation plugin intialization
		validator: function() {
			// override default required field message
			
			jQuery.validator.messages.required = function($1, ele, $3) {
				var thislabel;
				if( jQuery(ele).parents(".valid_as_fieldset").length ) {
		            /* special handling */
					thislabel = $("label[for="+$(ele).parents("fieldset").attr("id")+"]").eq(0);
		        } else {
		            /* generic handling */
		        	thislabel = $("label[for="+$(ele).attr("id")+"]").eq(0);
		        }
				try{
					/*return app.resources["MISSINGVAL"].replace("{0}",thislabel.text().replace(/[:\*]/g,''));*/
					var conFirmField="";
					var uniqueField="";
					var classList = ele.className.split(/\s+/);
					for (var i = 0; i < classList.length; i++) {
					   if (classList[i].search("CONFIRM_")> -1) {
						   conFirmField = "MISSINGVAL_" + classList[i];
					   }
					   else if (classList[i].search("UNIQUE_")> -1) {
						   uniqueField = "MISSINGVAL_" + classList[i];
					   }
					}
					if( conFirmField.length) {
                        /* special handling */
							return app.resources[conFirmField].replace("{0}",thislabel.text().replace(/[:\*]/g,''));
                        	//return "test";
					}
					else if( uniqueField.length) {
                        /* special handling */
						return app.resources[uniqueField].replace("{0}",thislabel.text().replace(/[:\*]/g,''));
                    	//return "test";
					}else if(thislabel.text() == ""){
						return app.resources["INVALID_POSTCODE_CP"];
						}
					else {
					return app.resources["MISSINGVAL"].replace("{0}",thislabel.text().replace(/[:\*]/g,''));
					}
				}catch(err){
					/* no label present for this form field or label for="" does not match */
					return "";
				}
			};
			/**
			 * Add phone validation method to jQuery validation plugin.
			 * Text fields must have 'phone' css class to be validated as phone
			 * phoneUS is copied from http://docs.jquery.com/Plugins/Validation/CustomMethods/phoneUS
			 */
			jQuery.validator.addMethod("phone", function(phone_number, element) {
				
                // preserve this instance
                var that = this;
                
                // country specific phone validation handlers
                var phoneCA,
                phoneUS = phoneCA = function() {
                      phone_number = phone_number.replace(/\s+/g, ""); 
                      return that.optional(element) || phone_number.length > 9 &&
                            phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
                }
                
                var phoneFR = function() {
               	//INC000006782556/6782459 by:DAMODAR CONTACT NUMBER SHOULD BE ACCEPTED WITH SPACE WITHOOUT RETURNING AN ERROR MESSAGE                
                      return that.optional(element) || phone_number.length > 9 &&
                      //phone_number.match(/^\d{10,15}\s+$/g);
                      phone_number.match(/^[0-9 ]{10,15}$/);
                }
                
				var phoneEU = function() {
               	// Phone no validation length change (to allow min 8 instead of 10 )                
                      return that.optional(element) || phone_number.length > 5 &&
                      //phone_number.match(/^\d{8,15}\s+$/g);
                      phone_number.match(/^[0-9 ]{6,15}$/);
                }
                var phoneIE = function() {
                    //INC000006782556/6782459 by:DAMODAR CONTACT NUMBER SHOULD BE ACCEPTED WITH SPACE WITHOOUT RETURNING AN ERROR MESSAGE                
                      return that.optional(element) || phone_number.length > 6 &&
                     //phone_number.match(/^\d{7,15}$/);
                     phone_number.match(/^[0-9 ]{7,15}$/);
                }                 
                var phoneHandler = null;
                // select the handler to be used
                switch(app.resources["COUNTRY_CODE"]) {                		
					case "EU" :
						phoneHandler = phoneEU;
						break;			
					case "IE" :
						phoneHandler = phoneIE;
						break;
					case "FR" :
						phoneHandler = phoneFR;
						break;
					default	:
						phoneHandler = phoneUS;                      
                }
                
              // call the country specific phone validation handler
                return (phoneHandler && typeof phoneHandler == "function" ? phoneHandler() : true);
                

			}, app.resources["INVALID_PHONE"]);
			
			/**
			 * Add positive number validation method to jQuery validation plugin.
			 * Text fields must have 'positivenumber' css class to be validated as positivenumber
			 * it validates a number and throws error if it is below 0 or if it is not a number.
			 */
			jQuery.validator.addMethod("maxlengthpswd", function(value, element) {
				var that = this;
				//if (value == '') return true;
				return value.length >= 5;
			}, app.resources["INVALID_PHONE"]); // "" should be replaced with error message if needed
			
			
			
			/**
			 * Add positive number validation method to jQuery validation plugin.
			 * Text fields must have 'positivenumber' css class to be validated as positivenumber
			 * it validates a number and throws error if it is below 0 or if it is not a number.
			 */
			jQuery.validator.addMethod("positivenumber", function(value, element) {
				var that = this;
				//if (value == '') return true;				
				return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?$/.test(value) && value.length > 0 && Number(value) >= 0;
			}, app.resources["INVALID_POSITIVE_NUMBER"]); // "" should be replaced with error message if needed
			
				/** 04-apr
			 * Add email validation method to jQuery validation plugin.
			 * Text fields must have 'emailnum' css class to be validated as email
			 * it validates a number and throws error if it is below 0 or if it is not a number.
			 */

			/**
			 * Add city validation method to jQuery validation plugin.
			 * city field should start with an alphabet - Chetan
			 */
			
			jQuery.validator.addMethod("startWithAlphabet", function(value, element) {
				var that = this;
				return /^[a-zA-Z]/.test(value);
			}, app.resources["INVALID_CITY_FIELD"]);
						
			///////////////////// START: NAVEEN KUMAR Error Handling for Payment Page ///////////////////////////
			jQuery.validator.addMethod("tncerror", function(value, element) {				
				//removeErrorMsg();
				var that = this;
				return (element.checked);
			}, app.resources["SELECT_TNC_ERROR"]);  // "" should be replaced with error message if needed			
			///////////////////// END: NAVEEN KUMAR Error Handling for Payment Page ///////////////////////////			
						
			jQuery.validator.addMethod("emailnum", function(value, element) { 
				//removeErrorMsg();
				var that = this;
				if (value == '') return true;				
				return that.optional(element)  ||  /^[\w-\.]{1,}\@([\da-zA-Z-]{1,}\.){1,}[\da-zA-Z-]{2,3}$/.test(value);
			}, app.resources["INVALID_EMAIL"]);  // "" should be replaced with error message if needed			

			jQuery.validator.addMethod("confirmfriendemailnum", function(value, element) {
				//removeErrorMsg();
				var that = this;
				if (value == '') return true;
				return $(".stffriendemail .emailnum").val() == $(".confirmfriendemailnum").val();
			}, app.resources["INVALID_CONFIRMEMAIL"]);  // "" should be replaced with error message if needed
			
			/** 04-apr
			 * Add confirm email validation method to jQuery validation plugin.
			 * Text fields must have 'confirmemailnum' css class to be validated as email
			 * it validates a number and throws error if it is below 0 or if it is not a number.
			 */
			jQuery.validator.addMethod("confirmemailnum", function(value, element) {
				//removeErrorMsg();
				var that = this;
				if (value == '') return true;
				return $(".emailnum").val() == $(".confirmemailnum").val();
			}, app.resources["INVALID_CONFIRMEMAIL"]);  // "" should be replaced with error message if needed
			
			/** 16-may:nadeem
			 * Add confirm password validation method to jQuery validation plugin.
			 * Text fields must have 'confirmpassword' css class to be validated as password
			 * it validates a number and throws error if it is below 0 or if it is not a number.
			 */
			jQuery.validator.addMethod("confirmpswd", function(value, element) {
				
				var that = this;
				if (value == '') return true;
				return $(".newpswd").val() == $(".confirmpswd").val();
			}, app.resources["INVALID_CONFIRMPASSWORD"]);  // "" should be replaced with error message if needed
			
			
			
			/* french name added to allow for Credit card names in french */
			jQuery.validator.addMethod("alpha_fr", function(value, element) {
					var that = this;
				return that.optional(element)  ||  /^[\u0041-\u005A\u0061-\u007A\u00C0-\u00FF\u002C\u002D\u002E\u0020\u0027]+$/.test(value);
			}, app.resources["CARD_PERSON_NAME"]); 
			
			
			/*CR-810 QC-3174*/
						
			/**
			 * Add zip validation method to jQuery validation plugin.
			 * Text fields must have 'postcode_fr' css class to be validated as phone
			 * zipDefault has the same validation as zipFR; can be changed, if needed.
			 */
			jQuery.validator.addMethod("postcode_fr", function(value, element) {
                // preserve this instance
                var that = this;
                var zipShipping = function() {                	
            		value = jQuery.trim(value);
            		return that.optional(element) || (!value.match(/[^A-Za-z0-9 ]{1,10}/) && ((/^\d{4,5}$/.test(value))||(/^\d{4}[a-zA-Z]{2}$/.test(value))));
            		}   
                var zipBilling = function() {                	
            		value = jQuery.trim(value);
            		return that.optional(element) || (!value.match(/[^A-Za-z0-9 ]{1,10}/) && ((/^\d{4,5}$/.test(value))||(/^\d{4}[a-zA-Z]{2}$/.test(value))||(/[a-zA-Z]{1}(\d{1}[a-zA-Z]{1}||\d{1,2}||[a-zA-Z]{1}\d{1}[a-zA-Z]{1})\s{0,1}\d{1}[a-zA-Z]{2}/.test(value))));
            		}   
                var zipHandler = null;
          	    if($(element).hasClass('billingpage')){
        		  zipHandler = zipBilling;
	          	  } else {
	          		  zipHandler = zipShipping;
	          	  } 
                
                // Site specific postcode validation handlers
                /*var zipDefault = function() {
    				var c=value.replace(/0{5}|1{5}|9{5}|(98[1-9]\d{2})|\D/g,'');
    				return that.optional(element)  ||  /\d{5,10}/.test(c);
                }

                var zipFR= function() {
    				var c=value.replace(/0{5}|1{5}|9{5}|(98[1-9]\d{2})|\D/g,'');
    				return that.optional(element)  ||  /\d{5}/.test(c);
                }

                var zipEU = function() {
                	//QC Defect 2457 | International EU Website SIT:Unable to save address when the post code is entered with Alpha numeric value in My address page
            		//var c=value.replace(/0{4}|1{4}|9{4}|(98[1-9]\d{2})|\D/g,'');
            		var c=value.replace(/0{4}|1{4}|9{4}|0{5}|1{5}|9{5}/,'');
            		c = jQuery.trim(c);
            		//return that.optional(element)  ||  value.match(/^\d{4,10}$/) && /\d{4,10}/.test(c);
    				//return that.optional(element) || (!c.match(/[^A-Za-z0-9 ]{1,10}/) && /[A-Za-z0-9 ]{4,10}/.test(c));            		
            		return that.optional(element) || (!c.match(/[^A-Za-z0-9 ]{1,10}/) && ((/^\d{4,5}$/.test(c))||(/^\d{4}[a-zA-Z]{2}$/.test(c))||(/^[a-zA-Z]{1}(\d{1}[a-zA-Z]{1}||\d{1,2}||[a-zA-Z]{1}\d{1}[a-zA-Z]{1})\s{0,1}\d{1}[a-zA-Z]{2}$/.test(c))));
            		}
                
                var zipHandler = null;
                // select the handler to be used               
               switch(app.resources["COUNTRY_CODE"]) {                
		              case "EU" :
		            	  	zipHandler = zipEU;
		                    break;                
                      case "FR" :
                    		/*CR-810 QC-3174                   	  
                    	  if($(element).hasClass('uk_postcode')){
                    		  zipHandler = zipEU;
                    	  } else {
                    		  zipHandler = zipFR;
                    	  } 
                   	   	
                            break;
                      default   :
                    	  /*CR-810 QC-3174
                    	  if($(element).hasClass('uk_postcode')){
                    		  zipHandler = zipEU;
                    	  } else {
                    		  zipHandler = zipDefault;
                    	  } 
                 
                }*/
                
               
              // call the country specific phone validation handler
                return (zipHandler && typeof zipHandler == "function" ? zipHandler() : true);               

			}, app.resources["INVALID_POSTCODE_FR"]);
			
			/**
			 * Add zip validation method to jQuery validation plugin.
			 * Text fields must have 'postcode_fr' css class to be validated as phone
			 * zipDefault has the same validation as zipFR; can be changed, if needed.
			 */
			jQuery.validator.addMethod("postcode_cp", function(value, element) {
                // preserve this instance
                var that = this;
                var zipShipping = function() {                	
            		value = jQuery.trim(value);
            		return that.optional(element) || (!value.match(/[^A-Za-z0-9 ]{1,10}/) && ((/^\d{4,5}$/.test(value))||(/^\d{4}[a-zA-Z]{2}$/.test(value))));
            		}   
                var zipBilling = function() {                	
            		value = jQuery.trim(value);
            		return that.optional(element) || (!value.match(/[^A-Za-z0-9 ]{1,10}/) && ((/^\d{4,5}$/.test(value))||(/^\d{4}[a-zA-Z]{2}$/.test(value))||(/[a-zA-Z]{1}(\d{1}[a-zA-Z]{1}||\d{1,2}||[a-zA-Z]{1}\d{1}[a-zA-Z]{1})\s{0,1}\d{1}[a-zA-Z]{2}/.test(value))));
            		}   
                var zipHandler = null;
          	    if($(element).hasClass('billingpage')){
        		  zipHandler = zipBilling;
	          	  } else {
	          		  zipHandler = zipShipping;
	          	  }                 
               
              // call the country specific phone validation handler
                return (zipHandler && typeof zipHandler == "function" ? zipHandler() : true);               

			}, app.resources["INVALID_POSTCODE_CP"]);
			
			jQuery.validator.addMethod("passwordvalidation", function(value, element) {
				//removeErrorMsg();
				var that = this;
				if (value == '') {return true;}
				return value.length>=5;

			}, app.resources["INVALID_PASSWORD"]);  // "" should be replaced with error message if needed
		
			//CR 3103		
			jQuery.validator.addMethod("newpasswordvalidation", function(value, element) {
				   //return (/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[^A-Za-z0-9]).{6,}$/.test(value)) &&  value.length>=6;
				   //return (/(?=.*[A-Za-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[^A-Za-z0-9]).{6,}$/.test(value)) &&  value.length>=6;
				   return (/(?=.*[A-Za-z])(?=.*[A-Z])(?=.*[\d])(?!.*[_])(?!.*[\W]).{6,}$/.test(value)) &&  value.length>=6;				  
			}, app.resources["INVALID_NEW_PASSWORD"]); 

			
			/* date checks if date is actually valid not just in date format 
			 * Includes leap years and leap centuries 
			 * add minage for 18+ etc... */
			jQuery.validator.addMethod("real_date", function(value, element , minage) {
				var that = this;
				if(Y.length<4){return false;}
				var d = new Date(""+M+"/"+D+"/"+Y);
				var valid = d.getMonth() == parseInt(M,10)-1;
				minage = minage?minage:0;
				if(valid){
				var now = new Date();
				var test = new Date(d.getTime());
				test.setFullYear(d.getFullYear()+minage)
				valid = (now.getTime() > test.getTime()) && (now.getTime()>=d.getTime());
				}
				return that.optional(element)  || valid;
			}, app.resources["INVALID_REALDATE"]); 
			

			
			/*
			 * 
			 * M&S Specific card validation routine
			 */
			jQuery.validator.addMethod("creditcard_updated", function(value, element) {
				var that = this;
				var counter = 0;
				var incNum;
				var odd = false;
				var luhnArr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]; /*807052*/
				//var v = value.replace(/[^\d]/g,''); /*807052*/
				//INC000006782556/6782459 by:DAMODAR CONTACT NUMBER SHOULD BE ACCEPTED WITH SPACE WITHOOUT RETURNING AN ERROR MESSAGE 
				//credit card front end validation
				var ccValueWithSpace = element.value;
				var  v = element.value;		
				v = v.replace(/\s+/g, "");				
				//if(element.value){element.value = v;}
				if(v.length>16 || v.length<13){
					return false;
				}
				if(v.length>16){v = v.substr(0,16);}

				if ( v.length == 0)
					return false;
				if (v.charAt(0) == '*')
					return true; /*807052*/
				for (var i = v.length-1; i >= 0; --i)
				{
					incNum = parseInt(v.charAt(i), 10);
					counter += (odd = !odd)? incNum : luhnArr[incNum];
				}
				return that.optional(element)  || (counter%10 == 0);

			}, app.resources["INVALID_CREDITCARD"]);
			
			/*
			 * 
			 * Ireland  Specific card validation routine for Maestro cards
			 */
			jQuery.validator.addMethod("creditcard_maestro", function(value, element) {
			
				var that = this;
				var counter = 0;
				var incNum;
				var odd = false;
				var luhnArr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]; /*807052*/
				//INC000006782556/6782459 by:DAMODAR CONTACT NUMBER SHOULD BE ACCEPTED WITH SPACE WITHOOUT RETURNING AN ERROR MESSAGE 
				//credit card front end validation
				var ccValueWithSpace = element.value;
				var v = element.value;
				v = v.replace(/\s+/g, "");		 
				//var v = value.replace(/[^\d]/g,''); /*807052*/
				//if(element.value){element.value = v;}
				if(v.length>19 || v.length<13){
					return false;
					
				}
				//if(v.length>16){v = v.substr(0,16);}

				if ( v.length == 0)
					return false;
				if (v.charAt(0) == '*')
					return true; /*807052*/
				for (var i = v.length-1; i >= 0; --i)
				{
					incNum = parseInt(v.charAt(i), 10);
					counter += (odd = !odd)? incNum : luhnArr[incNum];
				}
				return that.optional(element)  || (counter%10 == 0);

			}, app.resources["INVALID_CREDITCARD"]);
			
			/**** Generic Function to test Month/Year/Date  | Start****/
			function validateMonth(elemM) {
			   var expiryMonth;
			   var isValidMonth = false;
			   if (elemM!=null) {
			    expiryMonth = elemM.attr('value');
			    if(expiryMonth.length != 0 && parseInt(expiryMonth,10)>0 && parseInt(expiryMonth,10)<=12 && /^\d{1,2}$/.test(expiryMonth)) {
			    	isValidMonth = true;
			    }    
			   }
			   return isValidMonth;
			}
			
			function validateYear(elemYear) {   
			   var expiryYear;
			   var isValidYear = false;
			   if (elemYear!=null) {
			    expiryYear = elemYear.attr('value');
			    if(expiryYear.length != 0 && parseInt(expiryYear,10)>0 && /^\d{1,4}$/.test(expiryYear)) {
			    	isValidYear = true;
			    }    
			   }
			   return isValidYear;
			}

			function validFutureDate(elemYear, elemMonth) {   
				var varMonth = elemMonth.attr('value');
				var varYear = elemYear.attr('value');
				var selectedDate = new Date();
				var now = selectedDate.getTime();				
				try{
					selectedDate.setMonth(parseInt(varMonth,10)-1);
					selectedDate.setYear(parseInt(varYear,10));
					var d=new Date(selectedDate.getTime());
					var e= new Date(now);
					return selectedDate.getTime() >= now;
				}catch(err){
					return false;
				}					
			}
			function validPastDate(elemYear, elemMonth) {
				var varMonth = elemMonth.attr('value');
				var varYear = elemYear.attr('value');
				var selectedDate = new Date();
				var now = selectedDate.getTime();
				try{
					selectedDate.setMonth(parseInt(varMonth,10)-1);
					selectedDate.setYear(parseInt(varYear,10));
					return selectedDate.getTime() <= now;
				}catch(err){
					return false;
				}					
			}
			/**** Generic Function to test Month/Year/Date  | End****/
			
			/***Date/Month/Year valid From Field | Start****/
			function vaidateValidFromMonth(value, element) {
				var elemM = jQuery(".validfrom_month");
//				if(!elemM.hasClass("required")){return true;}
				return validateMonth(elemM);
			}
			
			function vaidateValidFromYear(value, element) {
				var elemY = jQuery(".validfrom_year");
				var fromYear = elemY.attr('value');
				var now = new Date();
				var currYear = now.getFullYear();
				if (validateYear(elemY) && (parseInt(fromYear,10)<=currYear)){
					return true;
				} else {	
					return false;
				}
			}
			
			function validateValidFromDate(value, element) {
				var isValidValidFromDate = true;
				var elemM = jQuery(".validfrom_month");
				var elemY = jQuery(".validfrom_year");
				if (!this.optional(element)) {
					if(validateMonth(elemM) && validateYear(elemY)){
						if(!validPastDate(elemY, elemM)) {
							if($(element).hasClass(".validfrom_year")){
								if($(".validfrom_month").next().next(".errorclient").text()==""){
									isValidValidFromDate = false;
								}
							}
							if($(element).hasClass(".validfrom_month")){
								if($(".validfrom_year").next().next(".errorclient").text()==""){
									isValidValidFromDate = false;
								}
							}
						} else {
							if($(element).hasClass(".validfrom_year")){
								if($(".validfrom_month").next().next(".errorclient").text()==app.resources["INVALID_CREDITCARD_VALIDFROM_DATE"]){
									unhighlightElem($(".validfrom_month"));
								}
							}
							if($(element).hasClass(".validfrom_month")){
								if($(".validfrom_year").next().next(".errorclient").text()==app.resources["INVALID_CREDITCARD_VALIDFROM_DATE"]){
									unhighlightElem($(".validfrom_year"));
								}
							}	
						}	
				   }
				}
				return isValidValidFromDate;					
			}
			
			jQuery.validator.addMethod("validate_validfrom_month", vaidateValidFromMonth, app.resources["INVALID_CREDITCARD_EXPIRES_MONTH"]); 
			jQuery.validator.addMethod("validate_validfrom_year", vaidateValidFromYear, app.resources["INVALID_CREDITCARD_EXPIRES_YEAR"]); 
			jQuery.validator.addMethod("validate_validfrom_date", validateValidFromDate, app.resources["INVALID_CREDITCARD_VALIDFROM_DATE"]); 
			
			jQuery.validator.addClassRules('validfrom_month', {
		        'validate_validfrom_month' : true,
	        	'validate_validfrom_date' : true
			});
			
			jQuery.validator.addClassRules('validfrom_year', {
		        'validate_validfrom_year' : true,
	        	'validate_validfrom_date' : true
			});			
			/***Date/Month/Year Valid From Field | Ends****/
			
			/***Date/Month/Year Expires Field | Start****/
			function vaidateExpiryMonth(value, element) {
				var elemM = jQuery(".expire_month");
				if(!elemM.hasClass("required")){return true;}
				return validateMonth(elemM);
			}
			
			function vaidateExpiryYear(value, element) {
				var elemY = jQuery(".expire_year");
				var expiryYear = elemY.attr('value');
				var now = new Date();
				var currYear = now.getFullYear();
				if(!elemY.hasClass("required")){return true;}				
				if (validateYear(elemY) && (parseInt(expiryYear,10)>=currYear)){
					return true;
				} else {	
					return false;
				}
			}
			
			function unhighlightElem(element) {
				if (element!=null) {
					element.removeClass("errorclient");
					element.next(".errorIcon").addClass("successIcon");				
					element.prev(".errorinputbox_leftcurve").removeClass('errorinputbox_leftcurve').addClass("genericinputbox_leftcurve");/*Apply left curve for textboxes*/
					element.parents(".formfield").find(".errorlabel").removeClass("errorlabel"); /*Mark Label as red*/
					element.next().next(".errorclient").text("");
				}
			}
			
			function validateExpiryDate(value, element) {
				var isValidExpiryDate = true;
				var elemM = jQuery(".expire_month");
				var elemY = jQuery(".expire_year");
				if (!this.optional(element)) {
					if(validateMonth(elemM) && validateYear(elemY)){
						if(!validFutureDate(elemY, elemM)) { 
							if($(element).hasClass(".expire_year")){
								if($(".expire_month").next().next(".errorclient").text()=="") {
									isValidExpiryDate = false;
								}
							}
							if($(element).hasClass(".expire_month")){
								if($(".expire_year").next().next(".errorclient").text()=="") {
									isValidExpiryDate = false;
								}
							}
						} else {
							if($(element).hasClass(".expire_year")){
								if($(".expire_month").next().next(".errorclient").text()==app.resources["INVALID_CREDITCARD_EXPIRES_DATE"]){
									unhighlightElem($(".expire_month"));
								}
							}
							if($(element).hasClass(".expire_month")){
								if($(".expire_year").next().next(".errorclient").text()==app.resources["INVALID_CREDITCARD_EXPIRES_DATE"]){
									unhighlightElem($(".expire_year"));
								}
							}	
						}	
				   }
				}
				return isValidExpiryDate;					
			}
			
			jQuery.validator.addMethod("validate_expire_month", vaidateExpiryMonth, app.resources["INVALID_CREDITCARD_EXPIRES_MONTH"]); 
			jQuery.validator.addMethod("validate_expire_year", vaidateExpiryYear, app.resources["INVALID_CREDITCARD_EXPIRES_YEAR"]); 
			jQuery.validator.addMethod("validate_expire_date", validateExpiryDate, app.resources["INVALID_CREDITCARD_EXPIRES_DATE"]); 
			
			jQuery.validator.addClassRules('expire_month', {
		        'validate_expire_month' : true,
	        	'validate_expire_date' : true
			});
			
			jQuery.validator.addClassRules('expire_year', {
		        'validate_expire_year' : true,
	        	'validate_expire_date' : true
			});		
			/***Date/Month/Year Expires Field | Ends****/
			
			jQuery.validator.addMethod("cvn", function(value, element) {
				var that = this;
				//if (v.charAt(0) == '*')
				//	return true; /*807052*/
				return that.optional(element)  || /\d{3,4}/.test(value);
			}, app.resources["INVALID_CVN"]); 
			//single error message for klarna date of birth fields
			// aliddl : not needed as of 18 Sept 2012
			var klarnaDOBErrorMessageFunc = function () { 
				var strTemp = jQuery('div.klarnaDoB > label').text();
				strTemp = strTemp.replace(':*', '');
				return (jQuery.format(app.resources["MISSINGVAL"], strTemp)); 
			};
			jQuery.validator.addMethod("invalidKlarnaDOB",function(value, element){
					var dobDay = $("#birthday_day").val();
					var dobMonth = $("#birthday_month").val();
					var dobYear = $("#birthday_year").val();
					var isValidDOB = true;
					if ((dobDay.length == 0) || (dobMonth.length == 0) || (dobYear.length == 0)){
						 isValidDOB = false;
					}
					return isValidDOB;
				},klarnaDOBErrorMessageFunc
			);
			// register form validator for form elements
			// except for those which are marked "suppress"
			jQuery.each(jQuery("form:not(.suppress)"), function() {
				jQuery(this).validate(app.validatorSettings);
			});
		},

		/**
		 * grab anything inside a hidden dom element and append it to its immediate previous sibling
		 * as data attribute i.e. jQuery().data("data", hiddenStr)
		 * if the hidden data specifies json in the class then this routine would attempt to 
		 * convert the hidden data into json object before adding it as data attribute.
		 * after adding the data, the hidden span/element is removed from the DOM.
		 */
		hiddenData : function() {
			jQuery.each(jQuery(".hidden"), function() {
				var hiddenStr = jQuery(this).html();
				
				if (hiddenStr === "") {
					return;
				}
				
				// see if its a json string
				if (jQuery(this).hasClass("json")) {
					// try to parse it as a json
					try {
						hiddenStr = window["eval"]("(" + hiddenStr + ")");
					}
					catch(e) {}				
				}
				
				jQuery(this).prev().data("data", hiddenStr);
				
				jQuery(this).remove();
			});
		},
		
		/**
		 * Process country drop downs and attach a change listener so that phone field 
		 * can be validated properly based on the currently selected country.
		 */
		addCountryListener: function() {
			var countryHandler = function(e) {
				var selectedCountry = this.options[this.selectedIndex].value;
				// for each field of type phone in the current form, set its country as a data attribute
				// to be used while doing phone field validatiaon see app.validator addMethod.
				jQuery(this).parents("form:first").find("input.phone").each(function() {
					var data = jQuery(this).data("data");
					var currentData = (data && typeof data == 'object') ? data : {};
					currentData.country = selectedCountry;
					jQuery(this).data("data", currentData);
				});						
			}
			jQuery("select.country").change(countryHandler).each(countryHandler);
		},
		
		/**
		 * Unobtrusive js api calls go here.
		 */
		 execUjs: function() {
	
			// process hidden data in the html markup and cnnvert it into data object(s)
			this.hiddenData();
			
			// initialize form validator plugin
			this.validator();
			
			// process country form fields and attach listeners
			this.addCountryListener();
			
			// process tooltips on the page
			this.tooltipDefault();
		},
		
		// capture recommendation of each product when it becomes visible in the carousel
		captureCarouselRecommendations : function(c, li, index, state) {
			jQuery(li).find(".captureproductid").each(function() {
				dw.ac.capture({id:this.innerHTML, type:dw.ac.EV_PRD_RECOMMENDATION});
			});
		},
		
		// [provide description please!]
		hover : {
			init: function() {
				var t;
				$(".size_hover").hover(function(){
					var self = $(this);
					t = setTimeout(function(){
					self.find(".size_popin").show().bgiframe();
					}, 300); 
				},function(){
					$(this).find(".size_popin").hide();
					clearTimeout(t);
				});
			}
		},

		// sub namespace app.producttile.* contains utility functions for product tiles
		producttile : {
			// initializes all product tiles contained in the current page
			initAll: function() {
				// bind quick view button toggling and click
				var quickViewOptions = {
					buttonSelector: "div.producttile div.quickviewbutton",
					imageSelector: "div.producttile div.image",
					buttonLinkSelector: "div.producttile div.quickviewbutton a"
				};
				app.quickView.bindEvents(quickViewOptions);
				
				// prepare swatch palettes and thumbnails
				jQuery("div.producttile div.swatches div.invisible").hide();
				jQuery("div.producttile div.swatches a.swatch img.hiddenthumbnail").hide();
				
				// show the palette
				jQuery("div.producttile div.swatches > a").click(function(e) {
					var cont = jQuery(this).parent().find("div.palette");
					cont.show().focus();
					return false;
				});
				
				// hide the palette
				jQuery("div.producttile div.swatches div.invisible").mouseout(function(e) {
					// fix for event bubbling (http://www.quirksmode.org/js/events_mouse.html)
					if(!e) var e = window.event;
					var tg = (window.event) ? e.srcElement : e.target;
					if(tg.nodeName != 'DIV') return;
					var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
					while(reltg != tg && reltg.nodeName != 'BODY')
						reltg = reltg.parentNode
					if (reltg == tg) return;
					
					// mouseout took place when mouse actually left layer
					// handle event now
					jQuery(this).hide();
					return false;
				});
				
				// thumb nail toggling
				jQuery("div.producttile div.swatches div.palette a.swatch").bind("mouseover mouseout", function(e) {
					var swatch = jQuery(this);
					app.producttile.toggleVariationThumbnail(swatch);
				});
				
				// color swatch selection
				jQuery("div.producttile div.swatches div.palette a.swatch").click(function(e) {
					var swatch = jQuery(this);
					app.producttile.selectVariation(swatch);
					// omit following the swatch link
					return false;
				});
			},

			// selects a certain variation in a product tile, replaces the current image with
			// the correct variation image, changes the link to the detail
			// page and the quick view
			selectVariation : function(swatch) {
				// get the new and the original image
				var currentImg = jQuery(swatch.parents()[3]).find(".productimage img");
				var newImg = swatch.children("img.hiddenthumbnail");
				if(!currentImg || !newImg) return;
				
				// get the anchors
				var nameAnchor = swatch.parents(".producttile").find(".name a");
				var quickViewAnchor = swatch.parents(".producttile").find(".quickviewbutton a");
				var imageAnchor = swatch.parents(".producttile").find(".productimage a");
				
				// change the link url to the detail page and quick view
				var newUrl = swatch.attr("href");
				nameAnchor.attr("href", newUrl);
				quickViewAnchor.attr("href", newUrl);
				imageAnchor.attr("href", newUrl);
				
				// remove all current markers
				jQuery(swatch.parents()[0]).find("a.swatch").removeClass("selected");
				
				// mark swatch as selected
				swatch.addClass("selected");
				// we just remove the markers at the images; the actual elements
				// are correct, since they were already swapped by mouse over
				currentImg.removeClass("temp original");
				newImg.removeClass("temp original");
			},

			// shows the thumb nail of a product; this function is used to
			// temporally display a new image and restore the original one
			toggleVariationThumbnail : function(swatch,morecolorlink) {
				// get the new and the original image
				var currentImg = jQuery(swatch.parents()[3]).find(".productimage img");
				
				if(morecolorlink == 'true') 
				{
					currentImg = jQuery(swatch.parents()[1]).find(".productimage img");
				}
				var newImg = swatch.children("img.hiddenthumbnail");
				if(!newImg || !currentImg) return;
				
				var selectedSwatch = jQuery(swatch.parents()[0]).find("a.selected");
				var selectedImg = selectedSwatch.children("img.hiddenthumbnail");

				// we do nothing in case the swatch is already selected
				if(swatch.hasClass("selected")) return;
				
				if(currentImg.hasClass("temp")) {
					// current image is just a temp image, restore original
					var newCopy = selectedImg.clone().show().removeClass("original hiddenthumbnail");
					currentImg.replaceWith(newCopy[0]);
				} else {
					// we create a copy of the swatch image, replace
					// the current and mark it with classes
					var newCopy = newImg.clone().show().addClass("temp").removeClass("hiddenthumbnail");
					currentImg.replaceWith(newCopy[0]);
				}
			}
		},

		// sub namespace app.util.* contains utility functions
		util : {
			// disables browser auto completion for the given element
			disableAutoComplete : function(elemId) {
				jQuery("#"+elemId).attr("autocomplete", "off");
			},

			// trims a prefix from a given string, this can be used to trim
			// a certain prefix from DOM element IDs for further processing on the ID
			trimPrefix : function(str, prefix) {
				return str.substring(prefix.length);
			},

			// appends the parameter with the given name and
			// value to the given url and returns the changed url
			appendParamToURL : function(url, name, value) {
				var c = "?";
				if(url.indexOf(c) != -1) {
					c = "&";
				}
				return url + c + name + "=" + encodeURIComponent(value);
			},

			// dynamically loads a CSS file
			loadCSSFile : function(url) {
				var elem = document.createElement("link");
				elem.setAttribute("rel", "stylesheet");
				elem.setAttribute("type", "text/css");
				elem.setAttribute("href", url);

				if(typeof elem != "undefined") {
					document.getElementsByTagName("head")[0].appendChild(elem);
					app.util.loadedCSSFiles.push(url);
				}
			},

			// array to keep track of the dynamically loaded CSS files
			loadedCSSFiles : [],

			// removes all dynamically loaded CSS files
			clearDynamicCSS : function() {
				for(var i=0; i<app.util.loadedCSSFiles.length; i++) {
					app.util.unloadCSSFile(app.util.loadedCSSFiles[i]);
				}
			},

			// dynamically unloads a CSS file
			unloadCSSFile : function(url) {
				var candidates = document.getElementsByTagName("link");
				for(var i=candidates.length; i>=0; i--) {
					if(candidates[i] && candidates[i].getAttribute("href") != null && candidates[i].getAttribute("href").indexOf(url) != -1) {
						candidates[i].parentNode.removeChild(candidates[i]);
					}
				}
			},

			// checks if cookies are enabled
			cookiesEnabled : function() {
				// first we'll split this cookie up into name/value pairs
				// note: document.cookie only returns name=value, not the other components
				var all_cookies = document.cookie.split( ';' );
				var temp_cookie = '';
				var cookie_name = '';
				var cookie_value = '';
				var cookie_found = false; // set boolean t/f default f

				for ( i = 0; i < all_cookies.length; i++ )
				{
					// now we'll split apart each name=value pair
					temp_cookie = all_cookies[i].split( '=' );

					// and trim left/right whitespace while we're at it
					cookie_name = temp_cookie[0].replace(/^\s+|\s+$/g, '');

					// if the extracted name matches the session cookie name 
					if ( cookie_name == 'sid' )
					{
						// we need to handle case where cookie has no value but exists (no = sign, that is):
						if ( temp_cookie.length > 1 )
						{
							cookie_value = unescape( temp_cookie[1].replace(/^\s+|\s+$/g, '') );
						}

						if (cookie_value.length > 0)
						{
							cookie_found = true;
							break;
						}
					}
					temp_cookie = null;
					cookie_name = '';
				}
				return cookie_found;
			},
			
			/**
			 * IE 6 multiple button submit issue work around.
			 * when a form has multiple buttons of submit type, then IE 6 submits all of them
			 * whenever form is submitted. e.g. Remove on cart page would remove the wrong item
			 * (always first item in the cart) because IE 6 submits all form data which includes all 
			 * remove links!!!
			 * the workaorund is to disable all buttons except the one which is being clicked.
			 * it should only be called for IE 6 (check out htmlhead.isml for usage)
			 */
			ie6ButtonFix: function() {
				jQuery('button').click(function(){
		        	// disable all buttons
		        	jQuery(this.form).find('button').attr("disabled", true);
		        	// enable the one being clicked
		            jQuery(this).attr("disabled", false);
			    });
			}
		},

		// sub namespace app.dialog.* provides convenient functions to handle dialogs
		// note, that this code relies on single dialog modals (multi dialog, e.g. modal in modal is not supported)
		dialog : {
			// opens a dialog using the given url
			open : function(url, title, customClass , uidialogCustomClass,closecallback,closecallbackscope, options) {
			// create the dialog container if not present already
		
		/*  set for cross-domain iframe if url is external otherwise use a div*/
		var thishost=location.host;
		var thathost = url.replace(/^.+\/\/([^\/]+])\/.*$/ , "$1");
			if(thishost == thathost || !/\/\/:/i.test(thathost)){
				if(jQuery("#dialogcontainer").length == 0) {
					jQuery(document.body).append("<div id=\"dialogcontainer\"></div>");
				}
			}else{
				jQuery("#dialogcontainer").remove();
				jQuery(document.body).append('<iframe id="dialogcontainer" src="'+url+'"></iframe>');
			}

				// set a default title
				title = title || "Dialog";

				// finally load the dialog, set the dialog title
				app.ajax.load({
					selector: "#dialogcontainer",
					url: url,
					callback: function() {
						app.dialog.checkOpen();
						app.dialog.setTitle(title, customClass,uidialogCustomClass,closecallback,closecallbackscope);
					}
				});
			},

			// initializes the dialog with common dialog actions, like closing upon canceling
			// use this function in the dialog rendering template to re-bind common actions
			// upon dialog reload
			init : function() {
				jQuery(document).ready(function() {
					// binds the action to all buttons defining an action through the "name" attribute
					jQuery("#dialogcontainer button").each(function() {
						jQuery(this).click(function() {
							var action = jQuery(this).attr("name");
							if(action) {
								app.dialog.submit(action);
							}
							return false;
						});
					});

					// cancel button binding
					jQuery("#dialogCancelBtn").click(function() {
						//app.dialog.close();
						return false;
					});
				});
			},

			// sets the title of the dialog
			setTitle : function(title,customClass,uidialogCustomClass,closecallback,closecallbackscope) {
				var dialogContainer = jQuery("#dialogcontainer");
				dialogContainer = dialogContainer.eq(dialogContainer.length-1);
				var dialogactual = dialogContainer.parents('.ui-dialog').eq(0);
				
				dialogContainer.dialog("option", "title", title);
				if(customClass){
					dialogContainer.parent().parent().addClass(customClass);
				}
				if(uidialogCustomClass){
					dialogactual.addClass(uidialogCustomClass);
				}
				if(closecallback){
					var closebutton = $(dialogactual).find('.ui-dialog-titlebar-close').click(function(e){
						closecallback.apply(closecallbackscope||this , [e])
					});
				}
			},
			
			// checks, if the dialog is in the state "open" and sets the state if not presently set
			// this function is implicitly called by app.dialog.open(url, title) in order to initialize
			// the dialog properly; use this function to recover the "open" state of a dialog
			checkOpen : function() {
				if(!jQuery("#dialogcontainer").dialog("isOpen"))
				{
					/*if(jQuery("#dialogcontainer").find("pWait"))
					{
						jQuery("#dialogcontainer").dialog({
							bgiframe: true,
							autoOpen: false,
							modal: true,
							overlay: {
							opacity: 0.5,
							background: "black"
							},
							height: 600,							
							width: 513,
							resizable: false
						});
					}
					else {*/
						jQuery("#dialogcontainer").dialog({
							bgiframe: true,
							autoOpen: false,
							modal: true,
							overlay: {
				 				opacity: 0.5,
			    				background: "black"
							},
							height: "auto",
							width: 460,
							resizable: false
						});
					/*}*/
					jQuery("#dialogcontainer").dialog("open");
				}
				
			},

			// closes the dialog and triggers the "close" event for the dialog
			close : function() {
				var dialogContainer = jQuery("#dialogcontainer");
				dialogContainer = dialogContainer.eq(dialogContainer.length-1)
				dialogContainer.dialog("close");
				jQuery(document.body).trigger("dialogClosed");
			},

			// attaches the given callback function upon dialog "close" event
			onClose : function(callback) {
				if(callback != undefined) {
					jQuery(document.body).bind("dialogClosed", callback);
				}
			},

			// triggers the "apply" event for the dialog
			triggerApply : function() {
				jQuery(document.body).trigger("dialogApplied");
			},

			// attaches the given callback function upon dialog "apply" event
			onApply : function(callback) {
				if(callback != undefined) {
					jQuery(document.body).bind("dialogApplied", callback);
				}
			},

			// triggers the "delete" event for the dialog
			triggerDelete : function() {
				jQuery(document.body).trigger("dialogDeleted");
			},

			// attaches the given callback function upon dialog "delete" event
			onDelete : function(callback) {
				if(callback != undefined) {
					jQuery(document.body).bind("dialogDeleted", callback);
				}
			},

			// submits the dialog form with the given action
			submit : function(action) {
				// set the action
				jQuery("#dialogcontainer form").append("<input name=\"" + action + "\" type=\"hidden\" />");

				// serialize the form and get the post url
				var post = jQuery("#dialogcontainer form").serialize();
				var url = jQuery("#dialogcontainer form").attr("action");

				// post the data and replace current content with response content
		  		jQuery.ajax({
				   type: "POST",
				   url: url,
				   data: post,
				   dataType: "html",
				   success: function(data){
		  				jQuery("#dialogcontainer").empty().html(data);
				   },
				   failure: function(data) {
					   alert(app.resources["SERVER_ERROR"]);
				   }
				});
			}
		}
	}
})(jQuery);
/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
 (function($,document,undefined){var pluses=/\+/g;function raw(s){return s;}
function decoded(s){return decodeURIComponent(s.replace(pluses,' '));}
var config=$.cookie=function(key,value,options){if(value!==undefined){options=$.extend({},config.defaults,options);if(value===null){options.expires=-1;}
if(typeof options.expires==='number'){var days=options.expires,t=options.expires=new Date();t.setDate(t.getDate()+days);}
value=config.json?JSON.stringify(value):String(value);return(document.cookie=[encodeURIComponent(key),'=',config.raw?value:encodeURIComponent(value),options.expires?'; expires='+options.expires.toUTCString():'',options.path?'; path='+options.path:'',options.domain?'; domain='+options.domain:'',options.secure?'; secure':''].join(''));}
var decode=config.raw?raw:decoded;var cookies=document.cookie.split('; ');for(var i=0,l=cookies.length;i<l;i++){var parts=cookies[i].split('=');if(decode(parts.shift())===key){var cookie=decode(parts.join('='));return config.json?JSON.parse(cookie):cookie;}}
return null;};config.defaults={};$.removeCookie=function(key,options){if($.cookie(key)!==null){$.cookie(key,null,options);return true;}
return false;};})(jQuery,document);

 String.format = function( text ){
	    if ( arguments.length <= 1 ){
	        return text;
	    }
	    var tokenCount = arguments.length - 2;
	    for( var token = 0; token <= tokenCount; token++ ){
	        text = text.replace( new RegExp( "\\{" + token + "\\}", "gi" ), arguments[ token + 1 ] );
	    }
	    return text;
	}; 
//aliddl: Defect 3049 Fix 
jQ(function(){
	if(jQ('#catBannerSlotContainer>*').length==0){
		jQ('#catBannerBreadcrumb').css('visibility','visible');
	}else{
		jQ('#catBannerBreadcrumb').remove();
	}
});

jQuery(document).ready(function(){
	
	app.init();

	
	if (jQuery.browser.msie && jQuery.browser.version == "7.0") {
		var a = jQuery(".formfield.addressoptions > fieldset > legend").offset().left + 10;
		jQuery(".formfield.addressoptions > fieldset > .formfieldtooltip").css("left", a);
	}
	
	$(document).ajaxComplete(function() {
		Cufon.refresh();
	});


});

function makeGlobalNavMCFP(){
	// make global nav drop downs with superfish jquery plugin		
	jQuery('.categorymenu > ul').addClass('sf-menunew');	
	jQuery('.categorymenu > ul > li:last > a:first').addClass('lastChild');
	// commented out bgiframe - this may have been reducing performance / causing lag. Needs to be tested
	jQuery('ul.sf-menunew').superfish({autoArrows	: false, dropShadows : false, delay:0});//.find('ul').bgIframe();
				
	$("ul.homeSmallCarousel").each(function(){
		var countLIs = $(this).find("li").length;
		if(countLIs === 1){
		      return false;
		}else{
		  jQuery("#homeSmallCarousel").prepend("<button class='prev'>Prev</button><button class='next'>Next</button>")
		  jQuery('#homeSmallCarousel').jCarouselLite({
			  btnNext: ".next",
			btnPrev: ".prev",
			        visible: 1,
			        auto:    5000,
			        speed:   750
		  });
		}
	});

	/********************** :: DAVINDER KUMAR :: Auto Adjust Navigation ***********************/
	$("div.categorymenu:first").each(function(){
		var countLi = $('.categorymenu > li').length;
		while($('.categorymenu > li').length > 0){
			$('.categorymenu > li').appendTo('ul.sf-menunew');
		}
		var gnavhelper = $('.categorymenu > ul').length;	
		for(var i = 0; i < gnavhelper; i++){
			if(i != 0){
				$('.categorymenu').children('ul').eq(i).remove();
			}
		}

		var getLiLength = $(this).find("ul.sf-menunew:first > li").length;
		$(this).find("ul.sf-menunew").each(function(){
			var totalWidth = 0;
			$("ul.sf-menunew > li").each(function(){
				totalWidth += $(this).find("a:first").width();
			});
			var getRestWidth = 960 - totalWidth;
			if (jQuery.browser.msie && jQuery.browser.version == "8.0" || jQuery.browser.msie && jQuery.browser.version == "7.0" || jQuery.browser.safari == true ) {
				var divideRestWidth = Math.floor(getRestWidth / getLiLength);
				var getDiffFromPoints = Math.floor(divideRestWidth * getLiLength);
				var getDiffFromRestWidth = Math.floor(getRestWidth - getDiffFromPoints);
				var divideRestWidthByTwo = Math.floor(divideRestWidth / 2);
				var divideRestWidthByTwoC = Math.ceil(divideRestWidth / 2);
			}else{
				var divideRestWidth = getRestWidth / getLiLength;
				var divideRestWidthByTwo = divideRestWidth / 2;
			}
			var getDifference = Math.floor((divideRestWidth * getLiLength) - (divideRestWidthByTwo * (getLiLength * 2)) - (getLiLength - 1));
			$("ul.sf-menunew > li").each(function(){
				$(this).find("a:first").animate({
					'paddingLeft': divideRestWidthByTwo, 
					'paddingRight': divideRestWidthByTwo
				}, {
					complete : function(){
						$("ul.sf-menunew > li > a.lastChild").css("padding-left", getDifference + (divideRestWidthByTwo));
						$(this).parents("div.categorymenu").css({
							'height': 25,
							'paddingBottom':5,
							'overflow':'visible'
						});
						if($(this).hasClass('.lastChild')){
							$('.catMenuHeight').css("visibility", "visible");
						}
					}
				});
			});
		});
	});
	/********************** :: DAVINDER KUMAR :: Auto Adjust Navigation Ends ***********************/

	jQ(function() {
	 	jQ('ul.dropnavholder').each(function(){
	 		var cols = parseInt(jQ(this).attr('class').replace('dropnavholder', '').replace('cols', '')),
	 			items = jQ(this).children('li').not('.clear'),
	 			totLen = items.length;  
	 		cols = (cols == 0)? 1 : cols;
	 		if(totLen != 0){
				if(items.length > cols){
					for (iCtr = cols; iCtr < totLen; iCtr += 1){
						if(jQ(items[iCtr]).length > 0){
							jQ(items[iCtr - cols]).find('ul.subUL').append(jQ(items[iCtr]).find('ul.subUL li')); 
							jQ(items[iCtr]).remove();
						}
		 			}
				}
			}
	 	});	
	});
	
	if ($(".categorymenu3 li").size() == 1) {
		$(".categorymenu3 li:nth-child(1)").css("width", "960px");
	} else if ($(".categorymenu3 li").size() == 2) {
		$(".categorymenu3 li:nth-child(1)").css({
			"width" : "480px",
		});
		$(".categorymenu3 li:nth-child(2)").css("width", "480px");
	
	} else if ($(".categorymenu3 li").size() == 3) {
		$(".categorymenu3 li:nth-child(1)").css({
			"width" : "320px",
		});
		$(".categorymenu3 li:nth-child(2)").css({
			"width" : "320px",
		});
		$(".categorymenu3 li:nth-child(3)").css("width", "320px");
	}
	
}

