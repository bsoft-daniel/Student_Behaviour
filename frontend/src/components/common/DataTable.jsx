import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Columns, Maximize2, Minimize2, Copy, 
  FileText, Printer, Download, ArrowUpDown, ArrowUp, 
  ArrowDown, Eye, Edit, Trash2, History, ChevronLeft, 
  ChevronRight, MoreVertical
} from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { useToast } from '../../context/ToastContext';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records available',
  pagination = null,
  actions = null,
  actionsHeader = 'ACTIONS',
  actionsPosition = 'left',
  enableSearch = true,
  searchValue = null,
  onSearchChange = null,
  enableExport = true,
  onExport = null,
  enableColumnToggle = true,
  enableFullscreen = true,
  sortColumn: externalSortColumn = null,
  sortDirection: externalSortDirection = null,
  onSort: externalOnSort = null,
  onRowClick = null,
  entityName = 'students',
  className = '',
}) => {
  const { showSuccess, showError } = useToast();
  const containerRef = useRef(null);

  // States
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSortColumn, setInternalSortColumn] = useState(null);
  const [internalSortDirection, setInternalSortDirection] = useState('asc');
  const [hiddenColumns, setHiddenColumns] = useState({});
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize rows data
  const rawRows = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  // Safe columns list
  const safeColumns = useMemo(() => {
    return Array.isArray(columns) ? columns : [];
  }, [columns]);

  // Visible columns filter
  const visibleColumns = useMemo(() => {
    return safeColumns.filter((col, idx) => {
      const key = col.id || col.accessor || `col_${idx}`;
      return !hiddenColumns[key];
    });
  }, [safeColumns, hiddenColumns]);

  // Search handling
  const currentSearch = searchValue !== null ? searchValue : internalSearch;

  const handleSearchChange = (val) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!currentSearch || onSearchChange) return rawRows;
    const term = currentSearch.toLowerCase().trim();
    return rawRows.filter(row => {
      return safeColumns.some(col => {
        let val = '';
        if (typeof col.accessor === 'function') {
          val = col.accessor(row);
        } else if (typeof col.accessor === 'string') {
          val = row[col.accessor];
        }
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(term);
        }
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [rawRows, currentSearch, safeColumns, onSearchChange]);

  // Sort handling
  const activeSortColumn = externalSortColumn !== null ? externalSortColumn : internalSortColumn;
  const activeSortDirection = externalSortDirection !== null ? externalSortDirection : internalSortDirection;

  const handleHeaderClick = (col) => {
    const colKey = col.id || col.accessor;
    if (!colKey) return;

    let nextDir = 'asc';
    if (activeSortColumn === colKey) {
      nextDir = activeSortDirection === 'asc' ? 'desc' : 'asc';
    }

    if (externalOnSort) {
      externalOnSort(colKey, nextDir);
    } else {
      setInternalSortColumn(colKey);
      setInternalSortDirection(nextDir);
    }
  };

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!activeSortColumn || externalOnSort) return filteredRows;
    const colDef = safeColumns.find(c => (c.id || c.accessor) === activeSortColumn);
    if (!colDef) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      let valA = typeof colDef.accessor === 'function' ? colDef.accessor(a) : a[colDef.accessor];
      let valB = typeof colDef.accessor === 'function' ? colDef.accessor(b) : b[colDef.accessor];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return activeSortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return activeSortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return activeSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, activeSortColumn, activeSortDirection, externalOnSort, safeColumns]);

  // Toggle Column Visibility
  const toggleColumn = (key) => {
    setHiddenColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Export handlers
  const exportData = (format) => {
    if (onExport) {
      onExport(format, sortedRows);
      return;
    }

    if (sortedRows.length === 0) {
      showError('No records to export');
      return;
    }

    const headers = visibleColumns.map(c => c.header || c.accessor);

    if (format === 'copy') {
      const text = [
        headers.join('\t'),
        ...sortedRows.map(row => 
          visibleColumns.map(col => {
            const v = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
            return String(v ?? '').replace(/\s+/g, ' ');
          }).join('\t')
        )
      ].join('\n');
      navigator.clipboard.writeText(text);
      showSuccess('Table data copied to clipboard');
    } else if (format === 'csv' || format === 'excel') {
      const csvRows = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
        ...sortedRows.map(row => 
          visibleColumns.map(col => {
            const v = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
            return `"${String(v ?? '').replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entityName}_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess(`Exported ${sortedRows.length} ${entityName} as ${format.toUpperCase()}`);
    } else if (format === 'print') {
      window.print();
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(sortedRows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entityName}_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('JSON export generated');
    }
  };

  // Helper to render Actions Column (matching round blue action icons in reference image)
  const renderActions = (row, index) => {
    let actionItems = [];
    if (typeof actions === 'function') {
      actionItems = actions(row, index);
    } else if (Array.isArray(actions)) {
      actionItems = actions;
    }

    if (!actionItems || actionItems.length === 0) return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
        {actionItems.map((act, actIdx) => {
          let IconComp = act.icon;
          if (act.type === 'view' && !IconComp) IconComp = Eye;
          if (act.type === 'edit' && !IconComp) IconComp = Edit;
          if (act.type === 'delete' && !IconComp) IconComp = Trash2;
          if (act.type === 'history' && !IconComp) IconComp = History;

          const isDanger = act.type === 'delete' || act.variant === 'danger';

          return (
            <button
              key={actIdx}
              type="button"
              onClick={() => act.onClick && act.onClick(row, index)}
              title={act.label || act.title || act.type}
              className={`grid-action-btn ${isDanger ? 'danger' : ''} ${act.className || ''}`}
            >
              {IconComp ? (
                React.isValidElement(IconComp) ? IconComp : (
                  typeof IconComp === 'function' || typeof IconComp === 'object' ? React.createElement(IconComp, { size: 13 }) : null
                )
              ) : (
                act.label || act.type
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Pagination bounds calculation
  const currentPage = pagination?.currentPage || 1;
  const pageSize = pagination?.pageSize || (sortedRows.length || 20);
  const totalRecords = pagination?.totalCount !== undefined ? pagination.totalCount : sortedRows.length;
  const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div
      ref={containerRef}
      className={`table-card ${isFullscreen ? 'fixed inset-0 z-50 p-4 rounded-none overflow-y-auto' : ''} ${className}`}
    >
      {/* Top Controls Toolbar */}
      <div className="table-tools">
        {/* Left: Export Toolbar */}
        {enableExport ? (
          <div className="export-bar">
            <span className="export-label">Export:</span>
            <div className="export-btn-group">
              <button
                type="button"
                onClick={() => exportData('copy')}
                title="Copy to Clipboard"
                className="btn-icon-tool"
              >
                <FileText size={13} />
              </button>
              <button
                type="button"
                onClick={() => exportData('excel')}
                title="Export Excel"
                className="btn-icon-tool"
              >
                X
              </button>
              <button
                type="button"
                onClick={() => exportData('pdf')}
                title="Export PDF"
                className="btn-icon-tool"
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => exportData('print')}
                title="Print Table"
                className="btn-icon-tool"
              >
                <Printer size={13} />
              </button>
              <button
                type="button"
                onClick={() => exportData('csv')}
                title="Download CSV"
                className="btn-icon-tool"
              >
                <Download size={13} />
              </button>
            </div>
          </div>
        ) : <div />}

        {/* Right: Columns, Fullscreen & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Columns Toggle Dropdown */}
          {enableColumnToggle && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen(prev => !prev)}
                className="btn-icon-tool"
                style={{ padding: '0 10px', height: '30px' }}
              >
                <Columns size={14} style={{ marginRight: '5px' }} />
                <span>Columns</span>
              </button>

              {isColumnDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '4px',
                  width: '190px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 30,
                  padding: '8px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                    Toggle Columns
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', paddingTop: '6px' }}>
                    {safeColumns.map((col, idx) => {
                      const key = col.id || col.accessor || `col_${idx}`;
                      const isHidden = hiddenColumns[key];
                      return (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!isHidden}
                            onChange={() => toggleColumn(key)}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.header || col.accessor}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fullscreen Toggle */}
          {enableFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="btn-icon-tool"
              style={{ width: '30px', height: '30px' }}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}

          {/* Search Box */}
          {enableSearch && (
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search..."
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="grid-search-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div style={{ padding: '30px' }}>
          <LoadingState message="Loading data records..." />
        </div>
      ) : sortedRows.length === 0 ? (
        <div style={{ padding: '30px' }}>
          <EmptyState title="No Records Found" description={emptyMessage} />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {actions && actionsPosition === 'left' && (
                  <th style={{ width: '100px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{actionsHeader}</span>
                      <MoreVertical size={13} style={{ color: '#94a3b8' }} />
                    </div>
                  </th>
                )}
                {visibleColumns.map((col, idx) => {
                  const colKey = col.id || col.accessor;
                  const isSorted = activeSortColumn === colKey;

                  return (
                    <th
                      key={idx}
                      onClick={() => handleHeaderClick(col)}
                      style={{ cursor: 'pointer', userSelect: 'none', ...(col.width ? { width: col.width } : {}) }}
                      className={col.className || ''}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span>{col.header}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#94a3b8' }}>
                          {isSorted ? (
                            activeSortDirection === 'asc' ? <ArrowUp size={12} style={{ color: '#0f5ca8', fontWeight: 800 }} /> : <ArrowDown size={12} style={{ color: '#0f5ca8', fontWeight: 800 }} />
                          ) : null}
                          <MoreVertical size={13} style={{ opacity: 0.8 }} />
                        </div>
                      </div>
                    </th>
                  );
                })}
                {actions && actionsPosition === 'right' && (
                  <th style={{ width: '100px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{actionsHeader}</span>
                      <MoreVertical size={13} style={{ color: '#94a3b8' }} />
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={onRowClick ? () => onRowClick(row, rowIdx) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {actions && actionsPosition === 'left' && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {renderActions(row, rowIdx)}
                    </td>
                  )}

                  {visibleColumns.map((col, colIdx) => {
                    let cellVal = null;
                    if (col.render) {
                      cellVal = col.render(row, rowIdx);
                    } else if (typeof col.accessor === 'function') {
                      cellVal = col.accessor(row);
                    } else if (typeof col.accessor === 'string') {
                      cellVal = row[col.accessor];
                    }

                    return (
                      <td key={colIdx} className={col.cellClassName || ''}>
                        {cellVal !== null && cellVal !== undefined ? cellVal : '-'}
                      </td>
                    );
                  })}

                  {actions && actionsPosition === 'right' && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {renderActions(row, rowIdx)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Footer Bar with Pagination */}
      <div className="table-footer">
        <div>
          Showing <strong style={{ color: '#0f172a' }}>{startRecord}</strong> to <strong style={{ color: '#0f172a' }}>{endRecord}</strong> of <strong style={{ color: '#0f172a' }}>{totalRecords}</strong> {entityName}
        </div>

        {pagination && pagination.onPageChange && (
          <div className="pagination-pills">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => pagination.onPageChange(currentPage - 1)}
              className="page-pill"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pNum = i + 1;
              const isActive = pNum === currentPage;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => pagination.onPageChange(pNum)}
                  className={`page-pill ${isActive ? 'active' : ''}`}
                >
                  {pNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span style={{ padding: '0 4px', fontWeight: 700, color: '#94a3b8' }}>...</span>
                <button
                  type="button"
                  onClick={() => pagination.onPageChange(totalPages)}
                  className="page-pill"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => pagination.onPageChange(currentPage + 1)}
              className="page-pill"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
