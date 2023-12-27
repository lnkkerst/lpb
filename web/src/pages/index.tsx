import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lang, getLanguages } from '@/utils/languages';
import {
  Autocomplete,
  Button,
  Container,
  FormControl,
  TextField
} from '@mui/material';

type LanguageSelectProps = {
  onUpdate: (value: Lang) => void;
  value: Lang;
};
function LanguageSelect({ onUpdate, value }: LanguageSelectProps) {
  const languages = useMemo(getLanguages, []);

  return (
    <Autocomplete
      value={value}
      onChange={(_, val) => onUpdate((val || 'plaintext') as Lang)}
      options={languages}
      renderInput={params => (
        <TextField {...params} label="Language"></TextField>
      )}
    ></Autocomplete>
  );
}

export default function Index() {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState('');
  const [lang, setLang] = useState<Lang>('plaintext');

  const handleSubmit = async () => {
    setSubmitting(true);
    const formDate = new FormData();
    formDate.append('file', content);
    const res = await fetch('/r', { method: 'POST', body: formDate });
    if (res.status.toString().startsWith('2')) {
      let pasteId = (await res.json()).paste_id;
      if (lang != 'plaintext') {
        pasteId = `${pasteId}.${lang}`;
      }
      setLink(pasteId);
    }
    setSubmitting(false);
  };

  return (
    <Container className="mt-4 mb-4">
      <FormControl fullWidth>
        <LanguageSelect value={lang} onUpdate={val => setLang(val)} />

        <TextField
          className="my-4!"
          inputProps={{
            className: 'font-mono!'
          }}
          multiline
          minRows={10}
          value={content}
          onChange={e => setContent(e.target.value)}
        ></TextField>

        <div className="mx-auto flex flex-col w-fit">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            Submit
          </Button>

          {link ? (
            <Link
              className="text-center mt-2 hover:opacity-70 active:opacity-50"
              to={`/${link}`}
            >
              {`ID: ${link}`}
            </Link>
          ) : (
            ''
          )}
        </div>
      </FormControl>
    </Container>
  );
}
