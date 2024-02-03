import { useState } from 'react';
import LoadingButton from '../components/LoadingButton';
import adminService from '../services/admin';
import { createErrorMessage } from '../util/error';
import Alert from '../components/Alert';

const UserLookup = ({ setUser, alert, setAlert, clearAlert, clearAlerts }) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    setLoading(true);

    try {
      const foundUser = await adminService.getUser(value);
      setUser(foundUser);
      clearAlerts();

    } catch (error) {
      setUser();
      setAlert({
        type: 'error',
        prefix: 'Lookup failed',
        details: createErrorMessage(error),
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <h3>User lookup</h3>

      <Alert alert={alert} clearAlert={clearAlert} />

      <div className='user-lookup'>
        <label>
          <span>Username: *</span>
          <input 
            type='text'
            value={value}
            onChange={({ target }) => setValue(target.value)}
            required
          />
        </label>

        <LoadingButton
          text='Lookup'
          disabled={loading || !value}
          loading={loading}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

const UserDisabledActions = ({ user, setUser, alert, setAlert, clearAlert, clearAlerts }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const updatedUser = await adminService.putUser(
        user.username, { disabled: !user.disabled }
      );

      setUser(updatedUser);
      clearAlerts();
      setAlert({
        type: 'success',
        prefix: 'User updated',
      });

    } catch (error) {
      setAlert({
        type: 'error',
        prefix: 'Update failed',
        details: createErrorMessage(error),
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <h3>Actions</h3>
      <Alert alert={alert} clearAlert={clearAlert} />

      <p>
        User &quot<span className='italic'>{user.username}</span>&quot {`is ${user.disabled ? 'disabled' : 'active'}`}
      </p>

      <LoadingButton
        text={user.disabled ? 'Activate' : 'Disable'}
        disabled={loading || !user}
        loading={loading}
        onClick={handleSubmit}
      />
    </div>
  );
};

const Admin = () => {
  const [user, setUser] = useState();
  
  // alerts
  const [lookupAlert, setLookupAlert] = useState({});
  const [updateAlert, setUpdateAlert] = useState({});

  const clearLookupAlert = () => setLookupAlert({});
  const clearUpdateAlert = () => setUpdateAlert({});

  const clearAlerts = () => {
    clearLookupAlert({});
    clearUpdateAlert({});
  };

  return (
    <div className='admin-page container'>
      <h2>Admin</h2>

      <UserLookup 
        setUser={setUser} 
        alert={lookupAlert}
        setAlert={setLookupAlert}
        clearAlert={clearLookupAlert}
        clearAlerts={clearAlerts}
      />

      { user && (
        <UserDisabledActions 
          user={user} 
          setUser={setUser}
          alert={updateAlert}
          setAlert={setUpdateAlert}
          clearAlert={clearUpdateAlert}
          clearAlerts={clearAlerts}
        /> 
      )}
    </div>
  );
};

export default Admin;