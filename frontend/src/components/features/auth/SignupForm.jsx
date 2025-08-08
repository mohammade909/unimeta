import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  signupUser,
  clearError,
  clearMessage,
  selectAuthLoading,
  selectAuthError,
  selectAuthMessage,
  selectIsAuthenticated,
} from "../../../store/slices/authSlice";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Inputs";

const SignupForm = ({ onSuccess, redirectPath = "/dashboard" }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    country_code: "+1",
    referrer_code: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    // Username validation
    // if (!formData.username.trim()) {
    //   errors.username = "Username is required";
    // } else if (formData.username.length < 3) {
    //   errors.username = "Username must be at least 3 characters";
    // } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    //   errors.username =
    //     "Username can only contain letters, numbers, and underscores";
    // }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }

    // Date of birth validation
    // if (!formData.date_of_birth) {
    //   errors.date_of_birth = "Date of birth is required";
    // } else {
    //   const birthDate = new Date(formData.date_of_birth);
    //   const today = new Date();
    //   const age = today.getFullYear() - birthDate.getFullYear();
    //   if (age < 13) {
    //     errors.date_of_birth = "You must be at least 13 years old";
    //   }
    // }

    // Country code validation
    if (!formData.country_code) {
      errors.country_code = "Country code is required";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setFormErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the form errors");
      return;
    }

    // Prepare data for submission (exclude confirmPassword)
    const { confirmPassword, ...submitData } = formData;

    // Clean up referrer_code if empty
    if (!submitData.referrer_code.trim()) {
      delete submitData.referrer_code;
    }

    try {
      const result = await dispatch(signupUser(submitData));

      if (signupUser.fulfilled.match(result)) {
        // Handle successful signup
        toast.success(result.payload.message || "Registration successful!");

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.payload);
        }

        // Reset form
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          full_name: "",
          phone: "",
          country_code: "+1",
          referrer_code: "",
        });
      }
    } catch (err) {
      // Error handling is done in the slice
      console.error("Signup error:", err);
    }
  };

  // Handle success/error messages from Redux
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (message && !error) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [message, error, dispatch]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      // Redirect or handle success
    }
  }, [isAuthenticated, onSuccess]);

  return (
    <div className="lg:max-w-md text-white lg:mx-auto rounded-lg px-4 py-6 ">
      <h2 className="text-2xl font-semibold text-gray-300">
  Create Account
</h2>
<p className=" text-sm text-gray-400 mb-6">
  Sign up to manage your trades and access your dashboard.
</p>


      <form onSubmit={handleSubmit} className="space-y-4 text-white">
        {/* Username */}
        {/* <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          error={formErrors.username}
          disabled={loading}
          required
        /> */}

        {/* Email */}
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 ">
        <Input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          disabled={loading}
          required
        />

        {/* Full Name */}
        <Input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          error={formErrors.full_name}
          disabled={loading}
          required
        />
</div>
        {/* Phone Number */}
        <div className="flex space-x-2">
          <div className="w-1/3">
            <select
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 text-white border  border-white/20 bg-gray-900/50 rounded-md focus:outline-none"
            >
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+91">+91</option>
              <option value="+86">+86</option>
              <option value="+33">+33</option>
              <option value="+49">+49</option>
              <option value="+81">+81</option>
              <option value="+82">+82</option>
              <option value="+55">+55</option>
              <option value="+61">+61</option>
            </select>
          </div>
          <div className="w-2/3">
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              error={formErrors.phone}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Date of Birth */}
        {/* <Input
          type="date"
          name="date_of_birth"
          placeholder="Date of Birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          error={formErrors.date_of_birth}
          disabled={loading}
          required
        /> */}

        {/* Password */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
            disabled={loading}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>

        {/* Referral Code (Optional) */}
        <Input
          type="text"
          name="referrer_code"
          placeholder="Referral Code (Optional)"
          value={formData.referrer_code}
          onChange={handleChange}
          error={formErrors.referrer_code}
          disabled={loading}
        />

        {/* Submit Button */}
        <Button
        variant="success"
          type="submit"
          disabled={loading}
          className="w-full b text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-4 text-sm text-gray-300">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-blue-300 hover:text-blue-400 font-semibold"
        >
          Sign in here
        </a>
      </p>
    </div>
  );
};

export default SignupForm;
