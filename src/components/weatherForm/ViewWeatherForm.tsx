import React, { useState,useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import moment, { Moment } from 'moment';
import WeatherFormData from '../../interFaces/WeatherFormData';
import TemperatureHumidity from '../../interFaces/TemperatureHumidity';
import ChartOptions from '../../interFaces/ChartOptions';
import axios from 'axios';
import ChartData from '../../interFaces/ChartData';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ViewWeatherForm: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useParams();
  const [formData, setFormData] = useState<WeatherFormData[]>([{
    id:0,
    latitude:'',
    longitude:'',
    city: '',
    dateRange:{startDate: moment().subtract(7, 'days'),
    endDate: moment()},
    temperatureHumidity:{
      temperature: false,
      relativeHumidity: false,
    },
    createdAt:moment(),
    updatedAt:moment(),
  }]);

  const [lineChartData, setLineChartData] = useState<ChartData[]>([]);
  const [chartConfigOptions,setChartConfigOption] = useState<ChartOptions[]>([])
  const [tempData, setTempData] = useState<TemperatureHumidity>({
    temperature:false,
    relativeHumidity:false
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let storedData = JSON.parse(localStorage.getItem('reports'));
    let data = [...storedData,...formData];
    localStorage.setItem('reports',JSON.stringify(data));
    navigate('/reports')
    console.log(formData);
  };

  useEffect(()=>{
    let id = +searchParams?.id;
    let storedData = JSON.parse(localStorage.getItem('reports'));
    let viewData = storedData?.filter(item=>item?.id==id);
    viewData.dateRange={startDate:moment(viewData?.dateRange?.startDate), endDate:moment(viewData?.dateRange?.endDate)};

    if(viewData?.length>0){
        setFormData(viewData);
        setTempData(viewData[0]?.temperatureHumidity)
    }
    // setFormData
  },[searchParams])

  useEffect(() => {
    getWeatherData(formData[0]);
  }, [tempData]);

  const getWeatherData = async (param:WeatherFormData) => {
  
    if(param?.latitude!=''&& param?.longitude!=''){
    let startDate:String = moment(param?.dateRange?.startDate).format('YYYY-MM-DD');
    let endDate:String = moment(param?.dateRange?.endDate).format('YYYY-MM-DD');
    let includeData:String = getIncludedDataStatus(tempData);
    const result = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${param?.latitude}&longitude=${param?.longitude}&hourly=${includeData}&current_weather=true&start_date=${startDate}&end_date=${endDate}`
    );

   let lineChartLabels:string[]=getDateRange(param?.dateRange?.startDate,param?.dateRange?.endDate)
   let dataSet = [];
   for(let itemKey in result?.data?.hourly){
    if(itemKey!='time'){
      dataSet.push( {
        label: itemKey,
        data: result?.data?.hourly[itemKey],
        fill: false,
        backgroundColor:itemKey==='temperature_2m'?'rgba(75,192,192,0.4)':'rgba(32,127,253,1)',
        borderColor: itemKey==='temperature_2m'?'rgba(75,192,192,1)':'rgba(32,127,253,1)',
      })
    }
   }

   if(tempData?.relativeHumidity||  tempData.temperature){
    let duplicateDataIndex = chartConfigOptions?.findIndex(chartData=>chartData?.plugins?.title?.text==param?.city);
    if(duplicateDataIndex!=-1){
      chartConfigOptions?.splice(duplicateDataIndex,1);
    }
       setChartConfigOption([...chartConfigOptions,{
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: param.city,
          },
        },}])
        if(duplicateDataIndex!=-1){
          chartConfigOptions?.splice(duplicateDataIndex,1);
          lineChartData?.splice(duplicateDataIndex,1);
        }
        setLineChartData([...lineChartData,{
        ...lineChartData[0],
        labels:lineChartLabels,
        datasets:dataSet
      }])
   }       
  }
  };

  const getDateRange=(date1:Moment,date2:Moment)=>{
    let day1 = moment(date1);
    let day2 = moment(date2);
    let _result: Moment[] = [moment({...day2})];

   while(day1.date() != day2.date()){
     day2.add(1, 'day');
     _result.push(moment({ ...day2 }));  
   }
   return _result.map(x => x.format("MM/DD/YYYY"))
  }

  const getIncludedDataStatus = (tempData:TemperatureHumidity) => {
    if(tempData?.relativeHumidity && tempData?.temperature){
      return 'temperature_2m,relativehumidity_2m';
    }else if(tempData?.relativeHumidity){
      return 'relativehumidity_2m';
    }else if(tempData?.temperature){
      return 'temperature_2m';
    }else{
      return 'temperature_2m'
    }
  }

  return (
    <div>
       <h3>Weather status of {formData[0].city}</h3>
      <form onSubmit={handleSubmit}>
        {formData?.length>0? formData?.map((item,index)=><div className="row mt-4" key={index}>
        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="text"
              className="form-control"
              value={item?.latitude}
              onChange={()=>{}} 
              readOnly
              />
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="text"
              className="form-control" 
              value={item?.longitude}
              onChange={()=>{}} 
              readOnly
              />
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              className="form-control" 
              value={item?.city}
              onChange={()=>{}} 
              readOnly
              />
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>Date Range</label>
            <input
              type="text"
              className="form-control" 
              value={`${moment(item?.dateRange?.startDate).format('L')} - ${moment(item?.dateRange?.endDate).format('L')}`}
              onChange={()=>{}} 
              readOnly
              />
          </div>
        </div>
          </div>
          ):null}  
        <div className="row mt-4 align-items-center">
          <div className="col-md-3 text-start">
            <span className="checkbox_wrapper">
              <input name="temperature" checked={tempData.temperature} onChange={()=>{}}  type="checkbox" />
              <span className="check_box" />
            </span>
            <span>Temperature</span>
          </div>

          <div className="col-md-3">
            <span className="checkbox_wrapper">
            <input name="relativeHumidity" checked={tempData.relativeHumidity} onChange={()=>{}}  type="checkbox"/>
              <span className="check_box" />
            </span>
            <span>Relative Humidity</span>
          </div>
        </div>
     
      </form>
      {lineChartData?.length>0?<div className='row chart-parent-body mt-4'>
      {lineChartData?.map((data,i)=><div key={i} className='col-md-12'>
        <Line options={chartConfigOptions[i]} data={data} />
      </div>)}
      </div>:null}
    </div>
  )
}

export default ViewWeatherForm;