import { Calendar, Percent, User, X, DollarSign } from "lucide-react";
import { formatDate } from "../../../pages/user/Transactions";

const CommissionBreakdown = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

 let source_details = transaction.source_details;

  if (typeof source_details === 'string') {
    try {
      source_details = JSON.parse(source_details);
    } catch (error) {
      console.error("Failed to parse source_details:", error);
      return null;
    }
  }

  const { commission_breakdown, summary, user_info } = source_details;

  const breakdownColumns = [
    {
      key: "level",
      label: "Level",
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
          {value}
        </span>
      ),
    },
    {
      key: "referral_email",
      label: "Referral User",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "sponsor_roi",
      label: "On Amount",
      render: (value) => (
        <span className="font-semibold text-gray-700">{value}</span>
      ),
    },
    {
      key: "commission_percentage",
      label: "Commission %",
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">{value}%</span>
        </div>
      ),
    },
    {
      key: "commission_amount",
      label: "Commission Earned",
      render: (value) => (
        <span className="font-bold text-green-600">{value}</span>
      ),
    },
    {
      key: "timestamp",
      label: "Timestamp",
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(value)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Commission Levels 
            </h2>
       
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Total Commission
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {summary?.total_commission}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Levels Earned
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {summary.levels_earned_from.join(", ")}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  Direct Referrals
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {user_info.direct_referrals_count}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  Max Level
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-700 mt-1">
                {user_info.max_level_eligible}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{user_info.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Calculation Date:</span>
                <p className="font-medium">{source_details.calculation_date}</p>
              </div>
            </div>
          </div>

          {/* Commission Breakdown Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Commission Details
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {breakdownColumns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commission_breakdown.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {breakdownColumns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-4 whitespace-nowrap"
                        >
                          {column.render
                            ? column.render(item[column.key], item)
                            : item[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionBreakdown;
