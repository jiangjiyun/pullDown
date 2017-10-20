/*
    option:{
        container:'#id'，
        next: '加载数据的方法'
    }
*/
function pullDown(option) {
    //判断浏览器是否支持touch事件;
    if(!'ontouchstart' in window || (/hp-tablet/gi).test(navigator.appVersion)){
        console.log('浏览器不支持touch事件');
        return ;
    }
    //判断dom节点是否正确;
    if(!document.querySelector(option.container)){
        console.log('dom节点不存在');
        return ;
    }

    var startPos,
        endPos,
        length,
        timeout,
        isLock = false, //是否锁定整个操作
        isCanDo = false, //是否移动滑块
        obj = document.querySelector(option.container); 

    //创建loadingDom
    var loadDom = document.createElement('div');
    loadDom.className = 'PullDown';
    var loadTip = document.createElement('div');
    loadTip.className = 'loadTip';
    loadDom.appendChild(loadTip);
    obj.insertBefore(loadDom, obj.firstChild);
    var offset = loadTip.clientHeight;

    /*操作方法*/
    var fn = {
        //移动容器
        changeH: function (diff) {
            loadDom.style.height = diff + 'px';
        },
        //设置效果时间
        setTransition: function (time) {
            loadDom.style.webkitTransition = 'all ' + time + 's';
            loadDom.style.transition = 'all ' + time + 's';
        },
        //返回到初始位置
        back: function () {
            //标识操作完成
            isLock = false;
            fn.changeH(0);
            timeout = setTimeout(() => {
                loadTip.innerHTML = '';
            }, 500);
        },
        addEvent: function (element, event_name, event_fn) {
            if (element.addEventListener) {
                element.addEventListener(event_name, event_fn, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + event_name, event_fn);
            } else {
                element['on' + event_name] = event_fn;
            }
        }
    };


    //开始监听;
    fn.changeH(0);
    fn.addEvent(obj, 'touchstart', start);
    fn.addEvent(obj, 'touchmove', move);
    fn.addEvent(obj, 'touchend', end);

    //滑动开始
    function start(e) {
        if (obj.scrollTop <= 0 && !isLock) {
            var even = typeof event == "undefined" ? e : event;
            //标识操作进行中
            isLock = true;
            isCanDo = true;
            //保存当前鼠标Y坐标
            startPos = even.touches[0].pageY;
            endPos = 0;
            //消除滑块动画时间
            fn.setTransition(0);
            //重置length;
            length=0;
            //下拉提示
            if (timeout) {
                clearTimeout(timeout);
            }
            loadTip.innerHTML = `下拉刷新页面`;
        }
        return false;
    }
    //滑动中
    function move(e) {
        if (obj.scrollTop <= 0 && isCanDo) {
            var even = typeof event == "undefined" ? e : event;
            //保存当前鼠标Y坐标
            endPos = even.touches[0].pageY;
            if (startPos < endPos) {
                even.preventDefault();
                //消除滑块动画时间
                fn.setTransition(0);
                //移动滑块
                if ((endPos - startPos) / 2 <= 150) {
                    length = (endPos - startPos) / 2;
                    fn.changeH(length);
                } else {
                    length += 0.3;
                    fn.changeH(length);
                }
                if(length<=offset){
                    loadTip.innerHTML = `下拉刷新页面`;
                }else{
                    loadTip.innerHTML = `释放即可刷新`;
                }
            }
        }
    }
    //滑动结束
    function end(e) {
        if (isCanDo) {
            isCanDo = false;
            //判断滑动距离是否大于等于指定值
            if (length >= offset) {
                //设置滑块回弹时间
                fn.setTransition(0.5);
                //保留提示部分
                fn.changeH(offset);
                //显示加载中，并执行回调函数
                loadTip.innerHTML = `正在刷新<span></span><span></span><span></span>`;
                if (typeof option.next == "function") {
                    option.next.call(fn, e);
                }
            } else {
                //返回初始状态
                fn.back();
            }
        }
    }
}

window.pullDown = pullDown;
module.exports = pullDown;