import axios from 'axios';
const url = import.meta.env.PROD 
  ? "/api" 
  : "http://localhost:8000/api";
// const url="https://glorious-acorn-gpj7pj4gp5v3v4pw-8000.app.github.dev/" //repo
const api=axios.create({
    baseURL: url
})
export default api;