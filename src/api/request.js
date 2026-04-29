import axios from 'axios'

const request = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

function getErrorMessage(error) {
  const data = error.response?.data
  return data?.result_msg || data?.message || error.message || '请求失败'
}

request.interceptors.response.use(
  (response) => response,
  (error) => {
    error.normalizedMessage = getErrorMessage(error)
    return Promise.reject(error)
  }
)

export default request
