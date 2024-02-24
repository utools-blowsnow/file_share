<template>
  <div class="ConfigDialog">
    <el-drawer
        title="配置 - 修改自动保存"
        :visible.sync="visible"
        size="100%"
        direction="rtl">
      <el-tabs style="margin: 0 50px;min-height: 30px;" v-model="currentConfigName"
               @tab-click="onChangeTab" type="card" addable @edit="handleTabsEdit">
        <el-tab-pane
            :key="index"
            v-for="(item, index) in configDatas"
            :label="item.title"
            :name="item.name"
        >
        </el-tab-pane>
      </el-tabs>
      <el-form v-if="currentConfig" ref="form" label-width="150px" style="padding-right: 50px;margin-bottom: 50px">
        <el-form-item label="显示的名称" style="margin: 0;">
          <el-input size="mini" v-model="currentConfig.title"></el-input>
        </el-form-item>
        <el-form-item label="上传插件" style="margin: 0;">
          <el-select size="mini" v-model="currentConfig.uploaderName" @change="changeUploader(currentConfig)">
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
              <el-select size="mini" v-model="currentConfig.uploaderConfig[configParameter.name]">
                <el-option v-for="option in configParameter.options" :label="option.label"
                           :value="option.value"></el-option>
              </el-select>
            </template>
            <template v-else-if="configParameter.type === 'number'">
              <el-input-number size="mini" v-model="currentConfig.uploaderConfig[configParameter.name]"
                               :min="configParameter.min === undefined ?1: 0"
                               :max="configParameter.max||99999"></el-input-number>
            </template>
            <template v-else-if="configParameter.type === 'button'">
              <el-button size="mini" @click="onHandleUploader(configParameter)">
                {{ configParameter.label }}
              </el-button>
            </template>
            <template v-else>
              <el-input size="mini"
                        v-model="currentConfig.uploaderConfig[configParameter.name]"></el-input>
            </template>
            <template v-if="configParameter.desc">
              <div class="desc" v-html="configParameter.desc"></div>
            </template>
          </el-form-item>
        </template>

        <el-form-item style="margin: 0;">
          <el-button type="primary" style="width: 150px;" @click="save()">保存</el-button>
          <el-button type="danger" style="width: 150px;" @click="deleteConfig()">删除</el-button>
        </el-form-item>

      </el-form>
    </el-drawer>
  </div>
</template>

<script>
const uploaders = require('../plugins/uploaders').default;

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
    configName(){
      this.currentConfigName = this.configName || this.configDatas[0].name;
      this.changeConfig(this.currentConfigName);
    }
  },
  data() {
    return {
      visible: false,

      uploaders: uploaders,

      currentConfig: null,
      currentConfigName: null,

      configDatas: [],

      uploaderConfigParameters: [],


    }
  },
  mounted() {
    this.initConfigDatas();

    if (this.configDatas.length <= 0) {
      this.handleTabsEdit(null, 'add');
    }

    this.currentConfigName = this.configName || this.configDatas[0].name;
    this.changeConfig(this.currentConfigName);

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
        this.changeConfig(this.currentConfigName);
      }else if (action === 'remove') {
        this.configDatas = this.configDatas.filter(tab => tab.name !== targetName);
        if (this.currentConfigName === targetName) {
          this.currentConfigName = this.configDatas[0].name;
          this.changeConfig(this.currentConfigName);
        }
      }
    },
    async deleteConfig() {
      await this.$confirm('此操作将永久删除该配置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      this.handleTabsEdit(this.currentConfigName, 'remove');

      utools.dbStorage.setItem('configs', JSON.stringify(this.configDatas));
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
            uploaderName: "PixeldrianUploader",
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

    findConfig(name){
      for (const config of this.configDatas) {
        if (config.name === name) return config;
      }
      return null;
    },

    async onHandleUploader(configParameter) {
      console.log('onHandleUploader', this.currentConfig, configParameter);
      await configParameter.handle({
        config: this.currentConfig.uploaderConfig,
        configParameters: this.uploaderConfigParameters
      })
    },

    getCurrentConfig(index) {
      return this.configDatas[index];
    },

    onChangeTab(tab){
      let index = parseInt(tab.index);
      let name = this.configDatas[index].name;
      this.changeConfig(name)
    },
    changeConfig(name) {
      this.currentConfigName = name;
      let currentConfig = this.findConfig(name)
      this.currentConfig = {...currentConfig};
      this.changeUploader(this.currentConfig);
    },

    async changeUploader(item) {
      let uploader = this.findUploader(item.uploaderName);

      this.currentConfig.uploaderName = item.uploaderName;
      this.currentConfig.uploaderConfig = item.uploaderConfig;
      this.uploaderConfigParameters = [];
      console.log("changeUploader", item.uploaderName, item, uploader);
      if (uploader == null) {
        return;
      }

      this.uploaderConfigParameters = await uploader.instance.configParameters(item.uploaderConfig);
      // 获取插件所需的配置项
      for (const configParameter of this.uploaderConfigParameters) {
        if (!item.uploaderConfig.hasOwnProperty(configParameter.name)) {
          let value = configParameter.hasOwnProperty('value') ? configParameter.value : null;
          this.$set(this.currentConfig.uploaderConfig, configParameter.name, value);
        }
      }
      console.log('changeUploader 2', this.currentConfig, this.uploaderConfigParameters);
    },

    save() {
      for (let i = 0; i < this.configDatas.length; i++) {
        if (this.configDatas[i].name === this.currentConfig.name) {
          this.configDatas[i] = this.currentConfig;
          break;
        }
      }

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
