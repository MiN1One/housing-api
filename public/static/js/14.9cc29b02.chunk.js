(this["webpackJsonpdormitory-view"]=this["webpackJsonpdormitory-view"]||[]).push([[14],{192:function(e,s,c){},198:function(e,s,c){"use strict";c.r(s);var t=c(8),a=c(2),i=c.n(a),n=c(176),o=c(194),m=c(193),r=c(175),l=c(49),d=(c(138),c(141),c(192),c(144)),j=c(137),b=c(140),_=c(3),h=c(1);m.a.use([r.a]);var x=function(e){var s=e.data,c=e.selectedIndex,i=e.setSelectedIndex,m=(e.discount,Object(a.useState)(null)),r=Object(t.a)(m,2),x=r[0],O=r[1],u=Object(_.f)(),f=Object(_.g)();Object(a.useEffect)((function(){return x&&x.update()}));var N=null===s||void 0===s?void 0:s.map((function(e,s){var t=["rooms__item"];return s===c&&t.push("rooms__item--active"),Object(h.jsxs)(n.a,{className:t.join(" "),tabIndex:"0",onClick:function(){i(s),u.push("".concat(f.pathname,"#")),setTimeout((function(){u.push("".concat(f.pathname,"#details"))}),0)},children:[Object(h.jsxs)("figure",{className:"rooms__item__figure",children:[Object(h.jsx)("img",{className:"img img--contain",alt:"standard",src:d.a}),s===c&&Object(h.jsx)("div",{className:"rooms__item__badge",children:"Selected"}),e.offers&&e.offers.length>0&&Object(h.jsxs)("span",{className:"rooms__item__badge rooms__item__badge--tag",children:[e.offers.length," offer/s"]})]}),Object(h.jsxs)("div",{className:"rooms__item__body",children:[Object(h.jsxs)("span",{className:"rooms__item__title",children:["Room option ",s+1]}),Object(h.jsxs)("div",{className:"rooms__item__features",children:[Object(h.jsxs)("div",{className:"flex aic mb-1",children:[Object(h.jsx)(j.e,{className:"icon--sm icon--grey mr-1"}),"Rooms: ",e.numberOfRooms]}),Object(h.jsxs)("div",{className:"flex aic mb-1",children:[Object(h.jsx)(l.f,{className:"icon--sm icon--grey mr-1"}),"Condition: ",e.condition]}),Object(h.jsxs)("div",{className:"flex aic mb-1",children:[Object(h.jsx)(b.h,{className:"icon--sm icon--grey mr-1"}),"Kitchen: ",e.kitchen]}),Object(h.jsxs)("div",{className:"flex aic",children:[Object(h.jsx)(b.a,{className:"icon--sm icon--grey mr-1"}),"Bathroom: ",e.bath]})]})]}),Object(h.jsx)("div",{className:"rooms__item__footer",children:Object(h.jsxs)("span",{className:"rooms__item__price",children:["$",e.price,Object(h.jsx)("span",{className:"f-sm",children:"\xa0/\xa0week"})]})})]},s)}));return Object(h.jsxs)("div",{className:"rooms",id:"options",children:[Object(h.jsx)("h3",{className:"heading heading--3 mb-15",children:"Room options"}),Object(h.jsxs)("div",{className:"flex w-100 mb-2 aic",children:[Object(h.jsx)("button",{className:"btn--slider rooms__btn--prev",children:Object(h.jsx)(l.a,{className:"icon--sm icon--dark"})}),Object(h.jsx)("button",{className:"btn--slider rooms__btn--next",children:Object(h.jsx)(l.d,{className:"icon--sm icon--dark"})}),Object(h.jsx)("span",{className:"f-lg c-grace ml-1",children:"Slide to see other options"})]}),Object(h.jsx)("div",{children:Object(h.jsx)(o.a,{className:"rooms__list",simulateTouch:!1,slidesPerView:3,spaceBetween:20,onInit:function(e){return O(e)},navigation:{nextEl:".rooms__btn--next",prevEl:".rooms__btn--prev",disabledClass:"btn--slider-disabled"},children:N})})]})};s.default=i.a.memo(x)}}]);
//# sourceMappingURL=14.9cc29b02.chunk.js.map