# Carousel

Basic usage:

    <Carousel snap>
        {items.map((item, i) => (
            <Item key={i} {...item} />
        ))}
    </Carousel>

## Known issues

- Finite non-snapping carousels are currently buggy, they can be dragged off screen. Avoid.
- Snap back and rubberbanding mostly works, but needs fine-tuning.
- Throws when you try to render an infinite carousel with too few items.

## API

The carousel is configured via component props (general stuff like infinte, snap etc),
and CSS custom props (things that must be responsive like gap, item width, snap position etc).

### Props

- `infinite` (bool, default: false)
- `snap` (bool, default: false)
- `align` (string, start or center, default: start)
- `damping` (number, default: 200)
- `as` (string, default: ul)
- `childAs` (string, default: li)
- `onActiveItemIndexChange` (function)
- `className` (string)
- `itemClassName` (string)
- `style` (object)
- `children`

### CSS Custom Properties

- `--carousel-gap` (length value, default: 0)
  The gap between items.
- `--carousel-snap-position` (length value, default: 0)
- `--carousel-snap-position-start` (length value, default: 0)
- `--carousel-snap-position-end` (length value, default: 0)
  The position from the left edge (start) and right edge (end) of the container
  to snap to (snap-position is a "shorthand", it sets both snap-position-start
  and snap-position-end). Depends on the align prop. If align is start, the left edge of
  the item snaps to snap-position-start. If align is center, the item is centered
  on snap-position-start.
- `--carousel-item-width` (length value, default: 0)
  If set, the carousel expects all items to be of that width. If not set, it
  queries the bounding rects of all items to get their widths.
- `--carousel-autoscroll` (number, default: 0)
  If set to a value !== 0, the carousel will auto-scroll. The number specified
  is in pixels per millisecond.
- `--carousel-disabled` (0 or 1, default: 0)
  If set to 1, the carousel is completely disabled, and all internal styles are
  removed. This allows you to, for example, render items as a carousel on small
  screens, and in a fixed grid on large breakpoints.

These properties are automatically read and applied on mount and on resize of
the container. If any of the values are changed manually for some reason, call
`refresh()` on the component.

Length values can be any valid CSS length value, be it px, rem, % etc.
Even var() and/or calc() are allowed. Percentages etc are relative to the
container's width.

### Methods

- `refresh()`
- `moveIntoView(itemIndex)`

## Default CSS

    .root:not([class~='disabled']) {
        display: grid;
        position: relative;
        overflow: hidden;
    }

    .item {
        grid-area: 1 / -1;
        width: fit-content;
        will-change: transform;
        transform: translate3d(-99999px, 0, 0);
        user-select: none;

        img {
            pointer-events: none;
        }
    }
