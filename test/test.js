let a={x:1,y:2};
let b = {c:2};
a.b = b;
b.a = a;
console.log(JSON.stringify(a));