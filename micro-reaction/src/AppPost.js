import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./AppPost.css";
import {
  Segment,
  Dropdown
} from "semantic-ui-react";

import update from "immutability-helper";
import PostwithUpvotes from "./PostwithUpvotes/PostwithUpvotes";

import LoginBox from "./Login/LoginBox";
import RegisterBox from "./Login/RegisterBox";
import Loading from "./Login/loading";
import DataLoading from "./DataLoading";
import fb from "./utils/firebaseWrapper";
import { observer, inject } from "mobx-react";
import HeaderComp from "./Header";
import HeaderNav from "./HeaderNav";
import Thread from "./Thread";
import classNames from "classnames";
import { ScrollElement, ScrollView } from "./Scroller";

import enLocale from "date-fns/locale/en";
import differenceInDays from "date-fns/difference_in_days";
import distanceInWords from "date-fns/distance_in_words";
import format from "date-fns/format";



const credibilityTasks = [
  {
    tId: 0,
    tType: "Claim",
    tQ: "What is the primary claim made in this article? Please help us highlight it.",
    qDesc:
      "The purpose of an argument—the central idea on which the rhetor is attempting to change the mind of the receivers—is the primary claim of the argument.",
    aType: "annotation",
    aOptions: [
      
    ]
  },
  {
    tId: 1,
    tType: "Convincing Evidence",
    tQ: "What are the evidences given to support the primary claim? Please help us highlight them.",
    qDesc: "",
    aType: "annotation",
    aOptions: [
      
    ]
  },
  {
    tId: 2,
    tType: "Convincing Evidence",
    tQ: "How convincing do you find the evidences given for the primary claim?",
    qDesc: "",
    aType: "radio",
    aOptions: [
      "Very much convincing",
      "Fairly convincing",
      "Moderately Convincing",
      "Slightly Convincing",
      "Not at all Convincing"
    ]
  },
  {
    tId: 3,
    tType: "Convincing Sources",
    tQ: "Where does the author cite other sources? Please help us highlight them.",
    qDesc: "",
    aType: "annotation",
    aOptions: [
     
    ]
  },
  {
    tId: 4,
    tType: "Convincing Evidence",
    tQ: "How convincing do you find the sources given for the primary claim?",
    qDesc: "",
    aType: "radio",
    aOptions: [
      "Very much convincing",
      "Fairly convincing",
      "Moderately Convincing",
      "Slightly Convincing",
      "Not at all Convincing"
    ]
  },
  {
    tId: 5,
    tType: "Representative Citations",
    tQ:
      "This article properly characterizes the methods and conclusions of the quoted source.",
    qDesc:
      "The article could overstate or understate conclusions from the source, selectively quote or cites a portion while ignoring other important aspects, or extrapolate more from the source than what it actually conveys.",
    aType: "radio",
    aOptions: [
      "Strongly disagree",
      "Somewhat disagree",
      "Neutral",
      "Somewhat agree",
      "Strongly agree",
      "Unable to find source",
      "Source is behind a paywall"
    ]
  }
];





@inject("posts")
@inject("users")
@observer
class AppPost extends Component {
  state = {
    tab: "home",
    user: fb.getUserInfo(),
    isTrying: true,
    isLoggedIn: false,
    isLoginOpen: true,
    isRegisterOpen: false,
    isCommentsLoaded: false,
    isThreading: false,
    showTask: false,
    showComId: 0,
    comments: [],
    reasons:[],
    orderingMode: "Popular",
    orderingOptions: [
      { key: "Popular", text: "Popular", value: "Popular" },
      { key: "Random", text: "Random", value: "Random" }
    ],
    selectedCom: [],
    postSeen: [],
    userThread: [],
    isThreadLoaded: false,
    currentTaskId: 0,
    isAdmin: false,
    
  };

  getFormattedDate = d => {
    const now = new Date();
    const date = new Date(d);

    // Less then 1 min
    if (now - date < 60 * 1000) return "Just now";
    // Less then 10 days
    if (differenceInDays(now, date) < 10) {
      return distanceInWords(now, date, { locale: enLocale, addSuffix: true });
    }
    // otherwise YYYY-MM-DD
    return format(date, "YYYY-MM-DD");
  };

  handleSelectTab = tab => {
    this.setState({ tab });
  };

