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
          <el-select placeholder="请选择" size="mini" v-model="activeConfigName"
                     @change="changeActiveUploader">
            <el-option v-for="uploader in configs" :label="uploader.title"
                       :value="uploader.name"></el-option>
          </el-select>
        </div>
        <el-checkbox class="span" v-model="autoCopy">自动复制</el-checkbox>
        <el-button size="mini" icon="el-icon-setting" type="primary" class="skin-button"
                   @click="openUploadConfigDialog">设置
        </el-button>
      </div>
      <div class="right-box" >
        <el-button size="mini" type="danger" icon="el-icon-delete" class="skin-button" @click="clearShare">清空</el-button>
      </div>
      <div class="clearfix"></div>
    </div>

    <share-list :list="list" @remove="removeShare"></share-list>


    <config-dialog ref="configDialog" :uploader="uploader" :configName="activeConfigName"
                   @refreshConfig="refreshConfig"></config-dialog>

  </div>
</template>

<script>
import ConfigDialog from "@/dialog/ConfigDialog";
import ShareList from "@/components/ShareList";

export default {
  name: 'app',
  components: {ConfigDialog, ShareList},
  data(){
    return {

      activeConfigName: "",

      // 上传历史列表
      list: [],

      // 弹窗显示
      dialogVisible: false,

      configs: [],
      currentConfig: null,

      initConfig: false,
      autoCopy: false,

      uploader: null
    }
  },
  watch:{
    autoCopy(){
      window.utils.db('autoCopy',this.autoCopy);
    }
  },
  mounted(){
    console.log("mounted");

    this.refreshConfig();

    if (window.utils.db("activeConfig")) {
      this.activeConfigName = window.utils.db("activeConfig");
    }else{
      this.activeConfigName = this.configs[0].name;
    }
    // 加载配置
    if (this.changeActiveUploader() === false) {
      this.activeConfigName = this.configs[0].name;
      this.changeActiveUploader();
    }

    this.autoCopy = window.utils.db('autoCopy')||false;
    this.list = this.getShareList();
    this.initConfig = true;


    window.utools.onPluginEnter(({code, type, payload, optional}) => {
      console.log('用户进入插件', code, type, payload)

      if (type === "files" ) {

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
      window.utils.db("activeConfig", this.activeConfigName);

      let currentConfig = null;
      for (const config of this.configs) {
        if (config.name === this.activeConfigName) {
          currentConfig = config;
        }
      }
      if (!currentConfig) return false;

      let uploaderPlugin = this.$refs.configDialog.findUploader(currentConfig.uploaderName);

      // 初始化uploader
      uploaderPlugin.instance.init(currentConfig);

      this.uploader = uploaderPlugin;

      this.currentConfig = currentConfig;
    },

    refreshConfig() {
      this.configs = this.$refs.configDialog.getConfigs();
    },

    /**
     * 打开上传配置对话框
     */
    openUploadConfigDialog(){
      this.$refs.configDialog.open();
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
        var info = await this.uploader.instance.upload(file, this.currentConfig.uploaderConfig, (progress) => {
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
#app{
  overflow-x: hidden;
}
.skin-button{
  background: #f57681!important;
  border: #f57681!important;
}
.el-drawer__header{
  background: #f57681;
  color: #fff!important;
  margin-bottom: 30px!important;
  padding: 10px 20px !important;
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

.el-form-item__content .desc{
  color: rgb(177, 177, 177);
  line-height: normal;
}
</style>
