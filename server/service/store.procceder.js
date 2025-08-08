const express = require('express');
const mysql = require('mysql2/promise');
const cron = require('node-cron');
const app = express();

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'your_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(express.json());

// ROI Calculation Function
async function calculateROI() {
    const connection = await pool.getConnection();
    
    try {
        console.log('Starting ROI calculation...');
        
        // Get active investments that need ROI calculation
        const [investments] = await connection.execute(`
            SELECT ui.user_id, ui.id as investment_id, 
                   (ui.invested_amount * ip.daily_roi_percentage / 100) as daily_roi
            FROM user_investments ui
            JOIN investment_plans ip ON ui.plan_id = ip.id
            WHERE ui.status = 'active' 
            AND ui.last_roi_date < CURDATE()
            AND ui.end_date >= CURDATE()
        `);

        if (investments.length === 0) {
            console.log('No investments found for ROI calculation');
            return { success: true, message: 'No ROI calculations needed', processed: 0 };
        }

        let processedCount = 0;
        
        // Begin transaction
        await connection.beginTransaction();

        for (const investment of investments) {
            const { user_id, investment_id, daily_roi } = investment;
            
            try {
                // Insert ROI transaction
                await connection.execute(`
                    INSERT INTO transactions (user_id, transaction_type, amount, net_amount, 
                                            status, related_investment_id, source_type)
                    VALUES (?, 'roi_earning', ?, ?, 'completed', ?, 'internal')
                `, [user_id, daily_roi, daily_roi, investment_id]);

                // Update user wallet
                await connection.execute(`
                    UPDATE user_wallets 
                    SET roi_balance = roi_balance + ?,
                        total_earned = total_earned + ?
                    WHERE user_id = ?
                `, [daily_roi, daily_roi, user_id]);

                // Update investment
                await connection.execute(`
                    UPDATE user_investments 
                    SET total_earned = total_earned + ?,
                        last_roi_date = CURDATE()
                    WHERE id = ?
                `, [daily_roi, investment_id]);

                processedCount++;
                
            } catch (error) {
                console.error(`Error processing ROI for user ${user_id}, investment ${investment_id}:`, error);
                // Continue with other investments
            }
        }

        await connection.commit();
        console.log(`ROI calculation completed. Processed ${processedCount} investments`);
        
        return { 
            success: true, 
            message: 'ROI calculation completed successfully', 
            processed: processedCount 
        };

    } catch (error) {
        await connection.rollback();
        console.error('ROI calculation failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Process User for MLM Tree Function
async function processUserForTree(userId, referrerId, status) {
    const connection = await pool.getConnection();
    
    try {
        let parentLevel = 0;
        let parentPath = '';
        
        // Get parent information if referrer exists
        if (referrerId) {
            const [parentInfo] = await connection.execute(
                'SELECT level, path FROM user_mlm_tree WHERE user_id = ?',
                [referrerId]
            );
            
            if (parentInfo.length > 0) {
                parentLevel = parentInfo[0].level;
                parentPath = parentInfo[0].path;
            }
        }
        
        // Create the path for the new user
        let newPath;
        if (!parentPath || parentPath === '') {
            newPath = `/${userId}/`;
        } else {
            newPath = `${parentPath}${userId}/`;
        }
        
        // Begin transaction
        await connection.beginTransaction();
        
        // Insert new user into MLM tree
        await connection.execute(`
            INSERT INTO user_mlm_tree (
                user_id, parent_id, level, path, direct_referrals, 
                total_team_size, active_team_size, team_business
            ) VALUES (?, ?, ?, ?, 0, 0, 0, 0.00)
        `, [userId, referrerId, parentLevel + 1, newPath]);
        
        // Update parent statistics
        if (referrerId) {
            await connection.execute(`
                UPDATE user_mlm_tree 
                SET direct_referrals = direct_referrals + 1,
                    total_team_size = total_team_size + 1,
                    active_team_size = active_team_size + ?
                WHERE user_id = ?
            `, [status === 'active' ? 1 : 0, referrerId]);
        }
        
        await connection.commit();
        return { success: true, message: 'User added to MLM tree successfully' };
        
    } catch (error) {
        await connection.rollback();
        console.error('Error processing user for tree:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Rebuild MLM Tree Function
async function rebuildMLMTree() {
    const connection = await pool.getConnection();
    
    try {
        console.log('Starting MLM tree rebuild...');
        
        // Begin transaction
        await connection.beginTransaction();
        
        // Clear existing tree data
        await connection.execute('DELETE FROM user_mlm_tree');
        
        // Get all users ordered by ID
        const [users] = await connection.execute(
            'SELECT id, referrer_id, status FROM users ORDER BY id'
        );
        
        let processedCount = 0;
        
        // Process each user
        for (const user of users) {
            try {
                const { id: userId, referrer_id: referrerId, status } = user;
                
                let parentLevel = 0;
                let parentPath = '';
                
                // Get parent information if referrer exists
                if (referrerId) {
                    const [parentInfo] = await connection.execute(
                        'SELECT level, path FROM user_mlm_tree WHERE user_id = ?',
                        [referrerId]
                    );
                    
                    if (parentInfo.length > 0) {
                        parentLevel = parentInfo[0].level;
                        parentPath = parentInfo[0].path;
                    }
                }
                
                // Create the path for the new user
                let newPath;
                if (!parentPath || parentPath === '') {
                    newPath = `/${userId}/`;
                } else {
                    newPath = `${parentPath}${userId}/`;
                }
                
                // Insert new user into MLM tree
                await connection.execute(`
                    INSERT INTO user_mlm_tree (
                        user_id, parent_id, level, path, direct_referrals, 
                        total_team_size, active_team_size, team_business
                    ) VALUES (?, ?, ?, ?, 0, 0, 0, 0.00)
                `, [userId, referrerId, parentLevel + 1, newPath]);
                
                // Update parent statistics
                if (referrerId) {
                    await connection.execute(`
                        UPDATE user_mlm_tree 
                        SET direct_referrals = direct_referrals + 1,
                            total_team_size = total_team_size + 1,
                            active_team_size = active_team_size + ?
                        WHERE user_id = ?
                    `, [status === 'active' ? 1 : 0, referrerId]);
                }
                
                processedCount++;
                
            } catch (error) {
                console.error(`Error processing user ${user.id}:`, error);
                // Continue with other users
            }
        }
        
        await connection.commit();
        console.log(`MLM tree rebuild completed. Processed ${processedCount} users`);
        
        return { 
            success: true, 
            message: 'MLM tree rebuilt successfully', 
            processed: processedCount 
        };
        
    } catch (error) {
        await connection.rollback();
        console.error('MLM tree rebuild failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Function to try stored procedure first, then fallback to Node.js function
async function executeWithFallback(procedureName, nodeFunction, ...args) {
    const connection = await pool.getConnection();
    
    try {
        // Try to execute stored procedure first
        console.log(`Attempting to execute stored procedure: ${procedureName}`);
        
        if (procedureName === 'CalculateROI') {
            await connection.execute('CALL CalculateROI()');
        } else if (procedureName === 'ProcessUserForTree') {
            await connection.execute('CALL ProcessUserForTree(?, ?, ?)', args);
        } else if (procedureName === 'RebuildMLMTree') {
            await connection.execute('CALL RebuildMLMTree()');
        }
        
        console.log(`Stored procedure ${procedureName} executed successfully`);
        return { success: true, method: 'stored_procedure' };
        
    } catch (error) {
        console.error(`Stored procedure ${procedureName} failed:`, error.message);
        console.log(`Falling back to Node.js function...`);
        
        // Fallback to Node.js function
        const result = await nodeFunction(...args);
        return { ...result, method: 'nodejs_function' };
        
    } finally {
        connection.release();
    }
}

// Express Routes
app.post('/api/roi/calculate', async (req, res) => {
    try {
        const result = await executeWithFallback('CalculateROI', calculateROI);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'ROI calculation failed', 
            error: error.message 
        });
    }
});

app.post('/api/mlm/add-user', async (req, res) => {
    try {
        const { userId, referrerId, status } = req.body;
        
        if (!userId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId and status are required' 
            });
        }
        
        const result = await executeWithFallback(
            'ProcessUserForTree', 
            processUserForTree, 
            userId, 
            referrerId, 
            status
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add user to MLM tree', 
            error: error.message 
        });
    }
});

app.post('/api/mlm/rebuild-tree', async (req, res) => {
    try {
        const result = await executeWithFallback('RebuildMLMTree', rebuildMLMTree);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to rebuild MLM tree', 
            error: error.message 
        });
    }
});

// Manual execution endpoints (for testing)
app.post('/api/roi/calculate-nodejs', async (req, res) => {
    try {
        const result = await calculateROI();
        res.json({ ...result, method: 'nodejs_function' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'ROI calculation failed', 
            error: error.message 
        });
    }
});

app.post('/api/mlm/rebuild-tree-nodejs', async (req, res) => {
    try {
        const result = await rebuildMLMTree();
        res.json({ ...result, method: 'nodejs_function' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to rebuild MLM tree', 
            error: error.message 
        });
    }
});

// Cron Jobs
// Calculate ROI daily at 12:01 AM
cron.schedule('1 0 * * *', async () => {
    console.log('Running daily ROI calculation via cron job...');
    try {
        await executeWithFallback('CalculateROI', calculateROI);
        console.log('Daily ROI calculation completed via cron job');
    } catch (error) {
        console.error('Daily ROI calculation failed via cron job:', error);
    }
});

// Rebuild MLM tree weekly on Sunday at 2:00 AM
cron.schedule('0 2 * * 0', async () => {
    console.log('Running weekly MLM tree rebuild via cron job...');
    try {
        await executeWithFallback('RebuildMLMTree', rebuildMLMTree);
        console.log('Weekly MLM tree rebuild completed via cron job');
    } catch (error) {
        console.error('Weekly MLM tree rebuild failed via cron job:', error);
    }
});

