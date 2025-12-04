"use client";

import { useState } from "react";
import { Save, AlertCircle, Clock, Mail } from "lucide-react";

export default function EmailSettingsPage() {
    const [settings, setSettings] = useState({
        senderName: "AI Advisory Board",
        senderEmail: "noreply@aiadvisoryboard.me",
        replyTo: "support@aiadvisoryboard.me",
        dailyLimit: 1000,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
        timezone: "Europe/Kyiv",
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Mock save - will connect to API later
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Configure sender information and delivery settings
                </p>
            </div>

            {/* Provider Status */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Email Provider Not Configured</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            To send real emails, you need to configure Resend API key and DNS records for your domain.
                        </p>
                        <a href="#" className="text-sm text-yellow-800 dark:text-yellow-200 font-medium hover:underline mt-2 inline-block">
                            View setup guide →
                        </a>
                    </div>
                </div>
            </div>

            {/* Sender Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Sender Information</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Sender Name
                        </label>
                        <input
                            type="text"
                            value={settings.senderName}
                            onChange={(e) => setSettings(s => ({ ...s, senderName: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="AI Advisory Board"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            This name appears in the "From" field of emails
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Sender Email
                        </label>
                        <input
                            type="email"
                            value={settings.senderEmail}
                            onChange={(e) => setSettings(s => ({ ...s, senderEmail: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="noreply@yourdomain.com"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Must be from a verified domain (aiadvisoryboard.me)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Reply-To Email
                        </label>
                        <input
                            type="email"
                            value={settings.replyTo}
                            onChange={(e) => setSettings(s => ({ ...s, replyTo: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="support@yourdomain.com"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Where replies from recipients will be sent
                        </p>
                    </div>
                </div>
            </div>

            {/* Delivery Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Delivery Settings</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Daily Sending Limit
                        </label>
                        <input
                            type="number"
                            value={settings.dailyLimit}
                            onChange={(e) => setSettings(s => ({ ...s, dailyLimit: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            min={1}
                            max={10000}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Maximum emails to send per day (helps prevent spam flags)
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Quiet Hours Start
                            </label>
                            <input
                                type="time"
                                value={settings.quietHoursStart}
                                onChange={(e) => setSettings(s => ({ ...s, quietHoursStart: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Quiet Hours End
                            </label>
                            <input
                                type="time"
                                value={settings.quietHoursEnd}
                                onChange={(e) => setSettings(s => ({ ...s, quietHoursEnd: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Marketing emails will not be sent during quiet hours (timezone: {settings.timezone})
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                    {saving ? (
                        <>Saving...</>
                    ) : saved ? (
                        <>
                            <Save className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
