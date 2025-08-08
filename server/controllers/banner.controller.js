const Banner = require('../models/Banner');
const fs = require('fs').promises;

class BannerController {
    constructor() {
        this.bannerModel = new Banner();
        this.uploadDir = '/uploads/banners';
        this.ensureUploadDir();
    }

    // Ensure upload directory exists
    async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        } catch (error) {
            console.error('❌ Error creating upload directory:', error);
        }
    }

    // Upload banner
    async uploadBanner(req, res) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file uploaded'
                });
            }

            const { alt_text, status } = req.body;

            // Validate required fields
        

            // Prepare banner data
            const bannerData = {
                image_url: `/uploads/banners/${req.file.filename}`,
                image_path: req.file.path,
                alt_text: alt_text?.trim(),
                status: status || 'active',
            };

            // Create banner in database
            const banner = await this.bannerModel.create(bannerData);

            res.status(201).json({
                success: true,
                message: 'Banner uploaded successfully',
                data: banner
            });

        } catch (error) {
            console.error('❌ Upload banner error:', error);
            
            // Clean up uploaded file on error
            if (req.file) {
                await this.deleteFile(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to upload banner',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get all banners
    async getBanners(req, res) {
        try {
            const { status, page, limit } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const offset = (pageNum - 1) * limitNum;

            const filters = {
                status,
                limit: limitNum,
                offset
            };

            const [banners, totalCount] = await Promise.all([
                this.bannerModel.findAll(filters),
                this.bannerModel.getCount({ status })
            ]);

            const totalPages = Math.ceil(totalCount / limitNum);

            res.json({
                success: true,
                data: banners,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            });

        } catch (error) {
            console.error('❌ Get banners error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve banners',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get banner by ID
    async getBannerById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid banner ID is required'
                });
            }

            const banner = await this.bannerModel.findById(parseInt(id));

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            res.json({
                success: true,
                data: banner
            });

        } catch (error) {
            console.error('❌ Get banner by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve banner',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Update banner
    async updateBanner(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid banner ID is required'
                });
            }

            const bannerId = parseInt(id);
            const existingBanner = await this.bannerModel.findById(bannerId);

            if (!existingBanner) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            let updateData = {};
            const { title, description, alt_text, status, display_order } = req.body;

            // Update text fields
            if (title !== undefined) updateData.title = title.trim();
            if (description !== undefined) updateData.description = description.trim();
            if (alt_text !== undefined) updateData.alt_text = alt_text.trim();
            if (status !== undefined) updateData.status = status;
            if (display_order !== undefined) updateData.display_order = parseInt(display_order);

            // Handle image update
            if (req.file) {
                // Delete old image file
                await this.deleteFile(existingBanner.image_path);
                
                // Update with new image
                updateData.image_url = `/uploads/banners/${req.file.filename}`;
                updateData.image_path = req.file.path;
            }

            const updatedBanner = await this.bannerModel.update(bannerId, updateData);

            res.json({
                success: true,
                message: 'Banner updated successfully',
                data: updatedBanner
            });

        } catch (error) {
            console.error('❌ Update banner error:', error);
            
            // Clean up uploaded file on error
            if (req.file) {
                await this.deleteFile(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update banner',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Delete banner
    async deleteBanner(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid banner ID is required'
                });
            }

            const bannerId = parseInt(id);
            const result = await this.bannerModel.delete(bannerId);

            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            // Delete associated image file
            await this.deleteFile(result.deletedBanner.image_path);

            res.json({
                success: true,
                message: 'Banner deleted successfully',
                data: result.deletedBanner
            });

        } catch (error) {
            console.error('❌ Delete banner error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete banner',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Toggle banner status
    async toggleBannerStatus(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid banner ID is required'
                });
            }

            const banner = await this.bannerModel.toggleStatus(parseInt(id));

            res.json({
                success: true,
                message: `Banner ${banner.status === 'active' ? 'activated' : 'deactivated'} successfully`,
                data: banner
            });

        } catch (error) {
            console.error('❌ Toggle banner status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle banner status',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Update display order
    async updateDisplayOrder(req, res) {
        try {
            const { id } = req.params;
            const { display_order } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid banner ID is required'
                });
            }

            if (display_order === undefined || isNaN(display_order)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid display order is required'
                });
            }

            const banner = await this.bannerModel.updateDisplayOrder(
                parseInt(id), 
                parseInt(display_order)
            );

            res.json({
                success: true,
                message: 'Display order updated successfully',
                data: banner
            });

        } catch (error) {
            console.error('❌ Update display order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update display order',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Helper method to delete files
    async deleteFile(filePath) {
        try {
            if (filePath && await this.fileExists(filePath)) {
                await fs.unlink(filePath);
                console.log('🗑️ File deleted:', filePath);
            }
        } catch (error) {
            console.error('❌ Error deleting file:', error);
        }
    }

    // Helper method to check if file exists
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = BannerController;