import React, { useEffect, useState } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { api } from '../lib/http'
import '../styles/Customers.css';
import Logo from '../assets/logo.png'

export default function Customers(props) {
    const [customers, setcustomers] = useState();
    const [filter, setfilter] = useState('')

    const getCustomers = () =>{
        api().get('customers',{params: {filter}})
        .then(res =>{
            if(!res.data) return;
            setcustomers(res.data);
            console.log(res.data);
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        })
    }
    const searchPress = (e) =>{
        if(e.key === 'Enter') getCustomers();
    }
    const cancelSearch = () =>{
        setfilter('');
    }

    const reload = () =>{
        if(filter === ''){
            getCustomers();
        }
    }
    useEffect(reload,[filter])

    //useEffect(getCustomers, []);
    if(!props.user) return(<></>);
    if(!props.user.isAuth || props.user.isAdmin) return(<Redirect to="/" />);
    if(!customers) return(<></>);
    return (
        <div className="customers-con">
            <div className="customers-menu">
                <div className="user-name">{props.user.name}</div>
                <input type="button" className="logout btn" onClick={props.logout}/>
                <img className="logo" src={Logo} alt="Logo"/>
                <div className="line-break"></div>
                <div className="customer-search">
                    <input type="text" className="search-text" value={filter} onChange={(e) => setfilter(e.target.value)} onKeyPress={searchPress} />
                    <div className="clear-search">
                        <input type="button" className={"clear-search-btn btn " + ((filter === '') ? 'hidden' : '')} onClick={cancelSearch} />
                    </div>
                    <input type="button" className="search-btn btn serch-btn-customers" onClick={getCustomers} />
                </div>
                <a href="/customer/new/info" style={{margin: "auto 0"}}><input className="customer-add btn" type="button"/></a>
            </div>
            <div className="customer-headers">
                <div className="customer-title">שם</div>
                <div className="customer-title">עיר</div>
                <div className="customer-title">טלפון</div>
            </div>
            <div className="customers">
                {customers.map(customer =>(
                    <Link to={`customer/${customer.id}/info`} key={customer.id} >
                        <div className="customer">
                            <div className="customer-name">{customer.name}</div>
                            <div className="customer-city">{customer.city}</div>
                            <div className="customer-phone">{customer.phone}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}


