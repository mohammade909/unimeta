// import React, { useState, useEffect } from "react";
// import { useWithdrawals } from "../../../hooks/useWithdrawals";
// import {
//   AlertCircle,
//   CheckCircle,
//   DollarSign,
//   CreditCard,
//   Loader2,
//   X,
// } from "lucide-react";
// import { useWallet } from "../../../hooks/useWallet";

// const WithdrawalsForm = ({ onSuccess, onCancel }) => {
//   const { actions, createRequest, error } = useWithdrawals();
//   const { userWallet } = useWallet();
//   const [formData, setFormData] = useState({
//     requested_amount: "",
//     withdrawal_method: "bank_transfer",
//     withdrawal_address: "",
//     withdrawal_details: {
//       account_name: "",
//       account_number: "",
//       bank_name: "",
//       routing_number: "",
//       swift_code: "",
//     },
//   });

//   const [validationErrors, setValidationErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);

//   const calculateFee = (amount) => {
//     const feeRate = 0.025; // 2.5%
//     const minFee = 5;
//     const calculatedFee = Math.max(amount * feeRate, minFee);
//     return Math.round(calculatedFee * 100) / 100;
//   };

//   const fee = formData.requested_amount
//     ? calculateFee(parseFloat(formData.requested_amount))
//     : 0;
//   const netAmount = formData.requested_amount
//     ? parseFloat(formData.requested_amount) - fee
//     : 0;

//   // Handle form field changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name.startsWith("details.")) {
//       const detailField = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         withdrawal_details: {
//           ...prev.withdrawal_details,
//           [detailField]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }

//     // Clear validation error when user starts typing
//     if (validationErrors[name]) {
//       setValidationErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   // Validate form
//   const validateForm = () => {
//     const errors = {};

//     if (
//       !formData.requested_amount ||
//       parseFloat(formData.requested_amount) <= 0
//     ) {
//       errors.requested_amount = "Please enter a valid amount";
//     } else if (parseFloat(formData.requested_amount) < 10) {
//       errors.requested_amount = "Minimum withdrawal amount is $10";
//     } else if (
//       parseFloat(formData.requested_amount) >
//       parseFloat(userWallet?.total_earned)
//     ) {
//       errors.requested_amount = `Max withdrawal amount is ${parseFloat(
//         userWallet?.total_earned
//       )}`;
//     }

//     if (!formData.withdrawal_method) {
//       errors.withdrawal_method = "Please select a withdrawal method";
//     }

//     if (!formData.withdrawal_address) {
//       errors.withdrawal_address = "Please enter withdrawal address/account";
//     }

//     // Method-specific validation
//     if (formData.withdrawal_method === "bank_transfer") {
//       if (!formData.withdrawal_details.account_name) {
//         errors["details.account_name"] = "Account name is required";
//       }
//       if (!formData.withdrawal_details.account_number) {
//         errors["details.account_number"] = "Account number is required";
//       }
//       if (!formData.withdrawal_details.bank_name) {
//         errors["details.bank_name"] = "Bank name is required";
//       }
//     }

//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);
//     actions.clearErrors();

//     try {
//       const withdrawalData = {
//         requested_amount: parseFloat(formData.requested_amount),
//         fee_amount: fee,
//         net_amount: netAmount,
//         withdrawal_method: formData.withdrawal_method,
//         withdrawal_address: formData.withdrawal_address,
//         withdrawal_details: formData.withdrawal_details,
//       };

//       await actions.createWithdrawal(withdrawalData);

//       setShowSuccess(true);
//       setTimeout(() => {
//         setShowSuccess(false);
//         onSuccess && onSuccess();
//       }, 2000);
//     } catch (err) {
//       console.error("Withdrawal request failed:", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       requested_amount: "",
//       withdrawal_method: "bank_transfer",
//       withdrawal_address: "",
//       withdrawal_details: {
//         account_name: "",
//         account_number: "",
//         bank_name: "",
//         routing_number: "",
//         swift_code: "",
//       },
//     });
//     setValidationErrors({});
//     actions.resetCreateRequest();
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       actions.clearErrors();
//     };
//   }, [actions]);

