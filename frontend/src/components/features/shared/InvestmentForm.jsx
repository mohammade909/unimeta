import { ArrowRight } from "lucide-react";
import { memo } from "react";
const InvestmentForm = memo(
  ({
    plan,
    investmentAmount,
    setInvestmentAmount,
    handleValidateAmount,
    handleInvest,
    planValidation,
    onCancel,
  }) => (
    <div className="space-y-">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Investment Amount (${plan.min_amount} - ${plan.max_amount})
        </label>
        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => {
            setInvestmentAmount(e.target.value);
            if (e.target.value) {
              handleValidateAmount(plan);
            }
          }}
          placeholder={`Min: $${plan.min_amount}`}
          min={plan.min_amount}
          max={plan.max_amount}
          className="w-full px-4 py-3 rounded-md border text-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => handleInvest(plan)}
          disabled={
            !investmentAmount || (planValidation && !planValidation.isValid)
          }
          className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-300 ${
            !investmentAmount || (planValidation && !planValidation.isValid)
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          Invest Now
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-md border text-white font-medium border-gray-300 hover:bg-red-600 bg-red-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
);

export default InvestmentForm;
