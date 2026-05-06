"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { dataMining } from '@/store/customer'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface MiningData {
  summary:            { overview: string; conversionHealth: string }
  kpis: {
    totalLeads7d:     number
    totalLeads30d:    number
    totalLeads:       number
    conversionRate:   number
    topCampaign:      string
    topCity:          string
  }
  topPerformers: {
    campaign: { name: string; leads: number; conversions: number | null; conversionRate: number | null }
    city:     { name: string; leads: number }
  }
  funnelAnalysis:     { hot: number; warm: number; cold: number; dominantStage: string }
  engagementAnalysis: { avgFollowupsPerLead: number; avgCallsPerLead: number; engagementQuality: string }
  budgetAnalysis:     { topSegment: string; distribution: Record<string, number> }
  problems:           { id: string; title: string; impact: string }[]
  actions:            { id: string; priority: string; title: string; description: string }[]
}

type TabKey = 'overview' | 'funnel' | 'problems' | 'actions'
type Phase  = 'idle' | 'analyzing' | 'done'

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TABS = [
  { key: 'overview' as TabKey, label: 'Overview',  color: '#0369a1', bg: 'rgba(3,105,161,0.07)'   },
  { key: 'funnel'   as TabKey, label: 'Funnel',    color: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
  { key: 'problems' as TabKey, label: 'Problems',  color: '#dc2626', bg: 'rgba(220,38,38,0.07)'   },
  { key: 'actions'  as TabKey, label: 'Actions',   color: '#059669', bg: 'rgba(5,150,105,0.07)'   },
] as const

const STEPS = [
  { label: 'Connecting to lead database',   sub: 'Fetching all lead records…'           },
  { label: 'Scanning behavioural patterns', sub: 'Analysing source, geo, budget data…'  },
  { label: 'Evaluating conversion funnel',  sub: 'Mapping cold → warm → hot flow…'      },
  { label: 'Assessing risk exposure',       sub: 'Checking single points of failure…'   },
  { label: 'Generating recommendations',    sub: 'Prioritising findings by impact…'     },
]

const SCAN_CHIPS = [
  '2,608 leads', 'Jaipur', 'Agent campaign',
  '0-20L segment', '4.5× avg calls', 'Cold stage',
  'Funnel gaps', 'Budget spread',
]

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  High:   { bg: 'rgba(220,38,38,0.08)',  color: '#b91c1c' },
  Medium: { bg: 'rgba(217,119,6,0.09)',  color: '#92400e' },
  Low:    { bg: 'rgba(5,150,105,0.08)',  color: '#065f46' },
}

const HEALTH_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  Poor:  { bg: 'rgba(220,38,38,0.08)',  color: '#b91c1c', dot: '#ef4444' },
  Fair:  { bg: 'rgba(217,119,6,0.09)',  color: '#92400e', dot: '#f59e0b' },
  Good:  { bg: 'rgba(5,150,105,0.08)',  color: '#065f46', dot: '#10b981' },
  Great: { bg: 'rgba(5,150,105,0.08)',  color: '#065f46', dot: '#10b981' },
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtTime  = (d: Date | null) =>
  d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const nullFmt = (v: number | null | undefined, suffix = '') =>
  v == null ? '—' : `${v}${suffix}`

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : ''

/* ─────────────────────────────────────────────
   EXPORT UTILITIES
───────────────────────────────────────────── */

/** Export all report data to an XLSX workbook — one clean table per sheet,
 *  column headers always in row 1, data rows from row 2 onwards.          */