  componentWillMount() {
    document.removeEventListener("keydown", this.escFunction, false);
    this.autoLogin();
    fb.getAllPosts().then(data => {
      this.setState({
        comments: data.filter(value => Object.keys(value).length !== 0),
        isCommentsLoaded: true
      });
    });
    this.getAllThreadsOfThisUser();
    fb.isAdmin().then(value => {
      this.setState({
        isAdmin: value
      });
    });
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
    this.getUser();
    fb.isAdmin().then(data => {
      this.setState({ isAdmin: data });
    });
  }

  escFunction = event => {
    if (event.keyCode === 27) {
      //Esc key
      this.hideTask();
      this.getAllThreadsOfThisUser();
    }
  };

  getAllThreadsOfThisUser = async () => {
    // await fb.getAllThreadsOfThisUser(this.state.userId).then(threads => {
    //   return this.setState({ userThread: threads, isThreadLoaded: true });
    // });
  };

  resetHistoryOfThisUser = () => {
    this.setState({ userThread: [], isThreadLoaded: false });
  };

  updatePostsList = async () => {
    const prevOrderingMode = this.state.orderingMode
      ? this.state.orderingMode
      : "Popular";
    this.setState({ isCommentsLoaded: false }, async function() {
      await fb.getAllPosts().then(data => {
        console.log("Pulled this post from db: ", data)
        this.setState({
          comments: data.filter(value => Object.keys(value).length !== 0),
          isCommentsLoaded: true,
          orderingMode: prevOrderingMode
        });
      });
    });
  };

  autoLogin = async function() {
    const user = await fb.getUserInfo();
    if (user) {
      this.setState({ user, isLoggedIn: true, isTrying: false }, function() {
        // console.log("user", user, this.state.user);
        // console.log("AUTO LOGGED IN!!!");
        const userStore = this.props.users;
        userStore.initUserInfo(
          this.state.user.userId,
          this.state.user.createdAt,
          this.state.user.email,
          this.state.user.name
        );
      });
    } else {
      this.setState({ isTrying: false });
    }
  };

  getUser = async function() {
    
    const user = this.state.user || (await fb.getUserInfo());
    if (!user) {
      return null;
    }
    this.setState({ user });
  };

  // comments = article/post 
  submitTask = (comid, curTaskID, answer, reasons) => {
    
    this.updateStateAnswers (comid, curTaskID, answer, reasons);
    this.state.comments.map(post=> {
      if (post.id === comid){
        console.log("state has been updated with answers: ", post.answers)
      }
    })
    
    let newAnswer= [comid,curTaskID, this.state.user.name, answer,reasons]
    console.log("new Task Answers to be added to db:  ",newAnswer);
    // this.getAllAnswersofTask(comid, curTaskID);
    
    fb.updatePostAnswers(comid, curTaskID, newAnswer);
  }

  updateStateAnswers = (comid, curTaskID, answer, reasons) => {
    let curAnswer= [
      {
       postId:comid,
       taskId:curTaskID,
       user: this.state.user.name,
       answer: answer,
       reason: reasons
      }
    ]
    console.log("new answer :", curAnswer)
    this.setState(
      prevState => {
      return {
          comments: prevState.comments.map(post => {
            if (post.id !== comid) {
              return post;
            } else {
              const newAnswer = post.answers.concat(curAnswer)       
              return {
                ...post,
                answers:newAnswer
              };
            }
          })
        };
      
    },
    )    
  };

  getAllAnswersofTask(taskId,postId) {
    console.log("selected post is: ", this.state.selectedCom)
    let allAnswers=[];
    if (this.state ){
      //console.log(this.state);
      this.state.comments.map(post => {
        if (post.postId === postId) { 
          post.answers.map(answer => {
            if (answer.taskId === taskId) {
              allAnswers = allAnswers.concat(answer)
            }
          });}
      })
      console.log("all answers for post", postId, " task ",taskId, allAnswers)

      return allAnswers;
    } else {
      console.log("Staet not declared. all answers for post", postId, " task ",taskId, allAnswers)
      return allAnswers
    }
    
  }

  setOffThreading = () => {
    this.setState({ isThreading: false });
  };

  startThreading = async (id, startName) => {
    const prevComId = this.state.selectedCom.id;
    this.selectComment(id);
    this.showModal(id);
    this.initiateTask();
    this.setState({ isThreading: true });

    if (!this.state.isThreading || prevComId != id) {
      await fb.newTaskThread(id, startName).then(data => {
        this.getAllThreadsOfThisUser();
      });
    }
  };

