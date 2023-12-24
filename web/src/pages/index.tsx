import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    const formDate = new FormData();
    formDate.append('file', content);
    const res = await fetch('/r', { method: 'POST', body: formDate });
    if (res.status.toString().startsWith('2')) {
      setLink((await res.json()).paste_id);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full h-64 font-mono"
      ></textarea>

      <div className="mx-auto flex flex-col w-fit">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-2 py-1 mt-2 ring-2 rounded ring-black hover:opacity-70 active:opacity-50 cursor-pointer"
        >
          Submit
        </button>

        {link ? (
          <Link
            className="text-center mt-2 hover:opacity-70 active:opacity-50"
            to={`/${link}`}
          >
            link
          </Link>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
