import axios from 'axios';
//url="http://localhost:8000" //local
const url="https://glorious-acorn-gpj7pj4gp5v3v4pw-8000.app.github.dev/" //repo
const api=axios.create({
    baseURL: url
})
export default api;