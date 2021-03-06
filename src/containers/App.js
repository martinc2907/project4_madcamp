import React from 'react';
import { Header} from 'components';
import { Mypage } from 'containers';
import { connect } from 'react-redux';
import { getStatusRequest, logoutRequest } from 'actions/authentication';
import { browserHistory } from 'react-router';

class App extends React.Component {

    constructor(props){
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        this.props.logoutRequest().then(
            () => {
                Materialize.toast('Good Bye!', 2000);

                let loginData = {
                    isLoggedIn: false,
                    username: ''
                };
                browserHistory.push('/');
                document.cookie = 'key='+ btoa(JSON.stringify(loginData));
            }
        );
    }

    componentDidMount() {
      // get cookie by name
      function getCookie(name) {
          var value = "; " + document.cookie;
          var parts = value.split("; " + name + "=");
          if (parts.length == 2) return parts.pop().split(";").shift();
      }

      // get loginData from cookie
      let loginData = getCookie('key');

      // if loginData is undefined, do nothing
      if(typeof loginData === "undefined") return;

      // decode base64 & parse json
      loginData = JSON.parse(atob(loginData));

      // if not logged in, do nothing
      if(!loginData.isLoggedIn) return;

      // page refreshed & has a session in cookie,
      // check whether this cookie is valid or not
      this.props.getStatusRequest().then(
          () => {
              console.log(this.props.status);
              // if session is not valid
              if(!this.props.status.valid) {
                  // logout the session
                  loginData = {
                      isLoggedIn: false,
                      username: ''
                  };

                  document.cookie='key=' + btoa(JSON.stringify(loginData));

                  // and notify
                  let $toastContent = $('<span style="color: #FFB4BA">Your session is expired, please log in again</span>');
                  Materialize.toast($toastContent, 4000);

              }
            }
        );
    }


    render() {
        let re = /(register)/; //나중에 다른거 필요하면 채우면 register지우기!
        let isAuth = re.test(this.props.location.pathname);

        let isNotNullpage = (this.props.location.pathname === "/")? <Mypage backerror={true}/>: undefined; //login후, 억지로 /home링크로 돌아올경우

        return(
          <div>
              {isAuth? undefined: <Header username={this.props.currentUser}
                                          isLoggedIn={this.props.status.isLoggedIn}
                                          onLogout={this.handleLogout}/>}

              { this.props.isLoggedIn ? isNotNullpage : <h10><p>ROOM DRIVER</p></h10>}
              {this.props.children}
          </div>
        );
    }
}

const mapStateToProps = (state) => {
    return{
        status: state.authentication.status,
        isLoggedIn: state.authentication.status.isLoggedIn,
        currentUser: state.authentication.status.currentUser
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        logoutRequest: () => {
            return dispatch(logoutRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
