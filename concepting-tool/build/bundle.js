var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function l(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(t){return null==t?"":t}function i(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function a(t){return document.createElement(t)}function f(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function d(t){return document.createTextNode(t)}function p(){return d(" ")}function m(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function h(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.data!==e&&(t.data=e)}let y;function w(t){y=t}function $(t){(function(){if(!y)throw new Error("Function called outside component initialization");return y})().$$.on_mount.push(t)}const v=[],b=[],_=[],k=[],x=Promise.resolve();let S=!1;function C(){S||(S=!0,x.then(T))}function E(t){_.push(t)}function T(){const t=new Set;do{for(;v.length;){const t=v.shift();w(t),M(t.$$)}for(;b.length;)b.pop()();for(let e=0;e<_.length;e+=1){const n=_[e];t.has(n)||(n(),t.add(n))}_.length=0}while(v.length);for(;k.length;)k.pop()();S=!1}function M(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(E)}}const A=new Set;function j(t,e){t&&t.i&&(A.delete(t),t.i(e))}function D(t,e){t.d(1),e.delete(t.key)}function L(r,c,i,s,u,a,f=[-1]){const d=y;w(r);const p=c.props||{},m=r.$$={fragment:null,ctx:null,props:a,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:n(),dirty:f};let h=!1;m.ctx=i?i(r,p,(t,e,...n)=>{const o=n.length?n[0]:e;return m.ctx&&u(m.ctx[t],m.ctx[t]=o)&&(m.bound[t]&&m.bound[t](o),h&&function(t,e){-1===t.$$.dirty[0]&&(v.push(t),C(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}(r,t)),e}):[],m.update(),h=!0,o(m.before_update),m.fragment=!!s&&s(m.ctx),c.target&&(c.hydrate?m.fragment&&m.fragment.l(function(t){return Array.from(t.childNodes)}(c.target)):m.fragment&&m.fragment.c(),c.intro&&j(r.$$.fragment),function(t,n,r){const{fragment:c,on_mount:i,on_destroy:s,after_update:u}=t.$$;c&&c.m(n,r),E(()=>{const n=i.map(e).filter(l);s?s.push(...n):o(n),t.$$.on_mount=[]}),u.forEach(E)}(r,c.target,c.anchor),T()),w(d)}function P(t,e,n){const o=t.slice();return o[16]=e[n],o[18]=n,o}function O(t,e,n){const o=t.slice();return o[19]=e[n],o[21]=n,o}function R(t){let e,n=[],o=new Map,l=t[2];const r=t=>"style-control_"+t[21];for(let e=0;e<l.length;e+=1){let c=O(t,l,e),i=r(c);o.set(i,n[e]=W(i,c))}return{c(){e=a("section");for(let t=0;t<n.length;t+=1)n[t].c();h(e,"class","control_group svelte-7kope0")},m(t,o){s(t,e,o);for(let t=0;t<n.length;t+=1)n[t].m(e,null)},p(t,l){const c=t[2];n=function(t,e,n,o,l,r,c,i,s,u,a,f){let d=t.length,p=r.length,m=d;const h={};for(;m--;)h[t[m].key]=m;const g=[],y=new Map,w=new Map;for(m=p;m--;){const t=f(l,r,m),i=n(t);let s=c.get(i);s?o&&s.p(t,e):(s=u(i,t),s.c()),y.set(i,g[m]=s),i in h&&w.set(i,Math.abs(m-h[i]))}const $=new Set,v=new Set;function b(t){j(t,1),t.m(i,a),c.set(t.key,t),a=t.first,p--}for(;d&&p;){const e=g[p-1],n=t[d-1],o=e.key,l=n.key;e===n?(a=e.first,d--,p--):y.has(l)?!c.has(o)||$.has(o)?b(e):v.has(l)?d--:w.get(o)>w.get(l)?(v.add(o),b(e)):($.add(l),d--):(s(n,c),d--)}for(;d--;){const e=t[d];y.has(e.key)||s(e,c)}for(;p;)b(g[p-1]);return g}(n,l,r,1,t,c,o,e,D,W,null,O)},d(t){t&&u(e);for(let t=0;t<n.length;t+=1)n[t].d()}}}function W(t,e){let n,o,l,r,c,f,y,w,$,v,b,_,k=e[19][0].slice(2,e[19][0].length).replace("-"," ")+"",x=e[19][1]+"";function S(...t){return e[13](e[21],...t)}return{key:t,first:null,c(){n=a("label"),o=a("span"),l=d(k),r=p(),c=a("input"),w=p(),$=a("span"),v=d(x),b=p(),h(o,"class","label svelte-7kope0"),h(c,"type",f=e[19][0].includes("color")?"color":"text"),c.value=y=e[19][1],h($,"class","value svelte-7kope0"),h(n,"class","control svelte-7kope0"),this.first=n},m(t,e){s(t,n,e),i(n,o),i(o,l),i(n,r),i(n,c),i(n,w),i(n,$),i($,v),i(n,b),_=m(c,"input",S)},p(t,n){e=t,4&n&&k!==(k=e[19][0].slice(2,e[19][0].length).replace("-"," ")+"")&&g(l,k),4&n&&f!==(f=e[19][0].includes("color")?"color":"text")&&h(c,"type",f),4&n&&y!==(y=e[19][1])&&c.value!==y&&(c.value=y),4&n&&x!==(x=e[19][1]+"")&&g(v,x)},d(t){t&&u(n),_()}}}function H(t){let e,n,o,l,r,c,f,g,y,w,$=B,v=[];for(let e=0;e<$.length;e+=1)v[e]=I(P(t,$,e));return{c(){e=a("form"),n=a("label"),o=d("Enter a filename from within the local "),l=a("code"),l.textContent="/static/pages/",r=d(" directory.\n\t\t\t"),c=a("select"),f=a("option"),f.textContent="Pick a page";for(let t=0;t<v.length;t+=1)v[t].c();g=p(),y=a("button"),y.textContent="Submit",f.__value="",f.value=f.__value,h(c,"name","url"),h(y,"type","submit"),h(e,"class","page-picker"),h(e,"action",""),h(e,"method","post")},m(u,a){s(u,e,a),i(e,n),i(n,o),i(n,l),i(n,r),i(n,c),i(c,f);for(let t=0;t<v.length;t+=1)v[t].m(c,null);i(e,g),i(e,y),w=m(e,"submit",t[5])},p(t,e){if(0&e){let n;for($=B,n=0;n<$.length;n+=1){const o=P(t,$,n);v[n]?v[n].p(o,e):(v[n]=I(o),v[n].c(),v[n].m(c,null))}for(;n<v.length;n+=1)v[n].d(1);v.length=$.length}},d(t){t&&u(e),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(v,t),w()}}}function U(e){let n;return{c(){n=a("iframe"),n.innerHTML="<p>Sorry, your iframe isn&#39;t loading!</p>",h(n,"title","page-preview"),h(n,"width","100%"),h(n,"height","100%"),n.allowFullscreen=!0},m(t,o){s(t,n,o),e[15](n)},p:t,d(t){t&&u(n),e[15](null)}}}function I(e){let n,o,l,r=e[16]+"";return{c(){n=a("option"),o=d(r),n.__value=l=e[16],n.value=n.__value},m(t,e){s(t,n,e),i(n,o)},p:t,d(t){t&&u(n)}}}function N(e){let n,o,l,r,y,w,$,v,b,_,k,x,S,C,E,T,M=e[3]?"Close":"Open",A=e[2]instanceof Array&&R(e);function j(t,e){return t[0]?U:H}let D=j(e),L=D(e);return{c(){n=a("main"),o=a("section"),l=a("h1"),l.textContent="Site Theming Tool",r=p(),A&&A.c(),w=p(),$=a("button"),v=f("svg"),b=f("path"),_=p(),k=a("span"),x=d(M),S=d(" Tool Bar"),E=p(),L.c(),h(l,"class","svelte-7kope0"),h(o,"class",y=c(`side-bar ${e[3]?"open":""}`)+" svelte-7kope0"),h(b,"d","M 1 2.5 l 8 0 M 7 1 l 2 1.5 l -2 1.5"),h(b,"class","svelte-7kope0"),h(v,"viewBox","0 0 10 5"),h(v,"class","svelte-7kope0"),h(k,"class","svelte-7kope0"),h($,"class",C=c(`side-bar_toggle ${e[3]?"open":""}`)+" svelte-7kope0"),h(n,"class","svelte-7kope0")},m(t,c){s(t,n,c),i(n,o),i(o,l),i(o,r),A&&A.m(o,null),i(n,w),i(n,$),i($,v),i(v,b),i($,_),i($,k),i(k,x),i(k,S),i(n,E),L.m(n,null),T=m($,"click",e[14])},p(t,[e]){t[2]instanceof Array?A?A.p(t,e):(A=R(t),A.c(),A.m(o,null)):A&&(A.d(1),A=null),8&e&&y!==(y=c(`side-bar ${t[3]?"open":""}`)+" svelte-7kope0")&&h(o,"class",y),8&e&&M!==(M=t[3]?"Close":"Open")&&g(x,M),8&e&&C!==(C=c(`side-bar_toggle ${t[3]?"open":""}`)+" svelte-7kope0")&&h($,"class",C),D===(D=j(t))&&L?L.p(t,e):(L.d(1),L=D(t),L&&(L.c(),L.m(n,null)))},i:t,o:t,d(t){t&&u(n),A&&A.d(),L.d(),T()}}}let B=["landing-page","blog-template"],F=Array.from(new URL(document.location).searchParams.entries());function q(t,e,n){let o,l,r=F.find(t=>"url"===t[0]),c=!0,i=[],s=!0,u="";async function a(){if(!F.find(t=>"url"===t[0]))return;n(1,o.src=F.find(t=>"url"===t[0])?`./pages/${F.find(t=>"url"===t[0])[1]}`:"",o);await(t=o,new Promise((e,n)=>{t.onload=()=>e(!0),t.onerror=n})).catch(t=>console.error(t));var t;n(2,l=function(t){const e=Array.from(t.contentDocument.styleSheets).filter(e=>null===e.href||e.href.startsWith(t.contentWindow.origin)).reduce((e,n)=>[...e,...Array.from(n.cssRules).reduce((e,n)=>"body"===n.selectorText||":root"===n.selectorText||"*"===n.selectorText?[...e,...Array.from(n.style).filter(t=>t.startsWith("--")).map(e=>[e,"body"===n.selectorText?t.contentWindow.getComputedStyle(t.contentDocument.body).getPropertyValue(e):t.contentWindow.getComputedStyle(t.contentDocument.documentElement).getPropertyValue(e)])]:e,[])],[]);return console.log("previewStyles = ",e),e}(o).map(t=>(p.find(e=>e[0]===t[0])&&(t[1]=p.find(e=>e[0]===t[0])[1]),t))),c&&(c=!1,i=[...l.map(t=>[...t])])}function f(t,e){const o=l;if(n(2,l[e][1]=t.target.value,l),n(2,l=o),d(),u){const t=window.location.href.slice(0,window.location.href.indexOf("?")>=0?window.location.href.indexOf("?"):window.location.href.length)+u;window.history.replaceState(null,"",t)}}function d(){if(F&&l){console.log("originalStyles",i);const t=l.filter((t,e)=>t[1]!==i[e][1]);u="?"+`${F.find(t=>"url"===t[0])?"url="+F.find(t=>"url"===t[0])[1]:""}${t?t.length>1?"&"+t.map(t=>encodeURIComponent(t[0])+"="+encodeURIComponent(t[1])).join("&"):"&"+encodeURIComponent(t[0][0])+"="+encodeURIComponent(t[0][1]):""}`}}$(a);let p;return t.$$.update=()=>{if(6&t.$$.dirty&&o&&o.contentDocument&&l){const t=o.contentDocument.documentElement.innerHTML.includes('style id="injected"');n(1,o.contentDocument.documentElement.innerHTML=t?o.contentDocument.documentElement.innerHTML.replace(/<style id="injected">(.|\t|\r|\n)*<\/head>/,`<style id='injected'>\n\t\t\tbody { ${l.map(t=>t[0]+": "+t[1]).join("; ")} }\n\t\t</style>\n\t\t</head>`):o.contentDocument.documentElement.innerHTML.replace("</head>",`<style id='injected'>\n\t\t\tbody { ${l.map(t=>t[0]+": "+t[1]).join("; ")} }\n\t\t</style>\n\t\t</head>`),o)}},p=F.filter(t=>t[0].startsWith("--")),[r,o,l,s,f,async function(t){t.preventDefault();const e=t.target.querySelector("select"),o=e.value;let l=await fetch("./pages/"+o);if(l=404!==l.status,console.log("localPageFound = ",l),!l)return void(e.value="");const c=[...F];c.push(["url",o]),F=c,n(0,r=!0),await(C(),x),window.history.replaceState(null,"",window.location.href+"?url="+o),a()},c,i,u,p,"",a,d,(t,e)=>f(e,t),()=>n(3,s=!s),function(t){b[t?"unshift":"push"](()=>{n(1,o=t)})}]}return new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}{constructor(t){super(),L(this,t,q,N,r,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