const exportToExcel = async (data: MiningData, lastAnalyzed: Date | null) => {
  const XLSXmod = await import('xlsx')
  const XLSX    = (XLSXmod as any).default ?? XLSXmod

  const wb = XLSX.utils.book_new()

  const makeSheet = (headers: string[], rows: (string | number)[][], colWidths: number[]) => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = colWidths.map(wch => ({ wch }))
    return ws
  }

  const { hot, warm, cold } = data.funnelAnalysis
  const funnelTotal  = hot + warm + cold
  const budgetEntries = Object.entries(data.budgetAnalysis.distribution)
  const budgetTotal  = budgetEntries.reduce((s, [, v]) => s + v, 0)
  const reportDate   = `${fmtDate(lastAnalyzed)} ${fmtTime(lastAnalyzed)}`

  /* ── Sheet 1: KPIs ─────────────────────────────────────────────────────
     One flat table.  Every row is one metric.
  ──────────────────────────────────────────────────────────────────────── */
  XLSX.utils.book_append_sheet(wb,
    makeSheet(
      ['Report Date', 'Section', 'Metric', 'Value', 'Notes'],
      [
        [reportDate, 'Summary',       'Conversion Health',      data.summary.conversionHealth, ''],
        [reportDate, 'Summary',       'Overview',               data.summary.overview,         ''],
        [reportDate, 'KPIs',          'Leads (Last 7 Days)',     data.kpis.totalLeads7d,        ''],
        [reportDate, 'KPIs',          'Leads (Last 30 Days)',    data.kpis.totalLeads30d,       ''],
        [reportDate, 'KPIs',          'Total Leads (All Time)',  data.kpis.totalLeads,          ''],
        [reportDate, 'KPIs',          'Conversion Rate (%)',     data.kpis.conversionRate,      data.kpis.conversionRate === 0 ? 'No conversions recorded' : ''],
        [reportDate, 'KPIs',          'Top Campaign',            data.kpis.topCampaign,         ''],
        [reportDate, 'KPIs',          'Top City',                data.kpis.topCity,             ''],
        [reportDate, 'Top Performer', 'Best Campaign Name',      data.topPerformers.campaign.name,   ''],
        [reportDate, 'Top Performer', 'Best Campaign Leads',     data.topPerformers.campaign.leads,  ''],
        [reportDate, 'Top Performer', 'Best Campaign Conversions', data.topPerformers.campaign.conversions ?? 'N/A', ''],
        [reportDate, 'Top Performer', 'Best Campaign Conv. Rate (%)', data.topPerformers.campaign.conversionRate ?? 'N/A', ''],
        [reportDate, 'Top Performer', 'Top City Name',           data.topPerformers.city.name,  ''],
        [reportDate, 'Top Performer', 'Top City Leads',          data.topPerformers.city.leads, ''],
      ],
      [22, 16, 32, 42, 28],
    ),
    'KPIs',
  )

  /* ── Sheet 2: Funnel Stages ────────────────────────────────────────────
     One row per funnel stage.
  ──────────────────────────────────────────────────────────────────────── */
  XLSX.utils.book_append_sheet(wb,
    makeSheet(
      ['Stage', 'Lead Count', 'Percentage (%)', 'Is Dominant Stage'],
      [
        ['Hot',  hot,  Math.round((hot  / funnelTotal) * 100), data.funnelAnalysis.dominantStage === 'Hot'  ? 'Yes' : 'No'],
        ['Warm', warm, Math.round((warm / funnelTotal) * 100), data.funnelAnalysis.dominantStage === 'Warm' ? 'Yes' : 'No'],
        ['Cold', cold, Math.round((cold / funnelTotal) * 100), data.funnelAnalysis.dominantStage === 'Cold' ? 'Yes' : 'No'],
      ],
      [14, 14, 18, 20],
    ),
    'Funnel Stages',
  )

  /* ── Sheet 3: Engagement & Budget ─────────────────────────────────────
     One row per metric/segment.  A "Category" column separates the two
     logical groups without breaking the single-table structure.
  ──────────────────────────────────────────────────────────────────────── */
  XLSX.utils.book_append_sheet(wb,
    makeSheet(
      ['Category', 'Metric / Segment', 'Value', 'Unit / Notes'],
      [
        ['Engagement', 'Avg Follow-ups per Lead',    data.engagementAnalysis.avgFollowupsPerLead, 'times'],
        ['Engagement', 'Avg Calls per Lead',          data.engagementAnalysis.avgCallsPerLead,      'times'],
        ['Engagement', 'Engagement Quality',          data.engagementAnalysis.engagementQuality,    'rating'],
        ...budgetEntries.map(([seg, cnt]) => [
          'Budget',
          seg,
          cnt,
          `${Math.round((cnt / budgetTotal) * 100)}% of total${seg === data.budgetAnalysis.topSegment ? ' — Top Segment' : ''}`,
        ] as (string | number)[]),
      ],
      [14, 28, 12, 36],
    ),
    'Engagement & Budget',
  )

  /* ── Sheet 4: Problems ─────────────────────────────────────────────────
     One row per problem.
  ──────────────────────────────────────────────────────────────────────── */
  XLSX.utils.book_append_sheet(wb,
    makeSheet(
      ['#', 'Problem ID', 'Title', 'Impact / Description'],
      data.problems.map((p, i) => [i + 1, p.id, p.title, p.impact]),
      [5, 14, 40, 70],
    ),
    'Problems',
  )

  /* ── Sheet 5: Actions ──────────────────────────────────────────────────
     One row per action.
  ──────────────────────────────────────────────────────────────────────── */
  XLSX.utils.book_append_sheet(wb,
    makeSheet(
      ['#', 'Action ID', 'Priority', 'Title', 'Description'],
      data.actions.map((a, i) => [i + 1, a.id, a.priority, a.title, a.description]),
      [5, 14, 12, 40, 70],
    ),
    'Actions',
  )

  /* ── Download ── */
  const ts = lastAnalyzed
    ? `${lastAnalyzed.getFullYear()}${String(lastAnalyzed.getMonth() + 1).padStart(2, '0')}${String(lastAnalyzed.getDate()).padStart(2, '0')}`
    : 'report'
  XLSX.writeFile(wb, `CRM_Analytics_${ts}.xlsx`)
}

