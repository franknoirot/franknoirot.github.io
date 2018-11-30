---
layout: post
title: Jekyll Slideshows Using Bootstrap 4 Carousels
categories: code
featured_image: jekyll-bootstrap-carousel.jpg
description: Building a slideshow module using a Jekyll include, simple Bootstrap, and simple images. No plugins!

asset_dir: /assets/img/osu-crp-thesis-slides
carousel:
  file_type: .jpg

---

Today I built a little _include file to create slideshows on my Jekyll site that is dead simple, and more importantly to me, that looks clean and readable in Markdown.

Jekyll's blogging functionality is wonderful. writing simple Markdown files is so much prettier than HTML pages, and hopefully someday will let me add posts to my static site from my phone's notepad.

But I have to constantly fight the urge to just elbow in HTML whenever I want something beyond simple text and images, which seems to be every post I write.

So when I went to embed my findings presentation into my portfolio post on my Undergraduate Research Thesis, I challenged myself to embed the slideshow with just one line of an include. Here's my code in action:

{% include carousel.html start='1' end='5' %}

---
This simple line is the include in my Markdown file:

{% raw %}
`{% include carousel.html start='1' end='5' %}`
{% endraw %}

The secret power of this include file `carousel.html` is the YML variables that I've tucked into the frontmatter of this Markdown post:

```yml
carousel:
  asset_dir: /assets/img/osu-crp-thesis-slides
  slides: 5
  file_type: .jpg
```

Now you can start to infer what `carousel.html` is going to do. It will populate a slider with a series of images in the directory assigned to `asset_dir`, of which there seem to be `5`, and all of them must be `.jpg` files.

In the course of building this I learned that the Liquid language that powers Jekyll [doesn't have I/O power to read a directory and loop over the contents intelligently](https://stackoverflow.com/questions/17446472/how-to-list-files-in-a-directory-with-liquid/31885127). This is why we have to do the dumb thing and explicitly tell Liquid how many slides we're going to loop over. However, one cool upshot of this manually defined variable is that excerpting a slideshow is easy. For example, the slideshow above isn't actually 5 slides, but **49!** I limited the number of slides rendered by controlling this variable.

The other side of this system is my directory structure, which is simply naming each file by its slide number, ex. `5.jpg`. This will make looping over the images very straightforward, and I still have my images partitioned into different directories so I don't mind having multiple `1.jpg` files across my site.

Now let's check out `carousel.html`:

{% raw %}
```html
{% if page.carousel %}
{% capture slideSlug %}{{ page.slug }}--slideshow{% endcapture %}
<div id="{{ slideSlug }}" class="carousel slide" data-ride="carousel">
  <ol class="carousel-indicators">
    {% assign slides = page.carousel.slides %}
    {% for slide in (1..slides) %}
    <li data-target="#{{ slideSlug }}" data-slide-to="{{ slide-1 }}" {% if slide == 1 %}class="active"{% endif %}></li>
    {%  endfor %}
  </ol>
  <div class="carousel-inner">
    {% for slide in (1..slides) %}
    <div class="carousel-item {% if slide == 1 %}active{% endif %}">
      <img class="d-block w-100" src="{{ page.carousel.asset_dir }}/{{ slide }}{{ page.carousel.file_type }}" alt="{{ page.title }} Slideshow: Page {{ forloop.index }}">
    </div>
    {% endfor %}
  </div>
  <a class="carousel-control-prev" href="#{{ slideSlug }}" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" href="#{{ slideSlug }}" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
  </a>
</div>
{% endif %}
```
{% endraw %}

{% raw %}
Remember that Jekyll uses HTML peppered with Liquid tags to provide variables and logic. Anywhere you see `{{ foo }}` a Liquid variable is being referenced, and `{% bar %}` is some Liquid logic, like If statements or For loops.
{% endraw %}

The other stuff is HTML, specifically [the Carousel component with controls and indicators from Bootstrap 4](https://getbootstrap.com/docs/4.0/components/carousel/#with-indicators). Click the link; I really just lifted this code straight from there and tweaked it!

Here's what my code does to make carousel abstracted to be used on any page with any images:
  1. Make sure the page asking for a carousel has the `:carousel` YML variable defined before we start building broken stuff.
  2. Name the carousel we're building by making the id unique by the `page.slug` variable
  3. Loop over the `<li>` elements that power the carousel by iterating over the range `(1..page.carousel.slides)`
  4. In a new loop for the inner contents of the carousel, iterate over the same range. This time we grab our images by concatenating `page.carousel.asset_dir`, `slide` (which is an index number), and `page.carousel.file_type`

If you're using Jekyll and Bootstrap 4 for your website, feel free to use the code above to create your own slideshow pipeline without any external plugins! If you're an experienced developer, [let me know]({{ site.email }}) if I'm doing anything that looks like nails on a chalkboard to you. I'm still learning this web development stuff!
