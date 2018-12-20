import React from 'react';

import { Button, Dropdown, Container, Header, Message } from 'semantic-ui-react'

let selectedCategory=[]



const Modal = ({ handleSubmit, handleClose, show, post, categ }) => {

    state={
      displayVal:post.categories
    }

    const showHideClassName = show ? "modal display-block" : "modal display-none";

    const setCategories = (event, {value})=>{
      console.log(value);
      selectedCategory=value;
      this.setState({displayVal:value})
    }

    const submitCateg=()=>{
      handleSubmit(post.id, selectedCategory)
      handleClose()
     
      selectedCategory=[];
    }

    

    return (
      <div className={showHideClassName}>
        <section className="modal-main">
        <Container text>
        <Header size='medium'>Would you help to categorize this post?</Header>
          <Message  >
            <Message.Header> {post.title} </Message.Header>
            <p> {post.user}</p>
            <p> {post.content} </p>
          </Message>
          
          
          <Dropdown placeholder='Categories' fluid multiple selection closeOnChange options={categ} value={this.state.displayVal} onChange = {setCategories} />
          <Button onClick={submitCateg}>Submit</Button>
          <Button onClick={handleClose}>Close</Button>
        </Container>
         
        </section>
      </div>
    );
};



export default Modal;  