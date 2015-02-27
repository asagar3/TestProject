
(function (app, $) {
	var $cache = {};
	/**
	 * @private
	 * @function
	 * @description Fix for ie8 Infinite Scroll Bar issue and QuickView Fix (along with CSS changes)
	 */	
	function initInfiniteScroll_ie8()
	{
		$( window ).scroll(function() {
				
				// getting the hidden div, which is the placeholder for the next page
				var loadingPlaceHolder = jQuery('.infinite-scroll-placeholder[data-loading-state="unloaded"]')
				
				if ( loadingPlaceHolder.length == 1 && ( app.utility.elementInViewport(loadingPlaceHolder.get(0), 250)  
					|| app.utility.checkHashPageNo() ) )  {
					app.infinitescroll.init();
					// switch state to 'loading'
					// - switches state, so the above selector is only matching once
					// - shows loading indicator
					loadingPlaceHolder.attr('data-loading-state','loading');
					loadingPlaceHolder.addClass('infinite-scroll-loading');

					// get url hidden in DOM
					var gridUrl = loadingPlaceHolder.attr('data-grid-url');

					/**
					 * named wrapper function, which can either be called, if cache is hit, or ajax repsonse is received
					 */
					var fillEndlessScrollChunk = function (html) {
						loadingPlaceHolder.removeClass('infinite-scroll-loading');
						$('.pageBreak.last').removeClass('last');
						loadingPlaceHolder.attr('data-loading-state','loaded');
						jQuery('div.productresultarea').append(html);
					};
					if (('sessionStorage' in window) && sessionStorage["scroll-cache_" + gridUrl]) {
						// if we hit the cache
						fillEndlessScrollChunk(sessionStorage["scroll-cache_" + gridUrl]);
					} else {
						// else do query via ajax
						jQuery.ajax({
							type: "GET",
							dataType: 'html',
							url: gridUrl,
							success: function(response) {
								// put response into cache
								try {
									sessionStorage["scroll-cache_" + gridUrl] = response;
								} catch (e) {
									// nothing to catch in case of out of memory of session storage
									// it will fall back to load via ajax
								}
								// update UI
								fillEndlessScrollChunk(response);
							}
						});
					}
					

				}


		});		

	}
	
	
	/**
	 * @private
	 * @function
	 * @description
	 */
	function initInfiniteScroll() {

		jQuery(document).bind('scroll ready grid-update',function(e) {
			// getting the hidden div, which is the placeholder for the next page
			var loadingPlaceHolder = jQuery('.infinite-scroll-placeholder[data-loading-state="unloaded"]')	
		
			if ( loadingPlaceHolder.length == 1 && ( app.utility.elementInViewport(loadingPlaceHolder.get(0), 250)  
					|| app.utility.checkHashPageNo() ) )  {
				// switch state to 'loading'
				// - switches state, so the above selector is only matching once
				// - shows loading indicator
				
				loadingPlaceHolder.attr('data-loading-state','loading');
				loadingPlaceHolder.addClass('infinite-scroll-loading');

				// get url hidden in DOM
				var gridUrl = loadingPlaceHolder.attr('data-grid-url');
				//console.log("gridurl:"+gridUrl);
				/**
				 * named wrapper function, which can either be called, if cache is hit, or ajax repsonse is received
				 */
				var fillEndlessScrollChunk = function (html) {
					loadingPlaceHolder.removeClass('infinite-scroll-loading');
					$('.pageBreak.last').removeClass('last');
					loadingPlaceHolder.attr('data-loading-state','loaded');
					jQuery('div.productresultarea').append(html);
					jQuery(document).trigger('grid-update');
				};
				if (('sessionStorage' in window) && sessionStorage["scroll-cache_" + gridUrl]) {
					// if we hit the cache
					fillEndlessScrollChunk(sessionStorage["scroll-cache_" + gridUrl]);
				} else {
					// else do query via ajax
					jQuery.ajax({
						type: "GET",
						dataType: 'html',
						url: gridUrl,
						success: function(response) {
							// put response into cache
							try {
								sessionStorage["scroll-cache_" + gridUrl] = response;
							} catch (e) {
								// nothing to catch in case of out of memory of session storage
								// it will fall back to load via ajax
							}
							// update UI
							fillEndlessScrollChunk(response);
						}
					});
				}
				app.infinitescroll.init();
			}
		});
	}
	
	/**
	 * @private
	 * @function
	 * @description replaces breadcrumbs, lefthand nav and product listing with ajax and puts a loading indicator over the product listing
	 */
	function updateProductListing(isHashChange) {
		// [RAP-2653] requires special handling for 's encoding of ampersands
		var isFirefox = (navigator.userAgent).toLowerCase().indexOf('firefox') >= 0;
		var hash = isFirefox ? encodeURI(decodeURI(window.location.hash)) : window.location.hash;
		if(hash==='#results-content' || hash==='#results-products') { return; }

		var refineUrl = null;
		if (hash.length > 0) {
			refineUrl = window.location.pathname+"?"+hash.substr(1);
		}
		else if (isHashChange) {
			refineUrl = window.location.href;
		}

		if (!refineUrl) { return; }

		app.progress.show($cache.content);
		$cache.main.load(app.utility.appendParamToURL(refineUrl, "format", "ajax"), function () {
			//app.product.compare.init();
			//app.product.tile.init();
			app.progress.hide();
			//if (app.clientcache.LISTING_INFINITE_SCROLL){
				jQuery(document).trigger('grid-update');
			//}
		});
	}	
	/**
	 * @private
	 * @function
	 * @description Initializes events for the following elements:<br/>
	 * <p>refinement blocks</p>
	 * <p>updating grid: refinements, pagination, breadcrumb</p>
	 * <p>item click</p>
	 * <p>sorting changes</p>
	 */
	function initializeEvents() {

		// compare checked
		$cache.main.on("click", "input[type='checkbox'].compare-check", function (e) {
			var cb = $(this);
			var tile = cb.closest(".product-tile");

			var func = this.checked ? app.product.compare.addProduct : app.product.compare.removeProduct;
			var itemImg = tile.find("div.product-image a img").first();
			func({
				itemid : tile.data("itemid"),
				uuid : tile[0].id,
				img : itemImg,
				cb : cb
			});

		});
				

		// handle toggle refinement blocks
		$cache.main.on("click", ".refinement h3", function (e) {
			$(this)
		 	.toggleClass('expanded')
		 	.siblings('ul').toggle();
		});

		// handle events for updating grid
		$cache.main.on("click", ".refinements a, .pagination a, .breadcrumb-refinement-value a", function (e) {

			if($(this).parent().hasClass("unselectable")) { return; }
			var catparent = $(this).parents('.category-refinement');
			var folderparent = $(this).parents('.folder-refinement');

			//if the anchor tag is uunderneath a div with the class names & , prevent the double encoding of the url
			//else handle the encoding for the url
			if(catparent.length > 0 || folderparent.length > 0 ){

				return true;
			}else{
				e.preventDefault();
				var uri = app.utility.getUri(this);

				if( uri.query.length > 1 ) {
					// [RAP-2653] requires special handling for 's encoding of ampersands
					var isFirefox = (navigator.userAgent).toLowerCase().indexOf('firefox') >= 0;
					window.location.hash = 	isFirefox ? encodeURI(decodeURI(uri.query.substring(1))) : uri.query.substring(1);
				} else {
					window.location.href = this.href;
				}
				return false;
			}
		});

		/*
		// handle events item click. append params.
		$cache.main.on("click", ".product-tile a:not('#quickviewbutton')", function (e) {
			var a = $(this);
			// get current page refinement values
			var wl = window.location;

			var qsParams = (wl.search.length > 1) ? app.utility.getQueryStringParams(wl.search.substr(1)) : {};
			var hashParams = (wl.hash.length > 1) ? app.utility.getQueryStringParams(wl.hash.substr(1)) : {};

			// merge hash params with querystring params
			var params = $.extend(hashParams, qsParams);
			if (!params.start) {
				params.start = 0;
			}
			// get the index of the selected item and save as start parameter
			var tile = a.closest(".product-tile");
			var idx = tile.data("idx") ? +tile.data("idx") : 0;

			// convert params.start to integer and add index
			params.start=(+params.start)+(idx+1);
			// set the hash and allow normal action to continue
			a[0].hash = $.param(params);
		});

		// handle sorting change
		$cache.main.on('change', '.sortby select', function (e) {
			
			var refineUrl = $(this).find('option:selected').val();
			var uri = app.utility.getUri(refineUrl);
			window.location.hash = uri.query.substr(1);
			return false;
		})
		.on("change", ".itemsperpage select", function (e) {
			var refineUrl = $(this).find('option:selected').val();
			if (refineUrl == "INFINITE_SCROLL") {
				jQuery('html').addClass('infinite-scroll');
				jQuery('html').removeClass('disable-infinite-scroll');
			} else {
				jQuery('html').addClass('disable-infinite-scroll');
				jQuery('html').removeClass('infinite-scroll');
				var uri = app.utility.getUri(refineUrl);
				window.location.hash = uri.query.substr(1);
			}
			return false;
		});
        
        
		// handle hash change
		$(window).on('hashchange', function () {
			updateProductListing(true);
		});
		
		*/
	}
	
	/******* app.infinitescroll public object ********/
	app.infinitescroll = {
					
		init : function () {
			$cache = {
				main : $("#main"),
				items : $("#search-result-items")
			};
			$cache.content = $cache.main.find(".productlisting");
			/*
			if (app.product.compare) {
				app.product.compare.init();
			}
			updateProductListing(false);
			*/
			
			if (window.pageXOffset == null){//} && app.clientcache.LISTING_INFINITE_SCROLL) {
				initInfiniteScroll_ie8();
			}
			if ( window.pageXOffset != null){//} && app.clientcache.LISTING_INFINITE_SCROLL) {
				initInfiniteScroll(); 
				
			}
			//app.producttile.initAll();
			//app.product.tile.init();
			//initializeEvents();
			
		
		}
	};

}(window.app = window.app || {}, jQuery));


