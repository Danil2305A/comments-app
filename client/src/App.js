import { useState, useEffect, useOptimistic } from "react";
import { useParams } from "react-router-dom";
import DataSet from "./components/DataSet";
import "./components/DataSet.css";

const API_URL = "http://localhost:8080/comments";

const App = () => {
  const { id } = useParams();
  const isSingleCommentView = id;
  const [comments, setComments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, action) => {
      switch (action.type) {
        case "add":
          return [...state, action.comment];
        case "delete":
          return state.filter((comment) => !action.ids.includes(comment.id));
        case "update":
          return state.map((comment) =>
            comment.id === action.comment.id ? action.comment : comment
          );
        default:
          return state;
      }
    }
  );

  const fetchComments = async () => {
    if (id) {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        setComments([]);
        return;
      }
      const data = await response.json();
      setComments([data]);
    } else {
      const response = await fetch(API_URL);
      const data = await response.json();
      setComments(data);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  const handleAddComment = async (newComment) => {
    setShowAddModal(false);
    const tempId = Date.now();
    const optimisticComment = { ...newComment, id: tempId };

    addOptimisticComment({ type: "add", comment: optimisticComment });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(newComment),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      if (!response.ok) throw new Error("Failed to add comment");

      const data = await response.json();
      setComments((prev) => [...prev, data]);
    } catch (err) {
      setComments((prev) => prev.filter((comment) => comment.id !== tempId));
    }
  };

  const handleDeleteComments = async (selectedRows) => {
    const idsToDelete = Array.from(selectedRows).map(
      (index) => optimisticComments[index].id
    );

    addOptimisticComment({ type: "delete", ids: idsToDelete });

    try {
      const deletePromises = idsToDelete.map((id) =>
        fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(deletePromises);
      const allOk = responses.every((response) => response.ok);

      if (!allOk) throw new Error("Some deletions failed");

      setComments((prev) =>
        prev.filter((comment) => !idsToDelete.includes(comment.id))
      );
    } catch (err) {
      fetchComments();
    }
  };

  const handleUpdateComment = async (index, updatedComment) => {
    const originalComment = optimisticComments[index];

    addOptimisticComment({
      type: "update",
      comment: { ...originalComment, ...updatedComment },
    });

    try {
      const response = await fetch(`${API_URL}/${originalComment.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedComment),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      if (!response.ok) throw new Error("Failed to update comment");

      const data = await response.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === originalComment.id ? data : comment
        )
      );
    } catch (err) {
      fetchComments();
    }
  };

  const header = [
    { key: "id", title: "ID" },
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "body", title: "Comment" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {!isSingleCommentView && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="createButton"
          >
            Create
          </button>
        </div>
      )}

      {showAddModal && (
        <AddCommentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddComment}
        />
      )}

      <DataSet
        data={optimisticComments}
        header={header}
        renderHeader={(header) => <strong>{header}</strong>}
        renderCell={(cell) => cell}
        onDeleteSelected={
          isSingleCommentView ? undefined : handleDeleteComments
        }
        onUpdateItem={isSingleCommentView ? undefined : handleUpdateComment}
      />
    </div>
  );
};

const AddCommentModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    body: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      email: formData.email,
      body: formData.body,
    });
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>Create</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="modalInput"
              required
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="modalInput"
              required
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Comment:
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              className="modalTextarea"
              required
            />
          </div>
          <div className="modalButtonGroup">
            <button type="button" onClick={onClose} className="cancelButton">
              Cancel
            </button>
            <button type="submit" className="saveButton">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
