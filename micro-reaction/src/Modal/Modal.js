import React from "react";

import {
  Button,
  Dropdown,
  Container,
  Header,
  Message
} from "semantic-ui-react";
import fb from "../utils/firebaseWrapper";

let selectedCategory = [];
// This is the modal for tasks user interface. 

const Modal = ({
  handleSubmit,
  handleClose,
  handleContinue,
  show,
  post,
  categ
}) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  const setCategories = (event, { value }) => {
    console.log(value);
    selectedCategory = value;
  };

  const addThisTaskOnThread = async (postId, userAnser, taskCateg) => {
    await fb.addThisTaskOnThread(postId, userAnser, taskCateg);
  };

  const submitCateg = async () => {
    await addThisTaskOnThread(post.id, selectedCategory, "categorization");
    handleSubmit(post.id, selectedCategory);
    handleClose();
    selectedCategory = [];
  };

  const continueTask = async () => {
    await addThisTaskOnThread(post.id, selectedCategory, "categorization");
    handleContinue();
    handleSubmit(post.id, selectedCategory);
    selectedCategory = [];
  };

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <Container text>
          <Header size="medium">Would you help to categorize this post?</Header>
          <Message>
            <Message.Header> {post.title} </Message.Header>
            <p> {post.author}</p>
            <p> {post.content} </p>
          </Message>

          <Dropdown
            placeholder="Categories"
            fluid
            multiple
            selection
            closeOnChange
            options={categ}
            onChange={setCategories}
          />
          <Button onClick={submitCateg}>Submit and Exit</Button>
          <Button onClick={continueTask}>Submit and Continue</Button>
          <Button onClick={handleClose}>Close</Button>
        </Container>
      </section>
    </div>
  );
};

export default Modal;
