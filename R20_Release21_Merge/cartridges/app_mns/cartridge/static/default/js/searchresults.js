/*
 * All java script logic for the search result and refinement
 * handling.
 *
 * It contains all the client side script code for the search
 * result UI interactions.
 *
 * The code relies on the jQuery JS library to
 * be also loaded.
 *
 * The logic extends the JS namespace app.*
 */

(function(app){
	if (app) {
		// add search to namespace
		app.search = {
			
			// the current search result
			result : null,
			
			// add click handler to each refinement link
			bindClickToAllRefineLinks : function() {
				/*
				To make bookmarking and browser back-button work correctly the browser URL needs to 
				change. To force that change we do full-page loads (not AJAX) when changing a category.
				The implementation supports changing a category with AJAX: just uncomment this code 
				block to bind the event handlers.
				
				// category refinements
				jQuery("div.searchcategories ul li a").unbind("click").bind("click", function(e) {
					var url = jQuery(this).attr("href");
					app.search.result.refine( "refinement-category", url );
					return false;
				});
				jQuery("div.searchcategory span a").unbind("click").bind("click", function(e) {
					var url = jQuery(this).attr("href");
					app.search.result.refine( "refinement-category", url );
					return false;
				});
				jQuery("div.searchcategory a.clear").unbind("click").bind("click", function(e) {
					var url = jQuery(this).attr("href");
					app.search.result.outdate();
					app.search.result.updateGrid( url );
					return false;
				});

				// bind breadcrumb clicks
				jQuery("div.breadcrumb a:not(.home)").click(function(e) {
					var url = jQuery(this).attr("href");
					app.search.result.outdate();
					app.search.result.updateGrid( url );
					return false;
				});
				
				// bind landing page links for banners (product links are excluded to 
				// avoid double binding since they are bound by quickview bindings)
				jQuery("div.categorylanding a").each(function() {
					var isTile = ( jQuery(this).parents("div.producttile").length > 0 );
					if(!isTile) {
						jQuery(this).click(function(e) {
							var url = jQuery(this).attr("href");
							app.search.result.outdate();
							app.search.result.updateGrid( url );
							return false;
						});
					}
				});
				*/
				
				jQuery(".compareCheck").click(function() {
					var box = jQuery(this)[0];
					var data = jQuery(this).data("data");
					
					if (box.checked === true) {
						app.compare.addProduct({id: data.id, category: data.catId, boxId: data.boxId, img: jQuery(this).parent().siblings("div.image").find("p.productimage a img")});
					} else {
						app.compare.removeProduct({id: data.id, category: data.catId, boxId: data.boxId, img: jQuery(this).parent().siblings("div.image").find("p.productimage a img")});
					}
				});
								
				// non-category refinements
				jQuery("div.refineattributes ul li a").click(function(e) {
					//CR154	
					var clickedRefinementName = $(this).parents('div.navgroup').find('h3')[0].innerHTML ;
					var clickedRefinementValue = this.innerHTML;					
					trackRefinmentClicks(clickedRefinementName, clickedRefinementValue, this);					
					app.search.result.toggleRefine(this);
					return false;
				});
			
				// bind clear events
				jQuery("#searchrefinements div.refinedclear a").click(function(e) {
					var refID = jQuery(this).parents()[1].id;
					app.search.result.clearRefinement(app.search.result.get(refID));
					return false;
				});
				
				// prepare swatch palettes and thumbnails
				jQuery("#content div.swatches div.invisible").hide();
				jQuery("#content div.swatches a.swatch img.hiddenthumbnail").hide();
				// show the palette
				jQuery(".productswatchesall").click(function(e) {
					var cont = jQuery(this).parent().find("div.palette");
					cont.show().focus();
					return false;
				});
				// hide the palette
				jQuery("#content div.swatches div.invisible").mouseout(function(e) {
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
				// toggle thumbnail
				jQuery("#content div.swatches a.swatch").bind("mouseover mouseout", function(e) {
					var swatch = jQuery(this);
					app.producttile.toggleVariationThumbnail(swatch,'true');
				});
				// toggle thumbnail
				jQuery("#content div.swatches div.palette a.swatch").bind("mouseover mouseout", function(e) {
					var swatch = jQuery(this);
					app.producttile.toggleVariationThumbnail(swatch,'false');
				});
				// change thumbnail
				jQuery("#content div.swatches a.swatch").click(function(e) {
					var swatch = jQuery(this);
					app.producttile.selectVariation(swatch);
					// omit following the swatch link
					return false;
				});
			},
			
			// add click handler to each pagination link (only refreshes grid)
			bindClickToPaginationLinks : function() {
				jQuery("#search div.pagination a").click(function(e) {
					var pageName = jQuery(this).attr("class");
					app.search.result.pageTo( pageName );
					return false;
				});
			},
			saveSortInitialValue : function(){
				jQuery("div.sortby select").focus(function() {
					initChangeToVal = jQuery("div.sortby select").val();
				});
			},
			// add change handler for sortby menu
			bindChangeToSortBy : function() {
				jQuery("div.sortby select").change(function(e) {
				    var elem = this, funcUpdate = function() { 
				    	var url = jQuery(elem).val();
			    		app.search.result.updateGrid( url );
				    	return false;
				    };
				    //aliddl: commenting the IE accesbility feature, as it breaks the desired behaviour
				    /*if ($.browser.msie || $.browser.opera) {
				    	jQuery("div.sortby select").blur(function(e){
				    		funcUpdate();
				    	});
				    	jQuery("div.sortby select option").click(function() {
				    		if(jQuery("div.sortby select").val() != initChangeToVal){
			    			  funcUpdate();
				    		}
			    		});
				    } else {*/
				    	funcUpdate();
				    /*}*/
				});
			},
			saveItemsInitialValue : function(){
				jQuery("div.itemsperpage select").focus(function() {
					initChangeToVal = jQuery("div.itemsperpage select").val();
				});
			},
			// add change handler for items per page menu
			bindChangeToItemsPerPage : function() {
				jQuery("div.itemsperpage select").change(function(e) {
				    var elem = this, funcUpdate = function() { 
				    	var url = jQuery(elem).val();
			    		app.search.result.updateGrid( url );
				    	return false;
				    };
				  //aliddl: commenting the IE accesbility feature, as it breaks the desired behaviour
				    /*if ($.browser.msie || $.browser.opera) {
				    	jQuery("div.itemsperpage select").blur(function(e){
				    		funcUpdate();
				    	});
				    	jQuery("div.itemsperpage select option").click(function() {
				    		if(jQuery("div.itemsperpage select").val() != initChangeToVal){
			    			  funcUpdate();
				    		}
			    		});
				    } else {*/
				    	funcUpdate();
				    /*}*/
				});
			},
			// updates all bindings for changed DOM elements
			updateRefineBindings : function() {
				var initVal;
				app.search.bindClickToAllRefineLinks();
				app.search.bindClickToPaginationLinks();
				app.search.saveSortInitialValue();
				app.search.bindChangeToSortBy();
				app.search.saveItemsInitialValue();
				app.search.bindChangeToItemsPerPage();
			},
			
			// updates the grid using the 'post hash' refinement values
			updateGrid : function() {
				if (window.location.hash && app.search.result != null)
				{
					var url = window.location.href.replace("#","");
					app.search.result.updateGrid( url );
				}
			},

			// search result object
			SearchResult : function(keywordSearch, categoryID)
			{
				this.refinements = [];
				this.initialized = false;
				this.keywordSearch = keywordSearch;
				this.categoryID = null;
				this.loading = false;
			    var counter = 0;
				
				// retrieves a registered refinement by id
				this.get = function(id)
				{
					for(var i=0; i<this.refinements.length; i++)
					{
						if(this.refinements[i].id == id) return this.refinements[i];
					}
					return null;
				};
			
				// registers and adds the a refinement to the given position
				// if it is not already registered and renders the new refinement
				this.register = function(dwRefinement, pos)
				{		
					if(pos < 1) { return; }
					
					// check if registered at position
					if(this.isRegistered(dwRefinement, pos) && this.initialized)
					{
						this.refresh(dwRefinement);
						this.updateValues(dwRefinement);
						this.updateClear(dwRefinement);
						return;
					}
					// check if registered in general
					else if(this.isRegistered(dwRefinement) && this.initialized)
					{
						this.moveRefinement(dwRefinement, pos);
						this.refresh(dwRefinement);
						this.updateValues(dwRefinement);
						this.updateClear(dwRefinement);
						return;
					}
					
					// register the refinement at the correct position
					dwRefinement.refreshed = true;
					
					this.refinements.splice(pos-1, 0, dwRefinement);
					
					if(this.initialized)
					{
						// render the refinement based on the refinement type
						this.renderRefinement(dwRefinement, pos);
					}
				};
			
				// refreshes the given refinement
				this.refresh = function(dwRefinement)
				{
				    counter =0;
					for(var i=0; i<this.refinements.length; i++)
					{
						if(this.refinements[i].id != dwRefinement.id) continue;
						
						this.refinements[i].refreshed = true;
						return;
					}
				};
			
				// removes the WhiteSpaces from given string | Naveen Kumar
				this.removeSpaces = function(groupName){
					while(groupName.indexOf(" ")>=0){
						var specialCGroupName = unescape(groupName);
				        jQuery("#specialCharacterGroupName").html(specialCGroupName);
				        groupNameSpecial = jQuery("#specialCharacterGroupName").html();
				        groupName = groupNameSpecial.replace(" ", "");

						//groupName = groupName.replace(" ", "");
					}
					return groupName;
				}
				
				// removes the given refinement from the DOM
				this.removeRefinement = function(dwRefinement)
				{
					jQuery("#"+dwRefinement.id).remove();
				};
			
				// checks if the refinement is registered at the (optional) given position
				// if the position is not given, the function check if the refinement is registered in general
				this.isRegistered = function(dwRefinement, pos)
				{
					for(var i=0; i<this.refinements.length; i++)
					{
						if((this.refinements[i].id == dwRefinement.id) && pos == null) return true;
						if((this.refinements[i].id == dwRefinement.id) && (pos-1) == i)  return true;
					}
					return false;
				};
			
				// renders an individual refinement at the given position into the DOM
				this.renderRefinement = function(dwRefinement, pos)
				{
					// insert at correct position
					var refSet = jQuery("div.refinement");
					if(refSet.length == 0 || refSet.length < pos-1) pos = 1;
						
					// get the correct predecessor refinement container
					var predecessorID = null;
					if( typeof(this.refinements[pos-2]) != "undefined" )
					{
						predecessorID = this.refinements[pos-2].id;
					}
							
					// insert after found predecessor
					if( predecessorID != null )
					{
						jQuery("#" + predecessorID).after( this.buildHtmlRefinement(dwRefinement) );
					}
					// insert at first position
					else
					{
						jQuery("#searchrefinements").prepend( this.buildHtmlRefinement(dwRefinement) );
					}
					
					// bind toggling
					this.bindToggleEvent(dwRefinement);
					
					// append list update values
					this.updateValues(dwRefinement);
				};
			
				// binds the toggling event
				this.bindToggleEvent = function(dwRefinement)
				{
					jQuery("#"+dwRefinement.id+" h3").not('.subcategory').click(function(e) {
						jQuery(this).toggleClass("collapsed");
						jQuery(this).next("div.refinedclear").toggle();
						jQuery(this).nextAll("div.refineattributes").toggle();
					});
				};
			
				// bind event handlers to value list
				this.bindRefineEvents = function(dwRefinement)
				{
					if(dwRefinement.type == "category")
					{
						/*
						To make bookmarking and browser back-button work correctly the browser URL 
						needs to change. To force that change we do a full-page load (not AJAX) when 
						changing the category refinement.
						The implementation supports changing the category with AJAX: just uncomment 
						this code block to bind the event handlers.
					
						// category refinements
						jQuery("#"+dwRefinement.id+" ul li a").click(function(e) {
							var url = jQuery(this).attr("href");
							app.search.result.refine( "refinement-category", url );
							return false;
						});
						jQuery("div.searchcategory span a").click(function(e) {
							var url = jQuery(this).attr("href");
							app.search.result.refine( "refinement-category", url );
							return false;
						});
						*/
						return;
					}
					else
					{
						// non-category refinements
						jQuery("#"+dwRefinement.id+" ul li a").click(function(e) {			
							app.search.result.toggleRefine(this);
							return false;
						});
						return;
					}
				};
			
				// builds the actual html code for the refinement based on the type
				this.buildHtmlRefinement = function(dwRefinement)
				{
					var html = "";
					
					if(dwRefinement.type == "category")
					{
						html = "<div id=\"" + dwRefinement.id + "\" class=\"searchcategories refinement\">" +
							"<ul id=\"category-level-1\" class=\"refinementcategory\"><\/ul><\/div>";
					}
					else
					{
						var html = "<div id=\"" + dwRefinement.id + "\" class=\"navgroup refinement\">" +
							"<h3>" + dwRefinement.displayName + "</h3><div class=\"refinedclear\"><\/div>";
						
						html += "<div class=\"refineattributes\">";
						
						// type based html code here
						if(dwRefinement.swatchBased)
						{
							// remove swatches class
							html += "<div class=\"" + dwRefinement.displayName + "\"><ul><\/ul><\/div><div class=\"clear\"><\/div>";
						}
						else
						{
							html += "<div><ul><\/ul><\/div>";
						}
						
						html += "<\/div>";
					}
					return html;
				};
			
				// moves an already registered refinement (no need to render fully) from
				// one position to another in the refinements
				this.moveRefinement = function(dwRefinement, positionTo)
				{
					var currentIdx = null;
					var newIdx = positionTo-1;
					
					// new position exceeds array size
					if(newIdx > this.refinements.length) return;
					
					// find current position
					for(var i=0; i<this.refinements.length; i++)
					{
						if(this.refinements[i].id == dwRefinement.id)
						{
							currentIdx = i;
							break;
						}
					}
					
					// not found
					if(currentIdx == null) return;
					
					// exchange refinements in array
					this.refinements[currentIdx] = this.refinements[newIdx];
					this.refinements[newIdx] = dwRefinement;
				};
			
				// updates and renders the list of values of the given refinement
				this.updateValues = function(dwRefinement)
				{
					// remove the existing list of values
					jQuery("#"+dwRefinement.id+" ul").empty();
					
					// toggle scrollbox for long value lists
					/* Commenting it as scrollable is managed in CSS | Naveen Kumar
					if(dwRefinement.type == "attribute" && !dwRefinement.swatchBased && dwRefinement.cutoffThreshold != null)
					{
						if(dwRefinement.values.length > dwRefinement.cutoffThreshold)
						{
							jQuery("#"+dwRefinement.id+" div.refineattributes").children().addClass("scrollable");
						}
						else
						{
							jQuery("#"+dwRefinement.id+" div.refineattributes").children().removeClass("scrollable");
						}
					}
					*/
					// Empty the Category Section in LHN | Naveen Kumar
					if(dwRefinement.type == "category") {
						jQuery("#"+dwRefinement.id).empty();
					}					
					/*
					// render refinement label for category
					if(dwRefinement.type == "category" && this.keywordSearch && this.categoryID == null)
					{
						jQuery("div.searchcategory").empty();
						jQuery("div.searchcategory").append("<span>"+dwRefinement.displayName+"</span>");
					}
					*/
					// no list element ID by default
					var listElemID = "";
					
				var groupIndex=0;
				do 
				{	
					if(dwRefinement.type == "category")
					{
						//alert("L- " + dwRefinement.groupNames.length + " :: dwRefinement.groupNames[groupIndex].groupName: "  + dwRefinement.groupNames[0].groupName);
						if (dwRefinement.groupNames.length>0 && dwRefinement.groupNames[groupIndex].groupName != "")						
						{
							jQuery("#"+dwRefinement.id).append("<div class=\"searchcategory\"></\div>");
							jQuery("div.searchcategory").empty();
							if (dwRefinement.groupNames[groupIndex].groupName.indexOf('hidden')<0) {
								jQuery("#"+dwRefinement.id).append("<h3 class=\"subcategory\">" + dwRefinement.groupNames[groupIndex].groupName + "<\/h3>");
							}
							jQuery("#"+dwRefinement.id).append("<ul class=\"refineattributes\" id=\"" + this.removeSpaces(dwRefinement.groupNames[groupIndex].groupName) + "\" >" + "<\/ul>");
							
/*						} else{
							jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).append("<h3 class=\"\">" + dwRefinement.groupNames[0].groupName + "<\/h3>");
	*/					}					
												
					} 
					
					// add new values to the list
					for(var i=0; i<dwRefinement.values.length; i++)
					{						
						var value = dwRefinement.values[i];
						
						// render top level category differrent in case we have a keyword search
						if(i == 0 && dwRefinement.type == "category" && this.keywordSearch && this.categoryID != null && counter == 0)
						{
							jQuery("div.searchcategory").append("<h3><a href=\""+value.refineUrl+"\" class=\"searchcategories\">"+value.displayValue+"</a></h3> <div class=\"refinedclearcat\"> <a href=\""+dwRefinement.clearUrl+"\" class=\"clear\">View All<\/a></\div>");
							counter++;
							continue;
						}
						
						// map correct classes
						var aClass = "refineLink";
						if(dwRefinement.swatchBased) aClass = "swatchRefineLink";
						
						var aID = dwRefinement.getValueElementID(value);
						var aUrl = value.refineUrl;
						var liClass = null;
						if(value.refined && dwRefinement.type != "category") { aUrl = value.relaxUrl; liClass = "selected"; }
						if(value.active && dwRefinement.type == "category") { aClass += " active"; liClass = "active"; }
						if(!value.selectable) { aUrl = null; liClass = "unselectable"; }
						
						if(dwRefinement.type == "category" && value.expandable)
						{
							if(liClass != null)
							{
								liClass += " expandable";
							}
							else
							{
								liClass = "expandable";
							}
						}
						
						// get the correct list element ID
						if(dwRefinement.type == "category")
						{
							listElemID = this.removeSpaces(value.groupName);
							// check on existence of this list element
							// create it on the fly if it does not not exist at present
							//Commenting it, does not seem required now as we do not show complete hierarchy of categories | Naveen Kumar
							/*if(jQuery("#"+dwRefinement.id+" ul#"+listElemID).length == 0)
							{
								// get the correct node where to insert new list
								var parentListElemID = "category-level-" + (value.level - 1);
								jQuery("#"+dwRefinement.id+" ul#"+parentListElemID+" li.active").append("<ul id=\""+listElemID+"\" class=\"refinementcategory\"><\/ul>");
							}
							*/
						}
						else
						{
							listElemID = "";
						}
						if(dwRefinement.type == "category")
						{							
							if (value.displayValue.indexOf('Hidden')<0 && value.displayValue.indexOf('hidden')<0) {
								if(dwRefinement.groupNames.length > 0 && dwRefinement.groupNames[groupIndex].groupName == value.groupName)
								{
									jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).append("<li" + (liClass != null ? " class=\"" + liClass + "\"" : "") + "><a " + (aID != null ? " id=\"" + aID + "\"" : "") + " class=\"" + aClass + "\" " + (aUrl != null ? " href=\"" + aUrl + "\"" : "") + ">" + value.displayValue +"<\/a><\/li>");
								} else if (dwRefinement.groupNames.length == 0){
									jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).append("<li" + (liClass != null ? " class=\"" + liClass + "\"" : "") + "><a " + (aID != null ? " id=\"" + aID + "\"" : "") + " class=\"" + aClass + "\" " + (aUrl != null ? " href=\"" + aUrl + "\"" : "") + ">" + value.displayValue +"<\/a><\/li>");
								}
							}
						}
						else 
						{ //BV-toprated stars
							if(dwRefinement.id=="refinement-TopRated"){								
								var AvgRating=parseFloat(value.displayValue);
								var Title=String(AvgRating);	
								var RatingInPercent=(AvgRating/5)*100;
								var AvgRating=Math.round(RatingInPercent);
								if(AvgRating>0)
									{
									jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).append("<li" + (liClass != null ? " class='starRatings selected'" : " class='starRatings'") + "><a " + (aID != null ? " id=\"" + aID + "\"" : "") + " class=\"starRating " + aClass + "\" " + (aUrl != null ? " href=\"" + aUrl + "\"" : "") + "><span class='greyStars'><span style='width:" + AvgRating + "%' class='yellowStars'></span></span><\/a><\/li>");
									}else{
									jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).append("<li" + (liClass != null ? " class='starRatings selected'" : " class='starRatings'") + "><a " + (aID != null ? " id=\"" + aID + "\"" : "") + " class=\"starRating " + aClass + "\" " + (aUrl != null ? " href=\"" + aUrl + "\"" : "") + ">"+ value.displayValue +"<\/a><\/li>");
									}
								}else{
							        jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).append("<li" + (liClass != null ? " class=" + liClass + "" : " class='starRatings'") + "><a " + (aID != null ? " id=\"" + aID + "\"" : "") + " class=\"" + aClass + "\" " + (aUrl != null ? " href=\"" + aUrl + "\"" : "") + ">" + value.displayValue +"<\/a><\/li>");
							         }
						}
					}
					//Davinder: QC Defect 2635 feedback text for selected filters
					jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).find("li.selected").find("a").prepend("<span class='accessibility'>" + getFeedbackText + " </span>");
					//aliddl: giving focus to the a tag after the data has loaded
					jQuery("#"+dwRefinement.id+" ul" + (listElemID != "" ? "#" + listElemID : "")).find("li.selected").find("a").blur();
					//Rebind the click event of h3 for Category Section as this is rebuild and previous binding is lost | Naveen Kumar
					jQuery("h3.subcategory").click(function(e) {
						//jQuery(this).toggleClass("collapsed");
						//jQuery(this).next("ul.refineattributes").toggle();
					});
					
					groupIndex = groupIndex + 1;
				} while (groupIndex < dwRefinement.groupNames.length)

					// Add Refine Text above the refinements sections
					if (jQuery("#refinement-category h3#refineby").attr("id") != "refineby")
					{ 
						jQuery("#refinement-category").append("<h3 id=\"refineby\">" + globalRefineBy+ "<\/h3>");
					}
				
					// bind event handlers to new value list
					this.bindRefineEvents(dwRefinement);
				};
			
				// updates the clear link of the given refinement
				this.updateClear = function(dwRefinement)
				{
					if(jQuery("#"+dwRefinement.id+" div.refinedclear a").length == 1)
					{
						jQuery("#"+dwRefinement.id+" div.refinedclear").empty();
						//QC defect fixing: 956
						jQuery("#"+dwRefinement.id+" div.refinedclear").append("<a href=\"" + dwRefinement.clearUrl + "\">"+clearText+"</a>");
					}
				}
			
				// cleans all refinements based on their refreshed state
				// removes all refinements which haven't been refreshed during
				// a call of method register(..)
				this.clean = function()
				{
					// set state to initialized
					// do nothing unless initialized
					if( !this.initialized )
					{
						this.initialized = true;
						return;	
					}
					
					var removeIdx = [];
					
					// find all refinements to remove
					for(var i=0; i<this.refinements.length; i++)
					{
						if(this.refinements[i].refreshed) continue;
						
						removeIdx[removeIdx.length] = i;
					}
					
					// remove orphaned clear links for refinements which have been relaxed completely
					for(var i=0; i<this.refinements.length; i++)
					{
						// only process active refinements
						if(this.refinements[i].refreshed) {
							// remove clear link, in case there are no other selected values for this refinement
							if(jQuery("#"+this.refinements[i].id+" ul li.selected").length == 0)
							{
								jQuery("#"+this.refinements[i].id+" div.refinedclear").empty();
							}
						}
					}
					
					// no refinements to remove
					if(removeIdx.length == 0) {
						return;
					}
					
					// remove refinements and clear their index positions
					for(var j=removeIdx.length-1; j>=0; j--)
					{
						// remove from DOM and from register
						this.removeRefinement(this.refinements[removeIdx[j]]);
						this.refinements.splice(removeIdx[j], 1);
					}
				};
			
				// sets the state of all refinements to be refreshed
				// this method must be called whenever the user changes the category refinement (refine or relax)
				this.outdate = function()
				{
					// mark all refinements as to be refreshed
					for(var i=0; i<this.refinements.length; i++)
					{
						this.refinements[i].refreshed = false;
					}
				};
			
				// toggles a clicked refinement value based on its given state (selected or not selected)
				// and executes the correct action (either a refine or a relax)
				this.toggleRefine = function(objRef)
				{
					if(typeof objRef == "undefined" || objRef == null) return;
					
					// omit toggling if currently loading
					if(this.loading) return;
					
					var url = jQuery(objRef).attr("href");
					var refID = jQuery(objRef).parents()[6].id;
					if(refID == "") {
						refID = jQuery(objRef).parents()[4].id;
					}
					// avoid IE following non link anchors
					if(!url) return;
					
					// update the hash : Commenting below line as this line is now in updateGrid function and hence to avoid calling it twice removing from here.
					//this.updateHash(url);

					// handle relax
					if(jQuery(objRef).parent().hasClass("selected"))
					{
						jQuery(objRef).parent().removeClass("selected");
						app.search.result.relax( refID, url );
						return;
					}
					
					// handle refine
					jQuery(objRef).parent().addClass("selected");
					app.search.result.refine( refID, url );
				}
			
				// this method is called by the click event of a refine link
				this.refine = function(refinementID, url)
				{
					var dwRefinement = this.get(refinementID);
					if(dwRefinement == null) return;
					
					// outdate the refinement state in order to exchange old refinements
					// with respect to new refinements at other category level
					if(dwRefinement.type == "category") app.search.result.outdate();
					
					// update the grid
					this.updateGrid( url );
					
					// render "clear" link
					if(jQuery("#"+dwRefinement.id+" div.refinedclear:empty").length == 1 && dwRefinement.type != "category")
					{
						//QC defect fixing: 956
						jQuery("#"+dwRefinement.id+" div.refinedclear").append("<a href=\"" + dwRefinement.clearUrl + "\">"+clearText+"</a>");
						
						// bind clear event
						jQuery("#"+dwRefinement.id+" div.refinedclear a").click(function(e) {
							var refID = jQuery(this).parents()[1].id;
							app.search.result.clearRefinement(app.search.result.get(refID));
							return false;
						});
					}
				};
			
				// this method is called by the click event of a relax link (selected refinement value)
				this.relax = function(refinementID, url)
				{
					var dwRefinement = this.get(refinementID);
					if(dwRefinement == null) return;
					
					// remove clear link, in case there are no other
					// selected values for this refinement
					if(jQuery("#"+dwRefinement.id+" ul li.selected").length == 0)
					{
						jQuery("#"+dwRefinement.id+" div.refinedclear").empty();
					}
					
					// update the grid
					this.updateGrid( url );
				};
			
				// clears the given refinement, all selected values become unselected
				this.clearRefinement = function(dwRefinement)
				{
					if(dwRefinement == null) return;
					
					// omit clearing if currently loading
					if(this.loading) return;
					
					// get the clear url
					var url = jQuery("#"+dwRefinement.id+" div.refinedclear a").attr("href");
					
					// remove "clear" link and value selections
					jQuery("#"+dwRefinement.id+" div.refinedclear").empty();
					jQuery("#"+dwRefinement.id+" ul li").removeClass("selected");
					
					// update the grid
					this.updateGrid(url);
				};
			
				// updates the product grid using the specified url
				this.updateGrid = function(url)
				{
					if(url == null) return;
					this.loading = true;
					
					// indicate progress
					jQuery("#content").html(app.showProgress("productloader"));
					
					// append "format" parameter
					url = app.util.appendParamToURL(url, "format", "ajax");
					
					var quickViewOptions = {
						buttonSelector: "#content div.quickviewbutton",
						imageSelector: "#content div.product div.image",
						buttonLinkSelector: "#content div.quickviewbutton a",
						productNameLinkSelector: "#content div.product div.name a"
					};
					this.updateHash(url);
					jQuery("#content").load( url, function() {
						app.quickView.bindEvents(quickViewOptions);
						jQuery("#content").fadeIn("normal", function() {
							app.search.updateRefineBindings();
							app.search.result.loading = false;
							// extract hidden data and turn them into jQuery data objects
							app.hiddenData();
							//aliddl: cat header pagination fix
							if(jQ('#catBannerSlotContainer>*').length==0){
								jQ('#catBannerBreadcrumb').css('visibility','visible');
							}else{
								jQ('#catBannerBreadcrumb').remove();
							}
						});
					});
				};
			
				// refreshes the product grid to the given pageName
				this.pageTo = function(pageName)
				{
					if(typeof pageName == "number")
					{
						if(pageName < 1) return;
						pageName = "page-" + pageName;
					}
					
					var pageObj = jQuery("."+pageName);
					if(pageObj.length == 0) return;
					app.search.result.updateGrid( pageObj[0].href );
				};
				
				// adds the refinement values to the window location hash
				this.updateHash = function(url){
					//aliddl: fixed Defect #3063, function updateHash, updated to decode the querystring and the url for comparing and updating the hash in the addressbar
					var winSearch = decodeURIComponent(window.location.search);
					var idx = decodeURIComponent(url).indexOf(winSearch);
					if (idx >= 0){
						if(idx > 0){
						window.location.hash = decodeURIComponent(url).substring(idx + winSearch.length);
						}
						if(idx ==0){
							
							var startPos = decodeURIComponent(url).indexOf('?');
							window.location.hash = decodeURIComponent(url).substring(startPos);
						}
					}
				};
			},
			
			// refinements object
			Refinement : function(id, displayName, type, swatchBased, clearUrl, cutoffThreshold)
			{
				this.id = id;
				this.displayName = displayName;
				this.values = [];
				this.type = type;
				this.swatchBased = swatchBased;
				this.clearUrl = clearUrl;
				this.cutoffThreshold = cutoffThreshold;
				this.refreshed = false;			 
				this.groupNames = [];
				
				this.add = function(id, value, presentationID, displayValue, refineUrl, relaxUrl, refined, selectable, expandable, level, active, groupName)
				{					
					this.values[this.values.length] = { "value": value, "presentationID": presentationID, "displayValue": displayValue, "refineUrl": refineUrl, "relaxUrl": relaxUrl, "refined": refined, "selectable": selectable, "expandable": expandable, "level": level, "active": active, "groupName" : groupName};
				};
				
				this.addGroupNames = function(groupName){
					this.groupNames[this.groupNames.length] =	{ "groupName" : groupName };
				}
			
				this.get = function(id)
				{
					for(var i=0; i<this.values.length; i++)
					{
						if(this.values[i].id == id) return this.values[i];
					}
					return null;
				};
				
				this.getValueElementID = function(value)
				{
					if(value == "undefined") {
						return null;
					}
					var elementID = null;
					if(this.swatchBased) {
						elementID = "swatch-";
						if(value.presentationID != null) {
							elementID += value.presentationID;
						} else {
							elementID += value.displayValue;
						}
					}
					return elementID;
				}
			}
		} // end search
	} else {
		// name space has not been defined yet
		alert("app namespace is not loaded yet!");
	}
})(app);

