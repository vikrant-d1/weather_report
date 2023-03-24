import { Moment } from 'moment';
import TemperatureHumidity from './TemperatureHumidity'

interface WeatherFormData {
    id:number,
    latitude: number|string;
    longitude: number|string;
    city: string;
    dateRange: DateRange;
    temperatureHumidity:TemperatureHumidity
    createdAt:Moment;
    updatedAt:Moment;
  }


interface DateRange {
    startDate: Moment;
    endDate: Moment;
  }

export default WeatherFormData;