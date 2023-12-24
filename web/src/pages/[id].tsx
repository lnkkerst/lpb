import { useParams } from '@/router';
import useSWR from 'swr';
import { getHighlighter, setCDN, type Lang } from 'shiki';

export default function Paste() {
  const params = useParams('/:id').id.split('.');
  const { data, error, isLoading } = useSWR(
    `/r/${params[0]}`,
    async (...args) => {
      const res = await fetch(...args);
      if (!res.status.toString().startsWith('2')) {
        throw new Error(res.status.toString());
      }

      const highlightCode = async (code: string) => {
        setCDN('https://fastly.jsdelivr.net/npm/shiki');

        const highlighter = await getHighlighter({
          theme: 'github-light',
          langs: params[1] ? [params[1] as Lang] : []
        });

        const result = highlighter.codeToHtml(code, params[1]);
        return result;
      };

      return await highlightCode(await res.text());
    }
  );

  if (error) {
    return <div>Failed to load params with id {params[0]}</div>;
  }
  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="font-mono">
      <pre dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
