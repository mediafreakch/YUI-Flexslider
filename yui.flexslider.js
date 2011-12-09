YUI.add('flexslider', function(Y) {
 /*
 * YUI FlexSlider v0.9
 * Adaption from the great jQuery Flexslider Plugin (Copyright 2011, Tyler Smith)
 * 
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

	Y.Node.addMethod("flexslider", function(context, options) {		
		var node = Y.one(context).all('.slides > li');
		if (node.size() == 1) {
			node.setStyles({'display' : 'block', 'opacity' : 0}).transition({opacity: 1});
		}
		else if (Y.one(context).getData('flexslider') != true) {
			new flexslider(Y.one(context), options);		
		}
	});

	Y.NodeList.importMethod(Y.Node.prototype, "flexslider");

	flexslider = function(el, options) {
		var slider = el;
		slider.init = function() {
			slider.vars = Y.merge(flexslider.defaults, options);
			slider.getData('flexslider', true);
			slider.container = slider.one('.slides');
			slider.slides = slider.all('.slides > li');
			slider.count = slider.slides.size();
			slider.animating = false;
			slider.currentSlide = slider.vars.slideToStart;
			slider.animatingTo = slider.currentSlide;
			slider.atEnd = (slider.currentSlide == 0) ? true : false;
			slider.eventType = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
			slider.cloneCount = 0;
			slider.cloneOffset = 0;
			slider.manualPause = false;
			slider.vertical = (slider.vars.slideDirection == "vertical");
			slider.prop = (slider.vertical) ? "top" : "marginLeft";
			slider.args = {
			};
			
			//Test for webbkit CSS3 Animations
			slider.transitions = "webkitTransition" in document.body.style;
			if(slider.transitions)
				slider.prop = "-webkit-transform";

			//Test for controlsContainer
			if(slider.vars.controlsContainer != "") {
				slider.controlsContainer = Y.all(slider.vars.controlsContainer).item(Y.all('.slides').indexOf(slider.container));
				slider.containerExists = (slider.controlsContainer) ? true : false;
			}
			//Test for manualControls
			if(slider.vars.manualControls != "") {
				slider.manualControls = ((slider.containerExists) ? slider.controlsContainer : slider).all(slider.vars.manualControls);
				slider.manualExists = slider.manualControls.size() > 0;
			}

			///////////////////////////////////////////////////////////////////
			// FlexSlider: Randomize Slides
			//
			// TODO: This function hasn't been translated to YUI yet
			//
			/*if(slider.vars.randomize) {
				slider.slides.sort(function() {
					return (Math.round(Math.random()) - 0.5);
				});
				slider.container.empty().append(slider.slides);
			}*/
			///////////////////////////////////////////////////////////////////
			
			///////////////////////////////////////////////////////////////////
			// FlexSlider: Slider Animation Initialize
			if(slider.vars.animation.toLowerCase() == "slide") {
				if(slider.transitions) {
					slider.setTransition(0);
				}
				
				slider.setStyles({
					"overflow" : "hidden"
				});

				if(slider.vars.animationLoop) {
					// cloneNode does not work if passed NodeList
					var firstClone = slider.slides.filter(':first-child').item(0).cloneNode(true), lastClone = slider.slides.filter(':last-child').item(0).cloneNode(true);

					slider.cloneCount = 2;
					slider.cloneOffset = 1;
					slider.container.append(firstClone.addClass('clone')).prepend(lastClone.addClass('clone'));
				}

				//create newSlides to capture possible clones
				slider.newSlides = slider.all('.slides > li');
			
				var sliderOffset = (-1 * (slider.currentSlide + slider.cloneOffset));

				if(slider.vertical) {
					slider.newSlides.setStyles({
						"display" : "block",
						"width" : "100%",
						"float" : "left"
					});
					slider.container.setStyle('height', (slider.count + slider.cloneCount) * 200 + "%").setStyles({"position" : "absolute", 'width' : "100%"});
					//Timeout function to give browser enough time to get proper height initially
					setTimeout(function() {
						slider.setStyles({
							"position" : "relative"
						}).setStyle('height', slider.slides.item(0).getComputedStyle('height'));
						slider.args[slider.prop] = (slider.transitions) ? "translate3d(0," + sliderOffset * parseInt(slider.getComputedStyle('height')) + "px,0)" : sliderOffset * parseInt(slider.getComputedStyle('height')) + "px";
						slider.container.setStyles(slider.args);
					}, 50);
				} else {

					slider.args[slider.prop] = (slider.transitions) ? "translate3d(" + sliderOffset * parseInt(slider.getComputedStyle('width')) + "px,0,0)" : sliderOffset * parseInt(slider.getComputedStyle('width')) + "px";
					slider.container.setStyle('width', (slider.count + slider.cloneCount) * 200 + "%").setStyles(slider.args);
					//Timeout function to give browser enough time to get proper width initially
					setTimeout(function() {
						slider.newSlides.setStyle('width', slider.getComputedStyle('width')).setStyles({
							"float" : "left",
							"display" : "block"
						});
					}, 50);
				}

			} else {
				//Default to fade
				//Not supporting fade CSS3 transitions right now
				slider.transitions = false;
				slider.slides.setStyles({
					"width" : "100%",
					"float" : "left",
					"marginRight" : "-100%"
				}).item(slider.currentSlide).setStyles({'display' : 'block', 'opacity' : 0}).transition({opacity: 1, duration: slider.vars.animationDuration});

			}
			///////////////////////////////////////////////////////////////////
			
			///////////////////////////////////////////////////////////////////
			// FlexSlider: Control Nav
			if(slider.vars.controlNav) {
				if(slider.manualExists) {
					slider.controlNav = slider.manualControls;
				} else {
					var controlNavScaffold = Y.Node.create('<ol class="flex-control-nav"><\/ol>');
					var j = 1;

					for(var i = 0; i < slider.count; i++) {
						controlNavScaffold.append('<li><a>' + j + '<\/a><\/li>');
						j++;
					}

					if(slider.containerExists) {
						slider.controlsContainer.append(controlNavScaffold);
						slider.controlNav = slider.controlsContainer.all('.flex-control-nav li a');
					} else {
						slider.append(controlNavScaffold);
						slider.controlNav = slider.all('.flex-control-nav li a');
					}
				}

				slider.controlNav.item(slider.currentSlide).addClass('active');

				slider.controlNav.on(slider.eventType, function(event) {
					event.preventDefault();
					if(!event.currentTarget.hasClass('active')) {(slider.controlNav.indexOf(event.currentTarget) > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
						slider.flexAnimate(slider.controlNav.indexOf(event.currentTarget), slider.vars.pauseOnAction);
					}
				});
			}
			///////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider: Direction Nav
			if(slider.vars.directionNav) {
				var directionNavScaffold = Y.Node.create('<ul class="flex-direction-nav"><li><a class="prev" href="#">' + slider.vars.prevText + '<\/a><\/li><li><a class="next" href="#">' + slider.vars.nextText + '<\/a><\/li><\/ul>');

				if(slider.containerExists) {
					slider.controlsContainer.append(directionNavScaffold);
					slider.directionNav = slider.controlsContainer.all('.flex-direction-nav li a');
				} else {
					slider.append(directionNavScaffold);
					slider.directionNav = slider.all('.flex-direction-nav li a');
				}

				//Set initial disable styles if necessary
				if(!slider.vars.animationLoop) {
					if(slider.currentSlide == 0) {

						slider.directionNav.filter('.prev').addClass('disabled');
					} else if(slider.currentSlide == slider.count - 1) {

						slider.directionNav.filter('.next').addClass('disabled');
					}
				}

				slider.directionNav.on(slider.eventType, function(event) {
					event.preventDefault();
					var target = (event.currentTarget.hasClass('next')) ? slider.getTarget('next') : slider.getTarget('prev');

					if(slider.canAdvance(target)) {
						slider.flexAnimate(target, slider.vars.pauseOnAction);
					}
				});
			}
			//////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider: Keyboard Nav
			if(slider.vars.keyboardNav && Y.all('ul.slides').size() == 1) {

				function keyboardMove(event) {
					if(slider.animating) {
						return;
					} else if(event.keyCode != 39 && event.keyCode != 37) {
						return;
					} else {
						if(event.keyCode == 39) {
							var target = slider.getTarget('next');
						} else if(event.keyCode == 37) {
							var target = slider.getTarget('prev');
						}

						if(slider.canAdvance(target)) {
							slider.flexAnimate(target, slider.vars.pauseOnAction);
						}
					}
				}


				Y.one(document).on('keyup', keyboardMove);
			}
			//////////////////////////////////////////////////////////////////

			///////////////////////////////////////////////////////////////////
			// FlexSlider: Mousewheel interaction
			if(slider.vars.mousewheel) {
				slider.mousewheelEvent = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
				slider.on(slider.mousewheelEvent, function(e) {
					e.preventDefault();
					e = e ? e : window.event;
					var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40, target = (wheelData < 0) ? slider.getTarget('next') : slider.getTarget('prev');

					if(slider.canAdvance(target)) {
						slider.flexAnimate(target, slider.vars.pauseOnAction);
					}
				});
			}
			///////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider: Slideshow Setup
			if(slider.vars.slideshow) {

				//pauseOnHover
				if(slider.vars.pauseOnHover && slider.vars.slideshow) {
					slider.on({
						mouseover : function() {

							slider.pause();
						},
						mouseout : function() {

							if(!slider.manualPause) {
								slider.resume();
							}
						}
					});
				}

				//Initialize animation
				slider.animatedSlides = setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
			}
			//////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider: Pause/Play
			if(slider.vars.pausePlay)
			{
				var pausePlayScaffold = Y.Node.create('<div class="flex-pauseplay"><span><\/span><\/div>');

				if(slider.containerExists)
				{
					slider.controlsContainer.append(pausePlayScaffold);
					slider.pausePlay = slider.controlsContainer.one('.flex-pauseplay span');
				} else
				{
					slider.append(pausePlayScaffold);
					slider.pausePlay = slider.one('.flex-pauseplay span');
				}
	
				var pausePlayState = (slider.vars.slideshow) ? 'pause' : 'play';
				slider.pausePlay.addClass(pausePlayState).setContent((pausePlayState == 'pause') ? slider.vars.pauseText : slider.vars.playText);
	
				slider.pausePlay.on(slider.eventType, function(event)
				{
					event.preventDefault();
					if(event.currentTarget.hasClass('pause'))
					{
						slider.pause();
						slider.manualPause = true;
					} else
					{
						slider.resume();
						slider.manualPause = false;
					}
				});
			}
			//////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider:Touch Swip Gestures
			//Some brilliant concepts adapted from the following sources
			//Source: TouchSwipe - http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
			//Source: SwipeJS - http://swipejs.com
			if('ontouchstart' in document.documentElement) {
				//For brevity, variables are named for x-axis scrolling
				//The variables are then swapped if vertical sliding is applied
				//This reduces redundant code...I think :)
				//If debugging, recognize variables are named for horizontal scrolling
				var startX, startY, offset, cwidth, dx, startT, scrolling = false;

				if('ontouchstart' in document.documentElement) {
					slider.on('touchstart', onTouchStart);
				}

				function onTouchStart(e) {
					if(slider.animating) {
						e.preventDefault();
					} else if(e.touches.length == 1) {
						slider.pause();
						cwidth = (slider.vertical) ? slider.height() : parseInt(slider.getComputedStyle('width'));
						startT = Number(new Date());
						offset = (slider.vertical) ? (slider.currentSlide + slider.cloneOffset) * parseInt(slider.getComputedStyle('width')) : (slider.currentSlide + slider.cloneOffset) * parseInt(slider.getComputedStyle('width'));
						startX = (slider.vertical) ? e.touches[0].pageY : e.touches[0].pageX;
						startY = (slider.vertical) ? e.touches[0].pageX : e.touches[0].pageY;
						slider.setTransition(0);

						this.on('touchmove', onTouchMove);
						this.on('touchend', onTouchEnd);
					}
				}

				function onTouchMove(e) {
					dx = (slider.vertical) ? startX - e.touches[0].pageY : startX - e.touches[0].pageX;
					scrolling = (slider.vertical) ? (Math.abs(dx) < Math.abs(e.touches[0].pageX - startY)) : (Math.abs(dx) < Math.abs(e.touches[0].pageY - startY));

					if(!scrolling) {
						e.preventDefault();
						if(slider.vars.animation == "slide" && slider.transitions) {
							if(!slider.vars.animationLoop) {
								dx = dx / ((slider.currentSlide == 0 && dx < 0 || slider.currentSlide == slider.count - 1 && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1);
							}
							slider.args[slider.prop] = (slider.vertical) ? "translate3d(0," + (-offset - dx) + "px,0)" : "translate3d(" + (-offset - dx) + "px,0,0)";
							slider.container.setStyles(slider.args);
						}
					}
				}

				function onTouchEnd(e) {
					slider.animating = false;
					if(slider.animatingTo == slider.currentSlide && !scrolling && !(dx == null)) {
						var target = (dx > 0) ? slider.getTarget('next') : slider.getTarget('prev');
						if(slider.canAdvance(target) && Number(new Date()) - startT < 550 && Math.abs(dx) > 20 || Math.abs(dx) > cwidth / 2) {
							slider.flexAnimate(target, slider.vars.pauseOnAction);
						} else {
							slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction);
						}
					}

					//Finish the touch by undoing the touch session
					this.detach('touchmove', onTouchMove);
					this.detach('touchend', onTouchEnd);
					startX = null;
					startY = null;
					dx = null;
					offset = null;
				}

			}
			//////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider: Resize Functions (If necessary)
			if(slider.vars.animation.toLowerCase() == "slide") {
				Y.one(window).on('resize', function() {
					if(!slider.animating) {
						if(slider.vertical) {
							slider.setStyle('height', slider.slides.item(0).getComputedStyle('height'));
							slider.args[slider.prop] = (-1 * (slider.currentSlide + slider.cloneOffset)) * parseInt(slider.slides.item(0).getComputedStyle('height')) + "px";
							if(slider.transitions) {
								slider.setTransition(0);
								slider.args[slider.prop] = (slider.vertical) ? "translate3d(0," + slider.args[slider.prop] + ",0)" : "translate3d(" + slider.args[slider.prop] + ",0,0)";
							}
							slider.container.setStyles(slider.args);
						} else {
							slider.newSlides.setStyle('width', slider.getComputedStyle('width'));
							slider.args[slider.prop] = (-1 * (slider.currentSlide + slider.cloneOffset)) * parseInt(slider.getComputedStyle('width')) + "px";
							if(slider.transitions) {
								slider.setTransition(0);
								slider.args[slider.prop] = (slider.vertical) ? "translate3d(0," + slider.args[slider.prop] + ",0)" : "translate3d(" + slider.args[slider.prop] + ",0,0)";
							}
							slider.container.setStyles(slider.args);
						}
					}
				});
			}
			//////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
			//FlexSlider: Destroy the slider entity
			//Destory is not included in the minified version right now, but this is a working function for anyone who wants to include it.
			//Simply bind the actions you need from this function into a function in the start() callback to the event of your chosing
			/*
			slider.destroy = function() {
			slider.pause();
			if (slider.controlNav && slider.vars.manualControls == "") slider.controlNav.closest('.flex-control-nav').remove();
			if (slider.directionNav) slider.directionNav.closest('.flex-direction-nav').remove();
			if (slider.vars.pausePlay) slider.pausePlay.closest('.flex-pauseplay').remove();
			if (slider.vars.keyboardNav && $('ul.slides').length == 1) $(document).unbind('keyup', keyboardMove);
			if (slider.vars.mousewheel) slider.unbind(slider.mousewheelEvent);
			if (slider.transitions) slider.each(function(){this.removeEventListener('touchstart', onTouchStart, false);});
			if (slider.vars.animation == "slide" && slider.vars.animationLoop) slider.newSlides.filter('.clone').remove();
			if (slider.vertical) slider.height("auto");
			slider.slides.hide();
			slider.removeData('flexslider');
			}
			*/
			//////////////////////////////////////////////////////////////////

			//FlexSlider: start() Callback
			slider.vars.start(slider);
		}
		
		//FlexSlider: Animation Actions
		slider.flexAnimate = function(target, pause) {
			if(!slider.animating) {
				//Animating flag
				slider.animating = true;

				//FlexSlider: before() animation Callback
				slider.animatingTo = target;
				slider.vars.before(slider);

				//Optional paramter to pause slider when making an anmiation call
				if(pause) {
					slider.pause();
				}

				//Update controlNav
				if(slider.vars.controlNav) {
					slider.controlNav.removeClass('active').item(target).addClass('active');
				}

				//Is the slider at either end
				slider.atEnd = (target == 0 || target == slider.count - 1) ? true : false;
				if(!slider.vars.animationLoop && slider.vars.directionNav) {
					if(target == 0) {
						slider.directionNav.removeClass('disabled').filter('.prev').addClass('disabled');
					} else if(target == slider.count - 1) {
						slider.directionNav.removeClass('disabled').filter('.next').addClass('disabled');
					} else {
						slider.directionNav.removeClass('disabled');
					}
				}

				if(!slider.vars.animationLoop && target == slider.count - 1) {
					slider.pause();
					//FlexSlider: end() of cycle Callback
					slider.vars.end(slider);
				}

				if(slider.vars.animation.toLowerCase() == "slide") {
					// filter(':first-child') returns undefined (not bound to any node)
					var dimension = (slider.vertical) ? slider.slides.item(0).getComputedStyle('height') : slider.slides.item(0).getComputedStyle('width');
					// getComputedStyle returns string instead of integer
					dimension = parseInt(dimension);

					if(slider.currentSlide == 0 && target == slider.count - 1 && slider.vars.animationLoop && slider.direction != "next") {
						slider.slideString = "0px";

					} else if(slider.currentSlide == slider.count - 1 && target == 0 && slider.vars.animationLoop && slider.direction != "prev") {
						slider.slideString = (-1 * (slider.count + 1)) * dimension + "px";

					} else {
						slider.slideString = (-1 * (target + slider.cloneOffset)) * dimension + "px";
					}
					slider.args[slider.prop] = slider.slideString;

					if(slider.transitions) {
						slider.setTransition(slider.vars.animationDuration);
						slider.args[slider.prop] = (slider.vertical) ? "translate3d(0," + slider.slideString + ",0)" : "translate3d(" + slider.slideString + ",0,0)";
						slider.container.setStyles(slider.args).once(['webkitTransitionEnd', 'transitionend'], function() {
							slider.wrapup(dimension);
						});
					} else {
						
						slider.container.transition(Y.merge(slider.args, {duration : slider.vars.animationDuration}), function () {
							slider.wrapup(dimension);	
						});
					}
				} else {
					//Default to Fade
					slider.slides.item(slider.currentSlide).hide('fadeOut', {duration: slider.vars.animationDuration});
					slider.slides.item(target).setStyles({'display' : 'block', 'opacity' : 0}).transition({opacity : 1, duration: slider.vars.animationDuration}, function () 
					{
						slider.wrapup();
					});
				}
			}
		}
		//FlexSlider: Function to minify redundant animation actions
		slider.wrapup = function(dimension) {
			if(slider.vars.animation == "slide") {
				//Jump the slider if necessary
				if(slider.currentSlide == 0 && slider.animatingTo == slider.count - 1 && slider.vars.animationLoop) {
					slider.args[slider.prop] = (-1 * slider.count) * dimension + "px";
					if(slider.transitions) {
						slider.setTransition(0);
						slider.args[slider.prop] = (slider.vertical) ? "translate3d(0," + slider.args[slider.prop] + ",0)" : "translate3d(" + slider.args[slider.prop] + ",0,0)";
					}
					slider.container.setStyles(slider.args);
				} else if(slider.currentSlide == slider.count - 1 && slider.animatingTo == 0 && slider.vars.animationLoop) {
					slider.args[slider.prop] = -1 * dimension + "px";
					if(slider.transitions) {
						slider.setTransition(0);
						slider.args[slider.prop] = (slider.vertical) ? "translate3d(0," + slider.args[slider.prop] + ",0)" : "translate3d(" + slider.args[slider.prop] + ",0,0)";
					}
					slider.container.setStyles(slider.args);
				}
			}

			slider.animating = false;
			slider.currentSlide = slider.animatingTo;
			//FlexSlider: after() animation Callback
			slider.vars.after(slider);
		}
		//FlexSlider: Automatic Slideshow
		slider.animateSlides = function() {
			if(!slider.animating) {
				slider.flexAnimate(slider.getTarget("next"));
			}
		}
		//FlexSlider: Automatic Slideshow Pause
		slider.pause = function() {
			clearInterval(slider.animatedSlides);
			if(slider.vars.pausePlay) {
				slider.pausePlay.removeClass('pause').addClass('play').setContent(slider.vars.playText);
			}
		}
		//FlexSlider: Automatic Slideshow Start/Resume
		slider.resume = function() {
			slider.animatedSlides = setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
			if(slider.vars.pausePlay) {
				slider.pausePlay.removeClass('play').addClass('pause').setContent(slider.vars.pauseText);
			}
		}
		//FlexSlider: Helper function for non-looping sliders
		slider.canAdvance = function(target) {
			if(!slider.vars.animationLoop && slider.atEnd) {
				if(slider.currentSlide == 0 && target == slider.count - 1 && slider.direction != "next") {
					return false;
				} else if(slider.currentSlide == slider.count - 1 && target == 0 && slider.direction == "next") {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		}
		//FlexSlider: Helper function to determine animation target
		slider.getTarget = function(dir) {
			slider.direction = dir;
			if(dir == "next") {
				return (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
			} else {
				return (slider.currentSlide == 0) ? slider.count - 1 : slider.currentSlide - 1;
			}
		}
		//FlexSlider: Helper function to set CSS3 transitions
		slider.setTransition = function(dur) {
			slider.container.setStyles({
				'-webkit-transition-duration' : (dur) + "s"
			});
		}	
		//FlexSlider: Initialize
		slider.init();
	};
	
	//FlexSlider: Default Settings
	flexslider.defaults = {
		animation : "fade", //String: Select your animation type, "fade" or "slide"
		slideDirection : "horizontal", //String: Select the sliding direction, "horizontal" or "vertical"
		slideshow : false, //Boolean: Animate slider automatically
		slideshowSpeed : 4000, //Integer: Set the speed of the slideshow cycling, in milliseconds
		animationDuration : 0.6, //Integer: Set the speed of animations, in seconds
		directionNav : true, //Boolean: Create navigation for previous/next navigation? (true/false)
		controlNav : true, //Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
		keyboardNav : false, //Boolean: Allow slider navigating via keyboard left/right keys
		mousewheel : false, //Boolean: Allow slider navigating via mousewheel
		prevText : "Previous", //String: Set the text for the "previous" directionNav item
		nextText : "Next", //String: Set the text for the "next" directionNav item
		pausePlay : false, //Boolean: Create pause/play dynamic element
		pauseText : 'Pause', //String: Set the text for the "pause" pausePlay item
		playText : 'Play', //String: Set the text for the "play" pausePlay item
		randomize : false, //Boolean: Randomize slide order
		slideToStart : 0, //Integer: The slide that the slider should start on. Array notation (0 = first slide)
		animationLoop : true, //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
		pauseOnAction : true, //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
		pauseOnHover : true, //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
		controlsContainer : "", //Selector: Declare which container the navigation elements should be appended too. Default container is the flexSlider element. Example use would be ".flexslider-container", "#container", etc. If the given element is not found, the default action will be taken.
		manualControls : "", //Selector: Declare custom control navigation. Example would be ".flex-control-nav li" or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
		start : function() {
		}, //Callback: function(slider) - Fires when the slider loads the first slide
		before : function() {
		}, //Callback: function(slider) - Fires asynchronously with each slider animation
		after : function() {
		}, //Callback: function(slider) - Fires after each slider animation completes
		end : function() {
		}  //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
	}

}, '0.9', {
	requires : ['node', 'transition', 'event-gestures']
});
