// Features Section Component
import { CheckCircle, DollarSign, TrendingUp, Users } from "lucide-react";
import { memo } from "react";
const FeaturesSection = memo(() => {
  const features = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Guaranteed Returns",
      desc: "Fixed daily ROI with transparent calculations",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Referral Bonuses",
      desc: "Earn extra through our sponsor program",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Flexible Duration",
      desc: "Various investment periods for optimal growth",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Low Minimum",
      desc: "Start investing with competitive minimums",
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Why Choose Our Investment Plans?
      </h2>
      <div className="grid md:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center group hover:transform hover:scale-105 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4 group-hover:shadow-lg">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

export default FeaturesSection