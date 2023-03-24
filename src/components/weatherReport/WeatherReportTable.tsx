import React,{useState,useEffect} from 'react';
import { Link } from "react-router-dom";
import WeatherFormData from '../../interFaces/WeatherFormData';
import moment from 'moment';
import ContextMenu from './ContextMenu';
import TemperatureHumidity from '../../interFaces/TemperatureHumidity';
import { reportTableHeader } from '../../constants/constant';

const WeatherReportTable: React.FC = () => {
  const [headers,setHeaders] = useState(reportTableHeader);
  const [data,setData] = useState<WeatherFormData[]>([]);
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({});

  useEffect(()=>{
   const getReports:any = localStorage.getItem('reports');
   const reports = JSON.parse(getReports);
   let selectedIds = {};
   reports?.forEach((elm,index) => {
    selectedIds = {...selectedIds,[index]:false};
   });
   setCheckedRows(selectedIds);
   setData(reports);
  },[])

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
   };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = (id:Number|String) => {
  let selectedIds:Number[]=[];
   for(let ids in checkedRows){
    if(checkedRows[ids]){
      selectedIds?.push(+ids)
    }
   }
   
   if(selectedIds?.length>0){
    let  removeIdData: Boolean|WeatherFormData[] = data?.filter(item=>!selectedIds.includes(item?.id));
    setData(removeIdData);
    localStorage.setItem('reports',JSON.stringify(removeIdData))
   }else{
    let  removeIdData: Boolean|WeatherFormData[] = data?.filter(item=>item?.id!=id);
    setData(removeIdData);
    localStorage.setItem('reports',JSON.stringify(removeIdData))
   }
  };

  const getIncludedDataStatus = (tempData:TemperatureHumidity|null) => {
    if(tempData?.relativeHumidity && tempData?.temperature){
      return 'Temperature and relative humidity';
    }else if(tempData?.relativeHumidity){
      return 'Relative humidity only';
    }else if(tempData?.temperature){
      return 'Temperature only';
    }else{
      return '__'
    }
  }

  const handleCheckRow = (id: number) => {
    setCheckedRows((prevCheckedRows) => ({
      ...prevCheckedRows,
      [id]: !prevCheckedRows[id],
    }));
  };

  const handleCheckAll = () => {
    const allChecked = Object.values(checkedRows).every(Boolean);
    const newCheckedRows = data.reduce<{ [key: number]: boolean }>(
      (acc, row) => ({
        ...acc,
        [row.id]: !allChecked,
      }),
      {}
    );
    setCheckedRows(newCheckedRows);
  };

  useEffect(()=>{
    console.log('checkedRows',checkedRows)
  },[checkedRows])

  return (
  <>
    <h3 className="mt-5">Saved Reports</h3>
    <div className="table-responsive mt-4">
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th>
              <span className="checkbox_wrapper checkbox_wrapper_white">
                <input type="checkbox" checked={Object.values(checkedRows).every(Boolean)} onChange={handleCheckAll}/>
                <span className="check_box" />
              </span>
          </th>
            {headers.map(header => (
                  <th key={header}>{header}</th>
                ))}
          </tr>
        </thead>
        <tbody>
          {data?.length>0?data.map((item,i)=><tr key={'_table_row_'+i} onContextMenu={(e) => handleContextMenu(e, item.id)}>
              <td>
                <span className="checkbox_wrapper">
                  <input type="checkbox" checked={checkedRows[item.id] || false} onChange={() => handleCheckRow(item.id)}/>
                  <span className="check_box" />
                </span>
              </td>
              <td>{item.city}</td>
              <td>{getIncludedDataStatus(item?.temperatureHumidity)}</td>
              <td>{item?.longitude},{item?.latitude}</td>
              <td>{moment(item?.dateRange?.startDate)?.format('YYYY-MM-DD')}-{moment(item?.dateRange?.endDate)?.format('YYYY-MM-DD')}</td>
              <td>{moment(item?.createdAt)?.format('YYYY-MM-DD')}</td>
              <td>
                <div className="table_action">
                 <Link to={`/view/${item?.id}`}><i className="fa fa-eye" /></Link>
                  <i className="fa fa-pencil" />
                  <span onClick={()=>handleDelete(item?.id)}>
                     <i className="fa fa-trash-o" />
                  </span>
                </div>
              </td>
                </tr>):null}
        </tbody>
      </table>
      {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={handleCloseContextMenu}
                onDelete={() => handleDelete(contextMenu?.id)}
              />
            )}
    </div>
  </>
  );
};

export default WeatherReportTable;
