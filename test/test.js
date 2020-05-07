let s = `555 + "hello' yang ',\"你好\"'"`;
let reg1 = /\".*?\"/;
let reg2 = /'.*?'/;

s = "Math.floor(x*y)|number:1";
// console.log(reg1.exec(s));
// console.log(reg2.exec(s));
let reg = /[\(\)\!\|\*\/\+-><=&%]/;
let a = s.split(reg);
// console.log(a);
const replaceStr = "$$NODOM_TMPSTR";
let replaceIndex = 0;
let replaceMap = {};
let srcStr = `Math.floor(x*y)|number:1+"hello 'word',\\"your\\"" + word|touppercase + 'haha,"aa'`;
console.log(srcStr);

srcStr = srcStr.replace(/\\"/g,"$$NODOM_QUOT1");
console.log(srcStr);
let stringReg = [/".*?"/,/'.*?'/,/`.*?`/];
for(;;){
    let r;
    for(let reg of stringReg){
        let r1 = reg.exec(srcStr);
        if(!r1){
            continue;
        }
        if(!r || r.index > r1.index){
            r = r1;
        }
    }
    if(!r){
        break;
    }
    let sTmp = replaceStr + replaceIndex++;
    //存入map
    replaceMap[sTmp] = r[0];
    //
    srcStr = srcStr.substr(0,r.index) + sTmp + srcStr.substr(r.index + r[0].length);
    
}
console.log(srcStr);

// for(let i=0;i<s.length;i++){
//     console.log(s[i]);
// }