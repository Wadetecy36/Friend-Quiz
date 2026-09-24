import React, { useState } from 'react';
import { ResponseRecord, calculateCompletion, formatDate } from '../lib/utils';
import { getActiveQuestions } from '../lib/questions';
import { useDesignSystem } from '../context/DesignSystemContext';
import { Search, Eye, Trash2, ArrowUpDown, Calendar } from 'lucide-react';

interface AdminTableProps {
  responses: ResponseRecord[];
  onView: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({ responses, onView, onDelete }) => {
  const { theme } = useDesignSystem();
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
    <div className="space-y-4 animate-note-entrance">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: theme.colors.textSecondary }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search participant..."
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 font-mono transition"
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          />
        </div>

        <div
          className="text-xs font-mono font-bold"
          style={{ color: theme.colors.textSecondary }}
        >
          {sorted.length} of {responses.length} responses
        </div>
      </div>

      {/* Table Container */}
      <div
        className="border rounded-2xl overflow-hidden shadow-sm"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ color: theme.colors.textPrimary }}>
            <thead
              className="border-b font-mono text-xs uppercase font-bold tracking-wider"
              style={{
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.borderSecondary,
                color: theme.colors.textSecondary,
              }}
            >
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Participant
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('completion')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Completion
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    Last Active
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.colors.borderSecondary }}>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center font-mono text-xs"
                    style={{ color: theme.colors.textSecondary }}
                  >
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
                      className="transition-colors hover:bg-white/5"
                    >
                      {/* Name */}
                      <td className="py-4 px-5 font-bold">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl border flex items-center justify-center font-mono text-xs font-bold"
                            style={{
                              backgroundColor: 'rgba(249, 115, 22, 0.15)',
                              borderColor: 'rgba(249, 115, 22, 0.35)',
                              color: '#FDBA74',
                            }}
                          >
                            {res.participant_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-base">{res.participant_name}</span>
                        </div>
                      </td>

                      {/* Completion Progress */}
                      <td className="py-4 px-5">
                        <div className="w-48 max-w-full">
                          <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                            <span className={isComplete ? 'text-emerald-400' : 'text-amber-400'}>
                              {percentage}% ({count}/{totalCount})
                            </span>
                            {isComplete ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
                                Complete
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-orange-500/40 bg-orange-950/40 text-orange-300">
                                In Progress
                              </span>
                            )}
                          </div>
                          <div
                            className="w-full rounded-full h-2 overflow-hidden border"
                            style={{
                              backgroundColor: theme.colors.surfaceElevated,
                              borderColor: theme.colors.borderSecondary,
                            }}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isComplete ? 'bg-emerald-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td
                        className="py-4 px-5 text-xs font-mono"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {formatDate(res.updated_at || res.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onView(res.id)}
                            className="interactive-option inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer hover:border-orange-500/50"
                            style={{
                              backgroundColor: theme.colors.surfaceSubtle,
                              borderColor: theme.colors.borderSecondary,
                              color: theme.colors.textPrimary,
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                            View
                          </button>
                          <button
                            onClick={() => onDelete(res.id, res.participant_name)}
                            className="interactive-option p-1.5 text-xs font-bold rounded-xl border transition cursor-pointer hover:bg-rose-950/40 text-rose-400"
                            style={{
                              borderColor: theme.colors.borderSecondary,
                            }}
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
