import { useState } from "react";
import React from "react";
import Navbar from "../../components/Layout/Navbar";
import PopModel from "../../components/Layout/PopModel";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  //handle modal
  const openModalHandler = () => {
    setShowModal(true);
  };
  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="add-task">
          <h1>Your Task</h1>
          <input type="search" placeholder="search your task" />
          <button className="btn btn-primary" onClick={openModalHandler}>
            Create Task <i className="fa-solid fa-plus"></i>
          </button>
        </div>
        <h1>
          {title} and {description}
        </h1>
        {/* =============modal================ */}
        <PopModel
          showModal={showModal}
          setShowModal={setShowModal}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
        />
      </div>
    </div>
  );
};

export default HomePage;
