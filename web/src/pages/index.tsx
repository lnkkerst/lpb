import CliUsage from "@/mdx/cli-usage.mdx";
import { getLanguages, Lang } from "@/utils/languages";
import {
  Autocomplete,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  TextField,
} from "@mui/material";
import AES from "crypto-js/aes";
import { produce } from "immer";
import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type LanguageSelectProps = {
  onUpdate: (value: Lang) => void;
  value: Lang;
};

function LanguageSelect({ onUpdate, value }: LanguageSelectProps) {
  const languages = useMemo(getLanguages, []);

  return (
    <Autocomplete
      value={value}
      onChange={(_, val) => onUpdate((val || "plaintext") as Lang)}
      options={languages}
      renderInput={params => (
        <TextField {...params} label="Language"></TextField>
      )}
    >
    </Autocomplete>
  );
}

type EncryptionProps = {
  enabled: boolean;
  password: string;
  onUpdateEnabled: (value: boolean) => void;
  onUpdatePassword: (value: string) => void;
};

function Encryption({
  enabled,
  password,
  onUpdateEnabled,
  onUpdatePassword,
}: EncryptionProps) {
  return (
    <Fragment>
      <FormControlLabel
        control={
          <Checkbox
            checked={enabled}
            onChange={() => onUpdateEnabled(!enabled)}
          >
          </Checkbox>
        }
        label="Enable encryption"
      >
      </FormControlLabel>

      {enabled && (
        <TextField
          label="password"
          value={password}
          onChange={e => onUpdatePassword(e.target.value)}
        >
        </TextField>
      )}
    </Fragment>
  );
}

export default function Index() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState("");
  const [lang, setLang] = useState<Lang>("plaintext");
  const [encryption, setEncryption] = useState<{
    enabled: boolean;
    password: string;
  }>({
    enabled: false,
    password: "",
  });

  const handleSubmit = async () => {
    setSubmitting(true);

    let postContent = content;

    if (encryption.enabled) {
      postContent = AES.encrypt(postContent, encryption.password).toString();
    }

    const formDate = new FormData();
    formDate.append("file", postContent);
    if (encryption.enabled) {
      formDate.append("encrypted", "1");
    }

    const res = await fetch("/r", { method: "POST", body: formDate });
    if (res.status.toString().startsWith("2")) {
      let pasteId = (await res.json()).paste_id;
      if (lang != "plaintext") {
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

        <Encryption
          enabled={encryption.enabled}
          password={encryption.password}
          onUpdateEnabled={v =>
            setEncryption(
              produce(encrypt => {
                encrypt.enabled = v;
              }),
            )}
          onUpdatePassword={v =>
            setEncryption(
              produce(encrypt => {
                encrypt.password = v;
              }),
            )}
        >
        </Encryption>

        <TextField
          className="my-4!"
          inputProps={{
            className: "font-mono!",
          }}
          multiline
          minRows={16}
          value={content}
          onChange={e => setContent(e.target.value)}
        >
        </TextField>

        <div className="mx-auto flex flex-col w-fit">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            Submit
          </Button>

          {link
            ? (
              <Link
                className="text-center mt-2 hover:opacity-70 active:opacity-50"
                to={`/${link}`}
              >
                {`ID: ${link}`}
              </Link>
            )
            : (
              ""
            )}
        </div>
      </FormControl>

      <div className="prose">
        <CliUsage />
      </div>
    </Container>
  );
}
