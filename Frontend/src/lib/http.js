import axios from 'axios';

const api = () => axios.create({
    baseURL: '/api/',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Conent-Type': 'application/json'
    },
});

const http = () => axios.create();

export {api, http};