/*class cls1{
    constructor(a){
        this.a = a;
    }
    
}
console.log(/^\$\S+/.test('$ 1abc'));*/

let data = {a:1,b:2}
Object.defineProperty(data, 'a', {
    configurable:true,
    // writable:true,
    // value:1,
    set: (v)=> {
        if(v !== data.a){
            console.log(v);
        }
        // data.a = v;
    },
    get: ()=> {
        return this.a;
    }
});

data.a = 3;
console.log(data.a);

// console.log("abc//ace\/abce/ab/".replace(/\\\//g,'\/'));

