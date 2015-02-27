/*
 * jQuery Orbit Plugin 1.4.0
 * www.ZURB.com/playground
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/


(function (jQ) {
  'use strict';

  jQ.fn.findFirstImage = function () {
    return this.first()
            .find('img')
            .andSelf().filter('img')
            .first();
  };

  var ORBIT = {

    defaults: {
      animation: 'horizontal-push',     // fade, horizontal-slide, vertical-slide, horizontal-push, vertical-push
      animationSpeed: 600,              // how fast animations are
      timer: true,                      // display timer?
      advanceSpeed: 6000,               // if timer is enabled, time between transitions
      pauseOnHover: true,              // if you hover pauses the slider
      startClockOnMouseOut: true,      // if clock should start on MouseOut
      startClockOnMouseOutAfter: 1000,  // how long after MouseOut should the timer start again
      directionalNav: true,             // manual advancing directional navs
      directionalNavRightText: 'Right', // text of right directional element for accessibility
      directionalNavLeftText: 'Left',   // text of left directional element for accessibility
      captions: true,                   // do you want captions?
      captionAnimation: 'fade',         // fade, slideOpen, none
      captionAnimationSpeed: 600,       // if so how quickly should they animate in
      resetTimerOnClick: false,         // true resets the timer instead of pausing slideshow progress on manual navigation
      bullets: true,                   // true or false to activate the bullet navigation
      bulletThumbs: true,              // thumbnails for the bullets
      bulletThumbLocation: '',          // relative path to thumbnails from this file
      afterSlideChange: jQ.noop,         // callback to execute after slide changes
      afterLoadComplete: jQ.noop,        // callback to execute after everything has been loaded
      fluid: true,
      centerBullets: true,              // center bullet nav with js, turn this off if you want to position the bullet nav manually
      singleCycle: false,               // cycles through orbit slides only once
      slideNumber: true,               // display slide numbers?
      stackOnSmall: false               // stack slides on small devices (i.e. phones)
    },

    activeSlide: 0,
    numberSlides: 0,
    orbitWidth: null,
    orbitHeight: null,
    locked: null,
    timerRunning: null,
    degrees: 0,
    wrapperHTML: '<div class="orbit-wrapper" />',
    timerHTML: '<div class="timer"><span class="mask"><span class="rotator"></span></span><span class="pause"></span></div>',
    captionHTML: '<div class="orbit-caption"></div>',
    directionalNavHTML: '<div class="slider-nav hide-for-small"><span class="right"></span><span class="left"></span></div>',
    bulletHTML: '<ul class="orbit-bullets"></ul>',
    slideNumberHTML: '<span class="orbit-slide-counter"></span>',

    init: function (element, options) {
      var jQimageSlides,
          imagesLoadedCount = 0,
          self = this;

      // Bind functions to correct context
      this.clickTimer = jQ.proxy(this.clickTimer, this);
      this.addBullet = jQ.proxy(this.addBullet, this);
      this.resetAndUnlock = jQ.proxy(this.resetAndUnlock, this);
      this.stopClock = jQ.proxy(this.stopClock, this);
      this.startTimerAfterMouseLeave = jQ.proxy(this.startTimerAfterMouseLeave, this);
      this.clearClockMouseLeaveTimer = jQ.proxy(this.clearClockMouseLeaveTimer, this);
      this.rotateTimer = jQ.proxy(this.rotateTimer, this);

      this.options = jQ.extend({}, this.defaults, options);
      if (this.options.timer === 'false') this.options.timer = false;
      if (this.options.captions === 'false') this.options.captions = false;
      if (this.options.directionalNav === 'false') this.options.directionalNav = false;

      this.jQelement = jQ(element);
      this.jQwrapper = this.jQelement.wrap(this.wrapperHTML).parent();
      this.jQslides = this.jQelement.children('img, a, div, figure');

      this.jQelement.on('movestart', function(e) {
											
        // If the movestart is heading off in an upwards or downwards
        // direction, prevent it so that the browser scrolls normally.
        if ((e.distX > e.distY && e.distX < -e.distY) ||
            (e.distX < e.distY && e.distX > -e.distY)) {
          e.preventDefault();
        }
      });

      this.jQelement.bind('orbit.next', function () {
												
        self.shift('next');
      });

      this.jQelement.bind('orbit.prev', function () {
        self.shift('prev');
      });

      this.jQelement.bind('swipeleft', function (e) {
												
        jQ(this).trigger('orbit.next');
		
		
      });

      this.jQelement.bind('swiperight', function (e) {
											
        jQ(this).trigger('orbit.prev');
		
		 
      });
	  

      this.jQelement.bind('orbit.goto', function (event, index) {
        self.shift(index);
      });

      this.jQelement.bind('orbit.start', function (event, index) {
        self.startClock();
      });

      this.jQelement.bind('orbit.stop', function (event, index) {
        self.stopClock();
      });

      var jQimageSlides = this.jQslides.filter('img');

      if (jQimageSlides.length === 0) {
        this.loaded();
      } else {
        jQimageSlides.bind('imageready', function () {
          imagesLoadedCount += 1;
          if (imagesLoadedCount === jQimageSlides.length) {
            self.loaded();
          }
        });
      }
    },

    loaded: function () {
      this.jQelement
        .addClass('orbit')
        .css({width: '1px', height: '1px'});

      if (this.options.stackOnSmall) {
        this.jQelement.addClass('orbit-stack-on-small');
      }

      this.jQslides.addClass('orbit-slide');

      this.setDimentionsFromLargestSlide();
      this.updateOptionsIfOnlyOneSlide();
      this.setupFirstSlide();
      this.notifySlideChange();

      if (this.options.timer) {
        this.setupTimer();
        this.startClock();
      }

      if (this.options.captions) {
        this.setupCaptions();
      }

      if (this.options.directionalNav) {
        this.setupDirectionalNav();
      }

      if (this.options.bullets) {
        this.setupBulletNav();
        this.setActiveBullet();
      }

      this.options.afterLoadComplete.call(this);
      Holder.run();
    },

    currentSlide: function () {
      return this.jQslides.eq(this.activeSlide);
    },

    notifySlideChange: function() {
      if (this.options.slideNumber) {
        var txt = (this.activeSlide+1) + ' of ' + this.jQslides.length;
        this.jQelement.trigger("orbit.change", {slideIndex: this.activeSlide, slideCount: this.jQslides.length});
        if (this.jQcounter === undefined) {
          var jQcounter = jQ(this.slideNumberHTML).html(txt);
          this.jQcounter = jQcounter;
          this.jQwrapper.append(this.jQcounter);
        } else {
          this.jQcounter.html(txt);
        }
      }
    },

    setDimentionsFromLargestSlide: function () {
      //Collect all slides and set slider size of largest image
      var self = this,
          jQfluidPlaceholder;

      self.jQelement.add(self.jQwrapper).width(this.jQslides.first().outerWidth());
      self.jQelement.add(self.jQwrapper).height(this.jQslides.first().height());
      self.orbitWidth = this.jQslides.first().outerWidth();
      self.orbitHeight = this.jQslides.first().height();
      jQfluidPlaceholder = this.jQslides.first().findFirstImage().clone();


      this.jQslides.each(function () {
        var slide = jQ(this),
            slideWidth = slide.outerWidth(),
            slideHeight = slide.height();

        if (slideWidth > self.jQelement.outerWidth()) {
          self.jQelement.add(self.jQwrapper).width(slideWidth);
          self.orbitWidth = self.jQelement.outerWidth();
        }
        if (slideHeight > self.jQelement.height()) {
          self.jQelement.add(self.jQwrapper).height(slideHeight);
          self.orbitHeight = self.jQelement.height();
          jQfluidPlaceholder = jQ(this).findFirstImage().clone();
        }
        self.numberSlides += 1;
      });

      if (this.options.fluid) {
        if (typeof this.options.fluid === "string") {
          // jQfluidPlaceholder = jQ("<img>").attr("src", "http://placehold.it/" + this.options.fluid);
          jQfluidPlaceholder = jQ("<img>").attr("data-src", "holder.js/" + this.options.fluid);
          //var inner = jQ("<div/>").css({"display":"inline-block", "width":"2px", "height":"2px"});
          //jQfluidPlaceholder = jQ("<div/>").css({"float":"left"});
          //jQfluidPlaceholder.wrapInner(inner);

          //jQfluidPlaceholder = jQ("<div/>").css({"height":"1px", "width":"2px"});
          //jQfluidPlaceholder = jQ("<div style='display:inline-block;width:2px;height:1px;'></div>");
        }

        self.jQelement.prepend(jQfluidPlaceholder);
        jQfluidPlaceholder.addClass('fluid-placeholder');
        self.jQelement.add(self.jQwrapper).css({width: 'inherit'});
        self.jQelement.add(self.jQwrapper).css({height: 'inherit'});

        jQ(window).bind('resize', function () {
          self.orbitWidth = self.jQelement.outerWidth();
          self.orbitHeight = self.jQelement.height();
        });
      }
    },

    //Animation locking functions
    lock: function () {
      this.locked = true;
    },

    unlock: function () {
      this.locked = false;
    },

    updateOptionsIfOnlyOneSlide: function () {
      if(this.jQslides.length === 1) {
        this.options.directionalNav = false;
        this.options.timer = false;
        this.options.bullets = false;
      }
    },

    setupFirstSlide: function () {
      //Set initial front photo z-index and fades it in
      var self = this;
      this.jQslides.first()
        .css({"z-index" : 3, "opacity" : 1})
        .fadeIn(function() {
          //brings in all other slides IF css declares a display: none
          self.jQslides.css({"display":"block"})
      });
    },

    startClock: function () {
      var self = this;

      if(!this.options.timer) {
        return false;
      }

      if (this.jQtimer.is(':hidden')) {
        this.clock = setInterval(function () {
          self.jQelement.trigger('orbit.next');
        }, this.options.advanceSpeed);
      } else {
        this.timerRunning = true;
        this.jQpause.removeClass('active');
        this.clock = setInterval(this.rotateTimer, this.options.advanceSpeed / 180, false);
      }
    },

    rotateTimer: function (reset) {
      var degreeCSS = "rotate(" + this.degrees + "deg)";
      this.degrees += 2;
      this.jQrotator.css({
        "-webkit-transform": degreeCSS,
        "-moz-transform": degreeCSS,
        "-o-transform": degreeCSS,
        "-ms-transform": degreeCSS
      });
      if (reset) {
        this.degrees = 0;
        this.jQrotator.removeClass('move');
        this.jQmask.removeClass('move');
      }
      if(this.degrees > 180) {
        this.jQrotator.addClass('move');
        this.jQmask.addClass('move');
      }
      if(this.degrees > 360) {
        this.jQrotator.removeClass('move');
        this.jQmask.removeClass('move');
        this.degrees = 0;
        this.jQelement.trigger('orbit.next');
      }
    },

    stopClock: function () {
      if (!this.options.timer) {
        return false;
      } else {
        this.timerRunning = false;
        clearInterval(this.clock);
        this.jQpause.addClass('active');
      }
    },

    setupTimer: function () {
      this.jQtimer = jQ(this.timerHTML);
      this.jQwrapper.append(this.jQtimer);

      this.jQrotator = this.jQtimer.find('.rotator');
      this.jQmask = this.jQtimer.find('.mask');
      this.jQpause = this.jQtimer.find('.pause');

      this.jQtimer.click(this.clickTimer);

      if (this.options.startClockOnMouseOut) {
        this.jQwrapper.mouseleave(this.startTimerAfterMouseLeave);
        this.jQwrapper.mouseenter(this.clearClockMouseLeaveTimer);
      }

      if (this.options.pauseOnHover) {
        this.jQwrapper.mouseenter(this.stopClock);
      }
    },

    startTimerAfterMouseLeave: function () {
      var self = this;

      this.outTimer = setTimeout(function() {
        if(!self.timerRunning){
          self.startClock();
        }
      }, this.options.startClockOnMouseOutAfter)
    },

    clearClockMouseLeaveTimer: function () {
      clearTimeout(this.outTimer);
    },

    clickTimer: function () {
      if(!this.timerRunning) {
          this.startClock();
      } else {
          this.stopClock();
      }
    },

    setupCaptions: function () {
      this.jQcaption = jQ(this.captionHTML);
      this.jQwrapper.append(this.jQcaption);
      this.setCaption();
    },

    setCaption: function () {
      var captionLocation = this.currentSlide().attr('data-caption'),
          captionHTML;

      if (!this.options.captions) {
        return false;
      }

      //Set HTML for the caption if it exists
      if (captionLocation) {
        //if caption text is blank, don't show captions
        if (jQ.trim(jQ(captionLocation).text()).length < 1){
          return false;
        }
        // if location selector starts with '#', remove it so we don't see id="#selector"
        if (captionLocation.charAt(0) == '#') {
            captionLocation = captionLocation.substring(1, captionLocation.length);
        }
        captionHTML = jQ(captionLocation).html(); //get HTML from the matching HTML entity
        this.jQcaption
          .attr('id', captionLocation) // Add ID caption TODO why is the id being set?
          .html(captionHTML); // Change HTML in Caption
          //Animations for Caption entrances
        switch (this.options.captionAnimation) {
          case 'none':
            this.jQcaption.show();
            break;
          case 'fade':
            this.jQcaption.fadeIn(this.options.captionAnimationSpeed);
            break;
          case 'slideOpen':
            this.jQcaption.slideDown(this.options.captionAnimationSpeed);
            break;
        }
      } else {
        //Animations for Caption exits
        switch (this.options.captionAnimation) {
          case 'none':
            this.jQcaption.hide();
            break;
          case 'fade':
            this.jQcaption.fadeOut(this.options.captionAnimationSpeed);
            break;
          case 'slideOpen':
            this.jQcaption.slideUp(this.options.captionAnimationSpeed);
            break;
        }
      }
    },

    setupDirectionalNav: function () {
      var self = this,
          jQdirectionalNav = jQ(this.directionalNavHTML);

      jQdirectionalNav.find('.right').html(this.options.directionalNavRightText);
      jQdirectionalNav.find('.left').html(this.options.directionalNavLeftText);

      this.jQwrapper.append(jQdirectionalNav);

      this.jQwrapper.find('.left').click(function () {
        self.stopClock();
        if (self.options.resetTimerOnClick) {
          self.rotateTimer(true);
          self.startClock();
        }
        self.jQelement.trigger('orbit.prev');
      });

      this.jQwrapper.find('.right').click(function () {
        self.stopClock();
        if (self.options.resetTimerOnClick) {
          self.rotateTimer(true);
          self.startClock();
        }
        self.jQelement.trigger('orbit.next');
      });
    },

    setupBulletNav: function () {
      this.jQbullets = jQ(this.bulletHTML);
      this.jQwrapper.append(this.jQbullets);
      this.jQslides.each(this.addBullet);
      this.jQelement.addClass('with-bullets');
      //if (this.options.centerBullets) this.jQbullets.css('margin-left', -this.jQbullets.outerWidth() / 2);
    },

    addBullet: function (index, slide) {
      var position = index + 1,
          jQli = jQ('<li>' + (position) + '</li>'),
          thumbName,
          self = this;

      if (this.options.bulletThumbs) {
        thumbName = jQ(slide).attr('data-thumb');
        if (thumbName) {
          jQli
            .addClass('has-thumb')
            .css({background: "url(" + this.options.bulletThumbLocation + thumbName + ") no-repeat"});;
        }
      }
      this.jQbullets.append(jQli);
      jQli.data('index', index);
      jQli.click(function () {
        self.stopClock();
        if (self.options.resetTimerOnClick) {
          self.rotateTimer(true);
          self.startClock();
        }
        self.jQelement.trigger('orbit.goto', [jQli.data('index')])
      });
    },

    setActiveBullet: function () {
      if(!this.options.bullets) { return false; } else {
        this.jQbullets.find('li')
          .removeClass('active')
          .eq(this.activeSlide)
          .addClass('active');
      }
    },

    resetAndUnlock: function () {
      this.jQslides
        .eq(this.prevActiveSlide)
        .css({"z-index" : 1});
      this.unlock();
      this.options.afterSlideChange.call(this, this.jQslides.eq(this.prevActiveSlide), this.jQslides.eq(this.activeSlide));
    },

    shift: function (direction) {
      var slideDirection = direction;

      //remember previous activeSlide
      this.prevActiveSlide = this.activeSlide;

      //exit function if bullet clicked is same as the current image
      if (this.prevActiveSlide == slideDirection) { return false; }

      if (this.jQslides.length == "1") { return false; }
      if (!this.locked) {
        this.lock();
        //deduce the proper activeImage
        if (direction == "next") {
          this.activeSlide++;
          if (this.activeSlide == this.numberSlides) {
              this.activeSlide = 0;
          }
        } else if (direction == "prev") {
          this.activeSlide--
          if (this.activeSlide < 0) {
            this.activeSlide = this.numberSlides - 1;
          }
        } else {
          this.activeSlide = direction;
          if (this.prevActiveSlide < this.activeSlide) {
            slideDirection = "next";
          } else if (this.prevActiveSlide > this.activeSlide) {
            slideDirection = "prev"
          }
        }

        //set to correct bullet
        this.setActiveBullet();
        this.notifySlideChange();

        //set previous slide z-index to one below what new activeSlide will be
        this.jQslides
          .eq(this.prevActiveSlide)
          .css({"z-index" : 2});

        //fade
        if (this.options.animation == "fade") {
          this.jQslides
            .eq(this.activeSlide)
            .css({"opacity" : 0, "z-index" : 3})
            .animate({"opacity" : 1}, this.options.animationSpeed, this.resetAndUnlock);
          this.jQslides
              .eq(this.prevActiveSlide)
              .animate({"opacity":0}, this.options.animationSpeed);
        }

        //horizontal-slide
        if (this.options.animation == "horizontal-slide") {
          if (slideDirection == "next") {
            this.jQslides
              .eq(this.activeSlide)
              .css({"left": this.orbitWidth, "z-index" : 3})
              .css("opacity", 1)
              .animate({"left" : 0}, this.options.animationSpeed, this.resetAndUnlock);
          }
          if (slideDirection == "prev") {
            this.jQslides
              .eq(this.activeSlide)
              .css({"left": -this.orbitWidth, "z-index" : 3})
              .css("opacity", 1)
              .animate({"left" : 0}, this.options.animationSpeed, this.resetAndUnlock);
          }
          this.jQslides
              .eq(this.prevActiveSlide)
              .css("opacity", 0);
        }

        //vertical-slide
        if (this.options.animation == "vertical-slide") {
          if (slideDirection == "prev") {
            this.jQslides
              .eq(this.activeSlide)
              .css({"top": this.orbitHeight, "z-index" : 3})
              .css("opacity", 1)
              .animate({"top" : 0}, this.options.animationSpeed, this.resetAndUnlock);
            this.jQslides
              .eq(this.prevActiveSlide)
              .css("opacity", 0);
          }
          if (slideDirection == "next") {
            this.jQslides
              .eq(this.activeSlide)
              .css({"top": -this.orbitHeight, "z-index" : 3})
              .css("opacity", 1)
              .animate({"top" : 0}, this.options.animationSpeed, this.resetAndUnlock);
          }
          this.jQslides
              .eq(this.prevActiveSlide)
              .css("opacity", 0);
        }

        //horizontal-push
        if (this.options.animation == "horizontal-push") {
          if (slideDirection == "next") {
            this.jQslides
              .eq(this.activeSlide)
              .css({"left": this.orbitWidth, "z-index" : 3})
              .animate({"left" : 0, "opacity" : 1}, this.options.animationSpeed, this.resetAndUnlock);
            this.jQslides
              .eq(this.prevActiveSlide)
              .animate({"left" : -this.orbitWidth}, this.options.animationSpeed, "", function(){
                jQ(this).css({"opacity" : 0});
              });
          }
          if (slideDirection == "prev") {
            this.jQslides
              .eq(this.activeSlide)
              .css({"left": -this.orbitWidth, "z-index" : 3})
              .animate({"left" : 0, "opacity" : 1}, this.options.animationSpeed, this.resetAndUnlock);
            this.jQslides
              .eq(this.prevActiveSlide)
              .animate({"left" : this.orbitWidth}, this.options.animationSpeed, "", function(){
                jQ(this).css({"opacity" : 0});
              });
          }
        }

        //vertical-push
        if (this.options.animation == "vertical-push") {
          if (slideDirection == "next") {
            this.jQslides
              .eq(this.activeSlide)
              .css({top: -this.orbitHeight, "z-index" : 3})
              .css("opacity", 1)
              .animate({top : 0, "opacity":1}, this.options.animationSpeed, this.resetAndUnlock);
            this.jQslides
              .eq(this.prevActiveSlide)
              .css("opacity", 0)
              .animate({top : this.orbitHeight}, this.options.animationSpeed, "");
          }
          if (slideDirection == "prev") {
            this.jQslides
              .eq(this.activeSlide)
              .css({top: this.orbitHeight, "z-index" : 3})
              .css("opacity", 1)
              .animate({top : 0}, this.options.animationSpeed, this.resetAndUnlock);
            this.jQslides
              .eq(this.prevActiveSlide)
              .css("opacity", 0)
              .animate({top : -this.orbitHeight}, this.options.animationSpeed);
          }
        }

        this.setCaption();
      }

      if (this.jQslides.last() && this.options.singleCycle) {
        this.stopClock();
      }
    }
  };

  jQ.fn.orbit = function (options) {
    return this.each(function () {
      var orbit = jQ.extend({}, ORBIT);
      orbit.init(this, options);
    });
  };

})(jQ);

/*!
 * jQuery imageready Plugin
 * http://www.zurb.com/playground/
 *
 * Copyright 2011, ZURB
 * Released under the MIT License
 */
