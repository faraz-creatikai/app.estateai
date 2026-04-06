interface PageHeaderProps {
    title: string;
    subtitles?: string[];
}

export default function PageHeader({ title, subtitles = [] }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6 ">
            <h1 className="text-2xl p-2 font-semibold text-[var(--color-secondary-darker)] tracking-wide">
                {title} {
                    subtitles.map((sub, index) => (<span key={sub+index} className="text-[var(--color-primary)] font-light  text-sm"> / {sub}</span>))
                }
            </h1>
        </div> 

    );
}

