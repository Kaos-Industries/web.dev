---
layout: post
title: Simplify paint complexity and reduce paint areas
subhead: |
  Paint is the process of filling in pixels that eventually get composited to the users' screens. It is often the longest-running of all tasks in the pipeline, and one to avoid if at all possible.
authors:
  - paullewis
date: 2015-03-20
updated: 2019-07-10
description: |
  Paint is the process of filling in pixels that eventually get composited to the users' screens. It is often the longest-running of all tasks in the pipeline, and one to avoid if at all possible.
tags:
  - blog # blog is a required tag for the article to show up in the blog.

---

Paint is the process of filling in pixels that eventually get composited to 
the users' screens. It is often the longest-running of all tasks in the 
pipeline, and one to avoid if at all possible.

## TL;DR

* Changing any property apart from transforms or opacity always triggers paint.
* Paint is often the most expensive part of the pixel pipeline; avoid it where you can.
* Reduce paint areas through layer promotion and orchestration of animations.
* Use the Chrome DevTools paint profiler to assess paint complexity and cost; reduce where you can.

## Triggering Layout And Paint

If you trigger layout, you will _always trigger paint_, since changing the geometry of any element means its pixels need fixing!

<figure>
{% Img src="image/T4FyVKpzu4WKF1kBNvXepbi08t52/VG9K1de3NXF6wIz5vAaM.jpg", alt="The full pixel pipeline.", width="800", height="122" %}
</figure>

You can also trigger paint if you change non-geometric properties, like backgrounds, text color, or shadows. In those cases layout won’t be needed and the pipeline will look like this:

<figure>
{% Img src="image/T4FyVKpzu4WKF1kBNvXepbi08t52/3NbVKqelM3UPaIwlneYU.jpg", alt="The pixel pipeline without layout.", width="800", height="122" %}
</figure>

## Use Chrome DevTools to quickly identify paint bottlenecks

You can use Chrome DevTools to quickly identify areas that are being painted. [Open the Rendering tab][renderingtab]
and then enable **Paint Flashing**.

With this option switched on Chrome will flash the screen green whenever painting happens. If you’re seeing the whole screen flash green, or areas of the screen that you didn’t think should be painted, then you should dig in a little further.

<figure>
{% Img src="image/T4FyVKpzu4WKF1kBNvXepbi08t52/FslYBjuttmtVUCAq3y0n.png", alt="The page flashing green whenever painting occurs.", width="800", height="521" %}
</figure>

## Promote elements that move or fade

Painting is not always done into a single image in memory. In fact, it’s possible for the browser to paint into multiple images, or compositor layers, if necessary.

<figure>
{% Img src="image/T4FyVKpzu4WKF1kBNvXepbi08t52/z821UCTV7erbUxsIABkf.jpg", alt="A representation of compositor layers.", width="800", height="688" %}
</figure>

The benefit of this approach is that elements that are regularly repainted, or are moving on screen with transforms, can be handled without affecting other elements. This is the same as with art packages like Sketch, GIMP, or Photoshop, where individual layers can be handled and composited on top of each other to create the final image.

The best way to create a new layer is to use the `will-change` CSS property. This will work in Chrome, Opera and Firefox, and, with a value of `transform`, will create a new compositor layer:

```css
.moving-element {
  will-change: transform;
}
```

For browsers that don’t support `will-change`, but benefit from layer creation, such as Safari and Mobile Safari, you need to (mis)use a 3D transform to force a new layer:

```css
.moving-element {
  transform: translateZ(0);
}
```

Care must be taken not to create too many layers, however, as each layer requires both memory and management. There is more information on this in the [Stick to compositor-only properties and manage layer count](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count) section.

If you have promoted an element to a new layer, use DevTools to confirm that doing so has given you a performance benefit. **Don't promote elements without profiling.**

## Reduce paint areas

Sometimes, however, despite promoting elements, paint work is still necessary. A large challenge of paint issues is that browsers union together two areas that need painting, and that can result in the entire screen being repainted. So, for example, if you have a fixed header at the top of the page, and something being painted at the bottom of the screen, the entire screen may end up being repainted.

Note: On High DPI screens elements that are fixed position are automatically promoted to their own compositor layer. This is not the case on low DPI devices because the promotion changes text rendering from subpixel to grayscale, and layer promotion needs to be done manually.

Reducing paint areas is often a case of orchestrating your animations and transitions to not overlap as much, or finding ways to avoid animating certain parts of the page.

## Simplify paint complexity

<figure>
  {% Img src="image/T4FyVKpzu4WKF1kBNvXepbi08t52/NMsTYj8K5odtsK3FvEVU.jpg", alt="The time taken to paint part of the screen.", width="248", height="181" %}
</figure>

When it comes to painting, some things are more expensive than others. For example, anything that involves a blur (like a shadow, for example) is going to take longer to paint than -- say -- drawing a red box. In terms of CSS, however, this isn’t always obvious: `background: red;` and `box-shadow: 0, 4px, 4px, rgba(0,0,0,0.5);` don’t necessarily look like they have vastly different performance characteristics, but they do.

The paint profiler above will allow you to determine if you need to look at other ways to achieve effects. Ask yourself if it’s possible to use a cheaper set of styles or alternative means to get to your end result.

Where you can you always want to avoid paint during animations in particular, as the **10ms** you have per frame is normally not long enough to get paint work done, especially on mobile devices.

[renderingtab]: https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference#rendering