import React, { useEffect, useState } from 'react'
import { /* Link, */ Redirect } from 'react-router-dom'
import '../styles/Meetings.css';
import Logo from '../assets/logo.png'
import { api } from '../lib/http';
// import Users from '../assets/users.png'

export default function Meetings(props) {

    const getDate = (dayDiff) =>{
        let date = new Date();
        date.setDate(date.getDate() + dayDiff);
        return date.toISOString().substring(0, 10);
    }

    const [meetings, setMeetings] = useState([]);
    const [fromDate, setFromDate] = useState(getDate(-30));
    const [toDate, setToDate] = useState(getDate(0));
    const [worker, setWorker] = useState('');
    const [customer, SetCustomer] = useState('')
    const [remarkId, setRemarkId] = useState();
    const [newRemark, setNewRemark] = useState('');
    const [filter, setFilter] = useState('');


    const activateRemark = (id, remark) =>{
        setRemarkId(id);
        setNewRemark(remark);
    }
    const disableRemark = (e) =>{
        setRemarkId(null);
    }
    const updateRemark = () =>{
        if(!remarkId) return;
        api().put(`/meeting/${remarkId}/remark`, {remark: newRemark})
        .then(res =>{
            getMeetings();
            disableRemark();
        })
        .catch(err => {
            let status = err.response.status;
            if(status && status && (status === 401 || status === 403)) return props.logout();
            console.log(err);
        });
    };
    const getMeetings = () =>{
        api().get('meetings', {params: {fromDate, toDate, worker, customer, filter}})
        .then(res =>{
            console.log(res.data);
            setMeetings(res.data);
        })
        .catch(err => {
            let status = err.response.status;
            if(status && status && (status === 401 || status === 403)) return props.logout();
            console.log(err);
        });
    };
    const handleClick = (e) =>{
        if(e.key === 'Enter')  getMeetings();
    }

    useEffect(getMeetings, []);

    if(!props.user) return(<></>)
    if(!props.user.isAuth || !props.user.isAdmin) return(<Redirect to="/" />)
    return (
        <div>
            <div className="meetings-top">
                <div className="filters-con" onKeyPress={handleClick}>
                    <div className="filter-con">
                        <div className="filters">
                            <label>מתאריך:</label>
                            <input type="date" className="filter" value={fromDate} onChange={e => {setFromDate(e.target.value); console.log(e.target.value)}}/>
                            <label>עד תאריך:</label>
                            <input type="date"className="filter" value={toDate} onChange={e => setToDate(e.target.value)}/>     
                        </div>
                    </div>
                    <div className="filter-con">
                        <div className="filters">
                            <label>עובד\ת:</label>
                            <input type="text" className="filter" value={worker} onChange={e => setWorker(e.target.value)}/>
                            <label>לקוח:</label>
                            <input type="text" className="filter" value={customer} onChange={e => SetCustomer(e.target.value)}/>
                        </div>
                    </div>
                    <div className="filter-con">
                        <div className="filters">
                            <label>חיפוש כללי:</label>
                            <input type="text" className="filter" value={filter} onDoubleClick={() => console.log(filter)} onChange={e => setFilter(e.target.value)}/>
                        </div>
                    </div>
                    <input type="button" className="search-btn"  onClick={getMeetings}/>
                </div>
                <div className="left-side">
                    <div>{props.user.name}</div>
                    <input type="button" className="logout " onClick={props.logout} />
                    {/* <Link to="/users"><img src={Users} className="users" alt="Users"/></Link> */}
                    <img src={Logo} style={{height: '50px'}} alt="Logo"/>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>תאריך</th>
                        <th>לקוח</th>
                        <th>עובד/ת</th>
                        <th>תוכן הפגישה</th>
                        <th>דוגמאות חומרי גלם</th>
                        <th>הערות/יש לבצע</th>
                        <th>פרויקטים שבוצעו</th>
                        <th>פרויקטים עתידיים</th>
                        <th>מקושר ליצרן</th>
                        <th>הערות מנהל</th>
                        
                    </tr>
                </thead>
                <tbody>     
                {meetings.map(meeting =>(
                    <tr key={meeting.id}>
                        <td>{meeting.date}</td>
                        <td>{meeting.customerName}</td>
                        <td>{meeting.userName}</td>
                        <td>{meeting.content}</td>
                        <td>{meeting.woodTypes}</td>
                        <td>{meeting.treatment}</td>
                        <td>{meeting.completedProjects}</td>
                        <td>{meeting.futureProjects}</td>
                        <td>{meeting.manufacturer}</td>
                        <td className="remark" onDoubleClick={ () => activateRemark(meeting.id, meeting.remark)}>{meeting.remark}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className={"pop-up " + ( remarkId != null ? "remark-active" : "") } onClick={disableRemark}>
                <div onClick={(e) => e.stopPropagation()}>
                    <textarea type="text" value={newRemark || ''} maxLength="200" onChange={e => setNewRemark(e.target.value)} ></textarea>
                    <input type="button" className="action" value="עדכן" onClick={updateRemark} />
                </div>
            </div>
        </div>
    )
}
