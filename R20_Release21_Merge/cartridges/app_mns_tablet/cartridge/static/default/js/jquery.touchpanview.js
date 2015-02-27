;(function($) {
	
	
	var hasTouch = /android|iphone|ipad/i.test(navigator.userAgent.toLowerCase());
	
	
	
	
	
	$.fn.touchPanView = function( cfg ) {
		
		// Apply default values
		var cfg = $.extend({},{
			width: 				100,
			height: 			100,
			
			// Enable and configuring easing behavior
			easing:				true,
			easingTime: 		10,
			easingShift: 		90,
			easingRepeat: 		30,
			easingReduceSpeed: 	.15,
			
			startCentered:		true,
			
			// Enable and configuring zoom behavior
			zoom:				true,
			startZoomedOut:		true,
			protectZoom:		false,		// force zoom to be a 0-100 value
			zoomStep:			25,			// used with zoom plugin to "zoom(in)" and "zoom(out)"
			
			// Bindable controls
			zoomIn:				false,
			zoomOut:			false,
			zoomFit:			false,
			zoomFull:			false,
			
						
		t:'e'},cfg);
		
			
		
		
		
		
		$(this).each(function(){
			
			

			if ( $(this).data('touchPanView') ) return;
			
			
			/**
			 * Shared Logic Methods
			 */
			
			var desktopMousePos = function(e) {
					
				var pos = {
					x: e.pageX,
					y: e.pageY
				}
				
				return pos;
				
			}
			
			var touchMousePos = function(e) {
				
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				
				var pos = {
					x: touch.pageX,
					y: touch.pageY
				}
				
				return pos;
				
			}
			
			var dragStart = function( pos ) {
				
				isMoving 		= true;
				
				startOffset 	= $.extend({},pos,{});
				stepOffset 		= { x:0, y:0 };
				
				startPos		= $pan.position();
				
				startTime		= new Date();
				startTime		= startTime.getTime();
				
				stepTime		= new Date();
				stepTime		= stepTime.getTime();
			
			}
			
			var dragEnd = function( pos ) {
				
				isMoving = false;
				
				// Calculate speed!
				stepTime		= new Date();
				stepTime		= stepTime.getTime();
				
				delay 			= stepTime - startTime;
				speedX 			= stepOffset.x / delay;
				speedY 			= stepOffset.y / delay;
				
				if ( !cfg.easing ) return;
				
				// Easing support.
				var safe_repeater = cfg.easingRepeat;
				var easing = function() {
					
					// Calcolo movimento in base a velocit�.
					css = $pan.position();
					
					if ( Math.abs(speedX) >= 0.01 ) {
						if ( speedX < 0 ) {
							css.left 	-= Math.abs(speedX)*cfg.easingShift;
						} else {
							css.left 	+= Math.abs(speedX)*cfg.easingShift;
						}
						
						if ( css.left > 0 ) {
							css.left = 0;
						}
						
						if ( ( Math.abs(css.left) + cfg.width ) >= $pan.width() ) {
							css.left = 0 - ( $pan.width() - cfg.width );
						}

						
					}
					
					if ( Math.abs(speedY) > 0.01 ) {
						
						if ( speedY < 0 ) {
							css.top 	-= Math.abs(speedY)*cfg.easingShift;
						} else {
							css.top 	+= Math.abs(speedY)*cfg.easingShift;
						}
						
						if ( css.top > 0 ) {
							css.top = 0;
						}
						
						if ( ( Math.abs(css.top) + cfg.height ) >= $pan.height() ) {
							css.top = 0 - ( $pan.height() - cfg.height );
						}
						
					}
					
					
					
					$pan.css(css);
					
					
					// Reducing speed index.
					speedX = speedX - speedX * cfg.easingReduceSpeed;
					speedY = speedY - speedY * cfg.easingReduceSpeed;
					
					// Stop easing control.
					if ( safe_repeater <= 0 ) return;
					safe_repeater -= 1;
					
					// Recursion
					setTimeout(function(){ easing() },cfg.easingTime);
					
				}; 
				
				// Start easing
				easing();
				
			}
			
			var dragMove = function( pos ) {
				
				stepOffset.x = pos.x - startOffset.x;
				stepOffset.y = pos.y - startOffset.y;
				
				var css = {
					left: startPos.left + stepOffset.x,
					top: startPos.top + stepOffset.y
				};
				
				if ( css.left > 0 ) {
					css.left = 0;
					startOffset.x = pos.x;
				}
				
				if ( css.top > 0 ) {
					css.top = 0;
					startOffset.y = pos.y;
				}
				
				if ( ( Math.abs(css.left) + cfg.width ) >= $pan.width() ) {
					css.left = 0 - ( $pan.width() - cfg.width );
				}
				
				if ( ( Math.abs(css.top) + cfg.height ) >= $pan.height() ) {
					css.top = 0 - ( $pan.height() - cfg.height );
				}
				
				$pan.css(css);
				
			}
			
			var dblTap = function( pos ) {
				
				if ( $img.touchPanZoom() < 100 ) {
					$img.touchPanZoom(100);
				} else {
					$img.touchPanZoom(0);
				}
				
			}
						
			

			
			
			
			
			
			var init = function() {
				
				// Setup wrapper dimensions and hide the image object.
				$wrap.css({
					width: 				cfg.width,
					height: 			cfg.height
				});
				
				
				// Setup internal panel dimensions and backround.
				css = {
					width: 				$img.width(),
					height: 			$img.height()
				};
				
				
				// Fix "startCentered" property
				if ( cfg.startCentered ) {
					css.left 			= 0 - ( css.width/2 - cfg.width/2 ),
					css.top 			= 0 - ( css.height/2 - cfg.height/2 )
				}
				
				
				// Calculate zoom space
				var zoom = {
					ratio:				100,
					x:					Math.abs( css.width - cfg.width ),
					y:					Math.abs( css.height - cfg.height )
				};
				
				// Setup pan dimensions
				$pan.css(css);
				
				
			
				
				
				// Save data configuration into DOM wrapper
				$img.data('touchPanView',{
					cfg: 	cfg,
					wrap: 	$wrap,
					pan:	$pan,
					zoom:	zoom,
					img: {
						width: 		$img.width(),
						height: 	$img.height()
					}
				});
				
				
				// Invoke the zoom plugin to zoom out the image!
				if ( cfg.zoom && cfg.startZoomedOut ) {
					$img.touchPanZoom(0,false);
					
				} else {
					$img.touchPanZoom(100,false);
					
				}
				
				
				
				
				
							
				
				
				
				
				
				
				
				
				/**
				 * Touch Events
				 */
				
				$wrap.bind('touchstart',function(e){
					e.preventDefault();
					
					device = 'mobile';
					
					dragStart( touchMousePos(e) );
					
				});
				
				$wrap.bind('touchend',function(e){
					e.preventDefault();
					
					dragEnd( touchMousePos(e) );
					
				});
				
				$wrap.bind('touchmove',function(e){
					e.preventDefault();
					if ( !isMoving ) return;
					
					dragMove( touchMousePos(e) );
					
				});
				
				$wrap.bind("doubleTap",function(e){	
				
					e.preventDefault();						
					//dblTap( desktopMousePos(e) );
					
				});
				
				
				$wrap.bind('pinchOut',function(e){
					e.preventDefault();					
					isMoving = false;					
					$img.touchPanZoom('in');
					
					
				});
				$wrap.bind('pinchIn',function(e){
					e.preventDefault();					
					isMoving = false;					
					$img.touchPanZoom('out');
					
					
				});
				
				
				
				
				
				/**
				 * Mouse Events
				 */
				
				$wrap.bind('mousedown',function(e){
					e.preventDefault();
					
					device = 'desktop';
					
					dragStart( desktopMousePos(e) );
					
				});
				
				$wrap.bind('mouseup',function(e){
					e.preventDefault();
					
					dragEnd( desktopMousePos(e) );
					
				});
				
				$wrap.bind('mousemove',function(e){
					e.preventDefault();
					if ( !isMoving ) return;
					
					dragMove( desktopMousePos(e) );
					
				});
				
				
				$wrap.bind('dblclick',function(e){
					e.preventDefault();
					
					dblTap( desktopMousePos(e) );
					
				});
				
				
				
				
				
				
				
				/**
				 * Bind Controls
				 */
				
				if ( cfg.zoomIn !== false ) $(cfg.zoomIn).bind('click',function(e){
					
					e.preventDefault();
					
					$img.touchPanZoom('in');
					
				});
				
				if ( cfg.zoomOut !== false ) $(cfg.zoomOut).bind('click',function(e){
					
					e.preventDefault();
					
					$img.touchPanZoom('out');
					
				});
				
				if ( cfg.zoomFit !== false ) $(cfg.zoomFit).bind('click',function(e){
					
					e.preventDefault();
					
					$img.touchPanZoom(0);
					
				});
				
				if ( cfg.zoomFull !== false ) $(cfg.zoomFull).bind('click',function(e){
					
					e.preventDefault();
					
					$img.touchPanZoom(100);
					
				});
			
			} // EndOf: "init()" ###
			
			
			
			/**
			 * Internal flags and data storage
			 */
			
			var device			= 'desktop';
			var isMoving 		= false;
			
			var startPos		= {};
			var startOffset 	= {};
			var stepOffset 		= {};
			
			var startTime		= 0;
			var stepTime		= 0;
			var speedX			= 0;
			var speedY			= 0;
			
			
			// Get object's references
			var _this 	= this;
			var $img 	= $(this);
			
			// Creates wrapper, panView and pinPad
			$img.wrap('<div class="touchpanview-wrap"></div>');
			var $wrap = $img.parent();
			$wrap.append('<div class="touchpanview-pan"></div>');
			var $pan 		= $img.next();
			$pan.append($img);
			
			
			// call init
				init();
			
		
		});
		
	}; // EndOf: "$.fn.touchPanView()" ###
	
	
	
	
	
	
	
	
	/**
	 * Zoom Manager
	 */
	
	$.fn.touchPanZoom = function( zoom, animate ) {
		
		
		
		
		
		
		
		var _this 	= this;
		var $img 	= $(this);
		var wdg 	= $img.data('touchPanView');
		
		// Check for touchPanView DOM data and setup object's references.
		if ( !wdg ) return false;
		
		// Facilities for zoomin in/out.
		if ( zoom == 'in' ) 	zoom = wdg.zoom.ratio + wdg.cfg.zoomStep;
		if ( zoom == 'out' ) 	zoom = wdg.zoom.ratio - wdg.cfg.zoomStep;
		if ( !wdg.cfg.zoom )	zoom = 100; // Block zoom behavior if disabled by main configuration.
		
		// Check for zoom input settings or reutn actual zoom.
		if ( !zoom && zoom !== 0 ) return wdg.zoom.ratio;
		
		// Protect zoom into a 0-100 range
		if ( wdg.cfg.protectZoom ) {
			if ( zoom < 0 ) 	zoom = 0;
			if ( zoom > 100 )	zoom = 100;
		}
		
		var css = {
			width: 		wdg.img.width * ( zoom/100 ),
			height: 	wdg.img.height * ( zoom/100 ),
			top:		0,
			left:		0
		};
		
		// Check image smaller dimension and mantain original proportions!
		if ( ( css.width < wdg.cfg.width || css.height < wdg.cfg.height ) ) {
			
			var viewportRatio 	= wdg.cfg.width / wdg.cfg.height;
			var imageRatio 		= wdg.img.width / wdg.img.height;
			
			
			// Landscape viewport
			if ( viewportRatio > 1 ) {
				
				css.width 		= wdg.cfg.width;
				css.height 		= css.width / imageRatio;
				zoom 			= css.width / wdg.img.width * 100;
				
			// Portrait viewport
			} else if ( viewportRatio < 1 ) {
				
				css.height 		= wdg.cfg.height;
				css.width 		= css.height * imageRatio;
				zoom 			= css.height / wdg.img.height * 100;
			
			// Perfect Square
			} else {
				
				// Image Landscape
				if ( imageRatio > 1 ) {
					
					css.height 	= wdg.cfg.height;
					css.width 	= css.height * imageRatio;
					zoom 		= css.height / wdg.img.height * 100;
				
				// Image Portrait
				} else if ( imageRatio < 1 ) {
					
					css.width 	= wdg.cfg.width;
					css.height 	= css.width / imageRatio;
					zoom 		= css.width / wdg.img.width * 100;
				
				// Perfect square image
				} else {
					
					css.height 	= 100;
					css.width 	= 100;
					
				}
				
			}
			
		} // -- zoom dimensions --
		
		
		// Center image
		if ( zoom > 0 ) {
			pos 		= wdg.pan.position();
			css.left 	= pos.left - ( css.width - wdg.pan.width() ) / 2;
			css.top 	= pos.top - ( css.height - wdg.pan.height() ) / 2;
		}
		
		
		// Fix pan position while zooming to prevent blank area in the viewport
		if ( css.left > 0 ) 	css.left = 0;
		if ( css.top > 0 ) 		css.top = 0;
		
		if ( ( Math.abs(css.left) + wdg.cfg.width ) >= css.width ) {
			css.left = 0 - ( css.width - wdg.cfg.width );
		}
		
		if ( ( Math.abs(css.top) + wdg.cfg.height ) >= css.height ) {
			css.top = 0 - ( css.height - wdg.cfg.height );
		}
		
		
		// Animate the zoom and update internal ratio
		if ( animate === false ) {
			wdg.pan.css(css);
			$img.css({
				width: css.width,
				height: css.height
			});
			
		
			
		} else {
			wdg.pan.animate(css,300);
			
			$img.animate({
				width: css.width,
				height: css.height
			},300);
			
		
			
		}
		
		// Update internal ratio.
		wdg.zoom.ratio = zoom;
		
		return wdg.zoom.ratio;
		
	}; // EndOf: "$.fn.touchPanZoom()" ###
	
	
	

})(jQuery);