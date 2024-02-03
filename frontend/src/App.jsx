import {
  Route, 
  createRoutesFromElements,
  RouterProvider,
  Navigate,
  useOutletContext,
  Outlet,
  createHashRouter, 
} from 'react-router-dom';

// LAYOUTS
import RootLayout from './layouts/RootLayout';
import SearchLayout from './layouts/SearchLayout';
import UserLayout, { userLoader } from './layouts/UserLayout';
import SettingsLayout from './layouts/SettingsLayout';

// PAGES
import Home from './pages/Home';
// auth
import Login from './pages/Login';
import Register from './pages/Register';
// search
import Results from './pages/search/Results';
// about
import About, { statisticsLoader } from './pages/About';

// USER PAGES
// images
import Images, { imagesLoader } from './pages/user/images/Images';
import Image, { imageContentLoader } from './pages/user/images/Image';
// relations
import Relations, { relationsLoader } from './pages/user/Relations';
// details
import Details from './pages/user/Details';
// settings
import SettingsPotrait from './pages/user/settings/SettingsPotrait';
import SettingsOther from './pages/user/settings/SettingsOther';

// errors
import {
  ImagesErrorElement, ImageErrorElement,
  RelationsErrorElement,
  UserErrorElement
} from './components/ErrorElement';
import NotFoundPage from './pages/NotFoundPage';
import Admin from './pages/Admin';


/*
TODO
- change reducer error messages
- is potrait reducer needed?
*/

const PrivateRoute = () => {
  const { user, authenticatedUser } = useOutletContext();

  if (!authenticatedUser || (authenticatedUser.id !== user.id)) {
    return <Navigate to='/' replace />;
  }

  return <Outlet context={{ user, authenticatedUser }} />;
};

const AdminRoute = () => {
  const { user, authenticatedUser } = useOutletContext();

  if (!authenticatedUser || !authenticatedUser.admin) {
    return <Navigate to='/' replace />;
  }

  return <Outlet context={{ user, authenticatedUser }} />;
};

const router = createHashRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />

      <Route path='search' element={<SearchLayout />}>
        <Route path='results' element={<Results />} />
      </Route>

      <Route path='/admin' element={<AdminRoute />}>
        <Route index element={<Admin />} />
      </Route>

      <Route path='users'>
        <Route path=':username'
          loader={userLoader}
          element={<UserLayout />}
          errorElement={<UserErrorElement />}
        >
          <Route path='images'
            element={<Images />}
            loader={imagesLoader}
            errorElement={<ImagesErrorElement />}
          />
          <Route path='images/:imageId'
            element={<Image />}
            loader={imageContentLoader}
            errorElement={<ImageErrorElement />}
          />

          <Route path='relations'
            element={<Relations />}
            loader={relationsLoader}
            errorElement={<RelationsErrorElement />}
          />

          <Route path='details' element={<Details />} />

          <Route element={<PrivateRoute />}>
            <Route path='settings' element={<SettingsLayout />}>
              <Route path='potrait' element={<SettingsPotrait />} />
              <Route path='other' element={<SettingsOther />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path='about'
        element={<About />}
        loader={statisticsLoader}
      />

      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  )
);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;