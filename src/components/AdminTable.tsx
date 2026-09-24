import React, { useState } from 'react';
import { ResponseRecord, calculateCompletion, formatDate } from '../lib/utils';
import { getActiveQuestions } from '../lib/questions';
import { Search, Eye, Trash2, ArrowUpDown, Calendar } from 'lucide-react';

interface AdminTableProps {
  responses: ResponseRecord[];
  onView: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({ responses, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'completion' | 'date'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const activeQuestions = getActiveQuestions();
  const totalCount = activeQuestions.length;

  // Filter
  const filtered = responses.filter((r) =>
    r.participant_name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'name') {
      const cmp = a.participant_name.localeCompare(b.participant_name);
      return sortAsc ? cmp : -cmp;
    }
    if (sortField === 'completion') {
      const cmpA = calculateCompletion(a.answers, totalCount).percentage;
      const cmpB = calculateCompletion(b.answers, totalCount).percentage;
      return sortAsc ? cmpA - cmpB : cmpB - cmpA;
    }
    const timeA = new Date(a.updated_at || a.created_at).getTime();
    const timeB = new Date(b.updated_at || b.created_at).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  const handleSort = (field: 'name' | 'completion' | 'date') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search participant..."
            className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white shadow-brutal-sm"
          />
        </div>

        <div className="text-xs font-mono font-bold text-stone-600">
          {sorted.length} of {responses.length} responses
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] overflow-hidden shadow-brutal">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-900">
            <thead className="bg-[#FAF7F0] font-mono text-xs uppercase font-bold text-stone-700 border-b-2 border-stone-900">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-4 px-5 cursor-pointer hover:text-stone-950 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Participant
                    <ArrowUpDown className="w-3 h-3 text-stone-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('completion')}
                  className="py-4 px-5 cursor-pointer hover:text-stone-950 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Completion
                    <ArrowUpDown className="w-3 h-3 text-stone-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-4 px-5 cursor-pointer hover:text-stone-950 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-600" />
                    Last Active
                    <ArrowUpDown className="w-3 h-3 text-stone-500" />
                  </div>
                </th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-stone-200">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center font-mono text-xs text-stone-500">
                    {searchTerm ? 'No participants matched your search.' : 'No responses submitted yet.'}
                  </td>
                </tr>
              ) : (
                sorted.map((res) => {
                  const { count, percentage } = calculateCompletion(res.answers, totalCount);
                  const isComplete = count === totalCount;

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-[#FAF7F0] transition-colors"
                    >
                      {/* Name */}
                      <td className="py-4 px-5 font-bold text-stone-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-stone-900 bg-[#F9C84E] flex items-center justify-center font-mono text-xs font-bold text-stone-900 shadow-brutal-sm">
                            {res.participant_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-base">{res.participant_name}</span>
                        </div>
                      </td>

                      {/* Completion Progress */}
                      <td className="py-4 px-5">
                        <div className="w-48 max-w-full">
                          <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                            <span className={isComplete ? 'text-[#3D8F70]' : 'text-stone-800'}>
                              {percentage}% ({count}/{totalCount})
                            </span>
                            {isComplete ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-stone-900 bg-[#3D8F70] text-white">
                                Complete
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-stone-900 bg-[#F9C84E] text-stone-900">
                                In Progress
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-[#E8E2D2] rounded-full h-2 overflow-hidden border border-stone-300">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isComplete ? 'bg-[#3D8F70]' : 'bg-[#E05338]'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-xs font-mono text-stone-600">
                        {formatDate(res.updated_at || res.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onView(res.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-stone-900 bg-white hover:bg-[#F9C84E] text-stone-900 shadow-brutal-sm shadow-brutal-hover transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => onDelete(res.id, res.participant_name)}
                            className="p-1.5 text-xs font-bold rounded-xl border-2 border-stone-900 bg-white hover:bg-rose-100 text-stone-700 hover:text-rose-700 shadow-brutal-sm shadow-brutal-hover transition cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
