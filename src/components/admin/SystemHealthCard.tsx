'use client';
import React, { useState, useEffect } from 'react';

interface HealthData {
    serverLoad: number;
    memoryUsage: number;
    uptime: string;
    uptimeSeconds: number;
    latency: number;
    errorRate: number;
    totalRequests: number;
    failedRequests: number;
    status: string;
}

interface LogData {
    timestamp: string;
    message: string;
    type: string;
}

export default function SystemHealthCard() { 
    const [health, setHealth] = useState<HealthData | null>(null);
    const [logs, setLogs] = useState<LogData[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/health`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setHealth(data);
            }
        } catch (error) {
            console.error("Failed to fetch system health", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch system logs", error);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const handleOpenLogs = () => {
        fetchLogs();
        setShowLogs(true);
    };

    const isError = health ? health.status === 'Warning' || health.errorRate > 5 : false;
    const serverLoad = health ? Math.round(health.serverLoad) : 0;

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between border border-slate-100">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">System Health</h2>
                        <span className="flex h-3 w-3 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isError ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isError ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </span>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Server Load</span>
                                <span className="font-semibold text-slate-700">{loading ? '...' : `${serverLoad}%`}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`${serverLoad > 80 ? 'bg-red-500' : 'bg-indigo-500'} h-full transition-all duration-500`}
                                    style={{ width: `${serverLoad}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 rounded-2xl bg-slate-50">
                                <p className="text-xs text-slate-400 uppercase">Latency</p>
                                <p className="text-sm font-bold text-slate-700">{loading ? '...' : `${Math.round(health?.latency || 0)}ms`}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50">
                                <p className="text-xs text-slate-400 uppercase">Errors</p>
                                <p className="text-sm font-bold text-slate-700">{loading ? '...' : `${(health?.errorRate || 0).toFixed(2)}%`}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleOpenLogs}
                    className="mt-6 w-full py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all"
                >
                    Open System Logs
                </button>
            </div>

            {/* Modal */}
            {showLogs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">System Logs</h3>
                            <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 font-mono text-sm">
                            {logs.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No recent logs found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-white border border-slate-200">
                                            <span className="text-slate-400 text-xs mr-3">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`${log.type === 'error' ? 'text-red-500' : 'text-slate-700'}`}>{log.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
