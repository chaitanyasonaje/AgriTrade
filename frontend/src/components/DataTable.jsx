import React from 'react';

const DataTable = ({ columns = [], rows = [], keyField = '_id' }) => {
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${col.align==='right'?'text-right':''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map(row => (
            <tr key={row[keyField] || Math.random()}>
              {columns.map(col => (
                <td key={col.key} className={`table-cell ${col.align==='right'?'text-right':''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;


