<template>
          <apexchart
            type="radialBar"
            height="160"
            :options="chartOptions"
            :series="series"
          />
</template>
<script setup lang="ts">
    import VueApexCharts from "vue3-apexcharts";
    const props = defineProps<{
        series:number,
        label:string
    }>()
    const series = ref([props.series]);
    
    const chartOptions = ref({
      chart: {
        height: 160,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
            startAngle: -150,
            endAngle: 150,
          hollow: {
            margin: 0,
            size: '70%',
            background: '#fff',
          },
          track: {
            background: '#F4F4F4',
            strokeWidth: '67%',
            margin: 0,
          },
          dataLabels: {
            show: true,
            name: {
              offsetY: -12,
              color: '#808080',
              fontSize: '12px',
              fontWeight: '400',
            },
            value: {
                formatter: val => new Intl.NumberFormat('fa-IR').format(Number(val).toFixed(1)) + '٪',
              offsetY: -5,
              color: '#111',
              fontSize: '16px',
              fontWeight: '700',
              show: true,
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          gradientToColors: ['#2B7CFF'],
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      stroke: {
        lineCap: 'round'
      },
      labels: [props.label],
    });
    </script>