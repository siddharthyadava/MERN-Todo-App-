import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import About from './pages/About';
import TodoList from './pages/Todos/TodoList';
import HomePage from './pages/Home/HomePage';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='homePage' element={<HomePage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/about' element={<About />} />
        <Route path='/todoList' element={<TodoList />} />
      </Routes>
    </div>
  );
}

export default App;
