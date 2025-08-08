// import React, { memo, useState } from "react";
// import { ArrowRight, Calendar, DollarSign, Gift, Sparkles, Star, TrendingUp, CheckCircle } from "lucide-react";
// import InvestmentForm from "./InvestmentForm";
// import Loading from '../../common/Loading'
// const PlanIcon = memo(({ planName }) => {
//   const getIcon = () => {
//     if (planName.toLowerCase().includes("starter"))
//       return <Star className="w-6 h-6" />;
//     if (planName.toLowerCase().includes("professional"))
//       return <TrendingUp className="w-6 h-6" />;
//     if (planName.toLowerCase().includes("vip"))
//       return <Sparkles className="w-6 h-6" />;
//     return <DollarSign className="w-6 h-6" />;
//   };

//   return <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">{getIcon()}</div>;
// });
// const PlanHeader = memo(({plan, gradient, isPopular }) => (
//   <>
//     {isPopular && (
//       <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
//         <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-blue-500">
//           Most Popular
//         </span>
//       </div>
//     )}
//     <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white relative overflow-hidden border-b border-gray-700">
//       <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/10 transform translate-x-8 -translate-y-8"></div>
//       <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-blue-400/5 transform -translate-x-4 translate-y-4"></div>
//       <div className="relative z-10">
//         <div className="flex items-center justify-between mb-4">
//           <PlanIcon planName={plan.name} />
//           <div className="text-right">
//             <div className="text-2xl font-bold text-blue-400">
//               {plan.daily_roi_percentage}%
//             </div>
//             <div className="text-xs text-gray-400">Daily ROI</div>
//           </div>
//         </div>
//         <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
//         <p className="text-gray-300 text-sm">{plan.description}</p>
//       </div>
//     </div>
//   </>
// ));
// const ValidationResults = memo(({ planValidation }) => {
//   if (!planValidation) return null;

//   return (
//     <div
//       className={`rounded-lg p-4 mb-6 ${
//         planValidation.isValid
//           ? "bg-green-900/20 border border-green-700/50"
//           : "bg-red-900/20 border border-red-700/50"
//       }`}
//     >
//       <div
//         className={`flex items-center gap-2 ${
//           planValidation.isValid ? "text-green-400" : "text-red-400"
//         }`}
//       >
//         <CheckCircle className="w-4 h-4" />
//         <span className="font-medium text-sm">
//           {planValidation.isValid
//             ? "Valid Investment Amount"
//             : "Invalid Amount"}
//         </span>
//       </div>
//       {planValidation.message && (
//         <p
//           className={`mt-2 text-xs ${
//             planValidation.isValid ? "text-green-300" : "text-red-300"
//           }`}
//         >
//           {planValidation.message}
//         </p>
//       )}
//     </div>
//   );
// });
// const PlanDetails = memo(({ plan }) => (
//   <div className="space-y-3 mb-6">
//     <div className="flex items-center justify-between py-2">
//       <div className="flex items-center text-gray-200">
//         <DollarSign className="w-4 h-4 mr-2" />
//         <span className="text-sm">Investment Range</span>
//       </div>
//       <span className="font-semibold text-white text-sm">
//         ${plan.min_amount.toLocaleString()} - ${plan.max_amount.toLocaleString()}
//       </span>
//     </div>

//     <div className="flex items-center justify-between py-2">
//       <div className="flex items-center text-gray-200">
//         <Calendar className="w-4 h-4 mr-2" />
//         <span className="text-sm">Duration</span>
//       </div>
//       <span className="font-semibold text-white text-sm">{plan.duration_days} days</span>
//     </div>

//     <div className="flex items-center justify-between py-2">
//       <div className="flex items-center text-gray-200">
//         <TrendingUp className="w-4 h-4 mr-2" />
//         <span className="text-sm">Total ROI</span>
//       </div>
//       <span className="font-semibold text-green-400 text-sm">
//         {plan.total_roi_percentage}%
//       </span>
//     </div>

