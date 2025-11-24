import React from "react";
import toast from "react-hot-toast";
import TodoServices from "../../Services/TodoServices";

const PopModel = ({
  title,
  setTitle,
  description,
  setDescription,
  showModal,
  setShowModal
}) => {
    //handle close
  const handleClose = () => {setShowModal(false)}

    //handle submit
    const handleSubmit = async() => {
        try {
            const userData = JSON.parse(localStorage.getItem('todoapp'))
            const createdBy = userData && userData.user.id
            const data = {title, description, createdBy}

            if(!title || !description) {
                return toast.error('Please provide Title or Description')
            }

            const todo = await TodoServices.createTodo(data)
            setShowModal(false)
            toast.success('Task Created Successfully')
            console.log(todo)
            setTitle('')
            setDescription('')
        } catch (error) {
            console.log(error)
            toast.error(error)
        }
    }
  return (
    <>
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showModal ? "block" : "none", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Task</h5>
              <button className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-floating">
                <textarea
                  className="form-control"
                  id="floatingTextarea"
                  placeholder="add your description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <label htmlFor="floatingTextarea">Description</label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopModel;
