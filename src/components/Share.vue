<template>
  <div class="Share" :class="{'expired': expire_time(item.time,item.expire) < Date.now()}">
    <div class="name">{{ item.name }}</div>
    <div class="size">{{ renderSize(item.size) }}</div>
    <div class="time">{{ format(item.time) }}</div>
    <div class="expire_time">{{ expire_time(item.time,item.expire) === -1 ? '未知过期时间' :format(expire_time(item.time,item.expire)) }}</div>
    <div class="mask">
      <a @click="copy(item.url)">URL</a> |
      <a @click="remove">删除</a>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  name: "Share",
  props: ['item'],
  computed: {
    renderSize() {
      return function (value) {
        if (null == value || value === '' || value === 0) {
          return "0 Bytes";
        }
        var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
        var index = 0;
        var srcsize = parseFloat(value);
        index = Math.floor(Math.log(srcsize) / Math.log(1024));
        var size = srcsize / Math.pow(1024, index);
        size = size.toFixed(2);//保留的小数位数
        return size + " " + unitArr[index];
      }
    },
    format(){
      return function (time){
        return new Date(time).Format("yyyy-MM-dd hh:mm:ss");
      }
    },
    expire_time(){
      return function (start_time,expire){
        if (expire === undefined || expire === null) return -1;
        return start_time + expire * 1000;
      }
    }
  },
  methods:{
    copy(text){
      window.utils.clipboard.writeText(text);
      this.$message.success("复制成功");
    },
    remove(){
      this.$emit('remove');
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.Share {
  text-align: center;
  background: #f57681;
  border-radius: 10px;
  border: unset;
  color: #fff;
  font-size: 13px;
  position: relative;
  .mask{
    display: none;
    a{
      cursor: pointer;
      padding: 5px;
    }
  }
}
.Share:hover .mask{
  background: #ffa4ac;
  border-radius: 10px;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  /*opacity: 0.2;*/
}
.Share.expired{
  background: #b5b1b1;
}
</style>