  incCount(id) {
    const prevComId = this.state.selectedCom.id;
    this.selectComment(id);
    this.showModal(id);
    this.initiateTask();
    this.setState(
      prevState => {
        return {
          comments: prevState.comments.map(post => {
            if (post.id !== id) {
              return post;
            } else {
              return {
                ...post,
                upvotes: post.upvotes + 1
              };
            }
          })
        };
      },
      async function() {
        await fb.voteOnThisPost(id, true);
        this.state.isThreading && prevComId == id
          ? await fb.voteDuringThread(id, true)
          : await fb.newTaskThread(id, "upvote");
        this.setState({ isThreading: true });
        this.getAllThreadsOfThisUser();
      }
    );
  }

  decCount(id) {
    const prevComId = this.state.selectedCom.id;
    this.selectComment(id);
    this.showModal(id);
    this.initiateTask();
    this.setState(
      prevState => {
        return {
          comments: prevState.comments.map(post => {
            if (post.id !== id) {
              return post;
            } else {
              return {
                ...post,
                upvotes: post.upvotes - 1
              };
            }
          })
        };
      },
      async function() {
        await fb.voteOnThisPost(id, false);
        this.state.isThreading && prevComId == id
          ? await fb.voteDuringThread(id, false)
          : await fb.newTaskThread(id, "downvote");
        this.setState({ isThreading: true });
        this.getAllThreadsOfThisUser();
      }
    );
  }

  nextTask = () => {
    this.setState({
      currentTaskId: this.state.currentTaskId + 1
    });
  };

  initiateTask = () => {
    this.setState({
      currentTaskId: 0
    });
  };

  selectComment(id) {
    this.state.comments.map(com => {
      if (com.id == id) {
        this.setState({ selectedCom: com });
      }
    });
  }

  handleContinue = () => {
   
  };

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  selectOtherPost(curID) {
    var nextID;
    let postSeen = this.state.postSeen;
    
    let posibleId = this.getRandomInt(this.state.comments.length);
    nextID = posibleId;
    return nextID;
  }



  showModal = id => {
    this.setState({
      showTask: true,
      showComId: id
    });
  };

  hideTask = () => {
    this.initiateTask();
    this.setState({
      showTask: false,
      selectedCom: [],
      showComId: 0,
      postSeen: [],
      isThreading: false
    });
  };

  handleLogin = () => {
    this.setState({ isLoggedIn: true }, function() {
      fb.getUserInfo().then(value => {
        this.setState({ user: value });
      });
    });
  };

  showLoginBox() {
    this.setState({ isLoginOpen: true, isRegisterOpen: false });
  }

  showRegisterBox() {
    this.setState({ isRegisterOpen: true, isLoginOpen: false });
  }

  handleLogOut = () => {
    if (fb.logout()) {
      this.setState({ isLoggedIn: false });
      return;
    }
    console.log("failed to logout");
  };

  loginTryingTrue = () => {
    this.setState({ isTrying: true });
  };

  loginTryingFalse = () => {
    this.setState({ isTrying: false });
  };

  returnMiddle = middleText => {
    let middle;
    if (middleText == "home") {
      middle = "Home";
    } else if (middleText == "notification") {
      middle = "Notification";
    } else {
      middle = "Message";
    }
    return middle;
  };

  handleOrderingDrowdown = (event, { value }) => {
    this.setState({
      orderingMode: value,
      comments: this.shuffle(this.state.comments)
    });
  };

  shuffle = array => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  orderingBasedOnSelectedMode = () => {
    let resultList = [];
    resultList = this.state.comments;
    if (this.state.orderingMode == "Popular") {
      resultList = this.state.comments.sort(function(a, b) {
        return b.upvotes - a.upvotes;
      });
      return resultList;
    }
    
    return resultList;
   
  };

  scrollTo = name => {
    var elOffset = this._scroller.offsetTop;
    var elHeight = this._scroller.clientHeight;
    var windowHeight = window.height;
    var offset;
    if (elHeight < windowHeight) {
      offset = elOffset - (windowHeight / 2 - elHeight / 2);
    } else {
      offset = elOffset;
    }
    // console.log("window:", windowHeight, offset, elHeight, elOffset);
    this._scroller.scrollTo(name, 100);
  };

  handleRemovePost = async id => {
    this.hideTask();
    await fb.removeThisPost(id).then(() => {
      this.updatePostsList();
      this.getAllThreadsOfThisUser();
    });
  };

