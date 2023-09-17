<template>
  <div class="ConfigDialog">
    <el-drawer
        title="配置 - 修改自动保存"
        :visible.sync="visible"
        size="100%"
        direction="rtl">
      <el-tabs style="margin: 0 50px;min-height: 30px;" v-model="currentConfigName"
               @tab-click="changeConfig" type="card" editable @edit="handleTabsEdit">
        <el-tab-pane
            :key="index"
            v-for="(item, index) in configDatas"
            :label="item.title"
            :name="item.name"
        >
          <el-form ref="form" label-width="150px" style="padding-right: 50px;margin-bottom: 50px">
            <el-form-item label="显示的名称" style="margin: 0;">
              <el-input size="mini" v-model="item.title"></el-input>
            </el-form-item>
            <el-form-item label="上传插件" style="margin: 0;">
              <el-select size="mini" v-model="item.uploaderName" @change="changeUploader(item)">
                <el-option v-for="option in uploaders" :label="option.label"
                           :value="option.name"></el-option>
              </el-select>
            </el-form-item>

            <template v-for="configParameter in uploaderConfigParameters">
              <el-form-item v-if="configParameter.type === 'tip'" :label="configParameter.label"
                            style="margin: 0;">
                <div style="color: rgb(177 177 177)" v-html="configParameter.value"></div>
              </el-form-item>
              <el-form-item v-else :label="configParameter.label">
                <template v-if="configParameter.type === 'select'">
                  <el-select size="mini" v-model="item.uploaderConfig[configParameter.name]">
                    <el-option v-for="option in configParameter.options" :label="option.label"
                               :value="option.value"></el-option>
                  </el-select>
                </template>
                <template v-else-if="configParameter.type === 'number'">
                  <el-input-number size="mini" v-model="item.uploaderConfig[configParameter.name]"
                                   :min="configParameter.min === undefined ?1: 0"
                                   :max="configParameter.max||99999"></el-input-number>
                </template>
                <template v-else-if="configParameter.type === 'button'">
                  <el-button size="mini" @click="onHandleUploader(item, configParameter.handle)">
                    {{ configParameter.label }}
                  </el-button>
                </template>
                <template v-else>
                  <el-input size="mini"
                            v-model="item.uploaderConfig[configParameter.name]"></el-input>
                </template>
                <template v-if="configParameter.desc">
                  <div class="desc" v-html="configParameter.desc"></div>
                </template>
              </el-form-item>
            </template>

            <el-form-item style="margin: 0;">
              <el-button type="primary" style="width: 150px;" @click="save">保存</el-button>
            </el-form-item>

          </el-form>
        </el-tab-pane>
      </el-tabs>

    </el-drawer>
  </div>
</template>

<script>
const uploaders = require('../plugins/uploaders').default;

for (let uploader of uploaders) {
  uploader.config = {};
  if (uploader.configParameters) {
    for (let uploaderElement of uploader.configParameters) {
      // 防止 0的问题无法设置
      if (uploaderElement.value === undefined) {
        uploader.config[uploaderElement.name] = null;
      } else {
        uploader.config[uploaderElement.name] = uploaderElement.value;
      }
    }
  }
}


// 根据order排序 倒序
uploaders.sort((a, b) => {
  return b.order - a.order;
});

export default {
  props: ['uploader', 'configName'],
  watch: {
    visible(newValue, oldValue) {
      // This function will be called when 'myProp' changes.
      // You can perform your logic here.
      console.log(`Prop changed visible ${oldValue} to ${newValue}`);
      this.$emit("")
    },
  },
  data() {
    return {
      visible: false,

      uploaders: uploaders,

      configDatas: [],
      currentConfigName: null,

      uploaderConfigParameters: []
    }
  },
  mounted() {
    this.initConfigDatas();

    this.currentConfigName = this.configName || this.configDatas[0].name;

    this.changeUploader(this.getCurrentConfig());


    if (this.configDatas.length <= 0) {
      this.handleTabsEdit(null, 'add');
    }
    console.log(uploaders);
  },
  methods: {


    handleTabsEdit(targetName, action) {
      if (action === 'add') {
        let name = Date.now() + "" + Math.random();
        this.configDatas.push({
          name: name,
          title: '未命名',
          uploaderName: null,
          uploaderConfig: {}
        });
        this.currentConfigName = name;
      }
      if (action === 'remove') {
        this.configDatas = this.configDatas.filter(tab => tab.name !== targetName);
      }
    },

    initConfigDatas() {
      this.configDatas = this.getConfigs();
    },

    open() {
      this.visible = true;
    },

    getConfigs() {
      // 从db获取数据
      let data = utools.dbStorage.getItem('configs');
      if (data) {
        return JSON.parse(data);
      } else {
        return [
          {
            name: "default",
            title: "默认",
            uploaderName: "CatboxUploader",
            uploaderConfig: {}
          }
        ]
      }
    },

    findUploader(uploaderName) {
      for (let uploader of uploaders) {
        if (uploaderName === uploader.name) return uploader;
      }
      return null;
    },

    onHandleUploader(item, handle){
      let uploader = this.findUploader(item.uploaderName);
      console.log('onHandleUploader',item,uploader);
      handle({
        config: item.uploaderConfig,
        configParameters: uploader.configParameters
      })
    },

    getCurrentConfig() {
      for (let config of this.configDatas) {
        if (config.name === this.currentConfigName) return config;
      }
      return null;
    },

    changeConfig() {
      console.log('changeConfig tab');
      this.changeUploader(this.getCurrentConfig());
    },

    changeUploader(item) {
      let uploader = this.findUploader(item.uploaderName);
      console.log("changeUploader", uploader);
      if (uploader == null) {
        return;
      }

      this.uploaderConfigParameters = uploader.configParameters;
      // 获取插件所需的配置项
      for (const configParameter of uploader.configParameters) {
        if (!item.uploaderConfig.hasOwnProperty(configParameter.name)) {
          this.$set(item.uploaderConfig,configParameter.name, configParameter.value || null);
        }
      }
      console.log('changeUploader 2',item);
    },

    save() {

      utools.dbStorage.setItem('configs', JSON.stringify(this.configDatas));

      this.visible = false;

      this.$emit('refreshConfig')
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
.ConfigDialog {
  .el-tabs__item.is-active {
    color: #f57681;
  }

  .el-tabs__item:hover {
    color: #f57681;
  }
}
</style>
