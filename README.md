# Getting started
##Step 1 - Link files

Add these items to the <head> of your document. This will link YUI 3 and the FlexSlider core CSS/JS files into your webpage.
```html
<!-- Place somewhere in the <head> of your document -->
<link rel="stylesheet" href="flexslider.css" type="text/css">
<script src="http://yui.yahooapis.com/3.4.1/build/yui/yui-min.js"></script>
<script src="yui.flexslider.js"></script>
```

##Step 2 - Add markup

The YUI 3 FlexSlider markup is simple and straightforward. First, start with a single containing element, <div class="flexslider"> in this example. Then, create a <ul class="slides">. It is important to use this class because the slider targets that class specifically. Put your images and anything else you desire into each <li> and you are ready to rock.
```html
<!-- Place somewhere in the <body> of your page -->
<div class="flexslider">
  <ul class="slides">
    <li>
      <img src="slide1.jpg" />
    </li>
    <li>
      <img src="slide2.jpg" />
    </li>
    <li>
      <img src="slide3.jpg" />
    </li>
  </ul>
</div>
```

##Step 3 - Hook up the slider

Lastly, add the following lines of Javascript into the <head> of your document, below the links from Step 1. The Y.on('domread', function() {}); is required to ensure the content of the page is loaded before the plugin initializes.

```html
<!-- Place in the <head>, after the three links -->
<script type="text/javascript" charset="utf-8">
	YUI().use('flexslider', function(Y)
	{
		Y.on('domready', function () {
			Y.all('.flexslider').flexslider();
		});
	});
</script>
```

and you are good to go!

##Step 4 - Advanced Options

Listed below are all of the options available to customize YUI 3 FlexSlider to suite your needs, along with their default values. For examples on how to use these properties for advanced setups, check out the demo.html file.
Note however, that the randomize function isn't available yet for YUI 3 FlexSlider. Help me to do so if you want!

```javascript
animation: "fade",              //String: Select your animation type, "fade" or "slide"
slideDirection: "horizontal",   //String: Select the sliding direction, "horizontal" or "vertical"
slideshow: true,                //Boolean: Animate slider automatically
slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
animationDuration: 600,         //Integer: Set the speed of animations, in milliseconds
directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
keyboardNav: true,              //Boolean: Allow slider navigating via keyboard left/right keys
mousewheel: false,              //Boolean: Allow slider navigating via mousewheel
prevText: "Previous",           //String: Set the text for the "previous" directionNav item
nextText: "Next",               //String: Set the text for the "next" directionNav item
pausePlay: false,               //Boolean: Create pause/play dynamic element
pauseText: 'Pause',             //String: Set the text for the "pause" pausePlay item
playText: 'Play',               //String: Set the text for the "play" pausePlay item
/*randomize: false,               //Boolean: Randomize slide order*/
slideToStart: 0,                //Integer: The slide that the slider should start on. Array notation (0 = first slide)
animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
controlsContainer: "",          //Selector: Declare which container the navigation elements should be appended too. Default container is the flexSlider element. Example use would be ".flexslider-container", "#container", etc. If the given element is not found, the default action will be taken.
manualControls: "",             //Selector: Declare custom control navigation. Example would be ".flex-control-nav li" or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
end: function(){}               //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
```
#Advanced Options

## Custom Callback functions

If you have images or any kind of content that have different heights, you can use these custom functions, to adapt the height of the Flexslider to the height of the content automatically:

```html
<script type="text/javascript" charset="utf-8">
YUI().use('flexslider', function(Y)
{
	Y.on('domready', function () {
		Y.all('.flexslider').flexslider({
			start : function(slider) {
				// Timeout to give Browser enough time to calculate new height after DOM Manipulations
				setTimeout(function() {
					slider.setStyle('height', slider.slides.item(slider.currentSlide).getComputedStyle('height'));
				}, 50);
			}, //Callback: function(slider) - Fires when the slider loads the first slide
			before : function(slider) {
				// Timeout to give Browser enough time to calculate new height after DOM Manipulations
				setTimeout(function() {
					slider.transition({duration : 0.3, height : slider.slides.item(slider.animatingTo).getComputedStyle('height')});
				}, 50);
			}, //Callback: function(slider) - Fires asynchronously with each slider animation
		});
	});
});
</script>
```

## multiple instances

YUI 3 FlexSlider is able to handle multiple instances of the flexslider on the same page. You can even define different properties for different sliders like this:

```html
<script type="text/javascript" charset="utf-8">
YUI().use('flexslider', function(Y)
{
	Y.on('domready', function () {
		Y.all('.slider1').flexslider({
			animation: 'slide',
			controlsContainer: '.flexslider-wrapper-1'
		});
		
		Y.all('.slider2').flexslider({
			animation: 'fade',
			slideshow: 'true'
		});
	});
});
</script>
```