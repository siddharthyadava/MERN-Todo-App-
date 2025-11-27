import axios from 'axios'

//get user token
const user = JSON.parse(localStorage.getItem('todoapp'))
//default of header
axios.defaults.headers.common['Authorization'] = `bearer ${user.token}`

//CREATE TODO
const createTodo = (data) => {
    return axios.post('/todo/create',data)
}

//GET ALL TODO
const getAllTodo = (id) => {
    return axios.post(`/todo/getAll/${id}`)
}

//UPDATE TODO
const updateTodo = (id, data) => {
    return axios.patch('/todo/update/' + id, data);
}

const TodoServices = {createTodo, getAllTodo, updateTodo}
export default TodoServices