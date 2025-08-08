// examples/SystemSettingsUsage.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Search, 
  RefreshCw, 
  Edit3, 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Shield,
  DollarSign,
  Users,
  Clock,
  Layers
} from 'lucide-react';
import {
  useSystemSettings,
  useSystemSettingsCount,
  useSystemSetting,
  useSystemSettingByKey,
  useSystemSettingValue,
  useCreateSystemSetting,
  useUpdateSystemSetting,
  useUpdateSystemSettingValue,
  useDeleteSystemSetting,
  useSystemSettingsManager,
} from '../../services/api/setting';
import {toast} from 'react-hot-toast'

const getSettingIcon = (key) => {
  if (key.includes('maintenance')) return Shield;
  if (key.includes('roi') || key.includes('commission')) return DollarSign;
  if (key.includes('withdrawal') || key.includes('deposit')) return Database;
  if (key.includes('registration') || key.includes('user')) return Users;
  if (key.includes('processing') || key.includes('time')) return Clock;
  if (key.includes('level')) return Layers;
  return Settings;
};

// Helper function to format setting values
const formatSettingValue = (value) => {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).map(([k, v]) => (
      <div key={k} className="flex justify-between items-center text-sm">
        <span className=" text-[var(--subtitle-color)] capitalize">{k.replace('_', ' ')}:</span>
        <span className="font-medium  text-[var(--title-color)]">
          {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}
        </span>
      </div>
    ));
  }
  return value;
};

// Loading skeleton component
const SettingSkeleton = () => (
  <div className="bg-[var(--bg-outer)] rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);
const SettingCard = ({ setting, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(JSON.stringify(setting.setting_value, null, 2));
  const [isUpdating, setIsUpdating] = useState(false);
  
  const IconComponent = getSettingIcon(setting.setting_key);
  
  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const parsedValue = JSON.parse(editValue);
      await onUpdate({ id: setting.id, setting_value: parsedValue });
      setIsEditing(false);
      toast.success('Setting updated successfully!');
    } catch (error) {
    
      toast.error('Invalid JSON format');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(JSON.stringify(setting.setting_value, null, 2));
    setIsEditing(false);
  };

  return (
    <div className="bg-[var(--bg-inner)] rounded-md shadow-sm border border-white/20 hover:shadow-md transition-all duration-200 group">
      <div className="">
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[var(--grid-bg-7)] rounded-md transition-colors">
              <IconComponent className="w-5 h-5 text-[var(--subtitle-color)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--subtitle-color)] capitalize">
                {setting.setting_key.replace(/_/g, ' ')}
              </h3>
              <p className="text-sm text-[var(--subtitle-color)]">{setting.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              setting.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {setting.is_active ? 'Active' : 'Inactive'}
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-[var(--subtitle-color)] hover:bg-[var(--grid-bg-1)] rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
                Setting Value (JSON)
              </label>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-3 border border-white/20 bg-[var(--bg-outer)] rounded-md text-[var(--subtitle-color)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                rows={6}
                placeholder="Enter valid JSON..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isUpdating ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <div className="bg-[var(--bg-outer)] rounded-lg p-4">
              <div className="space-y-2  text-[var(--subtitle-color)]">
                {formatSettingValue(setting.setting_value)}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-[var(--subtitle-color)]">
              <span>ID: {setting.id}</span>
              <span>Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Example 1: Basic Settings List Component
const SystemSettings = () => {
 const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useSystemSettings({
    page,
    pageSize,
    ...filters,
  });

  const { data: totalCount } = useSystemSettingsCount(filters);
  const { updateSetting } = useUpdateSystemSetting();

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilters({ ...filters, key: term });
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) return <div>Loading settings...</div>;
  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[var(--title-color)]  mb-2">Something went wrong</h2>
          <p className="text-[var(--subtitle-color)]  mb-4">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-[var(--subtitle-color)]  rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-inner)]">
      <div className="container mx-auto">
        {/* Header */}
          <div className="flex items-center space-x-3 border-b p-4 border-white/20">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
            <h1 className="text-2xl font-semibold text-[var(--title-color)]">System Settings</h1>
             <p className="text-[var(--subtitle-color)]">Manage your application's core configuration settings</p>
         </div>
         
        </div>

        {/* Search and Controls */}
        <div className='p-4'>
        <div className="bg-[var(--bg-outer)] rounded-md shadow-sm border border-white/20 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--subtitle-color)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search settings by key..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-white/20 text-[var(--subtitle-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--subtitle-color)]">
                Total: <span className="font-semibold">{totalCount?.count || 0}</span> settings
              </span>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SettingSkeleton key={i} />
            ))
          ) : (
            settings?.data?.map((setting) => (
              <SettingCard
                key={setting.id}
                setting={setting}
                onUpdate={updateSetting}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {settings?.pagination && (
          <div className="bg-[var(--bg-inner)] rounded-md shadow-sm border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm  text-[var(--subtitle-color)]">
                Page {settings.pagination.page} of {settings.pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!settings.pagination.hasPrevious}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-[var(--subtitle-color)] rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!settings.pagination.hasMore}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-600  text-[var(--subtitle-color)] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SystemSettings