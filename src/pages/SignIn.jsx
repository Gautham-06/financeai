import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

export default function SignIn() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post('http://localhost:5000/signin', {
          email: values.email,
          password: values.password
        });

        if (response.data.success) {
          login({ 
            email: response.data.user.email,
            username: response.data.user.username,
            role: response.data.user.role
          });
          navigate('/dashboard');
        } else {
          setError(response.data.message || 'Invalid email or password');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    },
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="text-center mb-3">Sign In</h1>
        
        {error && (
          <div className="alert alert-error mb-3">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="form-error">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="form-error">{formik.errors.password}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Sign In
          </button>

          <div className="text-center">
            <Link to="/signup" className="link">
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 