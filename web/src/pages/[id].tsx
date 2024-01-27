import { useParams } from '@/router';
import useSWR from 'swr';
import { Button, Container, IconButton, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Fragment, useEffect, useState } from 'react';
import styles from './[id].module.scss';
import { Lang, highlightCode } from '@/utils/languages';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

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

type PasswordFormProps = {
  onDecrypt: (password: string) => void;
};

function PasswordForm({ onDecrypt }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  return (
    <div className="flex flex-col items-center gap-2">
      <TextField
        label="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      ></TextField>

      <Button onClick={() => onDecrypt(password)}>DECRYPT</Button>
    </div>
  );
}

export default function Paste() {
  const params = useParams('/:id').id.split('.');
  const [html, setHtml] = useState('');
  const [encrypted, setEncrypted] = useState(false);
  const [code, setCode] = useState('');

  const { data, error, isLoading } = useSWR(
    `/r/${params[0]}`,
    async (...args) => {
      const res = await fetch(...args);
      if (!res.status.toString().startsWith('2')) {
        throw new Error(res.status.toString());
      }

      const raw = await res.text();

      const encrypted = res.headers.get('x-encrypted') === 'true';

      setEncrypted(encrypted);
      setCode(raw);

      return {
        raw
      };
    }
  );

  useEffect(() => {
    highlightCode(code, (params[1] as Lang) ?? 'plaintext').then(res =>
      setHtml(res)
    );
  }, [code, params]);

  function handleDecrypt(password: string) {
    if (!encrypted) {
      return;
    }

    setCode(AES.decrypt(code, password).toString(Utf8));
    setEncrypted(false);
  }

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
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    );
  };

  return (
    <Container className="relative! my-4">
      {!encrypted ? (
        <Fragment>
          <div className="absolute right-2 top-2">
            <CopyButton value={data?.raw ?? ''}></CopyButton>
          </div>

          <Content />
        </Fragment>
      ) : (
        <PasswordForm
          onDecrypt={password => handleDecrypt(password)}
        ></PasswordForm>
      )}
    </Container>
  );
}
