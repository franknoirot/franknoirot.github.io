
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        const invalidators = [];
        const store = readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                run_all(invalidators);
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
        return {
            subscribe(run, invalidate = noop) {
                invalidators.push(invalidate);
                const unsubscribe = store.subscribe(run, invalidate);
                return () => {
                    const index = invalidators.indexOf(invalidate);
                    if (index !== -1) {
                        invalidators.splice(index, 1);
                    }
                    unsubscribe();
                };
            }
        };
    }

    let hsbStore = {
    	h: writable(271),
    	s: writable(60),
    	b: writable(50)
    };

    let {h, s, b} = hsbStore;

    let hslStore = {
    	h: derived([h, s, b], ([$h, $s, $b]) => hsbToHSL($h, $s, $b).h),
    	s: derived([h, s, b], ([$h, $s, $b]) => hsbToHSL($h, $s, $b).s),
    	l: derived([h, s, b], ([$h, $s, $b]) => hsbToHSL($h, $s, $b).l)
    };

    function clamp(num, min, max) {
    	return num <= min ? min : num >= max ? max : num;
    }

    function toTwoDecimals(num) {
    	return Math.round(num * 100) / 100
    }
    	
    function hsbToHSL(hue, sat, bright) {
    	sat = clamp(sat, 0, 100) / 100;
    	bright = clamp(bright, 0, 100) / 100;

    	let light = .5 * bright * (2 - sat) || 0;
    	let hslSat = bright * sat / (1 - Math.abs(2 * light - 1)) || 0;

    	return {h: hue,
    					s: toTwoDecimals(hslSat*100),
    					l: toTwoDecimals(light*100)}
    }

    let rgbStore = {
    	r: derived([h, s, b], ([$h, $s, $l]) => hslToRGB(hsbToHSL($h,$s,$l)).r),
    	g: derived([h, s, b], ([$h, $s, $l]) => hslToRGB(hsbToHSL($h,$s,$l)).g),
    	b: derived([h, s, b], ([$h, $s, $l]) => hslToRGB(hsbToHSL($h,$s,$l)).b)
    };

    function hslToRGB({h, s, l}) {
    	s = clamp(s, 0, 100) / 100;
    	l = clamp(l, 0, 100) / 100;
    	h = h % 360;

    	let c = (1 - Math.abs(2 * l - 1)) * s,
    			x = c * (1 - Math.abs((h / 60) % 2 - 1)),
    			m = l - c/2,
    			r = 0,
    			g = 0,
    			b = 0;

    	if (0 <= h && h < 60) {
    		r = c; g = x; b = 0;
    	} else if (60 <= h && h < 120) {
    		r = x; g = c; b = 0;
    	} else if (120 <= h && h < 180) {
    		r = 0; g = c; b = x;
    	} else if (180 <= h && h < 240) {
    		r = 0; g = x; b = c;
    	} else if (240 <= h && h < 300) {
    		r = x; g = 0; b = c;
    	} else if (300 <= h && h < 360) {
    		r = c; g = 0; b = x;
    	}
    	r = Math.round((r + m) * 255);
    	g = Math.round((g + m) * 255);
    	b = Math.round((b + m) * 255);

    	return {r, g, b}
    }

    let toTwoDecimals$1 = (num) => {
    	return Math.round(num * 100) / 100
    };

    /* src\HSB.svelte generated by Svelte v3.6.7 */

    const file = "src\\HSB.svelte";

    function create_fragment(ctx) {
    	var h3, t1, section, label0, t2, input0, span0, t4, label1, t5, input1, span1, t7, label2, t8, input2, span2, dispose;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "HSB";
    			t1 = space();
    			section = element("section");
    			label0 = element("label");
    			t2 = text("H:");
    			input0 = element("input");
    			span0 = element("span");
    			span0.textContent = "deg";
    			t4 = space();
    			label1 = element("label");
    			t5 = text("S: ");
    			input1 = element("input");
    			span1 = element("span");
    			span1.textContent = "%";
    			t7 = space();
    			label2 = element("label");
    			t8 = text("B: ");
    			input2 = element("input");
    			span2 = element("span");
    			span2.textContent = "%";
    			attr(h3, "class", "svelte-163me31");
    			add_location(h3, file, 16, 0, 344);
    			attr(input0, "type", "number");
    			attr(input0, "min", "0");
    			attr(input0, "max", "360");
    			attr(input0, "class", "svelte-163me31");
    			add_location(input0, file, 18, 10, 377);
    			attr(span0, "class", "mobile-hide svelte-163me31");
    			add_location(span0, file, 18, 81, 448);
    			attr(label0, "class", "svelte-163me31");
    			add_location(label0, file, 18, 1, 368);
    			attr(input1, "type", "number");
    			attr(input1, "min", "0");
    			attr(input1, "max", "100");
    			attr(input1, "class", "svelte-163me31");
    			add_location(input1, file, 19, 11, 505);
    			attr(span1, "class", "mobile-hide svelte-163me31");
    			add_location(span1, file, 19, 89, 583);
    			attr(label1, "class", "svelte-163me31");
    			add_location(label1, file, 19, 1, 495);
    			attr(input2, "type", "number");
    			attr(input2, "min", "0");
    			attr(input2, "max", "100");
    			attr(input2, "class", "svelte-163me31");
    			add_location(input2, file, 20, 11, 638);
    			attr(span2, "class", "mobile-hide svelte-163me31");
    			add_location(span2, file, 20, 89, 716);
    			attr(label2, "class", "svelte-163me31");
    			add_location(label2, file, 20, 1, 628);
    			attr(section, "class", "svelte-163me31");
    			add_location(section, file, 17, 0, 357);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input0, "input", ctx.updateHSB),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input1, "input", ctx.updateHSB),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input2, "input", ctx.updateHSB)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    			insert(target, t1, anchor);
    			insert(target, section, anchor);
    			append(section, label0);
    			append(label0, t2);
    			append(label0, input0);

    			input0.value = ctx.hue;

    			append(label0, span0);
    			append(section, t4);
    			append(section, label1);
    			append(label1, t5);
    			append(label1, input1);

    			input1.value = ctx.saturation;

    			append(label1, span1);
    			append(section, t7);
    			append(section, label2);
    			append(label2, t8);
    			append(label2, input2);

    			input2.value = ctx.brightness;

    			append(label2, span2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.hue) input0.value = ctx.hue;
    			if (changed.saturation) input1.value = ctx.saturation;
    			if (changed.brightness) input2.value = ctx.brightness;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    				detach(t1);
    				detach(section);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let hue, saturation, brightness;
    	hsbStore.h.subscribe(val => { const $$result = hue = val; $$invalidate('hue', hue); return $$result; });
    	hsbStore.s.subscribe(val => { const $$result = saturation = val; $$invalidate('saturation', saturation); return $$result; });
    	hsbStore.b.subscribe(val => { const $$result = brightness = val; $$invalidate('brightness', brightness); return $$result; });
    	
    	function updateHSB() {
    		hsbStore.h.set(hue);
    		hsbStore.s.set(saturation);
    		hsbStore.b.set(brightness);
    	}

    	function input0_input_handler() {
    		hue = to_number(this.value);
    		$$invalidate('hue', hue);
    	}

    	function input1_input_handler() {
    		saturation = to_number(this.value);
    		$$invalidate('saturation', saturation);
    	}

    	function input2_input_handler() {
    		brightness = to_number(this.value);
    		$$invalidate('brightness', brightness);
    	}

    	return {
    		hue,
    		saturation,
    		brightness,
    		updateHSB,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	};
    }

    class HSB extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\HSL.svelte generated by Svelte v3.6.7 */

    const file$1 = "src\\HSL.svelte";

    function create_fragment$1(ctx) {
    	var h3, t1, section, label0, t2, input0, span0, t4, label1, t5, input1, span1, t7, label2, t8, input2, span2, dispose;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "HSL";
    			t1 = space();
    			section = element("section");
    			label0 = element("label");
    			t2 = text("H: ");
    			input0 = element("input");
    			span0 = element("span");
    			span0.textContent = "deg";
    			t4 = space();
    			label1 = element("label");
    			t5 = text("S: ");
    			input1 = element("input");
    			span1 = element("span");
    			span1.textContent = "%";
    			t7 = space();
    			label2 = element("label");
    			t8 = text("L: ");
    			input2 = element("input");
    			span2 = element("span");
    			span2.textContent = "%";
    			attr(h3, "class", "svelte-163me31");
    			add_location(h3, file$1, 39, 0, 924);
    			attr(input0, "type", "number");
    			attr(input0, "min", "0");
    			attr(input0, "max", "360");
    			attr(input0, "class", "svelte-163me31");
    			add_location(input0, file$1, 41, 11, 958);
    			attr(span0, "class", "mobile-hide svelte-163me31");
    			add_location(span0, file$1, 41, 82, 1029);
    			attr(label0, "class", "svelte-163me31");
    			add_location(label0, file$1, 41, 1, 948);
    			attr(input1, "type", "number");
    			attr(input1, "min", "0");
    			attr(input1, "max", "100");
    			attr(input1, "class", "svelte-163me31");
    			add_location(input1, file$1, 42, 11, 1086);
    			attr(span1, "class", "mobile-hide svelte-163me31");
    			add_location(span1, file$1, 42, 89, 1164);
    			attr(label1, "class", "svelte-163me31");
    			add_location(label1, file$1, 42, 1, 1076);
    			attr(input2, "type", "number");
    			attr(input2, "min", "0");
    			attr(input2, "max", "100");
    			attr(input2, "class", "svelte-163me31");
    			add_location(input2, file$1, 43, 11, 1219);
    			attr(span2, "class", "mobile-hide svelte-163me31");
    			add_location(span2, file$1, 43, 88, 1296);
    			attr(label2, "class", "svelte-163me31");
    			add_location(label2, file$1, 43, 1, 1209);
    			attr(section, "class", "svelte-163me31");
    			add_location(section, file$1, 40, 0, 937);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input0, "input", ctx.updateHSB),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input1, "input", ctx.updateHSB),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input2, "input", ctx.updateHSB)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    			insert(target, t1, anchor);
    			insert(target, section, anchor);
    			append(section, label0);
    			append(label0, t2);
    			append(label0, input0);

    			input0.value = ctx.hue;

    			append(label0, span0);
    			append(section, t4);
    			append(section, label1);
    			append(label1, t5);
    			append(label1, input1);

    			input1.value = ctx.saturation;

    			append(label1, span1);
    			append(section, t7);
    			append(section, label2);
    			append(label2, t8);
    			append(label2, input2);

    			input2.value = ctx.lightness;

    			append(label2, span2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.hue) input0.value = ctx.hue;
    			if (changed.saturation) input1.value = ctx.saturation;
    			if (changed.lightness) input2.value = ctx.lightness;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    				detach(t1);
    				detach(section);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function clamp$1(num, min, max) {
    	return num <= min ? min : num >= max ? max : num;
    }

    function toTwoDecimals$2(num) {
    	return Math.round(num * 100) / 100
    }

    function hslToHSB({hue: h, saturation: s, lightness: l}) {
    	h = parseFloat(h);
    	s = clamp$1(s, 0, 100) / 100;
    	l = clamp$1(l, 0, 100) / 100;
    	
    	let bright = (2*l + s*(1 - Math.abs(2*l - 1))) / 2;
    	let hsbSat = (bright !== 0) ? 2 * (bright - l) / bright : 0;
    	 
    	return {
    		h,
    		s: toTwoDecimals$2(hsbSat * 100),
    		b: toTwoDecimals$2(bright * 100)
    	}
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let hue, saturation, lightness;
    	hslStore.h.subscribe(val => { const $$result = hue = val; $$invalidate('hue', hue); return $$result; });
    	hslStore.s.subscribe(val => { const $$result = saturation = val; $$invalidate('saturation', saturation); return $$result; });
    	hslStore.l.subscribe(val => { const $$result = lightness = val; $$invalidate('lightness', lightness); return $$result; });
    	
    	function updateHSB() {
    		let newHSB = hslToHSB({hue, saturation, lightness});
    		hsbStore.h.set(newHSB.h);
    		hsbStore.s.set(newHSB.s);
    		hsbStore.b.set(newHSB.b);
    	}

    	function input0_input_handler() {
    		hue = to_number(this.value);
    		$$invalidate('hue', hue);
    	}

    	function input1_input_handler() {
    		saturation = to_number(this.value);
    		$$invalidate('saturation', saturation);
    	}

    	function input2_input_handler() {
    		lightness = to_number(this.value);
    		$$invalidate('lightness', lightness);
    	}

    	return {
    		hue,
    		saturation,
    		lightness,
    		updateHSB,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	};
    }

    class HSL extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src\RGB.svelte generated by Svelte v3.6.7 */

    const file$2 = "src\\RGB.svelte";

    function create_fragment$2(ctx) {
    	var h3, t1, section, label0, t2, input0, t3, label1, t4, input1, t5, label2, t6, input2, dispose;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "RGB";
    			t1 = space();
    			section = element("section");
    			label0 = element("label");
    			t2 = text("R: ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("G: ");
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			t6 = text("B: ");
    			input2 = element("input");
    			attr(h3, "class", "svelte-1net7oh");
    			add_location(h3, file$2, 75, 0, 1531);
    			attr(input0, "type", "number");
    			attr(input0, "min", "0");
    			attr(input0, "max", "255");
    			attr(input0, "class", "svelte-1net7oh");
    			add_location(input0, file$2, 77, 11, 1565);
    			attr(label0, "class", "svelte-1net7oh");
    			add_location(label0, file$2, 77, 1, 1555);
    			attr(input1, "type", "number");
    			attr(input1, "min", "0");
    			attr(input1, "max", "255");
    			attr(input1, "class", "svelte-1net7oh");
    			add_location(input1, file$2, 78, 11, 1656);
    			attr(label1, "class", "svelte-1net7oh");
    			add_location(label1, file$2, 78, 1, 1646);
    			attr(input2, "type", "number");
    			attr(input2, "min", "0");
    			attr(input2, "max", "255");
    			attr(input2, "class", "svelte-1net7oh");
    			add_location(input2, file$2, 79, 11, 1749);
    			attr(label2, "class", "svelte-1net7oh");
    			add_location(label2, file$2, 79, 1, 1739);
    			attr(section, "class", "svelte-1net7oh");
    			add_location(section, file$2, 76, 0, 1544);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input0, "input", ctx.updateHSB),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input1, "input", ctx.updateHSB),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input2, "input", ctx.updateHSB)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    			insert(target, t1, anchor);
    			insert(target, section, anchor);
    			append(section, label0);
    			append(label0, t2);
    			append(label0, input0);

    			input0.value = ctx.red;

    			append(section, t3);
    			append(section, label1);
    			append(label1, t4);
    			append(label1, input1);

    			input1.value = ctx.green;

    			append(section, t5);
    			append(section, label2);
    			append(label2, t6);
    			append(label2, input2);

    			input2.value = ctx.blue;
    		},

    		p: function update(changed, ctx) {
    			if (changed.red) input0.value = ctx.red;
    			if (changed.green) input1.value = ctx.green;
    			if (changed.blue) input2.value = ctx.blue;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    				detach(t1);
    				detach(section);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function clamp$2(num, min, max) {
    	return num <= min ? min : num >= max ? max : num;
    }

    function toTwoDecimals$3(num) {
    	return Math.round(num * 100) / 100
    }

    function rgbToHSL({red: r, green: g, blue: b}) {
    	r = clamp$2(r, 0, 255) / 255;
    	g = clamp$2(g, 0, 255) / 255;
    	b = clamp$2(b, 0, 255) / 255;

    	let cmin = Math.min(r,g,b),
    			cmax = Math.max(r,g,b),
    			delta = cmax - cmin,
    			h = 0,
    			s = 0,
    			l = 0;
    	
    	if (delta == 0)
    		h = 0;
    	else if (cmax == r)
    		h = ((g - b) / delta) % 6;
    	else if (cmax == g)
    		h = (b - r) / delta + 2;
    	else
    		h = (r - g) / delta + 4;

    	h = Math.round(h * 60);

    	if (h < 0)
    			h += 360;
    	
    	l = (cmax + cmin) / 2;
    	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    	
    	return {
    		h,
    		s: toTwoDecimals$3(s * 100),
    		l: toTwoDecimals$3(l * 100)
    	}
    }

    function hslToHSB$1({h, s, l}) {
    	h = parseFloat(h);
    	s = clamp$2(s, 0, 100) / 100;
    	l = clamp$2(l, 0, 100) / 100;
    	
    	let bright = (2*l + s*(1 - Math.abs(2*l - 1))) / 2;
    	let hsbSat = (bright !== 0) ? 2 * (bright - l) / bright : 0;
    	 
    	return {
    		h,
    		s: toTwoDecimals$3(hsbSat * 100),
    		b: toTwoDecimals$3(bright * 100)
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let red, green, blue;
    	rgbStore.r.subscribe(val => { const $$result = red = val; $$invalidate('red', red); return $$result; });
    	rgbStore.g.subscribe(val => { const $$result = green = val; $$invalidate('green', green); return $$result; });
    	rgbStore.b.subscribe(val => { const $$result = blue = val; $$invalidate('blue', blue); return $$result; });
    	
    	function updateHSB() {
    		let newHSB = hslToHSB$1(rgbToHSL({red, blue, green}));
    		hsbStore.h.set(newHSB.h);
    		hsbStore.s.set(newHSB.s);
    		hsbStore.b.set(newHSB.b);
    	}

    	function input0_input_handler() {
    		red = to_number(this.value);
    		$$invalidate('red', red);
    	}

    	function input1_input_handler() {
    		green = to_number(this.value);
    		$$invalidate('green', green);
    	}

    	function input2_input_handler() {
    		blue = to_number(this.value);
    		$$invalidate('blue', blue);
    	}

    	return {
    		red,
    		green,
    		blue,
    		updateHSB,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	};
    }

    class RGB extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src\Result.svelte generated by Svelte v3.6.7 */

    const file$3 = "src\\Result.svelte";

    // (34:24) 
    function create_if_block_2(ctx) {
    	var current;

    	var rgb = new RGB({ $$inline: true });

    	return {
    		c: function create() {
    			rgb.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(rgb, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(rgb.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(rgb.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(rgb, detaching);
    		}
    	};
    }

    // (32:24) 
    function create_if_block_1(ctx) {
    	var current;

    	var hsl = new HSL({ $$inline: true });

    	return {
    		c: function create() {
    			hsl.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(hsl, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(hsl.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(hsl.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(hsl, detaching);
    		}
    	};
    }

    // (30:1) {#if type==="hsb"}
    function create_if_block(ctx) {
    	var current;

    	var hsb = new HSB({ $$inline: true });

    	return {
    		c: function create() {
    			hsb.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(hsb, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(hsb.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(hsb.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(hsb, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var fieldset, current_block_type_index, if_block, current;

    	var if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.type==="hsb") return 0;
    		if (ctx.type==="hsl") return 1;
    		if (ctx.type==="rgb") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c: function create() {
    			fieldset = element("fieldset");
    			if (if_block) if_block.c();
    			attr(fieldset, "class", "svelte-1f2s2vw");
    			add_location(fieldset, file$3, 28, 0, 561);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, fieldset, anchor);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(fieldset, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(fieldset, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(fieldset);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
    	
    	let { type = 'hsb' } = $$props;

    	const writable_props = ['type'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Result> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('type' in $$props) $$invalidate('type', type = $$props.type);
    	};

    	return { type };
    }

    class Result extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["type"]);
    	}

    	get type() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Colorpicker.svelte generated by Svelte v3.6.7 */

    const file$4 = "src\\Colorpicker.svelte";

    function create_fragment$4(ctx) {
    	var div4, div0, t0, t1, t2, div2, div1, t3, label, input, t4, div3, current, dispose;

    	var result0 = new Result({ props: { type: "hsb" }, $$inline: true });

    	var result1 = new Result({ props: { type: "hsl" }, $$inline: true });

    	var result2 = new Result({ props: { type: "rgb" }, $$inline: true });

    	return {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			result0.$$.fragment.c();
    			t0 = space();
    			result1.$$.fragment.c();
    			t1 = space();
    			result2.$$.fragment.c();
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t3 = space();
    			label = element("label");
    			input = element("input");
    			t4 = space();
    			div3 = element("div");
    			attr(div0, "id", "result");
    			attr(div0, "class", "svelte-hi6c4n");
    			add_location(div0, file$4, 31, 1, 978);
    			attr(div1, "id", "sl-dot");
    			set_style(div1, "--dot-x", "" + ctx.hsbSaturation + "%");
    			set_style(div1, "--dot-y", "" + ctx.hsbBrightness + "%");
    			attr(div1, "class", "svelte-hi6c4n");
    			add_location(div1, file$4, 37, 2, 1128);
    			attr(div2, "id", "sl-picker");
    			attr(div2, "class", "svelte-hi6c4n");
    			add_location(div2, file$4, 36, 1, 1078);
    			attr(input, "type", "range");
    			attr(input, "min", "0");
    			attr(input, "max", "360");
    			attr(input, "class", "svelte-hi6c4n");
    			add_location(input, file$4, 42, 2, 1264);
    			attr(div3, "id", "h-dot");
    			set_style(div3, "--dot-x", "" + (ctx.hue / 360 * 80 + 10) + "%");
    			attr(div3, "class", "svelte-hi6c4n");
    			add_location(div3, file$4, 43, 2, 1339);
    			attr(label, "id", "h-picker");
    			attr(label, "class", "svelte-hi6c4n");
    			add_location(label, file$4, 41, 1, 1240);
    			attr(div4, "id", "colorpicker");
    			set_style(div4, "--hue", "" + ctx.hue + "deg");
    			set_style(div4, "--saturation", "" + ctx.saturation + "%");
    			set_style(div4, "--lightness", "" + ctx.lightness + "%");
    			set_style(div4, "--hsb-saturation", ctx.hsbSaturation);
    			set_style(div4, "--hsb-brightness", ctx.hsbBrightness);
    			set_style(div4, "--contrast", ((ctx.lightness > 50) ? '#222' : 'white'));
    			attr(div4, "class", "svelte-hi6c4n");
    			add_location(div4, file$4, 24, 0, 718);

    			dispose = [
    				listen(div2, "click", updateSatBright),
    				listen(input, "change", ctx.input_change_input_handler),
    				listen(input, "input", ctx.input_change_input_handler),
    				listen(input, "input", ctx.updateHSB)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			mount_component(result0, div0, null);
    			append(div0, t0);
    			mount_component(result1, div0, null);
    			append(div0, t1);
    			mount_component(result2, div0, null);
    			append(div4, t2);
    			append(div4, div2);
    			append(div2, div1);
    			append(div4, t3);
    			append(div4, label);
    			append(label, input);

    			input.value = ctx.hue;

    			append(label, t4);
    			append(label, div3);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.hsbSaturation) {
    				set_style(div1, "--dot-x", "" + ctx.hsbSaturation + "%");
    			}

    			if (!current || changed.hsbBrightness) {
    				set_style(div1, "--dot-y", "" + ctx.hsbBrightness + "%");
    			}

    			if (changed.hue) input.value = ctx.hue;

    			if (!current || changed.hue) {
    				set_style(div3, "--dot-x", "" + (ctx.hue / 360 * 80 + 10) + "%");
    				set_style(div4, "--hue", "" + ctx.hue + "deg");
    			}

    			if (!current || changed.saturation) {
    				set_style(div4, "--saturation", "" + ctx.saturation + "%");
    			}

    			if (!current || changed.lightness) {
    				set_style(div4, "--lightness", "" + ctx.lightness + "%");
    			}

    			if (!current || changed.hsbSaturation) {
    				set_style(div4, "--hsb-saturation", ctx.hsbSaturation);
    			}

    			if (!current || changed.hsbBrightness) {
    				set_style(div4, "--hsb-brightness", ctx.hsbBrightness);
    			}

    			if (!current || changed.lightness) {
    				set_style(div4, "--contrast", ((ctx.lightness > 50) ? '#222' : 'white'));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(result0.$$.fragment, local);

    			transition_in(result1.$$.fragment, local);

    			transition_in(result2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(result0.$$.fragment, local);
    			transition_out(result1.$$.fragment, local);
    			transition_out(result2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}

    			destroy_component(result0, );

    			destroy_component(result1, );

    			destroy_component(result2, );

    			run_all(dispose);
    		}
    	};
    }

    function updateSatBright(e) {
    	let {width, height} = e.target.getBoundingClientRect();
    	hsbStore.s.set(toTwoDecimals$1(e.offsetX / width * 100));
    	hsbStore.b.set(toTwoDecimals$1(100 - e.offsetY / height * 100));
    }

    function instance$4($$self, $$props, $$invalidate) {
    	
    	
    	let hue, saturation, lightness, hsbSaturation, hsbBrightness;
    	hslStore.h.subscribe(val => { const $$result = hue = val; $$invalidate('hue', hue); return $$result; });
    	hslStore.s.subscribe(val => { const $$result = saturation = val; $$invalidate('saturation', saturation); return $$result; });
    	hslStore.l.subscribe(val => { const $$result = lightness = val; $$invalidate('lightness', lightness); return $$result; });
    	
    	hsbStore.s.subscribe(val => { const $$result = hsbSaturation = val; $$invalidate('hsbSaturation', hsbSaturation); return $$result; });
    	hsbStore.b.subscribe(val => { const $$result = hsbBrightness = val; $$invalidate('hsbBrightness', hsbBrightness); return $$result; });

    	function updateHSB() {
    		hsbStore.h.set(hue);
    	}

    	function input_change_input_handler() {
    		hue = to_number(this.value);
    		$$invalidate('hue', hue);
    	}

    	return {
    		hue,
    		saturation,
    		lightness,
    		hsbSaturation,
    		hsbBrightness,
    		updateHSB,
    		input_change_input_handler
    	};
    }

    class Colorpicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    // copied from the wonderful resource by Margaret2 at https://raw.githubusercontent.com/Margaret2/pantone-colors/master/pantone-colors.json

    var Pantone = {
      "names": [
        "egret",
        "snow-white",
        "bright-white",
        "cloud-dancer",
        "gardenia",
        "marshmallow",
        "blanc-de-blanc",
        "pristine",
        "whisper-white",
        "white-asparagus",
        "birch",
        "turtledove",
        "bone-white",
        "silver-birch",
        "vanilla-ice",
        "papyrus",
        "antique-white",
        "winter-white",
        "cloud-cream",
        "angora",
        "seedpearl",
        "vanilla-custard",
        "almond-oil",
        "alabaster-gleam",
        "vanilla",
        "rutabaga",
        "banana-crepe",
        "italian-straw",
        "whitecap-gray",
        "fog",
        "white-swan",
        "sandshell",
        "tapioca",
        "creme-brulee",
        "parchment",
        "sheer-pink",
        "dew",
        "powder-puff",
        "pearled-ivory",
        "white-smoke",
        "ecru",
        "navajo",
        "almost-mauve",
        "delicacy",
        "petal-pink",
        "bridal-blush",
        "cream-pink",
        "angel-wing",
        "pastel-parchment",
        "star-white",
        "lily-white",
        "vaporous-gray",
        "summer-shower",
        "ice",
        "frost",
        "icicle",
        "bit-of-blue",
        "mystic-blue",
        "bluewash",
        "spa-blue",
        "lightest-sky",
        "hint-of-mint",
        "murmur",
        "barely-blue",
        "blue-blush",
        "zephyr-blue",
        "blue-flower",
        "sprout-green",
        "billowing-sail",
        "hushed-green",
        "lambs-wool",
        "winter-wheat",
        "summer-melon",
        "chamomile",
        "cornhusk",
        "apricot-gelato",
        "biscotti",
        "asparagus-green",
        "oyster-white",
        "putty",
        "moth",
        "wood-ash",
        "gravel",
        "pale-khaki",
        "light-gray",
        "silver-green",
        "pelican",
        "overcast",
        "tidal-foam",
        "agate-gray",
        "alfalfa",
        "castle-wall",
        "oyster-gray",
        "cement",
        "spray-green",
        "eucalyptus",
        "twill",
        "olive-gray",
        "chinchilla",
        "seneca-rock",
        "laurel-oak",
        "coriander",
        "dune",
        "lead-gray",
        "covert-green",
        "oxford-tan",
        "plaza-taupe",
        "tuffet",
        "silver-mink",
        "timber-wolf",
        "taupe-gray",
        "pine-bark",
        "pumice-stone",
        "simply-taupe",
        "aluminum",
        "cobblestone",
        "brindle",
        "walnut",
        "bungee-cord",
        "oatmeal",
        "moonbeam",
        "rainy-day",
        "gray-morn",
        "peyote",
        "feather-gray",
        "goat",
        "white-sand",
        "silver-gray",
        "chateau-gray",
        "string",
        "atmosphere",
        "moon-rock",
        "fungi",
        "silver-lining",
        "moonstruck",
        "pussywillow-gray",
        "london-fog",
        "rock-ridge",
        "moon-mist",
        "castor-gray",
        "glacier-gray",
        "lunar-rock",
        "dawn-blue",
        "gray-violet",
        "vapor-blue",
        "high-rise",
        "limestone",
        "silver-cloud",
        "dove",
        "flint-gray",
        "drizzle",
        "elephant-skin",
        "cinder",
        "steeple-gray",
        "metal",
        "blue-fox",
        "storm-gray",
        "pigeon",
        "mirage-gray",
        "puritan-gray",
        "wrought-iron",
        "opal-gray",
        "wild-dove",
        "neutral-gray",
        "gargoyle",
        "smoked-pearl",
        "sedona-sage",
        "gunmetal",
        "wind-chime",
        "paloma",
        "charcoal-gray",
        "steel-gray",
        "pewter",
        "castlerock",
        "nine-iron",
        "ash",
        "cloudburst",
        "frost-gray",
        "excalibur",
        "dark-gull-gray",
        "rabbit",
        "shale",
        "fossil",
        "major-brown",
        "chocolate-chip",
        "canteen",
        "stone-gray",
        "capers",
        "beech",
        "tarmac",
        "wren",
        "black-olive",
        "beluga",
        "black-ink",
        "peat",
        "jet-set",
        "iron",
        "plum-kitten",
        "turkish-coffee",
        "black-coffee",
        "after-dark",
        "licorice",
        "raven",
        "jet-black",
        "phantom",
        "stretch-limo",
        "moonless-night",
        "caviar",
        "pirate-black",
        "anthracite",
        "vanilla-cream",
        "dawn",
        "gray-sand",
        "autumn-blonde",
        "apricot-illusion",
        "mellow-buff",
        "sheepskin",
        "almond-buff",
        "beige",
        "sand",
        "latte",
        "tan",
        "doe",
        "indian-tan",
        "safari",
        "candied-ginger",
        "warm-sand",
        "cuban-sand",
        "nougat",
        "natural",
        "nomad",
        "frozen-dew",
        "bleached-sand",
        "pebble",
        "croissant",
        "incense",
        "cornstalk",
        "tannin",
        "green-haze",
        "mojave-desert",
        "taos-taupe",
        "lark",
        "kelp",
        "antique-bronze",
        "dull-gold",
        "brown-sugar",
        "chipmunk",
        "tobacco-brown",
        "bison",
        "monks-robe",
        "dachshund",
        "toffee",
        "aztec",
        "cocoa-brown",
        "partridge",
        "friar-brown",
        "mustang",
        "pinecone",
        "potting-soil",
        "ermine",
        "otter",
        "kangaroo",
        "sepia",
        "coffee-liqueur",
        "desert-palm",
        "teak",
        "shitake",
        "cub",
        "carafe",
        "dark-earth",
        "slate-black",
        "chocolate-brown",
        "demitasse",
        "deep-taupe",
        "shopping-bag",
        "chestnut",
        "bracken",
        "seal-brown",
        "java",
        "coffee-bean",
        "mother-of-pearl",
        "pastel-rose-tan",
        "novelle-peach",
        "sun-kiss",
        "ivory-cream",
        "shifting-sand",
        "appleblossom",
        "eggnog",
        "cream-tan",
        "sand-dollar",
        "smoke-gray",
        "doeskin",
        "sesame",
        "light-taupe",
        "warm-taupe",
        "stucco",
        "almondine",
        "chanterelle",
        "ginger-snap",
        "woodsmoke",
        "amphora",
        "moonlight",
        "frappe",
        "rugby-tan",
        "roebuck",
        "praline",
        "burro",
        "beaver-fur",
        "toasted-almond",
        "tawny-birch",
        "macaroon",
        "tawny-brown",
        "camel",
        "toast",
        "toasted-nut",
        "nude",
        "tender-peach",
        "alesan",
        "pale-peach",
        "peach-puree",
        "bellini",
        "amberlight",
        "peach-dust",
        "linen",
        "scallop-shell",
        "soft-pink",
        "pale-dogwood",
        "silver-peony",
        "rose-dust",
        "shell",
        "whisper-pink",
        "pink-tint",
        "evening-sand",
        "sirocco",
        "brush",
        "cafe-au-lait",
        "cameo-rose",
        "pale-blush",
        "rose-cloud",
        "spanish-villa",
        "maple-sugar",
        "tuscany",
        "cork",
        "bisque",
        "almost-apricot",
        "pink-sand",
        "peach-nougat",
        "peach-bloom",
        "dusty-coral",
        "cafe-creme",
        "sandstorm",
        "butterum",
        "biscuit",
        "cashew",
        "almond",
        "lion",
        "thrush",
        "mocha-mousse",
        "pecan-brown",
        "hazel",
        "bran",
        "adobe",
        "leather-brown",
        "glazed-ginger",
        "sandstone",
        "caramel",
        "amber-brown",
        "sierra",
        "ginger-bread",
        "mocha-bisque",
        "tortoise-shell",
        "pheasant",
        "sunburn",
        "raw-sienna",
        "autumn-leaf",
        "mecca-orange",
        "rust",
        "bombay-brown",
        "frosted-almond",
        "gilded-beige",
        "pale-gold",
        "rich-gold",
        "copper",
        "copper-coin",
        "silver",
        "raw-umber",
        "brownie",
        "acorn",
        "clove",
        "carob-brown",
        "russet",
        "rawhide",
        "chutney",
        "baked-clay",
        "copper-brown",
        "brown-patina",
        "rustic-brown",
        "coconut-shell",
        "sequoia",
        "root-beer",
        "brunette",
        "sable",
        "cinnamon",
        "fudgesickle",
        "mink",
        "cappuccino",
        "cognac",
        "nutmeg",
        "french-roast",
        "deep-mahogany",
        "rum-raisin",
        "brown-stone",
        "bitter-chocolate",
        "mahogany",
        "henna",
        "arabian-spice",
        "hot-chocolate",
        "russet-brown",
        "madder-brown",
        "andorra",
        "afterglow",
        "transparent-yellow",
        "double-cream",
        "sunlight",
        "straw",
        "jojoba",
        "rattan",
        "boulder",
        "sea-mist",
        "reed-yellow",
        "chino-green",
        "parsnip",
        "dusty-yellow",
        "silver-fern",
        "lemon-grass",
        "raffia",
        "golden-mist",
        "pampas",
        "bamboo",
        "cress-green",
        "olive-oil",
        "dried-moss",
        "celery",
        "acacia",
        "sulphur",
        "oil-yellow",
        "green-sulphur",
        "golden-palm",
        "cocoon",
        "hemp",
        "southern-moss",
        "olivenite",
        "golden-green",
        "antique-gold",
        "burnished-gold",
        "french-vanilla",
        "pastel-yellow",
        "tender-yellow",
        "wax-yellow",
        "lemonade",
        "elfin-yellow",
        "limelight",
        "dusky-citron",
        "muted-lime",
        "endive",
        "custard",
        "canary-yellow",
        "yellow-cream",
        "cream-gold",
        "aurora",
        "green-sheen",
        "maize",
        "blazing-yellow",
        "buttercup",
        "empire-yellow",
        "lemon",
        "mimosa",
        "aspen-gold",
        "dandelion",
        "vibrant-yellow",
        "cyber-yellow",
        "freesia",
        "lemon-chrome",
        "mellow-yellow",
        "pale-banana",
        "popcorn",
        "sunshine",
        "lemon-drop",
        "primrose-yellow",
        "super-lemon",
        "misted-yellow",
        "sauterne",
        "honey",
        "arrowwood",
        "tawny-olive",
        "ceylon-yellow",
        "lemon-curry",
        "fall-leaf",
        "antelope",
        "mustard-gold",
        "harvest-gold",
        "nugget-gold",
        "golden-spice",
        "golden-yellow",
        "ochre",
        "tinsel",
        "bright-gold",
        "honey-gold",
        "amber-gold",
        "mineral-yellow",
        "narcissus",
        "marzipan",
        "curry",
        "prairie-sand",
        "honey-mustard",
        "wood-thrush",
        "golden-brown",
        "bronze-brown",
        "apple-cinnamon",
        "bone-brown",
        "dijon",
        "bistre",
        "medal-bronze",
        "cumin",
        "breen",
        "snapdragon",
        "banana-cream",
        "daffodil",
        "yolk-yellow",
        "golden-rod",
        "old-gold",
        "spectra-yellow",
        "golden-haze",
        "sahara-sun",
        "new-wheat",
        "cornsilk",
        "buff-yellow",
        "sunset-gold",
        "golden-cream",
        "impala",
        "flax",
        "pale-marigold",
        "amber-yellow",
        "amber",
        "golden-apricot",
        "beeswax",
        "banana",
        "citrus",
        "golden-glow",
        "artisans-gold",
        "sunflower",
        "buckthorn-brown",
        "cathay-spice",
        "taffy",
        "oak-buff",
        "honey-yellow",
        "spruce-yellow",
        "inca-gold",
        "sudan-brown",
        "rubber",
        "wheat",
        "honey-peach",
        "desert-dust",
        "golden-straw",
        "buff",
        "desert-mist",
        "clay",
        "golden-fleece",
        "apricot-sherbet",
        "sunburst",
        "apricot-cream",
        "buff-orange",
        "chamois",
        "warm-apricot",
        "marigold",
        "golden-nugget",
        "butterscotch",
        "nugget",
        "buckskin",
        "yam",
        "golden-oak",
        "gold-fusion",
        "saffron",
        "cadmium-yellow",
        "zinnia",
        "radiant-yellow",
        "apricot",
        "dark-cheddar",
        "apricot-ice",
        "apricot-nectar",
        "gold-earth",
        "apricot-tan",
        "topaz",
        "golden-ochre",
        "apricot-buff",
        "peach-cobbler",
        "salmon-buff",
        "pumpkin",
        "mock-orange",
        "muskmelon",
        "copper-tan",
        "coral-gold",
        "russet-orange",
        "orange-ochre",
        "amberglow",
        "jaffa-orange",
        "apricot-orange",
        "burnt-orange",
        "harvest-pumpkin",
        "blazing-orange",
        "flame-orange",
        "bright-marigold",
        "autumn-glory",
        "sun-orange",
        "persimmon-orange",
        "orange-popsicle",
        "autumn-sunset",
        "tangerine",
        "bird-of-paradise",
        "orange-peel",
        "mandarin-orange",
        "golden-poppy",
        "vibrant-orange",
        "nectarine",
        "coral-rose",
        "carrot",
        "firecracker",
        "red-orange",
        "vermillion-orange",
        "flame",
        "creampuff",
        "bleached-apricot",
        "almond-cream",
        "beach-sand",
        "cream-blush",
        "caramel-cream",
        "peach-fuzz",
        "prairie-sunset",
        "coral-sands",
        "apricot-wash",
        "canyon-sunset",
        "brandied-melon",
        "carnelian",
        "mango",
        "peach",
        "cantaloupe",
        "coral-reef",
        "shell-coral",
        "cadmium-orange",
        "melon",
        "dusty-orange",
        "arabesque",
        "langoustino",
        "ginger",
        "flamingo",
        "orange-rust",
        "burnt-ochre",
        "chili",
        "ginger-spice",
        "autumn-glaze",
        "auburn",
        "picante",
        "tandori-spice",
        "cinnabar",
        "bossa-nova",
        "tropical-peach",
        "peach-parfait",
        "coral-pink",
        "dusty-pink",
        "muted-clay",
        "shrimp",
        "tawny-orange",
        "coral-haze",
        "canyon-clay",
        "terra-cotta",
        "desert-sand",
        "light-mahogany",
        "cedar-wood",
        "withered-rose",
        "rose-dawn",
        "ash-rose",
        "old-rose",
        "brick-dust",
        "canyon-rose",
        "dusty-cedar",
        "marsala",
        "apricot-brandy",
        "aragon",
        "hot-sauce",
        "bruschetta",
        "etruscan-red",
        "redwood",
        "burnt-brick",
        "faded-rose",
        "baked-apple",
        "pompeian-red",
        "ketchup",
        "red-ochre",
        "barn-red",
        "burnt-henna",
        "peach-pearl",
        "peach-melba",
        "apricot-blush",
        "peach-bud",
        "coral-almond",
        "lobster-bisque",
        "lantana",
        "peach-nectar",
        "salmon",
        "peach-amber",
        "desert-flower",
        "peach-pink",
        "burnt-coral",
        "crabapple",
        "papaya-punch",
        "fusion-coral",
        "fresh-salmon",
        "persimmon",
        "coral",
        "living-coral",
        "hot-coral",
        "shell-pink",
        "georgia-peach",
        "sugar-coral",
        "dubarry",
        "porcelain-rose",
        "spiced-coral",
        "deep-sea-coral",
        "rose-of-sharon",
        "cayenne",
        "hibiscus",
        "poinsettia",
        "chrysanthemum",
        "cranberry",
        "cardinal",
        "tigerlily",
        "grenadine",
        "mandarin-red",
        "fiesta",
        "cherry-tomato",
        "orange-com",
        "spicy-orange",
        "camellia",
        "nasturtium",
        "emberglow",
        "burnt-sienna",
        "paprika",
        "red-clay",
        "molten-lava",
        "bittersweet",
        "poppy-red",
        "tomato",
        "fiery-red",
        "flame-scarlet",
        "high-risk-red",
        "aurora-red",
        "rococco-red",
        "tomato-puree",
        "lollipop",
        "ski-patrol",
        "scarlet",
        "lipstick-red",
        "crimson",
        "racing-red",
        "mars-red",
        "tango-red",
        "chinese-red",
        "ribbon-red",
        "true-red",
        "chili-pepper",
        "quartz-pink",
        "pink-icing",
        "blossom",
        "peaches-n-cream",
        "candlelight-peach",
        "strawberry-ice",
        "peach-blossom",
        "flamingo-pink",
        "confetti",
        "bubblegum",
        "pink-lemonade",
        "camellia-rose",
        "rapture-rose",
        "desert-rose",
        "geranium-pink",
        "conch-shell",
        "salmon-rose",
        "strawberry-pink",
        "sunkist-coral",
        "calypso-coral",
        "tea-rose",
        "geranium",
        "paradise-pink",
        "teaberry",
        "rouge-red",
        "raspberry",
        "azalea",
        "virtual-pink",
        "claret-red",
        "raspberry-wine",
        "rose-red",
        "barberry",
        "bright-rose",
        "persian-red",
        "cerise",
        "pink-lady",
        "lilac-sachet",
        "prism-pink",
        "begonia-pink",
        "fuchsia-pink",
        "rosebloom",
        "ibis-rose",
        "sachet-pink",
        "wild-orchid",
        "aurora-pink",
        "chateau-rose",
        "morning-glory",
        "azalea-pink",
        "shocking-pink",
        "hot-pink",
        "fandango-pink",
        "honeysuckle",
        "raspberry-sorbet",
        "carmine",
        "fuchsia-rose",
        "beetroot-purple",
        "pink-carnation",
        "carmine-rose",
        "magenta",
        "pink-flambe",
        "fuchsia-purple",
        "lilac-rose",
        "very-berry",
        "super-pink",
        "phlox-pink",
        "raspberry-rose",
        "rose-violet",
        "fuchsia-red",
        "cactus-flower",
        "magenta-haze",
        "shrinking-violet",
        "primrose-pink",
        "silver-pink",
        "powder-pink",
        "mauveglow",
        "brandied-apricot",
        "dusty-rose",
        "mauve-morn",
        "mauve-chalk",
        "pearl",
        "bridal-rose",
        "blush",
        "baroque-rose",
        "slate-rose",
        "mineral-red",
        "garnet-rose",
        "holly-berry",
        "american-beauty",
        "jester-red",
        "rio-red",
        "rumba-red",
        "earth-red",
        "deep-claret",
        "garnet",
        "brick-red",
        "rosewood",
        "tibetan-red",
        "biking-red",
        "apple-butter",
        "oxblood-red",
        "cowhide",
        "burnt-russet",
        "ruby-wine",
        "cordovan",
        "tawny-port",
        "creole-pink",
        "peach-blush",
        "cloud-pink",
        "veiled-rose",
        "pearl-blush",
        "english-rose",
        "lotus",
        "rosewater",
        "peach-whip",
        "rose-smoke",
        "coral-cloud",
        "misty-rose",
        "peach-beige",
        "cameo-brown",
        "seashell-pink",
        "chintz-rose",
        "impatiens-pink",
        "peachskin",
        "mellow-rose",
        "rose-tan",
        "rosette",
        "mauvewood",
        "rose-wine",
        "malaga",
        "dry-rose",
        "hawthorn-rose",
        "maroon",
        "wild-ginger",
        "sangria",
        "red-bud",
        "beaujolais",
        "anemone",
        "beet-red",
        "red-plum",
        "rhododendron",
        "barely-pink",
        "blushing-bride",
        "cradle-pink",
        "pale-lilac",
        "chalk-pink",
        "light-lilac",
        "pink-nectar",
        "heavenly-pink",
        "potpourri",
        "crystal-pink",
        "pink-dogwood",
        "crystal-rose",
        "strawberry-cream",
        "gossamer-pink",
        "rose-shadow",
        "orchid-pink",
        "almond-blossom",
        "coral-blush",
        "candy-pink",
        "peony",
        "sea-pink",
        "cashmere-rose",
        "wild-rose",
        "orchid-smoke",
        "polignac",
        "lilas",
        "mauve-orchid",
        "orchid-haze",
        "parfait-pink",
        "pink-mist",
        "cameo-pink",
        "sweet-lilac",
        "pink-lavender",
        "pastel-lavender",
        "orchid",
        "lilac-chiffon",
        "moonlite-mauve",
        "cyclamen",
        "opera-mauve",
        "crocus",
        "mulberry",
        "striking-purple",
        "violet",
        "iris-orchid",
        "radiant-orchid",
        "spring-crocus",
        "meadow-mauve",
        "amethyst",
        "magenta-purple",
        "rosebud",
        "purple-orchid",
        "festival-fuchsia",
        "baton-rouge",
        "boysenberry",
        "raspberry-radiance",
        "purple-potion",
        "dahlia-mauve",
        "vivid-viola",
        "wild-aster",
        "deep-orchid",
        "clover",
        "purple-wine",
        "hollyhock",
        "hyacinth-violet",
        "dahlia",
        "sparkling-grape",
        "byzantium",
        "phlox",
        "grape-juice",
        "gloxinia",
        "crystal-gray",
        "mushroom",
        "shadow-gray",
        "sphinx",
        "bark",
        "fawn",
        "adobe-rose",
        "pale-mauve",
        "woodrose",
        "deauville-mauve",
        "twilight-mauve",
        "rose-taupe",
        "rose-brown",
        "roan-rouge",
        "antler",
        "peppercorn",
        "raisin",
        "huckleberry",
        "catawba-grape",
        "puce",
        "fudge",
        "mahogany-rose",
        "burlwood",
        "marron",
        "decadent-chocolate",
        "red-mahogany",
        "vineyard-wine",
        "winetasting",
        "port",
        "chocolate-truffle",
        "burgundy",
        "zinfandel",
        "windsor-wine",
        "port-royale",
        "fig",
        "violet-ice",
        "burnished-lilac",
        "keepsake-lilac",
        "mauve-shadows",
        "dawn-pink",
        "fragrant-lilac",
        "mauve-mist",
        "heather-rose",
        "red-violet",
        "mellow-mauve",
        "bordeaux",
        "violet-quartz",
        "damson",
        "amaranth",
        "zephyr",
        "dusky-orchid",
        "grape-shake",
        "wistful-mauve",
        "tulipwood",
        "grape-nectar",
        "argyle-purple",
        "nostalgia-rose",
        "deco-rose",
        "renaissance-rose",
        "nocturne",
        "crushed-berry",
        "crushed-violets",
        "mauve-wine",
        "plum-wine",
        "eggplant",
        "prune",
        "prune-purple",
        "grape-wine",
        "italian-plum",
        "potent-purple",
        "lavender-herb",
        "lavender-mist",
        "valerian",
        "very-grape",
        "grapeade",
        "purple-gumdrop",
        "berry-conserve",
        "chinese-violet",
        "crushed-grape",
        "concord-grape",
        "sunset-purple",
        "wood-violet",
        "purple-passion",
        "dark-purple",
        "grape-jam",
        "deep-purple",
        "wineberry",
        "grape-royale",
        "plum-purple",
        "hortensia",
        "blackberry-wine",
        "navy-cosmos",
        "indigo",
        "purple-pennant",
        "plum-perfect",
        "sweet-grape",
        "shadow-purple",
        "blackberry-cordial",
        "purple-reign",
        "mulberry-purple",
        "gothic-grape",
        "grape",
        "mysterioso",
        "purple-velvet",
        "nightshade",
        "orchid-tint",
        "lilac-ash",
        "gray-lilac",
        "hushed-violet",
        "cloud-gray",
        "quail",
        "nirvana",
        "orchid-hush",
        "iris",
        "sea-fog",
        "elderberry",
        "black-plum",
        "flint",
        "sassafras",
        "evening-haze",
        "thistle",
        "lavender-gray",
        "minimal-gray",
        "purple-ash",
        "gray-ridge",
        "purple-sage",
        "heirloom-lilac",
        "wisteria",
        "dusk",
        "daybreak",
        "cadet",
        "mulled-grape",
        "purple-plumeria",
        "lilac-marble",
        "ashes-of-roses",
        "gull-gray",
        "zinc",
        "gull",
        "shark",
        "sparrow",
        "orchid-ice",
        "lilac-snow",
        "winsome-orchid",
        "fair-orchid",
        "lavender-frost",
        "orchid-petal",
        "pastel-lilac",
        "orchid-bloom",
        "orchid-bouquet",
        "lupine",
        "violet-tulle",
        "sheer-lilac",
        "african-violet",
        "dusty-lavender",
        "paisley-purple",
        "hyacinth",
        "amethyst-orchid",
        "dewberry",
        "purple-heart",
        "meadow-violet",
        "royal-purple",
        "deep-lavender",
        "royal-lilac",
        "pansy",
        "bright-violet",
        "amaranth-purple",
        "purple-magic",
        "plum",
        "imperial-palace",
        "patrician-purple",
        "loganberry",
        "majesty",
        "imperial-purple",
        "crown-jewel",
        "parachute-purple",
        "lavender-fog",
        "lavendula",
        "lavender",
        "bougainvillea",
        "violet-tulip",
        "chalk-violet",
        "purple-haze",
        "smoky-grape",
        "regal-orchid",
        "viola",
        "orchid-mist",
        "grape-compote",
        "montana-grape",
        "vintage-violet",
        "aster-purple",
        "dahlia-purple",
        "passion-flower",
        "ultra-violet",
        "prism-violet",
        "heliotrope",
        "petunia",
        "corsican-blue",
        "veronica",
        "blue-iris",
        "purple-opulence",
        "gentian-violet",
        "liberty",
        "deep-blue",
        "bleached-denim",
        "heron",
        "skipper-blue",
        "navy-blue",
        "deep-wisteria",
        "blue-ribbon",
        "astral-aura",
        "lilac-hint",
        "misty-lilac",
        "lavender-blue",
        "purple-heather",
        "cosmic-sky",
        "languid-lavender",
        "dapple-gray",
        "sweet-lavender",
        "easter-egg",
        "jacaranda",
        "deep-periwinkle",
        "dusted-peri",
        "violet-storm",
        "baja-blue",
        "thistle-down",
        "persian-violet",
        "twilight-purple",
        "orient-blue",
        "clematis-blue",
        "royal-blue",
        "spectrum-blue",
        "lavender-violet",
        "blue-ice",
        "velvet-morning",
        "marlin",
        "blueprint",
        "blue-depths",
        "medieval-blue",
        "lavender-aura",
        "stonewash",
        "nightshadow-blue",
        "blue-indigo",
        "graystone",
        "crown-blue",
        "deep-cobalt",
        "arctic-ice",
        "gray-dawn",
        "heather",
        "eventide",
        "silver-lake-blue",
        "blue-bonnet",
        "blue-yonder",
        "lavender-lustre",
        "purple-impression",
        "grapemist",
        "vista-blue",
        "cornflower-blue",
        "persian-jewel",
        "wedgewood",
        "skyway",
        "cashmere-blue",
        "blue-bell",
        "placid-blue",
        "della-robbia-blue",
        "provence",
        "ultramarine",
        "allure",
        "colony-blue",
        "moonlight-blue",
        "dutch-blue",
        "delft",
        "limoges",
        "estate-blue",
        "infinity",
        "bijou-blue",
        "coastal-fjord",
        "true-navy",
        "ensign-blue",
        "dark-denim",
        "insignia-blue",
        "air-blue",
        "heritage-blue",
        "ethereal-blue",
        "bonnie-blue",
        "cendre-blue",
        "parisian-blue",
        "faience",
        "alaskan-blue",
        "little-boy-blue",
        "azure-blue",
        "riviera",
        "federal-blue",
        "star-sapphire",
        "bright-cobalt",
        "dusk-blue",
        "regatta",
        "palace-blue",
        "strong-blue",
        "turkish-sea",
        "olympian-blue",
        "classic-blue",
        "marina",
        "campanula",
        "daphne",
        "victoria-blue",
        "snorkel-blue",
        "nautical-blue",
        "princess-blue",
        "dazzling-blue",
        "amparo-blue",
        "deep-ultramarine",
        "surf-the-web",
        "mazarine-blue",
        "true-blue",
        "twilight-blue",
        "kentucky-blue",
        "cerulean",
        "powder-blue",
        "forever-blue",
        "tempest",
        "country-blue",
        "english-manor",
        "illusion-blue",
        "ballad-blue",
        "baby-blue",
        "celestial-blue",
        "blue-fog",
        "flint-stone",
        "folkstone-gray",
        "pearl-blue",
        "monument",
        "dark-slate",
        "midnight-navy",
        "total-eclipse",
        "blue-graphite",
        "dark-navy",
        "ice-flow",
        "quarry",
        "griffin",
        "dark-shadow",
        "ombre-blue",
        "india-ink",
        "ebony",
        "patriot-blue",
        "eclipse",
        "mood-indigo",
        "peacoat",
        "black-iris",
        "dress-blues",
        "blue-nights",
        "angel-falls",
        "dream-blue",
        "ashley-blue",
        "dusty-blue",
        "indian-teal",
        "stargazer",
        "orion-blue",
        "forget-me-not",
        "faded-denim",
        "blue-shadow",
        "coronet-blue",
        "captains-blue",
        "copen-blue",
        "china-blue",
        "adriatic-blue",
        "provincial-blue",
        "niagara",
        "blue-heaven",
        "stellar",
        "real-teal",
        "majolica-blue",
        "starlight-blue",
        "winter-sky",
        "stratosphere",
        "sterling-blue",
        "arona",
        "citadel",
        "blue-mirage",
        "cloud-blue",
        "ether",
        "cameo-blue",
        "stone-blue",
        "tourmaline",
        "smoke-blue",
        "bluestone",
        "aquamarine",
        "sky-blue",
        "milky-blue",
        "blue-grotto",
        "norse-blue",
        "aquarius",
        "maui-blue",
        "blue-mist",
        "river-blue",
        "cyan-blue",
        "horizon-blue",
        "blue-moon",
        "bluejay",
        "mediterranean-blue",
        "bachelor-button",
        "blue-atoll",
        "vivid-blue",
        "hawaiian-ocean",
        "blue-danube",
        "blue-jewel",
        "methyl-blue",
        "malibu-blue",
        "blithe",
        "swedish-blue",
        "dresden-blue",
        "diva-blue",
        "blue-aster",
        "cloisonne",
        "french-blue",
        "brilliant-blue",
        "directoire-blue",
        "skydiver",
        "imperial-blue",
        "deep-water",
        "dark-blue",
        "pastel-blue",
        "clearwater",
        "blue-glow",
        "plume",
        "porcelain-blue",
        "crystal-blue",
        "petit-four",
        "wan-blue",
        "whispering-blue",
        "skylight",
        "aquatic",
        "marine-blue",
        "reef-waters",
        "arctic",
        "chalk-blue",
        "pale-blue",
        "misty-blue",
        "sky-gray",
        "surf-spray",
        "gray-mist",
        "aquifer",
        "blue-glass",
        "icy-morn",
        "canal-blue",
        "pastel-turquoise",
        "aqua-haze",
        "aqua-sea",
        "meadowbrook",
        "glacier",
        "fair-aqua",
        "soothing-sea",
        "bleached-aqua",
        "blue-light",
        "blue-tint",
        "aqua-sky",
        "morning-mist",
        "harbor-gray",
        "eggshell-blue",
        "dusty-turquoise",
        "porcelain",
        "brittany-blue",
        "hydro",
        "blue-haze",
        "nile-blue",
        "mineral-blue",
        "bristol-blue",
        "teal",
        "blue-spruce",
        "sagebrush-green",
        "green-milieu",
        "jadeite",
        "blue-surf",
        "oil-blue",
        "trellis",
        "north-atlantic",
        "sea-pine",
        "slate",
        "silver-blue",
        "abyss",
        "lead",
        "stormy-sea",
        "trooper",
        "goblin-blue",
        "slate-gray",
        "chinois-green",
        "dark-forest",
        "balsam-green",
        "beetle",
        "urban-chic",
        "darkest-spruce",
        "mallard-blue",
        "celestial",
        "saxony-blue",
        "lyons-blue",
        "ink-blue",
        "corsair",
        "legion-blue",
        "aegean-blue",
        "bluesteel",
        "blue-ashes",
        "midnight",
        "blue-sapphire",
        "seaport",
        "moroccan-blue",
        "ocean-depths",
        "blue-coral",
        "dragonfly",
        "pacific",
        "balsam",
        "mediterranea",
        "atlantic-deep",
        "aqua",
        "stillwater",
        "delphinium-blue",
        "larkspur",
        "storm-blue",
        "tapestry",
        "colonial-blue",
        "peacock-blue",
        "capri-breeze",
        "algiers-blue",
        "caneel-bay",
        "caribbean-sea",
        "mosaic-blue",
        "turkish-tile",
        "angel-blue",
        "blue-radiance",
        "capri",
        "blue-curacao",
        "scuba-blue",
        "bluebird",
        "enamel-blue",
        "pool-blue",
        "blue-turquoise",
        "baltic",
        "lake-blue",
        "tile-blue",
        "pagoda-blue",
        "biscay-bay",
        "aruba-blue",
        "ceramic",
        "viridian-green",
        "tropical-green",
        "navigate",
        "deep-peacock-blue",
        "lapis",
        "turquoise",
        "waterfall",
        "lagoon",
        "bright-aqua",
        "porcelain-green",
        "blue-grass",
        "fanfare",
        "atlantis",
        "pool-green",
        "dynasty-green",
        "spectra-green",
        "columbia",
        "teal-blue",
        "parasailing",
        "wasabi",
        "beryl-green",
        "deep-sea",
        "bottle-green",
        "galapagos-green",
        "antique-green",
        "storm",
        "marine-green",
        "sea-green",
        "greenlake",
        "tidepool",
        "ivy",
        "cadmium-green",
        "alpine-green",
        "canton",
        "agate-green",
        "sea-blue",
        "latigo-bay",
        "green-blue-slate",
        "bayou",
        "north-sea",
        "deep-jungle",
        "everglade",
        "teal-green",
        "harbor-blue",
        "deep-lake",
        "shaded-spruce",
        "deep-teal",
        "silver-pine",
        "mallard-green",
        "bistro-green",
        "jasper",
        "bayberry",
        "june-bug",
        "ponderosa-pine",
        "aqua-glass",
        "opal-blue",
        "dusty-aqua",
        "ocean-wave",
        "holiday",
        "cascade",
        "dusty-jade-green",
        "honeydew",
        "brook-green",
        "cabbage",
        "beveled-glass",
        "opal",
        "biscay-green",
        "spearmint",
        "moonlight-jade",
        "bay",
        "yucca",
        "beach-glass",
        "ice-green",
        "cockatoo",
        "florida-keys",
        "bermuda",
        "electric-green",
        "aqua-green",
        "billiard",
        "arcadia",
        "alhambra",
        "deep-green",
        "mint-leaf",
        "peacock-green",
        "vivid-green",
        "emerald",
        "viridis",
        "shady-glade",
        "ultramarine-green",
        "silt-green",
        "frosty-green",
        "iceberg-green",
        "granite-green",
        "green-bay",
        "lily-pad",
        "laurel-wreath",
        "green-spruce",
        "comfrey",
        "dark-ivy",
        "foliage-green",
        "myrtle",
        "posy-green",
        "pineneedle",
        "sea-spray",
        "duck-green",
        "frosty-spruce",
        "fir",
        "evergreen",
        "hunter-green",
        "dark-green",
        "feldspar",
        "smoke-pine",
        "trekking-green",
        "garden-topiary",
        "jungle-green",
        "sycamore",
        "green-gables",
        "vetiver",
        "deep-lichen-green",
        "thyme",
        "kombu-green",
        "deep-forest",
        "forest-night",
        "rosin",
        "celadon",
        "pale-aqua",
        "smoke",
        "foggy-dew",
        "mercury",
        "mineral-gray",
        "aqua-gray",
        "fairest-jade",
        "water-lily",
        "canary-green",
        "almost-aqua",
        "green-tint",
        "sea-foam",
        "desert-sage",
        "whisper-green",
        "celadon-tint",
        "dewkist",
        "green-lily",
        "cameo-green",
        "seagrass",
        "shadow",
        "clearly-aqua",
        "misty-jade",
        "subtle-green",
        "aqua-foam",
        "gossamer-green",
        "lichen",
        "grayed-jade",
        "milky-green",
        "phantom-green",
        "mist-green",
        "birds-egg-green",
        "bok-choy",
        "smoke-green",
        "malachite-green",
        "mistletoe",
        "basil",
        "mineral-green",
        "green-eyes",
        "turf-green",
        "watercress",
        "elm-green",
        "hedge-green",
        "loden-frost",
        "shale-green",
        "kashmir",
        "stone-green",
        "english-ivy",
        "deep-grass-green",
        "piquant-green",
        "forest-green",
        "fluorite-green",
        "cactus",
        "garden-green",
        "artichoke-green",
        "willow-bough",
        "aspen-green",
        "medium-green",
        "juniper",
        "fairway",
        "vineyard-green",
        "dill",
        "greener-pastures",
        "four-leaf-clover",
        "bronze-green",
        "chive",
        "cypress",
        "black-forest",
        "rifle-green",
        "duffel-bag",
        "ambrosia",
        "spray",
        "pastel-green",
        "hemlock",
        "sprucestone",
        "meadow",
        "jadesheen",
        "green-ash",
        "greengage",
        "ming",
        "zephyr-green",
        "peapod",
        "light-grass-green",
        "absinthe-green",
        "neptune-green",
        "creme-de-menthe",
        "winter-green",
        "gumdrop-green",
        "holly-green",
        "parakeet",
        "golf-green",
        "spring-bud",
        "katydid",
        "jade-cream",
        "ming-green",
        "greenbriar",
        "leprechaun",
        "pine-green",
        "blarney",
        "mint",
        "deep-mint",
        "simply-green",
        "pepper-green",
        "bosphorus",
        "verdant-green",
        "seacrest",
        "gleam",
        "nile-green",
        "quiet-green",
        "fair-green",
        "forest-shade",
        "jade-green",
        "patina-green",
        "pistachio-green",
        "arcadian-green",
        "grass-green",
        "bud-green",
        "green-tea",
        "tendril",
        "paradise-green",
        "lime-green",
        "jasmine-green",
        "green-flash",
        "classic-green",
        "online-lime",
        "treetop",
        "summer-green",
        "spring-bouquet",
        "island-green",
        "irish-green",
        "shamrock",
        "peppermint",
        "mint-green",
        "poison-green",
        "vibrant-green",
        "kelly-green",
        "bright-green",
        "fern-green",
        "jelly-bean",
        "amazon",
        "green-glow",
        "bright-lime-green",
        "greenery",
        "foliage",
        "peridot",
        "meadow-green",
        "woodbine",
        "jade-lime",
        "herbal-garden",
        "leaf-green",
        "parrot-green",
        "dark-citron",
        "macaw-green",
        "kiwi",
        "sharp-green",
        "daiquiri-green",
        "wild-lime",
        "linden-green",
        "bright-chartreuse",
        "tender-shoots",
        "lime-punch",
        "sunny-lime",
        "limeade",
        "sulphur-spring",
        "citronelle",
        "apple-green",
        "warm-olive",
        "antique-moss",
        "lime-cream",
        "shadow-lime",
        "lime-sherbet",
        "lettuce-green",
        "sap-green",
        "opaline-green",
        "winter-pear",
        "sylvan-green",
        "glass-green",
        "green-essence",
        "ethereal-green",
        "garden-glade",
        "hay",
        "pale-green",
        "young-wheat",
        "citron",
        "luminary-green",
        "pale-lime-yellow",
        "chardonnay",
        "lima-bean",
        "charlock",
        "mellow-green",
        "shadow-green",
        "celery-green",
        "green-banana",
        "green-oasis",
        "leek-green",
        "weeping-willow",
        "palm",
        "golden-olive",
        "oasis",
        "moss",
        "amber-green",
        "ecru-olive",
        "green-moss",
        "khaki",
        "fennel-seed",
        "willow",
        "bronze-mist",
        "dried-tobacco",
        "tapenade",
        "plantation",
        "fog-green",
        "tender-greens",
        "aloe-wash",
        "celadon-green",
        "laurel-green",
        "swamp",
        "reseda",
        "meadow-mist",
        "butterfly",
        "white-jade",
        "seafoam-green",
        "reed",
        "seedling",
        "foam-green",
        "lily-green",
        "beechnut",
        "nile",
        "sweet-pea",
        "spinach-green",
        "fern",
        "green-olive",
        "epsom",
        "grasshopper",
        "turtle-green",
        "calliste-green",
        "calla-green",
        "cedar-green",
        "pesto",
        "tarragon",
        "sage",
        "iguana",
        "oil-green",
        "loden-green",
        "capulet-olive",
        "olivine",
        "lint",
        "pale-olive-green",
        "sage-green",
        "gray-green",
        "sponge",
        "mermaid",
        "dusky-green",
        "tea",
        "silver-sage",
        "slate-green",
        "elm",
        "mosstone",
        "aloe",
        "olive-drab",
        "cedar",
        "boa",
        "dried-herb",
        "olive-branch",
        "lizard",
        "avocado",
        "fir-green",
        "bog",
        "elmwood",
        "gothic-olive",
        "butternut",
        "nutria",
        "military-olive",
        "dark-olive",
        "moss-gray",
        "abbey-stone",
        "burnt-olive",
        "dusty-olive",
        "ivy-green",
        "olive-night",
        "grape-leaf",
        "porpoise",
        "satellite",
        "driftwood",
        "falcon",
        "morel",
        "fallen-rock",
        "vintage-khaki",
        "crockery",
        "greige",
        "desert-taupe",
        "white-pepper",
        "humus",
        "portabella",
        "caribou",
        "travertine",
        "starfish",
        "semolina",
        "curds-and-whey",
        "tigers-eye",
        "toasted-coconut",
        "rain-drum",
        "pear-sorbet",
        "pineapple-slice",
        "yarrow",
        "anise-flower",
        "flan",
        "sundress",
        "macadamia",
        "lemon-meringue",
        "yellow-iris",
        "goldfinch",
        "lemon-zest",
        "solar-power",
        "samoan-sun",
        "desert-sun",
        "pumpkin-spice",
        "orange-pepper",
        "marmalade",
        "hawaiian-sunset",
        "autumnal",
        "umber",
        "exuberance",
        "puffins-bill",
        "caramel-cafe",
        "gold-flame",
        "cinnamon-stick",
        "potters-clay",
        "rooibos-tea",
        "celosia-orange",
        "orangeade",
        "pureed-pumpkin",
        "tangerine-tango",
        "poinciana",
        "koi",
        "samba",
        "barbados-cherry",
        "haute-red",
        "salsa",
        "scarlet-sage",
        "scooter",
        "red-dahlia",
        "sun-dried-tomato",
        "fired-brick",
        "rhubarb",
        "syrah",
        "pomegranate",
        "cabernet",
        "ballerina",
        "fairy-tale",
        "etherea",
        "foxglove",
        "mesa-rose",
        "jazzy",
        "granita",
        "cherries-jubilee",
        "cabaret",
        "vivacious",
        "bellflower",
        "english-lavendar",
        "rhapsody",
        "acai",
        "tillandsia-purple",
        "picasso-lily",
        "mystical",
        "icelandic-blue",
        "aleutian",
        "silver-bullet",
        "blue-granite",
        "evening-blue",
        "deep-well",
        "night-sky",
        "blue-heron",
        "hydrangea",
        "xenon-blue",
        "brunnera-blue",
        "sky-captain",
        "navy-blazer",
        "dark-sapphire",
        "plein-air",
        "halogen-blue",
        "chambray-blue",
        "bel-air-blue",
        "vintage-indigo",
        "sodalite-blue",
        "parisian-night",
        "monaco-blue",
        "vallarta-blue",
        "salute",
        "outer-space",
        "blueberry",
        "carbon",
        "vulcan",
        "omphalodes",
        "cool-blue",
        "bering-sea",
        "blue-wing-teal",
        "poseidon",
        "mykonos-blue",
        "reflecting-pond",
        "corydalis-blue",
        "blue-topaz",
        "gulf-stream",
        "aquarelle",
        "aqua-splash",
        "botanical-garden",
        "scarab",
        "nimbus-cloud",
        "micro-chip",
        "wet-weather",
        "titanium",
        "december-sky",
        "pavement",
        "magnet",
        "silver-sconce",
        "silver-filigree",
        "quicksilver",
        "storm-front",
        "tornado",
        "eiffel-tower",
        "graphite",
        "alloy",
        "sleet",
        "tradewinds",
        "grisaille",
        "periscope",
        "quiet-shade",
        "turbulence",
        "stormy-weather",
        "iron-gate",
        "forged-iron",
        "asphalt",
        "ghost-gray",
        "brushed-nickel",
        "mourning-dove",
        "belgian-block",
        "agave-green",
        "cilantro",
        "pine-grove",
        "eden",
        "jolly-green",
        "mountain-view",
        "margarita",
        "winter-moss",
        "climbing-ivy",
        "delicioso",
        "mulch",
        "mole",
        "chocolate-torte",
        "ganache",
        "black-bean",
        "espresso",
        "meteorite",
        "tap-shoe",
        "white-alyssum",
        "jet-stream",
        "sweet-cream",
        "buttercream",
        "lemon-icing",
        "sugar-swizzle",
        "coconut-milk",
        "yellow-pear",
        "sea-salt",
        "brilliant-white",
        "cannoli-cream",
        "tofu",
        "pistachio-shell",
        "celandine",
        "lemon-verbena",
        "creme-de-peche",
        "marys-rose",
        "morganite",
        "rose-water",
        "almond-milk",
        "lime-popsicle",
        "golden-kiwi",
        "meadowlark",
        "evening-primrose",
        "habanero-gold",
        "minion-yellow",
        "soybean",
        "jurassic-gold",
        "brown-rice",
        "peach-quartz",
        "peachy-keen",
        "brazilian-sand",
        "pink-salt",
        "rose-quartz",
        "ballet-slipper",
        "cherry-blossom",
        "antarctica",
        "oyster-mushroom",
        "tanager-turquoise",
        "limpet-shell",
        "iced-aqua",
        "acid-lime",
        "spicy-mustard",
        "kumquat",
        "irish-cream",
        "orange-chiffon",
        "hazelnut",
        "sepia-rose",
        "raindrops",
        "zen-blue",
        "quiet-gray",
        "airy-blue",
        "harbor-mist",
        "sea-angel",
        "baltic-sea",
        "antiqua-sand",
        "island-paradise",
        "tibetan-stone",
        "mango-mojito",
        "ginger-root",
        "iced-coffee",
        "autumn-blaze",
        "golden-orange",
        "porcini",
        "iceland-poppy",
        "papaya",
        "carrot-curl",
        "turmeric",
        "tangelo",
        "fenugreek",
        "dusted-clay",
        "pastry-shell",
        "blooming-dahlia",
        "crocus-petal",
        "purple-rose",
        "lilac-breeze",
        "serenity",
        "crystal-seas",
        "golden-lime",
        "split-pea",
        "lentil-sprout",
        "pure-cashmere",
        "sun-baked",
        "peach-caramel",
        "tomato-cream",
        "orange-tiger",
        "meerkat",
        "exotic-orange",
        "dragon-fire",
        "coral-quartz",
        "peach-echo",
        "purple-dove",
        "sand-verbena",
        "lilac-gray",
        "granada-sky",
        "tree-house",
        "chai-tea",
        "roasted-pecan",
        "roasted-cashew",
        "winter-twig",
        "petrified-oak",
        "argan-oil",
        "autumn-maple",
        "sepia-tint",
        "spice-route",
        "scarlet-ibis",
        "summer-fig",
        "moonscape",
        "fruit-dove",
        "pink-yarrow",
        "toadstool",
        "bodacious",
        "diffused-orchid",
        "fairy-wren",
        "sunlit-allium",
        "sharkskin",
        "pale-iris",
        "iolite",
        "gray-flannel",
        "riverside",
        "quiet-harbor",
        "lichen-blue",
        "pacific-coast",
        "ibiza-blue",
        "navagio-bay",
        "barrier-reef",
        "guacamole",
        "kale",
        "mayfly",
        "twist-of-lime",
        "martini-olive",
        "emperador",
        "thai-curry",
        "honey-ginger",
        "sugar-almond",
        "spiced-apple",
        "chili-oil",
        "plum-truffle",
        "brandy-brown",
        "valiant-poppy",
        "aura-orange",
        "toreador",
        "lychee",
        "goji-berry",
        "arctic-dusk",
        "ephemera",
        "jalapeno-red",
        "love-potion",
        "pink-peacock",
        "grape-kiss",
        "willowherb",
        "charisma",
        "plum-jam",
        "lavender-crystal",
        "purple-sapphire",
        "chive-blossom",
        "purple-corallite",
        "volcanic-glass",
        "gray-blue",
        "blue-horizon",
        "iris-bloom",
        "nebulas-blue",
        "indigo-bunting",
        "fjord-blue",
        "hawaiian-surf",
        "tahitian-tide",
        "quetzal-green",
        "granite-gray",
        "lush-meadow",
        "gray-pinstripe",
        "sea-turtle",
        "deep-depths",
        "kalamata",
        "crocodile",
        "chocolate-plum",
        "chocolate-lab",
        "shaved-chocolate",
        "fondue-fudge",
        "tiramisu",
        "rocky-road",
        "chicory-coffee",
        "smoked-paprika",
        "chocolate-fondant",
        "cherry-mahogany",
        "merlot",
        "red-pear",
        "pickled-beet",
        "plum-caspia",
        "winter-bloom",
        "spiced-plum",
        "violet-indigo",
        "maritime-blue",
        "obsidian",
        "black-beauty",
        "blackened-pearl",
        "odyssey-gray",
        "black-onyx",
        "navy-peony",
        "sargasso-sea",
        "sailor-blue",
        "gibraltar-sea",
        "lapis-blue",
        "baleine-blue",
        "galaxy-blue",
        "blue-opal",
        "moonlit-ocean",
        "deep-dive",
        "crystal-teal",
        "deep-lagoon",
        "sea-moss",
        "forest-biome",
        "rain-forest"
      ],
      "values": [
          "#f3ece0",
          "#f2f0eb",
          "#f4f5f0",
          "#f0eee9",
          "#f1e8df",
          "#f0eee4",
          "#e7e9e7",
          "#f2e8da",
          "#ede6db",
          "#e1dbc8",
          "#ddd5c7",
          "#ded7c8",
          "#d7d0c0",
          "#d2cfc4",
          "#f0eada",
          "#f5edd6",
          "#ede3d2",
          "#f5ecd2",
          "#e6ddc5",
          "#dfd1bb",
          "#e6dac4",
          "#f3e0be",
          "#f4efc1",
          "#f0debd",
          "#f4e1c1",
          "#ecddbe",
          "#e7d3ad",
          "#e7d1a1",
          "#e0d5c6",
          "#d0c5b1",
          "#e4d7c5",
          "#d8ccbb",
          "#dccdbc",
          "#dbccb5",
          "#dfd1be",
          "#f6e5db",
          "#eeded1",
          "#f3e0d6",
          "#f0dfcc",
          "#eddcc9",
          "#f3dfca",
          "#efdcc3",
          "#e7dcd9",
          "#f5e3e2",
          "#f2e2e0",
          "#eee2dd",
          "#f6e4d9",
          "#f3dfd7",
          "#e5d9d3",
          "#efefe8",
          "#e2e2da",
          "#dfddd7",
          "#e5ebe3",
          "#e0e4d9",
          "#dde2d6",
          "#dadcd0",
          "#e2eaeb",
          "#e1e3de",
          "#e2e6e0",
          "#d3dedf",
          "#e4eadf",
          "#d8e8e6",
          "#d2d8d2",
          "#dde0df",
          "#d6dbd9",
          "#d3d9d1",
          "#d0d9d4",
          "#cbd7d2",
          "#d8e7e7",
          "#d8e9e5",
          "#e5d0b1",
          "#dfc09f",
          "#ead3ae",
          "#e8d0a7",
          "#f2d6ae",
          "#f5d7af",
          "#dac7ab",
          "#d2cdb4",
          "#d2caaf",
          "#d4cab0",
          "#d2cbaf",
          "#d7cab0",
          "#cbbfa2",
          "#bfaf92",
          "#dad8c9",
          "#d7d7c7",
          "#c1bcac",
          "#c3bdab",
          "#bfb9a3",
          "#b1b09f",
          "#b7b59f",
          "#c8c1ab",
          "#cbc1ae",
          "#c4b6a6",
          "#aea692",
          "#b1a992",
          "#a79b82",
          "#a6997a",
          "#9c8e7b",
          "#9a927f",
          "#918c7e",
          "#938772",
          "#998978",
          "#8a7963",
          "#80765f",
          "#b8a99a",
          "#aea393",
          "#a59788",
          "#9f8d7c",
          "#8d8070",
          "#8e7c71",
          "#827064",
          "#cac2b9",
          "#ad9f93",
          "#9f9586",
          "#a89a8e",
          "#82776b",
          "#776a5f",
          "#696156",
          "#cbc3b4",
          "#cdc6bd",
          "#cfc8bd",
          "#cabeb5",
          "#c5bbae",
          "#b8ad9e",
          "#a89a91",
          "#dbd5d1",
          "#c1b7b0",
          "#bbb1a8",
          "#aa9f96",
          "#a89c94",
          "#958b84",
          "#8f8177",
          "#bdb6ab",
          "#c2beb6",
          "#aeaca1",
          "#a29e92",
          "#918c86",
          "#80817d",
          "#646762",
          "#c5c6c7",
          "#c5c5c5",
          "#cacccb",
          "#bbbcbc",
          "#bebdbd",
          "#aeb2b5",
          "#989a98",
          "#beb7b0",
          "#b3ada7",
          "#a09c98",
          "#a09f9c",
          "#8f8982",
          "#8a7e78",
          "#827e7c",
          "#babfbc",
          "#b9bcb6",
          "#b5bab6",
          "#a9afaa",
          "#abafae",
          "#a8b0ae",
          "#999e98",
          "#a49e9e",
          "#8b8c89",
          "#8e918f",
          "#686767",
          "#656466",
          "#686d6c",
          "#5c5d5b",
          "#cac5c2",
          "#9f9c99",
          "#6c6868",
          "#726f70",
          "#666564",
          "#5f5e62",
          "#46434a",
          "#a09998",
          "#837f7f",
          "#848283",
          "#676168",
          "#625d5d",
          "#5f575c",
          "#4a3f41",
          "#806f63",
          "#5b5149",
          "#685a4e",
          "#5e5347",
          "#685e4f",
          "#695e4b",
          "#5b4f3b",
          "#5a5348",
          "#4a4139",
          "#48413b",
          "#4a4843",
          "#44413c",
          "#3b3a36",
          "#262c2a",
          "#736460",
          "#625b5c",
          "#483f39",
          "#3b302f",
          "#3c3535",
          "#3a3536",
          "#413e3d",
          "#2d2c2f",
          "#39373b",
          "#2b2c30",
          "#2f2d30",
          "#292a2d",
          "#363838",
          "#28282d",
          "#f4d8c6",
          "#ebd2b7",
          "#e5ccaf",
          "#eed0ae",
          "#e2c4a6",
          "#d8b998",
          "#dab58f",
          "#ccb390",
          "#d5ba98",
          "#cca67f",
          "#c5a582",
          "#b69574",
          "#b98e68",
          "#ad8567",
          "#baaa91",
          "#bfa387",
          "#c5ae91",
          "#c1a68d",
          "#b69885",
          "#aa907d",
          "#b49f89",
          "#d8cfb2",
          "#daccb4",
          "#cab698",
          "#c4ab86",
          "#af9a7e",
          "#a9947a",
          "#a68a6d",
          "#cac4a4",
          "#c7b595",
          "#bfa77f",
          "#b89b72",
          "#988467",
          "#907954",
          "#8a6f48",
          "#a17249",
          "#976f4c",
          "#9a7352",
          "#6e4f3a",
          "#704822",
          "#704f37",
          "#755139",
          "#7a5747",
          "#6c5043",
          "#725440",
          "#6e493a",
          "#684b40",
          "#61473b",
          "#54392d",
          "#836b4f",
          "#7f674f",
          "#725e43",
          "#6b543e",
          "#6a513b",
          "#5a4632",
          "#655341",
          "#736253",
          "#6e5c4b",
          "#5d473a",
          "#5c4939",
          "#4b3d33",
          "#4e403b",
          "#40342b",
          "#7b6660",
          "#5a4743",
          "#584039",
          "#4f3f3b",
          "#493b39",
          "#433331",
          "#40312f",
          "#e9d4c3",
          "#e9d1bf",
          "#e7cfbd",
          "#ebd1bb",
          "#dac0a7",
          "#d8c0ad",
          "#ddbca0",
          "#ece1d3",
          "#e4c7b8",
          "#decdbe",
          "#cebaa8",
          "#bdab9b",
          "#baa38b",
          "#b19d8d",
          "#af9483",
          "#a58d7f",
          "#a78c8b",
          "#a28776",
          "#977d70",
          "#947764",
          "#9f8672",
          "#c5b1a0",
          "#d1b7a0",
          "#c2a594",
          "#b09080",
          "#ad8b75",
          "#947764",
          "#997867",
          "#d2b49c",
          "#ae856c",
          "#b38b71",
          "#ab856f",
          "#b0846a",
          "#ca9978",
          "#c08768",
          "#f2d3bc",
          "#f8d5b8",
          "#f1ceb3",
          "#fed1bd",
          "#efcfba",
          "#f4c9b1",
          "#e2bea2",
          "#f0d8cc",
          "#edd2c0",
          "#fbd8c9",
          "#f2d8cd",
          "#edcdc2",
          "#e7cfc7",
          "#cdb2a5",
          "#e1cfc6",
          "#dacbbe",
          "#dbcbbd",
          "#ddb6ab",
          "#c39d88",
          "#b99984",
          "#ae8774",
          "#d7b8ab",
          "#e4bfb3",
          "#dbb0a2",
          "#dfbaa9",
          "#c9a38d",
          "#be9785",
          "#ba8671",
          "#edcab5",
          "#e5b39b",
          "#dfb19b",
          "#e6af91",
          "#d99b7c",
          "#d29b83",
          "#c79685",
          "#bd8b69",
          "#c68f65",
          "#b4835b",
          "#a47149",
          "#a7754d",
          "#a0714f",
          "#936b4f",
          "#a47864",
          "#a36e51",
          "#ae7250",
          "#a66e4a",
          "#a3623b",
          "#97572b",
          "#91552b",
          "#c48a69",
          "#c37c54",
          "#a66646",
          "#985c41",
          "#8c4a2f",
          "#8c543a",
          "#754734",
          "#c68463",
          "#b37256",
          "#b9714f",
          "#b56a4c",
          "#bd5745",
          "#b55a30",
          "#9f5130",
          "#d2c2ac",
          "#b39f8d",
          "#bd9865",
          "#c8b273",
          "#c47e5a",
          "#ba6b57",
          "#a2a2a1",
          "#92705f",
          "#8f7265",
          "#7e5e52",
          "#876155",
          "#855c4c",
          "#8f5f50",
          "#865e49",
          "#98594b",
          "#9c5642",
          "#9a6051",
          "#834f3d",
          "#855141",
          "#874e3c",
          "#804839",
          "#714a41",
          "#664238",
          "#6e403c",
          "#6b4139",
          "#63403a",
          "#734b42",
          "#633f33",
          "#8b645a",
          "#7e5c54",
          "#58423f",
          "#553b39",
          "#583432",
          "#593c39",
          "#503130",
          "#824d46",
          "#7c423c",
          "#884332",
          "#683b39",
          "#743332",
          "#6a3331",
          "#603535",
          "#f3e6c9",
          "#f4ecc2",
          "#f3e0ac",
          "#edd59e",
          "#e0c992",
          "#dabe81",
          "#d1b272",
          "#d1be9b",
          "#d8c9a3",
          "#dcc99e",
          "#d9caa5",
          "#d6c69a",
          "#d4cc9a",
          "#bbaa7e",
          "#dcd494",
          "#dac483",
          "#d5cd94",
          "#cfbb7b",
          "#d2b04c",
          "#bca949",
          "#a98b2d",
          "#ccb97e",
          "#cec153",
          "#dacd65",
          "#ddb614",
          "#c4a647",
          "#ae8e2c",
          "#aa8805",
          "#c9b27c",
          "#c0ad7c",
          "#bca66a",
          "#c1a65c",
          "#bdb369",
          "#b59e5f",
          "#aa9855",
          "#efe1a7",
          "#f2e6b1",
          "#ededb7",
          "#ede9ad",
          "#f0e79d",
          "#eeea97",
          "#f0e87d",
          "#e3cc81",
          "#d1c87c",
          "#d2cc81",
          "#e5d68e",
          "#dfd87e",
          "#efdc75",
          "#dec05f",
          "#eddd59",
          "#d9ce52",
          "#eec843",
          "#fee715",
          "#fae03c",
          "#f7d000",
          "#f3bf08",
          "#f0c05a",
          "#ffd662",
          "#ffd02e",
          "#ffda29",
          "#ffd400",
          "#f3c12c",
          "#ffc300",
          "#f0dd9d",
          "#fae199",
          "#f8de8d",
          "#fade85",
          "#fdd878",
          "#f6d155",
          "#e4bf45",
          "#dab965",
          "#c5a253",
          "#ba9238",
          "#bc8d1f",
          "#c4962c",
          "#d4ae40",
          "#cda323",
          "#c9a86a",
          "#b19664",
          "#b08e51",
          "#b68a3a",
          "#c89720",
          "#c6973f",
          "#cb8e16",
          "#d6af66",
          "#c3964d",
          "#cf9f52",
          "#d1a054",
          "#c19552",
          "#d39c43",
          "#c39449",
          "#d8c09d",
          "#be9e6f",
          "#b59a6a",
          "#b68f52",
          "#a47d43",
          "#91672f",
          "#825e2f",
          "#b0885a",
          "#9d7446",
          "#97754c",
          "#98754a",
          "#977547",
          "#927240",
          "#795d34",
          "#fed777",
          "#ffcf73",
          "#fdc04e",
          "#e2b051",
          "#e2a829",
          "#eca825",
          "#f7b718",
          "#fbd897",
          "#dfc08a",
          "#d7b57f",
          "#edc373",
          "#f1bf70",
          "#f7c46c",
          "#f7b768",
          "#f8ce97",
          "#ffc87d",
          "#ffc66e",
          "#fab75a",
          "#efad55",
          "#dda758",
          "#eba851",
          "#fcb953",
          "#f9ac2f",
          "#d99938",
          "#f2ab46",
          "#d39237",
          "#a76f1f",
          "#99642c",
          "#c39b6a",
          "#cf9c63",
          "#ca9456",
          "#be8a4a",
          "#bb7a2c",
          "#ac6b29",
          "#815b37",
          "#dec5a5",
          "#dcbd9e",
          "#e3bc8e",
          "#e6bd8f",
          "#ebc396",
          "#e0b589",
          "#d2a172",
          "#f2d1a0",
          "#facd9e",
          "#f6c289",
          "#f1bd89",
          "#ffbb7c",
          "#f7b26a",
          "#ffb865",
          "#fadc53",
          "#db9b59",
          "#e19640",
          "#cf8848",
          "#d18e54",
          "#d0893f",
          "#be752d",
          "#ffb000",
          "#ffa500",
          "#ee9626",
          "#ffa010",
          "#fc9e21",
          "#f19035",
          "#e08119",
          "#fbbe99",
          "#ecaa79",
          "#dd9c6b",
          "#dd9760",
          "#d08344",
          "#c77943",
          "#cd7e4d",
          "#ffb181",
          "#feaa7b",
          "#f5a26f",
          "#ffa368",
          "#ec935e",
          "#de8e65",
          "#d27d56",
          "#e47127",
          "#dc793a",
          "#dc793e",
          "#d86d39",
          "#c86b3c",
          "#c86733",
          "#d56231",
          "#ffa64f",
          "#fb8b23",
          "#ff8d00",
          "#ff8812",
          "#f48037",
          "#f47327",
          "#ff7913",
          "#f38554",
          "#f88f58",
          "#ff8c55",
          "#fa7a35",
          "#ec6a37",
          "#f56733",
          "#ff7420",
          "#ff8656",
          "#f3774d",
          "#fd6f3b",
          "#f36944",
          "#f05627",
          "#f9633b",
          "#f2552c",
          "#ffcda8",
          "#fccaac",
          "#f4c29f",
          "#fbb995",
          "#f8c19a",
          "#f4ba94",
          "#ffbe98",
          "#ffbb9e",
          "#edaa86",
          "#fbac82",
          "#e1927a",
          "#ce7b5b",
          "#ce785d",
          "#b75e41",
          "#f2a987",
          "#ffa177",
          "#faa181",
          "#ea9575",
          "#f99471",
          "#fe8863",
          "#e27a53",
          "#d16f52",
          "#ca6c56",
          "#c96551",
          "#df7253",
          "#c25a3c",
          "#bb4f35",
          "#be5141",
          "#b65d48",
          "#b3573f",
          "#a15843",
          "#8d3f2d",
          "#9f4440",
          "#9c453b",
          "#973a36",
          "#ffc4b2",
          "#f8bfa8",
          "#e8a798",
          "#deaa9b",
          "#d29380",
          "#e29a86",
          "#d37f6f",
          "#e38e84",
          "#ce8477",
          "#d38377",
          "#bd7b74",
          "#ad6d68",
          "#a1655b",
          "#a26666",
          "#c2877b",
          "#b5817d",
          "#b47b77",
          "#b07069",
          "#af6c67",
          "#ad5d5d",
          "#964f4c",
          "#c26a5a",
          "#b06455",
          "#ab4f41",
          "#a75949",
          "#a2574b",
          "#a6594c",
          "#a14d3a",
          "#bf6464",
          "#b34646",
          "#a4292e",
          "#9a382d",
          "#913832",
          "#8f423b",
          "#7e392f",
          "#ffb2a5",
          "#fbbdaf",
          "#feaea5",
          "#fdb2ab",
          "#e29d94",
          "#dd9289",
          "#da7e7a",
          "#ffb59b",
          "#faaa94",
          "#fb9f93",
          "#ff9687",
          "#fa9a85",
          "#e9897e",
          "#d77e70",
          "#fca289",
          "#ff8576",
          "#ff7f6a",
          "#f67866",
          "#ed7464",
          "#ff6f61",
          "#f35b53",
          "#f88180",
          "#f97272",
          "#f56c73",
          "#f25f66",
          "#ea6b6a",
          "#d75c5d",
          "#d9615b",
          "#dc5b62",
          "#e04951",
          "#dd3848",
          "#cb3441",
          "#be454f",
          "#bb4a4d",
          "#ad3e48",
          "#e2583e",
          "#df3f32",
          "#e74a33",
          "#dd4132",
          "#eb3c27",
          "#da321c",
          "#d73c26",
          "#f6745f",
          "#fe6347",
          "#ea6759",
          "#c65d52",
          "#ce4d42",
          "#c2452d",
          "#b5332e",
          "#d93744",
          "#dc343b",
          "#ce2939",
          "#d01c1f",
          "#cd212a",
          "#c71f2d",
          "#b93a32",
          "#bb363f",
          "#c53346",
          "#cc1c3b",
          "#bb1237",
          "#bc2b3d",
          "#b31a38",
          "#ae0e36",
          "#bd162c",
          "#bc2731",
          "#ac0e2e",
          "#be132d",
          "#b92636",
          "#bf1932",
          "#9b1b30",
          "#efa6aa",
          "#eea0a6",
          "#f2b2ae",
          "#f4a6a3",
          "#f8a39d",
          "#e78b90",
          "#de8286",
          "#f7969e",
          "#e6798e",
          "#ea738d",
          "#ee6d8a",
          "#eb6081",
          "#d16277",
          "#cf6977",
          "#f6909d",
          "#fc8f9b",
          "#ff8d94",
          "#f57f8e",
          "#ea6676",
          "#ee5c6c",
          "#dc7178",
          "#da3d58",
          "#e4445e",
          "#dc3855",
          "#e24666",
          "#d32e5e",
          "#d42e5b",
          "#c6174e",
          "#c84c61",
          "#b63753",
          "#c92351",
          "#bf1945",
          "#c51959",
          "#a21441",
          "#a41247",
          "#efc1d6",
          "#e9adca",
          "#f0a1bf",
          "#ec9abe",
          "#df88b7",
          "#e290b2",
          "#ca628f",
          "#f18aad",
          "#d979a2",
          "#e881a6",
          "#d2738f",
          "#ee819f",
          "#e96a97",
          "#de5b8c",
          "#e55982",
          "#e04f80",
          "#d94f70",
          "#d2386c",
          "#bc4869",
          "#c74375",
          "#cf2d71",
          "#ed7a9e",
          "#e35b8f",
          "#d23c77",
          "#d3507a",
          "#d33479",
          "#bd4275",
          "#b73275",
          "#ce6ba4",
          "#ce5e9a",
          "#cc4385",
          "#c0428a",
          "#ab3475",
          "#a83e6c",
          "#9d446e",
          "#f4e1e6",
          "#eed4d9",
          "#dcb1af",
          "#ecb2b3",
          "#d18489",
          "#ca848a",
          "#ba797d",
          "#ecd6d6",
          "#e5d0cf",
          "#f9dbd8",
          "#d69fa2",
          "#d1969a",
          "#b35a66",
          "#b45865",
          "#b35457",
          "#ac4b55",
          "#b44e5d",
          "#a73340",
          "#9e1030",
          "#8a2232",
          "#7c2439",
          "#95424e",
          "#973443",
          "#953640",
          "#8c373e",
          "#813639",
          "#782a39",
          "#77212e",
          "#844b4d",
          "#70393f",
          "#884344",
          "#7e3940",
          "#77333b",
          "#702f3b",
          "#5c2c35",
          "#f7d5cc",
          "#e4ccc6",
          "#f5d1c8",
          "#f8cdc9",
          "#f4cec5",
          "#f4c6c3",
          "#e2c1c0",
          "#f6dbd8",
          "#dbbeb7",
          "#d3b4ad",
          "#e2a9a1",
          "#caa39a",
          "#d3a297",
          "#c08a80",
          "#f7c8c2",
          "#eec4be",
          "#ffc4bc",
          "#dfb8b6",
          "#d9a6a1",
          "#d19c97",
          "#ce8e8b",
          "#a75d67",
          "#a4596d",
          "#9f5069",
          "#8c4759",
          "#884c5e",
          "#834655",
          "#7c4c53",
          "#982551",
          "#962d49",
          "#80304c",
          "#842c48",
          "#7a1f3d",
          "#7c2946",
          "#722b3f",
          "#f8d7dd",
          "#fbd3d9",
          "#edd0dd",
          "#e1c6cc",
          "#e6c5ca",
          "#dec6d3",
          "#d8aab7",
          "#f4dede",
          "#e7c9ca",
          "#edd0ce",
          "#f7d1d1",
          "#fdc3c6",
          "#f4c3c4",
          "#fac8c3",
          "#f9c2cd",
          "#f3bbca",
          "#f5bec7",
          "#e6b2b8",
          "#f5b0bd",
          "#ed9ca8",
          "#de98ab",
          "#ce879f",
          "#ce8498",
          "#d294aa",
          "#c28799",
          "#b88995",
          "#b58299",
          "#b0879b",
          "#e9c3cf",
          "#e6bccd",
          "#dba9b8",
          "#e8b5ce",
          "#d9afca",
          "#d8a1c4",
          "#d198c5",
          "#de9bc4",
          "#d28fb0",
          "#d687ba",
          "#ca80b1",
          "#c67fae",
          "#a76c97",
          "#944e87",
          "#c17fb5",
          "#a767a2",
          "#ad5e99",
          "#ba69a1",
          "#a9568c",
          "#864d75",
          "#6b264b",
          "#b65f9a",
          "#ad4d8c",
          "#9e2c6a",
          "#973c6c",
          "#85325c",
          "#802a50",
          "#692746",
          "#a64f82",
          "#993c7c",
          "#92316f",
          "#903f75",
          "#8a3371",
          "#8c3573",
          "#823270",
          "#8d4687",
          "#843e83",
          "#773376",
          "#853b7b",
          "#692d5d",
          "#682961",
          "#622e5a",
          "#d7cbc4",
          "#bdaca3",
          "#bba5a0",
          "#ab9895",
          "#a99592",
          "#ae9490",
          "#ba9f99",
          "#c6a4a4",
          "#ae8c8e",
          "#af9294",
          "#8b6f70",
          "#806062",
          "#80565b",
          "#885157",
          "#957a76",
          "#6c5656",
          "#524144",
          "#5b4349",
          "#5d3c43",
          "#503938",
          "#493338",
          "#c5a193",
          "#9b716b",
          "#6e4c4b",
          "#513235",
          "#60373d",
          "#58363d",
          "#492a34",
          "#663336",
          "#612e35",
          "#64313e",
          "#5c2935",
          "#582b36",
          "#502b33",
          "#532d3b",
          "#c2acb1",
          "#c5aeb1",
          "#c0a5ae",
          "#b598a3",
          "#bfa3af",
          "#ceadbe",
          "#c49bd4",
          "#ad6d7f",
          "#a35776",
          "#996378",
          "#96637b",
          "#8b4963",
          "#854c65",
          "#6f3c56",
          "#c89fa5",
          "#9a7182",
          "#886971",
          "#946c74",
          "#805466",
          "#8d5c74",
          "#895c79",
          "#a4777e",
          "#985f68",
          "#865560",
          "#7a4b56",
          "#804f5a",
          "#643a4c",
          "#5b3644",
          "#674550",
          "#613f4c",
          "#603749",
          "#5c3a4d",
          "#5a2f43",
          "#533146",
          "#462639",
          "#b18eaa",
          "#ae90a7",
          "#9f7a93",
          "#927288",
          "#85677b",
          "#7a596f",
          "#765269",
          "#835e81",
          "#7a547f",
          "#7c5379",
          "#6f456e",
          "#75406a",
          "#683d62",
          "#582147",
          "#725671",
          "#50314c",
          "#5a395b",
          "#4f2d54",
          "#51304e",
          "#553b50",
          "#4d3246",
          "#503b53",
          "#4c3957",
          "#432c47",
          "#473442",
          "#4b3b4f",
          "#4e334e",
          "#3f2a47",
          "#56456b",
          "#493c62",
          "#473951",
          "#433455",
          "#46394b",
          "#41354d",
          "#433748",
          "#dbd2db",
          "#d7cdcd",
          "#d4cacd",
          "#d1c0bf",
          "#b7a9ac",
          "#98868c",
          "#a2919b",
          "#cec3d2",
          "#baafbc",
          "#a5929d",
          "#9d848e",
          "#6c5765",
          "#705861",
          "#54353b",
          "#bdb8c7",
          "#b9b3c5",
          "#9890a2",
          "#948d99",
          "#8f8395",
          "#847986",
          "#75697e",
          "#9d96b2",
          "#a198af",
          "#897f98",
          "#8981a0",
          "#6a6378",
          "#675a74",
          "#473854",
          "#c3babf",
          "#b5acab",
          "#a49ca0",
          "#92898a",
          "#918c8f",
          "#6d636b",
          "#69595c",
          "#e0d0db",
          "#e0c7d7",
          "#d4b9cb",
          "#c0aac0",
          "#bdabbe",
          "#bfb4cb",
          "#bdb0d0",
          "#c5aecf",
          "#d1acce",
          "#be9cc1",
          "#c193c0",
          "#b793c0",
          "#b085b7",
          "#a1759c",
          "#8b79b1",
          "#936ca7",
          "#926aa6",
          "#8b5987",
          "#745587",
          "#764f82",
          "#603f83",
          "#775496",
          "#774d8e",
          "#653d7c",
          "#784384",
          "#6a397b",
          "#663271",
          "#5a315d",
          "#604e7a",
          "#6c4e79",
          "#5a4769",
          "#593761",
          "#542c5d",
          "#482d54",
          "#392852",
          "#d2c4d6",
          "#bca4cb",
          "#afa4ce",
          "#9884b9",
          "#9e91c3",
          "#8f7da5",
          "#807396",
          "#b88aac",
          "#a98baf",
          "#a692ba",
          "#917798",
          "#6b5876",
          "#6c5971",
          "#634f62",
          "#7d74a8",
          "#7e6eac",
          "#6d5698",
          "#5f4b8b",
          "#53357d",
          "#4f3872",
          "#4f3466",
          "#646093",
          "#6d6695",
          "#5a5b9f",
          "#60569a",
          "#544275",
          "#4d448a",
          "#44377d",
          "#646f9b",
          "#62617e",
          "#484a72",
          "#403f6f",
          "#443f6f",
          "#3a395f",
          "#363151",
          "#d0d0da",
          "#bcb4c4",
          "#c5c0d0",
          "#bab8d3",
          "#aaaac4",
          "#a2a1ba",
          "#9c9ba7",
          "#9a9bc1",
          "#919bc9",
          "#848dc5",
          "#7c83bc",
          "#696ba0",
          "#5c619d",
          "#5f6db0",
          "#9499bb",
          "#8c8eb2",
          "#66648b",
          "#47457a",
          "#363b7c",
          "#3d428b",
          "#3d3c7c",
          "#767ba5",
          "#70789b",
          "#60688d",
          "#515b87",
          "#2d3359",
          "#263056",
          "#29304e",
          "#9f99aa",
          "#74809a",
          "#4e5368",
          "#49516d",
          "#4d495b",
          "#464b65",
          "#404466",
          "#bfc7d6",
          "#bbc1cc",
          "#b7c0d6",
          "#959eb7",
          "#618bb9",
          "#6384b8",
          "#5a77a8",
          "#8c9cc1",
          "#858fb1",
          "#8398ca",
          "#81a0d4",
          "#7391c8",
          "#6e81be",
          "#6479b3",
          "#adbed3",
          "#a5b8d0",
          "#93b4d7",
          "#8cadd3",
          "#7a9dcb",
          "#658dc6",
          "#5b7ebd",
          "#7291b4",
          "#65769a",
          "#506886",
          "#4a638d",
          "#3d5e8c",
          "#243f6c",
          "#233658",
          "#6e7e99",
          "#4e5e7f",
          "#505d7e",
          "#3f5277",
          "#384c67",
          "#35465e",
          "#2f3e55",
          "#77acc7",
          "#5d96bc",
          "#5ca6ce",
          "#539ccc",
          "#3e7fa5",
          "#4f7ca4",
          "#2a6a8b",
          "#6da9d2",
          "#6ea2d5",
          "#4d91c6",
          "#5879a2",
          "#43628b",
          "#386192",
          "#385d8d",
          "#7ba0c0",
          "#487ab7",
          "#346cb0",
          "#1f5da0",
          "#195190",
          "#1a4c8b",
          "#0f4c81",
          "#4f84c4",
          "#3272af",
          "#0f5f9a",
          "#08589d",
          "#034f84",
          "#1a5091",
          "#00539c",
          "#3850a0",
          "#4960a8",
          "#384883",
          "#203c7f",
          "#273c76",
          "#1e4477",
          "#313d64",
          "#a5b3cc",
          "#9bb7d4",
          "#96b3d2",
          "#899bb8",
          "#79839b",
          "#717f9b",
          "#7181a4",
          "#c9d3dc",
          "#c0ceda",
          "#b5c7d3",
          "#a3b4c4",
          "#9babbb",
          "#677283",
          "#626879",
          "#b0b7be",
          "#84898c",
          "#46515a",
          "#34414e",
          "#2c313d",
          "#323137",
          "#232f36",
          "#c6d2d2",
          "#98a0a5",
          "#8d8f8f",
          "#4a4b4d",
          "#434854",
          "#3c3f4a",
          "#41424a",
          "#363756",
          "#343148",
          "#353a4c",
          "#2b2e43",
          "#2b3042",
          "#2a3244",
          "#363b48",
          "#a3bdd3",
          "#a0bcd0",
          "#8699ab",
          "#8c9dad",
          "#3c586b",
          "#39505c",
          "#3e4f5c",
          "#8fadbd",
          "#798ea4",
          "#66829a",
          "#59728e",
          "#557088",
          "#516b84",
          "#546477",
          "#5c899b",
          "#5c798e",
          "#5487a4",
          "#5b7e98",
          "#46647e",
          "#405d73",
          "#274357",
          "#b5ced4",
          "#a9c0cb",
          "#9ec1cc",
          "#a2b9c2",
          "#879ba3",
          "#748995",
          "#5c6d7c",
          "#a2b6b9",
          "#9eb6b8",
          "#769da6",
          "#829ca5",
          "#86a1a9",
          "#6d8994",
          "#577284",
          "#9dc3d4",
          "#8abad3",
          "#72a8ba",
          "#5cacce",
          "#4ca5c7",
          "#3cadd4",
          "#52a2b4",
          "#5bacc3",
          "#38afcd",
          "#14a3c7",
          "#289dbe",
          "#3686a0",
          "#157ea0",
          "#1478a7",
          "#4abbd5",
          "#00b1d2",
          "#0088b0",
          "#008db9",
          "#0087b6",
          "#007baa",
          "#0074a8",
          "#008cc1",
          "#0084bd",
          "#007eb1",
          "#0086bb",
          "#007bb2",
          "#0077b3",
          "#0075af",
          "#0072b5",
          "#0075b3",
          "#0061a3",
          "#00589b",
          "#005a92",
          "#266691",
          "#305679",
          "#bcd3d5",
          "#aad5db",
          "#b2d4dd",
          "#a5cfd5",
          "#95c0cb",
          "#a1c8db",
          "#87c2d4",
          "#cbdcdf",
          "#c9dcdc",
          "#c8e0e0",
          "#99c1cc",
          "#76afb6",
          "#6f9fa9",
          "#648589",
          "#ccdad7",
          "#c4d6d3",
          "#bfcdcc",
          "#bcc8c6",
          "#b4c8c2",
          "#99aeae",
          "#89acac",
          "#c6e3e1",
          "#b0d3d1",
          "#9cc2c5",
          "#99c5c4",
          "#87b9bc",
          "#6baaae",
          "#60a0a3",
          "#c3dbd4",
          "#b8e2dc",
          "#c3e9e4",
          "#bce3df",
          "#acdfdd",
          "#9fd9d7",
          "#7bc4c4",
          "#cfdfdb",
          "#a8c0bb",
          "#a3ccc9",
          "#649b9e",
          "#5d9ca4",
          "#4c7e86",
          "#426972",
          "#a5bcbb",
          "#76a7ab",
          "#6d9192",
          "#558f91",
          "#478589",
          "#486b67",
          "#567572",
          "#8a9992",
          "#95a69f",
          "#90a8a4",
          "#658c88",
          "#6a8988",
          "#536d70",
          "#4c6969",
          "#8c9fa1",
          "#8a9a9a",
          "#8f9e9d",
          "#7a898f",
          "#6e8082",
          "#697a7e",
          "#5f7278",
          "#8a9691",
          "#7c8c87",
          "#556962",
          "#576664",
          "#55584c",
          "#464e4d",
          "#303d3c",
          "#3a5c6e",
          "#006380",
          "#1f6680",
          "#005871",
          "#0b5369",
          "#18576c",
          "#1f495b",
          "#4e6e81",
          "#35637c",
          "#3b5f78",
          "#325b74",
          "#09577b",
          "#005e7d",
          "#0f4e67",
          "#006175",
          "#1b5366",
          "#2a5c6a",
          "#1f595c",
          "#33565e",
          "#32575d",
          "#274e55",
          "#64a1ad",
          "#70a4b0",
          "#6198ae",
          "#3c7d90",
          "#47788a",
          "#436573",
          "#2d6471",
          "#00a0b0",
          "#008799",
          "#00859c",
          "#00849f",
          "#00819d",
          "#00758f",
          "#00698b",
          "#83c5cd",
          "#58c9d4",
          "#44bbca",
          "#32becc",
          "#00abc0",
          "#009dae",
          "#007a8e",
          "#67bcb3",
          "#53b0ae",
          "#279d9f",
          "#008c96",
          "#008491",
          "#1a7f8e",
          "#097988",
          "#81d7d3",
          "#00aaa9",
          "#009499",
          "#008786",
          "#008583",
          "#008381",
          "#008684",
          "#45b5aa",
          "#3ab0a2",
          "#4d9e9a",
          "#30a299",
          "#108780",
          "#007c7a",
          "#006d70",
          "#00af9f",
          "#00af9d",
          "#008e80",
          "#009b8c",
          "#009288",
          "#007f7c",
          "#00736c",
          "#73a89e",
          "#619187",
          "#4f7c74",
          "#427d6d",
          "#29685f",
          "#29675c",
          "#035453",
          "#40a48e",
          "#149c88",
          "#007d69",
          "#0a6f69",
          "#226c63",
          "#00675b",
          "#005f56",
          "#6da29e",
          "#599f99",
          "#549f98",
          "#379190",
          "#358082",
          "#20706f",
          "#316c6b",
          "#36716f",
          "#005b5d",
          "#006361",
          "#00656e",
          "#00656b",
          "#00585e",
          "#18454b",
          "#4e6866",
          "#405e5c",
          "#395551",
          "#335959",
          "#255958",
          "#264a48",
          "#203b3d",
          "#d2e8e0",
          "#c3ddd6",
          "#c0dccd",
          "#8ec5b6",
          "#81c3b4",
          "#76c1b2",
          "#7bb5a3",
          "#bae1d3",
          "#afddcc",
          "#87d7be",
          "#7accb8",
          "#77cfb7",
          "#55c6a9",
          "#64bfa4",
          "#c7e5df",
          "#bae5d6",
          "#a1d7c9",
          "#96dfce",
          "#87d8c3",
          "#58c8b6",
          "#56beab",
          "#60c9b3",
          "#4bc3a8",
          "#00b89f",
          "#00aa92",
          "#00a28a",
          "#008778",
          "#009276",
          "#00b694",
          "#00a78b",
          "#009e82",
          "#009473",
          "#00846b",
          "#006e5b",
          "#006b54",
          "#a9bdb1",
          "#a3b5a6",
          "#8c9c92",
          "#86a293",
          "#7e9285",
          "#818f84",
          "#616f65",
          "#589f7e",
          "#5b7961",
          "#5b7763",
          "#3e6f58",
          "#4f6b58",
          "#325b51",
          "#334d41",
          "#717e6f",
          "#53665c",
          "#578270",
          "#3a725f",
          "#11574a",
          "#335749",
          "#314f40",
          "#729b8b",
          "#3e6257",
          "#355048",
          "#3e524b",
          "#3c4e47",
          "#35463d",
          "#324241",
          "#807d6f",
          "#6e6e5c",
          "#50574c",
          "#3a4032",
          "#37413a",
          "#434237",
          "#36362d",
          "#b8ccba",
          "#c1ccc2",
          "#bfc8c3",
          "#d1d5d0",
          "#bac2ba",
          "#b2b6ac",
          "#a5b2aa",
          "#d8e3d7",
          "#dde3d5",
          "#d6dec9",
          "#cad3c1",
          "#c5ccc0",
          "#b7c2b2",
          "#a7ae9e",
          "#e0e6d7",
          "#cbcebe",
          "#c4d1c2",
          "#c1cec1",
          "#aac0ad",
          "#959889",
          "#888d82",
          "#cee1d4",
          "#bcd9c8",
          "#b5cbbb",
          "#adc3b4",
          "#b2cfbe",
          "#9bc2b1",
          "#9bbea9",
          "#cfdbd1",
          "#dce4d7",
          "#aacebc",
          "#aaccb9",
          "#bccab3",
          "#a8bba2",
          "#709a89",
          "#8aa282",
          "#879f84",
          "#7a9b78",
          "#7d956d",
          "#6f8c69",
          "#748c69",
          "#547053",
          "#768a75",
          "#788f74",
          "#739072",
          "#6f8d6a",
          "#658e67",
          "#61845b",
          "#558367",
          "#769358",
          "#6b8d53",
          "#699158",
          "#53713d",
          "#495e35",
          "#4b6d41",
          "#59754d",
          "#7e9b76",
          "#3c824e",
          "#3d7245",
          "#477050",
          "#5f7355",
          "#6f7755",
          "#37503d",
          "#616652",
          "#525f48",
          "#4a5335",
          "#545a3e",
          "#414f3c",
          "#414832",
          "#394034",
          "#d2e7ca",
          "#bed3bb",
          "#b4d3b2",
          "#97c1a1",
          "#9fc09c",
          "#8bba94",
          "#77a276",
          "#a0daa9",
          "#8bc28c",
          "#7cb08a",
          "#7cb083",
          "#82b185",
          "#7cb68e",
          "#76b583",
          "#7fbb9e",
          "#70a38d",
          "#4f9e81",
          "#2ea785",
          "#0f9d76",
          "#008c69",
          "#008763",
          "#6bcd9c",
          "#66bc91",
          "#60b892",
          "#3aa278",
          "#4b9b69",
          "#378661",
          "#3a795e",
          "#00a776",
          "#00a170",
          "#009e6d",
          "#009b75",
          "#007d60",
          "#007558",
          "#12674a",
          "#bfd1b3",
          "#bfd1ad",
          "#a7c796",
          "#9ebc97",
          "#92af88",
          "#91ac80",
          "#759465",
          "#b9eab3",
          "#a9d39e",
          "#a3c893",
          "#7bb369",
          "#79b465",
          "#86a96f",
          "#89a06b",
          "#b2e79f",
          "#9fc131",
          "#7ec845",
          "#79c753",
          "#39a845",
          "#44883c",
          "#476a30",
          "#7ed37f",
          "#6dce87",
          "#2bae66",
          "#45be76",
          "#6fa26b",
          "#699e6d",
          "#487d49",
          "#4db560",
          "#55a860",
          "#339c5e",
          "#009b5c",
          "#008c45",
          "#008658",
          "#1f7349",
          "#b0c965",
          "#97bc62",
          "#88b04b",
          "#75a14f",
          "#819548",
          "#739957",
          "#7b7f32",
          "#a1ca7b",
          "#9cad60",
          "#9faf6c",
          "#8db051",
          "#a0ac4f",
          "#9bb53e",
          "#7aab55",
          "#c6ec7a",
          "#c9d77e",
          "#c3d363",
          "#c4bf71",
          "#b5bf50",
          "#b5cc39",
          "#c0d725",
          "#dfef87",
          "#d3d95f",
          "#d5d717",
          "#b8af23",
          "#b5b644",
          "#c7b63c",
          "#b9a023",
          "#d7e8bc",
          "#cfe09d",
          "#cdd78a",
          "#bed38e",
          "#afcb80",
          "#a3c57d",
          "#b0b487",
          "#e7eacb",
          "#ecead0",
          "#e9eac8",
          "#f1ecca",
          "#dcd8a8",
          "#d3cca3",
          "#cbce91",
          "#e1e3a9",
          "#dfde9b",
          "#e3eaa5",
          "#dfe69f",
          "#e7df99",
          "#e1d590",
          "#e5e790",
          "#d5d593",
          "#cfc486",
          "#c5cc7b",
          "#babc72",
          "#b0b454",
          "#b7b17a",
          "#b3b17b",
          "#afaf5e",
          "#af9841",
          "#a3a04e",
          "#a09d59",
          "#9a803a",
          "#927b3c",
          "#857946",
          "#a39264",
          "#998456",
          "#9a8b4f",
          "#9c7e41",
          "#997b38",
          "#805d24",
          "#7a6332",
          "#c2cbb4",
          "#c5cfb6",
          "#d0d3b7",
          "#b5c1a5",
          "#adbba1",
          "#a8b197",
          "#a1ad92",
          "#d3dec4",
          "#cadea5",
          "#d4dbb2",
          "#cbd5b1",
          "#c3d3a8",
          "#c0cba1",
          "#b4c79c",
          "#c5cf98",
          "#c2c18d",
          "#b4bb85",
          "#a3a969",
          "#909b4c",
          "#9aa067",
          "#8d8b55",
          "#849161",
          "#77824a",
          "#81894e",
          "#757a4e",
          "#6a6f34",
          "#5e6737",
          "#595f34",
          "#a4ae77",
          "#91946e",
          "#818455",
          "#80856d",
          "#6e7153",
          "#656344",
          "#666b54",
          "#b6ba99",
          "#b5ad88",
          "#b2ac88",
          "#a49a79",
          "#a49775",
          "#817a65",
          "#746c57",
          "#999b85",
          "#938b78",
          "#a0987c",
          "#a39f86",
          "#858961",
          "#817a60",
          "#756d47",
          "#928e64",
          "#8e855f",
          "#847a59",
          "#646a45",
          "#71643e",
          "#676232",
          "#67592a",
          "#bab696",
          "#8c7c61",
          "#7c6e4f",
          "#7a643f",
          "#75663e",
          "#63563b",
          "#574d35",
          "#afab97",
          "#aba798",
          "#646049",
          "#646356",
          "#585442",
          "#535040",
          "#545144",
          "#a7a19e",
          "#9f8d89",
          "#847a75",
          "#6d625b",
          "#685c53",
          "#807669",
          "#9a9186",
          "#a49887",
          "#928475",
          "#8d7e71",
          "#b6a893",
          "#b7a793",
          "#937b6a",
          "#816d5e",
          "#ae997d",
          "#b09a77",
          "#ceb899",
          "#bca483",
          "#977c61",
          "#8b6a4f",
          "#5f4c40",
          "#f3eac3",
          "#e7d391",
          "#face6d",
          "#f4e3b5",
          "#f6e3b4",
          "#ebcf89",
          "#e4cfb6",
          "#f6e199",
          "#eee78e",
          "#f8dc6c",
          "#f9d857",
          "#f4bf3a",
          "#fbc85f",
          "#c87629",
          "#a05c17",
          "#df7500",
          "#c16512",
          "#bb5c14",
          "#a15325",
          "#944a1f",
          "#e86800",
          "#e95c20",
          "#864c24",
          "#b45422",
          "#9b4722",
          "#9e4624",
          "#a23c26",
          "#e8703a",
          "#e2552c",
          "#c34121",
          "#dd4124",
          "#ca3422",
          "#d15837",
          "#a2242f",
          "#aa0a27",
          "#a11729",
          "#aa182b",
          "#9d202f",
          "#941e32",
          "#7d2027",
          "#752329",
          "#6a2e2a",
          "#77202f",
          "#6a282c",
          "#6c2831",
          "#64242e",
          "#f2cfdc",
          "#f2c1d1",
          "#a5958f",
          "#b98391",
          "#a66e7a",
          "#b61c50",
          "#a52350",
          "#a22452",
          "#cb3373",
          "#a32857",
          "#9469a2",
          "#9d7bb0",
          "#9f86aa",
          "#46295a",
          "#563474",
          "#634878",
          "#5f4e72",
          "#a9adc2",
          "#9a9eb3",
          "#81839a",
          "#717388",
          "#2a293e",
          "#2c2a33",
          "#2a2a35",
          "#96a3c7",
          "#849bcc",
          "#b7c0d7",
          "#9ba9ca",
          "#262934",
          "#282d3c",
          "#262b37",
          "#bfcad6",
          "#bdc6dc",
          "#9eb4d3",
          "#819ac1",
          "#4a556b",
          "#253668",
          "#323441",
          "#274374",
          "#30658e",
          "#282b34",
          "#2f3441",
          "#2c333e",
          "#272f38",
          "#2d3036",
          "#b5cedf",
          "#a5c5d9",
          "#4b5b6e",
          "#2c4053",
          "#123955",
          "#005780",
          "#203e4a",
          "#a9cada",
          "#78bdd4",
          "#88c3d0",
          "#61aab1",
          "#85ced1",
          "#12403c",
          "#23312d",
          "#d5d5d8",
          "#babcc0",
          "#929090",
          "#807d7f",
          "#767275",
          "#524d50",
          "#4d4b4f",
          "#a19fa5",
          "#7f7c81",
          "#7e7d88",
          "#787376",
          "#5e5b60",
          "#5c5658",
          "#3b3b48",
          "#98979a",
          "#92949b",
          "#7f8793",
          "#585e6f",
          "#46444c",
          "#66676d",
          "#4e545b",
          "#58646d",
          "#4e5055",
          "#48464a",
          "#434447",
          "#9c9b98",
          "#73706f",
          "#94908b",
          "#a3a9a6",
          "#6b7169",
          "#43544b",
          "#213631",
          "#264e36",
          "#007844",
          "#2e3d30",
          "#b5c38e",
          "#5b5a41",
          "#444940",
          "#3f352f",
          "#433937",
          "#392d2b",
          "#382e2d",
          "#34292a",
          "#2e272a",
          "#363031",
          "#2b2929",
          "#2a2b2d",
          "#efebe7",
          "#ede6de",
          "#f0ead6",
          "#efe0cd",
          "#f6ebc8",
          "#f3eee7",
          "#f0ede5",
          "#ece99b",
          "#f1e6de",
          "#edf1fe",
          "#f0efe2",
          "#e8e3d9",
          "#d7cfbb",
          "#ebdf67",
          "#f3e779",
          "#f5d6c6",
          "#f7d1d4",
          "#dfcdc6",
          "#f8e0e7",
          "#d6cebe",
          "#c0db3a",
          "#f3dd3e",
          "#ead94e",
          "#ccdb1e",
          "#fed450",
          "#fed55d",
          "#d2c29d",
          "#e7aa56",
          "#c7bba4",
          "#f5b895",
          "#e2bdb3",
          "#dacab7",
          "#f7cdc7",
          "#f7cac9",
          "#ebced5",
          "#f7cee0",
          "#c6c5c6",
          "#c3c6c8",
          "#91dce8",
          "#98ddde",
          "#abd3db",
          "#badf30",
          "#d8ae47",
          "#fbaa4c",
          "#c0ac92",
          "#f9aa7d",
          "#cfb095",
          "#d4bab6",
          "#b1aab3",
          "#9fa9be",
          "#b9babd",
          "#92b6d5",
          "#afb1b4",
          "#98bfca",
          "#79b5db",
          "#83c2cd",
          "#95dee3",
          "#82c2c7",
          "#d69c2f",
          "#bfa58a",
          "#b18f6a",
          "#d9922e",
          "#d7942d",
          "#cca580",
          "#f4963a",
          "#fea166",
          "#fe8c18",
          "#fe840e",
          "#fe7e03",
          "#c0916c",
          "#cc7357",
          "#bd8c66",
          "#eb9687",
          "#b99bc5",
          "#b09fca",
          "#b3a0c9",
          "#91a8d0",
          "#5dafce",
          "#9a9738",
          "#9c9a40",
          "#aba44d",
          "#ada396",
          "#d27f63",
          "#c5733d",
          "#c57644",
          "#f96714",
          "#a46f44",
          "#f96531",
          "#fc642d",
          "#f77464",
          "#f7786b",
          "#98878c",
          "#9f90c1",
          "#9896a4",
          "#5d81bb",
          "#988c75",
          "#b1832f",
          "#93592b",
          "#918579",
          "#948a7a",
          "#8d7960",
          "#8b593e",
          "#c46215",
          "#897560",
          "#b95b3f",
          "#f45520",
          "#be4b3b",
          "#725f69",
          "#ce5b78",
          "#ce3175",
          "#988088",
          "#b76ba3",
          "#9879a2",
          "#9479af",
          "#9787bb",
          "#838487",
          "#8895c5",
          "#707bb4",
          "#848182",
          "#4c6a92",
          "#5a789a",
          "#5d89b3",
          "#5480ac",
          "#007cb7",
          "#3183a0",
          "#0084a1",
          "#797b3a",
          "#5a7247",
          "#65663f",
          "#4e632c",
          "#716a4d",
          "#684832",
          "#ab6819",
          "#a86217",
          "#935529",
          "#783937",
          "#8e3c36",
          "#675657",
          "#73362a",
          "#bc322c",
          "#b4262a",
          "#b61032",
          "#ba0b32",
          "#b91228",
          "#735b6a",
          "#6f5965",
          "#b2103c",
          "#c01352",
          "#c62168",
          "#7b4368",
          "#8e4483",
          "#632a60",
          "#624076",
          "#936a98",
          "#6f4685",
          "#7d5d99",
          "#5a4e8f",
          "#615c60",
          "#4d587a",
          "#4e6482",
          "#5b609e",
          "#2d62a3",
          "#006ca9",
          "#007290",
          "#0078a7",
          "#006b7e",
          "#006865",
          "#615e5f",
          "#006e51",
          "#49494d",
          "#5e5749",
          "#46483c",
          "#5f5b4c",
          "#5d5348",
          "#3c2d2e",
          "#5c3e35",
          "#543b35",
          "#5d4236",
          "#634235",
          "#5a3e36",
          "#4a342e",
          "#6e362c",
          "#56352d",
          "#66352b",
          "#72262c",
          "#7b3539",
          "#4d233d",
          "#61224a",
          "#47243b",
          "#6d4773",
          "#3e285c",
          "#27293d",
          "#3a363b",
          "#26262a",
          "#4d4b50",
          "#434452",
          "#2b272b",
          "#223a5e",
          "#35435a",
          "#0e3a53",
          "#123850",
          "#004b8d",
          "#155187",
          "#2a4b7c",
          "#0f3b57",
          "#293b4d",
          "#29495c",
          "#00637c",
          "#005265",
          "#254445",
          "#184a45",
          "#15463e"
      ]
    };

    /* src\Pantone.svelte generated by Svelte v3.6.7 */

    const file$5 = "src\\Pantone.svelte";

    function create_fragment$5(ctx) {
    	var section, small, t1, h3, t2_value = ctx.pantone.name, t2, t3, div, t4, p0, t5, t6_value = ctx.pantone.hsl.h, t6, t7, t8_value = ctx.pantone.hsl.s, t8, t9, t10_value = ctx.pantone.hsl.l, t10, t11, t12, p1, t13, t14_value = ctx.pantone.rgb[0], t14, t15, t16_value = ctx.pantone.rgb[1], t16, t17, t18_value = ctx.pantone.rgb[2], t18, t19, t20, textarea, dispose;

    	return {
    		c: function create() {
    			section = element("section");
    			small = element("small");
    			small.textContent = "Nearest Pantone";
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			t3 = space();
    			div = element("div");
    			t4 = space();
    			p0 = element("p");
    			t5 = text("hsl(");
    			t6 = text(t6_value);
    			t7 = text("deg, ");
    			t8 = text(t8_value);
    			t9 = text("%, ");
    			t10 = text(t10_value);
    			t11 = text("%)");
    			t12 = space();
    			p1 = element("p");
    			t13 = text("rgb(");
    			t14 = text(t14_value);
    			t15 = text(", ");
    			t16 = text(t16_value);
    			t17 = text(", ");
    			t18 = text(t18_value);
    			t19 = text(")");
    			t20 = space();
    			textarea = element("textarea");
    			attr(small, "class", "svelte-1gnur9y");
    			add_location(small, file$5, 173, 1, 3630);
    			attr(h3, "class", "svelte-1gnur9y");
    			add_location(h3, file$5, 174, 1, 3662);
    			attr(div, "class", "swatch svelte-1gnur9y");
    			add_location(div, file$5, 175, 1, 3687);
    			attr(p0, "tabindex", "0");
    			attr(p0, "class", "svelte-1gnur9y");
    			add_location(p0, file$5, 176, 1, 3715);
    			attr(p1, "tabindex", "0");
    			attr(p1, "class", "svelte-1gnur9y");
    			add_location(p1, file$5, 177, 1, 3814);
    			set_style(section, "--primary-hsl", ctx.pantone.hsl);
    			set_style(section, "--primary-rgb", ctx.pantone.rgb.join(', '));
    			set_style(section, "--contrast", ((ctx.pantone.hsl.l > 50) ? '#222' : 'white'));
    			attr(section, "class", "svelte-1gnur9y");
    			add_location(section, file$5, 170, 0, 3469);
    			attr(textarea, "class", "hidden-textarea svelte-1gnur9y");
    			add_location(textarea, file$5, 179, 0, 3921);

    			dispose = [
    				listen(p0, "click", copyText),
    				listen(p1, "click", copyText)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, small);
    			append(section, t1);
    			append(section, h3);
    			append(h3, t2);
    			append(section, t3);
    			append(section, div);
    			append(section, t4);
    			append(section, p0);
    			append(p0, t5);
    			append(p0, t6);
    			append(p0, t7);
    			append(p0, t8);
    			append(p0, t9);
    			append(p0, t10);
    			append(p0, t11);
    			append(section, t12);
    			append(section, p1);
    			append(p1, t13);
    			append(p1, t14);
    			append(p1, t15);
    			append(p1, t16);
    			append(p1, t17);
    			append(p1, t18);
    			append(p1, t19);
    			insert(target, t20, anchor);
    			insert(target, textarea, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.pantone) && t2_value !== (t2_value = ctx.pantone.name)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.pantone) && t6_value !== (t6_value = ctx.pantone.hsl.h)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.pantone) && t8_value !== (t8_value = ctx.pantone.hsl.s)) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.pantone) && t10_value !== (t10_value = ctx.pantone.hsl.l)) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.pantone) && t14_value !== (t14_value = ctx.pantone.rgb[0])) {
    				set_data(t14, t14_value);
    			}

    			if ((changed.pantone) && t16_value !== (t16_value = ctx.pantone.rgb[1])) {
    				set_data(t16, t16_value);
    			}

    			if ((changed.pantone) && t18_value !== (t18_value = ctx.pantone.rgb[2])) {
    				set_data(t18, t18_value);
    			}

    			if (changed.pantone) {
    				set_style(section, "--primary-hsl", ctx.pantone.hsl);
    				set_style(section, "--primary-rgb", ctx.pantone.rgb.join(', '));
    				set_style(section, "--contrast", ((ctx.pantone.hsl.l > 50) ? '#222' : 'white'));
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    				detach(t20);
    				detach(textarea);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function RGBToHSL([r, g, b]) {
    	// Make r, g, and b fractions of 1
    	r /= 255;
    	g /= 255;
    	b /= 255;

    	// Find greatest and smallest channel values
    	let cmin = Math.min(r,g,b),
    			cmax = Math.max(r,g,b),
    			delta = cmax - cmin,
    			h = 0,
    			s = 0,
    			l = 0;
    	
    	if (delta == 0)
    		h = 0;
    	// Red is max
    	else if (cmax == r)
    		h = ((g - b) / delta) % 6;
    	// Green is max
    	else if (cmax == g)
    		h = (b - r) / delta + 2;
    	// Blue is max
    	else
    		h = (r - g) / delta + 4;

    	h = Math.round(h * 60);

    	// Make negative hues positive behind 360�
    	if (h < 0)
    			h += 360;
    	
    	// Calculate lightness
    	l = (cmax + cmin) / 2;

    	// Calculate saturation
    	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    	// Multiply l and s by 100
    	s = +(s * 100).toFixed(1);
    	l = +(l * 100).toFixed(1);

    	return {h, s, l};
    }

    Pantone.rgb = Pantone.values.map(rgb => rgb.split("#")[1]
    										 .match(/.{1,2}/g)
    										 .map(val => parseInt(val, 16)));
    Pantone.hsl = Pantone.rgb.map(color => RGBToHSL(color));

    Array.min = function( array ){
    	return Math.min.apply( Math, array );
    };

    function nearestPantone(r, g, b) {
    	let nearestArr = Pantone.rgb.map(color => color
    															.reduce((err, val, i) => err += Math.abs(val - [r, g, b][i]), 0));
    	let nearest = nearestArr.reduce((min, val, i) => {
    		return (min.val < val) ? min : {val, i}}, {val: nearestArr[0], index: 0});

    	return {
    		name: Pantone.names[nearest.i],
    		hsl: Pantone.hsl[nearest.i],
    		rgb: Pantone.rgb[nearest.i]
    	}
    }

    function copyText(e) {
    	let text = e.target.innerText;
    	let textArea = document.querySelector('.hidden-textarea');
    	textArea.setAttribute('value', text);
    	textArea.innerText = text;
    	textArea.select();
    	document.execCommand('copy');
    	e.target.focus();
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let pantone = {
    			name: 'unknown',
    			hsl: {},
    			rgb: {}
    	};
    	let r, g, b;
    	rgbStore.r.subscribe(val => { const $$result = r = val; $$invalidate('r', r); return $$result; });
    	rgbStore.g.subscribe(val => { const $$result = g = val; $$invalidate('g', g); return $$result; });
    	rgbStore.b.subscribe(val => { const $$result = b = val; $$invalidate('b', b); return $$result; });

    	$$self.$$.update = ($$dirty = { r: 1, g: 1, b: 1 }) => {
    		if ($$dirty.r || $$dirty.g || $$dirty.b) { $$invalidate('pantone', pantone = nearestPantone(r, g, b)); }
    	};

    	return { pantone };
    }

    class Pantone_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.6.7 */

    function create_fragment$6(ctx) {
    	var t, current;

    	var pantone = new Pantone_1({ $$inline: true });

    	var colorpicker = new Colorpicker({ $$inline: true });

    	return {
    		c: function create() {
    			pantone.$$.fragment.c();
    			t = space();
    			colorpicker.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(pantone, target, anchor);
    			insert(target, t, anchor);
    			mount_component(colorpicker, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pantone.$$.fragment, local);

    			transition_in(colorpicker.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pantone.$$.fragment, local);
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(pantone, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(colorpicker, detaching);
    		}
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
