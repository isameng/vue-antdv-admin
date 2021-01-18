<template>
  <transition name="fade-transform" mode="out-in">
    <keep-alive :include="keepAliveComponents">
      <router-view :key="$route.fullPath" />
    </keep-alive>
  </transition>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      keepAliveComponents: state => state.tagsView.cacheView
    })
  }
};
</script>