import React, { useState,useEffect} from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { useNavigate } from "react-router-dom";
import moment, { Moment } from 'moment';
import WeatherFormData from '../../interFaces/WeatherFormData';
import TemperatureHumidity from '../../interFaces/TemperatureHumidity';
import ChartOptions from '../../interFaces/ChartOptions';
import axios from 'axios';
import CityDropdown from './CityDropdown';
import ChartData from '../../interFaces/ChartData';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const WeatherForm: React.FC = () => {
  const navigate = useNavigate();
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
  const [latitudeError, setLatitudeError] = useState<String>("");
  const [longitudeError, setLongitudeError] = useState<String>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [dateRangeError, setDateErrorRange] = useState<String>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let localStorageData = localStorage.getItem('reports');
    let storedData:WeatherFormData[] = localStorageData!=undefined? JSON.parse(localStorageData):[];
    const _errors = formData.map(checkError=>validate(checkError))
    let isValid:Boolean = false;
    if(_errors?.length>0){
      _errors.forEach(errors => {
        if (Object.keys(errors).length === 0) {
          isValid= true;
        } else {
          isValid= false;
          setErrors(errors);
        }
      });
    }
    if(isValid){
      let data;
      let trasformData;
        if(storedData?.length>0){
          let localStoredData =localStorage.getItem('reports');
          if((localStoredData!=undefined&&localStoredData!=null)){
            let storedData =JSON.parse(localStoredData);
            trasformData= [...storedData,...formData]?.map((item,i)=>{
            item.id= i;
            return item;
          })
          }
        data= trasformData;
        }else{
        data = [...formData];
        }
       localStorage.setItem('reports',JSON.stringify(data));
       navigate('/reports')
  }
    };

  const validate = (values: WeatherFormData) => {
    const errors: { [key: string]: string } = {};
      if (!values.latitude) {
        errors.latitude = "Latitude is required";
      }
      if (!values.longitude) {
        errors.longitude = "Longitude is required";
      }
      if (!values.city) {
        if(latitudeError!==''&&latitudeError!==''){
          errors.city = "City is required";
        }
      }
      return errors;
    };


  const handleRowChange = (index: number, field: keyof WeatherFormData, value: string) => {
    setCurrentIndex(index);
    if(field==='city'){
      setLatitudeError('');
      setLongitudeError('');
      getWeatherData(formData[index]);
      lineChartData.splice(index,1);
      setLineChartData(lineChartData)
      chartConfigOptions.splice(index,1)
      setChartConfigOption(chartConfigOptions);
    }
    const newRows:any = [...formData];
    if(field==='latitude'){
      if(handleLatitudeChange(value)){
        setLatitudeError('')
      }else{
        setLatitudeError('Enter valid value.')
      }
    }
    if(field==='longitude'){
      if(handleLongitudeChange(value)){
        setLongitudeError('')
      }else{
        setLongitudeError('Enter valid value.')
      }
    }
    newRows[index][field] = value;
    setFormData(newRows);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event?.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const newRows:any = [...formData];
    newRows[currentIndex]['temperatureHumidity'] = {
      ...newRows[currentIndex]['temperatureHumidity'],
      [name]: value,
    };
     setFormData(newRows);
  }

  const handleLongitudeChange = (value:string) => {
    if (/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
      return true;
    }
  };

  const handleLatitudeChange = (value:string) => {
    if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/.test(value)) {
      return true;
    }
  };

  useEffect(() => {
    getWeatherData(formData[currentIndex]);
  },[formData[currentIndex]['temperatureHumidity']]);

  useEffect(() => {
    getWeatherData(formData[currentIndex]);
  },[formData[currentIndex].latitude,formData[currentIndex].longitude]);
  

  const handleAddRow = () => {
    const _errors = formData.map(checkError=>validate(checkError))
    let isValid:Boolean = false;
    if(_errors?.length>0){
      _errors.forEach(errors => {
        if (Object.keys(errors).length === 0) {
          isValid= true;
          setCurrentIndex(currentIndex+1);
        } else {
          isValid= false;
          setErrors(errors);
        }
      });
    }
    let localStoredData =localStorage.getItem('reports');
    let storedData = (localStoredData!=undefined&&localStoredData!=null)?JSON.parse(localStoredData):[];
    if(storedData=== undefined||storedData?.length===0){
      storedData=formData;
    }
    let idData= getId(storedData)
    let id:number = +idData+1;
    if(isValid){
      setFormData([...formData, {
        id:id,
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
    }
  };

  const getId =(storedData) =>{
    let idData = storedData.reduce((max, current) => {
      if (current.id > max) {
        return current.id;
      } else {
        return max;
      }
    }, 0)
    return idData;
  }

  const handleDateRangeChange=(e: React.ChangeEvent<HTMLInputElement>,picker: { startDate: Moment; endDate: Moment },index:number) =>{
    const newRows:any = [...formData];
    if (picker?.endDate.diff(picker.startDate, 'days') === 7) {
        setDateErrorRange('');
        newRows[index]['dateRange'] = {startDate: picker.startDate,
        endDate: picker.endDate};
     
    }else{
      newRows[index]['dateRange'] = {startDate: picker.startDate,
        endDate: picker.endDate};
      setDateErrorRange('Date range invalid date range should be 7 days');
    }
    setFormData(newRows);
    getWeatherData(newRows[index]);
  }

  const getWeatherData = async (param:WeatherFormData) => {
    if((param?.latitude!==''&& param?.longitude!=='') && (latitudeError===''&&
    longitudeError==='')){
    let startDate:String = param?.dateRange?.startDate.format('YYYY-MM-DD');
    let endDate:String = param?.dateRange?.endDate.format('YYYY-MM-DD');
    let includeData:String = getIncludedDataStatus(formData[currentIndex]['temperatureHumidity']);
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

   if(formData[currentIndex]['temperatureHumidity']?.relativeHumidity||formData[currentIndex]['temperatureHumidity'].temperature){
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
       <h3>Select Coordinates Or City</h3>
      <form onSubmit={handleSubmit}>
        {formData?.length>0? formData?.map((item,index)=><div className="row mt-4" key={index}>
        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="text"
              className="form-control"
              value={item?.latitude}
              onChange={(event) => handleRowChange(index,'latitude', event.target.value)} 
              readOnly={currentIndex!==index?true:false}
              />
          </div>
          {(item?.latitude==='' && latitudeError==='') && <span className='text-danger d-flex text-start'>{errors.latitude}</span>}
          {(latitudeError!=='' && item?.longitude==='')  && <span className='text-danger d-flex text-start'>{latitudeError}</span>}
          
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="text"
              className="form-control" 
              value={item?.longitude}
              onChange={(event) => handleRowChange(index,'longitude', event.target.value)} 
              readOnly={currentIndex!==index?true:false}
              />
          </div>
          {(item?.longitude==='' && longitudeError==='') && <span className='text-danger d-flex text-start'>{errors.longitude}</span>} 
          {(longitudeError!=='' && item?.longitude==='') && <span className='text-danger d-flex text-start'>{longitudeError}</span>} 
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>City</label>
            {currentIndex!==index?<input
              type="text"
              className="form-control" 
              value={item?.city}
              onChange={() => {}} 
              readOnly={currentIndex!==index?true:false}
              />:
            <CityDropdown index={index} handleRowChange={handleRowChange}/>}
          </div>
          {item.city==='' && <span className='text-danger d-flex text-start'>{errors.city}</span>}
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="form-group">
            <label>Date Range</label>
            {currentIndex!==index?<input
              type="text"
              className="form-control" 
              value={`${item?.dateRange?.startDate.format('L')} - ${item?.dateRange?.endDate.format('L')}`}
              onChange={() => {}} 
              readOnly={currentIndex!==index?true:false}
              />:
             <>
            <DateRangePicker
             onApply={(e,p)=>handleDateRangeChange(e,p,index)}
             initialSettings={item.dateRange}
              >
              <input type="text" value={`${item?.dateRange?.startDate.format('L')} - ${item?.dateRange?.endDate.format('L')}`}
              className="form-control" readOnly={currentIndex!==index?true:false} />
            </DateRangePicker>
            {(dateRangeError!==''&&currentIndex===index)?<span className='text-danger d-flex text-start'>{dateRangeError}</span>:null}
            </>
        }

          </div>
        </div>
        </div>
          ):null}  
        <div className="row mt-4 align-items-center">
          <div className="col-md-3 text-start">
            <span className="checkbox_wrapper">
              <input name="temperature" checked={formData[formData?.length-1]?.temperatureHumidity?.temperature} onChange={handleInputChange}  type="checkbox" />
              <span className="check_box" />
            </span>
            <span>Temperature</span>
          </div>

          <div className="col-md-3">
            <span className="checkbox_wrapper">
            <input name="relativeHumidity" checked={formData[formData?.length-1]?.temperatureHumidity?.relativeHumidity} onChange={handleInputChange} type="checkbox"/>
              <span className="check_box" />
            </span>
            <span>Relative Humidity</span>
          </div>

          <div className="col-md-6">
            <button type='button' onClick={handleAddRow}  className="cm_add_more_btn" ></button>
          </div>
        </div>
        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-dark px-5" type='submit' >Save</button>
        </div>
      </form>
      {lineChartData?.length>0?<div className='row chart-parent-body mt-4'>
      {lineChartData?.map((data,i)=><div key={i} className='col-md-5'>
        <Line options={chartConfigOptions[i]} data={data} />
      </div>)}
      </div>:null}
    </div>
  )
}

export default WeatherForm;