/** Export all report data to a PDF using jsPDF + jspdf-autotable */
const exportToPDF = async (data: MiningData, lastAnalyzed: Date | null) => {
  const { default: jsPDF }   = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PRIMARY  = [3, 105, 161]   as [number, number, number]
  const PURPLE   = [124, 58, 237]  as [number, number, number]
  const RED      = [220, 38, 38]   as [number, number, number]
  const GREEN    = [5, 150, 105]   as [number, number, number]
  const DARK     = [30, 41, 59]    as [number, number, number]
  const MUTED    = [100, 116, 139] as [number, number, number]
  const BG_LIGHT = [248, 250, 252] as [number, number, number]
  const W        = 210
  const MARGIN   = 14

  /* Helper to draw a section heading */
  const sectionHeading = (text: string, y: number, color: [number, number, number]) => {
    doc.setFillColor(...color)
    doc.rect(MARGIN, y, 4, 5, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...color)
    doc.text(text, MARGIN + 7, y + 4)
    return y + 11
  }

  /* ─────────── PAGE 1: Cover ─────────── */
  // Gradient-like header band
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, W, 46, 'F')
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 40, W, 6, 'F')

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('CRM Analytics Report', MARGIN, 22)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(186, 230, 253)
  doc.text(`Generated on ${fmtDate(lastAnalyzed)} at ${fmtTime(lastAnalyzed)}`, MARGIN, 32)

  // Health badge
  const health = data.summary.conversionHealth
  const healthColor: [number, number, number] =
    health === 'Good' || health === 'Great' ? GREEN : health === 'Fair' ? [217, 119, 6] : RED
  doc.setFillColor(...BG_LIGHT)
  doc.roundedRect(MARGIN, 52, W - MARGIN * 2, 22, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...healthColor)
  doc.text(`Conversion Health: ${health}`, MARGIN + 5, 61)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  const overviewLines = doc.splitTextToSize(data.summary.overview, W - MARGIN * 2 - 10)
  doc.text(overviewLines.slice(0, 2), MARGIN + 5, 68)

  /* ── KPI Grid (2×2) ── */
  let y = 82
  y = sectionHeading('Key Metrics', y, PRIMARY)

  const kpis = [
    { label: 'Leads (Last 7 days)',  value: String(data.kpis.totalLeads7d),           color: PRIMARY },
    { label: 'Leads (Last 30 days)', value: data.kpis.totalLeads30d.toLocaleString(), color: PURPLE  },
    { label: 'Total Leads',          value: data.kpis.totalLeads.toLocaleString(),     color: PRIMARY },
    { label: 'Conversion Rate',      value: `${data.kpis.conversionRate}%`,
      color: data.kpis.conversionRate === 0 ? RED : GREEN },
  ]
  const cellW = (W - MARGIN * 2 - 6) / 2
  kpis.forEach((k, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cx  = MARGIN + col * (cellW + 6)
    const cy  = y + row * 24

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(cx, cy, cellW, 20, 2, 2, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.roundedRect(cx, cy, cellW, 20, 2, 2, 'S')

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(k.label, cx + 4, cy + 6)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...k.color)
    doc.text(k.value, cx + 4, cy + 15)
  })
  y += 54

  /* ── Top Performers ── */
  y = sectionHeading('Top Performers', y, PRIMARY)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Type', 'Name', 'Leads', 'Conversions', 'Conv. Rate']],
    body: [
      ['Best Campaign',
        data.topPerformers.campaign.name,
        String(data.topPerformers.campaign.leads),
        String(data.topPerformers.campaign.conversions ?? '—'),
        nullFmt(data.topPerformers.campaign.conversionRate, '%'),
      ],
      ['Top City', data.topPerformers.city.name, String(data.topPerformers.city.leads), '—', '—'],
    ],
    headStyles:  { fillColor: PRIMARY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles:  { fontSize: 8, textColor: DARK },
    alternateRowStyles: { fillColor: BG_LIGHT },
    styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  /* ─────────── PAGE 2: Funnel & Engagement ─────────── */
  doc.addPage()
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, W, 14, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Funnel & Engagement Analysis', MARGIN, 9.5)
  y = 22

  /* Lead stages table */
  const { hot, warm, cold } = data.funnelAnalysis
  const total = hot + warm + cold
  y = sectionHeading('Lead Stage Distribution', y, PURPLE)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Stage', 'Count', '% of Total', 'Status']],
    body: [
      ['🔴 Hot',  hot.toLocaleString(),  `${Math.round((hot  / total) * 100)}%`, 'High Intent'],
      ['🟡 Warm', warm.toLocaleString(), `${Math.round((warm / total) * 100)}%`, 'Nurturing'],
      ['🔵 Cold', cold.toLocaleString(), `${Math.round((cold / total) * 100)}%`, 'Early Stage'],
      ['Total', total.toLocaleString(), '100%', `Dominant: ${data.funnelAnalysis.dominantStage}`],
    ],
    headStyles:  { fillColor: PURPLE, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles:  { fontSize: 8, textColor: DARK },
    alternateRowStyles: { fillColor: BG_LIGHT },
    styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  /* Engagement */
  y = sectionHeading('Engagement Metrics', y, PURPLE)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Metric', 'Value']],
    body: [
      ['Average Follow-ups per Lead', `${data.engagementAnalysis.avgFollowupsPerLead}×`],
      ['Average Calls per Lead',      `${data.engagementAnalysis.avgCallsPerLead}×`],
      ['Engagement Quality',          data.engagementAnalysis.engagementQuality],
    ],
    headStyles:  { fillColor: PURPLE, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles:  { fontSize: 8, textColor: DARK },
    alternateRowStyles: { fillColor: BG_LIGHT },
    columnStyles: { 0: { fontStyle: 'bold' } },
    styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  /* Budget */
  y = sectionHeading('Budget Segment Distribution', y, PURPLE)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Budget Segment', 'Lead Count', 'Top Segment']],
    body: Object.entries(data.budgetAnalysis.distribution).map(([seg, cnt]) => [
      seg, cnt.toLocaleString(), seg === data.budgetAnalysis.topSegment ? '✓ Yes' : '',
    ]),
    headStyles:  { fillColor: PURPLE, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles:  { fontSize: 8, textColor: DARK },
    alternateRowStyles: { fillColor: BG_LIGHT },
    styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2 },
  })

  /* ─────────── PAGE 3: Problems ─────────── */
  doc.addPage()
  doc.setFillColor(...RED)
  doc.rect(0, 0, W, 14, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(`Identified Problems  (${data.problems.length} issues)`, MARGIN, 9.5)
  y = 22

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'Problem ID', 'Title', 'Impact / Description']],
    body: data.problems.map((p, i) => [i + 1, p.id, p.title, p.impact]),
    headStyles:  { fillColor: RED, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles:  { fontSize: 7.5, textColor: DARK },
    alternateRowStyles: { fillColor: [255, 245, 245] as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 55, fontStyle: 'bold' },
      3: { cellWidth: 97 },
    },
    styles: { cellPadding: 3.5, lineColor: [226, 232, 240], lineWidth: 0.2, overflow: 'linebreak' },
  })

  /* ─────────── PAGE 4: Actions ─────────── */
  doc.addPage()
  doc.setFillColor(...GREEN)
  doc.rect(0, 0, W, 14, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(`Recommended Actions  (${data.actions.length} items)`, MARGIN, 9.5)
  y = 22

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'ID', 'Priority', 'Title', 'Description']],
    body: data.actions.map((a, i) => [i + 1, a.id, a.priority, a.title, a.description]),
    headStyles:  { fillColor: GREEN, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles:  { fontSize: 7.5, textColor: DARK },
    alternateRowStyles: { fillColor: [240, 253, 244] as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 16 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 48, fontStyle: 'bold' },
      4: { cellWidth: 88 },
    },
    didDrawCell: (hookData: any) => {
      if (hookData.section === 'body' && hookData.column.index === 2) {
        const priority = hookData.cell.raw as string
        const colors: Record<string, [number, number, number]> = {
          High: [220, 38, 38], Medium: [217, 119, 6], Low: [5, 150, 105],
        }
        doc.setTextColor(...(colors[priority] ?? colors.Low))
        doc.setFont('helvetica', 'bold')
        doc.text(
          priority,
          hookData.cell.x + hookData.cell.width / 2,
          hookData.cell.y + hookData.cell.height / 2 + 1,
          { align: 'center' },
        )
      }
    },
    styles: { cellPadding: 3.5, lineColor: [226, 232, 240], lineWidth: 0.2, overflow: 'linebreak' },
  })

  /* ── Footer on every page ── */
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(
      `CRM Analytics Report  ·  ${fmtDate(lastAnalyzed)}  ·  Page ${i} of ${pageCount}`,
      W / 2, 290, { align: 'center' },
    )
  }

  const ts = lastAnalyzed
    ? `${lastAnalyzed.getFullYear()}${String(lastAnalyzed.getMonth() + 1).padStart(2, '0')}${String(lastAnalyzed.getDate()).padStart(2, '0')}`
    : 'report'
  doc.save(`CRM_Analytics_${ts}.pdf`)
}

