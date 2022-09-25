<template>
  <div id="app">
    <el-upload
        class="upload-box"
        drag
        :http-request="uploadRequest"
        action=""
        :show-file-list="false"
        multiple>
      <i class="el-icon-upload"></i>
    </el-upload>
    <div class="tools">
      <div class="left-box">
        <div class="span">
          上传源：
          <el-select placeholder="请选择" size="mini" v-model="active_uploader" @change="changeActiveApi">
            <el-option v-for="uploader in uploaders" :label="uploader.label" :value="uploader.name"></el-option>
          </el-select>
        </div>
        <el-checkbox class="span" v-model="autoCopy">自动复制</el-checkbox>
        <el-button v-if="nowUploader && nowUploader.configParameters" size="mini" icon="el-icon-setting" type="primary" class="skin-button" @click="openUploadConfigDialog">设置</el-button>
      </div>
      <div class="right-box" >
        <el-button size="mini" type="danger" icon="el-icon-delete" class="skin-button" @click="clearShare">清空</el-button>
      </div>
      <div class="clearfix"></div>
    </div>
    <share-list :list="list" @remove="removeShare"></share-list>

    <el-dialog title="配置" :visible.sync="dialogTableVisible">
      <el-form v-if="nowUploader" ref="form" label-width="80px">
        <el-form-item v-for="configParameter in nowUploader.configParameters" :label="configParameter.label">
          <template v-if="configParameter.type === 'select'">
            <el-select size="mini"  v-model="nowUploader.config[configParameter.name]">
              <el-option v-for="option in configParameter.options" :label="option.label" :value="option.value"></el-option>
            </el-select>
          </template>
          <template v-else-if="configParameter.type === 'number'">
            <el-input-number size="mini" v-model="nowUploader.config[configParameter.name]" :min="configParameter.min === undefined ?1: 0" :max="configParameter.max||99999"></el-input-number>
          </template>
          <template v-else-if="configParameter.type === 'button'">
            <el-button size="mini" @click="configParameter.handle($event,nowUploader)">{{configParameter.label}}</el-button>
          </template>
          <template v-else-if="configParameter.type === 'tip'">
            <div v-html="configParameter.value"></div>
          </template>
          <template v-else>
            <el-input size="mini"  v-model="nowUploader.config[configParameter.name]"></el-input>
          </template>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
const uploaders = require('./plugins/uploaders').default;
for(let uploader of uploaders){
  uploader.config = {};
  if (uploader.configParameters){
    for(let uploaderElement of uploader.configParameters){
      uploader.config[uploaderElement.name] = uploaderElement.value || null;
    }
  }
}
console.log(uploaders);

import ShareList from "@/components/ShareList";
import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";
export default {
  name: 'app',
  components: {ShareList},
  data(){
    return {
      uploaders: uploaders,
      active_uploader: "CowtransferUploader",
      list: [],

      dialogTableVisible: false,

      initConfig: false,
      autoCopy: false
    }
  },
  watch:{
    'nowUploader.config':{
      handler(n,o){
        if (this.initConfig === false) return;
        //保存配置
        window.utils.db("uploader_config_" + this.nowUploader.name,this.nowUploader.config);
      },
      // immediate: true,  //刷新加载 立马触发一次handler
      deep: true
    },
    autoCopy(){
      window.utils.db('autoCopy',this.autoCopy);
    }
  },
  computed:{
    nowUploader(){
      for(let uploader of this.uploaders){
        if (uploader.name === this.active_uploader){
          return uploader;
        }
      }
      return null;
    }
  },
  mounted(){
    if (window.utils.db("active_uploader")){
      this.active_uploader = window.utils.db("active_uploader");

      // 加载配置
      this.changeActiveApi();
    }else{
      this.active_uploader = this.uploaders[0].name;
    }

    this.autoCopy = window.utils.db('autoCopy')||false;
    this.list = this.getShareList();
    this.initConfig = true;


    utools.onPluginEnter(({code, type, payload, optional}) => {
      console.log('用户进入插件', code, type, payload)

      if (type === "files") this.uploads(payload);
    })
  },
  methods:{
    async uploadRequest(params){
      await this.upload(params.file)
    },
    async uploads(files){
      setTimeout(async ()=>{
        for(let fileObject of files){
          console.log('readfile before',Date.now());
          let file = window.utils.readFile(fileObject);
          console.log('readfile after',Date.now());
          await this.upload(file);
        }
      },100);
    },
    async upload(file){
      const loading = this.$loading({
        lock: true,
        text: '正在上传 ' + file.name,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      try {
        var info = await this.nowUploader.instance.upload(file,this.nowUploader.config,(progress) => {
          console.log(loading);
          loading.setText('正在上传 ' + file.name + ' ' + parseInt(progress) + '%');
        });
      }catch (e){
        console.log(e);
        this.$message.error(e.message);
        return;
      }finally {
        this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
          loading.close();
        });
      }
      if (typeof info === "string"){
        info = {
          url: info,
          expire: null
        }
      }

      info.uploader = {
        name: this.nowUploader.name,
        label: this.nowUploader.label
      }

      this.addShare(info,file);

      if (this.autoCopy){
        window.utils.clipboard.writeText(info.url);
      }
    },

    changeActiveApi(){
      window.utils.db("active_uploader",this.active_uploader);

      let uploaderConfig = window.utils.db("uploader_config_" + this.nowUploader.name);
      if (uploaderConfig){
        this.nowUploader.config = {
          ...this.nowUploader.config,
          ...uploaderConfig
        }
      }
    },

    openUploadConfigDialog(){
      this.dialogTableVisible = true;
    },

    addShare(info,file){
      let item = {
        ...info,
        name: file.name,
        size: file.size,
        time: Date.now(),
        path: file.path || file.temp_path
      };
      this.list.unshift(item);
      //判断是否超了
      if (this.list.length > 100){
        this.list.splice(100,this.list.length - 100);
      }
      window.utils.db("share_list",this.list);
    },
    removeShare(index){
      this.list.splice(index,1);
      window.utils.db("share_list",this.list);
    },
    clearShare(){
      this.list = [];
      window.utils.db("share_list",this.list);
    },
    getShareList(){
      return window.utils.db("share_list") || [];
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.skin-button{
  background: #f57681!important;
  border: #f57681!important;
}
.upload-box{
  .el-upload{
    width: 100%;
  }
  .el-upload-dragger{
    width: 100%;
    height: 150px;
    line-height: 150px;
    background: #f57681;
    border-radius: 10px;
    border: unset;
    .el-icon-upload{
      color: #fff;
    }
  }
}
.tools{
  margin: 10px 0;
  .left-box{
    float: left;
    .span{
      margin-right: 10px;
      display: inline-block;
    }
  }
  .right-box{
    float: right;
  }
  .clearfix{
    clear:both;
  }
}
</style>
