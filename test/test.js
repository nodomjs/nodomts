console.time();
for(let i=0;i<10000;i++){
    eval(`
    x = 1;
    x++;
    x++;
    x++;
    `);
}

console.timeEnd();