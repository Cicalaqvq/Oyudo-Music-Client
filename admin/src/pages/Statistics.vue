<template>
  <div>
    <el-row :gutter="20">
      <el-col v-for="item in totalLabel" :key="item.prop" :label="item.label" :span="6">
        <el-card>
          <el-statistic :value="animatedValues[item.prop]">
            <template #title>
              <div class="statistic-title">
                {{ item.title }}
              </div>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <span>歌曲类型分布</span>
          <div ref="songTypeChartRef" style="height: 615px"/>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <span>用户数量趋势</span>
          <div ref="userChartRef" style="height: 280px"/>
        </el-card>
        <el-card style="margin-top: 20px">
          <span>歌手国籍分布</span>
          <div ref="artistCountryChartRef" style="height: 249px"/>
        </el-card>
      </el-col>
    </el-row>
  </div>

</template>
<script setup>
// 获取 DOM 元素的引用（用于初始化图表）
import {onBeforeUnmount, onMounted, ref} from "vue";
import {getArtistCountryTop5, getSongStyleReport, getTotal} from "../api/manage.js";
import {useTransition} from "@vueuse/core";
import * as echarts from 'echarts'

const transitionSources = ref({
  userCount: 0,
  artistCount: 0,
  songCount: 0,
  playlistCount: 0,
});
const totalLabel = [
  {title: '用户数', prop: 'userCount'},
  {title: '歌手数', prop: 'artistCount'},
  {title: '歌曲数', prop: 'songCount'},
  {title: '歌单数', prop: 'playlistCount'},
];

const end = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
);
const begin = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 5
);

const getTotalList = () => {

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  getTotal(formatDate(begin), formatDate(end)).then(res => {
    if (res.data.code === 200) {
      const data = res.data.data;
      // 解析用户数量（取最新的用户数）
      const userCountArr = data.totalUserList.split(',').map(Number);
      const userCount = userCountArr[userCountArr.length - 1];
      transitionSources.value = {
        userCount: userCount,
        artistCount: data.artistCount || 0,
        songCount: data.songCount || 0,
        playlistCount: data.playlistCount || 0,
      };
      initUserChart(userCountArr, begin, end)
    }
  })
}

const songStyleCount = () => {
  getSongStyleReport().then(res => {
    if (res.data.code === 200) {
      const data = res.data.data;
      initSongTypeChart(data)
    }
  })
}

const artistCountryCount = () => {
  getArtistCountryTop5().then(res => {
    if (res.data.code === 200) {
      const data = res.data.data;
      initArtistCountryChart(data)
    }
  })
}

const animatedValues = {
  userCount: useTransition(() => transitionSources.value.userCount, {
    duration: 200,
  }),
  artistCount: useTransition(() => transitionSources.value.artistCount, {
    duration: 500,
  }),
  songCount: useTransition(() => transitionSources.value.songCount, {
    duration: 800,
  }),
  playlistCount: useTransition(() => transitionSources.value.playlistCount, {
    duration: 1100,
  }),
};


const userChartRef = ref(null)
const songTypeChartRef = ref(null)
const artistCountryChartRef = ref(null)

let userChartInstance = null
let songTypeChartInstance = null
let artistCountryChartInstance = null

const initUserChart = (data, begin, end) => {
  if (userChartRef.value) {
    userChartInstance = echarts.init(userChartRef.value)

    const dates = []
    while (begin <= end - 1) {
      dates.push(begin.toLocaleDateString())
      begin.setDate(begin.getDate() + 1)
    }

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          name: '用户数量',
          type: 'line',
          data: data,
          smooth: true,
          lineStyle: {
            color: '#409EFF',
            width: 3
          },
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {offset: 0, color: 'rgba(64, 158, 255, 0.5)'},
                {offset: 1, color: 'rgba(64, 158, 255, 0.05)'}
              ]
            }
          }
        }
      ]
    }
    userChartInstance.setOption(option)
  }
}

const styleList = [
  {
    label: "乡村",
    value: 1
  },
  {
    label: "华语流行",
    value: 2
  },
  {
    label: "原声带",
    value: 3
  },
  {
    label: "古典",
    value: 4
  },
  {
    label: "嘻哈说唱",
    value: 5
  },
  {
    label: "国风",
    value: 6
  },
  {
    label: "国风流行",
    value: 7
  },
  {
    label: "摇滚",
    value: 8
  },
  {
    label: "日本流行",
    value: 9
  },
  {
    label: "朋克",
    value: 10
  },
  {
    label: "欧美流行",
    value: 11
  },
  {
    label: "电子",
    value: 12
  },
  {
    label: "粤语流行",
    value: 13
  },
  {
    label: "节奏布鲁斯",
    value: 14
  },
  {
    label: "轻音乐",
    value: 15
  },
  {
    label: "非洲节拍",
    value: 16
  },
  {
    label: "韩国流行",
    value: 17
  },
]

const initSongTypeChart = (data) => {
  if (songTypeChartRef.value) {
    songTypeChartInstance = echarts.init(songTypeChartRef.value)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: '歌曲类型',
          type: 'pie',
          avoidLabelOverlap: false,
          padAngle: 3,
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: data.map((item, index) => ({
            name: styleList[index].label,
            value: item.count,
            itemStyle: {
              color: [
                '#5470C6', '#91CC75', '#FAC858', '#EE6666',
                '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
                '#FC98B8', '#E5CF0D', '#BDA29A', '#B5C334',
                '#FF9F7F', '#F0805A', '#26C0AB', '#99A9BF',
                '#D87A80',
              ][index % 17]
            }
          })),
          emphasis: {
            itemStyle: {
              borderRadius: 10
            }
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          }
        }
      ]
    }
    songTypeChartInstance.setOption(option)
  }
}

const initArtistCountryChart = (data) => {
  if (artistCountryChartRef.value) {
    artistCountryChartInstance = echarts.init(artistCountryChartRef.value)

    const countries = data.map(item => item.area)

    const option = {
      tooltip: {
        trigger: 'item',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: countries,
        axisLabel: {
          interval: 0,
          rotate: 50
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          name: '歌手数量',
          type: 'bar',
          data: data.map((item, index) => ({
            value: item.count,
            itemStyle: {
              color: [
                '#5470C6', '#91CC75', '#FAC858', '#EE6666',
                '#73C0DE', '#3BA272', '#FC8452', '#9A60B4'
              ][index % 8],
              borderRadius: [5, 5, 0, 0]
            }
          })),
          barWidth: '30%',
          showBackground: false,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }
      ]
    }
    artistCountryChartInstance.setOption(option)
  }
}

const resizeCharts = () => {
  userChartInstance?.resize()
  songTypeChartInstance?.resize()
  artistCountryChartInstance?.resize()
}

const initData = () => {
  getTotalList();
  songStyleCount();
  artistCountryCount();
}

// 组件挂载后执行初始化
onMounted(() => {
  initData();
  // 监听窗口大小变化事件以支持响应式
  window.addEventListener('resize', resizeCharts)
})

// 组件卸载前清理资源，防止内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  userChartInstance?.dispose()
  songTypeChartInstance?.dispose()
  artistCountryChartInstance?.dispose()
})


</script>
<style scoped>
.el-row {
  margin-bottom: 20px;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.statistic-title {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
}


</style>