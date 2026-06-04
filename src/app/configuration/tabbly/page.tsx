"use client"

import { getCurrentAgent } from '@/store/tabbly/tabbly'
import React, { useEffect, useState } from 'react'
import { CiEdit, CiPhone, CiClock2 } from 'react-icons/ci'
import { BsRobot } from 'react-icons/bs'
import UpdateAgentDrawer from './UpdateAgentDrawer'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const AgentSkeleton = () => (
    <div className='max-w-2xl animate-pulse'>
        <div className='border border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden'>
            {/* header band */}
            <div className='h-20 bg-gray-100 dark:bg-gray-800/60 px-5 py-4 flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0' />
                <div className='space-y-2 flex-1'>
                    <div className='h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3' />
                    <div className='h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4' />
                </div>
            </div>
            {/* body */}
            <div className='px-5 py-4 space-y-3'>
                <div className='h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4' />
                <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full' />
                <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6' />
                <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6' />
            </div>
            {/* footer */}
            <div className='px-5 py-3 border-t border-gray-100 dark:border-gray-700/40 flex items-center justify-between'>
                <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4' />
                <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/5' />
            </div>
        </div>
    </div>
)

// ─── Agent Card ───────────────────────────────────────────────────────────────

interface AgentCardProps {
    agent: TabblyAgent;
    formatDateTime: (d: string) => string;
    onEdit: () => void;
}

const AgentCard = ({ agent, formatDateTime, onEdit }: AgentCardProps) => (
    <div className='max-w-2xl border border-[var(--color-primary)]/25 dark:border-[var(--color-primary)]/20 rounded-xl overflow-hidden shadow-sm'>

        {/* — Header band — */}
        <div className='bg-[var(--color-primary)]/8 dark:bg-[var(--color-primary)]/15 px-5 py-4 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
                <div className='w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 dark:bg-[var(--color-primary)]/25 flex items-center justify-center shrink-0'>
                    <BsRobot className='text-[var(--color-primary)] w-5 h-5' />
                </div>
                <div className='min-w-0'>
                    <h2 className='text-base font-bold text-[var(--color-primary)] tracking-wide truncate'>
                        {agent.agent_name.toUpperCase()}
                    </h2>
                    {agent.phone_number && (
                        <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5'>
                            <CiPhone className='w-3.5 h-3.5 shrink-0' />
                            <span>{agent.phone_number}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Animated active badge */}
            <span className='flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0'>
                <span className='relative flex h-2 w-2'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75' />
                    <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500' />
                </span>
                Active
            </span>
        </div>

        {/* — Body — */}
        <div className='px-5 py-4 space-y-4'>

            {/* Opening line */}
            {agent.custom_first_line && (
                <div>
                    <p className='text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5'>
                        Opening Line
                    </p>
                    <p className='text-sm text-gray-700 dark:text-gray-300 italic bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10 px-3.5 py-2.5 rounded-lg border-l-[3px] border-[var(--color-primary)]/50 leading-relaxed'>
                        &ldquo;{agent.custom_first_line}&rdquo;
                    </p>
                </div>
            )}

            {/* Prompt */}
            <div>
                <p className='text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5'>
                    Agent Prompt
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed'>
                    {agent.prompt_text}
                </p>
            </div>
        </div>

        {/* — Footer — */}
        <div className='px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-3'>
            <p className='text-xs text-gray-400 flex items-center gap-1.5 shrink-0'>
                <CiClock2 className='w-3.5 h-3.5' />
                {formatDateTime(agent.created_time)}
            </p>
            <button
                onClick={onEdit}
                className='flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer shrink-0'
            >
                <CiEdit className='w-4 h-4' />
                Configure Agent
            </button>
        </div>
    </div>
)

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4'>
            <BsRobot className='w-7 h-7 text-gray-300 dark:text-gray-600' />
        </div>
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>No agent found</p>
        <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>Your Tabbly agent will appear here once configured.</p>
    </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
    const [agent, setAgent] = useState<TabblyAgent | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString.replace(' ', 'T'))
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    const fetchCurrentAgent = async () => {
        setLoading(true)
        const res = await getCurrentAgent()
        setAgent(res?.data?.[0] ?? null)
        setLoading(false)
    }

    useEffect(() => {
        fetchCurrentAgent()
    }, [])

    return (
        <div className='p-6 max-md:p-4 bg-white dark:bg-[var(--color-bgdark)] rounded-md'>

            {/* Page header */}
            <div className='mb-7'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Tabbly Configuration
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    Manage your AI calling agent settings
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <AgentSkeleton />
            ) : agent ? (
                <AgentCard
                    agent={agent}
                    formatDateTime={formatDateTime}
                    onEdit={() => setIsEditOpen(true)}
                />
            ) : (
                <EmptyState />
            )}

            {/* Edit drawer — rendered outside card so it overlays the full viewport */}
            {agent && (
                <UpdateAgentDrawer
                    agent={agent}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={fetchCurrentAgent}
                />
            )}
        </div>
    )
}

export default Page