import React, { useEffect, useState } from 'react'
import { Link, Redirect, useHistory, useParams } from 'react-router-dom';
import { api } from '../lib/http';
import '../styles/Customer.css';

export default function Customer(props) {
    const [customer, setCustomer] = useState();
    const [meetings, setMeetings] = useState();
    const [notFound, setNotFound] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    const startMessage = () => setShowMessage(true);
    useEffect(() => {
        let time = setTimeout(() => {
            setShowMessage(false);
        }, 5000);
        return () => {
            clearTimeout(time);
        }
    }, [showMessage])

    const load = () =>{
        if(isNew) return;
        console.log('loaded');
        api().get(`customer/${id}`)
        .then(res =>{
            setCustomer(res.data);
            console.log(res.data);
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) return props.logout();
            if(status === 400) {
                setNotFound(true);
                console.log('not found');
            }
            console.log(err);
        });
        api().get(`meetings/${id}`)
        .then(res =>{
            console.log(res.data);
            setMeetings(res.data);
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        });
    }

    const {id} = useParams();
    let isNew = id === 'new';
    useEffect(load, [id]);

    let Component;
    if(props.index === 'info') Component = Info;
    else Component = Meetings;

    if(!props.user) return(<></>);
    if(!props.user.isAuth || props.user.isAdmin) return(<Redirect to="/" />);
    if((isNaN(id) && !isNew) || notFound) return (<Redirect to="/customers" />);
    return(
         <div>
             <Message show={showMessage} stop={() => setShowMessage(false)} />
             {customer && meetings &&
             <Component customer={customer} meetings={meetings} load={load} logout={props.logout} startMessage={startMessage}/>
             }
             {!customer && isNew && 
             <NewCustomer customer={customer} user={props.user} logout={props.logout} startMessage={startMessage}/>
             }
         </div>
    );
}
function NewCustomer(props){
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(false)

    const history = useHistory();

    const createCustomer = () =>{
        if(name === '') return setError(true);
        api().post('customer',{name, city, address, phone, email, description})
        .then(res =>{
            props.startMessage();
            console.log(res.data)
            history.push(`/customer/${res.data.id}/info`);
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        });
    }
    return(
        <div className="customer-con">
            <ErrorMessage show={error} cancel={() => setError(false)} text="יש למלא את שם העסק"/>
            <div className="customer-top">
                <div className="title">פרטים</div>
                <Link to="info" className="margin-right-auto"><div className="customer-link circle-link info-link active"></div></Link>
                <Link to="meetings"><div className="customer-link circle-link meetings-link"></div></Link>
                <Link to="/customers" className="back-a"><div className="customer-link back-link"></div></Link>
            </div>
            <div className="info">
                <div className="field">
                    <div className="head">שם העסק</div>
                    <input type="text" className="input" value={name} maxLength="45" onChange={(e) => setName(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">עיר</div>
                    <input type="text" className="input" value={city} maxLength="45" onChange={(e) => setCity(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">כתובת</div>
                    <input type="text" className="input" value={address} maxLength="100" onChange={(e) => setAddress(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">טלפון</div>
                    <input type="text" className="input" value={phone} maxLength="12" onChange={(e) => setPhone(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">מייל</div>
                    <input type="text" className="input" value={email} maxLength="45" onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">עיסוק</div>
                    <textarea className="input" value={description} maxLength="300" onChange={e => setDescription(e.target.value)}></textarea>
                </div>
            </div>
            <div className="contorls">
            <input type="button" className="action" value="יצירה" onClick={createCustomer} />
            </div>
        </div>
    );
}
function Info(props){
    const history = useHistory();
    const [name, setName] = useState(props.customer.name);
    const [city, setCity] = useState(props.customer.city);
    const [address, setAddress] = useState(props.customer.address);
    const [phone, setPhone] = useState(props.customer.phone);
    const [email, setEmail] = useState(props.customer.email);
    const [description, setDescription] = useState(props.customer.description);
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState(false);

    const updateCustomer = () =>{
        if(name === '') return setError(true);
        api().put(`customer/${props.customer.id}`,{name, city, address, phone, email, description})
        .then(res =>{
            props.load();
            props.startMessage();
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status && (status === 401 || status === 403)) props.logout();
            console.log(err);
        });
    }
    const deleteCustomer = () =>{
        api().delete(`customer/${props.customer.id}`)
        .then(res =>{
            console.log('deleted');
            history.push('/customers');
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        });
    }
    return(
        <div className="customer-con">
            <Confirm show={confirm} cancel={() => setConfirm(false)} delete={deleteCustomer} text={'הלקוח ' + name}/>
            <ErrorMessage show={error} cancel={() => setError(false)} text="יש למלא את שם העסק"/>
            <div className="customer-top">
                <div className="title">פרטים</div>
                <Link to="info" className="margin-right-auto"><div className="customer-link circle-link info-link active"></div></Link>
                <Link to="meetings"><div className="customer-link circle-link meetings-link"></div></Link>
                <Link to="/customers" className="back-a"><div className="customer-link back-link"></div></Link>
            </div>
            <div className="info">
            <div className="field">
                    <div className="head">שם העסק</div>
                    <input type="text" className="input" value={name} maxLength="45" onChange={(e) => setName(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">עיר</div>
                    <input type="text" className="input" value={city} maxLength="45" onChange={(e) => setCity(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">כתובת</div>
                    <input type="text" className="input" value={address} maxLength="100" onChange={(e) => setAddress(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">טלפון</div>
                    <input type="text" className="input" value={phone} maxLength="12" onChange={(e) => setPhone(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">מייל</div>
                    <input type="text" className="input" value={email} maxLength="45" onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="field">
                    <div className="head">עיסוק</div>
                    <textarea className="input" value={description} maxLength="300" onChange={e => setDescription(e.target.value)}></textarea>
                </div>
            </div>
            <div className="contorls">
            <input type="button" className="action" value="עדכן" onClick={updateCustomer} />
            <input type="button" className="action-delete" value="מחק לקוח" onClick={() => setConfirm(true)} />
            </div>
        </div>
    );
}

function Meetings(props){
    const [addMeeting, setAddMeeting] = useState(false);

    return(
        <div className="customer-con">
            <div className="customer-top">
                <div className="title">פגישות</div>
                <Link to="info" className="margin-right-auto"><div className="customer-link circle-link info-link"></div></Link>
                <Link to="meetings"><div className="customer-link circle-link meetings-link active"></div></Link>
                <Link to="/customers" className="back-a"><div className="customer-link back-link"></div></Link>
            </div>
            <div>
            {!addMeeting &&
                
                <div className="action add-btn" onClick={() => setAddMeeting(true)}>הוספת פגישה</div>
            }
            {addMeeting &&
                <NewMeeting customerId={props.customer.id} load={props.load} logout={props.logout} setAddMeeting={setAddMeeting} startMessage={props.startMessage}/>
            }
            {props.meetings.map(meeting =>(
                <Meeting key={meeting.id} meeting={meeting} load={props.load} logout={props.logout} startMessage={props.startMessage}/>
            ))}
            </div>
        </div>
    );
}

function NewMeeting(props){
    const [date, setDate] = useState('');
    const [content, setContent] = useState('');
    const [woodTypes, setWoodTypes] = useState('');
    const [treatment, setTreatment] = useState('');
    const [completedProjects, setCompletedProjects] = useState('');
    const [futureProjects, setFutureProjects] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    //const [remark, setRemark] = useState('');
    const [error, setError] = useState(false);

    const formatDate = () => {
        let date = new Date();
        setDate(`${date.getFullYear()}-${date.getMonth() + 1}-${("0" + date.getDate()).slice(-2)}`);
    };
    const createMeeting = () =>{
        if(content === '') return setError(true);
        api().post(`meeting/${props.customerId}`,{date, content, woodTypes, treatment, completedProjects, futureProjects, manufacturer})
        .then(res =>{
            props.load();
            props.setAddMeeting(false);
            props.startMessage();
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        });
    }

    useEffect(formatDate, []);

    return(
        <div className="info separate" >
            <ErrorMessage show={error} cancel={() => setError(false)} text="יש למלא את תוכן הפגישה"/>
            <div className="field">
                <div className="head">תאריך</div>
                <input type="date" className="input" value={date}  onChange={e => setDate(e.target.value)} />
            </div>
            <div className="field">
                <div className="head">תוכן</div>
                <textarea value={content} maxLength="300" className="input" onChange={e => setContent(e.target.value)}></textarea>
            </div>
            <div className="field">
                <div className="head">דוגמאות חומרי גלם</div>
                <input type="text" className="input" value={woodTypes} maxLength="50" onChange={(e) => setWoodTypes(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">הערות/יש לבצע</div>
                <input type="text" className="input" value={treatment} maxLength="50" onChange={(e) => setTreatment(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">פרויקטים שבוצעו</div>
                <input type="text" className="input" value={completedProjects} maxLength="50" onChange={(e) => setCompletedProjects(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">פרויקטים עתידיים</div>
                <input type="text" className="input" value={futureProjects} maxLength="50" onChange={(e) => setFutureProjects(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">מקושר ליצרן</div>
                <input type="text" className="input" value={manufacturer} maxLength="50" onChange={(e) => setManufacturer(e.target.value)}/>
            </div>
            {/* <div className="field">
                <div className="head">הערות מנהל</div>
                <textarea className="input" value={remark} onChange={e => setRemark(e.target.value)}></textarea>
            </div> */}
            <div className="contorls">
                <input type="button" className="action" value="יצירה" onClick={createMeeting} />
                <input type="button" className="action-delete" value="ביטול" onClick={() => props.setAddMeeting(false)} />
            </div>
        </div>
    );
}

function Meeting(props){
    const [date, setDate] = useState(props.meeting.date);
    const [content, setContent] = useState(props.meeting.content);
    const [woodTypes, setWoodTypes] = useState(props.meeting.woodTypes);
    const [treatment, setTreatment] = useState(props.meeting.treatment);
    const [completedProjects, setCompletedProjects] = useState(props.meeting.completedProjects);
    const [futureProjects, setFutureProjects] = useState(props.meeting.futureProjects);
    const [manufacturer, setManufacturer] = useState(props.meeting.manufacturer);
    const [confirm, setConfirm] = useState(false)
    const [error, setError] = useState(false);
    const remark = props.meeting.remark;
    

    const updateMeeting = () =>{
        if(content === '') return setError(true);
        api().put(`meeting/${props.meeting.id}`,{date, content, woodTypes, treatment, completedProjects, futureProjects, manufacturer})
        .then(res =>{
            props.load();
            props.startMessage();
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        });
    }
    const deleteMeeting = () =>{
        api().delete(`meeting/${props.meeting.id}`)
        .then(res =>{
            props.load();
        })
        .catch((err) =>{
            let status = err.response.status || -1;
            if(status === 401 || status === 403) props.logout();
            console.log(err);
        });
    }


    return(
        <div className="info separate" >
            <Confirm show={confirm} cancel={() => setConfirm(false)} delete={deleteMeeting} text="את הפגישה"/>
            <ErrorMessage show={error} cancel={() => setError(false)} text="יש למלא את תוכן הפגישה"/>
            <div className="field">
                <div className="head">תאריך</div>
                <input type="date" className="input" value={date}  onChange={e => setDate(e.target.value)} />
            </div>
            <div className="field">
                <div className="head">תוכן</div>
                <textarea value={content} maxLength="300" className="input" onChange={e => setContent(e.target.value)}></textarea>
            </div>
            <div className="field">
                <div className="head">דוגמאות חומרי גלם</div>
                <input type="text" className="input" value={woodTypes} maxLength="50" onChange={(e) => setWoodTypes(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">הערות/יש לבצע</div>
                <input type="text" className="input" value={treatment} maxLength="50" onChange={(e) => setTreatment(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">פרויקטים שבוצעו</div>
                <input type="text" className="input" value={completedProjects} maxLength="50" onChange={(e) => setCompletedProjects(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">פרויקטים עתידיים</div>
                <input type="text" className="input" value={futureProjects} maxLength="50" onChange={(e) => setFutureProjects(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">מקושר ליצרן</div>
                <input type="text" className="input" value={manufacturer} maxLength="50" onChange={(e) => setManufacturer(e.target.value)}/>
            </div>
            <div className="field">
                <div className="head">הערות מנהל</div>
                {/* <textarea className="input" value={remark} onChange={e => setRemark(e.target.value)}></textarea> */}
                <div className="input notes">{remark}</div>
            </div>
            <div className="contorls">
                <input type="button" className="action" value="עדכן" onClick={updateMeeting} />
                <input type="button" className="action-delete" value="מחק פגישה" onClick={() => setConfirm(true)} />
            </div>
        </div>
    );
}

function Confirm(props){
    let cancelFunction = () =>{
        document.body.style.overflow = '';
        props.cancel();
    }
    let deleteFunction = () =>{
        props.delete();
        cancelFunction();
    }
    if(!props.show) return <></>;
    document.body.style.overflow = 'hidden';
    return(
        <div className="confirm-overlay">
            <div className="confirm-container">
                <div className="confirm-message">האם ברצונך למחוק את {props.text}?</div>
                <div>
                    <input type="button" className="action" value="ביטול" onClick={cancelFunction}/>
                    <input type="button" className="action-delete" value="מחק" onClick={deleteFunction}/>
                </div>
            </div>
        </div>
    )
}

function ErrorMessage(props){
    let cancelFunction = () =>{
        document.body.style.overflow = '';
        props.cancel();
    }
    if(!props.show) return <></>;
    document.body.style.overflow = 'hidden';
    return(
        <div className="confirm-overlay">
            <div className="confirm-container">
                <div className="confirm-message">{props.text}!</div>
                <div>
                    <input type="button" className="action" value="סגור" onClick={cancelFunction}/>
                </div>
            </div>
        </div>
    )
}

function Message(props){
    if(!props.show) return <></>;
    return(
        <div className="message">
            <div className="message-text">הנתונים עודכנו!</div>
            <input type="button" value="X" onClick={props.stop}/>
        </div>
    )
}
