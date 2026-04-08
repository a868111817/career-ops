import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ReportBlockCard({
  block,
}: {
  block: {
    key: string;
    title: string;
    content: string;
  };
}) {
  return (
    <article className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f5efe1] text-lg font-semibold text-slate-950">
          {block.key}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {block.title}
          </p>
        </div>
      </div>
      <div className="prose prose-slate mt-5 max-w-none text-sm leading-7">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
      </div>
    </article>
  );
}
