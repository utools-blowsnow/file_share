<template>
  <div class="Share" :class="{'expired': expire_time!== -1 && expire_time < Date.now()}">
    <div class="name">{{ item.name }}</div>
    <div class="size">{{ renderSize(item.size) }}</div>
    <div class="time">{{ format(item.time) }}</div>
    <div class="expire_time">{{ expire_time === -1 ? '无过期时间' :format(expire_time) }}</div>
    <div class="mask">
      <div v-if="item.uploader" class="url" style="margin-bottom: 5px;">{{ item.uploader.label }}</div>
      <div class="handle">
        <a @click="copy(item.url)">URL</a> |
        <a @click="qrcode(item.url)">二维码</a> |
        <a @click="remove">删除</a>
      </div>
    </div>

    <el-dialog title="二维码" center :visible.sync="qrcodeVisible">
      <div ref="qrcode" style="display: flex;justify-content: center;"></div>
    </el-dialog>

  </div>
</template>

<script type="text/ecmascript-6">
import QRCode from 'qrcodejs2'
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
      if (this.item.expire === undefined || this.item.expire === null) return -1;
      return this.item.time + this.item.expire * 1000;
    }
  },
  data() {
    return {
      qrcodeVisible: false,
      qrcodeNode: null
    }
  },
  methods:{
    copy(text){
      window.utools.copyText(text);
      this.$message.success("复制成功");
    },
    qrcode(text) {
      this.qrcodeVisible = true;
      console.log(this.$refs.qrcode);
      this.$nextTick(() => {
        if (this.qrcodeNode == null){
          this.qrcodeNode = new QRCode(this.$refs.qrcode, {
            text: text,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          })
        }else{
          this.qrcodeNode.clear();
          this.qrcodeNode.makeCode(text);
        }
      });

    },
    remove(){
      this.$confirm("是否确认删除？", '确认信息').then(() => {
        this.$emit('remove');
      });
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
  .name{
    white-space: nowrap;
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*opacity: 0.2;*/
}
.Share.expired{
  background: #b5b1b1;
}
</style>