  render() {
    const postList = (
      <div>
        <div className="post_header">
          <div className="post_header_dropdown">
            <Dropdown
              fluid
              selection
              defaultValue={this.state.orderingMode}
              onChange={this.handleOrderingDrowdown}
              options={this.state.orderingOptions}
            />
          </div>
        </div>
        <ScrollView ref={scroller => (this._scroller = scroller)}>
          <div>
            {this.orderingBasedOnSelectedMode(this.state.comments).map(post => {
              return (
                <ScrollElement key={post.id} name={post.id}>
                  <div
                    className={classNames({
                      post_selected: post.id == this.state.selectedCom.id
                    })}
                  >
                    <Segment vertical>
                      <PostwithUpvotes
                        startThreading={this.startThreading}
                        data={post}
                        handleRemovePost={this.handleRemovePost}
                        isThisUserAuthor={post.user == this.state.user.name}
                        getFormattedDate={this.getFormattedDate}
                        handleInc={id => this.incCount(id)}
                        handleDec={id => this.decCount(id)}
                      />
                    </Segment>
                  </div>
                </ScrollElement>
              );
            })}
          </div>
        </ScrollView>
      </div>
    );

    const mainComponent = (
      <div
        className="mainComponent_wrapper"
        style={
          this.state.isCommentsLoaded ? null : { width: "100%", height: "100%" }
        }
      >
        <div className="main_container">
          <div className="post_container">
            {this.state.isCommentsLoaded ? (
              <div className="post_list">{postList}</div>
            ) : (
              <div className="post_list">
                <DataLoading />
              </div>
            )}
          </div>
          {
            <div className="sticky_thread">
              <Thread
                nextTask={this.nextTask}
                credibilityTasks={credibilityTasks}
                currentTaskId={this.state.currentTaskId}
                isTaskOver={
                  credibilityTasks.length === this.state.currentTaskId +1
                }
                updatePostsList={this.updatePostsList}
                resetHistoryOfThisUser={this.resetHistoryOfThisUser}
                userThread={this.state.userThread}
                isThreadLoaded={this.state.isThreadLoaded}
                getAllThreadsOfThisUser={this.getAllThreadsOfThisUser}
                getFormattedDate={this.getFormattedDate}
                setOffThreading={this.setOffThreading}
                scrollTo={this.scrollTo}
                user={this.state.user}
                showTask={this.state.showTask}
                handleSubmit={this.submitTask}
                handleClose={this.hideTask}
                handleContinue={this.handleContinue}
                post={this.state.selectedCom}
                currentPostId = {this.state.selectedCom.postId}
                // existingAnswers={()=>{this.getAllAnswersofTask(this.state.currentTaskId, this.state.selectedCom.postId)}}
                getExistingAnswers={this.getAllAnswersofTask.bind(this)}   
              />
            </div>
          }
        </div>
      </div>
    );

    const loginPage = (
      <div className="root-container">
        <div>
          <div className="box-controller">
            <div />
            <div
              className={
                "controller " +
                (this.state.isLoginOpen ? "selected-controller" : "")
              }
              onClick={this.showLoginBox.bind(this)}
            >
              Login
            </div>
            <div
              className={
                "controller " +
                (this.state.isRegisterOpen ? "selected-controller" : "")
              }
              onClick={this.showRegisterBox.bind(this)}
            >
              Register
            </div>
          </div>
          <div className="box-container">
            {this.state.isLoginOpen && (
              <LoginBox
                handleLogin={this.handleLogin}
                loginTryingTrue={this.loginTryingTrue}
                loginTryingFalse={this.loginTryingFalse}
              />
            )}
            {this.state.isRegisterOpen && (
              <RegisterBox
                handleLogin={this.handleLogin}
                loginTryingTrue={this.loginTryingTrue}
                loginTryingFalse={this.loginTryingFalse}
              />
            )}
          </div>
        </div>
      </div>
    );

    const mainPage = this.state.isLoggedIn ? mainComponent : loginPage;

    return (
      <div className="App-container">
        {this.state.isTrying || !this.state.isLoggedIn ? (
          <HeaderComp middle={"Welcome to Kemi"} />
        ) : (
          <HeaderComp
            middle={this.returnMiddle(this.state.tab)}
            left={
              this.state.isAdmin ? (
                <HeaderNav
                  tab={this.state.tab}
                  onSelect={this.handleSelectTab}
                />
              ) : null
            }
            right={
              <div className="logout" onClick={this.handleLogOut}>
                {"Log out"}
              </div>
            }
          />
        )}
        <div className="App">
          {/*<Counter />*/}
          {this.state.isTrying ? <Loading /> : mainPage}
        </div>
      </div>
    );
  }
}

export default AppPost;