jQuery(document).ready(function() {
	// init all refinement bindings
	app.search.updateRefineBindings();
	
	// update grid
	app.search.updateGrid();
	
	// init refinement toggling
	jQuery("#searchrefinements div.navgroup h3").not('.subcategory').click(function(e) {
		
		jQuery(this).toggleClass("collapsed");
		jQuery(this).nextAll("div.refineattributes").toggle();
		jQuery(this).next("div.refinedclear").toggle();
		jQuery(this).next("ul.refineattributes").toggle();
	});
	
	var quickViewOptions = {
		buttonSelector: "#content div.quickviewbutton",
		imageSelector: "#content div.product div.image",
		buttonLinkSelector: "#content div.quickviewbutton a",
		productNameLinkSelector: "#content div.product div.name a"
	};

	app.quickView.bindEvents(quickViewOptions);
});

//var evar10 = "";
//var evar11 = "";

function trackRefinmentClicks (refineType, refineValue, obj){	
	if (evar10 == "" && evar11 == ""){
		evar10 = refineType;
		evar11 = refineType + "|" + refineValue; 
	} else {
		if (evar10.indexOf(refineType) < 0){
			evar10 = evar10 + ":" + refineType;
		}		
		evar11 = evar11 + ":" + refineType + "|" + refineValue;		
	}	
	
	s.eVar10 = evar10;
	s.eVar11 = evar11;
	s.eVar12 = refineType;
	s.eVar13 = refineType + "|" +refineValue;
	
	s.linkTrackVars = "eVar10,eVar11,eVar12,eVar13";
	s.tl(obj,'o', refineType);	
	return false;	
}