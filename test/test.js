class A{
    constructor(a,b){
        this.a = a;
    }
}

let a = new A(1,2);
console.log(a.constructor.name);