import React from 'react';

interface Props {
  data: {
    id: number;
    name: string;
    age: number;
    email: string;
  };
}

const TableRow: React.FC<Props> = ({ data }) => {
  return (
    <tr>
      <td>{data.id}</td>
      <td>{data.name}</td>
      <td>{data.age}</td>
      <td>{data.email}</td>
    </tr>
  );
};

export default TableRow;