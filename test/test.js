let x = 1;
let wait = [];
function foo(y){
    return new Promise((res,rej)=>{
        setTimeout(()=>{
            x++;
            // for(let o in wait){
            //     res(y);
            // }
            res(y);
            console.log(x);
        },300);
    });
}

foo1();

async function foo1(){
    let f1 = await foo(1);
    let f2 = await foo(2);
    let f3 = await foo(3);
    
    
    console.log(f1);
    console.log(f2);
    console.log(f3);
}

