import React from "react";
import WagmiCryptoComponent from "../../components/features/shared/WagmiCryptoComponent";
import { useSystemSettings } from "../../services/api/setting";

const Deposit = () => {
  const { data: settings, isLoading, refetch } = useSystemSettings();
  const wallet = settings?.data?.find(
    (item) => item.setting_key === "wallet_address"
  );


  return (
    <WagmiCryptoComponent
      toAddress={wallet?.setting_value?.address}
      onTransactionComplete={(data) => {
        console.log("Withdrawal completed:", data);
      }}
    />
  );
};

export default Deposit;
