---
layout: post
title: Scrubbable Shapes
categories: code
featured_image: scrubbable-shapes.JPG
excerpt: Let's explore how Bret Victor's work on mathematical UX applies to geometry generated with D3.js.
---

Brett Victor's work has been on my mind a lot this week. His essay _[Up And Down The Ladder of Abstraction](http://worrydream.com/#!2/LadderOfAbstraction)_ is something I consider a must-read, and his [Scrubbing Calculator](http://worrydream.com/ScrubbingCalculator/) essay as a part of the series [Kill Math](http://worrydream.com/#!/KillMath) is filled with tons of specific visual user experience questions I'd like to explore, because to my surprise not much attention seems to have been paid it since 2011.

First among them is the _scrub_ gesture for which the essay is named. In his proposed visual math system, any number on the screen can be adjusted either with the keyboard, or by clicking and dragging on the value: scrubbing. He proposes that making this gesture native, along with several much more novel interactions like linking values together, would make our math more embodied, and maybe help more people digest mathematical concepts. Here's a video from _Scrubbing Calculator_ showing how it works:

<div style="text-align: center; margin-bottom: 1rem;">
	<video id="va" style='width: 100%; max-width: 420px; max-height: 100;' controls autoplay>
		<source src="http://worrydream.com/ScrubbingCalculator/Movies/TripAdjust.mov" type="video/quicktime">
		<source src="http://worrydream.com/ScrubbingCalculator/Movies/TripAdjust.webm" type="video/webm">
	</video>
</div>

I agree that there is something to explore here. So with some guidance from [Michael Nielsen's notes on Victor's essay](http://mnielsen.github.io/notes/kill_math/kill_math.html) I'd like to explore some of those small, specific questions lurking in the scrub gesture.

I'm no mathematician, but I do make things that deal with a lot of geometry. So here I'll be exploring what scrubbing can offer shapes. My first thought is that they can be used to drive the dimensions of a shape or drawing in a curated way as _sketch dimensions_.

I make furniture pretty often, and I would like to start doing the occasional commissioned piece. __Wouldn't it be cool if I could let customers tweak a some of a furniture design's dimensions live with a simple scrub of a value?__

Maybe just my kind of cool? Whatever, I'm still gonna make it.

Eventually I will make this into a tool for [THREE.js](http://threejs.org), where I can embed annotations into whichever dimensions I want, and the user will be able to tweak while viewing in 3D. But we can build to that from a 2D. So let's start with the simplest geometry: a line.

To scrub the width of the line, simply click and drag on the variable name! You can tweak `length` in smaller increments by holding `Ctrl` (`Cmd` on Mac) before clicking and dragging.

{% include scrubbable-line.html %}

---

### This essay is still under construction!
From here on out is my _pseudocode_ for the next steps I want to take. Along the way, I'll be abstracting out the javascript to work for arbitrary SVG elements, but for now it is _[nasty](/assets/js/scrubbable-line.js)_. Wish me luck!

...To change from scrub to tweak on mobile, do what I call "pin & drag". Pin the variable by holding a finger on it, then drag with another.

Next, let's control a rectangle with two scrubbers.

_//insert scrubbable rectangle_

Because this is built up in a modular way, we can now tweak **an arbitrary number of variables on a 2D graphic!**

_// insert front of desk outline with scrubbable variables_

This UI has a bit more going on behind the scenes. Before the annotation renders, it first determines how much space it has to unfold. if there's no room for a full brace and variable name, it collapses to a small pin with `fx` inside to show this dimension is scrubbable. Let me know if it's intuitive to use!

One more piece makes this a viable first step for my custom furniture tool. Three tabs labelled _Top, Front, & Side_ allow me to get at least a good proxy representation of the 3D piece, and the variable scrubbing affects dimensions between the different panes.

_//insert three pane furniture scrubber_
