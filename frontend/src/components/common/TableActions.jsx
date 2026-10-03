import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

/**
 * Common Action Icons component for Table Rows
 * Renders View (Eye), Edit (Edit2), and Delete (Trash2) icons with theme styling
 */
export const TableActions = ({
  onView = null,
  onEdit = null,
  onDelete = null,
  viewTitle = 'View Details',
  editTitle = 'Edit Record',
  deleteTitle = 'Delete Record',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="grid-action-btn"
          title={viewTitle}
        >
          <Eye size={13} />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="grid-action-btn"
          title={editTitle}
        >
          <Edit2 size={13} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="grid-action-btn danger"
          title={deleteTitle}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
};

export default TableActions;
