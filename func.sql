-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: multilevel
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL,
  `image_path` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'multilevel'
--

--
-- Dumping routines for database 'multilevel'
--
/*!50003 DROP PROCEDURE IF EXISTS `CalculateROI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateROI`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id, v_investment_id INT;
    DECLARE v_daily_amount DECIMAL(15,2);
    DECLARE cur CURSOR FOR 
        SELECT ui.user_id, ui.id, 
               (ui.invested_amount * ip.daily_roi_percentage / 100) as daily_roi
        FROM user_investments ui
        JOIN investment_plans ip ON ui.plan_id = ip.id
        WHERE ui.status = 'active' 
        AND ui.last_roi_date < CURDATE()
        AND ui.end_date >= CURDATE();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_user_id, v_investment_id, v_daily_amount;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert ROI transaction
        INSERT INTO transactions (user_id, transaction_type, amount, net_amount, 
                                status, related_investment_id, source_type)
        VALUES (v_user_id, 'roi_earning', v_daily_amount, v_daily_amount, 
                'completed', v_investment_id, 'internal');
        
        -- Update user wallet
        UPDATE user_wallets 
        SET roi_balance = roi_balance + v_daily_amount,
            total_earned = total_earned + v_daily_amount
        WHERE user_id = v_user_id;
        
        -- Update investment
        UPDATE user_investments 
        SET total_earned = total_earned + v_daily_amount,
            last_roi_date = CURDATE()
        WHERE id = v_investment_id;
        
    END LOOP;
    
    CLOSE cur;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ProcessUserForTree` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `ProcessUserForTree`(
    IN p_user_id INT,
    IN p_referrer_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    DECLARE parent_level INT DEFAULT 0;
    DECLARE parent_path VARCHAR(1000) DEFAULT '';
    DECLARE new_path VARCHAR(1000);
    
    -- Get parent information if referrer exists
    IF p_referrer_id IS NOT NULL THEN
        SELECT level, path 
        INTO parent_level, parent_path
        FROM user_mlm_tree 
        WHERE user_id = p_referrer_id;
    END IF;
    
    -- Create the path for the new user
    IF parent_path = '' OR parent_path IS NULL THEN
        SET new_path = CONCAT('/', p_user_id, '/');
    ELSE
        SET new_path = CONCAT(parent_path, p_user_id, '/');
    END IF;
    
    -- Insert new user into MLM tree
    INSERT INTO user_mlm_tree (
        user_id,
        parent_id,
        level,
        path,
        direct_referrals,
        total_team_size,
        active_team_size,
        team_business
    ) VALUES (
        p_user_id,
        p_referrer_id,
        parent_level + 1,
        new_path,
        0,
        0,
        0,
        0.00
    );
    
    -- Update parent statistics
    IF p_referrer_id IS NOT NULL THEN
        UPDATE user_mlm_tree 
        SET direct_referrals = direct_referrals + 1,
            total_team_size = total_team_size + 1,
            active_team_size = active_team_size + IF(p_status = 'active', 1, 0)
        WHERE user_id = p_referrer_id;
    END IF;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RebuildMLMTree` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `RebuildMLMTree`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_id INT;
    DECLARE referrer_id INT;
    DECLARE user_status VARCHAR(20);
    
    DECLARE user_cursor CURSOR FOR 
        SELECT id, referrer_id, status FROM users ORDER BY id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Clear existing tree data
    DELETE FROM user_mlm_tree;
    
    -- Process each user
    OPEN user_cursor;
    read_loop: LOOP
        FETCH user_cursor INTO user_id, referrer_id, user_status;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Simulate insert trigger logic
        CALL ProcessUserForTree(user_id, referrer_id, user_status);
    END LOOP;
    
    CLOSE user_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-08 17:28:07
