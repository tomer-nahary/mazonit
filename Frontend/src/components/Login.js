import React, { useState } from 'react'
import { Redirect } from 'react-router-dom';
import {api}  from '../lib/http'
import '../styles/Login.css'
import logo from '../assets/logo.png'
export default function Login(props) {

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);

    const login =  () => {
        api().post('login',{
            "id": id,
            "password": password
        })
        .then(res => {
            localStorage.setItem('token', res.data);
            props.validate();
        })
        .catch(err =>{
            setShowError(true);
            setPassword('');
        });
    }
    const enterClick = (e) => {
        if(e.key === 'Enter'){
            e.target.blur();
            login();
        }
        
    }

    if(!props.user) return(<></>)
    if(props.user.isAuth) return(<Redirect to="/" />)
    return (
        <div className="login-con" onKeyPress={enterClick}>
            <img id="logo" src={logo} alt="logo" />
            <h1>כניסה למערכת</h1>
            <div className="login-field">
                <label>שם משתמש:</label>
                <input type="text" id="username"  value={id} onChange={e => setId(e.target.value)}/>
            </div>
            <div className="login-field">
                <label>סיסמא:</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
            {showError &&
            <div className="incorrect">שם משתמש או סיסמא שגויים<div onClick={() => setShowError(false)}>x</div></div>
            }
            <input type="button" id="btn" onClick={login} value="כניסה"/>
        </div>
    )
}
