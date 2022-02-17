const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "admin",
    password: "Sisma123",
    database: 'mazonit'
});
con.connect((err) => {
    if(err) console.log('Error', err);
    else{
        console.log('\nConnected to the database');
        console.log(getTimeString());
        console.log('----------------------------------------------\n');
    } 
})

function getTimeString(){
    let now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + ("0" + now.getMinutes()).slice(-2);
}

let secretToken = '8785355ca67db74393c0438749e5d0d5a04afb6ec4ab6c77074b280ecbb757d6fccd82feaa8db0ada40a6c5b18c6bd050a97e2a8128c15d359ce6620b893b9a6';
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, secretToken, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
};

app.post('/api/login',(req, res) =>{
    let id = req.body.id, password = req.body.password;
    if(!id || ! password) return res.sendStatus(400).json({err: "password or id were not given"});
    console.log('\nLogin\n' + getTimeString() + ' \nid:"' + id +'"\npassword:"' + password + '"');
    con.query('call prod_login(?, ?);',[id, password], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        };
        if(!Array.isArray(dbres)) return res.sendStatus(401);
        let data = dbres[0][0];
        let user = {id: data.id, name: data.name, isAdmin: data.is_admin == 'true'}
        let token = jwt.sign(user, secretToken, {expiresIn: '8h'});
        console.log('success'); //log
        res.json(token);;

    });
});
app.post('/api/getinfo', authenticateToken, (req, res) =>{
    res.json({name: req.user.name, isAdmin: req.user.isAdmin});
});

app.get('/api/customers', authenticateToken, (req, res) =>{
    let filter = req.query['filter'] || '';
    con.query('call prod_get_customers(?, ?);',[req.user.id, filter], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.json(dbres[0]);
    })
})

app.get('/api/customer/:id', authenticateToken, (req, res) =>{
    let customerId = req.params['id'];
    if(isNaN(customerId)) return res.sendStatus(400);

    con.query('call prod_get_customer_info(?);',[customerId], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        let data = dbres[0][0];
        if(data == undefined) res.sendStatus(400).json({err: 'no such customer'});
        res.json(data);
    })
})
app.post('/api/customer/', authenticateToken, (req, res) =>{
    let d = req.body;
    let params = [d.name, req.user.id, d.city, d.address, d.phone, d.email, d.description]
    con.query('call prod_create_customer(?, ?, ?, ?, ?, ?, ?);', params, (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        let data = dbres[0][0];
        res.json(data);
    })
})
app.put('/api/customer/:id', authenticateToken, (req, res) =>{
    let d = req.body;
    if(isNaN(req.params['id'])) return res.sendStatus(400);
    let params = [req.params['id'], d.name, d.city, d.address, d.phone, d.email, d.description]
    con.query('call prod_update_customer(?, ?, ?, ?, ?, ?, ?);',params, (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})
app.delete('/api/customer/:id', authenticateToken, (req, res) =>{
    let customerId = req.params['id'];
    if(isNaN(customerId)) return res.sendStatus(400);

    con.query('call prod_delete_customer(?);',[customerId], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})


app.get('/api/meetings/:id', authenticateToken, (req, res) =>{
    let customerId = req.params['id'];
    if(isNaN(customerId)) return res.sendStatus(400);
    let userId = req.user.id;

    con.query('call prod_get_customer_meetings(?, ?);',[customerId, userId], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.json(dbres[0]);
    })
})

app.post('/api/meeting/:id', authenticateToken, (req, res) =>{
    let customerId = req.params['id'];
    let userId = req.user.id;
    let d = req.body;
    let params = [userId, customerId, d.date, d.content, d.woodTypes, d.treatment, d.completedProjects, d.futureProjects, d.manufacturer, d.remark]
    con.query('call prod_create_meeting(?, ?, ?, ?, ?, ?, ?, ?, ?);', params, (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})
app.put('/api/meeting/:id', authenticateToken, (req, res) =>{
    let meetingId = req.params['id'];
    if(isNaN(meetingId)) return res.sendStatus(400);
    let userId = req.user.id;
    let d = req.body;
    let params = [meetingId, userId, d.date, d.content, d.woodTypes, d.treatment, d.completedProjects, d.futureProjects, d.manufacturer]
    con.query('call prod_update_meeting(?, ?, ?, ?, ?, ?, ?, ?, ?);',params, (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})
app.delete('/api/meeting/:id', authenticateToken, (req, res) =>{
    let meetingId = req.params['id'];
    if(isNaN(meetingId)) return res.sendStatus(400);

    con.query('call prod_delete_meeting(?);',[meetingId], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})

app.get('/api/meetings', authenticateToken, (req, res) =>{
    if(!req.user.isAdmin) return res.sendStatus(401);
    let q = req.query;
    con.query('call prod_get_meetings(?, ?, ?, ?, ?);',[q.customer, q.worker, (q.fromDate || null), (q.toDate || null), (q.filter || '')], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.json(dbres[0]);
    })
})
app.put('/api/meeting/:id/remark', authenticateToken, (req, res) =>{
    if(!req.user.isAdmin) return res.sendStatus(401);
    let meetingId = req.params['id'];
    if(isNaN(meetingId)) return res.sendStatus(400);
    con.query('call prod_update_meeting_remark(?, ?);',[meetingId, req.body.remark], (err, dbres) =>{
        if(err){
            console.log('\n' + getTimeString());
            console.log('Error', err);
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    })
})
app.listen(4000, () =>{
    console.log('Mazonit app is running!');
});