//     <div className="flex items-center justify-between py-2">
//       <div className="flex items-center text-gray-200">
//         <Gift className="w-4 h-4 mr-2" />
//         <span className="text-sm">Sponsor Bonus</span>
//       </div>
//       <span className="font-semibold text-blue-400 text-sm">
//         {plan.sponsor_bonus_percentage}%
//       </span>
//     </div>
//   </div>
// ));
// const ROIProjection = memo(({ planROI, investmentAmount, plan }) => {
//   if (!planROI || !investmentAmount) return null;

//   return (
//     <div className="bg-gray-800/50 rounded-lg p-5 mb-6 border border-gray-700">
//       <h4 className="font-semibold text-blue-400 mb-4 text-sm">
//         Investment Projection
//       </h4>
//       <div className="grid grid-cols-2 gap-4 text-xs">
//         <div>
//           <span className="text-gray-200">Expected Return:</span>
//           <p className="font-semibold text-green-400">
//             ${planROI.expectedReturn?.toFixed(2) || "0.00"}
//           </p>
//         </div>
//         <div>
//           <span className="text-gray-200">Total Amount:</span>
//           <p className="font-semibold text-green-400">
//             ${planROI.totalAmount?.toFixed(2) || "0.00"}
//           </p>
//         </div>
//         <div>
//           <span className="text-gray-200">Profit:</span>
//           <p className="font-semibold text-blue-400">
//             ${planROI.profit?.toFixed(2) || "0.00"}
//           </p>
//         </div>
//         <div>
//           <span className="text-gray-200">Daily Return:</span>
//           <p className="font-bold text-yellow-400">
//             ${((parseFloat(investmentAmount) * plan.daily_roi_percentage) / 100).toFixed(2)}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// });
// const PlanCard = memo(({
//     plan,
//     index,
//     selectedPlan,
//     setSelectedPlan,
//     investmentAmount,
//     setInvestmentAmount,
//     handleValidateAmount,
//     handleInvest,
//     planValidation,
//     planROI,
//     isProcessing
//   }) => {
//        const gradients = [
//       "from-blue-500 to-purple-600",
//       "from-emerald-500 to-teal-600",
//       "from-amber-500 to-orange-600",
//       "from-rose-500 to-pink-600",
//       "from-indigo-500 to-blue-600",
//     ];

//   const isPopular =
//       plan.name.toLowerCase().includes("professional") ||
//       plan.daily_roi_percentage > 2.0;
//     const isActive = plan.is_active === 1;
//     const gradient = gradients[index % gradients.length];
//     const isSelected = selectedPlan?.id === plan.id;

//     if (!isActive) return null;
//     if(isProcessing) return <Loading/>
//     return (
//       <div
//         className={`relative  ${
//           isPopular ? "" : ""
//         }`}
//       >
//         <div
//           className={`bg-[#1e1e1e] border border-white/20 rounded-md ${
//             isPopular ? "" : ""
//           }`}
//         >
//           <PlanHeader plan={plan}  isPopular={isPopular} />

//           <div className="p-4">
//             <PlanDetails plan={plan} />

//             {isSelected && (
//               <>
//                 <ROIProjection
//                   planROI={planROI}
//                   investmentAmount={investmentAmount}
//                   plan={plan}
//                 />
//                 <ValidationResults planValidation={planValidation} />
//               </>
//             )}

//             {isSelected ? (
//               <InvestmentForm
//                 plan={plan}
//                 investmentAmount={investmentAmount}
//                 setInvestmentAmount={setInvestmentAmount}
//                 handleValidateAmount={handleValidateAmount}
//                 handleInvest={handleInvest}
//                 planValidation={planValidation}
//                 onCancel={() => {
//                   setSelectedPlan(null);
//                   setInvestmentAmount("");
//                 }}
//               />
//             ) : (
//               <button
//                 onClick={() => setSelectedPlan(plan)}
//                 className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl transform hover:scale-105 group`}
//               >
//                 Select Plan
//                 <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }
// );
// export default PlanCard;

import React, { memo, useState } from "react";
import { ArrowRight, Calendar, DollarSign, Gift, Sparkles, Star, TrendingUp, CheckCircle, Target, Zap, Crown } from "lucide-react";
import InvestmentForm from "./InvestmentForm";
import Loading from '../../common/Loading'

