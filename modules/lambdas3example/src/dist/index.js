"use strict";var r=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var i=Object.getOwnPropertyNames;var l=Object.prototype.hasOwnProperty;var d=(n,o)=>{for(var e in o)r(n,e,{get:o[e],enumerable:!0})},m=(n,o,e,s)=>{if(o&&typeof o=="object"||typeof o=="function")for(let t of i(o))!l.call(n,t)&&t!==e&&r(n,t,{get:()=>o[t],enumerable:!(s=a(o,t))||s.enumerable});return n};var u=n=>m(r({},"__esModule",{value:!0}),n);var g={};d(g,{handler:()=>f});module.exports=u(g);var f=async n=>(console.log(`EVENT: 
`+JSON.stringify(n,null,2)),{statusCode:200,body:JSON.stringify({message:{house:n.houseid,tenant:n.tenanantName}})});0&&(module.exports={handler});
//# sourceMappingURL=index.js.map