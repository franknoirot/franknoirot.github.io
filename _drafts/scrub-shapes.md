---
layout: post
title: Scrubbable Shapes
categories: code
excerpt: Let's explore how Bret Victor's work on mathematical UX applies to geometry generated with D3.js.
---

I can't stop thinking about the mathematical UX work done by [Brett Victor](worrydream.com/#!/KillMath), and the even more in-depth response by [Michael Nielsen](http://mnielsen.github.io/notes/kill_math/kill_math.html). I'm particularly stuck on this bit from Nielsen under the section "Moving Theorems Into the User Interface":
> That is we should move theorems into the user interface. Tipping it upside down, we can view theorems as challenges to develop a user interface which reifies those theorems in a powerful way, providing the user with cues that help them reason, and representing mathematical objects in ways that help suggest the relevant operations and relationships.

I have been surprised on how few people seemed to build directly on their work from 2012, especially in ways that are opensource and toolbox-ready. I want to explore some of the atomic UX problems Nielsen poses in his notes in the coming months, particularly creating a gesture for instantly graphing an equation, built to work with [MathJax](mathjax.org).

But I see a branch of this problem that could help me more directly in my furniture and product design work. What if I could present a model of a furniture piece in the browser, and allow a user to __customize certain dimensions live by scrubbing its annotations?__ When they're happy with the dimensions they've found, they would then be able to submit it to me as a commission request with a simple button press.

Eventually I will make this into a tool for [THREE.js](threejs.org), where I can embed "scrubbable" triggers into whichever dimensions I want, and the user will be able to tweak while viewing in 3D. But we can build to that from a 2D. So let's start with the simplest geometry: a line.

To scrub the width of the line, simply click and drag on the variable name!

_insert scrubbable line_

You can tweak `length` in smaller increments by holding Ctrl (Cmd on Mac) before clicking and dragging. This is bit newer on mobile, what I call "pin & drag". Pin the variable by holding a finger on one variable, then drag with another to tweak.

Next, let's control a rectangle with two scrubbers.

_insert scrubbable rectangle_

Because this is built up in a modular way, we can now tweak **an arbitrary number of variables on a 2D graphic!**

// insert front of desk outline with scrubbable variables

This UI has a bit more going on behind the scenes. Before the annotation renders, it first determines how much space it has to unfold. if there's no room for a full brace and variable name, it collapses to a small pin with `fx` inside to show this dimension is scrubbable. Let me know if it's intuitive to use!

One more piece makes this a viable first step for my custom furniture tool. Three tabs labelled _Top, Front, & Side_ allow me to get at least a good proxy representation of the 3D piece, and the variable scrubbing affects dimensions between the different panes.

_insert three pane furniture scrubber_
