<template>
  <div class="ConfigDialog">

  </div>
</template>

<script setup>
import {ref,defineProps} from "vue"

const props = defineProps(['uploader','visible']);
console.log(props);
const {uploader,visible} = props;
</script>

<style lang="stylus" rel="stylesheet/stylus">
.ConfigDialog {

}
</style>
