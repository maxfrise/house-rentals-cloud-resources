"use strict";var r=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var d=Object.prototype.hasOwnProperty;var i=(n,o)=>{for(var t in o)r(n,t,{get:o[t],enumerable:!0})},g=(n,o,t,s)=>{if(o&&typeof o=="object"||typeof o=="function")for(let e of l(o))!d.call(n,e)&&e!==t&&r(n,e,{get:()=>o[e],enumerable:!(s=a(o,e))||s.enumerable});return n};var m=n=>g(r({},"__esModule",{value:!0}),n);var c={};i(c,{handler:()=>u});module.exports=m(c);var u=async n=>(console.log(`EVENT: 
`+JSON.stringify(n,null,2)),console.log("new log added"),{statusCode:200,body:JSON.stringify({message:{house:n.houseid,tenant:n.tenanantName}})});0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
