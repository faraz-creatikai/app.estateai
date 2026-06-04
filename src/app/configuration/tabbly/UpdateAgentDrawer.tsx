"use client"

import { updateCallingAgent, getAgentVoices } from '@/store/tabbly/tabbly'
import React, { useState, useEffect } from 'react'
import { BsRobot } from 'react-icons/bs'
import { GrClose } from 'react-icons/gr'
import { MdCheckCircleOutline } from 'react-icons/md'
import { HiChevronDown } from 'react-icons/hi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Voice {
    id: number;
    name: string;
    language: string;
    gender: 'Male' | 'Female' | string;
    accent: string;
    per_min_price: string | null;
    cloned: string;
}

interface UpdateAgentDrawerProps {
    agent: TabblyAgent;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormState {
    name: string;
    custom_first_line: string;
    prompt: string;
    status: 'active' | 'inactive';
    voice_id: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
    hi: 'Hindi',
    'hi-IN': 'Hindi',
    english: 'English',
    gu: 'Gujarati',
};

const formatLang = (lang: string) =>
    LANG_LABELS[lang] ?? lang.toUpperCase();

/** Group voices by display-language label */
const groupByLanguage = (voices: Voice[]) => {
    const groups: Record<string, Voice[]> = {};
    for (const v of voices) {
        const label = formatLang(v.language);
        if (!groups[label]) groups[label] = [];
        groups[label].push(v);
    }
    return groups;
};

// ─── Component ────────────────────────────────────────────────────────────────

const UpdateAgentDrawer = ({ agent, isOpen, onClose, onSuccess }: UpdateAgentDrawerProps) => {
    const [form, setForm] = useState<FormState>({
        name: agent.agent_name,
        custom_first_line: agent.custom_first_line,
        prompt: agent.prompt_text,
        status: 'active',
        voice_id: null,
    });

    const [voices, setVoices] = useState<Voice[]>([]);
    const [voicesLoading, setVoicesLoading] = useState(false);
    const [voicesError, setVoicesError] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync form + fetch voices whenever the drawer opens
    useEffect(() => {
        if (!isOpen) return;

        setForm({
            name: agent.agent_name,
            custom_first_line: agent.custom_first_line,
            prompt: agent.prompt_text,
            status: 'active',
            voice_id: null,
        });
        setError(null);
        setSuccess(false);

        // Fetch voices fresh each open so the list is always current
        setVoicesLoading(true);
        setVoicesError(false);

        getAgentVoices()
            .then((res) => {
                if (res?.success && Array.isArray(res.data)) {
                    setVoices(res.data);
                    setForm(prev => ({
                        ...prev,
                        voice_id: res.data[0]?.id ?? null, // Default to first voice if available
                    }))
                } else {
                    setVoicesError(true);
                }
            })
            .catch(() => setVoicesError(true))
            .finally(() => setVoicesLoading(false));

    }, [isOpen, agent]);

    // Derived: the Voice object currently selected
    const selectedVoice = voices.find((v) => v.id === form.voice_id) ?? null;
    const voiceGroups = groupByLanguage(voices);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'voice_id' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await updateCallingAgent(form);
            if (!res) throw new Error('Update failed. Please try again.');
            setSuccess(true);
            onSuccess();
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1400);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[var(--color-bgdark)] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/60 shrink-0'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0'>
                            <BsRobot className='text-[var(--color-primary)] w-[18px] h-[18px]' />
                        </div>
                        <div>
                            <h2 className='text-sm font-bold text-gray-900 dark:text-white leading-tight'>
                                Configure Agent
                            </h2>
                            <p className='text-xs text-gray-400 mt-0.5'>Update your Tabbly calling agent</p>
                        </div>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        aria-label='Close drawer'
                        className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer'
                    >
                        <GrClose className='w-5 h-5' />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='flex-1 flex flex-col overflow-hidden'>
                    <div className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>

                        {/* Agent Name */}
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'>
                                Agent Name <span className='text-red-400'>*</span>
                            </label>
                            <input
                                type='text'
                                name='name'
                                value={form.name}
                                onChange={handleChange}
                                placeholder='e.g. Sales Bot'
                                required
                                className='w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all'
                            />
                        </div>

                        {/* Opening Line */}
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'>
                                Opening Line
                            </label>
                            <input
                                type='text'
                                name='custom_first_line'
                                value={form.custom_first_line}
                                onChange={handleChange}
                                placeholder='e.g. Hello! This is Aria calling from...'
                                className='w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all'
                            />
                            <p className='text-xs text-gray-400 mt-1.5'>
                                The first thing your agent says when a call connects.
                            </p>
                        </div>

