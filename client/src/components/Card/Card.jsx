import React, { useState } from 'react'
import EditTodo from '../EditTodo';

const Card = ({allTask}) => {
  const [showModal, setShowModal] = useState(false);

  //handle Edit
  const handleEdit = () => {
    setShowModal(true);
  }
  return (
    <>
      {
        allTask?.map((task,i) => (
          <>
            <div className="card border-primary mb-3 mt-3" style={{maxWidth:'18rem'}} key={i}>
                <div className="card-header">
                    <div className='chead'>
                      <h6>{task?.title.substring(0,10)}</h6>
                      <h6 className={task?.isCompleted === true ? "tsk-cmp" : "tsk-inc"}>{task?.isCompleted === true ? "Completed" : "incomplete"}</h6>
                    </div>
                </div>
                <div className='card-body'>
                  <h6 style={{fontWeight: "bold"}}>{task?.title}</h6>
                  <p className='card-text'>{task?.description}</p>
                  <h6>Date : {task?.createdAt.substring(0,10)}</h6>
                </div>
                <div className="card-footer bg-transparent border-primary">
                  <button className="btn btn-warning" title='EDIT Task' onClick={handleEdit}>
                    <i className="fa-regular fa-pen-to-square"></i>
                  </button>
                  <button className="btn btn-danger ms-2" title='Delete Task'>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
            </div>
            <div>
              {showModal && <EditTodo task={task} setShowModal={setShowModal} />}
            </div>
          </>
        ))
      }
    </>
  )
}

export default Card