(function (jQ) {

  var options = {};

  jQ.event.special.imageready = {

    setup: function (data, namespaces, eventHandle) {
      options = data || options;
    },

    add: function (handleObj) {
      var jQthis = jQ(this),
          src;

      if ( this.nodeType === 1 && this.tagName.toLowerCase() === 'img' && this.src !== '' ) {
        if (options.forceLoad) {
          src = jQthis.attr('src');
          jQthis.attr('src', '');
          bindToLoad(this, handleObj.handler);
          jQthis.attr('src', src);
        } else if ( this.complete || this.readyState === 4 ) {
          handleObj.handler.apply(this, arguments);
        } else {
          bindToLoad(this, handleObj.handler);
        }
      }
    },

    teardown: function (namespaces) {
      jQ(this).unbind('.imageready');
    }
  };

  function bindToLoad(element, callback) {
    var jQthis = jQ(element);

    jQthis.bind('load.imageready', function () {
       callback.apply(element, arguments);
       jQthis.unbind('load.imageready');
     });
  }

}(jQ));

/*

Holder - 1.3 - client side image placeholders
(c) 2012 Ivan Malopinsky / http://imsky.co

Provided under the Apache 2.0 License: http://www.apache.org/licenses/LICENSE-2.0
Commercial use requires attribution.

*/

