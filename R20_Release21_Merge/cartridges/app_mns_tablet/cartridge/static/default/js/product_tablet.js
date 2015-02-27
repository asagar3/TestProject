(function(app){
	if (app) {
		// add Product namespace to app namespace
		app.Product = function(response) {
			// product private data

			// product json data
			var model 			= response.data;

			// div cotainer id
			var myContainerId	= "";

			// boolean flag to track the variants data request, reset in loadVariants() when the variants data is loaded
			var isLoadingVar	= false;

			// helper function to load variants data from the server
			// once the data is retrieved, it fires VariationsLoaded event so that UI can be refreshed appropriately
			var loadVariants	= function(thisProduct) {
				isLoadingVar = true;
				
				// get first swatch color for size pulldown initialization
				  var sizedd = document.getElementsByName("sizedropdown");
				  if(sizedd != null) {
					  var colorSwatches = $(".firstSwatch");
					    for(i=0;i<sizedd.length;i++) {
					    	//commented below 2 lines to fix issue of PSP where all subproducts having different color variation sets the same value of firstSwatchColorId.
					     	//var sizeDdId = sizedd[i].id;
							//var pid = sizeDdId.substring(0, sizeDdId.lastIndexOf("_"));
							if(colorSwatches != null) {
								for(j=0;j<colorSwatches.length;j++) {
								// changed below line to pick the product ID from thisProduct to resolve the PSP issue where all subproducts having different color variation sets the same value of firstSwatchColorId.
									if(colorSwatches[j].id.indexOf(thisProduct.pid)>=0) {
						     			var atag = $(colorSwatches[j]).find('a:first');
						     			thisProduct.firstSwatchColorId = atag.attr('lang');
						     			break;
									}
					     		}
							} else {
								thisProduct.firstSwatchColorId = null;
							}
				     	}
				  }
				
				// build the url and load variants data				
				app.ajax.getJson({
					url		: app.URLs.getVariants,
					data	: {"pid": thisProduct.pid, "format": "json", "colorId": thisProduct.firstSwatchColorId},
					callback: function(data){

						if (!data || !data.variations || !data.variations.variants) {
							return;
						}
						thisProduct.firstSwatchData = data.firstSwatchData;
						model.variations.variants = data.variations.variants;
						isLoadingVar = false; // we have loaded the variants
						jQuery(thisProduct).trigger("VariationsLoaded");
					}
				});
			}
			
			// helper function to reload availability data.
			// by default, availability data is based on a quantity of 1.
			// if a customer changes the quantity, use this method 
			// to reload the availability based on the new quantity.
			var reloadAvailability = function(thisProduct, quantity) {
				
				var id = (thisProduct.master ? thisProduct.selectedVar.id : thisProduct.pid);
				
				app.ajax.getJson({
					url		: app.URLs.getAvailability,
					data	: {"pid": id, "Quantity": quantity, "format": "json"},
					callback: function(data){

						if (!data || !data.avLevels) {
							return;
						}

						// update the data in the variant
						if (thisProduct.master) {
							thisProduct.selectedVar.avLevels = data.avLevels;
							thisProduct.selectedVar.avStatusQuantity = data.avStatusQuantity;
						} else {
							model.avLevels = data.avLevels;
							model.avStatusQuantity = data.avStatusQuantity;
						}
						jQuery(thisProduct).trigger("ReloadAvailability");
					}
				});

			}
			
			// returns the aggregate available to sell value 
			// from all variants
			var getATS = function(variants) { 
				
				var atsCount = 0;
				for (var i=0; i<variants.length; i++) {
					variant = variants[i];
					if (variant.ATS > 0) {
						atsCount = atsCount + variant.ATS;
					}
				}
				return atsCount;
			}


			// creates product recommendation carousel using jQuery jcarousel plugin
			// uses app.tooltip to create tooltips for each product in the carousel
			var loadRecommendations = function(containerId) {
				if (jQuery(containerId+" .maywerecommend ul.carousel li").length > 0) {
					jQuery(containerId+" .maywerecommend ul.carousel").jcarousel({
						scroll: 1,
						itemVisibleInCallback: app.captureCarouselRecommendations
					});
					// create tooltips event handler
					app.tooltip({id: containerId+" .maywerecommend ul.carousel li", options: {
							bodyHandler: function() {
								return jQuery(this).children(".pdpTooltip").html();
							}
					}});
				}				
			}

			// helper function to bind product options drop downs event handlers
			// Intializes the product.selectedOptions object with the currently selected options
			// it also shows the computed/updated price
			var getOptionsDiv	= function(thisProduct) {

				if (model.isOption) {

					var pdpOpt = jQuery(thisProduct.containerId+" .product_options:last select");

					pdpOpt.change(function(e){
						var vals = this.options[this.selectedIndex].value.split("%?%"); // 0 = value, 1 = price
						thisProduct.selectedOptions[this.id] = vals[0];
						thisProduct.selectedPrice[this.id] = vals[1];
						thisProduct.showUpdatedPrice(computePrice(thisProduct), model.pricing.standard);
					});
					
					// let us get the currently selected value and intilize the ui
					pdpOpt.each(function(i) {
						var vals = this.options[this.selectedIndex].value.split("%?%"); // 0 = value, 1 = price
						
						thisProduct.selectedOptions[this.id] = vals[0];
						thisProduct.selectedPrice[this.id] = vals[1];
						thisProduct.showUpdatedPrice(computePrice(thisProduct), model.pricing.standard);
					});
				}
			}
			
			//Generic method do display error message
			function displayErrorMessageForUnSelectedVariant(unselectedVariant){
				if (unselectedVariant.selectedVarAttribs["color"] == null || unselectedVariant.selectedVarAttribs["color"] == ""){
					toggleErrorMessage(unselectedVariant.pid, "color", true);
				} else{
					toggleErrorMessage(unselectedVariant.pid, "color", false);
				}
				if (unselectedVariant.selectedVarAttribs["size"] == null || unselectedVariant.selectedVarAttribs["size"] == ""){
					toggleErrorMessage(unselectedVariant.pid, "size", true);
					//jQuery('.pdp-size').addClass("red-border-size");
					jQuery('#'+unselectedVariant.pid+'_sizedropdown').parent().addClass("red-border-size");
				} else{
					toggleErrorMessage(unselectedVariant.pid, "size", false);
					
				}	
			}
			
			/**
			 * method to toggle the error message
			 * pid; productId ; used to create the id of error messagge/icon divs
			 * varid; possible values = "color" or "size"; color error message will not display the error icon
			 * display; TRUE if the error message needs to be displayed; FALSE, otherwise
			 */
			function toggleErrorMessage(pid, varid, display){
				var errormsgid = ""; 
				var erroriconid = "";
				if (varid == "size") {
					erroriconid = pid + "sizedropdownErrorIcon";					
					errormsgid = pid + "sizedropdownError";
				} else if (varid == "color") {
					errormsgid = pid + "colorswatchError";
				}				
				if (display){
					document.getElementById(errormsgid).style.display = "block";
					jQuery('#' + errormsgid).addClass('errorStuck');
					
					if (varid == "size"){
						document.getElementById(erroriconid).className = "errorIcon";
					}
				} else{
					document.getElementById(errormsgid).style.display = "none";
					if (varid == "size"){
						document.getElementById(erroriconid).className = "successIcon";
						 
					}
				}
			}
			var focusOnError = function(){
				var errElem = jQuery('.errorStuck:visible').get(0) 
				jQuery(errElem).attr('tabindex', '0').focus();
			}
			// binds A2C button click handler
			var getAddToCartBtn = function(thisProduct) {
			
				var addToCartBtn = jQ(thisProduct.containerId).on('click','.addtocartbutton',function(e) {
				 
					if(!model.productSet) {
						var errorclientID = "#"+thisProduct.pid.replace(" ","_")+"quantityErrorMessage";
						document.getElementById(thisProduct.pid + "quantityErrorIconID").className = "";
						jQuery(errorclientID).empty();
					}
					if (model.master || model.variant) {
						
						if (thisProduct.selectedVar == null) {							
							//CR018 : Start - Naveen Kumar						
							displayErrorMessageForUnSelectedVariant(thisProduct);
							//CR018 : End - Naveen Kumar	
							focusOnError();
							return false;
						}
						
						// it is necessary to update the option id to be variant-specific
						jQuery(thisProduct.containerId+" .product_options:last select").each(function(){
							 var value = thisProduct.selectedOptions[this.id];
							 var newId = this.id.replace(thisProduct.pid, thisProduct.selectedVar.id);
							 thisProduct.selectedOptions[newId] = value; 
							 delete thisProduct.selectedOptions[this.id];
							});
						
						thisProduct.selectedOptions.pid = thisProduct.selectedVar.id;
						thisProduct.selectedOptions.masterPid = thisProduct.pid;
					}
					else {
						// check if we are adding a bundle/productset to the cart
						if (model.bundle || model.productSet) {							
							var subProducts = thisProduct.subProducts;
							var comma 		= ",";
							var tempQty 	= "";
							var subproduct 	= null;
							var isEmpty = "false";
							
							thisProduct.selectedOptions.childPids = "";
														
							if (model.productSet) {
								thisProduct.selectedOptions.Quantity = "";
							}
							var showError = false;
							// process each individual products in the set/bundle
							// and prepare product.selectedOptions for final submission
							for (var i = 0; i < subProducts.length; i++) {
								//CR018 : Start - Naveen Kumar
								jQuery(".sizedropdownErrorProductSet").hide();
								//CR018 : End - Naveen Kumar
								subproduct = subProducts[i];								
								
								if (i == subProducts.length - 1) {
									comma = ""; // at the end of the list
								}
								
								// see if any of the sub products are variations, if so then get the selected variation id
								// from selectedVar property and make it a comma separated list
								if (subproduct.variant || subproduct.master) {
									if (subproduct.selectedVar == null) {
										//CR018 : Start - Naveen Kumar
										displayErrorMessageForUnSelectedVariant(subproduct);
										jQuery(".sizedropdownErrorProductSet").show();
										showError = true;
										continue;
										//CR018 : End - Naveen Kumar										
									}
									//CR018 : Naveen Kumar									
									if ((i == subProducts.length-1) && showError){
										focusOnError();
										return false;
									}
									thisProduct.selectedOptions.childPids += subproduct.selectedVar.id+comma;
								}
								else {
									//CR018 : Naveen Kumar									
									if ((i == subProducts.length-1) && showError){
										focusOnError();
										return false;
									}
									thisProduct.selectedOptions.childPids += subproduct.pid+comma;
								}
								
								var tempPid = subproduct.selectedOptions.pid;
								subproduct.selectedOptions.pid = null;
								// merge selected options of sub product with the main product
								thisProduct.selectedOptions = jQuery.extend({}, thisProduct.selectedOptions, subproduct.selectedOptions);
								subproduct.selectedOptions.pid = tempPid;
								
								// if it is a product set then sub products can have their separate qty
								if (model.productSet) {
									tempQty += subproduct.selectedOptions.Quantity+comma;
								}
							}
							//CR018 : Naveen Kumar						
							if (showError){
								focusOnError();
								return false;
							}
						}
						// if it is a product set then sub products can have their separate qty
						// tempQty is a comma separated list of qty for each product in the set
						if (model.productSet) {
							thisProduct.selectedOptions.Quantity = tempQty;
						}
						
						// make sure the pid which gets submitted is for the main product
						thisProduct.selectedOptions.pid = thisProduct.pid;
					}
					
					if (model.bundle) {
						thisProduct.selectedOptions.Quantity = 1; // hard coded qty=1 when we the product is a bundle
					}
					else if (!model.productSet) {
						// grab the user entered qty
						// Checking "thisProduct.selectedOptions" has masterPid or pid - Anoop - 16 Jan 13
						
						if(thisProduct.selectedOptions.masterPid)
						{
						thisProduct.selectedOptions.Quantity = parseInt(jQuery('input#'+thisProduct.selectedOptions.masterPid+"quantity_dropdown" ).val(),10);
						}
						else {
						thisProduct.selectedOptions.Quantity = parseInt(jQuery('input#'+thisProduct.selectedOptions.pid+"quantity_dropdown" ).val(),10);
						}
					}
					
					// if it is not a productset then make sure qty is specified greater than 0
					if (model.productSet || thisProduct.selectedOptions.Quantity > 0) {
						
						// disable a2c button
						addToCartBtn.attr("disabled", "true");
						
						// close the quick view when user clicks A2C.
						app.quickView.close();
						
						// find if there is a handler bound to AddToCart event e.g. cart -> edit details or wishlist -> edit details etc.
						// then fire it otherewise call app.minicart.add to add the selected product to the cart and show minicart
						var event = jQuery.Event("AddToCart");
						event.selectedOptions = thisProduct.selectedOptions;
												
						(jQuery.event.global["AddToCart"] == undefined || jQuery.event.global["AddToCart"] == null) ? app.minicart.add( jQ(this), "", thisProduct.selectedOptions, function(){addToCartBtn.removeAttr("disabled")} ) : jQuery(document).trigger(event);
					}
					return false;
				} );
				
				return addToCartBtn;
			}

			// bind qty box keyup handler
			// the handler grabs the value and updates 
			// product.selectedOption.Quantity
			// show the updated availabilty message in case the available qty is different than available etc.
			// trigger AddtoCartEnabled event
			var getQtyBox 		= function(thisProduct) {				
				
				jQuery(thisProduct.containerId+" .quantity_dropdown:last").change(function(e){
					var val = null;
					try {
						val = parseInt(jQuery(thisProduct.containerId+" .quantity_dropdown:last").val());
					} catch(e){val = null};

					if (val) {
						thisProduct.selectedOptions.Quantity = val;
						
						// if the product has variations check for non selected ones and display missing value
						if (model.variations != undefined) {
							var nonSelectedVars = [];

							// get the non-selected variations
							jQuery.each(model.variations.attributes, function(){
								if (!thisProduct.selectedVarAttribs[this.id] || thisProduct.selectedVarAttribs[this.id] == "" ) {
									nonSelectedVars.push(this.name);
								}
							});
							
							if (nonSelectedVars.length > 0) {
								
								// make sure there is something to sell
								var atsCount = getATS(model.variations.variants);
								if (atsCount == 0) {
									return;
								}
								
								var tooltipStr = getNonSelectedTooltip(nonSelectedVars);
								var missingMsg = jQuery.format(app.resources["MISSING_VAL"], tooltipStr);
								setAvailabilityMsg(missingMsg);
								return;
							}
						}
						
						// If the quantity value is different than
						// when we loaded the availability data, then
						// refresh availability data for this variant 
						if (val != thisProduct.getAvailabilityQty()) {
							// commented below line as we don't want to update the price based on updated quantity.
							//reloadAvailability(thisProduct, val);
						}
						
						setAvailabilityMsg(createAvMessage(thisProduct, val));
						jQuery(thisProduct).trigger("AddtoCartEnabled");
					}
				});
				
				// grab the currently displayed value basically the initial displayed value
				thisProduct.selectedOptions.Quantity = jQuery(thisProduct.containerId+" .quantity_dropdown:last").val();
				
				if (!isLoadingVar) {
					// show proper availability message
					setAvailabilityMsg(createAvMessage(thisProduct, thisProduct.selectedOptions.Quantity));
				}
			}

			// create product tabs i.e. description, Attributes, Reviews etc.
			// it depends on jQuery to create tab display.
			// also bind tab print button click handler
			var getTabs = function(containerId) {
				var tabsDiv = jQuery(containerId+" #pdpTabsDiv");
				tabsDiv.tabs();

				// tab print handler
				jQuery("a.printpage").click(function() {
					window.print();
					return false;
				});
			}
			//create tabs for product set page
			var getProductSetTabs = function(containerId, subProductCnt) {
				for (var i=1; i<=subProductCnt; i++){
				
					var tabsDiv = jQuery(containerId+" #pdpTabsDiv" + i);
					tabsDiv.tabs();
				}

				// tab print handler
				jQuery("a.printpage").click(function() {
					window.print();
					return false;
				});
			}

			// bind addtowishlist, giftregistry, send to friend click handlers
			// bind handlers to AddtoCartDisabled, AddtoCartEnabled events for disabling/enabling wishlist/gift registry links
			var getMiscLinks 	= function(thisProduct) {
			
				var disablelinks = function() {
					if ((model.master || model.variant) && thisProduct.selectedVar == null) {
						// disable wishlist/gift registry links for master products
						jQuery(thisProduct.containerId+" .addtowishlist, "+thisProduct.containerId+" .addtoregistry").addClass("unselectable");
					}
				}
				
				disablelinks(); // call it for initial display and then register it with AddtoCartDisabled event
				
				jQuery(thisProduct).bind("AddtoCartDisabled", {}, disablelinks);
				
				jQuery(thisProduct).bind("AddtoCartEnabled", {}, function(e, source){
					// enable wishlist/gift registry links for variant products
					jQuery(thisProduct.containerId+" .addtowishlist, "+thisProduct.containerId+" .addtoregistry").removeClass("unselectable");
				});

				// listen for availability reload events
				jQuery(thisProduct).bind("ReloadAvailability", {}, function(e) {
					// update the availability message	
					var variant = e.target.selectedVar;
					setAvailabilityMsg(createAvMessage(e.target, (variant == null ? model.avStatusQuantity : variant.avStatusQuantity)));
					jQuery(e.target).trigger("AddtoCartEnabled");
					
				});

				
				// Add to wishlist, Add to gift registry click handler
				jQuery(thisProduct.containerId+" .addtowishlist a, "+thisProduct.containerId+" .addtoregistry a").click(function(e) {
					// append the currently selectied options to the url
					
					// create a local copy of the selected options
					var selectedOptions = jQuery.extend({}, {}, thisProduct.selectedOptions);
					
					if (model.master || model.variant) {
						if (thisProduct.selectedVar != null) {
							selectedOptions.pid = thisProduct.selectedVar.id;
						}
						else {
							return false; // do not allow master product to be added to gift registry/wishlist
						}
					}
					else {
						selectedOptions.pid = thisProduct.pid;
					}
					
					var tempUrl = this.href;
					
					if (!(tempUrl.indexOf("?") > 0)) {
						tempUrl = tempUrl + "?";
					}
					// serialize the name/value into url query string and append it to the url, make request
					window.location = tempUrl + jQuery.param(selectedOptions);
					return false;
				} );			
				
				jQuery(thisProduct.containerId+" .sendtofriend").click(function(e) {					
					 // create a local copy of the selected options
                    var selectedOptions = jQuery.extend({}, {}, thisProduct.selectedOptions);
                    
                    if ((model.master || model.variant) && thisProduct.selectedVar != null) {
                                selectedOptions.pid = thisProduct.selectedVar.id;
                    }
                    else {
                          selectedOptions.pid = thisProduct.pid;
                    }
                    var tempURL = app.URLs.sendToFriend + "?" + jQuery.param(selectedOptions);
                    app.dialog.open(tempURL, app.resources.SEND_TO_FRIEND);
                    return false;
				} );
			}
			
			// binds product reviews click handlers
			// read review link opens reviews tab
			var getRatingSection = function(containerId) {

				jQuery(containerId+" #pdpReadReview").click(function(e) {
					jQuery(containerId+" #pdpTabsDiv").tabs("select", "pdpReviewsTab");
				} );

				jQuery(containerId+" #pdpWriteReview").click(function(e) {
				} );
			}

			// based on availability status, creates a message
			// param val - the stock value to compare i.e. qty entered by user
			var createAvMessage = function(thisProduct, val) {
					
				var avStatus 	= thisProduct.getAvStatus(); // availability status
				var avMessage 	= app.resources[avStatus];
				var ats 		= thisProduct.getATS(); // get available to sell qty
				var avLevels	= thisProduct.getAvLevels();
				
				// get ats levels per-status
				var inStockLevel = avLevels[app.constants.AVAIL_STATUS_IN_STOCK];
				var backOrderLevel = avLevels[app.constants.AVAIL_STATUS_BACKORDER];
				var preOrderLevel = avLevels[app.constants.AVAIL_STATUS_PREORDER];
				var notAvailLevel = avLevels[app.constants.AVAIL_STATUS_NOT_AVAILABLE];

				if (avStatus === app.constants.AVAIL_STATUS_BACKORDER ||
						avStatus === app.constants.AVAIL_STATUS_PREORDER) {
					if (val > ats && ats > 0)
					{
						avMessage = avMessage + "<br/>" + jQuery.format(app.resources["QTY_"+avStatus], ats);
					}
					// display backorder/preorder availability
					avMessage = avMessage + "<br/>" + getInStockDateMsg(thisProduct);
				}
				else if (val > inStockLevel && avStatus !== app.constants.AVAIL_STATUS_NOT_AVAILABLE) {
					
					avMessage = "";
					if (inStockLevel > 0) {
						avMessage = avMessage + "<br/>" + jQuery.format(app.resources["QTY_"+app.constants.AVAIL_STATUS_IN_STOCK], inStockLevel);
					}
					if (backOrderLevel > 0) {
						avMessage = avMessage + "<br/>" + jQuery.format(app.resources["QTY_"+app.constants.AVAIL_STATUS_BACKORDER], backOrderLevel);
						// uncomment the following line to display availability message with back order information
						// avMessage = avMessage + getInStockDateMsg(thisProduct);
					}
					if (preOrderLevel > 0) {
						avMessage = avMessage + "<br/>" + jQuery.format(app.resources["QTY_"+app.constants.AVAIL_STATUS_PREORDER], preOrderLevel);
						// uncomment the following line to display availability message with back order information
						// avMessage = avMessage + getInStockDateMsg(thisProduct);
					} 
				}
				
				return avMessage;
			}
			
			// helper function that returns the in-stock date
			var getInStockDateMsg = function(product) {
				var msg = "";
				if (product.getInStockDate() && product.getInStockDate() != "null") {
					msg = jQuery.format(app.resources["IN_STOCK_DATE"], (new Date(product.getInStockDate())).toDateString() );
				}
				return msg;
			}

			// helper function to set availability message
			var setAvailabilityMsg = function(msg) {
				jQuery(myContainerId+" .availability:last .value").html(msg);
			}

			/**
			 * Private. Computes price of a given product instance based on the selected options.
			 * 
			 * @param thisProduct - the product instance 
			 * @return price of the product to 2 decimal points.
			 */
			var computePrice = function(thisProduct) {

				var price = thisProduct.selectedVar != null ? thisProduct.selectedVar.pricing.sale : model.pricing.sale;
				// calculate price based on the selected options prices
				jQuery.each(thisProduct.selectedPrice, function(){
					price = (new Number(price) + new Number(this)).toFixed(2);
				});

				return price;
			}
				
			// bind click handlers for prev/next buttons on pdp from search
			var getNavLinks = function() {
				
				// NOTE:  WE COMMENT THIS OUT BECAUSE POWER REVIEWS RENDERING LIBRARY DOES NOT
				// WORK IN SOME BROWSERS WHEN A PRODUCT DETAIL PAGE IS PARTIALLY RELOADED USING AJAX.  
				// IF WE DO NOT BIND EVENTS, THEN THE PREV/NEXT ANCHORS JUST WORK AS STANDARD 
				// HYPERLINKS AND POWERREVIEWS WORKS FINE.	
				
				// bind events
				//jQuery(".productnavigation a").click(function(e) {
				//	app.getProduct({url: this.href, source: "search"});
				//	return false;
				//});
			}
			
			// size chart link click binding
			var getSizeChart = function() {
				jQuery(".attributecontentlink").click(function(e){
					// add size chart dialog container div if its not added yet
					// only added once
					e.preventDefault();
					if (jQuery("#sizeChartDialog").length == 0) {
						jQuery("<div/>").attr("id", "sizeChartDialog").appendTo(document.body);
					}
					
					app.createDialog({id: 'sizeChartDialog', options: {
				    //	height: 530,
				    	width: 732, 
				    	zIndex: 100005, /*QC 327 */
				    	title: app.resources["SIZECHART_TITLE"]
					}});
					
					jQuery('#sizeChartDialog').dialog('open');
					jQuery('#sizeChartDialog').parent().addClass("sizeChartShade");
							 
					 /* for all dialogue boxes - set to center in both orientations - Shahzad */
					 var popupW = jQuery('#sizeChartDialog').width();	 
					 jQuery('#sizeChartDialog').parent().css({ "marginLeft":-(popupW/2)+"px", "left":"50%"});
					 
					 
					 /* end */ 	 
				  
					
					//$('#sizeChartDialog .contentasset').jScrollPane({showArrows: true});
					//$('.sizetable').jScrollPane({showArrows: true});
					reinitialiseScrollPane = function()
					{
					//	$('#sizeChartDialog .contentasset').jScrollPane({showArrows: true});
					//	$('.sizetable').jScrollPane({showArrows: true});
					}
					// make the server call to load the size chart html
					jQuery("#sizeChartDialog").load(this.href,'', reinitialiseScrollPane);
										
					return false;
				});
			}	
			
			// build the tooltip string for non selected variations
			var getNonSelectedTooltip = function(nonSelectedVars) {
				var tooltipStr = '';
				var nsLen = nonSelectedVars.length;
				if (nsLen == 1 || nsLen == 2) {					
					tooltipStr = nonSelectedVars.join(" & ");
				}
				else {
					for (var i=0; i < nsLen; i++) {
						if (i == nsLen - 2) {
							tooltipStr += nonSelectedVars[i] + " & " + nonSelectedVars[i+1];
							break;
						}
						else {
							tooltipStr += nonSelectedVars[i] + ", ";
						} 
					}
				}		
		
				return tooltipStr;
			}
			
			// START | save the data in cache | Naveen Kumar
			var mainImageMapS7 =  new Object();
			var thumbImageMapS7 =  new Object();
			// END | save the data in cache | Naveen Kumar				

						
			// Product instance
			return {
				pid					: model.ID,
				variant				: model.variant,
				master				: model.master,
				bundled				: model.bundled,
				selectedVarAttribs	: {}, // object containing variation attributes values as name value e.g. {color: "blue", size: "3", width: ""}				
				selectedVar			: null, // currently selected variant
				selectedOptions		: {}, // holds currently selected options object {optionName, selected val}
				selectedPrice		: {}, // holds prices for selected options as {warranty: ""}
				containerId			: null, // holds the html container id of this product
				subProducts			: [], // array to keep sub products instances 
				
				/**
				 * Enable Add to Cart Button.
				 */
				enableA2CButton: function() {
					//Commented CR018 - Naveen Kumar
					//jQuery(this.containerId+" .addtocartbutton:last").removeAttr("disabled");
				},
				
				/**
				 * Disable Add to Cart Button.
				 */
				disableA2CButton: function() {
					//Commented CR018 - Naveen Kumar
					//jQuery(this.containerId+" .addtocartbutton:last").attr("disabled", "true");
				},
				
				// determine if this product is part of a bundle/product set VIEW
				isSubProduct		: function() {
					return (model.bundled || model.productSetProduct) && app.ProductCache.subProducts.length > 0;
				},

				// show the selected variation attribute value next to the attribute label e.g. Color: Beige
				showSelectedVarAttrVal: function(varId, val) {
					jQuery(this.containerId+" .variationattributes div:not(.clear)").each(function(){
						var id = jQuery(this).data("data");
						
						if (varId === id) {
							jQuery(this).find('span.selectedvarval').html(val);
						}
					});
				},
				
				// selects review tab
				readReviews: function() {
					jQuery(this.containerId+" #pdpTabsDiv").tabs("select", "pdpReviewsTab");
				},
				
				// shows product images and thumbnails
				// @param selectedVal - currently selected variation attr val
				// @param vals - total available variation attr values
				
				//@param currentS7asset - record the asset number so as to avoid pointless reloads of Scene7 player
				currentS7asset:null,
				
				showImages: function(selectedVal, vals , swatch_elem)  { 
					/*extend jquery to have json parsing */
					$.extend({
					    parseJSON: function( data ) {
					        if ( typeof data !== "string" || !data ) {
					            return null;
					        }    
					        data = jQuery.trim( data );    
					        if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
					            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
					            .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {    
					            return window.JSON && window.JSON.parse ?
					                window.JSON.parse( data ) :
					                (new Function("return " + data))();    
					        } else {
					            jQuery.error( "Invalid JSON: " + data );
					        }
					    }
					});
					var presetvariable = '';
					if (document.getElementById('presetvar').value != "undefined") {
						presetvariable = document.getElementById('presetvar').value;
					}
					/**
					 * This showImages method is an over-ride for using Scene7 viewer 
					 * replacing functionality with Scene7 viewer here.
					 * see also scene7flyout.isml which contains initialisations and parameters
					 * this could be re-factored if there is time.
					 * */
					var that = this;/*preserve instance for scope*/
					var swatchNumber = 1;/* default set so if no swatches exist:main image defaults to 12345-v1 */
					var allswatches;/*swatches gained from variations.isml colours */
					var newAsset;/*masterproduct id marker for targeting */
					var swatch_elem_actual;/*gets swatch actual element */
					var mainImageHeight;/*scope-wide storage to allow for variable heights */
					/**
					 * The following apply to values which sync with html/css setup
					 */
					var p = s7params["default"];/* s7params are in scene7flyout.isml */
					var s7_flyout = {w:null,h:null};/* these values are set later */
					var flyoutbordermit = p['flyoutBorder'].split(" ")[1].replace(/px/,'')*2;/* width mitigation for dynamically calculated flyout width */
					var s7_thumbsize = {w:72,h:110};
					var productImagesID_prefix = 'productimage--';
					var productVariationsID_prefix = 'variations--';
					var idDelimiter = "--";
					/* get the PID for the masterProduct
					 * replace the relevant ID's with the masterproductID */
					var thisPID,thisMasterPID;
					thisPID = that.pid;
					thisPID = thisPID.replace(/[^0-9a-z_]+/ig , '_');
					var allProductImages = $("*[id^="+productImagesID_prefix+"]");
					if(that.master){
						thisMasterPID = thisPID;
					}else{
						var thematch = new RegExp(thisPID , 'g');
						var thisID;
						allProductImages.each(function(idx,item){
							thisID = $(item).attr('id');
							if(thematch.test(thisID)){
								thisMasterPID = thisID.replace( new RegExp( productImagesID_prefix + "(.+)" + idDelimiter + ".+" , 'gi') , "$1" );
							}
						});
					}
					/* if thisMasterPID is undefined then no viewer is set for this product: abort: */
					if(!thisMasterPID){return false;}
					thisMasterPID = thisMasterPID.replace(/[^0-9a-z_]+/ig , '_');
					
					var flyzoom = $("#flyzoom"+ idDelimiter +thisMasterPID);
				 
					/*get the 'selected' swatch */

					if(swatch_elem && swatch_elem !== 'load'){/* find mouseover idx */
						allswatches = jQuery(swatch_elem).parents('.swatchesdisplay').find('.swatchli');
						allswatches.each(function(idx,item){
							if(item === swatch_elem){
								swatchNumber = ++idx;
								return;
							}
						});
						newAsset = thisMasterPID+'-v'+swatchNumber;
						//console.log('swatch_elem click',swatchNumber,swatch_elem);
					}else if(swatch_elem == 'load'){/*find '.selected' swatch on load*/
						allswatches = jQuery("#"+productVariationsID_prefix+thisMasterPID + idDelimiter + thisPID).find('.swatchesdisplay > li');
						allswatches.each(function(idx,item){
							if($(item).hasClass('selected')){
								swatchNumber = ++idx;
								return;
							}
						});
						newAsset = thisMasterPID+'-v'+swatchNumber;
						//console.log('swatch_elem LOAD selected=',swatchNumber,swatch_elem);
					}
					//if(!allswatches){return;}
					if(!swatch_elem && swatch_elem !== 'load'){/* find mouseover idx */
						//console.log('SCENE7: mouseout')
						allswatches = jQuery("#"+productVariationsID_prefix+thisMasterPID + idDelimiter + thisPID).find('.swatchesdisplay > li');
						allswatches.each(function(idx,item){
							if($(item).hasClass('selected')){
								swatchNumber = ++idx;
								
								return;
							}
						});
						newAsset = thisMasterPID+'-v'+swatchNumber;
					}
					
					swatch_elem_actual = allswatches ? allswatches[swatchNumber-1] : null;
				
					//console.log("Scene7: load swatchNumber = ",swatchNumber)
					//console.log("swatch_elem_actual = ", swatch_elem_actual)
					//console.log('------')
					
					/* set up imageset holders and product PID (pid can be main or sub product pid */
					var s7_imageset = [];
					var pid = that.pid.replace(/[^0-9a-z_]+/ig , '_');
					
					/**
					 * do initial load items (bindings etc...)
					 */

					/*respond to video button click */
					var video3Dclickhandler = function(e){
						var target = $(e.target).attr(href) ? $(e.target) : $(e.target).find('a,A').eq(0);
						var href = target.attr('href');
						
						
						/* BEGIN popup window code */
						var width  = 780;
						 var height = 660;
						 var left   = ($(window).width() - width)/2;
						 var top    = ($(window).height() - height)/2;
						 var params = 'width='+width+', height='+height;
						 params += ', top='+top+', left='+left;
						 params += ', directories=no';
						 params += ', location=no';
						 params += ', menubar=yes';
						 params += ', resizable=yes';
						 params += ', scrollbars=no';
						 params += ', status=no';
						 params += ', toolbar=no';
						 newwin=window.open(href,'mandsintlvideo3d', params);
						 if (window.focus) {newwin.focus()}
						 return false;
						 
						 /* END popup window code */
						 
						 
						/*open a modal window (this is saved for CR)*/
						if(!$("#scene7dialog").get(0)){
							$(document.body).append("<iframe id='scene7dialog' frameborder='0' marginwidth='0' marginheight='0'> </iframe>");
						}
						var options = {
								minWidth:700,
								minHeight:550,
								title:'Video',
								zIndex:90210,
								resizable:false,
								modal:true,
								dialogClass:'scene7videomodalactual',
								closeText:'close',
								close: function(ev, ui) { $(this).remove(); },
								stack:true
						}
						$('#scene7dialog').dialog(options)
						$('#scene7dialog').attr('src' , href);
						return false;
					}
					
					/*only bind video button once */
					if(swatch_elem && swatch_elem == 'load'){
						$('.'+p['videotriggerclass']).click(video3Dclickhandler);
					}
				
					
					
					/*main image size calculation */
					var getMainAssetSizeSuccess = function(response){
						/*parse response*/
						var jsonstr =response.replace(/s7jsonResponse\(/ ,'').replace(/,[^,]+$/ ,'').replace(/image\./g,'');
						var json;
						try{json = $.parseJSON(jsonstr)}catch(err){return false;};
						
						/* set s7_flyout.h */
						mainImageHeight = parseInt(json.height,10);
						
						/*call thumbsloaded to init viewer*/
						thumbsLoaded();
					}
					var getMainAssetSizeError = function(err){
						/*error getting image size information */
					}
					var getMainAssetSize = function(){
						/* get height of main image from scene7 */
						var viewerWidth = $('#'+productImagesID_prefix+thisMasterPID +  idDelimiter  + thisPID).innerWidth();
						var setaddress = s7_imageset[0].src+'?wid='+viewerWidth+'&req=props,json';
						//Security Fix Issue-INC000006337221
						setaddress = setaddress.substring(setaddress.lastIndexOf("/"),setaddress.length) +'?wid='+viewerWidth+'&req=props,json';
						if (typeof (mainImageMapS7[thisPID]) != "undefined"){
							//mainImageMapS7[thisPID] = response;
							getMainAssetSizeSuccess (mainImageMapS7[thisPID]);
						} else{		
						$.ajax({
							   type: "GET",
							   //url: S7ConfigClient.proxyaddress,
							   url:S7ConfigClient.mainimageaddress , 
							   data: 'jsonurl=' + setaddress,
							   dataType:"html",
							   success: function (response){
								mainImageMapS7[thisPID] = response;
								getMainAssetSizeSuccess(response);
								},
							   error: getMainAssetSizeError
							 });
						}
					}
					
					/* image set calculation */
					var imagesetSuccessHandler = function(response){
						var jsonstr =response.replace(/s7jsonResponse\(/ ,'').replace(/,[^,]+$/ ,'');						
						var json,imgsrc;
						try{json = $.parseJSON(jsonstr)}catch(err){return false;}; 
						var items = json.IMAGE_SET.split(',');
						$(items).each(function(idx,item){
							if(item.split(';')[1]==undefined){
								imgsrc = S7ConfigClient.isRoot + '/mandsintl/noimagelarge';
							}
							else {
								imgsrc = S7ConfigClient.isRoot + '/'+item.split(';')[1];
							}
							s7_imageset[idx] = new Image();
							s7_imageset[idx].src = imgsrc;
							
						});
						getMainAssetSize();
						//console.log('success')
						
					}
					var imagesetErrorHandler = function(err){
						//console.log('error')
					}
					var loadThumbs = function(s7imagesetID){
						//console.log('s7imagesetID',s7imagesetID)
						if(!s7imagesetID){return false;};
						//var setaddress = S7ConfigClient.isRoot  +company + '/' + s7imagesetID + '?req=imageset,json&id='+s7imagesetID;
						//Security Fix Issue-INC000006337221
						var setaddress = '/' + s7imagesetID + '?req=imageset,json&id='+s7imagesetID;
						/* go via a proxy */
						if (typeof (thumbImageMapS7[s7imagesetID]) != "undefined"){
							imagesetSuccessHandler(thumbImageMapS7[s7imagesetID]);
						} else{
						 $.ajax({
							   type: "GET",
							   url: S7ConfigClient.imagesetaddress,
							   data: 'jsonurl=' + setaddress,
							   dataType:"html",
							   success: function (response){
							 	thumbImageMapS7[s7imagesetID] = response;
								imagesetSuccessHandler(response);
							   },
							   error: imagesetErrorHandler
							 });
						}
					}

					/* imagesets have been found and main image height is found.
					 * no errors so execute Scene7 flyout +thumbs */
					
					var thumbsLoaded = function(){
						var p = s7params["default"];
						/* all s7_imageset identified and stored in images[] 
						 * Load/change scene7 viewer */
						/* find coresponding productimages area */
						var thumbarea = $('#'+productImagesID_prefix+thisMasterPID + idDelimiter + thisPID).find('.scene7flyoutcontrol_thumbs').eq(0);
						
						
						/** BEGIN: This area for s7_imageset is necessarily design specific */
						
						/* populate the thumbnails */
						thumbarea.empty();
						var list = $('<ul></ul>');
						var li_item,itemclass;
						var tlen = $(s7_imageset).length;
						$(s7_imageset).each(function(idx,item){
							itemclass = idx == tlen-1 ?  'class="last"' : idx == 0 ? 'class="first"' : '';
							activeclass = idx === 0 ? ' borderinsideactive' : '';
							li_item = $('<li '+itemclass+'><span class="borderinside '+activeclass+'"></span></li>');
							li_item.append('<img src='+item.src + '?'+presetvariable+'wid='+s7_thumbsize.w+'&hei='+s7_thumbsize.h +' />');
							list.append(li_item);
						});
						thumbarea.append(list);
						
						$(thumbarea).find('.borderinside').bind('mouseenter' , function(e){mouseenterhandler(e,thisMasterPID);});
						
						
						/** END: This area for s7_imageset is necessarily design specific */
						
						/* turn thumbarea into a carousel */
						
						thumbarea.find('ul').eq(0).jcarousel();
						
						var thiszoom = $("#flyzoom"+ idDelimiter +thisMasterPID);
						
						 
						/**make the imagecontainer style the correct height for the image. 
						 * actual height styles MUST be there for the viewer to work in IE.
						 */
						var imcont = flyzoom.parents(".scene7flyoutimagecontainer").eq(0);
						imcont.height(mainImageHeight);
						flyzoom.height(mainImageHeight-2); /*QC Defect 247 | to move 1px up to an image | Asha*/
						s7_flyout.h = (thiszoom.parents(".scene7flyoutviewer").eq(0).outerHeight() - flyoutbordermit);
						s7_flyout.h = s7_flyout.h >= p["flyoutminheight"] ? s7_flyout.h : p["flyoutminheight"];
						var imagecol =  thiszoom.eq(0);
						var infocol =  thiszoom.parents(".productdetail,productsetdetail").find(".productinfo").eq(0);
						
						s7_flyout.w = (((infocol.position().left + infocol.outerWidth()) - imagecol.position().left) - imagecol.outerWidth()) - flyoutbordermit - 4;
						var flyoutimage = s7_imageset[0].src+ '?'+presetvariable;
						/* set params for S7 viewer to use*/
						var platform = navigator.platform;
						var fs = p['flyout'].split(',');
						fs[0]=fs[0].replace(/\$jswidth\$/,s7_flyout.w);
						fs[1]=fs[1].replace(/\$jsheight\$/,s7_flyout.h);
						fs[3] = "" + parseInt(fs[3])-1;
						if($.browser.msie){
							if(parseInt($.browser.version)==7){
								fs[2] = "" + parseInt(fs[2])-2;
							}
							if(parseInt($.browser.version)==8){
								fs[0] = "" + parseInt(fs[0])-1;
								fs[2] = "" + parseInt(fs[2])-3;
								fs[3] = "" + parseInt(fs[3])-2;
							}
							if(parseInt($.browser.version)==9){
								/*placeholder*/
							}
						}
/*						if($.browser.mozilla){
							if(/^mac/i.test(platform)){
								fs[3] = "" + (parseInt(fs[3])+1);
							}
						}*/
						/*315 qc fix*/
						if($.browser.mozilla){
							fs[0] = "" + (parseInt(fs[0])-3); 
							fs[1] = "" + (parseInt(fs[1])-2);
							if(/^mac/i.test(platform)){
								fs[3] = "" + (parseInt(fs[3])+1);
								fs[1] = "" + (parseInt(fs[1])-1);
							}
						}
						fs=fs.join(",");
						var params="transition:"+p['transition']+";flyout:"+fs+";zoomFactor:"+p['zoomFactor']+";frameBorder:"+p['frameBorder']+";flyoutBorder:"+p['flyoutBorder']; 
						flyzoom.attr('params' , params);
						/* call the zoom function */
						clearInterval(window["flyoutwaiting"+ idDelimiter +thisMasterPID]);
						window["flyoutwaiting"+ idDelimiter +thisMasterPID]=setInterval(function(){
							if(!sjFlyout){return false;}/* script not loaded yet. */
							if(sjFlyout){
								clearInterval(window["flyoutwaiting"+ idDelimiter +thisMasterPID]);
								sjFlyout("flyzoom"+ idDelimiter +thisMasterPID , flyoutimage);
								setTimeout(setcustomcursor ,250);
								//negate scene7 event cleaning.
								if(window.cleaning){window.cleaning=function(){};}
							}
						},25);
					}
					function setcustomcursor(idd,tmd){
						$("[id^=contflyzoom]").addClass('customcursorZoom');
						$("[id^=lupaflyzoom]").addClass('customcursorZoom');
						$("[id^=lupaImgflyzoom]").addClass('customcursorZoom');
						}
				
					function mouseenterhandler(e,thisMasterPID){
						/* to have a custom cursor icon we do this */
						var flyoutimage =$(e.target).parents('li').eq(0).find('img').eq(0).attr("src").replace(/\?.+/ , "");
						if(!sjFlyout){return false;}/* script not loaded yet. */
						sjFlyout("flyzoom"+ idDelimiter +thisMasterPID , flyoutimage);
						$(e.target).parents('ul').find('.borderinside').removeClass('borderinsideactive');
						$(e.target).addClass('borderinsideactive');
						setTimeout(setcustomcursor ,250);
					}
					
					/* if it is a new S7 imageset then render it */
					if((newAsset && newAsset != that.currentS7asset) || (!swatch_elem_actual && that.currentS7asset === null)){
						that.currentS7asset = newAsset;
						var imagesetID;
							if(!swatch_elem_actual){
								imagesetID = s7InitialValues[thisMasterPID];
							}else{
								imagesetID = $(swatch_elem_actual).find('a').eq(0).attr('id') || $(swatch_elem_actual).attr('id');
							}
						loadThumbs(imagesetID);
					}
					/*************
					 * END SCENE7 Over-ride
					 */
				},
					
					
					
					
					
					
				/*************
				 * BEGIN original showImages method
				 * this can be deleted but is left here for reference.
				 * 
				showImages: function(selectedVal, vals , swatch_elem)  {
					var that = this;
					vals = vals || {};
					
					// show swatch related images for the current variation value					
					jQuery.each(vals, function(){
						var imgCounter = -1;
						var thisVal = this;
						if (this.val === selectedVal && this.images) {
							if (this.images.catlanding.length > 0) {
								jQuery(that.containerId+" .productthumbnails:last").html("");
								jQuery(that.containerId+" .productimage").html("").append(jQuery("<img/>").attr("src", thisVal.images.hero[0].url+'?wid='+thisVal.images.hero[0].width+'&hei='+thisVal.images.hero[0].height).attr("alt", thisVal.images.hero[0].alt).attr("title", thisVal.images.hero[0].title));
							}
							// make sure to show number of images based on the smallest of large or small as these have to have 1-1 correspondence.
							var noOfImages = this.images.hero.length >= this.images.catlanding.length ? this.images.catlanding.length : this.images.hero.length;
							
							// show thumbnails only if more than 1 or if this is a subproduct (bundled/subproduct)
							if (this.images.catlanding.length > 1 || that.isSubProduct()) {
								jQuery.each(this.images.catlanding, function(){
									imgCounter++;
									var imageInd = imgCounter;
									if (imgCounter > noOfImages - 1) {
										return;
									}
									jQuery(that.containerId+" .productthumbnails:last").append(jQuery("<img/>").attr("src", this.url).attr("alt", this.alt).attr("title", this.title).click(function(e){
										jQuery(that.containerId+" .productimage").html("").append(jQuery("<img/>").attr("src", thisVal.images.hero[imageInd].url+'?wid='+thisVal.images.hero[imageInd].width+'&hei='+thisVal.images.hero[imageInd].height).attr("alt", thisVal.images.hero[imageInd].alt).attr("title", thisVal.images.hero[imageInd].title));
									}));
								});
							}
						}
					});
				},
				*/
				/**
				* Event handler when a variation attribute is selected/deselected.
				*/
				varAttrSelected: function(e) {
					// update the selected value node
					if (e.data.id == "color"){
						this.selectedVarAttribs["size"] = null;
					}
					this.showSelectedVarAttrVal(e.data.id, e.data.val || "");

					this.selectedVarAttribs[e.data.id] = e.data.val;
					
					// if this is a deselection and user landed on a variant page then reset its variant flag 
					// as now user has deselected an attribute thus making it essentially a master product view
					if (e.data.val == null) { 
						this.variant = false;
					}
					
					// store this ref
					var that = this;

					// trigger update event which will update every other variation attribute i.e. enable/disable etc.

					// first reset the contents of each attribute display
					// when we have got the varriations data
					if (!isLoadingVar) {
						// find variants which match the current selection
						var selectedVarAttrVariants = e.data.val != null ? this.findVariations({id: e.data.id, val: e.data.val}): null;
						var selectedVarAttrs = jQuery.extend({}, {}, this.selectedVarAttribs);
						var validVariants = null;
						var unselectedVarAttrs = new Array();
						
						// for each selected variation attribute find valid variants
						for (var selectedVar in selectedVarAttrs) {
							if (selectedVarAttrs[selectedVar]) {
								validVariants = this.findVariations({id: selectedVar, val: selectedVarAttrs[selectedVar]}, validVariants);
							}
							else {
								unselectedVarAttrs.push(selectedVar);
							}
						}
						// update each variation attribute display
						jQuery.each(model.variations.attributes, function () {
							if ((this.id != e.data.id || e.data.val == null) && selectedVarAttrs[this.id] == null) {
								that.varAttrDisplayHandler(this.id, validVariants);								
							}
							else if (this.id != e.data.id && selectedVarAttrs[this.id] != null) {
								that.varAttrDisplayHandler(this.id, selectedVarAttrVariants);
							}
							else {
								// show swatch related images for the current value
								that.showImages(e.data.val, this.vals);
							}
						});

						// based on the currently selected variation attribute values, try to find a matching variant
						this.selectedVar = this.findVariation(this.selectedVarAttribs);
					}

					// lets fire refresh view event to enable/disable variations attrs
					this.refreshView();
				},

				/**
				* go thru all variations attr and disable which are not available
				*/
				resetVariations: function() {
					if (isLoadingVar) {
						return ; // we don't have the complete data yet
					}
					var that = this;

					jQuery(this.containerId + " .variationattributes .swatches").each(function(){
						var dataa = jQuery(this).data("data"); // data is id set via app.hiddenData api
						jQuery(this).find("a.swatchanchor").each(function(){
							// find A variation with this val
							if (that.isVariation({id:dataa, val:this.innerHTML})) {
								// found at least 1 so keep it enabled
								jQuery(this).parent().removeClass("unselectable");
							}
							else {
//								jQuery(this).parent().addClass("unselectable");
								jQuery(this).parent().removeClass("selected");
							}
						});
					});
				},
				
				/**
				* given a variation attribute id and valid variants, it would adjust the ui i.e. enable/disable 
				* appropriate attribute values.
				* 
				* @param attrId - String, id of the variation attribute
				* @param validVariants - Array of json objects of valid variants for the given attribute id
				* */
				varAttrDisplayHandler: function (attrId, validVariants) {
					var that = this; // preserve this instance
					// loop thru all non-dropdown ui elements i.e. swatches e.g. color, width, length etc.
					jQuery(this.containerId + " .variationattributes .swatches").each(function(){
						var swatchId = jQuery(this).data("data");  // data is id set via app.hiddenData api
						if (swatchId === attrId) {
							
							jQuery(this).find("a.swatchanchor").each(function(){
							
								var parentLi= jQuery(this).parent();
								
								// find A variation with this val
								var filteredVariants = that.findVariations({id:attrId, val:this.innerHTML}, validVariants);
								if (filteredVariants.length > 0) {
									// found at least 1 so keep it enabled
									parentLi.removeClass("unselectable");
								}
								else {
									// no variant found with this value combination so disable it
									//parentLi.addClass("unselectable");
									
									if (parentLi.hasClass("selected")) {
										// remove the currently selected value if the value is not selectable
										//that.showSelectedVarAttrVal(attrId, "");
										//that.selectedVarAttribs[attrId] = null;
									}
									// remove current selection
									 //parentLi.removeClass("selected");
								}
							});
						}
					});
					
					// loop thru all the non-swatches(drop down) attributes
					jQuery(this.containerId + " .variationattributes .variantdropdown select").each(function(){
						var vaId = jQuery(this).data("data").id;  // data is id set via app.hiddenData api
						var selectedIndex = $(".sizeDropSelect").attr("selectedIndex");
						
						if (selectedIndex > 0 && vaId === attrId) {
							var len = this.options.length;
							
							jQuery.each(this.options, function(){
								
								if (len > 1 && this.index == 0) {
									return; // very first option when the length is greater than 1 is 'Select ...' message so skip it
								}
								
								// find A variation with this val
								var filteredVariants = that.findVariations({id:attrId, val:this.value}, validVariants);
								
								if (filteredVariants.length > 0) {
									// found at least 1 so keep it enabled
									this.disabled = false;
								}
								else {
									// no variant found with this value combination so disable it
									this.disabled = true;
									
									if (this.selected) {
										// remove the currently selected value if the value is not selectable
										that.showSelectedVarAttrVal(attrId, "");
										that.selectedVarAttribs[attrId] = null;
									}
									// remove current selection
									this.selected = false;
								}
							});
						}
					});
					
				},

				/**
				 * refresh the UI i.e. availability, price, A2C button and variation attributes display
				 */
				refreshView: function() {
					var thisProduct = this;

					if (!isLoadingVar && this.selectedVar == null) {
						// if we have loaded the variations data then lets if the user has already selected some values
						// find a matching variation
						this.selectedVar = this.findVariation(this.selectedVarAttribs);
					}

					if (!isLoadingVar && this.selectedVar != null) {
						// update availability
						setAvailabilityMsg(createAvMessage(thisProduct, 1));
						// update price
						this.showUpdatedPrice(computePrice(thisProduct), this.selectedVar.pricing.standard);						

						if (!(!this.selectedVar.inStock && this.selectedVar.avStatus === app.constants.AVAIL_STATUS_NOT_AVAILABLE) && (this.getPrice() > 0 || this.isPromoPrice())) {
							// enable add to cart button
							this.enableA2CButton();
							jQuery(this).trigger("AddtoCartEnabled");
						}
						else {
							this.disableA2CButton();
							jQuery(this).trigger("AddtoCartDisabled");
						}
					}
					else {
						if (isLoadingVar) {
						// update availability
							setAvailabilityMsg(app.showProgress("productloader"));
						}
						else {
							setAvailabilityMsg(app.resources["NON_SELECTED"]);
						}
						// disable add to cart button
						this.disableA2CButton();
						jQuery(this).trigger("AddtoCartDisabled");
					}
					
					var nonSelectedVars = [];
					
					var validVariants = null;
					for (var selectedVar in this.selectedVarAttribs) {
						if (this.selectedVarAttribs[selectedVar]) {
							validVariants = this.findVariations({id: selectedVar, val: this.selectedVarAttribs[selectedVar]}, validVariants);
						}						
					}
						
					// update selected var attr vals and refresh their display
					jQuery.each(model.variations.attributes, function(){
						thisProduct.showSelectedVarAttrVal(this.id, thisProduct.selectedVarAttribs[this.id]);
						
						if (!thisProduct.selectedVarAttribs[this.id] || thisProduct.selectedVarAttribs[this.id] == "" ) {
							nonSelectedVars.push(this.name);
							thisProduct.varAttrDisplayHandler(this.id, validVariants);
						}
					});
					
					// process non-selected vals and show updated tooltip for A2C button as a reminder
					// and show it along availability 
					var tooltipStr = getNonSelectedTooltip(nonSelectedVars);					
					
					if (nonSelectedVars.length > 0) {
						var availMsg = jQuery.format(app.resources["MISSING_VAL"], tooltipStr);
						setAvailabilityMsg(availMsg);
						// Commented the code as a fix for defect : 803633
						//jQuery(thisProduct.containerId+" .addtocartbutton:last").attr("title", availMsg);
					}					
				},

				/**
				 * renders pricing div given a sale price and optional standard price
				 * To format the price display, it goes to server via an ajax call.
				 * 
				 * @param sale - sale price 
				 * @param standard - standard price
				 */
				showUpdatedPrice: function(sale, standard) {
					var standardPrice 	= Number(standard || 0);					
					var salePrice 		= Number(sale || 0);
					var priceHtml 		= "";
					var formattedPrices = {"salePrice": salePrice, "standardPrice": standardPrice};
					//aliddl: fixed the syncronous ajax issue that was delaying the dropdown display on iPad
					var that = this;
					// send server request to format the money baed on site settings using Money api
					app.ajax.getJson({
						url		: app.URLs.formatMoney,
						cache	: true,
						async	: true,
						data	: {"salePrice": salePrice, "standardPrice": standardPrice},
						callback: function(data){
							formattedPrices = data;
							// in case it is a promotional price then we do not care if it is 0
							if(sale!=standard){
								priceHtml = (salePrice > 0 || this.isPromoPrice()) ? '<div class="newPrice">' + formattedPrices.salePrice.toString() + '</div><div class="cl"></div>' : ' <div class="salesprice">N/A</div>';
							}
							else{
								priceHtml = (salePrice > 0 || this.isPromoPrice()) ? '<div class="salesprice">' + formattedPrices.salePrice.toString() + '</div>' : ' <div class="salesprice">N/A</div>';
							}
							if (standardPrice > 0 && standardPrice > salePrice) {
								// show both prices
								priceHtml =  '<div class="oldPrice">' + formattedPrices.standardPrice.toString() + ' </div>' + priceHtml + '<div class="cl"></div>';						
							}	
							// added this if condition to avoid displaying product set price from here. Product set price is getting displayed from product.isml as part of CR 625.
							if (!model.productSet) {
								jQuery(that.containerId+" .productinfo .price:first").html(priceHtml);
								// containerId contains #, get rid of it before finding the right price div
								jQuery(that.containerId+" #pdpATCDiv" + that.containerId.substring(1) + " .price").html(priceHtml);
							}
						}
					});
					
					
				},
				
				/**
				 * returns a computed price for this product
				 */				
				getPrice: function() {
					return computePrice(this);
				},
				
				/**
				 * Determines if the selected product has promotional price.
				 * 			 * 
				 * @return boolean true if promotional price is present otherwise false
				 */
				isPromoPrice: function() {
					return (this.selectedVar != null ? this.selectedVar.pricing.isPromoPrice : model.pricing.isPromoPrice);
				},
				
				/**
				 * receives 2 or 1 variation attribute values and tries to figure out if there is a variant with these values.
				 * 
				 * @param val1 - variation attribute value
				 * @param val2 - variation attribute value
				 * @return boolean - true if a variant exists otherwise false
				 */
				isVariation: function(val1, val2) {
					var variant = null;

					for (var i=0; i<model.variations.variants.length; i++) {
						variant = model.variations.variants[i];
						if (variant.attributes[val1.id] == val1.val && (val2 == undefined || variant.attributes[val2.id] == val2.val)) {
							return true;
						}
					}
					/*
					 * apparently there is no way to break out of jQuery.each half way :(
					jQuery.each(model.variations.variants, function(){
						if (!found && this.attributes[val1.id] == val1.val && this.attributes[val2.id] == val2.val) {
							found = true;
							return;
						}
					});*/
					return false;
				},
				
				/*
				* find 0 or more variants matching the given attribs object(s) and in stock
				* return null or found variants
				*/
				findVariations: function(attr, variants) {
					var foundVariants = new Array();
					variants = variants || model.variations.variants;
					var variant = null;
					if (variants!=null){
						for (var i=0; i<variants.length; i++) {
							variant = variants[i];
							if ((variant.attributes[attr.id] === attr.val) && 
								(variant.inStock || (variant.avStatus === app.constants.AVAIL_STATUS_BACKORDER && variant.ATS > 0) || (variant.avStatus === app.constants.AVAIL_STATUS_PREORDER && variant.ATS > 0))) {
								foundVariants.push(variant);
							}
						}
					}
					return foundVariants;
				},
				
				/*
				* find a variant with the given attribs object
				* return null or found variation json
				*/
				findVariation: function(attrs) {
					if (!this.checkAttrs(attrs)) {
						return null;
					}

					var attrToStr = function(attrObj) {
						var result = "";
						jQuery.each(model.variations.attributes, function(){
							result += attrObj[this.id];
						});
						return result;
					}

					var attrsStr = attrToStr(attrs);

					for (var i=0; i<model.variations.variants.length; i++) {
						variant = model.variations.variants[i];
						if (attrToStr(variant.attributes) === attrsStr) {
							return variant;
						}
					}
					return null;
				},
				
				// find a variation with the give id otherwise empty object
				findVariationById: function(id) {

					for (var i=0; i<model.variations.variants.length; i++) {
					// IE7 does NOT support this!!!
					//for each(var variation in model.variations.variants) {
						var variation = model.variations.variants[i];
						if (variation && variation.id === id) {
							return variation;
						}
					}

					return {};
				},

				/*
				* see if the specified attrs object has all the variation attributes present in it
				* return true/false
				*/
				checkAttrs: function(attrs) {
					for (var i=0; i<model.variations.attributes.length; i++) {
						if (attrs[model.variations.attributes[i].id] == null) {
							return false;
						}
					}
					return true;
				},
				
				// given an id, return attr definition from model.variations.attributes
				getAttrByID: function(id) {
					for (var i=0; i<model.variations.attributes.length; i++) {
						if (model.variations.attributes[i].id === id) {
							return model.variations.attributes[i];
						}
					}
					return {};
				},
				
				// returns current availability status e.g. in_stock, preorder etc.
				getAvStatus: function() {
					if ((this.variant || this.master) && this.selectedVar != null) {
						return this.selectedVar.avStatus;
					}
					else {
						return model.avStatus;
					}
				},
				
				// return available to sell qty
				getATS: function() {
					if ((this.variant || this.master) && this.selectedVar != null) {
						return this.selectedVar.ATS;
					}
					else {
						return model.ATS;
					}
				},
				
				// return the quantity that was used to calculate availability
				getAvailabilityQty: function() {
					if ((this.variant || this.master) && this.selectedVar != null) {
						return this.selectedVar.avStatusQuantity;
					}
					else {
						return model.avStatusQuantity;
					}
				},
				
				// return the availability levels
				getAvLevels: function() {
					if ((this.variant || this.master) && this.selectedVar != null) {
						return this.selectedVar.avLevels;
					}
					else {
						return model.avLevels;
					}					
				},
				
				// returns in stock date 
				getInStockDate: function() {
					if ((this.variant || this.master) && this.selectedVar != null) {
						return this.selectedVar.inStockDate;
					}
					else {
						return model.inStockDate;
					}
				},
				
				// determine if A2C button is enabled or disabled
				// true if enabled, false otherwise
				isA2CEnabled: function() {
					if (this.variant || this.master) {
						if (this.selectedVar != null) {
							return (this.selectedVar.avStatus === app.constants.AVAIL_STATUS_IN_STOCK ||
									this.selectedVar.avStatus === app.constants.AVAIL_STATUS_BACKORDER ||
									this.selectedVar.avStatus === app.constants.AVAIL_STATUS_PREORDER);
						}
						else {
							return false;
						}
					}
					else {

						return (model.avStatus === app.constants.AVAIL_STATUS_IN_STOCK ||
								model.avStatus === app.constants.AVAIL_STATUS_BACKORDER ||
								model.avStatus === app.constants.AVAIL_STATUS_PREORDER);
					}
				},

				/**
				 * work horse of the product detail page getting everything tied together i.e. all the dynamic stuff
				 * and one time initialization. called only ONCE
				 * bind all the product display events and handlers
				 * load variants in case this is a variation product
				 * bind subproducts a2c button enable event handler
				 * 
				 * @param options.cotainerId - id of the containing div
				 * @param options.source - source of this product show request, mainly quickview
				 */
				show: function(options) {
					// preserve this instance
					var thisProduct = this;

					// bind VariationsLoaded which gets fired when the variation data is received from the server
					// and we need to refresh the ui
					jQuery(this).bind("VariationsLoaded", {}, function(e, source){												
						// enable/disable unavailable values
						// and set the currently selected values 
						// reset the currently selected variation attributes i.e. reset the ui
						thisProduct.resetVariations();
						
						// create the default availability message based on ATS count
						// from the variants
						var atsCount = getATS(model.variations.variants);
						if (atsCount == 0) {
							setAvailabilityMsg(app.resources[app.constants.AVAIL_STATUS_NOT_AVAILABLE]);
						}
						
						// Grab the currently selected values and update the UI
						// first swatch variation attributes
						jQuery(thisProduct.containerId + " .variationattributes .swatches").each(function(){
							var thisSwatch 	= jQuery(this),
								pdpVarId 	= thisSwatch.data("data"); // data is id which is set via app.hiddenData onload
							
							// grab the currently selected variation attribute val																
							thisSwatch.find(".selected a").each(function(){
								thisProduct.varAttrSelected({data: {id: pdpVarId, val: this.innerHTML}});
							});
						});
						// non-swatch variation attributes
						jQuery(thisProduct.containerId + " .variationattributes .variantdropdown select").each(function(){							
															
							if (this.selectedIndex >= 0 && this.options[this.selectedIndex].value != "") {
								// grab the currently selected val by firing update ui api
								// when dealing with a select element, data returns an object so we must ask for id
								thisProduct.varAttrSelected({data: {id: jQuery(this).data("data").id, val: this.options[this.selectedIndex].value}});
							}
						});
						
						//update first swatch pulldown
						if (thisProduct.firstSwatchColorId != null) {
							variantPriceAndAvailability(thisProduct.pid,thisProduct.firstSwatchColorId,"true",thisProduct.firstSwatchData);
						}
					});

					this.containerId 	= "#"+options.containerId;					
					var isQuickView 	= false;

					if (options.source && options.source == "quickview") {
						isQuickView = true;
					}
					
					myContainerId = this.containerId;
					
					// bind click handlers for prev/next links
					getNavLinks();
					
					// size chart click binding
					getSizeChart();

					// variation attributes handling in case it is a master or a variant product
					if (model.master || model.variant) {
						loadVariants(this); // make a server call to load the variants, this is due to the performance reasons
						// meanwhile display the available variation attributes
						
						// loop thru all the swatches and bind events etc.
						jQuery(thisProduct.containerId).each(function(){
							$(this).find(".variationattributes .swatches").each(function(){
								var thisSwatch 	= jQuery(this);
								var pdpVarId 	= thisSwatch.data("data"); // data is id which is set via app.hiddenData onload
								var attrDef 	= thisProduct.getAttrByID(pdpVarId);
								
								if (!attrDef) {
									return;
								}
								
								// click handler for swatches links
								var varEventHandler = function(e){		
									var thisObj = jQuery(this);
									var swatchvalue = jQuery(this).find("a.swatchanchor").html();
									e.data = {id: pdpVarId, val: swatchvalue};
									if (thisObj.hasClass("unselectable")) {
										return false;
									}
									 						
									
									//-commented for enabling only single click as per wireframe : shahzad
									 else if (thisObj.hasClass("selected")) {
										// deselection
										//e.data = {id: pdpVarId, val: null};
										thisObj.addClass("selected");
										// clear the current selection
										//thisProduct.resetVariations();
									//	 thisProduct.varAttrSelected(e);
									} 
									else {
										// selection
										e.preventDefault();
										e.data = {id: pdpVarId, val: swatchvalue};
										// remove the current selection										
										thisSwatch.find("li.selected").removeClass("selected");	
										//thisSwatch.resetVariations();
										thisObj.addClass("selected");
										thisProduct.varAttrSelected(e);
									}	
									
									jQ('input#' + productID + 'quantity_dropdown').val('1');
									jQ('#' + productID + 'qtySpan').empty().html('1');
									qty1 = 1;
									jQ("#pdp-qty-minus").addClass("disabled");
									jQ('.pdp-size').parent().removeClass("red-border-size");
									if(jQ(this).hasClass("selected")){
										jQ('.variantdropdown span.selectedvarval').html("");
									}
									
									variantPriceAndAvailability(thisProduct.pid, thisProduct.firstSwatchColorId, "false");
									return false;
								}
								
								
								
								
								// all swtach anchors
								var varJqryObjs = thisSwatch.find("li.swatchli");
								// if its a color attr then render its swatches and images
								if (pdpVarId === "color") {
									var colorAttrDef = thisProduct.getAttrByID('color');
									
									varJqryObjs.each(function(){
										var colorvalue = jQuery(this).find("a.swatchanchor").html();
										// given a variation attr value, find its swatch image url
										var findSwatch = function(val) {
											for (var i=0; i<colorAttrDef.vals.length; i++){
												if (colorAttrDef.vals[i].val === val) {													
													return colorAttrDef.vals[i].images.swatch;
												}
											}
											return ""; // no swatch image found
										}
										
										var swatchUrl = (findSwatch(colorvalue)).url; // find swatch url
										
										if (swatchUrl && swatchUrl != "") {
											//jQuery(this).css("color", "transparent");
											jQuery(this).css("background", "url(" + swatchUrl+'?'+(findSwatch(colorvalue)).presetvar+'wid='+(findSwatch(colorvalue)).width+'&hei='+(findSwatch(colorvalue)).height + ")");
										}
										else {
											jQuery(this).css("color", "transparent"); // no swatch image found
										}
									});
									
									// swatches click, hover and mouseleave event handlers
									varJqryObjs.data("data", {id: pdpVarId}).bind('click touchstart',varEventHandler)
									.bind('hover touchstart',function(e){
										var colorvalue = jQuery(this).find("a.swatchanchor").html();
										thisProduct.showSelectedVarAttrVal("color", colorvalue);	
										thisProduct.showImages(colorvalue, colorAttrDef.vals,e.target);
									}).bind('mouseleave touchend',function(e) {
										if (thisProduct.selectedVarAttribs["color"]) {
											thisProduct.showImages(thisProduct.selectedVarAttribs["color"], colorAttrDef.vals)
										}
										else {
											thisProduct.showImages("", [{val: "", images: model.images}]);
										}
										
										thisProduct.showSelectedVarAttrVal("color", thisProduct.selectedVarAttribs["color"] || "");
									});
								}
								else {								
									// not a color swatch, we only have click handler for this type of variation attribute e.g. width, length etc.
									varJqryObjs.data("data", {id: pdpVarId}).click(varEventHandler);
								}
							});
							
						});
						
						// loop thru all the non-swatches attributes and bind events etc.
						jQuery(thisProduct.containerId).each(function(){
							$(this).find(".variationattributes .variantdropdown select").each(function(){							
								// default ui i.e. drop down
								jQuery(this).data("data", {id: jQuery(this).data("data"), val: ''}).change(function(e){
									// if there is only 1 value to be selected then return i.e. no deselection available
									if (this.selectedIndex == 0 && this.options.length == 1) { return; }

									e.data = jQuery(this).data("data"); // data is id
									// this.selectedIndex == 0, it is deselection
									e.data.val = (this.selectedIndex == 0) ? null: this.options[this.selectedIndex].value;
									
									if (this.selectedIndex == 0) {
										// deselection
										// clear the current selection
										thisProduct.resetVariations();
									}
									
									thisProduct.varAttrSelected(e);
								});
							});
						});
						
						if (thisProduct.selectedVarAttribs["color"]) {
							// show swatch related images for the current value								
							thisProduct.showImages(thisProduct.selectedVarAttribs["color"], thisProduct.getAttrByID('color').vals,'load');
						}
						else {
							// show images and bind hover event handlers for small/thumbnails to toggle large image								
							thisProduct.showImages("", [{val: "", images: model.images}],'load');
						}
					}
					else {
						// show images and bind hover event handlers for small/thumbnails to toggle large image								
						thisProduct.showImages("", [{val: "", images: model.images}]);
					}
					
					// bind product options event(s)
					getOptionsDiv(this);

					if(!model.productSet) {
						// quantity box
						if (!model.bundle) {
							getQtyBox(this);
						}// update avaiability for a bundle product, for everything else its done inside getQtyBox
						else if (model.bundle) {
							setAvailabilityMsg(createAvMessage(this, 1));
						}
					}

					// Add to cart button click binding
					getAddToCartBtn(this);
					// intial display of A2C button
					// if the price is 0 or not available, its disabled
					// if not in stock, its disabled
					// isPromoPrice would be true in case if a product has a promotional price which could make product's price 0
					if (!(this.getPrice() > 0 || this.isPromoPrice()) || 
						model.master || model.variant || model.productSet || model.bundle || 
						(!model.inStock && model.avStatus === app.constants.AVAIL_STATUS_NOT_AVAILABLE && !model.productSet)) {						
						this.disableA2CButton();
					}

					// For bundles and product-sets, enable or disable the add-to-cart button.
					// The button should be disabled if the add-to-cart button of any subproduct is disabled, enabled otherwise.
					// For product-sets, display a price which is the sum of the set-products prices as long as the add-to-cart button is enabled.
					if (model.bundle || model.productSet) {
						
						var bundleA2CEnabled = false;
						var price = new Number();
						
						for (var i = 0; i < thisProduct.subProducts.length; i++) {
							var subProduct = thisProduct.subProducts[i];
							bundleA2CEnabled = subProduct.isA2CEnabled();
							if (!bundleA2CEnabled) {
								break;
							}
							
							// collect price info
							price += new Number(subProduct.getPrice());
						}
						// if any of the bundled product has its A2C button disabled then the bundle is not orderable
						if (!bundleA2CEnabled) {							
							this.disableA2CButton();
						} 
						else {							
							this.enableA2CButton();

							// show total price except for a bundle
							if (!model.bundle) {
								thisProduct.showUpdatedPrice(price);
							}
						}
					}						

					// customer rating section only displayed for the main product
					if (!model.productSetProduct && !model.bundled) {
						if (!model.productSet && !isQuickView && !model.bundle) {							
							getRatingSection(this.containerId);							
						}
					}
					
					// wish list, sent to friend, add to gift
					getMiscLinks(this);
							
					// recommendations carosel
					loadRecommendations(this.containerId);

					// product tabs
					if(thisProduct.subProducts.length > 0) {
						getProductSetTabs(this.containerId,thisProduct.subProducts.length);	
					} else {
						getTabs(this.containerId);
					}
					
					// bind AddtoCartDisabled event for each subproduct (bundle or product set)
					jQuery.each(thisProduct.subProducts, function(){
						jQuery(this).bind("AddtoCartDisabled", {},
						/**
						* Event handler when a subproduct of a product set or a bundle is selected.
						* disable the add to cart button
						*/
						function() {
							thisProduct.disableA2CButton();
						});
					});
					
					// see if have any sub-products and bind AddtoCartEnabled event
					jQuery.each(thisProduct.subProducts, function(){
						jQuery(this).bind("AddtoCartEnabled", {},
							/**
							* Event handler when a subproduct of a product set or a bundle is selected.
							* Basically enable the add to cart button or do other screen refresh if needed like price etc.
							*/
							function() {
								// enable Add to cart button if all the sub products have been selected
								// and show the updated price
								var enableAddToCart = true;
								var subProducts = thisProduct.subProducts;
								var price = new Number();

								for (var i = 0; i < subProducts.length; i++) {
									if (((subProducts[i].variant || subProducts[i].master) && subProducts[i].selectedVar == null) ||
										(!subProducts[i].bundled && (subProducts[i].selectedOptions["Quantity"] == undefined ||
										subProducts[i].selectedOptions["Quantity"] <= 0))) {
										enableAddToCart = false;
										break
									}
									else {
										if (subProducts[i].selectedVar != null) {
											subProducts[i].selectedOptions.pid = subProducts[i].selectedVar.pid;
										}
										else {
											subProducts[i].selectedOptions.pid = subProducts[i].pid;
										}
										
										// Multiply the subproduct quantity-one price by the entered quantity.
										// Important note:  This value will be incorrect if subproduct uses
										// tiered pricing !!!!!
										var subproductQuantity = subProducts[i].selectedOptions["Quantity"];
										if (subproductQuantity == undefined) {
											subproductQuantity = 1;
										}
										price += new Number(subproductQuantity * subProducts[i].getPrice())
									}
								}

								if (enableAddToCart && (model.productSet || model.inStock) && (price > 0 || thisProduct.isPromoPrice())) {
									thisProduct.enableA2CButton();

									// show total price except for a bundle
									if (!model.bundle) {
										thisProduct.showUpdatedPrice(price);
									}
								}
								else {
									thisProduct.disableA2CButton();
								}
							}
						);
					});
				},

				toString: function() {
					return this.model;
				}
			}
		} // Product defintion end
	}
	else {
		// dw namespace has not been defined yet i.e. app object is unavailable
		alert("app is undefined!");
	}
})(app);