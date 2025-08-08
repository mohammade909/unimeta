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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 capitalize">
                {setting.setting_key.replace(/_/g, ' ')}
              </h3>
              <p className="text-sm text-gray-500">{setting.description}</p>
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
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setting Value (JSON)
              </label>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
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
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {formatSettingValue(setting.setting_value)}
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>ID: {setting.id}</span>
              <span>Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingCard