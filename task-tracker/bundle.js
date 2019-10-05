
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(document);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
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
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
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

    /* src\TaskTable.svelte generated by Svelte v3.12.1 */

    const file = "src\\TaskTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.task = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (77:2) {#each tasks as task, i (task.task + task.startTime)}
    function create_each_block(key_1, ctx) {
    	var tr, td0, t0_value = ctx.task.client + "", t0, t1, td1, t2_value = ctx.task.task + "", t2, t3, td2, t4_value = ctx.formatTime(ctx.task.startTime) + "", t4, t5, td3, t6_value = ctx.formatTime(ctx.task.endTime) + "", t6, t7, td4, t8_value = ctx.calcDuration(ctx.task.startTime, ctx.task.endTime) + "", t8, t9, button, t10, button_data_id_value, dispose;

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			button = element("button");
    			t10 = text("🗑");
    			attr_dev(td0, "class", "svelte-622kvv");
    			add_location(td0, file, 78, 3, 1830);
    			attr_dev(td1, "class", "svelte-622kvv");
    			add_location(td1, file, 79, 3, 1858);
    			attr_dev(td2, "class", "c svelte-622kvv");
    			add_location(td2, file, 80, 3, 1884);
    			attr_dev(td3, "class", "c svelte-622kvv");
    			add_location(td3, file, 81, 3, 1937);
    			attr_dev(td4, "class", "c svelte-622kvv");
    			add_location(td4, file, 82, 3, 1988);
    			attr_dev(button, "class", "btn_del svelte-622kvv");
    			attr_dev(button, "data-id", button_data_id_value = ctx.i);
    			add_location(button, file, 83, 6, 2060);
    			attr_dev(tr, "class", "svelte-622kvv");
    			add_location(tr, file, 77, 2, 1822);
    			dispose = listen_dev(button, "click", ctx.delTask);
    			this.first = tr;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, button);
    			append_dev(button, t10);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.tasks) && t0_value !== (t0_value = ctx.task.client + "")) {
    				set_data_dev(t0, t0_value);
    			}

    			if ((changed.tasks) && t2_value !== (t2_value = ctx.task.task + "")) {
    				set_data_dev(t2, t2_value);
    			}

    			if ((changed.tasks) && t4_value !== (t4_value = ctx.formatTime(ctx.task.startTime) + "")) {
    				set_data_dev(t4, t4_value);
    			}

    			if ((changed.tasks) && t6_value !== (t6_value = ctx.formatTime(ctx.task.endTime) + "")) {
    				set_data_dev(t6, t6_value);
    			}

    			if ((changed.tasks) && t8_value !== (t8_value = ctx.calcDuration(ctx.task.startTime, ctx.task.endTime) + "")) {
    				set_data_dev(t8, t8_value);
    			}

    			if ((changed.tasks) && button_data_id_value !== (button_data_id_value = ctx.i)) {
    				attr_dev(button, "data-id", button_data_id_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(77:2) {#each tasks as task, i (task.task + task.startTime)}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var table, tbody, tr0, th0, t1, th1, t3, th2, t5, th3, t7, th4, t9, each_blocks = [], each_1_lookup = new Map(), t10, tr1, td0, input0, t11, td1, input1, t12, td2, input2, t13, td3, input3, t14, td4, button, dispose;

    	let each_value = ctx.tasks;

    	const get_key = ctx => ctx.task.task + ctx.task.startTime;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tbody = element("tbody");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Client";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Task";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Start";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "End";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Duration";
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			tr1 = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t11 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t12 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t13 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t14 = space();
    			td4 = element("td");
    			button = element("button");
    			button.textContent = "Add Task";
    			attr_dev(th0, "class", "l svelte-622kvv");
    			add_location(th0, file, 70, 3, 1648);
    			attr_dev(th1, "class", "l svelte-622kvv");
    			add_location(th1, file, 71, 3, 1677);
    			attr_dev(th2, "class", "svelte-622kvv");
    			add_location(th2, file, 72, 3, 1704);
    			attr_dev(th3, "class", "svelte-622kvv");
    			add_location(th3, file, 73, 3, 1722);
    			attr_dev(th4, "class", "svelte-622kvv");
    			add_location(th4, file, 74, 3, 1738);
    			add_location(tr0, file, 69, 2, 1640);
    			attr_dev(input0, "id", "input_client");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Client, LLC");
    			attr_dev(input0, "class", "svelte-622kvv");
    			add_location(input0, file, 88, 4, 2164);
    			attr_dev(td0, "class", "svelte-622kvv");
    			add_location(td0, file, 87, 3, 2155);
    			attr_dev(input1, "class", "input_task-name svelte-622kvv");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Enter a new task");
    			add_location(input1, file, 92, 4, 2314);
    			attr_dev(td1, "class", "svelte-622kvv");
    			add_location(td1, file, 91, 3, 2305);
    			attr_dev(input2, "type", "time");
    			attr_dev(input2, "class", "svelte-622kvv");
    			add_location(input2, file, 97, 4, 2491);
    			attr_dev(td2, "class", "c svelte-622kvv");
    			add_location(td2, file, 96, 3, 2472);
    			attr_dev(input3, "type", "time");
    			attr_dev(input3, "class", "svelte-622kvv");
    			add_location(input3, file, 101, 4, 2610);
    			attr_dev(td3, "class", "c svelte-622kvv");
    			add_location(td3, file, 100, 3, 2591);
    			attr_dev(button, "class", "btn_add svelte-622kvv");
    			add_location(button, file, 105, 4, 2727);
    			attr_dev(td4, "class", "c svelte-622kvv");
    			add_location(td4, file, 104, 3, 2708);
    			attr_dev(tr1, "class", "svelte-622kvv");
    			add_location(tr1, file, 86, 2, 2147);
    			add_location(tbody, file, 68, 1, 1630);
    			attr_dev(table, "class", "svelte-622kvv");
    			add_location(table, file, 67, 0, 1621);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input0, "keyup", ctx.handleFormKeyUp),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(input1, "keyup", ctx.handleFormKeyUp),
    				listen_dev(input2, "input", ctx.input2_input_handler),
    				listen_dev(input2, "keyup", ctx.handleFormKeyUp),
    				listen_dev(input3, "input", ctx.input3_input_handler),
    				listen_dev(input3, "keyup", ctx.handleFormKeyUp),
    				listen_dev(button, "click", ctx.addTask)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tbody);
    			append_dev(tbody, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tbody, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t10);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, input0);

    			set_input_value(input0, ctx.newTask.client);

    			append_dev(tr1, t11);
    			append_dev(tr1, td1);
    			append_dev(td1, input1);

    			set_input_value(input1, ctx.newTask.task);

    			append_dev(tr1, t12);
    			append_dev(tr1, td2);
    			append_dev(td2, input2);

    			set_input_value(input2, ctx.newTask.startTime);

    			append_dev(tr1, t13);
    			append_dev(tr1, td3);
    			append_dev(td3, input3);

    			set_input_value(input3, ctx.newTask.endTime);

    			append_dev(tr1, t14);
    			append_dev(tr1, td4);
    			append_dev(td4, button);
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.tasks;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block, t10, get_each_context);

    			if (changed.newTask && (input0.value !== ctx.newTask.client)) set_input_value(input0, ctx.newTask.client);
    			if (changed.newTask && (input1.value !== ctx.newTask.task)) set_input_value(input1, ctx.newTask.task);
    			if (changed.newTask) set_input_value(input2, ctx.newTask.startTime);
    			if (changed.newTask) set_input_value(input3, ctx.newTask.endTime);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(table);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function now() {
    	let now = new Date(Date.now());
    	return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    }

    function nowPlusMins(mins) {
    	let hrs = 0;
    	let now = new Date(Date.now());
    	if (now.getMinutes()+15 > 60) {
    		hrs = 1;
    		mins = now.getMinutes()+15%60;
    	} else {
    		hrs = 0;
    		mins = now.getMinutes()+15;
    	}
    	return `${now.getHours()+hrs}:${mins.toString().padStart(2,'0')}`
    }

    function addDateToTime(date, time) {
    	return new Date(date.getYear() +' '+date.getMonth()+' '+ date.getDate() +' '+ time)
    }

    function createNewTask() {
    	return {
    		client: '',
    		task: '',
    		startTime: now(),
    		endTime: nowPlusMins(15)
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { date = '', tasks = [] } = $$props;
    	let newTask = createNewTask();
    	
    	function formatTime(timeStr) {
    		let timeDate = addDateToTime(date, timeStr);
    		return `${(timeDate.getHours() <= 12) ? timeDate.getHours() : timeDate.getHours() - 12 }:${timeDate.getMinutes().toString().padStart(2, '0')} ${(timeDate.getHours() < 12) ? 'am' : 'pm'}`
    	}
    	
    	function calcDuration(start, end) {
    		let startT = addDateToTime(date, start);
    		let endT = addDateToTime(date, end);
    		let dur = endT - startT;
    		return `${Math.floor(dur/1000/60/60)}h ${dur/1000/60%60}m`
    	}
    	
    	function addTask() {
    		$$invalidate('tasks', tasks = [...tasks, newTask]);
    		$$invalidate('newTask', newTask = createNewTask());
    		document.getElementById('input_client').focus();
    	}
    	
    	function handleFormKeyUp(e) {
    		if (e.key === 'Enter') {
    			addTask();
    		}
    	}
    	
    	function delTask(e) {
    		let tasksCopy = [...tasks];
    		let i = parseInt(e.target.dataset.id);
    		$$invalidate('tasks', tasks = [...tasksCopy.slice(0, i), ...tasksCopy.slice(i+1)]);
    	}

    	const writable_props = ['date', 'tasks'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<TaskTable> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		newTask.client = this.value;
    		$$invalidate('newTask', newTask);
    	}

    	function input1_input_handler() {
    		newTask.task = this.value;
    		$$invalidate('newTask', newTask);
    	}

    	function input2_input_handler() {
    		newTask.startTime = this.value;
    		$$invalidate('newTask', newTask);
    	}

    	function input3_input_handler() {
    		newTask.endTime = this.value;
    		$$invalidate('newTask', newTask);
    	}

    	$$self.$set = $$props => {
    		if ('date' in $$props) $$invalidate('date', date = $$props.date);
    		if ('tasks' in $$props) $$invalidate('tasks', tasks = $$props.tasks);
    	};

    	$$self.$capture_state = () => {
    		return { date, tasks, newTask };
    	};

    	$$self.$inject_state = $$props => {
    		if ('date' in $$props) $$invalidate('date', date = $$props.date);
    		if ('tasks' in $$props) $$invalidate('tasks', tasks = $$props.tasks);
    		if ('newTask' in $$props) $$invalidate('newTask', newTask = $$props.newTask);
    	};

    	return {
    		date,
    		tasks,
    		newTask,
    		formatTime,
    		calcDuration,
    		addTask,
    		handleFormKeyUp,
    		delTask,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	};
    }

    class TaskTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["date", "tasks"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "TaskTable", options, id: create_fragment.name });
    	}

    	get date() {
    		throw new Error("<TaskTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<TaskTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tasks() {
    		throw new Error("<TaskTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tasks(value) {
    		throw new Error("<TaskTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\App.svelte";

    function create_fragment$1(ctx) {
    	var header, h1, t1, div, button0, t3, h2, t4, t5, button1, t7, button2, t9, main, updating_date, updating_tasks, current, dispose;

    	function tasktable_date_binding(value) {
    		ctx.tasktable_date_binding.call(null, value);
    		updating_date = true;
    		add_flush_callback(() => updating_date = false);
    	}

    	function tasktable_tasks_binding(value_1) {
    		ctx.tasktable_tasks_binding.call(null, value_1);
    		updating_tasks = true;
    		add_flush_callback(() => updating_tasks = false);
    	}

    	let tasktable_props = {};
    	if (ctx.date !== void 0) {
    		tasktable_props.date = ctx.date;
    	}
    	if (ctx.tasks !== void 0) {
    		tasktable_props.tasks = ctx.tasks;
    	}
    	var tasktable = new TaskTable({ props: tasktable_props, $$inline: true });

    	binding_callbacks.push(() => bind(tasktable, 'date', tasktable_date_binding));
    	binding_callbacks.push(() => bind(tasktable, 'tasks', tasktable_tasks_binding));

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Task Tracker";
    			t1 = space();
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "⬅";
    			t3 = space();
    			h2 = element("h2");
    			t4 = text(ctx.dateString);
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "➡";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Clear Tasks";
    			t9 = space();
    			main = element("main");
    			tasktable.$$.fragment.c();
    			attr_dev(h1, "class", "svelte-1r7sb1i");
    			add_location(h1, file$1, 34, 1, 1018);
    			attr_dev(button0, "class", "svelte-1r7sb1i");
    			add_location(button0, file$1, 36, 2, 1072);
    			attr_dev(h2, "class", "svelte-1r7sb1i");
    			add_location(h2, file$1, 37, 2, 1116);
    			attr_dev(button1, "class", "svelte-1r7sb1i");
    			add_location(button1, file$1, 38, 2, 1142);
    			attr_dev(div, "class", "date-container svelte-1r7sb1i");
    			add_location(div, file$1, 35, 1, 1041);
    			attr_dev(button2, "class", "btn_clear-task svelte-1r7sb1i");
    			add_location(button2, file$1, 40, 1, 1189);
    			attr_dev(header, "class", "svelte-1r7sb1i");
    			add_location(header, file$1, 33, 0, 1008);
    			add_location(main, file$1, 42, 0, 1273);

    			dispose = [
    				listen_dev(button0, "click", ctx.previousDay),
    				listen_dev(button1, "click", ctx.nextDay),
    				listen_dev(button2, "click", ctx.clearTasks)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, div);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, h2);
    			append_dev(h2, t4);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			append_dev(header, t7);
    			append_dev(header, button2);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(tasktable, main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.dateString) {
    				set_data_dev(t4, ctx.dateString);
    			}

    			var tasktable_changes = {};
    			if (!updating_date && changed.date) {
    				tasktable_changes.date = ctx.date;
    			}
    			if (!updating_tasks && changed.tasks) {
    				tasktable_changes.tasks = ctx.tasks;
    			}
    			tasktable.$set(tasktable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(tasktable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(tasktable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(header);
    				detach_dev(t9);
    				detach_dev(main);
    			}

    			destroy_component(tasktable);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    let name = 'world';

    function instance$1($$self, $$props, $$invalidate) {
    	
    	let date = new Date(Date.now());
    	
    	function clearTasks() {
    		$$invalidate('tasks', tasks = []);
    	}
    	
    	afterUpdate(() => {
    		console.log(`I'm gonna store the following string in memory at ${storageString}:\n${JSON.stringify(tasks)}`);
    		localStorage.setItem(storageString, JSON.stringify(tasks));
    	});

    	const dayInMS = 1000*60*60*24;
    	function changeDate(change) {
    		return date.getTime() + change*dayInMS
    	}

    	function nextDay() {
    		$$invalidate('date', date = new Date(changeDate(1)));
    		console.log(date, dateString);
    	}
    	function previousDay() {
    		$$invalidate('date', date = new Date(changeDate(-1)));
    		console.log(date, dateString);
    	}

    	function tasktable_date_binding(value) {
    		date = value;
    		$$invalidate('date', date);
    	}

    	function tasktable_tasks_binding(value_1) {
    		tasks = value_1;
    		$$invalidate('tasks', tasks), $$invalidate('storageString', storageString), $$invalidate('date', date);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) name = $$props.name;
    		if ('date' in $$props) $$invalidate('date', date = $$props.date);
    		if ('dateString' in $$props) $$invalidate('dateString', dateString = $$props.dateString);
    		if ('storageString' in $$props) $$invalidate('storageString', storageString = $$props.storageString);
    		if ('tasks' in $$props) $$invalidate('tasks', tasks = $$props.tasks);
    	};

    	let dateString, storageString, tasks;

    	$$self.$$.update = ($$dirty = { date: 1, storageString: 1 }) => {
    		if ($$dirty.date) { $$invalidate('dateString', dateString = `${date.getMonth()+1}/${date.getDate()}`); }
    		if ($$dirty.date) { $$invalidate('storageString', storageString = `task-tracker-${date.getMonth()+1}-${date.getDate()}`); }
    		if ($$dirty.storageString) { $$invalidate('tasks', tasks = (localStorage.getItem(storageString)) ? JSON.parse(localStorage.getItem(storageString)) : [{client: 'eko',task: 'Make a spreadsheet',	startTime: '13:04',	endTime: '13:34'}]); }
    	};

    	return {
    		date,
    		clearTasks,
    		nextDay,
    		previousDay,
    		dateString,
    		tasks,
    		tasktable_date_binding,
    		tasktable_tasks_binding
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$1.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
