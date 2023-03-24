export interface ChartOptions {
    responsive: boolean;
    plugins: {
      legend: {
        position: 'top' | 'bottom' | 'left' | 'right';
      };
      title: {
        display: boolean;
        text: string;
      };
    };
  }
  
export default ChartOptions;