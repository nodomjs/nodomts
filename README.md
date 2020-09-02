# Nodom

NoDom是一套基于数据驱动渲染的的前端框架，用于搭建单页应用(SPA)，目前发展到2.0。

## 版本
在1.0的基础上，2.0版本做了以下几个大的改变：
1. 由html element全面改成虚拟dom，即由json数据对象方式管理模块dom树，同时强化虚拟dom操作；
2. 增加了IoC模式，模块支持即插即用，支持模块单例和非单例模式，灵活掌控资源消耗；
3. 改变插件接入方式，支持自定义element tag接入和对象化接入；
4. 提供大量插件，便于快速搭建应用，插件持续增加。

*注：因调整结构较大，1.0版本不再支持更新，2.0版本用户直接使用方式改变很小，但深度使用方式（如自定义指令、插件等）改变较大。*    
 
## 名词
### 模块(Module)
NoDom基于模块进行应用搭建，一个应用由单个或多个模块组成。渲染以模块为单位进行（增量渲染），所以为了保证渲染效率，模块不要过大，大模块可以拆分为多个小模块。

### 模型(Model)
模型为数据模型，是数据的辅助对象，NoDom中，每个数据对象都对应一个model，模块基于model进行渲染，model的变化会导致模块的增量渲染，通常是多个model变化，进行一次渲染）。

### 模版(Template)
模版作为虚拟dom的生成来源，通常是一个html文件或html串，通常格式为: 

```html
 <div>模版内容</div>
```

### 指令(Directive)
为增强dom节点的使用，增加了指令功能，指令以“x-”开头，目前NoDom支持11个指令:module,model,repeat,class,if,else,show,field,validity,route,router。

### 过滤器(Filter)
过滤器主要用于改变数据的显示方式、排序、数组过滤等功能，目前NoDom提供7类过滤器:date,currency,number,tolowercase,touppercase,orderby,select。

### 表达式(Expression)
表达式主要用于数据计算，比如需要显示内容为 商品价格*折扣价格并取整，可以采用方式为 { {price*discount|number:0}}或{ {Math.floor(price*discount)}}。表达式可用于元素属性(attribute)或textContent。以"{ {}}"包裹。

### 事件(Event)
事件和元素的事件相对应，以"e-"开头，如 e-click='eventName'，不同的是事件不能带参数，NoDom会自动传递约定的参数。

### 路由(Router)
单页应用(SPA)基于模块切换达到传统的页面切换效果，模块的切换通常用路由来实现。路由主要用于操作模块切换、维护location history。

### 插件(Plugin)
插件类似于html element，作为module的基本组成元素，与模块的区别在于：插件属于模块，在模块内渲染。详情参看插件页。

## 文件说明
项目采用typescript开发，目录及结构如下：
1. bin:编译后的文件目录，目录下为最新编译，可直接使用。
2. core:源代码目录
3. examples:例子程序目录
4. index.ts:整体编译源文件
5. Gruntfile.js:grunt文件
## 编译说明
1. npm安装typescript,grunt-ts和grunt；
2. 运行grunt进行编译。

默认编译为es6，如果需要其它js版本，请修改Gruntfile.js文件中的options->target。  



