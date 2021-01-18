<template>
  <div>
    <!-- <div class="desc">Ant Design Vue Pro</div> -->
    <vue-particles
      class="particles"
      color="#dedede"
      :particleOpacity="0.7"
      :particlesNumber="80"
      shapeType="circle"
      :particleSize="4"
      linesColor="#dedede"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="3"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    ></vue-particles>
    <router-view></router-view>
  </div>
</template>

<style lang="less" scoped>
.particles {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: #001529;
}
</style>
