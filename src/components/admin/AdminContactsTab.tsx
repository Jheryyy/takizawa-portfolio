'use client';

import React from 'react';
import { Send, Trash2 } from 'lucide-react';
import { ContactItem } from './types';

interface AdminContactsTabProps {
  isDark: boolean;
  contacts: ContactItem[];
  onDeleteContact: (id: string) => void;
}

export function AdminContactsTab({ isDark, contacts, onDeleteContact }: AdminContactsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-xl">Pesan Kontak Masuk</h3>
        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          Pesan yang dikirimkan oleh klien / visitor melalui formulir kontak di website portofolio.
        </p>
      </div>

      {contacts.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border text-neutral-400 text-sm ${
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          Belum ada pesan kontak yang tersimpan.
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`p-6 rounded-2xl border space-y-3 transition-all ${
                isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-inherit pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{c.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {c.subject || 'Inquiry'}
                    </span>
                  </div>
                  <a href={`mailto:${c.email}`} className="text-xs font-mono text-neutral-400 hover:underline">
                    {c.email}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">
                    {new Date(c.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <a
                    href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'Takizawa Portfolio')}&body=Halo ${encodeURIComponent(c.name)},%0D%0A%0D%0ATerima kasih telah menghubungi saya.`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Balas</span>
                  </a>
                  <button
                    onClick={() => onDeleteContact(c.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className={`text-sm leading-relaxed font-sans whitespace-pre-wrap ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
