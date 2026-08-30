import { useState } from "react";
import { API } from "../../data/catalogue.js";
import Btn from "../common/Btn.jsx";
import Field from "../common/Field.jsx";

const parseTagInput = (str) =>
  str.split(/[,\n]/).map(s => s.trim().replace(/^#/, "")).filter(Boolean);

export const UploadVideoModal = ({ onClose, onUploaded, showToast }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) { setError("Please select a video file"); return; }
    if (f.size > 100 * 1024 * 1024) { setError("Video too large — max 100MB"); return; }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) { setError("Please select a video first"); return; }
    if (!title.trim()) { setError("Title is required"); return; }
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("shopToken");
      const fd = new FormData();
      fd.append("video", file);
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("hashtags", JSON.stringify(parseTagInput(hashtagsInput)));
      fd.append("tags", JSON.stringify(parseTagInput(tagsInput)));

      const res = await fetch(`${API}/videos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      showToast?.(" Video uploaded! Pending review.");
      onUploaded?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Video upload failed");
    }
    setUploading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onClose?.(); }}>
      <div style={{ width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>Upload Video</h2>
          <button onClick={() => !uploading && onClose?.()} style={{ background: "rgba(0,0,0,0.06)", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 15 }}>×</button>
        </div>

        {/* File picker / preview */}
        {preview ? (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <video src={preview} controls style={{ width: "100%", maxHeight: 260, borderRadius: 12, background: "#000" }} />
            {!uploading && (
              <button onClick={() => { setFile(null); setPreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer" }}>×</button>
            )}
          </div>
        ) : (
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "2px dashed #d5d5d5", borderRadius: 12, padding: "28px 12px", cursor: "pointer", marginBottom: 16, background: "#f7f7f8" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fe2c55" }}>Choose a video file</span>
            <span style={{ fontSize: 11, color: "#999" }}>MP4, MOV — Max 100MB</span>
            <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files[0])} />
          </label>
        )}

        <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. Styling this hoodie 5 ways" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this video about?"
            rows={3}
            style={{ width: "100%", padding: "12px 14px", background: "#fff", border: "1px solid #222", borderRadius: 10, color: "#111", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical" }}
          />
        </div>
        <Field label="Hashtags" value={hashtagsInput} onChange={setHashtagsInput} placeholder="ootd, fashion, sale (comma separated)" req={false} />
        <Field label="Tags" value={tagsInput} onChange={setTagsInput} placeholder="summer, streetwear (comma separated)" req={false} />

        {error && <p style={{ color: "#fe2c55", fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <Btn full loading={uploading} onClick={submit}>{uploading ? "Uploading..." : "Upload"}</Btn>
      </div>
    </div>
  );
};

export default UploadVideoModal;
