//Serial stuff
const SerialPort = require('serialport')
import Vue from 'vue';
import Test from './test';

const app = new Vue(Test).$mount('#test');

let DeviceConnected = false;
let sampleCollectionComplete = false;
let TotalSamples=1000;

var echarts = require('echarts');

function pushArray(arr, arr2) {
  arr.push.apply(arr, arr2);
}

let select = document.getElementById("ComPortDOM");
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    var el = document.createElement("option");
    el.textContent = port.comName+"";
    el.value = port.conName+"";
    select.appendChild(el);
    console.log(el.value)
  });
});

document.getElementById("connectToPort").onclick = function() {connectToPort()};
function connectToPort(){
  // initialize echarts instance with prepared DOM
var myChart = echarts.init(document.getElementById('main'));
// draw chart
var option = {
  title: {
      text: 'Plot'
  },
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
  }},
  toolbox: {
    feature: {
        dataZoom: {
            yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
    }
},dataZoom: [{
  type: 'inside',
  start: 0,
  end: 10
}, {
  start: 0,
  end: 10,
  handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
  handleSize: '80%',
  handleStyle: {
      color: '#fff',
      shadowBlur: 3,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowOffsetX: 2,
      shadowOffsetY: 2
  }
}],
  xAxis: {
    type: 'category',
    data: []
},
yAxis: {
    type: 'value'
},
series: [{
    data: [],
    type: 'line'
}]
};

var e = document.getElementById("ComPortDOM");
let port = new SerialPort(e.options[e.selectedIndex].text, {
  baudRate: 38400
})
port.write('v', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
})

app.text = "";
let samples=new Array();
// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
});

// Switches the port into "flowing mode"
port.on('data', function (data) {
  //  console.log('Data:', data.toString())
    if(DeviceConnected==false)
    {
      app.text=data.toString()
      DeviceConnected=true;
    } else{
      pushArray(samples,data)
      console.log(samples.length)
      if(samples.length>TotalSamples){
        if(!sampleCollectionComplete){
          for (let index = 0; index < TotalSamples; index++) {
            option.xAxis.data.push(index);
          }
          option.series[0].data=samples;
          myChart.setOption(option);
        }
        sampleCollectionComplete=true;
        console.log("received")
        port.write('n',function(err){})
        
      }
    }
});
setTimeout(() => {
  port.write('C', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
  })
}, 1000);
}