"use client";

import { LessonContent } from "./lesson-content";
import { artworkChange, artworkUrlValid } from "@/lib/lms/page-artwork";
import { CourseCover } from "@/components/course-cover";
import { LevelFolders } from "@/components/level-folders";
import { createLevelFolderAction, levelFoldersAction } from "./level-actions";
import { CEFR_LEVELS } from "@/lib/lms/learning-path";
import { FitSlide } from "@/components/fit-slide";
import { QuestionEditor, newQuestion } from "./question-editor";
import { BlockDesignOptions } from "./block-design-options";
import { LearningViewer } from "@/components/learning-viewer";
import { FormEvent, useEffect, useState, useRef } from "react";

import type {
  LmsCourse,
  LmsCourseBlock,
  LmsCourseBlockConfig,
  LmsCourseBlockKind,
} from "@/lib/lms/types";

import {
  createCourseAction,
  deleteCourseBlockAction,
  loadCourseStudioAction,
  saveCourseBlockAction,
  setCoursePublishedAction,
  updateCourseDetailsAction,
  uploadCourseImageAction,
  createCourseModuleAction,
} from "./actions";
import styles from "./course-studio.module.css";

type DraftBlock = Omit<LmsCourseBlock, "id"> & { id?: string };

type Props = {
  courses: LmsCourse[];
  setCourses: React.Dispatch<React.SetStateAction<LmsCourse[]>>;
  onNotify: (message: string) => void;
  persistent: boolean;
  organizationId?: string;
};

const defaultConfig: LmsCourseBlockConfig = {
  fontFamily: "inter",
  fontSize: "normal",
  textColor: "#000000",
  backgroundColor: "#FFFFFF",
  borderColor: "#D1D1D1",
  align: "left",
  width: "full",
  textStyle: "paragraph",
  lineHeight: "normal",
  letterSpacing: "normal",
  padding: "normal",
  radius: "medium",
  borderStyle: "none",
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  uppercase: false,
};

