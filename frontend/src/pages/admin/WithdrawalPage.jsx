import React from "react";
import WithdrawalsComponent from "../../components/features/admin/Withdrawals";
import WithdrawalStats from "../../components/features/admin/WithdrawalStats";
import { useSearchParams } from "react-router-dom";
const WithdrawalsPage = () => {
  const [searchParams] = useSearchParams();
  const withdrawalType = searchParams.get("withdrawalType");

  return (
    <div>
      <WithdrawalStats/>
      <WithdrawalsComponent withdrawalType={withdrawalType} />
    </div>
  );
};

export default WithdrawalsPage;
