CREATE DEFINER=`root`@`localhost` TRIGGER `update_wallet_balance_after_transaction` AFTER INSERT ON `transactions` FOR EACH ROW BEGIN
    -- Only process completed transactions
    IF NEW.status = 'completed' THEN
        CASE NEW.transaction_type
            -- Deposit: Add to main balance
            WHEN 'deposit' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Withdrawal: Deduct from total_earned (original logic preserved)
            WHEN 'withdrawal' THEN
                UPDATE user_wallets 
                SET total_earned = total_earned - NEW.amount
                WHERE user_id = NEW.user_id;
                
            -- Withdrawal from main balance
            WHEN 'withdrawal_main' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance - NEW.amount
                WHERE user_id = NEW.user_id;
                
            -- ROI Earning: Add to ROI balance and total earned
            WHEN 'roi_earning' THEN
                UPDATE user_wallets 
                SET roi_balance = roi_balance + NEW.net_amount,
                    total_earned = total_earned + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Level Commission: Add to commission balance and total earned
            WHEN 'level_commission' THEN
                UPDATE user_wallets 
                SET commission_balance = commission_balance + NEW.net_amount,
                    total_earned = total_earned + NEW.net_amount
                WHERE user_id = NEW.user_id;
                
			   -- Level Commission: Add to commission balance and total earned
            WHEN 'upline_commission' THEN
                UPDATE user_wallets 
                SET commission_balance = commission_balance + NEW.net_amount,
                    total_earned = total_earned + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Direct Bonus: Add to commission balance and total earned
            WHEN 'direct_bonus' THEN
                UPDATE user_wallets 
                SET commission_balance = commission_balance + NEW.net_amount,
                    total_earned = total_earned + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Reward Bonus: Add to commission balance and total earned
            WHEN 'reward_bonus' THEN
                UPDATE user_wallets 
                SET commission_balance = commission_balance + NEW.net_amount,
                    total_earned = total_earned + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Transfer In: Add to main balance
            WHEN 'transfer_in' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Transfer Out: Deduct from main balance
            WHEN 'transfer_out' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance - NEW.amount
                WHERE user_id = NEW.user_id;
            
            -- Investment: Deduct from main balance, add to total invested
            WHEN 'invest' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance - NEW.net_amount,
                    total_invested = total_invested + NEW.net_amount
                WHERE user_id = NEW.user_id;
                
                -- Update user status to active
                UPDATE users 
                SET status = 'active'
                WHERE id = NEW.user_id;
                
            -- Compound: Move from ROI balance to main balance
            WHEN 'compound' THEN
                UPDATE user_wallets 
                SET roi_balance = roi_balance - NEW.amount,
                    main_balance = main_balance + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Penalty: Deduct from main balance
            WHEN 'penalty' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance - NEW.amount
                WHERE user_id = NEW.user_id;
            
            -- Refund: Add to main balance
            WHEN 'refund' THEN
                UPDATE user_wallets 
                SET main_balance = main_balance + NEW.net_amount
                WHERE user_id = NEW.user_id;
            
            -- Salary: Add to commission balance and total earned
            WHEN 'salary' THEN
                UPDATE user_wallets 
                SET commission_balance = commission_balance + NEW.net_amount,
                    total_earned = total_earned + NEW.net_amount
                WHERE user_id = NEW.user_id;
                
        END CASE;
    END IF;
END