const fontOptions: { value: LmsCourseBlockConfig["fontFamily"]; label: string; stack: string }[] = [
  { value: "inter", label: "Inter", stack: "Inter, Arial, sans-serif" },
  { value: "arial", label: "Arial", stack: "Arial, sans-serif" },
  { value: "helvetica", label: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { value: "verdana", label: "Verdana", stack: "Verdana, sans-serif" },
  { value: "tahoma", label: "Tahoma", stack: "Tahoma, sans-serif" },
  { value: "trebuchet", label: "Trebuchet MS", stack: "'Trebuchet MS', sans-serif" },
  { value: "georgia", label: "Georgia", stack: "Georgia, serif" },
  { value: "times", label: "Times New Roman", stack: "'Times New Roman', serif" },
  { value: "garamond", label: "Garamond", stack: "Garamond, serif" },
  { value: "palatino", label: "Palatino", stack: "Palatino, serif" },
  { value: "bookman", label: "Bookman", stack: "Bookman, serif" },
  { value: "courier", label: "Courier New", stack: "'Courier New', monospace" },
  { value: "monaco", label: "Monaco", stack: "Monaco, monospace" },
  { value: "roboto", label: "Roboto", stack: "Roboto, Arial, sans-serif" },
  { value: "open-sans", label: "Open Sans", stack: "'Open Sans', Arial, sans-serif" },
  { value: "lato", label: "Lato", stack: "Lato, Arial, sans-serif" },
  { value: "montserrat", label: "Montserrat", stack: "Montserrat, Arial, sans-serif" },
  { value: "poppins", label: "Poppins", stack: "Poppins, Arial, sans-serif" },
  { value: "merriweather", label: "Merriweather", stack: "Merriweather, Georgia, serif" },
  { value: "playfair", label: "Playfair Display", stack: "'Playfair Display', Georgia, serif" },
];



const blockTools: { kind: LmsCourseBlockKind; label: string; mark: string }[] = [
  { kind: "text", label: "Text", mark: "T" },
  { kind: "image", label: "Image", mark: "▧" },
  { kind: "youtube", label: "Video", mark: "▶" },
  { kind: "document", label: "File", mark: "DOC" },
  { kind: "audio", label: "Audio", mark: "♪" },
  { kind: "quiz", label: "Quiz", mark: "?" },
  { kind: "exam", label: "Exam", mark: "✓" },
];

function emptyBlock(kind: LmsCourseBlockKind, position: number): DraftBlock {
  const assessment = kind === "quiz" || kind === "exam";
  return {
    kind,
    title: assessment ? (kind === "exam" ? "Final exam" : "Knowledge check") : `New block: ${kindLabel(kind).toLowerCase()}`,
    body: "",
    url: "",
    position,
    config: { ...defaultConfig },
    questions:assessment?[newQuestion()]:undefined,
    question: assessment ? "" : undefined,
    options: assessment ? ["", "", "", ""] : undefined,
    correctAnswer: assessment ? "" : undefined,
    passingScore: assessment ? 80 : undefined,
    maxAttempts: assessment ? (kind === "exam" ? 1 : 3) : undefined,
  };
}

export function CourseStudioWorkspace({ courses, setCourses, onNotify, persistent, organizationId }: Props) {
  const editSession = useRef(0);
  const [showCreate, setShowCreate] = useState(false);
  const [folders,setFolders]=useState<string[]>([]);
  const [showLevelForm,setShowLevelForm]=useState(false);
  const [newLevel,setNewLevel]=useState("A2");
  useEffect(()=>{if(persistent&&organizationId){let active=true;levelFoldersAction(organizationId).then(items=>{if(active)setFolders(items);}).catch(e=>onNotify(e.message));return()=>{active=false;};}},[persistent,organizationId,onNotify]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<"standard" | "activities" | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [levelFolder,setLevelFolder]=useState<string|null>(null);
  const [editingCourse, setEditingCourse] = useState<LmsCourse | null>(null);
  const [blocks, setBlocks] = useState<LmsCourseBlock[]>([]);
  const [modules, setModules] = useState<{ id: string; title: string; position: number }[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(()=>{if(selectedId && selectedId!=="settings") document.getElementById(`studio-block-${selectedId}`)?.scrollIntoView({block:"nearest"});},[selectedId]);
  const [draft, setDraft] = useState<DraftBlock | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    level: "A1",
    description: "",
    youtubeUrl: "",
    color: "#2C55A2",
    template: "guided" as "blank" | "guided" | "single",
    passingScore: 80,
  });
  const [newCover, setNewCover] = useState<File | null>(null);
  const [settings, setSettings] = useState({ title: "", level: "A1", description: "", color: "#2C55A2", coverUrl: "" });

  async function openCourse(course: LmsCourse) {
    const session = ++editSession.current;
    setEditingCourse(course);
    setSettings({
      title: course.title,
      level: course.level.split(" · ")[0] || "A1",
      description: course.description,
      color: course.color,
      coverUrl: course.coverUrl ?? "",
    });
    setSelectedId(null);
    setDraft(null);
    if (!persistent || !organizationId || typeof course.id !== "string") {
      setBlocks([]);
      return;
    }
    setLoading(true);
    try {
      const result = await loadCourseStudioAction({ organizationId, courseId: course.id });
      if (editSession.current !== session) return;
      if (!result.ok || !result.data) return onNotify(result.message);
      setBlocks(result.data.blocks); setModules(result.data.modules); setModuleId(result.data.modules[0]?.id ?? "");
    } catch(error) { if(editSession.current===session) onNotify(error instanceof Error?error.message:"Unable to load the course. Please try again."); }
    finally { if(editSession.current===session) setLoading(false); }

  }

  async function createCourse(event: FormEvent) {
    event.preventDefault();
    if (!newCourse.title.trim()) return;
    if (newCover && (newCover.size > 2*1024*1024 || !["image/png","image/jpeg","image/webp"].includes(newCover.type))) return onNotify("Choose a JPG, PNG or WEBP cover up to 2 MB.");
    setBusy(true);
    let id: string | number = Date.now();
    if (persistent && organizationId) {
      const result = await createCourseAction({ organizationId, ...newCourse });
      if (!result.ok || !result.data) {
        setBusy(false);
        return onNotify(result.message);
      }
      id = result.data.id;
      onNotify(result.message);
    } else {
      onNotify("Course created as a draft");
    }
    const course: LmsCourse = {
      id,
      title: newCourse.title.trim(),
      level: `${newCourse.level} · Draft`,
      description: newCourse.description.trim() || "A new step in your English journey.",
      progress: 0,
      lessons: newCourse.template === "guided" ? 3 : newCourse.template === "single" || newCourse.youtubeUrl ? 1 : 0,
      duration: "Not set",
      students: 0,
      youtubeUrl: newCourse.youtubeUrl,
      color: newCourse.color,
      published: false,
    };
    if (newCover && organizationId && persistent && typeof id === "string") {
      const form = new FormData(); form.set("organizationId", organizationId); form.set("courseId", id); form.set("image", newCover);
      try {
        const upload = await uploadCourseImageAction(form);
        if (!upload.ok || !upload.data) throw new Error(upload.message);
        const saved = await updateCourseDetailsAction({organizationId,courseId:id,title:course.title,description:course.description,level:newCourse.level,color:course.color,coverUrl:upload.data.url});
        if (!saved.ok) throw new Error(saved.message);
        course.coverUrl = upload.data.url;
      } catch(error) { onNotify(`Course created. Cover was not saved: ${error instanceof Error ? error.message : "Please try again in Course details."}`); }
    }
    setNewCover(null);
    setCourses((current) => [...current, course]);
    setNewCourse({ title: "", level: newCourse.level, description: "", youtubeUrl: "", color: "#2C55A2", template: "guided", passingScore: 80 });
    setShowCreate(false);
    setBusy(false);
    await openCourse(course);
  }

  async function togglePublished(course: LmsCourse) {
    const published = !course.published;
    if (persistent && organizationId && typeof course.id === "string") {
      setBusy(true);
      const result = await setCoursePublishedAction({ organizationId, courseId: course.id, published });
      setBusy(false);
      if (!result.ok) return onNotify(result.message);
      onNotify(result.message);
    } else {
      onNotify(published ? "Course published" : "Course moved to draft");
    }
    const updated = { ...course, published };
    setEditingCourse((current) => current?.id === course.id ? updated : current);
    setCourses((current) => current.map((item) => item.id === course.id ? updated : item));
  }

  async function uploadCover(file?: File) {
    if (!file || !editingCourse || !organizationId) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("organizationId", organizationId); form.set("courseId", String(editingCourse.id)); form.set("image", file);
      const result = await uploadCourseImageAction(form);
      if (!result.ok || !result.data) throw new Error(result.message);
      setSettings(current => ({...current, coverUrl: result.data!.url}));
      onNotify("Cover ready. Save changes to apply it to the course.");
    } catch (error) { onNotify(error instanceof Error ? error.message : "Unable to upload cover. Please try again."); }
    finally { setBusy(false); }
  }

  async function saveCourseSettings(event: FormEvent) {
    event.preventDefault();
    if (!editingCourse) return;
    setBusy(true);
    if (persistent && organizationId && typeof editingCourse.id === "string") {
      const result = await updateCourseDetailsAction({ organizationId, courseId: editingCourse.id, ...settings });
      if (!result.ok) {
        setBusy(false);
        return onNotify(result.message);
      }
      onNotify(result.message);
    } else {
      onNotify("Settings saved");
    }
    const updated: LmsCourse = {
      ...editingCourse,
      title: settings.title,
      level: `${settings.level} · ${editingCourse.published ? "Published" : "Draft"}`,
      description: settings.description,
      color: settings.color,
      coverUrl: settings.coverUrl || undefined,
    };
    setEditingCourse(updated);
    setCourses((current) => current.map((course) => course.id === updated.id ? updated : course));
    setBusy(false);
  }

  function startBlock(kind: LmsCourseBlockKind) {
    if (loading || busy) return;
    editSession.current++;
    const nextPosition = Math.max(0, ...blocks.map((block) => block.position)) + 1;
    setSelectedId("new");
    setDraft({ ...emptyBlock(kind, nextPosition), moduleId: moduleId || undefined });
    setShowPicker(false);
  }

  function selectBlock(block: LmsCourseBlock) {
    editSession.current++;
    if (block.moduleId) setModuleId(block.moduleId);
    setSelectedId(block.id);
    setDraft({ ...block, config: { ...block.config }, options: [...(block.options ?? [])] });
  }

  async function saveBlock(event: FormEvent) {
    event.preventDefault();
    if (!editingCourse || !draft) return;
    if ([draft.config.backgroundImage,draft.config.logoUrl,draft.config.imageUrl].some(url=>!artworkUrlValid(url))) return onNotify("Artwork links must be valid HTTPS image URLs without embedded credentials.");
    setBusy(true);
    let saved: LmsCourseBlock = { ...draft, id: draft.id ?? `local-${Date.now()}` };
    if (persistent && organizationId && typeof editingCourse.id === "string") {
      const result = await saveCourseBlockAction({ organizationId, courseId: editingCourse.id, block: draft });
      if (!result.ok || !result.data) {
        setBusy(false);
        return onNotify(result.message);
      }
      saved = result.data.block;
      onNotify(result.message);
    } else {
      onNotify(`${kindLabel(draft.kind)} saved`);
    }
    const alreadyExists = blocks.some((block) => block.id === saved.id);
    setBlocks((current) => alreadyExists
      ? current.map((block) => block.id === saved.id ? saved : block)
      : [...current, saved].sort((a, b) => a.position - b.position));
    setSelectedId(saved.id);
    setDraft({ ...saved, options: [...(saved.options ?? [])] });
    if (saved.moduleId && !modules.some((item) => item.id === saved.moduleId) && persistent && organizationId && typeof editingCourse.id === "string") {
      const refreshed = await loadCourseStudioAction({ organizationId, courseId: editingCourse.id });
      if (refreshed.ok && refreshed.data) {
        setModules(refreshed.data.modules);
        setModuleId(saved.moduleId);
      }
    }
    if (!alreadyExists && !["quiz", "exam"].includes(saved.kind)) {
      setCourses((current) => current.map((course) => course.id === editingCourse.id ? { ...course, lessons: course.lessons + 1 } : course));
      setEditingCourse((current) => current ? { ...current, lessons: current.lessons + 1 } : current);
    }
    setBusy(false);
  }

  async function removeBlock(block: LmsCourseBlock) {
    if (!editingCourse || !window.confirm(`Delete “${block.title}”?`)) return;
    setBusy(true);
    if (persistent && organizationId && typeof editingCourse.id === "string") {
      const result = await deleteCourseBlockAction({
        organizationId,
        courseId: editingCourse.id,
        blockId: block.id,
        kind: block.kind,
      });
      if (!result.ok) {
        setBusy(false);
        return onNotify(result.message);
      }
      onNotify(result.message);
    } else {
      onNotify("Block deleted");
    }
    setBlocks((current) => current.filter((item) => item.id !== block.id));
    if (selectedId === block.id) {
      setSelectedId(null);
      setDraft(null);
    }
    setBusy(false);
  }

  async function uploadImage(file?: File,target?:"backgroundImage"|"imageUrl"|"logoUrl") {
    if (!file || !draft || !editingCourse) return;
    const selected = draft.id ?? "new";
    const session = editSession.current;
    setBusy(true);
    try {
      let url: string;
      if (!persistent || !organizationId || typeof editingCourse.id !== "string") url = URL.createObjectURL(file);
      else {
        const form = new FormData(); form.set("organizationId", organizationId); form.set("courseId", editingCourse.id); form.set("image", file);
        const result = await uploadCourseImageAction(form);
        if (!result.ok || !result.data) throw new Error(result.message);
        url = result.data.url;
      }
      setDraft(current => current && editSession.current === session && (current.id ?? "new") === selected ? target ? {...current,config:{...current.config,...artworkChange(target,url)}} : {...current,url} : current);
      onNotify("Image ready. Save changes to keep it in the course.");
    } catch(error) { onNotify(error instanceof Error ? error.message : "Unable to upload image. Please try again."); }
    finally { setBusy(false); }
  }

  async function addModule(event: FormEvent) {
    event.preventDefault();
    if (!editingCourse || !moduleTitle.trim() || !organizationId || typeof editingCourse.id !== "string") return;
    setBusy(true);
    const result = await createCourseModuleAction({ organizationId, courseId: editingCourse.id, title: moduleTitle });
    setBusy(false);
    if (!result.ok || !result.data) return onNotify(result.message);
    setModules((current) => [...current, result.data!]);
    setModuleId(result.data.id);
    setModuleTitle("");
    setDraft(null);
    setShowPicker(false);
  }

  const catalogCourses = courses.filter(course => (!levelFolder || query.trim() || course.level.split(" · ")[0] === levelFolder) && course.title.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || (filter === "Published" ? course.published : !course.published)));

  if (editingCourse) {
    const renderedBlocks = draft ? draft.id ? blocks.map(block=>block.id===draft.id?{...draft,id:draft.id}:block) : [...blocks,{...draft,id:"new"}] : blocks;
    const visibleBlocks = renderedBlocks.filter((block) => !block.moduleId || !moduleId || block.moduleId === moduleId);
    const currentModule = modules.find((item) => item.id === moduleId);
    return (
      <section className={styles.studio}>
        <header className={styles.studioHeader}>
          <button className={styles.backButton} type="button" onClick={() => { setEditingCourse(null); setDraft(null); }}>
            ← Courses
          </button>
          <div>
            <span>COURSE EDITOR</span>
            <h2>{editingCourse.title}</h2>
          </div>
          <div className={styles.headerActions}>
            <span className={editingCourse.published ? styles.published : styles.draftStatus}>{editingCourse.published ? "Published" : "Draft"}</span>
            <button type="button" className={styles.previewButton} onClick={() => setPreviewOpen(true)}>Preview</button>
            <button type="button" className={styles.publishButton} disabled={busy} onClick={() => void togglePublished(editingCourse)}>
              {editingCourse.published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </header>

        <div className={styles.studioGrid}>
          <aside className={styles.outlinePanel}>
            <div className={styles.panelTitle}><span>STRUCTURE</span><strong>Content</strong></div>
            <button className={selectedId === "settings" ? styles.outlineActive : ""} onClick={() => { setSelectedId("settings"); setDraft(null); }} type="button">
              <i>⚙</i><span><strong>Settings</strong><small>Name, level and cover</small></span>
            </button>
            <button className={styles.addOutline} type="button" disabled={loading || busy} aria-expanded={showPicker} onClick={() => { setShowPicker((current) => !current); setPickerCategory(null); }}>+ Add</button>
            {showPicker && <div className={styles.addMenu}>
              <button type="button" onClick={() => setPickerCategory("standard")}><strong>Standard content →</strong><small>Text, video, image, file or audio</small></button>
              <button type="button" onClick={() => setPickerCategory("activities")}><strong>Learning activities →</strong><small>Quiz and exam</small></button>
              {pickerCategory && blockTools.filter((tool) => pickerCategory === "activities" ? ["quiz", "exam"].includes(tool.kind) : !["quiz", "exam"].includes(tool.kind)).map((tool) => <button key={tool.kind} type="button" disabled={loading || busy} onClick={() => startBlock(tool.kind)}>{tool.mark} {tool.label}</button>)}
              <form onSubmit={addModule}><label>New module<input value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} required maxLength={180} /></label><button type="submit" disabled={busy}>Add module</button></form>
            </div>}
            {modules.map((item) => <button type="button" key={item.id} className={moduleId === item.id ? styles.outlineActive : ""} onClick={() => { setModuleId(item.id); setDraft(null); setSelectedId(null); }}><i>▤</i><span><strong>{item.title}</strong><small>{blocks.filter((block) => block.moduleId === item.id).length} items</small></span></button>)}
            <div className={styles.moduleLabel}><span>{currentModule?.title ?? "CONTENT"}</span><small>{visibleBlocks.length} blocks</small></div>
            <div className={styles.outlineList}>
              {visibleBlocks.map((block, index) => (
                <button className={selectedId === block.id ? styles.outlineActive : ""} key={block.id} type="button" onClick={() => {if(selectedId !== block.id) selectBlock(block);}}>
                  <i>{index + 1}</i><span><strong>{block.title}</strong><small>{kindLabel(block.kind)}</small></span>
                </button>
              ))}
            </div>
          </aside>

          <main className={styles.canvasPanel}>
            <div className={styles.canvasTop}>
              <div><span>COURSE CANVAS</span><strong>{currentModule?.title ?? "Content"}</strong></div>
              <span>{visibleBlocks.length} items</span>
            </div>
            <div className={styles.toolShelf} aria-label="Add content">
              {blockTools.map((tool) => <button key={tool.kind} type="button" disabled={loading || busy} onClick={() => startBlock(tool.kind)}><i>{tool.mark}</i><span>{tool.label}</span></button>)}
            </div>
            {loading ? <div className={styles.loadingState}>Loading content…</div> : visibleBlocks.length ? (
              <div className={styles.canvasGrid}>
                {visibleBlocks.map((block) => (
                  <CourseBlockPreview
                    block={block}
                    key={block.id}
                    selected={selectedId === block.id}
                    onEdit={() => {if(selectedId !== block.id) selectBlock(block);}}
                    onDelete={() => {if(block.id==="new"){setDraft(null);setSelectedId(null);}else void removeBlock(block);}}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyCanvas}>
                <span>＋</span>
                <strong>Start building your lesson</strong>
                <p>Add text, images, video, files or an assessment from the toolbar.</p>
                <button type="button" onClick={() => startBlock("text")}>Add your first block</button>
              </div>
            )}
          </main>

          <aside className={styles.inspectorPanel} id="course-properties">
            {selectedId === "settings" ? (
              <CourseSettingsForm settings={settings} setSettings={setSettings} busy={busy} onSubmit={saveCourseSettings} onUpload={uploadCover} />
            ) : draft ? (
              <BlockInspector draft={draft} setDraft={setDraft} busy={busy} onSubmit={saveBlock} onUpload={uploadImage} />
            ) : (
              <div className={styles.inspectorEmpty}>
                <span>PROPERTIES</span>
                <strong>Select a block</strong>
                <p>Editing tools will appear here.</p>
              </div>
            )}
          </aside>
        </div>
        {previewOpen && <CoursePreviewModal course={editingCourse} blocks={blocks} draft={draft} onClose={() => setPreviewOpen(false)} />}
      </section>
    );
  }

  return (
    <section className={styles.catalog}>
      <div className={styles.catalogToolbar}>
        <label><span>⌕</span><input placeholder="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div>{["All", "Published", "Drafts"].map((item) => <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <button className={styles.createButton} type="button" onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Close" : "+ Create course"}</button>
      </div>

      <div className={styles.folderToolbar}><button type="button" onClick={()=>setShowLevelForm(!showLevelForm)}>+ Create level folder</button>{levelFolder&&<span>New courses will be placed in {levelFolder}.</span>}</div>
      {showLevelForm&&<form className={styles.folderForm} onSubmit={async e=>{e.preventDefault();setBusy(true);try{if(persistent&&organizationId)setFolders(await createLevelFolderAction(organizationId,newLevel));else setFolders(current=>Array.from(new Set([...current,newLevel])));setShowLevelForm(false);onNotify(newLevel+" folder is ready. Add courses inside it.");}catch(e){onNotify(e instanceof Error?e.message:"Unable to create folder.");}finally{setBusy(false);}}}><label>Level<select value={newLevel} onChange={e=>setNewLevel(e.target.value)}>{CEFR_LEVELS.map(code=><option key={code}>{code}</option>)}</select></label><button type="submit" disabled={busy}>Create folder</button><button type="button" onClick={()=>setShowLevelForm(false)}>Cancel</button></form>}
      {showCreate && (
        <form className={styles.createPanel} onSubmit={createCourse}>
          <div className={styles.createHeading}><div><span>NEW COURSE</span><h2>Course basics</h2><p>Start with the basics, then design each lesson in the editor.</p></div><button type="button" onClick={() => {setShowCreate(false);setNewCover(null);}}>×</button></div>
          <div className={styles.createGrid}>
            <label className={styles.wide}>Course name<input value={newCourse.title} onChange={(event) => setNewCourse((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Business English B1" required /></label>
            <label>Level<select value={newCourse.level} onChange={(event) => setNewCourse((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label>
            <label>Fallback color<div className={styles.colorInput}><input type="color" value={newCourse.color} onChange={(event) => setNewCourse((current) => ({ ...current, color: event.target.value }))} /><span>{newCourse.color.toUpperCase()}</span></div></label>
            <label className={styles.full}>Cover photo (optional)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event=>setNewCover(event.target.files?.[0]??null)}/><small>JPG, PNG or WEBP · up to 2 MB. You can also add or change it later in Course details.</small></label>
            <label>Starting template<select value={newCourse.template} onChange={(event) => setNewCourse((current) => ({ ...current, template: event.target.value as "blank" | "guided" | "single" }))}><option value="guided">Guided structure</option><option value="single">One starter lesson</option><option value="blank">Blank course</option></select></label>
            <label>Passing score<input type="number" min="0" max="100" value={newCourse.passingScore} onChange={(event) => setNewCourse((current) => ({ ...current, passingScore: Number(event.target.value) }))} /></label>
            <label className={styles.full}>Description<textarea value={newCourse.description} onChange={(event) => setNewCourse((current) => ({ ...current, description: event.target.value }))} placeholder="What will the student learn?" /></label>
            <label className={styles.full}>Starter video (YouTube or OneDrive) <small>(optional)</small><input type="url" value={newCourse.youtubeUrl} onChange={(event) => setNewCourse((current) => ({ ...current, youtubeUrl: event.target.value }))} placeholder="https://..." /></label>
          </div>
          <div className={styles.createActions}><button type="button" onClick={() => {setShowCreate(false);setNewCover(null);}}>Cancel</button><button className={styles.createButton} disabled={busy} type="submit">{busy ? "Creating…" : "Create and open editor"}</button></div>
        </form>
      )}

      {!levelFolder && !query.trim() && filter === "All"?<LevelFolders levels={Array.from(new Set([...folders,...courses.map(c=>c.level.split(" · ")[0])])).sort()} courses={courses} onOpen={level=>{setLevelFolder(level);setNewCourse(current=>({...current,level}));}}/>:<><button type="button" onClick={()=>{setLevelFolder(null);setQuery("");setFilter("All");}}>← All levels</button><h2>{query.trim() || !levelFolder ? "Courses" : `${levelFolder} · Courses`}</h2>{!catalogCourses.length && <p role="status">No courses match these filters.</p>}<div className={styles.courseGrid}>
        {catalogCourses.map((course) => (
          <article className={styles.courseCard} key={course.id}>
            <button className={styles.courseCover} aria-label={`Edit ${course.title}`} type="button" onClick={() => void openCourse(course)}>
              <CourseCover url={course.coverUrl} color={course.color} level={course.level.split(" · ")[0]} />
            </button>
            <div className={styles.courseBody}>
              <span className={course.published ? styles.published : styles.draftStatus}>{course.published ? "Published" : "Draft"}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className={styles.courseMeta}><span>{course.lessons} items</span><span>{course.students} students</span></div>
              <div className={styles.courseActions}><button type="button" onClick={() => void openCourse(course)}>Open editor</button><button type="button" disabled={busy} onClick={() => void togglePublished(course)}>{course.published ? "Unpublish" : "Publish"}</button></div>
            </div>
          </article>
        ))}
      </div></>}
    </section>
  );
}

function CourseSettingsForm({ settings, setSettings, busy, onSubmit, onUpload }: {
  settings: { title: string; level: string; description: string; color: string; coverUrl: string };
  setSettings: React.Dispatch<React.SetStateAction<{ title: string; level: string; description: string; color: string; coverUrl: string }>>;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  onUpload: (file?: File) => Promise<void>;
}) {
  return <form className={styles.inspectorForm} onSubmit={onSubmit}><div className={styles.inspectorTitle}><span>SETTINGS</span><strong>Course details</strong></div><label>Name<input value={settings.title} onChange={(event) => setSettings((current) => ({ ...current, title: event.target.value }))} required /></label><label>Level<select value={settings.level} onChange={(event) => setSettings((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label><label>Description<textarea value={settings.description} onChange={(event) => setSettings((current) => ({ ...current, description: event.target.value }))} /></label><div className={styles.coverSettings}><strong>Course cover</strong><CourseCover url={settings.coverUrl} color={settings.color} level={settings.level}/><label className={styles.uploadBox}>Upload cover photo<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => {void onUpload(event.target.files?.[0]); event.target.value="";}}/><span>JPG, PNG or WEBP · up to 2 MB. Landscape 16:9 works best. Save changes to apply your cover.</span></label>{settings.coverUrl && <button type="button" disabled={busy} onClick={()=>setSettings(current=>({...current,coverUrl:""}))}>Remove photo</button>}</div><label>Fallback color<div className={styles.colorInput}><input type="color" value={settings.color} onChange={(event) => setSettings((current) => ({ ...current, color: event.target.value }))} /><span>{settings.color.toUpperCase()}</span></div></label><button className={styles.saveButton} disabled={busy} type="submit">{busy ? "Saving…" : "Save changes"}</button></form>;
}

function BlockInspector({ draft, setDraft, busy, onSubmit, onUpload }: {
  draft: DraftBlock;
  setDraft: React.Dispatch<React.SetStateAction<DraftBlock | null>>;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  onUpload: (file?: File,target?:"backgroundImage"|"imageUrl"|"logoUrl") => void | Promise<void>;
}) {
  const assessment = draft.kind === "quiz" || draft.kind === "exam";
  const updateConfig = <K extends keyof LmsCourseBlockConfig>(key: K, value: LmsCourseBlockConfig[K]) => setDraft((current) => current ? { ...current, config: { ...current.config, [key]: value } } : current);
  const updateBody = (body: string) => setDraft((current) => current ? { ...current, body } : current);
  const toggleList = (ordered: boolean) => {
    const lines = (draft.body || "Elemento").split("\n");
    const pattern = ordered ? /^\d+\.\s/ : /^•\s/;
    const active = lines.every((line) => !line.trim() || pattern.test(line));
    updateBody(lines.map((line, index) => active ? line.replace(pattern, "") : `${ordered ? `${index + 1}.` : "•"} ${line.replace(/^((\d+\.)|•)\s/, "")}`).join("\n"));
  };
  return <form className={styles.inspectorForm} onSubmit={onSubmit}>
    <div className={styles.inspectorTitle}><span>{kindLabel(draft.kind).toUpperCase()}</span><strong>{draft.id ? "Edit block" : "New block"}</strong></div>
    <label>Title<input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} required /></label>
    {draft.kind === "text" && <>
      <label>Text style<select aria-label="Text style" value={draft.config.textStyle} onChange={(event) => updateConfig("textStyle", event.target.value as LmsCourseBlockConfig["textStyle"])}><option value="paragraph">Paragraph</option><option value="heading1">Main heading</option><option value="heading2">Section heading</option><option value="heading3">Subheading</option><option value="quote">Quote</option><option value="callout">Callout</option></select></label>
      <div className={styles.formatToolbar}>
        <select aria-label="Font" value={draft.config.fontFamily} onChange={(event) => updateConfig("fontFamily", event.target.value as LmsCourseBlockConfig["fontFamily"])}>{fontOptions.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select>
        <select aria-label="Size" value={draft.config.fontSize} onChange={(event) => updateConfig("fontSize", event.target.value as LmsCourseBlockConfig["fontSize"])}><option value="xs">Extra small</option><option value="small">Small</option><option value="normal">Normal</option><option value="large">Large</option><option value="xl">Extra large</option><option value="title">Title</option><option value="display">Display</option></select>
        <button title="Bold" className={draft.config.bold ? styles.formatActive : ""} type="button" onClick={() => updateConfig("bold", !draft.config.bold)}><b>B</b></button>
        <button title="Italic" className={draft.config.italic ? styles.formatActive : ""} type="button" onClick={() => updateConfig("italic", !draft.config.italic)}><i>I</i></button>
        <button title="Underline" className={draft.config.underline ? styles.formatActive : ""} type="button" onClick={() => updateConfig("underline", !draft.config.underline)}><u>U</u></button>
      </div>
      <div className={styles.extendedToolbar}><button title="Strikethrough" className={draft.config.strikethrough ? styles.formatActive : ""} type="button" onClick={() => updateConfig("strikethrough", !draft.config.strikethrough)}>S̶</button><button title="Uppercase" className={draft.config.uppercase ? styles.formatActive : ""} type="button" onClick={() => updateConfig("uppercase", !draft.config.uppercase)}>AA</button><button type="button" onClick={() => toggleList(false)}>• List</button><button type="button" onClick={() => toggleList(true)}>1. List</button><button type="button" onClick={() => updateBody(`${draft.body}${draft.body ? "\n" : ""}[Link text](https://)`)}>Link</button></div>
      <div className={styles.alignmentToolbar}><span>Align</span>{(["left", "center", "right", "justify"] as const).map((align) => <button title={align} className={draft.config.align === align ? styles.formatActive : ""} key={align} type="button" onClick={() => updateConfig("align", align)}>{align === "left" ? "≡" : align === "center" ? "≣" : align === "right" ? "☰" : "▤"}</button>)}</div>
      <label>Content<textarea className={styles.contentTextarea} value={draft.body} onChange={(event) => updateBody(event.target.value)} placeholder="Write the lesson content…" /></label>

    </>}
    {draft.kind === "image" && <><label className={styles.uploadBox}>Upload image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void onUpload(event.target.files?.[0])} /><span>PNG, JPG or WEBP · maximum 2 MB</span></label><label>Or use a link<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://..." /></label><label>Alternative text<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} placeholder="Describe the image" /></label></>}
    {draft.kind === "youtube" && <><label>Video link or Microsoft embed code<input type="text" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://... or iframe embed code" required /></label><small>OneDrive: use Copy embed code for inline playback. Viewing permissions still apply.</small><label>Instructions<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} /></label></>}
    {draft.kind === "document" && <><label>File link<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://..." required /></label><label>Description<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} /></label></>}
    {draft.kind === "audio" && <><label>Audio link<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://..." required /></label><label>Description or transcript<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} /></label></>}
    {assessment && <><label>Instructions<textarea value={draft.body} onChange={e=>updateBody(e.target.value)}/></label><QuestionEditor questions={draft.questions?.length?draft.questions:[{...newQuestion(),prompt:draft.question??"",options:draft.options??["",""],correctAnswer:draft.correctAnswer??""}]} onChange={questions=>setDraft(current=>current?{...current,questions}:current)}/><div className={styles.twoFields}><label>Passing score<input type="number" min={0} max={100} value={draft.passingScore??80} onChange={e=>setDraft(current=>current?{...current,passingScore:Number(e.target.value)}:current)}/></label><label>Attempts<input type="number" min={1} max={20} value={draft.maxAttempts??3} onChange={e=>setDraft(current=>current?{...current,maxAttempts:Number(e.target.value)}:current)}/></label></div></>}
    <div className={styles.designSection}><span>BLOCK DESIGN</span><label>Width<select value={draft.config.width} onChange={(event) => updateConfig("width", event.target.value as LmsCourseBlockConfig["width"])}><option value="full">Full width</option><option value="half">Half</option><option value="third">One third</option></select></label><div className={styles.twoFields}><label>Line height<select value={draft.config.lineHeight} onChange={(event) => updateConfig("lineHeight", event.target.value as LmsCourseBlockConfig["lineHeight"])}><option value="compact">Compact</option><option value="normal">Normal</option><option value="relaxed">Relaxed</option><option value="spacious">Spacious</option></select></label><label>Spacing<select value={draft.config.letterSpacing} onChange={(event) => updateConfig("letterSpacing", event.target.value as LmsCourseBlockConfig["letterSpacing"])}><option value="tight">Tight</option><option value="normal">Normal</option><option value="wide">Spacious</option></select></label><label>Padding<select value={draft.config.padding} onChange={(event) => updateConfig("padding", event.target.value as LmsCourseBlockConfig["padding"])}><option value="none">No padding</option><option value="compact">Compact</option><option value="normal">Normal</option><option value="roomy">Spacious</option></select></label><label>Corners<select value={draft.config.radius} onChange={(event) => updateConfig("radius", event.target.value as LmsCourseBlockConfig["radius"])}><option value="none">Square</option><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label><label>Border<select value={draft.config.borderStyle} onChange={(event) => updateConfig("borderStyle", event.target.value as LmsCourseBlockConfig["borderStyle"])}><option value="none">No border</option><option value="solid">Solid</option><option value="dashed">Dashed</option></select></label></div><div className={styles.threeFields}><label>Text<input type="color" value={draft.config.textColor} onChange={(event) => updateConfig("textColor", event.target.value)} /></label><label>Background<input type="color" value={draft.config.backgroundColor} onChange={(event) => updateConfig("backgroundColor", event.target.value)} /></label><label>Border<input type="color" value={draft.config.borderColor} onChange={(event) => updateConfig("borderColor", event.target.value)} /></label></div></div>
    <p role="status" className={styles.editorHint}>{busy ? "Working…" : "Preview updates as you edit. Save changes to keep your work."}</p>
    <BlockDesignOptions busy={busy} config={draft.config} onChange={value=>setDraft(current=>current?{...current,config:{...current.config,...value}}:current)} onUpload={onUpload}/>
    <button className={styles.saveButton} disabled={busy} type="submit">{busy ? "Saving…" : draft.id ? "Save changes" : `Add ${kindLabel(draft.kind).toLowerCase()}`}</button>
  </form>;
}

function CourseBlockPreview({ block, selected, onEdit, onDelete }: { block: LmsCourseBlock; selected: boolean; onEdit: () => void; onDelete: () => void }) {
  const widthClass = block.config.width === "half" ? styles.blockHalf : block.config.width === "third" ? styles.blockThird : styles.blockFull;
  return <article id={`studio-block-${block.id}`} className={`${styles.canvasBlock} ${widthClass} ${selected ? styles.canvasBlockSelected : ""}`} onClick={onEdit}><div className={styles.blockTop}><span>{kindLabel(block.kind)}</span><div><button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }}>Edit</button><button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }}>Delete</button></div></div><BlockContent block={block} /></article>;
}

export function BlockContent({block}: {block:LmsCourseBlock}) {
 const assessment=block.kind==="quiz"||block.kind==="exam";
 return <LessonContent showTitle lesson={{title:block.title,content_type:assessment?"text":block.kind,body:block.body,youtube_url:block.kind==="youtube"?block.url:undefined,resource_url:block.url,content_config:block.config}}>
  {assessment && <div className={styles.assessmentPreview}><span>{block.kind==="exam"?"FINAL ASSESSMENT":"KNOWLEDGE CHECK"}</span><p>{block.question || block.questions?.[0]?.prompt || "Add a question in the properties panel."}</p>{(block.options??[]).filter(Boolean).slice(0,6).map((option,index)=><small key={index}>{String.fromCharCode(65+index)}. {option}</small>)}</div>}
 </LessonContent>;
}

function CoursePreviewModal({ course, blocks, draft, onClose }: { course:LmsCourse;blocks:LmsCourseBlock[];draft:DraftBlock|null;onClose:()=>void }) {
 const combined=draft?draft.id?blocks.map(b=>b.id===draft.id?{...draft,id:draft.id} as LmsCourseBlock:b):[...blocks,{...draft,id:"preview-draft"} as LmsCourseBlock]:blocks;
 const pages=combined.flatMap(block=>block.questions?.length?block.questions.map((q,i)=>({...block,title:block.title+" · Question "+(i+1),question:q.prompt,options:q.options,questions:undefined})): [block]);
 const [index,setIndex]=useState(()=>Math.max(0,pages.findIndex(page=>page.id===(draft?.id??"preview-draft"))));const page=pages[index];
 return <LearningViewer title={"Course preview · "+course.title} onClose={onClose}><small>STUDENT VIEW · {pages.length?index+1:0} / {pages.length}</small>{page?<FitSlide key={page.id+index}><BlockContent block={page}/></FitSlide>:<p>This unit has no content yet.</p>}<nav style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:12}}><button type="button" disabled={index===0} onClick={()=>setIndex(index-1)}>← Back</button><button type="button" onClick={onClose}>Back to editor</button><button type="button" disabled={index>=pages.length-1} onClick={()=>setIndex(index+1)}>Next →</button></nav></LearningViewer>;
}

function kindLabel(kind: LmsCourseBlockKind) {
  return { text: "Text", image: "Image", youtube: "Video", document: "Document", audio: "Audio", quiz: "Quiz", exam: "Exam" }[kind];
}
