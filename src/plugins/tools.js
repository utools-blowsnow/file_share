if (!window.utils){
    window.utils = {
        db: function (name,value=undefined){
            let obj = localStorage.getItem(name);
            if (value !== undefined){
                localStorage.setItem(name,JSON.stringify({
                    data: value
                }));
                return;
            }
            obj = JSON.parse(obj);
            if (obj == null) return null;
            return obj.data;
        }
    }
    window.inUtools = false;
}


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
