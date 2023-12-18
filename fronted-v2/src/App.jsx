import { 
  createBrowserRouter,
  Route, 
  createRoutesFromElements,
  RouterProvider, 
} from 'react-router-dom';

// LAYOUTS
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';

// PAGES
import Home from './pages/Home';
import About from './pages/Abouts';
// auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// user
import SearchPage, { usersLoader } from './pages/user/SearchPage';
import User, { userLoader } from './pages/user/User';
import UserFinderErrorBoundary from './pages/user/UserFinderErrorBoundary';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path='about' element={<About />} />

      <Route path='auth' element={<AuthLayout />}>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
      </Route>
      <Route path='users'>
        <Route index element={<SearchPage />} loader={usersLoader} />
        <Route path=':username' 
          element={<User />}
          loader={userLoader}
          errorElement={<UserFinderErrorBoundary />}
        />
      </Route>
    </Route>
  )
);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;