/* ─────────────────────────────────────────────
   EXPORT BUTTON (dropdown)
───────────────────────────────────────────── */
const ExportButton = ({
  data,
  lastAnalyzed,
}: {
  data: MiningData
  lastAnalyzed: Date | null
}) => {
  const [open,         setOpen]         = useState(false)
  const [exporting,    setExporting]    = useState<'pdf' | 'excel' | null>(null)
  const [toast,        setToast]        = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleExport = async (type: 'pdf' | 'excel') => {
    setOpen(false)
    setExporting(type)
    try {
      if (type === 'pdf')   await exportToPDF(data, lastAnalyzed)
      if (type === 'excel') await exportToExcel(data, lastAnalyzed)
      showToast(type === 'pdf' ? '✓ PDF downloaded' : '✓ Excel downloaded')
    } catch (err) {
      console.error('Export error:', err)
      showToast('Export failed — check console')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div ref={dropRef} className="relative">
      {/* Toast */}
      {toast && (
        <div
          className="absolute z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium text-white"
          style={{
            bottom: 42, right: 0,
            background: toast.startsWith('✓') ? '#059669' : '#dc2626',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'dm-chip-in .25s ease both',
          }}
        >
          {toast}
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        disabled={!!exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold active:scale-95"
        style={{
          background: exporting ? '#e2e8f0' : open ? '#1e3a5f' : '#0f4c75',
          color: exporting ? '#94a3b8' : 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: exporting ? 'not-allowed' : 'pointer',
          transition: 'background 150ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        {exporting ? (
          <>
            <SpinnerIcon size={10} color="#94a3b8" />
            Exporting…
          </>
        ) : (
          <>
            <DownloadIcon />
            Export
            <ChevronIcon open={open} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 z-40 rounded-xl overflow-hidden"
          style={{
            top: 36,
            minWidth: 168,
            background: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            animation: 'dm-chip-in .18s ease both',
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
              Download Report
            </p>
          </div>
          {/* PDF option */}
          <button
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(220,38,38,0.09)' }}>
              <PdfIcon />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold text-slate-800">PDF Report</p>
              <p className="text-[9.5px] text-slate-400">4-page formatted report</p>
            </div>
          </button>
          {/* Excel option */}
          <button
            onClick={() => handleExport('excel')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(5,150,105,0.09)' }}>
              <ExcelIcon />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold text-slate-800">Excel Workbook</p>
              <p className="text-[9.5px] text-slate-400">4 sheets · all data</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const StarIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M23 20v-6h-6" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
)

const AlertIcon = ({ color }: { color: string }) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CheckIcon = ({ color }: { color: string }) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SpinnerIcon = ({ size = 14, color = '#0369a1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'dm-spin .7s linear infinite', flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
)

const DownloadIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const PdfIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#dc2626"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const ExcelIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#059669"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="10" y1="9" x2="10" y2="21" />
  </svg>
)

/* ─────────────────────────────────────────────
   BADGE
───────────────────────────────────────────── */
const Badge = ({ label, style }: { label: string; style: { bg: string; color: string; dot?: string } }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
    style={{ background: style.bg, color: style.color }}>
    {style.dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />}
    {label}
  </span>
)

/* ─────────────────────────────────────────────
   IDLE STATE
───────────────────────────────────────────── */
const IdleState = ({ onStart }: { onStart: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
      <svg width="26" height="26" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
        strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
    </div>
    <p className="text-[13.5px] font-semibold text-slate-700 mb-1.5">No analysis yet</p>
    <p className="text-[11.5px] text-slate-400 mb-6 max-w-[240px] leading-relaxed">
      Run the AI analyser to surface funnel issues, risks and action items from your CRM.
    </p>
    <button onClick={onStart}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-semibold active:scale-95"
      style={{ background: '#0369a1', border: 'none', cursor: 'pointer', transition: 'background 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#075985')}
      onMouseLeave={e => (e.currentTarget.style.background = '#0369a1')}>
      <StarIcon size={12} color="white" />
      Run analysis
    </button>
  </div>
)

/* ─────────────────────────────────────────────
   RADAR LOADER
───────────────────────────────────────────── */
const AnalyzingState = ({ currentStep }: { currentStep: number }) => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1600)
    return () => clearInterval(t)
  }, [])

  const pct        = Math.round((currentStep / STEPS.length) * 100)
  const activeStep = STEPS[Math.max(0, currentStep - 1)]
  const chip1      = SCAN_CHIPS[tick % SCAN_CHIPS.length]
  const chip2      = SCAN_CHIPS[(tick + 3) % SCAN_CHIPS.length]

  const dots = [
    { cx: 148, cy: 42,  delay: '0s'    },
    { cx: 44,  cy: 58,  delay: '0.47s' },
    { cx: 158, cy: 108, delay: '0.93s' },
    { cx: 28,  cy: 130, delay: '1.4s'  },
    { cx: 110, cy: 158, delay: '1.86s' },
    { cx: 68,  cy: 22,  delay: '2.33s' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 select-none">
      <div className="relative mb-7" style={{ width: 180, height: 180 }}>
        {[52, 74, 90].map((r, i) => (
          <div key={r} className="absolute rounded-full"
            style={{
              width: r * 2, height: r * 2, top: 90 - r, left: 90 - r,
              border: '1px solid rgba(3,105,161,0.11)',
              animation: 'dm-ring-pulse 3.4s ease-in-out infinite',
              animationDelay: `${i * 0.9}s`,
            }} />
        ))}
        <svg className="absolute inset-0" width="180" height="180" viewBox="0 0 180 180">
          <line x1="90" y1="0" x2="90" y2="180" stroke="rgba(3,105,161,0.07)" strokeWidth="1" />
          <line x1="0" y1="90" x2="180" y2="90" stroke="rgba(3,105,161,0.07)" strokeWidth="1" />
        </svg>
        <div className="absolute inset-0" style={{ animation: 'dm-radar-spin 2.8s linear infinite' }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <radialGradient id="sweepG" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#0369a1" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0"    />
              </radialGradient>
            </defs>
            <path d="M90,90 L90,0 A90,90 0 0,1 173.2,45 Z" fill="url(#sweepG)" />
            <line x1="90" y1="90" x2="90" y2="0"
              stroke="#0369a1" strokeWidth="1.2" strokeOpacity="0.4" />
          </svg>
        </div>
        {dots.map((d, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: 6, height: 6, left: d.cx - 3, top: d.cy - 3,
              background: '#0369a1',
              animation: 'dm-dot-blink 2.8s ease-in-out infinite',
              animationDelay: d.delay,
            }} />
        ))}
        <div className="absolute flex items-center justify-center rounded-full"
          style={{
            width: 44, height: 44, top: 68, left: 68,
            background: 'rgba(3,105,161,0.07)',
            border: '1px solid rgba(3,105,161,0.18)',
            animation: 'dm-core-pulse 2.2s ease-in-out infinite',
          }}>
          <div className="rounded-full" style={{ width: 12, height: 12, background: '#0369a1', opacity: 0.65 }} />
        </div>
      </div>
      <p className="text-[13.5px] font-semibold text-slate-800 mb-1 text-center">Scanning your CRM</p>
      <p className="text-[11.5px] text-slate-400 mb-5 text-center" style={{ minHeight: 18 }}>
        {activeStep?.label ?? 'Processing…'}
      </p>
      <div className="flex gap-2 mb-6" style={{ height: 28 }}>
        {[chip1, chip2].map((chip, i) => (
          <span key={`${chip}-${tick}-${i}`}
            className="px-2.5 py-1 rounded-full text-[10.5px] font-medium"
            style={{
              background: 'rgba(3,105,161,0.06)',
              border: '1px solid rgba(3,105,161,0.14)',
              color: '#0369a1',
              animation: 'dm-chip-in 0.35s ease both',
              animationDelay: `${i * 90}ms`,
            }}>
            {chip}
          </span>
        ))}
      </div>
      <div className="w-full" style={{ maxWidth: 256 }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-400">Step {currentStep} of {STEPS.length}</span>
          <span className="text-[10px] font-semibold" style={{ color: '#0369a1' }}>{pct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
          <div className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #0369a1, #7c3aed)',
              transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)',
            }} />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAB: OVERVIEW
───────────────────────────────────────────── */
const OverviewTab = ({ data }: { data: MiningData }) => {
  const health = data.summary.conversionHealth
  const hs     = HEALTH_STYLE[health] ?? HEALTH_STYLE.Poor
  const total  = data.funnelAnalysis.hot + data.funnelAnalysis.warm + data.funnelAnalysis.cold

  const kpis = [
    { label: 'Leads (7d)',  value: String(data.kpis.totalLeads7d),              color: '#0369a1' },
    { label: 'Leads (30d)', value: data.kpis.totalLeads30d.toLocaleString(),    color: '#7c3aed' },
    { label: 'Total leads', value: data.kpis.totalLeads.toLocaleString(),       color: '#0369a1' },
    { label: 'Conv. rate',  value: `${data.kpis.conversionRate}%`,
      color: data.kpis.conversionRate === 0 ? '#dc2626' : '#059669' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
      <div className="rounded-xl border p-4"
        style={{ background: hs.bg, borderColor: `${hs.dot}28` }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertIcon color={hs.color} />
          <span className="text-[11.5px] font-semibold" style={{ color: hs.color }}>
            Conversion health · {health}
          </span>
          <Badge label={health} style={hs} />
        </div>
        <p className="text-[11.5px] leading-relaxed" style={{ color: '#475569' }}>
          {data.summary.overview}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-100 rounded-xl p-3.5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-[10px] text-slate-400 mb-1.5">{k.label}</p>
            <p className="text-[20px] font-bold leading-none" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Top performers</p>
        <div className="flex flex-col gap-2">
          <div className="bg-white border border-slate-100 rounded-xl p-3.5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10.5px] text-slate-400">Best campaign</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(3,105,161,0.07)', color: '#0369a1' }}>
                {data.topPerformers.campaign.name}
              </span>
            </div>
            <div className="flex gap-4">
              {([
                ['Leads',       String(data.topPerformers.campaign.leads)],
                ['Conversions', nullFmt(data.topPerformers.campaign.conversions)],
                ['Conv. rate',  nullFmt(data.topPerformers.campaign.conversionRate, '%')],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l}>
                  <p className="text-[9.5px] text-slate-400 mb-0.5">{l}</p>
                  <p className="text-[13.5px] font-semibold"
                    style={{ color: v === '—' ? '#cbd5e1' : '#334155' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-3.5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] text-slate-400">Top city</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(5,150,105,0.07)', color: '#059669' }}>
                {data.topPerformers.city.name}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400">
              {data.topPerformers.city.leads.toLocaleString()} leads ·{' '}
              {Math.round((data.topPerformers.city.leads / total) * 100)}% of total
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAB: FUNNEL
───────────────────────────────────────────── */
const FunnelTab = ({ data }: { data: MiningData }) => {
  const { hot, warm, cold } = data.funnelAnalysis
  const total = hot + warm + cold

  const stages = [
    { label: 'Hot',  count: hot,  color: '#dc2626', bar: '#f87171' },
    { label: 'Warm', count: warm, color: '#d97706', bar: '#fbbf24' },
    { label: 'Cold', count: cold, color: '#0369a1', bar: '#7dd3fc' },
  ]

  const budgetEntries = Object.entries(data.budgetAnalysis.distribution)
  const maxBudget     = Math.max(...budgetEntries.map(([, v]) => v))

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Lead stages</p>
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {stages.map((s, i) => {
            const pct = Math.round((s.count / total) * 100)
            return (
              <div key={s.label} className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: i < stages.length - 1 ? '0.5px solid #f8fafc' : 'none' }}>
                <span className="text-[11px] font-semibold flex-shrink-0"
                  style={{ width: 30, color: s.color }}>{s.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${pct}%`, background: s.bar,
                      transition: 'width 800ms cubic-bezier(0.4,0,0.2,1)',
                    }} />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-right" style={{ width: 44 }}>
                  {s.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 text-right" style={{ width: 30 }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Engagement</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Avg follow-ups', value: `${data.engagementAnalysis.avgFollowupsPerLead}×` },
            { label: 'Avg calls',      value: `${data.engagementAnalysis.avgCallsPerLead}×`      },
            { label: 'Quality',        value: data.engagementAnalysis.engagementQuality           },
          ].map(e => (
            <div key={e.label} className="bg-white border border-slate-100 rounded-xl p-3 text-center"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-[9.5px] text-slate-400 mb-1.5">{e.label}</p>
              <p className="text-[14px] font-bold text-slate-700">{e.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Budget distribution</p>
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col gap-3"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {budgetEntries.map(([seg, count]) => {
            const pct   = Math.round((count / maxBudget) * 100)
            const isTop = seg === data.budgetAnalysis.topSegment
            return (
              <div key={seg} className="flex items-center gap-3">
                <span className="text-[10.5px] text-slate-500 flex-shrink-0" style={{ width: 56 }}>{seg}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: isTop ? '#0369a1' : '#cbd5e1' }} />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-600 text-right" style={{ width: 20 }}>
                  {count}
                </span>
                {isTop && <Badge label="Top" style={{ bg: 'rgba(3,105,161,0.08)', color: '#075985' }} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAB: PROBLEMS
───────────────────────────────────────────── */
const ProblemsTab = ({ data }: { data: MiningData }) => (
  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
    {data.problems.map((p, i) => (
      <div key={p.id}
        className="bg-white border border-slate-100 rounded-xl p-4"
        style={{
          borderLeft: '2.5px solid #f87171',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          animation: 'dm-cardstream .38s ease both',
          animationDelay: `${i * 75}ms`,
        }}>
        <div className="flex items-start gap-2 mb-2">
          <AlertIcon color="#dc2626" />
          <p className="text-[12.5px] font-semibold text-slate-800 leading-snug">{p.title}</p>
        </div>
        <p className="text-[11.5px] leading-relaxed pl-5" style={{ color: '#64748b' }}>{p.impact}</p>
        <p className="text-[9.5px] font-bold uppercase tracking-widest mt-3 pl-5" style={{ color: '#fca5a5' }}>
          Problem {p.id}
        </p>
      </div>
    ))}
  </div>
)

/* ─────────────────────────────────────────────
   TAB: ACTIONS
───────────────────────────────────────────── */
const ActionsTab = ({ data }: { data: MiningData }) => (
  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
    {data.actions.map((a, i) => {
      const ps = PRIORITY_STYLE[a.priority] ?? PRIORITY_STYLE.Low
      return (
        <div key={a.id}
          className="bg-white border border-slate-100 rounded-xl p-4"
          style={{
            borderLeft: '2.5px solid #6ee7b7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            animation: 'dm-cardstream .38s ease both',
            animationDelay: `${i * 75}ms`,
          }}>
          <div className="flex items-start gap-2 mb-2">
            <CheckIcon color="#059669" />
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-slate-800 leading-snug">{a.title}</p>
              <Badge label={a.priority} style={ps} />
            </div>
          </div>
          <p className="text-[11.5px] leading-relaxed pl-5" style={{ color: '#64748b' }}>{a.description}</p>
          <p className="text-[9.5px] font-bold uppercase tracking-widest mt-3 pl-5" style={{ color: '#6ee7b7' }}>
            Action {a.id}
          </p>
        </div>
      )
    })}
  </div>
)

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const AnalyticsAgentWorkspace = ({ isOpen }: { isOpen: boolean }) => {
  const [phase,        setPhase]        = useState<Phase>('idle')
  const [data,         setData]         = useState<MiningData | null>(null)
  const [activeTab,    setActiveTab]    = useState<TabKey>('overview')
  const [currentStep,  setCurrentStep]  = useState(0)
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }

  const runAnalysis = useCallback(async () => {
    clearTimers()
    setPhase('analyzing')
    setCurrentStep(0)

    STEPS.forEach((_, i) => {
      const t = setTimeout(() => setCurrentStep(i + 1), i * 850 + 600)
      timersRef.current.push(t)
    })

    let result: any = null
    try { result = await dataMining() } catch (e) { console.error(e) }

    const totalAnim = STEPS.length * 850 + 800
    const t = setTimeout(() => {
      if (result?.data) setData(result.data as MiningData)
      setLastAnalyzed(new Date())
      setPhase('done')
    }, totalAnim)
    timersRef.current.push(t)
  }, [])

  useEffect(() => {
    if (isOpen && phase === 'idle') runAnalysis()
    return () => clearTimers()
  }, [isOpen])

  const sidebarStats: [string, string][] = data ? [
    ['Leads (7d)',  String(data.kpis.totalLeads7d)],
    ['Leads (30d)', data.kpis.totalLeads30d.toLocaleString()],
    ['Conv. rate',  `${data.kpis.conversionRate}%`],
    ['Top city',    data.kpis.topCity],
  ] : [
    ['Leads (7d)', '—'], ['Leads (30d)', '—'], ['Conv. rate', '—'], ['Top city', '—'],
  ]

  const tabCount = (key: TabKey): number => {
    if (!data) return 0
    if (key === 'overview')  return 4
    if (key === 'funnel')    return 3
    if (key === 'problems')  return data.problems.length
    if (key === 'actions')   return data.actions.length
    return 0
  }

  const tab = TABS.find(t => t.key === activeTab)!

  return (
    <div className="flex h-full overflow-hidden rounded-xl" style={{ background: '#f8fafc' }}>

      {/* ══ SIDEBAR ══ */}
      <div className="flex flex-col border-r"
        style={{ width: 204, minWidth: 204, borderColor: '#eaecf0', background: '#fff' }}>
        <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: '0.5px solid #f1f5f9' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(3,105,161,0.1)' }}>
              <svg width="13" height="13" fill="none" stroke="#0369a1" viewBox="0 0 24 24"
                strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Mining</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={
              phase === 'analyzing' ? { background: '#f0f9ff', border: '1px solid #bae6fd' } :
              phase === 'done'      ? { background: '#f0fdf4', border: '1px solid #bbf7d0' } :
                                      { background: '#f8fafc', border: '1px solid #e2e8f0' }
            }>
            {phase === 'analyzing'
              ? <SpinnerIcon size={7} color="#0369a1" />
              : phase === 'done'
              ? <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                  style={{ boxShadow: '0 0 0 2.5px rgba(34,197,94,0.2)' }} />
              : <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
            }
            <span className="text-[10.5px] font-medium"
              style={{ color: phase === 'analyzing' ? '#0369a1' : phase === 'done' ? '#166534' : '#94a3b8' }}>
              {phase === 'analyzing' ? 'Scanning…' : phase === 'done' ? `Done · ${fmtTime(lastAnalyzed)}` : 'Ready'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <div className="px-2 pt-2 flex-1">
          {TABS.map(t => {
            const active = t.key === activeTab
            return (
              <button key={t.key}
                onClick={() => phase === 'done' && setActiveTab(t.key)}
                className="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 mb-0.5"
                style={{
                  background: active ? t.bg : 'transparent',
                  color:      active ? t.color : '#64748b',
                  cursor:     phase === 'done' ? 'pointer' : 'default',
                  border:     'none',
                  opacity:    phase === 'analyzing' ? 0.45 : 1,
                  transition: 'background 120ms, color 120ms',
                }}>
                <span className="text-[12px] font-medium flex-1">{t.label}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(255,255,255,0.65)' : '#f1f5f9',
                    color:      active ? t.color : '#94a3b8',
                  }}>
                  {phase === 'done' ? tabCount(t.key) : '—'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick stats */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '0.5px solid #f1f5f9' }}>
          <div className="rounded-lg p-3" style={{ background: '#f8fafc' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quick stats</p>
            {sidebarStats.map(([k, v]) => (
              <div key={k} className="flex justify-between items-center mb-1.5 last:mb-0">
                <span className="text-[10px] text-slate-400">{k}</span>
                <span className="text-[10.5px] font-semibold"
                  style={{ color: phase === 'done' ? '#334155' : '#cbd5e1' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN PANEL ══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {phase === 'idle'      && <IdleState onStart={runAnalysis} />}
        {phase === 'analyzing' && <AnalyzingState currentStep={currentStep} />}
        {phase === 'done' && data && (
          <>
            {/* Top bar */}
            <div className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3"
              style={{ background: '#fff', borderColor: '#eaecf0' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: tab.bg }}>
                <StarIcon size={13} color={tab.color} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{tab.label}</p>
                <p className="text-[10.5px] text-slate-400">{tabCount(activeTab)} items · {fmtTime(lastAnalyzed)}</p>
              </div>
              {/* Action buttons */}
              <div className="ml-auto flex items-center gap-2">
                <ExportButton data={data} lastAnalyzed={lastAnalyzed} />
                <button onClick={runAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold active:scale-95"
                  style={{ background: '#0369a1', border: 'none', cursor: 'pointer', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#075985')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0369a1')}>
                  <RefreshIcon />
                  Re-analyse
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'overview'  && <OverviewTab  data={data} />}
            {activeTab === 'funnel'    && <FunnelTab    data={data} />}
            {activeTab === 'problems'  && <ProblemsTab  data={data} />}
            {activeTab === 'actions'   && <ActionsTab   data={data} />}
          </>
        )}
      </div>

      <style>{`
        @keyframes dm-spin        { to { transform: rotate(360deg); } }
        @keyframes dm-radar-spin  { to { transform: rotate(360deg); } }
        @keyframes dm-ring-pulse  { 0%,100%{ opacity:.3 }  50%{ opacity:.85 } }
        @keyframes dm-dot-blink   { 0%,100%{ opacity:0; transform:scale(.35) } 30%,70%{ opacity:1; transform:scale(1) } }
        @keyframes dm-core-pulse  { 0%,100%{ transform:scale(1);   opacity:.75 } 50%{ transform:scale(1.14); opacity:1 } }
        @keyframes dm-chip-in     { from{ opacity:0; transform:translateY(5px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes dm-cardstream  { from{ opacity:0; transform:translateX(-7px) } to{ opacity:1; transform:translateX(0) } }
      `}</style>
    </div>
  )
}

export default AnalyticsAgentWorkspace