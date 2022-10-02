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
          <el-select placeholder="请选择" size="mini" v-model="activeUploaderName" @change="changeActiveUploader">
            <el-option v-for="uploader in uploaders" :label="uploader.label" :value="uploader.name"></el-option>
          </el-select>
        </div>
        <el-checkbox class="span" v-model="autoCopy">自动复制</el-checkbox>
        <el-button v-if="uploader && uploader.configParameters" size="mini" icon="el-icon-setting" type="primary" class="skin-button" @click="openUploadConfigDialog">设置</el-button>
      </div>
      <div class="right-box" >
        <el-button size="mini" type="danger" icon="el-icon-delete" class="skin-button" @click="clearShare">清空</el-button>
      </div>
      <div class="clearfix"></div>
    </div>

    <share-list :list="list" @remove="removeShare"></share-list>


    <el-drawer
        title="配置 - 修改自动保存"
        :visible.sync="dialogVisible"
        size="100%"
        direction="rtl">
      <el-form v-if="uploader" ref="form" label-width="150px" style="padding-right: 50px;">
        <template v-for="configParameter in uploader.configParameters">
          <el-form-item v-if="configParameter.type === 'tip'" :label="configParameter.label" style="margin: 0;">
            <div style="color: rgb(177 177 177)" v-html="configParameter.value"></div>
          </el-form-item>
          <el-form-item v-else :label="configParameter.label">
            <template v-if="configParameter.type === 'select'">
              <el-select size="mini"  v-model="uploader.config[configParameter.name]">
                <el-option v-for="option in configParameter.options" :label="option.label" :value="option.value"></el-option>
              </el-select>
            </template>
            <template v-else-if="configParameter.type === 'number'">
              <el-input-number size="mini" v-model="uploader.config[configParameter.name]" :min="configParameter.min === undefined ?1: 0" :max="configParameter.max||99999"></el-input-number>
            </template>
            <template v-else-if="configParameter.type === 'button'">
              <el-button size="mini" @click="configParameter.handle($event,uploader)">{{configParameter.label}}</el-button>
            </template>
            <template v-else>
              <el-input size="mini"  v-model="uploader.config[configParameter.name]"></el-input>
            </template>
          </el-form-item>
        </template>
      </el-form>
    </el-drawer>

<!--    <el-dialog title="配置" :visible.sync="dialogVisible" width="80%">-->
<!--      -->
<!--    </el-dialog>-->

  </div>
</template>

<script>
import ConfigDialog from "@/dialog/ConfigDialog";
import ShareList from "@/components/ShareList";
const uploaders = require('./plugins/uploaders').default;

for(let uploader of uploaders){
  uploader.config = {};
  if (uploader.configParameters){
    for(let uploaderElement of uploader.configParameters){
      uploader.config[uploaderElement.name] = uploaderElement.value || null;
    }
  }
}


// 根据order排序 倒序
uploaders.sort((a,b)=>{
  return b.order - a.order;

});


export default {
  name: 'app',
  components: {ConfigDialog, ShareList},
  data(){
    return {
      // 上传源列表
      uploaders: uploaders,

      activeUploaderName: "CowtransferUploader",

      // 上传历史列表
      list: [],

      // 弹窗显示
      dialogVisible: false,


      initConfig: false,
      autoCopy: false
    }
  },
  watch:{
    'uploader.config':{
      handler(n,o){
        if (this.initConfig === false) return;
        //保存配置
        window.utils.db("uploader_config_" + this.uploader.name,this.uploader.config);
      },
      // immediate: true,  //刷新加载 立马触发一次handler
      deep: true
    },
    autoCopy(){
      window.utils.db('autoCopy',this.autoCopy);
    }
  },
  computed:{
    uploader(){
      for(let uploader of this.uploaders){
        if (uploader.name === this.activeUploaderName){
          return uploader;
        }
      }
      return null;
    }
  },
  mounted(){
    if (window.utils.db("active_uploader")){
      this.activeUploaderName = window.utils.db("active_uploader");

      // 加载配置
      this.changeActiveUploader();
    }else{
      this.activeUploaderName = this.uploaders[0].name;
    }

    this.autoCopy = window.utils.db('autoCopy')||false;
    this.list = this.getShareList();
    this.initConfig = true;


    window.utools.onPluginEnter(({code, type, payload, optional}) => {
      console.log('用户进入插件', code, type, payload)

      if (type === "files") {

        this.$nextTick(()=>{
          this.uploads(payload);
        });
      }
    })
  },
  methods:{
    /**
     * 修改激活的上传器
     */
    changeActiveUploader(){
      window.utils.db("active_uploader",this.activeUploaderName);

      let uploaderConfig = window.utils.db("uploader_config_" + this.uploader.name);
      if (uploaderConfig){
        this.uploader.config = {
          ...this.uploader.config,
          ...uploaderConfig
        }
      }
    },
    /**
     * 打开上传配置对话框
     */
    openUploadConfigDialog(){
      this.dialogVisible = true;
    },

    /**
     * 上传请求处理
     * @param params
     * @returns {Promise<void>}
     */
    async uploadRequest(params){
      await this.upload(params.file)
    },
    /**
     * 批量上传
     * @param files
     * @returns {Promise<void>}
     */
    async uploads(files){
      for(let fileObject of files){
        try {
          let file = window.utils.readFile(fileObject);
          await this.upload(file);
        }catch (e){
          console.error(e);
          utools.showNotification('uploads files error：' + e.message)
        }
      }
    },
    /**
     * 上传文件
     * @param file
     * @returns {Promise<void>}
     */
    async upload(file){
      window.utools.showMainWindow()

      const loading = this.$loading({
        lock: true,
        text: '正在上传 ' + file.name,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      try {
        var info = await this.uploader.instance.upload(file,this.uploader.config,(progress) => {
          console.log(loading);
          loading.setText('正在上传 ' + file.name + ' ' + parseInt(progress) + '%');
        });
      }catch (e){
        console.error(e);
        this.$message.error(e.message);
        return;
      }finally {
        loading.close();
      }
      if (typeof info === "string"){
        info = {
          url: info,
          expire: null
        }
      }

      info.uploader = {
        name: this.uploader.name,
        label: this.uploader.label
      }

      this.addShare(info,file);

      if (this.autoCopy){
        window.utools.copyText(info.url);
      }
    },


    /**
     * 添加分享
     * @param info
     * @param file
     */
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

    /**
     * 获取分享列表
     * @returns {*|*[]}
     */
    getShareList(){
      return window.utils.db("share_list") || [];
    },

    /**
     * 删除分享
     * @param index
     */
    removeShare(index){
      this.list.splice(index,1);
      window.utils.db("share_list",this.list);
    },
    /**
     * 清空分享列表
     */
    clearShare(){
      this.list = [];
      window.utils.db("share_list",this.list);
    },
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.skin-button{
  background: #f57681!important;
  border: #f57681!important;
}
.el-drawer__header{
  background: #f57681;
  color: #fff;
  margin-bottom: 30px;
  padding-bottom: 20px;
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
