---
layout: portfolio_project
tier: 1
title: D3.js Colorpicker
categories: code
materials: HTML, CSS, D3.js
skills: coding, color theory, UX design

asset_dir: /assets/img/d3js-colorpicker
---

In late November 2018 I made a color picker to explore the Hue-Saturation-Lightness color space with D3.js.

Tap around below to use it, then scroll to read why I made it!

----

<p data-height="550" data-theme-id="light" data-slug-hash="GwXePP" data-default-tab="result" data-user="franknoirot" data-pen-title="d3.js Colorpicker" class="codepen">See the Pen <a href="https://codepen.io/franknoirot/pen/GwXePP/">d3.js Colorpicker</a> by Frank Noirot (<a href="https://codepen.io/franknoirot">@franknoirot</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

----

Color spaces are fascinating to me because they reveal the complexity underlying something so familiar a intuitive to us, color. Most people in the digital age are quite comfortable using tools like the colorpicker in Adobe Creative products, but so often we don't know that in order to make a tool like that we have to understand and map out all the possible colors in that space. How we design the tool affects the metaphors users employ to understand the system.

With this I tried to make the color space of HSL feel more immediately understandable. Adobe's colorpicker consists of a square mapping the Saturation in the X direction and Lightness in the Y for a given Hue. A rectangular bar to the right of this square lets the user select the Hue, always showing the rainbow of Hue values at S = 100% and L = 50%.

----

![Adobe's colorpicker, snipped from Adobe Illustrator.]({{ page.asset_dir }}/adobe-colorpicker.jpg){: .img-fluid }

----

This arrangement is useful and quick to use, but hides some truths about the HSL color space's reality. With this layout, you might think that the HSL color space is a cube or prism, just extending the square of Saturation-Lightness vertically along a Hue axis. But this prism is red at both ends: if we want to move from orange to purple we feel like we're teleporting!

----

![Diagram of the color space model implied by the Adobe Color Picker.]({{ page.asset_dir }}/adobe-colorspace.jpg){: .img-fluid }

----

This is because the HSL color space is [best represented as a __bicone__](https://en.wikipedia.org/wiki/HSL_and_HSV), which is essentially two cones attached at the bottom. Hue is measured in degrees about the circle of the cones, Saturation by the distance from the circle's center, and Lightness is actually that vertical dimension along the bicone. This space lets us move between any color values without discontinuities, it is _compact_.

----

<p><a href="https://commons.wikimedia.org/wiki/File:HSL_color_solid_dblcone_chroma_gray.png#/media/File:HSL_color_solid_dblcone_chroma_gray.png"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/HSL_color_solid_dblcone_chroma_gray.png" class='img-fluid' alt="HSL color solid dblcone chroma gray.png" height="480" width="640"></a><br><em>By <a href="//commons.wikimedia.org/wiki/File:Hcl-hcv_models.svg" title="File:Hcl-hcv models.svg">Hcl-hcv_models.svg</a>: <a href="//commons.wikimedia.org/wiki/User:Jacobolus" title="User:Jacobolus">Jacob Rus</a>
<a href="//commons.wikimedia.org/wiki/File:HSL_color_solid_dblcone.png" title="File:HSL color solid dblcone.png">HSL_color_solid_dblcone.png</a>: <a href="//commons.wikimedia.org/wiki/User:SharkD" class="mw-redirect" title="User:SharkD">SharkD</a></em></p>

----

My color picker tries to acknowledge the true shape of the color space we're exploring, while remaining useful and intuitive. The circle is a cross section of the bicone at the given lightness value, and the radius of the circle shrinks as you move away from Lightness = 50%.

This arrangement makes tangible one concept that isn't present in the Adobe one: __that the selection of perceivably different colors shrinks as you get lighter or darker from the middle!__

[Let me know what you think!]({{ site.email }}) Is this easy to use or more confusing than the standard color picker?