var Holder = Holder || {};
(function (app, win) {

var preempted = false,
fallback = false,
canvas = document.createElement('canvas');

//http://javascript.nwbox.com/ContentLoaded by Diego Perini with modifications
function contentLoaded(n,t){var l="complete",s="readystatechange",u=!1,h=u,c=!0,i=n.document,a=i.documentElement,e=i.addEventListener?"addEventListener":"attachEvent",v=i.addEventListener?"removeEventListener":"detachEvent",f=i.addEventListener?"":"on",r=function(e){(e.type!=s||i.readyState==l)&&((e.type=="load"?n:i)[v](f+e.type,r,u),!h&&(h=!0)&&t.call(n,null))},o=function(){try{a.doScroll("left")}catch(n){setTimeout(o,50);return}r("poll")};if(i.readyState==l)t.call(n,"lazy");else{if(i.createEventObject&&a.doScroll){try{c=!n.frameElement}catch(y){}c&&o()}i[e](f+"DOMContentLoaded",r,u),i[e](f+s,r,u),n[e](f+"load",r,u)}};

//https://gist.github.com/991057 by Jed Schmidt with modifications
function selector(a){
	a=a.match(/^(\W)?(.*)/);var b=document["getElement"+(a[1]?a[1]=="#"?"ById":"sByClassName":"sByTagName")](a[2]);
	var ret=[];	b!=null&&(b.length?ret=b:b.length==0?ret=b:ret=[b]);	return ret;
}

//shallow object property extend
function extend(a,b){var c={};for(var d in a)c[d]=a[d];for(var e in b)c[e]=b[e];return c}

function draw(ctx, dimensions, template) {
	var dimension_arr = [dimensions.height, dimensions.width].sort();
	var maxFactor = Math.round(dimension_arr[1] / 16),
		minFactor = Math.round(dimension_arr[0] / 16);
	var text_height = Math.max(template.size, maxFactor);
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = template.background;
	ctx.fillRect(0, 0, dimensions.width, dimensions.height);
	ctx.fillStyle = template.foreground;
	ctx.font = "bold " + text_height + "px sans-serif";
	var text = template.text ? template.text : (dimensions.width + "x" + dimensions.height);
	if (Math.round(ctx.measureText(text).width) / dimensions.width > 1) {
		text_height = Math.max(minFactor, template.size);
	}
	ctx.font = "bold " + text_height + "px sans-serif";
	ctx.fillText(text, (dimensions.width / 2), (dimensions.height / 2), dimensions.width);
	return canvas.toDataURL("image/png");
}

if (!canvas.getContext) {
	fallback = true;
} else {
	if (canvas.toDataURL("image/png").indexOf("data:image/png") < 0) {
		//Android doesn't support data URI
		fallback = true;
	} else {
		var ctx = canvas.getContext("2d");
	}
}

var settings = {
	domain: "holder.js",
	images: "img",
	themes: {
		"gray": {
			background: "#eee",
			foreground: "#aaa",
			size: 12
		},
		"social": {
			background: "#3a5a97",
			foreground: "#fff",
			size: 12
		},
		"industrial": {
			background: "#434A52",
			foreground: "#C2F200",
			size: 12
		}
	}
};



app.flags = {
	dimensions: {
		regex: /([0-9]+)x([0-9]+)/,
		output: function(val){
			var exec = this.regex.exec(val);
			return {
				width: +exec[1],
				height: +exec[2]
			}
		}
	},
	colors: {
		regex: /#([0-9a-f]{3,})\:#([0-9a-f]{3,})/i,
		output: function(val){
			var exec = this.regex.exec(val);
			return {
					size: settings.themes.gray.size,
					foreground: "#" + exec[2],
					background: "#" + exec[1]
					}
		}
	},
	text: {
		regex: /text\:(.*)/,
		output: function(val){
			return this.regex.exec(val)[1];
		}
	}
}

for(var flag in app.flags){
	app.flags[flag].match = function (val){
		return val.match(this.regex)
	}
}

app.add_theme = function (name, theme) {
	name != null && theme != null && (settings.themes[name] = theme);
	return app;
};

app.add_image = function (src, el) {
	var node = selector(el);
	if (node.length) {
		for (var i = 0, l = node.length; i < l; i++) {
			var img = document.createElement("img")
			img.setAttribute("data-src", src);
			node[i].appendChild(img);
		}
	}
	return app;
};

app.run = function (o) {
	var options = extend(settings, o),
		images = selector(options.images),
		preempted = true;

	for (var l = images.length, i = 0; i < l; i++) {
		var theme = settings.themes.gray;
		var src = images[i].getAttribute("data-src") || images[i].getAttribute("src");
		if ( !! ~src.indexOf(options.domain)) {
			var render = false,
				dimensions = null,
				text = null;
			var flags = src.substr(src.indexOf(options.domain) + options.domain.length + 1).split("/");
			for (sl = flags.length, j = 0; j < sl; j++) {
				if (app.flags.dimensions.match(flags[j])) {
					render = true;
					dimensions = app.flags.dimensions.output(flags[j]);
				} else if (app.flags.colors.match(flags[j])) {
					theme = app.flags.colors.output(flags[j]);
				} else if (options.themes[flags[j]]) {
					//If a theme is specified, it will override custom colors
					theme = options.themes[flags[j]];
				} else if (app.flags.text.match(flags[j])) {
					text = app.flags.text.output(flags[j]);
				}
			}
			if (render) {
				images[i].setAttribute("data-src", src);
				var dimensions_caption = dimensions.width + "x" + dimensions.height;
				images[i].setAttribute("alt", text ? text : theme.text ? theme.text + " [" + dimensions_caption + "]" : dimensions_caption);

				// Fallback
        // images[i].style.width = dimensions.width + "px";
        // images[i].style.height = dimensions.height + "px";
				images[i].style.backgroundColor = theme.background;

				var theme = (text ? extend(theme, {
						text: text
					}) : theme);

				if (!fallback) {
					images[i].setAttribute("src", draw(ctx, dimensions, theme));
				}
			}
		}
	}
	return app;
};
contentLoaded(win, function () {
	preempted || app.run()
})

})(Holder, window);
