class cls1{
    constructor(a){
        this.a = a;
    }
    
}

class cls2 extends cls1{
    constructor(a,b){
        super(a);
        this.b = b;
    }

    sayHello(){
        console.log('hello');
    }
}

let x = new cls2();
let y = {};
Object.getOwnPropertyNames(x).forEach((item)=>{
    y[item] = x[item];
});
y.__proto__ = cls2.prototype;
y.sayHello();

// console.log("abc//ace\/abce/ab/".replace(/\\\//g,'\/'));