//   // Success message display
//   if (showSuccess) {
//     return (
//       <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
//         <div className="text-center">
//           <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Request Submitted!
//           </h2>
//           <p className="text-gray-600">
//             Your withdrawal request has been submitted successfully. You'll
//             receive an email confirmation shortly.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold text-gray-900 flex items-center">
//           <DollarSign className="w-6 h-6 mr-2" />
//           Withdrawal Request
//         </h2>
//         {onCancel && (
//           <button
//             onClick={onCancel}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         )}
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
//           <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
//           <div>
//             <h3 className="font-medium text-red-800">Error</h3>
//             <p className="text-red-700 text-sm mt-1">{error}</p>
//           </div>
//         </div>
//       )}

//       <div className="space-y-6">
//         {/* Amount Section */}
//         <div className="space-y-4">
//           <div>
//             <label
//               htmlFor="requested_amount"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Withdrawal Amount ($)
//             </label>
//             <input
//               type="number"
//               id="requested_amount"
//               name="requested_amount"
//               value={formData.requested_amount}
//               onChange={handleChange}
//               step="0.01"
//               min="10"
//               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 validationErrors.requested_amount
//                   ? "border-red-500"
//                   : "border-gray-300"
//               }`}
//               placeholder="Enter amount"
//             />
//             {validationErrors.requested_amount && (
//               <p className="text-red-500 text-sm mt-1">
//                 {validationErrors.requested_amount}
//               </p>
//             )}
//           </div>

//           {/* Fee Summary */}
//           {formData.requested_amount && (
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-gray-600">Requested Amount:</span>
//                 <span className="font-medium">
//                   ${parseFloat(formData.requested_amount).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center text-sm mt-1">
//                 <span className="text-gray-600">Processing Fee:</span>
//                 <span className="font-medium">-${fee.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-gray-200">
//                 <span>Net Amount:</span>
//                 <span className="text-green-600">${netAmount.toFixed(2)}</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Withdrawal Method */}
//         <div>
//           <label
//             htmlFor="withdrawal_method"
//             className="block text-sm font-medium text-gray-700 mb-2"
//           >
//             Withdrawal Method
//           </label>
//           <select
//             id="withdrawal_method"
//             name="withdrawal_method"
//             value={formData.withdrawal_method}
//             onChange={handleChange}
//             className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//               validationErrors.withdrawal_method
//                 ? "border-red-500"
//                 : "border-gray-300"
//             }`}
//           >
//              <option value="bank_transfer">Bank Transfer</option>
//              <option value="paypal">PayPal</option>
//             <option value="crypto">Cryptocurrency</option>
//             <option value="check">Check</option>
//           </select>
//           {validationErrors.withdrawal_method && (
//             <p className="text-red-500 text-sm mt-1">
//               {validationErrors.withdrawal_method}
//             </p>
//           )}
//         </div>

//         {/* Withdrawal Address */}
//         <div>
//           <label
//             htmlFor="withdrawal_address"
//             className="block text-sm font-medium text-gray-700 mb-2"
//           >
//             {formData.withdrawal_method === "bank_transfer"
//               ? "Account Number"
//               : formData.withdrawal_method === "paypal"
//               ? "PayPal Email"
//               : formData.withdrawal_method === "crypto"
//               ? "Wallet Address"
//               : "Mailing Address"}
//           </label>
//           <input
//             type="text"
//             id="withdrawal_address"
//             name="withdrawal_address"
//             value={formData.withdrawal_address}
//             onChange={handleChange}
//             className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//               validationErrors.withdrawal_address
//                 ? "border-red-500"
//                 : "border-gray-300"
//             }`}
//             placeholder={`Enter ${
//               formData.withdrawal_method === "bank_transfer"
//                 ? "account number"
//                 : formData.withdrawal_method === "paypal"
//                 ? "PayPal email"
//                 : formData.withdrawal_method === "crypto"
//                 ? "wallet address"
//                 : "mailing address"
//             }`}
//           />
//           {validationErrors.withdrawal_address && (
//             <p className="text-red-500 text-sm mt-1">
//               {validationErrors.withdrawal_address}
//             </p>
//           )}
//         </div>

