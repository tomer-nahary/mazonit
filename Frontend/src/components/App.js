import React, { useEffect, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';
import { api } from '../lib/http';
import '../styles/App.css';
import Customer from './Customer';
import Customers from './Customers';
import Login from './Login'
import Meetings from './Meetings';

export default function App() {
  const [user, setUser] = useState(null);

  const validate = () =>{
    if(!localStorage.getItem('token')) {
      setUser({isAuth: false});
    }
    api().post('getinfo')
    .then(res => setUser({...res.data, isAuth: true}))
    .catch(err => {
      let status = err.response.status;
      if(status === 401 || status === 403) return setUser({isAuth: false});
      console.log(err);
    });
  }
  const logout = () =>{
    localStorage.removeItem('token');
    setUser({isAuth: false});
  }

  useEffect(() => {
    validate();
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <SendHome user={user} />
        </Route>
        <Route path="/login">
          <Login user={user} validate={validate} />
        </Route>
        <Route exact path="/customers">
          <Customers user={user} logout={logout} />
        </Route>
        <Route exact path="/customer/:id/info">
          <Customer user={user} index={'info'} logout={logout} />
        </Route>
        <Route exact path="/customer/:id/meetings">
          <Customer user={user} index={'meetings'} logout={logout}/>
        </Route>
        <Route path="/meetings">
          <Meetings user={user} logout={logout} />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

function SendHome(props){
  if(!props.user) return(<></>)
  if(!props.user.isAuth) return(<Redirect to="/login" />)
  if(!props.user.isAdmin) return(<Redirect to="/customers" />)
  if(props.user.isAdmin) return(<Redirect to="/meetings" />)
}
