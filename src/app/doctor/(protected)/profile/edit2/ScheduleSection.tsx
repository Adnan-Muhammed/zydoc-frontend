// 'use client';

// import React, { useState } from 'react';

// export default function ScheduleSection({ initialData }: { initialData: any }) {
//     const [schedule, setSchedule] = useState(initialData);
//     const [loading, setLoading] = useState(false);

//     const handleTimeChange = (day: string, field: 'start' | 'end' | 'active', val: any) => {
//         setSchedule({
//             ...schedule,
//             [day]: { ...schedule[day], [field]: val }
//         });
//     };

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             await fetch('/api/doctor/profile/schedule', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ workingHours: schedule }),
//             });
//             alert('Availability hours saved successfully!');
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
//             <div className="flex items-center justify-between border-b border-slate-50 pb-2">
//                 <h3 className="text-sm font-bold text-slate-700">Operational Availability</h3>
//                 <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">{loading ? 'Saving...' : 'Save Schedule'}</button>
//             </div>
//             <div className="space-y-3">
//                 {Object.keys(schedule).map((day) => (
//                     <div key={day} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-slate-50/50 rounded-xl text-xs">
//                         <div className="flex items-center gap-2 sm:w-1/3">
//                             <input type="checkbox" checked={schedule[day].active} onChange={e => handleTimeChange(day, 'active', e.target.checked)} className="accent-indigo-600" />
//                             <span className="font-bold capitalize text-slate-700">{day}</span>
//                         </div>
//                         {schedule[day].active ? (
//                             <div className="flex gap-2 items-center">
//                                 <input type="text" value={schedule[day].start} onChange={e => handleTimeChange(day, 'start', e.target.value)} className="border p-1 rounded text-center w-16" />
//                                 <span>to</span>
//                                 <input type="text" value={schedule[day].end} onChange={e => handleTimeChange(day, 'end', e.target.value)} className="border p-1 rounded text-center w-16" />
//                             </div>
//                         ) : (
//                             <span className="text-slate-400 italic">Closed</span>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }



'use client';

import React, { useState } from 'react';

export default function ScheduleSection({ initialData }: { initialData: any }) {
    const [schedule, setSchedule] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleTimeChange = (day: string, field: 'start' | 'end' | 'active', val: any) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], [field]: val }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/doctor/profile/schedule', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workingHours: schedule }),
            });
            alert('Availability hours saved successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        //     <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        //         <h3 className="text-sm font-bold text-slate-700">Operational Availability</h3>
        //         <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">{loading ? 'Saving...' : 'Save Schedule'}</button>
        //     </div>
        //     <div className="space-y-3">
        //         {Object.keys(schedule).map((day) => (
        //             <div key={day} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-slate-50/50 rounded-xl text-xs">
        //                 <div className="flex items-center gap-2 sm:w-1/3">
        //                     <input type="checkbox" checked={schedule[day].active} onChange={e => handleTimeChange(day, 'active', e.target.checked)} className="accent-indigo-600" />
        //                     <span className="font-bold capitalize text-slate-700">{day}</span>
        //                 </div>
        //                 {schedule[day].active ? (
        //                     <div className="flex gap-2 items-center">
        //                         <input type="text" value={schedule[day].start} onChange={e => handleTimeChange(day, 'start', e.target.value)} className="border p-1 rounded text-center w-16" />
        //                         <span>to</span>
        //                         <input type="text" value={schedule[day].end} onChange={e => handleTimeChange(day, 'end', e.target.value)} className="border p-1 rounded text-center w-16" />
        //                     </div>
        //                 ) : (
        //                     <span className="text-slate-400 italic">Closed</span>
        //                 )}
        //             </div>
        //         ))}
        //     </div>
        // </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
    {/* Header Action Row from first snippet updated with second snippet's typography styles */}
    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-clock text-indigo-500 text-xs" /> Operational Availability
        </h3>
        <button 
            type="button" 
            onClick={handleSave} 
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
            {loading ? 'Saving...' : 'Save Schedule'}
        </button>
    </div>

    {/* Loop Mapping via original data API structure */}
    <div className="space-y-3">
        {Object.keys(schedule).map((day) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50/40 text-xs">
                
                {/* Active Checkbox and Title Row */}
                <div className="flex items-center gap-3 sm:w-1/4">
                    <input
                        type="checkbox" 
                        checked={schedule[day].active} 
                        onChange={e => handleTimeChange(day, 'active', e.target.checked)} 
                        className="w-4 h-4 accent-indigo-600 cursor-pointer" 
                    />
                    <span className="font-bold capitalize text-slate-700">{day}</span>
                </div>

                {/* Conditional Time Range Slot Selection */}
                {schedule[day].active ? (
                    <div className="flex items-center gap-2 sm:w-3/4 justify-start sm:justify-end">
                        
                        {/* Start Input Field block */}
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Start:</span>
                            <input 
                                type="text" 
                                value={schedule[day].start} 
                                onChange={e => handleTimeChange(day, 'start', e.target.value)} 
                                className="px-2 py-1 border border-slate-200 rounded-lg text-slate-800 font-bold text-center w-16 focus:outline-none" 
                                placeholder="09:00 AM"
                            />
                        </div>

                        <span className="text-slate-300 mx-1">—</span>

                        {/* End Input Field block */}
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">End:</span>
                            <input 
                                type="text" 
                                value={schedule[day].end} 
                                onChange={e => handleTimeChange(day, 'end', e.target.value)} 
                                className="px-2 py-1 border border-slate-200 rounded-lg text-slate-800 font-bold text-center w-16 focus:outline-none" 
                                placeholder="05:00 PM"
                            />
                        </div>

                    </div>
                ) : (
                    /* Custom static fallback layout */
                    <span className="text-slate-400 italic font-medium sm:w-3/4 text-start sm:text-end">Practice Channel Closed</span>
                )}

            </div>
        ))}
    </div>
</div>
    );
}