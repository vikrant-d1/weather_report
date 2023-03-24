// async function that handles the API request

export const getWeather = async () => {
       const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m');
       return  await response.json();
  };
