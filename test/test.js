
function f(){
    let x = 0;
    let y = f1();
    x = null;
    return y;

    function f1(){
        x++;
        return x;
    }
}

let ff = f();
console.log(ff);
ff=f();
console.log(ff);