//         {/* Bank Transfer Details */}
//         {formData.withdrawal_method === "bank_transfer" && (
//           <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
//             <h3 className="font-medium text-gray-900 flex items-center">
//               <CreditCard className="w-5 h-5 mr-2" />
//               Bank Account Details
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label
//                   htmlFor="account_name"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Account Name
//                 </label>
//                 <input
//                   type="text"
//                   id="account_name"
//                   name="details.account_name"
//                   value={formData.withdrawal_details.account_name}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     validationErrors["details.account_name"]
//                       ? "border-red-500"
//                       : "border-gray-300"
//                   }`}
//                   placeholder="Full name on account"
//                 />
//                 {validationErrors["details.account_name"] && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {validationErrors["details.account_name"]}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="bank_name"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Bank Name
//                 </label>
//                 <input
//                   type="text"
//                   id="bank_name"
//                   name="details.bank_name"
//                   value={formData.withdrawal_details.bank_name}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     validationErrors["details.bank_name"]
//                       ? "border-red-500"
//                       : "border-gray-300"
//                   }`}
//                   placeholder="Bank name"
//                 />
//                 {validationErrors["details.bank_name"] && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {validationErrors["details.bank_name"]}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="routing_number"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Routing Number
//                 </label>
//                 <input
//                   type="text"
//                   id="routing_number"
//                   name="details.routing_number"
//                   value={formData.withdrawal_details.routing_number}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="9-digit routing number"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="swift_code"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   SWIFT Code (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   id="swift_code"
//                   name="details.swift_code"
//                   value={formData.withdrawal_details.swift_code}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="For international transfers"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex space-x-4 pt-4">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             onClick={handleSubmit}
//             className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                 Processing...
//               </>
//             ) : (
//               "Submit Request"
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={resetForm}
//             disabled={isSubmitting}
//             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* Info Section */}
//       <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h4 className="font-medium text-blue-900 mb-2">
//           Important Information
//         </h4>
//         <ul className="text-sm text-blue-800 space-y-1">
//           <li>• Minimum withdrawal amount is $10</li>
//           <li>• Processing fee: 2.5% (minimum $5)</li>
//           <li>• Withdrawals are processed within 1-3 business days</li>
//           <li>• You'll receive an email confirmation once processed</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default WithdrawalsForm;