                        {/* Prompt */}
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'>
                                Agent Prompt <span className='text-red-400'>*</span>
                            </label>
                            <textarea
                                name='prompt'
                                value={form.prompt}
                                onChange={handleChange}
                                rows={7}
                                required
                                placeholder='Describe the agent behavior, tone, goals and restrictions...'
                                className='w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none leading-relaxed'
                            />
                        </div>

                        {/* Voice + Status — 2 col */}
                        <div className='grid grid-cols-2 gap-4'>

                            {/* ── Voice Picker ── */}
                            <div className='col-span-2'>
                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'>
                                    Agent Voice
                                </label>

                                {/* Select wrapper with custom chevron */}
                                <div className='relative'>
                                    <select
                                        name='voice_id'
                                        value={form.voice_id??""}
                                        onChange={handleChange}
                                        disabled={voicesLoading || voicesError}
                                        className='w-full appearance-none text-sm px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-white/5 dark:[color-scheme:dark] text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {voicesLoading && (
                                            <option value=''>Loading voices…</option>
                                        )}
                                        {voicesError && (
                                            <option value=''>Failed to load voices</option>
                                        )}
                                        {!voicesLoading && !voicesError && voices.length === 0 && (
                                            <option value=''>No voices available</option>
                                        )}
                                        {!voicesLoading && !voicesError &&
                                            Object.entries(voiceGroups).map(([langLabel, group]) => (
                                                <optgroup key={langLabel} label={`── ${langLabel} ──`}>
                                                    {group.map((v) => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.name} ({v.gender})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))
                                        }
                                    </select>

                                    {/* Chevron icon overlay */}
                                    <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center'>
                                        {voicesLoading ? (
                                            <span className='w-3.5 h-3.5 border-2 border-gray-300 dark:border-gray-500 border-t-[var(--color-primary)] rounded-full animate-spin' />
                                        ) : (
                                            <HiChevronDown className='w-4 h-4 text-gray-400' />
                                        )}
                                    </div>
                                </div>

                                {/* Selected voice detail pill — appears once a voice is resolved */}
                                {selectedVoice && !voicesLoading && (
                                    <div className='mt-2 flex items-center gap-2 flex-wrap'>
                                        {/* Gender badge */}
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                            selectedVoice.gender === 'Female'
                                                ? 'bg-pink-50 dark:bg-pink-900/25 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40'
                                                : 'bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                                        }`}>
                                            {selectedVoice.gender === 'Female' ? '♀' : '♂'} {selectedVoice.gender}
                                        </span>

                                        {/* Language badge */}
                                        <span className='inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'>
                                            {formatLang(selectedVoice.language)}
                                        </span>

                                        {/* Accent badge */}
                                        {selectedVoice.accent && selectedVoice.accent !== selectedVoice.per_min_price && (
                                            <span className='inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 capitalize'>
                                                {selectedVoice.accent}
                                            </span>
                                        )}

                                        {/* ID badge */}
                                        <span className='inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700/60'>
                                            ID {selectedVoice.id}
                                        </span>
                                    </div>
                                )}

                                {voicesError && (
                                    <p className='text-xs text-red-500 dark:text-red-400 mt-1.5'>
                                        Could not load voices. Voice ID will be used as-is.
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className='col-span-2'>
                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'>
                                    Status
                                </label>
                                <div className='relative'>
                                    <select
                                        name='status'
                                        value={form.status}
                                        onChange={handleChange}
                                        className='w-full appearance-none text-sm px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-white/5 dark:[color-scheme:dark] text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all cursor-pointer'
                                    >
                                        <option value='active'>Active</option>
                                        <option value='inactive'>Inactive</option>
                                    </select>
                                    <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center'>
                                        <HiChevronDown className='w-4 h-4 text-gray-400' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className='flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-3.5 py-2.5 rounded-lg'>
                                <span className='mt-0.5 shrink-0'>⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success banner */}
                        {success && (
                            <div className='flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 px-3.5 py-2.5 rounded-lg'>
                                <MdCheckCircleOutline className='w-4 h-4 shrink-0' />
                                <span>Agent updated successfully!</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className='px-6 py-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-3 shrink-0'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex-1 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading || success}
                            className='flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center gap-2'
                        >
                            {loading ? (
                                <>
                                    <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                    Saving...
                                </>
                            ) : success ? (
                                <>
                                    <MdCheckCircleOutline className='w-4 h-4' />
                                    Saved!
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UpdateAgentDrawer;