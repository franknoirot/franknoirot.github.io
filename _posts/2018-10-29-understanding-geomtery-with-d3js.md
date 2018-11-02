---
layout: post
title: Understanding Geometry with D3.js
categories: code
excerpt: Recently in my internet wanderings I came across a Wiki page on a geometry principle known as Thales's Theorem.
---

In my internet wanderings I came across a Wiki page on a geometry principle known as [Thales's Theorem](https://en.wikipedia.org/wiki/Thales%27s_theorem). It caught my eye because its creator inspired the name of one of the [biggest partners](https://www.thalesgroup.com/en) of my employer, [Iridium Satellite](https://iridium.com).

This little toy application was made using only CSS and [D3.js](http://d3js.org/) Drag the three points around the circle to get used to how the system works!

---

<p data-height="600" data-theme-id="0" data-slug-hash="BqxzRv" data-default-tab="result" data-user="franknoirot" data-pen-title="Thales Theorem" class="codepen">See the Pen <a href="https://codepen.io/franknoirot/pen/BqxzRv/">Thales Theorem</a> by Frank Noirot (<a href="https://codepen.io/franknoirot">@franknoirot</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

---

Before we get to Thales, lets describe the general version of his theorem, which is called the [Inscribed Angle Theorem](https://en.wikipedia.org/wiki/Inscribed_angle_theorem). It's definition is super wonky, but its _implication_ is that for any triangle inscribed into a circle, sweeping one angle along the circle while keeping the other two points fixed, __the sweeping angle will always stay the same!__

Isn't that kind of wild? Maybe its because my school skipped Geometry for my year (true story), but this blew my mind in the small way things do when you glimpse a deep true mathematical relationship.

Now that you've got the general case of the sweeping angle down, I want you to pull a Thales and position one side of the triangle so that it runs straight through the dot in the center of the circle. __The angle across from that line will always be exactly 90&deg;!__ Whew, people are so smart. But there's more to explore here.

Notice, for example that the angle you sweep along the circle _always stays the same, not just for the 90&deg; case mentioned above_. This is called the , which is the more generalized case of the one posed by Thales.

Or notice how in essence, the sweeping angle is in some ways _a simple proportion of the circle that is bisected by the line across it_. The more of the circle chopped across by a side of the triangle, the bigger the angle across from it, approaching but never reaching 180&deg;. This sideles into the fundamental nature of how cosine and sine relate triangles to circles, and for the first time I felt those concepts in a visceral way.

This was a blast of a little project to work on. Not only did I start to learn about optimizing code, and abstraction principles, but I am understanding what gets [Bret Victor](http://worrydream.com/LadderOfAbstraction/) [so excited](https://dynamicland.org/) about what he calls ["The Dynamic Medium"](http://worrydream.com/#!/MediaForThinkingTheUnthinkable). Now when I fall down the Wiki rabbit hole, I'm looking for new systems that I can better understand through interactivity. [Let me know]({{ site.email }}) if you've found anything you want to model!