import React, { useState, useEffect } from "react";
import { useWithdrawals } from "../../../hooks/useWithdrawals";
import { AlertCircle, CheckCircle, DollarSign, Loader2, X } from "lucide-react";
import { useWallet } from "../../../hooks/useWallet";
import { useSearchParams } from "react-router-dom";
const WithdrawalsForm = ({ onSuccess, onCancel }) => {
  const { actions, createRequest, error } = useWithdrawals();
  const [searchParams] = useSearchParams();
  const { userWallet } = useWallet();
  const requestType = searchParams.get("requestType");
  const [formData, setFormData] = useState({
    requested_amount: "",
    withdrawal_method: "crypto",
    withdrawalType: requestType,
    withdrawal_details: {},
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const calculateFee = (amount) => {
    const feeRate = 0.025; // 2.5%
    const minFee = 5;
    const calculatedFee = Math.max(amount * feeRate, minFee);
    return Math.round(calculatedFee * 100) / 100;
  };


  const fee = formData.requested_amount
    ? calculateFee(parseFloat(formData.requested_amount))
    : 0;
  const netAmount = formData.requested_amount
    ? parseFloat(formData.requested_amount) - fee
    : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (
      !formData.requested_amount ||
      parseFloat(formData.requested_amount) <= 0
    ) {
      errors.requested_amount = "Please enter a valid amount";
    } else if (parseFloat(formData.requested_amount) < 10) {
      errors.requested_amount = "Minimum withdrawal amount is $10";
    } else if (
      requestType === "ROI" &&
      parseFloat(formData.requested_amount) >
        parseFloat(userWallet?.roi_balance)
    ) {
      errors.requested_amount = `Max withdrawal amount is ${parseFloat(
        userWallet?.roi_balance
      )}`;
    } else if (
      requestType === "income" &&
      parseFloat(formData.requested_amount) >
        Number(userWallet?.total_earned).toFixed(2) -
          Number(userWallet?.roi_balance).toFixed(2)
    ) {
      errors.requested_amount = `Max withdrawal amount is ${
        Number(userWallet?.total_earned).toFixed(2) -
        Number(userWallet?.roi_balance).toFixed(2)
      }`;
    } else if (
      parseFloat(formData.requested_amount) >
      parseFloat(userWallet?.total_earned)
    ) {
      errors.requested_amount = `Max withdrawal amount is ${parseFloat(
        userWallet?.total_earned
      )}`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  console.log(requestType)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    actions.clearErrors();

    try {
      const withdrawalData = {
        requested_amount: parseFloat(formData.requested_amount),
        fee_amount: fee,
        net_amount: netAmount,
        withdrawal_method: formData.withdrawal_method,
        withdrawalType: formData.withdrawalType,
        withdrawal_details: formData.withdrawal_details,
      };

      console.log("Submitting withdrawal request:", withdrawalData);

      await actions.createWithdrawal(withdrawalData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess && onSuccess();
      }, 2000);
    } catch (err) {
      console.error("Withdrawal request failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      requested_amount: "",
      withdrawal_method: "crypto",
      withdrawal_type: "",
      withdrawal_details: {},
    });
    setValidationErrors({});
    actions.resetCreateRequest();
  };

  useEffect(() => {
    return () => {
      actions.clearErrors();
    };
  }, [actions]);

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center p-4 border-white/20">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-600">
            Your withdrawal request has been submitted successfully. You'll
            receive an email confirmation shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-[#1a1a1a] rounded-md shadow-lg ">
      <div className="flex items-center justify-between p-4 border-b border-white/20 ">
        <h2 className="text-xl font-semibold text-yellow-300 flex items-center gap-2">
          <span className="p-2 bg-yellow-900 rounded-md ">
            <DollarSign className="w-5 h-5 " />
          </span>
          Withdrawal Request {requestType} $
          {requestType === "ROI"
            ? Number(userWallet?.roi_balance).toFixed(2)
            : Number(userWallet?.total_earned).toFixed(2) -
              Number(userWallet?.roi_balance).toFixed(2)}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-300 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-100">Error</h3>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 ">
          <div>
            <label
              htmlFor="requested_amount"
              className="block text-sm font-medium text-gray-100 mb-2"
            >
              Withdrawal Amount (
              {requestType === "ROI"
                ? Number(userWallet?.roi_balance).toFixed(2)
                : Number(userWallet?.total_earned).toFixed(2) -
                  Number(userWallet?.roi_balance).toFixed(2)}
              )
            </label>
            <input
              type="number"
              id="requested_amount"
              name="requested_amount"
              value={formData.requested_amount}
              onChange={handleChange}
              step="0.01"
              min="10"
              className={`w-full px-3 py-2 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.requested_amount
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter amount"
            />
            {validationErrors.requested_amount && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.requested_amount}
              </p>
            )}
          </div>
          {formData.requested_amount && (
            <div className="bg-[#111111] text-white p-4  border border-white/20 rounded-md ">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-100">Requested Amount:</span>
                <span className="font-medium">
                  ${parseFloat(formData.requested_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-100">Processing Fee:</span>
                <span className="font-medium">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-semibold mt-2 pt-2 border-t border-gray-200">
                <span>Net Amount:</span>
                <span className="text-green-400">${netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className=" bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Submit Request"
            )}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="px-6 py-2 border border-white/20 text-gray-100 rounded-md bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className=" bg-[#111111] rounded-md border border-white/20">
          <h4 className="font-medium text-yellow-300 p-4 border-b border-white/20  ">
            Important Information
          </h4>
          <ul className="text-sm text-white p-4 space-y-1">
            <li>• Minimum withdrawal amount is $10</li>
            <li>• Processing fee: 2.5% (minimum $5)</li>
            <li>• Withdrawals are processed within 1-3 business days</li>
            <li>• You'll receive an email confirmation once processed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalsForm;