const PlanIcon = memo(({ planName }) => {
  const getIcon = () => {
    if (planName.toLowerCase().includes("starter"))
      return <Star className="w-5 h-5 text-yellow-400" />;
    if (planName.toLowerCase().includes("professional"))
      return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (planName.toLowerCase().includes("vip"))
      return <Crown className="w-5 h-5 text-purple-400" />;
    return <Target className="w-5 h-5 text-blue-400" />;
  };
  const getBackground = () => {
    const name = planName.toLowerCase();

    if (name.includes("starter"))
      return "bg-gradient-to-r from-yellow-800 to-yellow-900";

    if (name.includes("professional"))
      return "bg-gradient-to-r from-emerald-800 to-emerald-900";

    if (name.includes("vip"))
      return "bg-gradient-to-r from-purple-800 to-purple-900";

    return "bg-gradient-to-r from-blue-800 to-blue-900";
  };

  return (
    <div className={`w-12 h-12 rounded-xl ${getBackground()} flex items-center justify-center  shadow-inner`}>
      {getIcon()}
    </div>
  );
});

const PlanHeader = memo(({ plan, gradient, isPopular }) => (
  <div className="relative">
    {isPopular && (
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Zap className="w-3 h-3" />
          POPULAR
        </div>
      </div>
    )}
    {/* bg-[#226200] */}
    <div className=" rounded-t-md p-6 border-b-4 border-[#4abd0b]">
      <div className="flex items-center justify-between mb-4">
        <PlanIcon planName={plan.name} />
        <div className="text-right">
          <div className="text-3xl font-black text-slate-100 mb-1">
            {plan.daily_roi_percentage}%
          </div>
          <div className="text-xs text-slate-300 font-semibold uppercase tracking-wide">
            Daily Return
          </div>
        </div>
      </div>

      <h3 className="text-xl font-black text-white ">
        {plan.name}
      </h3>
      <p className="text-slate-100 font-medium text-sm leading-relaxed">
        {plan.description}
      </p>
    </div>
  </div>
));

const ValidationResults = memo(({ planValidation }) => {
  if (!planValidation) return null;

  return (
    <div className={`rounded-xl p-4 mb-4 border-l-4 ${planValidation.isValid
        ? "bg-green-50 border-green-400"
        : "bg-red-50 border-red-400"
      }`}>
      <div className={`flex items-center gap-2 ${planValidation.isValid ? "text-green-700" : "text-red-700"
        }`}>
        <CheckCircle className="w-4 h-4" />
        <span className="font-bold text-sm">
          {planValidation.isValid
            ? "Valid Investment Amount"
            : "Invalid Amount"}
        </span>
      </div>
      {planValidation.message && (
        <p className={`mt-2 text-sm ${planValidation.isValid ? "text-green-600" : "text-red-600"
          }`}>
          {planValidation.message}
        </p>
      )}
    </div>
  );
});

const PlanDetails = memo(({ plan }) => (
  <div className="space-y-3 mb-6">
    <div className="bg-black rounded-lg p-3 flex items-center justify-between border border-white/20">
      <div className="flex items-center text-slate-100">
        <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center mr-3">
          <DollarSign className="w-4 h-4 text-green-200" />
        </div>
        <span className="text-sm font-semibold">Investment Range</span>
      </div>
      <span className="font-black text-slate-100 text-sm">
        ${plan.min_amount.toLocaleString()} - ${plan.max_amount.toLocaleString()}
      </span>
    </div>

    <div className="bg-black rounded-lg p-3 flex items-center justify-between border border-white/20">
      <div className="flex items-center text-slate-100">
        <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center mr-3">
          <Calendar className="w-4 h-4 text-blue-200" />
        </div>
        <span className="text-sm font-semibold">Duration</span>
      </div>
      <span className="font-black text-slate-100 text-sm">{plan.duration_days} days</span>
    </div>

    <div className="bg-black rounded-lg p-3 flex items-center justify-between border border-white/20">
      <div className="flex items-center text-slate-100">
        <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center mr-3">
          <TrendingUp className="w-4 h-4 text-purple-200" />
        </div>
        <span className="text-sm font-semibold">Total ROI</span>
      </div>
      <span className="font-black text-green-600 text-sm">
        {plan.total_roi_percentage}%
      </span>
    </div>

    <div className="bg-black rounded-lg p-3 flex items-center justify-between border border-white/20">
      <div className="flex items-center text-slate-100">
        <div className="w-8 h-8 bg-orange-900 rounded-lg flex items-center justify-center mr-3">
          <Gift className="w-4 h-4 text-orange-200" />
        </div>
        <span className="text-sm font-semibold">Sponsor Bonus</span>
      </div>
      <span className="font-black text-blue-600 text-sm">
        {plan.sponsor_bonus_percentage}%
      </span>
    </div>
  </div>
));

