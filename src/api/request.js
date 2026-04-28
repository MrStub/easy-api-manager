import axios from 'axios'

const request = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default request
