// Optimized Login Component
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input, Checkbox } from "../../components/common/Inputs";
import { Form } from "../../components/common/Form";
import { Button } from "../../components/common/Button";

// Updated imports for optimized auth slice
import { 
  loginAdmin, 
  forgotPassword,
  clearError, 
  clearMessage,
  clearNotifications,
  selectAdmin,
  selectIsAdminAuthenticated,
  selectAuthError,
  selectAuthMessage,
  selectAuthLoading,
} from "../../store/slices/authSlice";

// Validation Schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email or username is required")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .min(1, "Password cannot be empty"),
});

// Initial form values
const initialValues = {
  email: "",
  password: "",
};

export default function AdminLogin() {
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  
  // Redux state using new selectors
  const user = useSelector(selectAdmin);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  const isAuthenticated = useSelector(selectIsAdminAuthenticated);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form handling
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: useCallback((values) => {
      const loginData = {
        ...values,
        rememberMe
      };
      dispatch(loginAdmin(loginData));
    }, [dispatch, rememberMe]),
  });

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    const email = formik.values.email.trim();
    if (!email) {
      // You could set a form-level error instead of alert
      formik.setFieldError('email', 'Please enter your email address first');
      return;
    }
    
    setIsForgotMode(true);
    dispatch(forgotPassword({ email }));
  }, [formik, dispatch]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
  
      const role = user.role || 'user';
      navigate(`/${role}/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);

  // Handle error and message cleanup
  useEffect(() => {
    let errorTimer, messageTimer;

    if (error) {
      errorTimer = setTimeout(() => {
        dispatch(clearError());
      }, 5000); // Increased to 5 seconds for better UX
    }

    if (message) {
      messageTimer = setTimeout(() => {
        dispatch(clearMessage());
        setIsForgotMode(false); // Reset forgot mode after message
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
      if (messageTimer) clearTimeout(messageTimer);
    };
  }, [error, message, dispatch]);

  // Clear all notifications when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearNotifications());
    };
  }, [dispatch]);

  const backgroundImage = "/hero.jpg";

  return (
    <>
      <div
        className="relative flex items-center justify-end min-h-screen pb-8 bg-center bg-cover pt-28"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black opacity-10" />

        {/* Form Container */}
        <div className="relative w-full max-w-md p-8 mx-3 text-gray-200 rounded-lg shadow-lg bg-gray-800/50 bg-opacity-10 sm:mx-0">
          <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center">
              <h2 className="mt-6 text-4xl font-bold leading-9 tracking-tight text-left">
                {isForgotMode ? "Forgot Password" : "Login"}
              </h2>
              <p className="mt-2 text-center">
                {isForgotMode ? "Enter your email to reset password" : "Have an account?"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md">
                <p className="text-green-200 text-sm text-center">{message}</p>
              </div>
            )}

            {/* Login Form */}
            <div className="mt-8">
              <Form onSubmit={formik.handleSubmit}>
                <Input
                  type="text"
                  label="Email or Username"
                  placeholder="Enter email......"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && formik.errors.email}
                  required
                  name="email"
                />

                {!isForgotMode && (
                  <Input
                    type="password"
                    label="Password"
                    placeholder="Password...."
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && formik.errors.password}
                    required
                    name="password"
                  />
                )}

                {!isForgotMode && (
                  /* Remember Me and Forgot Password */
                  <div className="flex items-center justify-between">
                    <Checkbox
                      label="Remember Me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-base text-gray-200 cursor-pointer hover:underline hover:text-blue-400 transition-colors"
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  disabled={!formik.isValid || loading}
                  fullWidth
                >
                  {isForgotMode ? "Send Reset Link" : "Sign In"}
                </Button>

                {/* Back to Login Button (when in forgot mode) */}
                {isForgotMode && (
                  <Button
                    type="button"
                    variant="success"
                    size="md"
                    onClick={() => {
                      setIsForgotMode(false);
                      dispatch(clearNotifications());
                    }}
                    fullWidth
                    className="mt-3"
                  >
                    Back to Login
                  </Button>
                )}
              </Form>

              {/* Register Link */}
              {!isForgotMode && (
                <p className="mt-4 text-base text-center">
                  Not a member?{" "}
                  <Link
                    to="/registration"
                    className="font-semibold leading-6 text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Register Here
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}