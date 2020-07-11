
function ajax(url){
    return new Promise((res,rej)=>{
        let xhr = new XMLHttpRequest();
        xhr.onloadend = (r)=>{
            if(xhr.status === 200){
                res(xhr.responseText);
            }else{
                rej(xhr.responseURL + ' ' + xhr.statusText);
            }
        };
        xhr.open('get', url);
        xhr.send();
    })
}

Promise.all([ajax('test.css'),ajax('test1.js')])
    .then(arr=>{
        let head = document.querySelector('head');
        let css = document.createElement('style');
        // css.type = 'text/css';
        // css.rel = 'stylesheet'; // 保留script标签的path属性
        // css.href = url;
        css.innerHTML = arr[0];
        head.appendChild(css);

        let js = document.createElement('script');
        js.innerHTML = arr[1];
        head.appendChild(js);
        head.removeChild(js);
        head.removeChild(css);
    }).then(arr=>{
        
    })
    .catch(err=>{
        console.log(3);
        console.log(err);
    })


