import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import Button from "@components/common/Button";
import {
  UserTranslationCard,
  UserTranslationStatus,
} from "@styles/verse.style";
import { fetchJson } from "@utils/funcs";

const UserTranslationEditor = ({
  verseId,
  onSaved,
  initialTranslation,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  const [text, setText] = useState(initialTranslation?.text || "");
  const [footnotes, setFootnotes] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setText(initialTranslation?.text || "");
    setFootnotes(initialTranslation?.footnotes || []);
  }, [initialTranslation, verseId]);

  useEffect(() => {
    if (!session?.user?.id || initialTranslation) return;

    let active = true;
    setStatus("loading");
    fetchJson(
      `${process.env.NEXT_PUBLIC_API_URL}/user/translation?user_id=${session.user.id}&verse_id=${verseId}`
    )
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setText(data.text || "");
          setFootnotes(data.footnotes || []);
          onSaved?.(data);
        }
        setStatus("idle");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setMessage(t("user_translation__load_error"));
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id, verseId, initialTranslation, onSaved, t]);

  const addFootnote = () => {
    const nextNumber = footnotes.length + 1;
    setFootnotes([...footnotes, { number: nextNumber, text: "" }]);
  };

  const updateFootnote = (index, text) => {
    const updated = [...footnotes];
    updated[index] = { ...updated[index], text };
    setFootnotes(updated);
  };

  const removeFootnote = (index) => {
    const updated = footnotes.filter((_, i) => i !== index);
    // Renumber remaining footnotes
    const renumbered = updated.map((fn, i) => ({ ...fn, number: i + 1 }));
    setFootnotes(renumbered);
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      return;
    }

    if (!text.trim()) {
      setMessage(t("user_translation__empty_error"));
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/user/translation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verse_id: verseId,
            text: text.trim(),
            footnotes: footnotes.filter(f => f.text.trim()),
          }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result?.data) {
        throw new Error("save-failed");
      }

      onSaved?.(result.data);
      setMessage(t("user_translation__save_success"));
    } catch (error) {
      setMessage(t("user_translation__save_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserTranslationCard>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("user_translation__placeholder")}
        aria-label={t("user_translation__placeholder")}
        rows={6}
      />
      
      {footnotes.length > 0 && (
        <div className="footnotes-section">
          <strong className="footnotes-title">{t("user_translation__footnotes_title")}</strong>
          {footnotes.map((footnote, index) => (
            <div key={index} className="footnote-item">
              <span className="footnote-number">[{footnote.number}]</span>
              <textarea
                value={footnote.text}
                onChange={(e) => updateFootnote(index, e.target.value)}
                placeholder={t("user_translation__footnote_placeholder")}
                rows={2}
              />
              <button
                type="button"
                onClick={() => removeFootnote(index)}
                className="footnote-remove"
                aria-label={t("user_translation__remove_footnote")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="editor-actions">
        <Button
          type="secondary"
          onClick={addFootnote}
          disabled={isLoading}
        >
          + {t("user_translation__add_footnote")}
        </Button>
        <Button type="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading
            ? t("user_translation__saving")
            : t("user_translation__save")}
        </Button>
      </div>
      
      {message && <UserTranslationStatus>{message}</UserTranslationStatus>}
    </UserTranslationCard>
  );
};

export default UserTranslationEditor;
