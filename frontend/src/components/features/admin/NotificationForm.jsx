import React, { useState } from "react";
import {
  LoaderCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Bell,
  User,
  Users,
  X,
} from "lucide-react";

const NotificationForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    recipient_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) return;

    setLoading(true);
    setNotification(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success/error randomly for demo
    const isSuccess = Math.random() > 0.3;

    if (isSuccess) {
      setNotification({
        type: "success",
        message: "Notification sent successfully!",
        details: formData.recipient_id
          ? `Sent to user ${formData.recipient_id}`
          : "Sent to all users",
      });
      setFormData({ title: "", message: "", type: "info", recipient_id: "" });
    } else {
      setNotification({
        type: "error",
        message: "Failed to send notification",
        details: "Please check your connection and try again",
      });
    }

    setLoading(false);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-800 border-white/20 text-blue-100",
      success: "bg-green-800 border-white/20 text-green-100",
      warning: "bg-yellow-800 border-white/20 text-yellow-100",
      error: "bg-red-800 border-white/20 text-red-100",
    };
    return colors[type] || colors.info;
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: "text-blue-500",
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="min-h-screen  bg-[var(--bg-inner)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center border-b border-white/20  gap-4 p-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full ">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--title-color)] ">
              Send Notification
            </h1>
            <p className=" text-[var(--subtitle-color)]">
              Send targeted notifications to users or broadcast to everyone
            </p>
          </div>
        </div>

        {/* Notification Messages */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 ${
              notification.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            } transition-all duration-300 transform animate-pulse`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      notification.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      notification.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {notification.details}
                  </p>
                </div>
              </div>
              <button
                onClick={dismissNotification}
                className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                  notification.type === "success"
                    ? "hover:bg-green-600"
                    : "hover:bg-red-600"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="p-4">
          <div className="bg-[var(--bg-inner)] rounded-md shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--subtitle-color)] flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notification Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-white/20 bg-[var(--bg-outer)] text-[var(--subtitle-color)] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 "
                    placeholder="Enter notification title..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--subtitle-color)]">
                    Message Content
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border border-white/20 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-[var(--bg-outer)] text-[var(--subtitle-color)] resize-none"
                    placeholder="Write your notification message here..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--subtitle-color)]">
                    Notification Type
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {["info", "success", "warning", "error"].map((type) => (
                      <label key={type} className="cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                          className="sr-only"
                          disabled={loading}
                        />
                        <div
                          className={`p-3 rounded-md border-2  text-[var(--subtitle-color)] transition-all duration-200 ${
                            formData.type === type
                              ? getTypeColor(type) + " border-current "
                              : " bg-[var(--bg-outer)] border-white/20 "
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                formData.type === type
                                  ? getTypeIcon(type).replace("text-", "bg-")
                                  : "bg-gray-100"
                              }`}
                            />
                            <span className="font-medium capitalize">
                              {type}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Recipient Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--subtitle-color)]">
                    Recipients
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md  transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="recipient"
                        checked={!formData.recipient_id}
                        onChange={() =>
                          setFormData({ ...formData, recipient_id: "" })
                        }
                        className="text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <Users className="w-5 h-5 text-[var(--subtitle-color)]" />
                      <div>
                        <p className="font-medium text-[var(--subtitle-color)]">
                          All Users
                        </p>
                        <p className="text-sm text-[var(--subtitle-color)]">
                          Send to everyone
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border text-[var(--subtitle-color)] border-gray-200 rounded-md  transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="recipient"
                        checked={!!formData.recipient_id}
                        onChange={() =>
                          setFormData({ ...formData, recipient_id: "1" })
                        }
                        className="text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <User className="w-5 h-5 text-[var(--subtitle-color)]" />
                      <div className="flex-1">
                        <p className="font-medium text-[var(--subtitle-color)]">
                          Specific User
                        </p>
                        <input
                          type="number"
                          placeholder="Enter user ID"
                          className="mt-1 w-full px-3 py-2 text-sm border text-[var(--subtitle-color)] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.recipient_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipient_id: e.target.value,
                            })
                          }
                          disabled={loading}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-md font-semibold text-white transition-all duration-200 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <LoaderCircle className="animate-spin w-5 h-5" />
                      <span>Sending notification...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Send className="w-5 h-5" />
                      <span>Send Notification</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-inner)] rounded-2xl p-8 max-w-sm mx-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LoaderCircle className="animate-spin w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--title-color)]  mb-2">
                Sending Notification
              </h3>
              <p className="text-[var(--subtitle-color)] ">
                Please wait while we process your request...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationForm;