const ROIProjection = memo(({ planROI, investmentAmount, plan }) => {
  if (!planROI || !investmentAmount) return null;

  return (
    <div className="bg-black p-5 mb-6 text-white">
      <h4 className="font-bold text-yellow-400 mb-4 text-sm flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Investment Projection
      </h4>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <span className="text-slate-300 block mb-1">Expected Return:</span>
          <p className="font-black text-green-400 text-lg">
            ${planROI.expectedReturn?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <span className="text-slate-300 block mb-1">Total Amount:</span>
          <p className="font-black text-green-400 text-lg">
            ${planROI.totalAmount?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <span className="text-slate-300 block mb-1">Profit:</span>
          <p className="font-black text-blue-400 text-lg">
            ${planROI.profit?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <span className="text-slate-300 block mb-1">Daily Return:</span>
          <p className="font-black text-yellow-400 text-lg">
            ${((parseFloat(investmentAmount) * plan.daily_roi_percentage) / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
});

const PlanCard = memo(({
  plan,
  index,
  selectedPlan,
  setSelectedPlan,
  investmentAmount,
  setInvestmentAmount,
  handleValidateAmount,
  handleInvest,
  planValidation,
  planROI,
  isProcessing,
  isActivePlan
}) => {
  const gradients = [
    "from-blue-600 to-blue-700",
    "from-emerald-600 to-emerald-700",
    "from-purple-600 to-purple-700",
    "from-orange-600 to-orange-700",
    "from-indigo-600 to-indigo-700",
  ];

  const isPopular =
    plan.name.toLowerCase().includes("professional") ||
    plan.daily_roi_percentage > 2.0;
  const isActive = plan.is_active === 1;
  const gradient = gradients[index % gradients.length];
  const isSelected = selectedPlan?.id === plan.id;

  if (!isActive) return null;
  if (isProcessing) return <Loading />

  return (
    <div className="relative">
      <div className="bg-black rounded-2xl shadow-xl border border-white/20 ">
        <PlanHeader plan={plan} isPopular={isPopular} />

        <div className="p-6">
          <PlanDetails plan={plan} />

          {isSelected && (
            <>
              <ROIProjection
                planROI={planROI}
                investmentAmount={investmentAmount}
                plan={plan}
              />
              <ValidationResults planValidation={planValidation} />
            </>
          )}
          { isSelected ? (
              <InvestmentForm
                plan={plan}
                investmentAmount={investmentAmount}
                setInvestmentAmount={setInvestmentAmount}
                handleValidateAmount={handleValidateAmount}
                handleInvest={handleInvest}
                planValidation={planValidation}
                onCancel={() => {
                  setSelectedPlan(null);
                  setInvestmentAmount("");
                }}
              />
            ) : (
              // Show Active Plan button when plan is active but not selected
              <button
              onClick={() => setSelectedPlan(plan)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r ${gradient} shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group`}
            >
              Select Plan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            )}
          {/* {isActivePlan ? (
            isSelected ? (
              <InvestmentForm
                plan={plan}
                investmentAmount={investmentAmount}
                setInvestmentAmount={setInvestmentAmount}
                handleValidateAmount={handleValidateAmount}
                handleInvest={handleInvest}
                planValidation={planValidation}
                onCancel={() => {
                  setSelectedPlan(null);
                  setInvestmentAmount("");
                }}
              />
            ) : (
              // Show Active Plan button when plan is active but not selected
              <button
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-green-500 cursor-default flex items-center justify-center gap-2"
              >
                Active Plan
                <CheckCircle className="w-4 h-4" />
              </button>
            )
          ) : (
            // Show Select Plan button when plan is not active
            <button
              onClick={() => setSelectedPlan(plan)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r ${gradient} shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group`}
            >
              Select Plan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}
);

export default PlanCard;