$(document).ready(function(){
	app.infinitescroll.init();
});

/**
 * @class app.utility
 */
(function (app, $) {

	var hashPageNo = "";
	var lastPageNo = "";
	
	function getHashPageNumber(){
		var hash = window.location.hash;
		if (hash && hash.indexOf("lpn=") > 0){	
		     var hashpart = hash.substring(hash.indexOf("lpn="));	            
		     hashPageNo = hashpart.substring(hashpart.indexOf("=")+1, hashpart.indexOf("&"));
		}
		
	}
	
	app.utility = {
		checkHashPageNo : function(){
			if(!hashPageNo){
				getHashPageNumber();
			}
			if (hashPageNo){	
			     
			     lastPageNo = $(".pageBreak.last").find('.pageNumber').html();

				if(parseInt(lastPageNo) < parseInt(hashPageNo)){
			    	return true;
			     }
				else{
			    	 // clear last page number from hash
			    	 hash = window.location.hash;
					 apIndex = hash.indexOf("lpn=");
					 if(apIndex != -1){
						 var apStr = hash.substring(apIndex);
						 var index = apStr.indexOf("&");
						 if(index > 0){
							var replaceStr = apStr.substring(0, index);
							window.location.hash = hash.replace(replaceStr+"&", "");
						 }		 
						 hashPageNo = "";
						 lastPageNo = "";
						 //setTimeout(scrollToProduct, 100);
						 scrollToProduct();
						 return true;
					 }
			     }
			 }
			
		},
				
		/**
		 * @function
		 * @description
		 * @param {String}
		 * @param {String}
		 */
		elementInViewport: function (el, offsetToTop) {
			var top = el.offsetTop,
				left = el.offsetLeft,
				width = el.offsetWidth,
				height = el.offsetHeight;

			while (el.offsetParent) {
				el = el.offsetParent;
				top += el.offsetTop;
				left += el.offsetLeft;
			}

			if (typeof(offsetToTop) != 'undefined') {
				top -= offsetToTop;
			}
		
			
			if ( window.pageXOffset != null) {

				return (
						top < (window.pageYOffset + window.innerHeight) &&
						left < (window.pageXOffset + window.innerWidth) &&
						(top + height) > window.pageYOffset &&
						(left + width) > window.pageXOffset
				);
				
			}

			if (document.compatMode == "CSS1Compat") {
				return (
					top < (window.document.documentElement.scrollTop + window.document.documentElement.clientHeight) &&
					left < (window.document.documentElement.scrollLeft + window.document.documentElement.clientWidth) &&
					(top + height) > window.document.documentElement.scrollTop &&
					(left + width) > window.document.documentElement.scrollLeft
			);
			
			}
		},
		
		/**
		 * @function
		 * @description Scrolls a browser window to a given x point
		 * @param {String} The x coordinate
		 */
		scrollBrowser : function (xLocation) {
			$('html, body').animate({ scrollTop: xLocation }, 500);
		}

	};
}(window.app = window.app || {}, jQuery));