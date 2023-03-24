import React, { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import SelectedOption from '../../interFaces/SelectedOption';
import WeatherFormData from '../../interFaces/WeatherFormData';

interface ChildProps {
    index:number,
    handleRowChange:(index: number, field: keyof WeatherFormData, value: string | number) => void;
  };

const CityDropdown: React.FC<ChildProps>= ({index, handleRowChange }) => {
  const [options, setOptions] = useState<SelectedOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [searchValue, setSearchValue] = useState('');

  const fetchData = async (inputValue: string) => {
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${inputValue}`);
    const options = response?.data?.results?.map((option: any) => ({
      value: `${option?.latitude+','+option?.longitude}`,
      label: option.name,
    }));
    setOptions(options);
  };

  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    fetchData(inputValue);
  };

 const onSelect = (data:SelectedOption) =>{
    setSelectedOption(data);
    let latLong = data?.value.split(',');
    console.log('checkData',latLong);
    handleRowChange(index,'latitude',latLong[0])
    handleRowChange(index,'longitude',latLong[1])
    handleRowChange(index,'city',data?.label)
 }

  return (
    <Select
      options={options}
      classNamePrefix='city_selector'
      defaultValue={selectedOption}
      onInputChange={handleInputChange}
      onChange={(e)=>onSelect(e)}
      placeholder="Search for a location..."
      // menuIsOpen={true}
    />
  );
};

export default CityDropdown;
