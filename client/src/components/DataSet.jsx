import React, { useState } from "react";
import "./DataSet.css";

const DataSet = ({
  data = [],
  header = [],
  renderHeader = (item) => item.toString(),
  renderCell = (item) => item.toString(),
  onDeleteSelected,
  onUpdateItem,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());

  let generatedHeaderValue = [];
  if (header.length > 0) {
    generatedHeaderValue = header;
  } else {
    if (data.length > 0) {
      generatedHeaderValue = Object.keys(data[0]).map((key) => ({
        key,
        title: key,
      }));
    }
  }

  const selectRow = (index, event) => {
    const selectedRowsCurrent = new Set(selectedRows);

    if (event.ctrlKey) {
      if (selectedRowsCurrent.has(index)) {
        selectedRowsCurrent.delete(index);
      } else {
        selectedRowsCurrent.add(index);
      }
    } else {
      if (selectedRowsCurrent.has(index)) {
        selectedRowsCurrent.clear();
      } else {
        selectedRowsCurrent.clear();
        selectedRowsCurrent.add(index);
      }
    }

    setSelectedRows(selectedRowsCurrent);
  };

  const handleDelete = () => {
    if (selectedRows.size > 0 && onDeleteSelected) {
      onDeleteSelected(selectedRows);
      setSelectedRows(new Set());
    }
  };

  const handleUpdate = (index) => {
    if (!onUpdateItem) return;

    const currentItem = data[index];
    const newName = prompt("Name:", currentItem.name);
    if (newName === null) return;

    const newEmail = prompt("Email:", currentItem.email);
    if (newEmail === null) return;

    const newBody = prompt("Comment:", currentItem.body);
    if (newBody === null) return;

    onUpdateItem(index, {
      name: newName,
      email: newEmail,
      body: newBody,
    });
  };

  return (
    <div>
      {selectedRows.size > 0 && (
        <button onClick={handleDelete} className="deleteSelectedButton">
          Delete Selected ({selectedRows.size})
        </button>
      )}
      <table className="dataSetTable">
        <thead>
          <tr>
            <th className="dataSetSelectorCell"></th>
            {generatedHeaderValue.map((col, colIndex) => (
              <th key={colIndex}>{renderHeader(col.title || col.key)}</th>
            ))}
            {!onDeleteSelected && !onUpdateItem ? null : <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => {
            const isSelected = selectedRows.has(rowIndex);
            let rowClassName = "dataSetRow";
            let selectorCellClassName = "dataSetSelectorCell";

            if (isSelected) {
              rowClassName += " dataSetRowSelected";
              selectorCellClassName += " dataSetRowSelected";
            }

            return (
              <tr key={rowIndex} className={rowClassName}>
                <td
                  className={selectorCellClassName}
                  onMouseDown={(event) => selectRow(rowIndex, event)}
                ></td>
                {generatedHeaderValue.map((col, colIndex) => (
                  <td key={colIndex}>{renderCell(item[col.key])}</td>
                ))}
                {!onDeleteSelected && !onUpdateItem ? null : (
                  <td>
                    <button
                      onClick={() => handleUpdate(rowIndex)}
                      className="updateButton"
                    >
                      Update
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataSet;
