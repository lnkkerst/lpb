import { useParams } from '@/router';
import useSWR from 'swr';
import { getHighlighter, setCDN, type Lang } from 'shiki';
import { Container, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import styles from './[id].module.scss';

type CopyButtonProps = {
  value: string;
};
function CopyButton({ value }: CopyButtonProps) {
  const [success, setSuccess] = useState(false);
  const handleClick = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <IconButton
      onClick={e => {
        e.preventDefault();
        handleClick();
      }}
      size="large"
    >
      {success ? <CheckIcon /> : <ContentCopyIcon />}
    </IconButton>
  );
}

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

      const raw = await res.text();

      return { raw, html: await highlightCode(raw) };
    }
  );

  const Content = () => {
    if (error) {
      return <div>Failed to load paste with id {params[0]}</div>;
    }

    if (isLoading || !data) {
      return <div>Loading...</div>;
    }

    return (
      <div
        className={styles.code}
        dangerouslySetInnerHTML={{ __html: data.html }}
      ></div>
    );
  };

  return (
    <Container className="relative! my-4">
      <div className="absolute right-2 top-2">
        <CopyButton value={data?.raw ?? ''}></CopyButton>
      </div>

      <Content />
    </Container>
  );
}
