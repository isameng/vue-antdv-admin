<template>
  <div>
    <!-- <Chart :option="chartOption" style="height:400px"></Chart> -->
    暂无分析表
  </div>
</template>

<script>
// import random from "lodash/random";
// import request from "../../utils/request";
// import Chart from "../../components/Chart";
// import chartCode from '!!raw-loader!../../components/Chart';
export default {
  name: "analysis",
  data() {
    return {
      // 指定图表的配置项和数据
      chartOption: {}
      // chartCode
    };
  },
  mounted() {
    // this.getChartData();
    // this.interval = setInterval(() => {
    //   // this.getChartData();
    //   // this.chartOption.series[0].data = this.chartOption.series[0].data.map(
    //   //   () => random(100)
    //   // );
    //   // //解构赋值, 可以使监听器产生效果
    //   // this.chartOption = { ...this.chartOption };
    // }, 3000);
  },
  methods: {
    // getChartData() {
    //   request({
    //     url: "/api/dashboard/chart",
    //     method: "get",
    //     params: { ID: 123456 }
    //   }).then(response => {
    //     this.chartOption = {
    //       title: {
    //         text: "销量"
    //       },
    //       tooltip: {},
    //       legend: {
    //         data: ["销量"]
    //       },
    //       xAxis: {
    //         data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
    //       },
    //       yAxis: {},
    //       series: [
    //         {
    //           name: "销量",
    //           type: "bar",
    //           data: response.data
    //         }
    //       ]
    //     };
    //   });
    // }
  }
  // components: {
  //   Chart
  // }
};
</script>

<style></style>
