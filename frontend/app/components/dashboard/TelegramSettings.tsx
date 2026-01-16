import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function TelegramSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/telegram/settings', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch settings:', response.status, response.statusText);
        if (response.status === 401) {
          setMessage('Not authenticated. Please log in first.');
          setMessageType('error');
        }
        return;
      }

      const data = await response.json();
      setIsEnabled(data.enabled || false);
      setChatId(data.chatId || '');
    } catch (error) {
      console.error('Failed to fetch Telegram settings:', error);
      setMessage('Error loading settings');
      setMessageType('error');
    }
  };

  const handleEnable = async () => {
    if (!chatId.trim()) {
      setMessage('Please enter your Telegram Chat ID');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/telegram/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Enable failed:', response.status, errorText);
        if (response.status === 401) {
          setMessage('Not authenticated. Please log in first.');
        } else {
          setMessage(`Error: ${response.status} ${response.statusText}`);
        }
        setMessageType('error');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setIsEnabled(true);
        setMessage('Telegram notifications enabled! Check your Telegram for a test message.');
        setMessageType('success');
        setShowModal(false);
      } else {
        setMessage(data.message || 'Failed to enable notifications');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setMessage('Error enabling notifications: ' + (error as Error).message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setIsEnabled(false);
        setMessage('Telegram notifications disabled');
        setMessageType('success');
      }
    } catch (error) {
      setMessage('Error disabling notifications');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/test', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Test notification sent! Check your Telegram.');
        setMessageType('success');
      } else {
        setMessage(data.message || 'Failed to send test notification');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error sending test notification');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Telegram Notifications</h2>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-start space-x-3 ${messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <p className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to Get Your Telegram Chat ID:</h3>
        <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm">
          <li>Open Telegram and search for <a href="https://t.me/agro_track_bot" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-600">@agro_track_bot</a></li>
          <li>Send the command <code className="bg-white px-2 py-1 rounded">/start</code></li>
          <li>Copy your numeric Chat ID (e.g., 123456789)</li>
        </ol>
      </div>

      <div className="flex space-x-3">
        {!isEnabled ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            <Send className="w-4 h-4" />
            <span>Enable Notifications</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleTest}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send Test</span>
            </button>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              Disable
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enable Telegram Notifications</h3>

            <label className="block text-gray-700 font-semibold mb-2">Chat ID</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g., 123456789"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />

            <div className="flex space-x-3">
              <button
                onClick={handleEnable}
                disabled={loading || !chatId.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin inline mr-2" /> : null}
                Enable
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
