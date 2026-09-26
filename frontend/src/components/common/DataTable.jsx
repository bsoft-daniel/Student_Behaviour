import React from 'react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records available',
  pagination = null,
  onRowClick = null,
  className = '',
}) => {
  if (loading) {
    return <LoadingState message="Loading data records..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Data Found" description={emptyMessage} />;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.className || ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-slate-50/80 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-3.5 px-4 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="p-4 border-t border-slate-200">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};
