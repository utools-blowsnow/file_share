<template>
  <div class="ShareList">
    <el-row :gutter="20">
      <el-col v-for="(item,index) in list" :xs="8" :sm="6" :md="6">
        <share :item="item" @remove="remove(index)"></share>
      </el-col>
    </el-row>
  </div>
</template>

<script type="text/ecmascript-6">
import Share from "@/components/Share";
export default {
  name: "ShareList",
  components: {Share},
  props:['list'],
  methods:{
    remove(index){
      this.$emit('remove',index);
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.ShareList{
  .Share{
    margin-bottom: 10px;
    padding: 10px;
  }
}
</style>
