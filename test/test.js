function f(){
    console.log('ff');
}

let f1 = f;
let f2 = f;
let a = ['aaa',f,'bbb','ccc'];
console.log(a.includes(f1));
console.log(a.includes(f2));


