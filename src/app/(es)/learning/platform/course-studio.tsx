"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

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
  textColor: "#111827",
  backgroundColor: "#FFFFFF",
  borderColor: "#D0D5DD",
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

function fontStack(font: LmsCourseBlockConfig["fontFamily"]) {
  return fontOptions.find((option) => option.value === font)?.stack ?? fontOptions[0].stack;
}

const blockTools: { kind: LmsCourseBlockKind; label: string; mark: string }[] = [
  { kind: "text", label: "Texto", mark: "T" },
  { kind: "image", label: "Imagen", mark: "▧" },
  { kind: "youtube", label: "Video", mark: "▶" },
  { kind: "document", label: "Archivo", mark: "DOC" },
  { kind: "audio", label: "Audio", mark: "♪" },
  { kind: "quiz", label: "Quiz", mark: "?" },
  { kind: "exam", label: "Examen", mark: "✓" },
];

function emptyBlock(kind: LmsCourseBlockKind, position: number): DraftBlock {
  const assessment = kind === "quiz" || kind === "exam";
  return {
    kind,
    title: assessment ? (kind === "exam" ? "Examen final" : "Comprobación de aprendizaje") : `Nuevo bloque de ${kindLabel(kind).toLowerCase()}`,
    body: "",
    url: "",
    position,
    config: { ...defaultConfig },
    question: assessment ? "" : undefined,
    options: assessment ? ["", "", "", ""] : undefined,
    correctAnswer: assessment ? "" : undefined,
    passingScore: assessment ? 80 : undefined,
    maxAttempts: assessment ? (kind === "exam" ? 1 : 3) : undefined,
  };
}

export function CourseStudioWorkspace({ courses, setCourses, onNotify, persistent, organizationId }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LmsCourse | null>(null);
  const [blocks, setBlocks] = useState<LmsCourseBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftBlock | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    level: "A1",
    description: "",
    youtubeUrl: "",
    color: "#6D28D9",
    template: "guided" as "blank" | "guided" | "single",
    passingScore: 80,
  });
  const [settings, setSettings] = useState({ title: "", level: "A1", description: "", color: "#6D28D9" });

  async function openCourse(course: LmsCourse) {
    setEditingCourse(course);
    setSettings({
      title: course.title,
      level: course.level.split(" · ")[0] || "A1",
      description: course.description,
      color: course.color,
    });
    setSelectedId(null);
    setDraft(null);
    if (!persistent || !organizationId || typeof course.id !== "string") {
      setBlocks([]);
      return;
    }
    setLoading(true);
    const result = await loadCourseStudioAction({ organizationId, courseId: course.id });
    setLoading(false);
    if (!result.ok || !result.data) return onNotify(result.message);
    setBlocks(result.data.blocks);
  }

  async function createCourse(event: FormEvent) {
    event.preventDefault();
    if (!newCourse.title.trim()) return;
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
      onNotify("Curso creado como borrador");
    }
    const course: LmsCourse = {
      id,
      title: newCourse.title.trim(),
      level: `${newCourse.level} · Borrador`,
      description: newCourse.description.trim() || "Curso de LevelUp.",
      progress: 0,
      lessons: newCourse.template === "guided" ? 3 : newCourse.template === "single" || newCourse.youtubeUrl ? 1 : 0,
      duration: "Por definir",
      students: 0,
      youtubeUrl: newCourse.youtubeUrl,
      color: newCourse.color,
      published: false,
    };
    setCourses((current) => [...current, course]);
    setNewCourse({ title: "", level: "A1", description: "", youtubeUrl: "", color: "#6D28D9", template: "guided", passingScore: 80 });
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
      onNotify(published ? "Curso publicado" : "Curso movido a borrador");
    }
    const updated = { ...course, published };
    setEditingCourse((current) => current?.id === course.id ? updated : current);
    setCourses((current) => current.map((item) => item.id === course.id ? updated : item));
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
      onNotify("Configuración guardada");
    }
    const updated: LmsCourse = {
      ...editingCourse,
      title: settings.title,
      level: `${settings.level} · ${editingCourse.published ? "Publicado" : "Borrador"}`,
      description: settings.description,
      color: settings.color,
    };
    setEditingCourse(updated);
    setCourses((current) => current.map((course) => course.id === updated.id ? updated : course));
    setBusy(false);
  }

  function startBlock(kind: LmsCourseBlockKind) {
    const nextPosition = Math.max(0, ...blocks.map((block) => block.position)) + 1;
    setSelectedId("new");
    setDraft(emptyBlock(kind, nextPosition));
    setShowPicker(false);
  }

  function selectBlock(block: LmsCourseBlock) {
    setSelectedId(block.id);
    setDraft({ ...block, config: { ...block.config }, options: [...(block.options ?? [])] });
  }

  async function saveBlock(event: FormEvent) {
    event.preventDefault();
    if (!editingCourse || !draft) return;
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
      onNotify(`${kindLabel(draft.kind)} guardado`);
    }
    const alreadyExists = blocks.some((block) => block.id === saved.id);
    setBlocks((current) => alreadyExists
      ? current.map((block) => block.id === saved.id ? saved : block)
      : [...current, saved].sort((a, b) => a.position - b.position));
    setSelectedId(saved.id);
    setDraft({ ...saved, options: [...(saved.options ?? [])] });
    if (!alreadyExists && !["quiz", "exam"].includes(saved.kind)) {
      setCourses((current) => current.map((course) => course.id === editingCourse.id ? { ...course, lessons: course.lessons + 1 } : course));
      setEditingCourse((current) => current ? { ...current, lessons: current.lessons + 1 } : current);
    }
    setBusy(false);
  }

  async function removeBlock(block: LmsCourseBlock) {
    if (!editingCourse || !window.confirm(`¿Eliminar “${block.title}”?`)) return;
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
      onNotify("Bloque eliminado");
    }
    setBlocks((current) => current.filter((item) => item.id !== block.id));
    if (selectedId === block.id) {
      setSelectedId(null);
      setDraft(null);
    }
    setBusy(false);
  }

  async function uploadImage(file?: File) {
    if (!file || !draft || !editingCourse) return;
    if (!persistent || !organizationId || typeof editingCourse.id !== "string") {
      setDraft((current) => current ? { ...current, url: URL.createObjectURL(file) } : current);
      return onNotify("Imagen lista en la vista previa");
    }
    setBusy(true);
    const formData = new FormData();
    formData.set("organizationId", organizationId);
    formData.set("courseId", editingCourse.id);
    formData.set("image", file);
    const result = await uploadCourseImageAction(formData);
    setBusy(false);
    if (!result.ok || !result.data) return onNotify(result.message);
    setDraft((current) => current ? { ...current, url: result.data!.url } : current);
    onNotify(result.message);
  }

  if (editingCourse) {
    return (
      <section className={styles.studio}>
        <header className={styles.studioHeader}>
          <button className={styles.backButton} type="button" onClick={() => { setEditingCourse(null); setDraft(null); }}>
            ← Cursos
          </button>
          <div>
            <span>EDITOR DE CURSO</span>
            <h2>{editingCourse.title}</h2>
          </div>
          <div className={styles.headerActions}>
            <span className={editingCourse.published ? styles.published : styles.draftStatus}>{editingCourse.published ? "Publicado" : "Borrador"}</span>
            <button type="button" className={styles.previewButton} onClick={() => setPreviewOpen(true)}>Vista previa</button>
            <button type="button" className={styles.publishButton} disabled={busy} onClick={() => void togglePublished(editingCourse)}>
              {editingCourse.published ? "Ocultar" : "Publicar"}
            </button>
          </div>
        </header>

        <div className={styles.studioGrid}>
          <aside className={styles.outlinePanel}>
            <div className={styles.panelTitle}><span>ESTRUCTURA</span><strong>Contenido</strong></div>
            <button className={selectedId === "settings" ? styles.outlineActive : ""} onClick={() => { setSelectedId("settings"); setDraft(null); }} type="button">
              <i>⚙</i><span><strong>Configuración</strong><small>Nombre, nivel y portada</small></span>
            </button>
            <div className={styles.moduleLabel}><span>MÓDULO 1</span><small>{blocks.length} bloques</small></div>
            <div className={styles.outlineList}>
              {blocks.map((block, index) => (
                <button className={selectedId === block.id ? styles.outlineActive : ""} key={block.id} type="button" onClick={() => selectBlock(block)}>
                  <i>{index + 1}</i><span><strong>{block.title}</strong><small>{kindLabel(block.kind)}</small></span>
                </button>
              ))}
            </div>
            <button className={styles.addOutline} type="button" aria-expanded={showPicker} onClick={() => setShowPicker((current) => !current)}>+ Agregar contenido</button>
            {showPicker && <div className={styles.outlinePicker} aria-label="Seleccionar tipo de contenido">{blockTools.map((tool) => <button key={tool.kind} type="button" onClick={() => startBlock(tool.kind)}><i>{tool.mark}</i><span>{tool.label}</span></button>)}</div>}
          </aside>

          <main className={styles.canvasPanel}>
            <div className={styles.canvasTop}>
              <div><span>LIENZO DEL CURSO</span><strong>Módulo 1</strong></div>
              <span>{blocks.length} elementos</span>
            </div>
            <div className={styles.toolShelf} aria-label="Agregar contenido">
              {blockTools.map((tool) => <button key={tool.kind} type="button" onClick={() => startBlock(tool.kind)}><i>{tool.mark}</i><span>{tool.label}</span></button>)}
            </div>
            {loading ? <div className={styles.loadingState}>Cargando contenido…</div> : blocks.length ? (
              <div className={styles.canvasGrid}>
                {blocks.map((block) => (
                  <CourseBlockPreview
                    block={block}
                    key={block.id}
                    selected={selectedId === block.id}
                    onEdit={() => selectBlock(block)}
                    onDelete={() => void removeBlock(block)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyCanvas}>
                <span>＋</span>
                <strong>Comienza a construir la lección</strong>
                <p>Agrega texto, imágenes, video, archivos o una evaluación desde la barra superior.</p>
                <button type="button" onClick={() => startBlock("text")}>Agregar el primer bloque</button>
              </div>
            )}
          </main>

          <aside className={styles.inspectorPanel} id="course-properties">
            {selectedId === "settings" ? (
              <CourseSettingsForm settings={settings} setSettings={setSettings} busy={busy} onSubmit={saveCourseSettings} />
            ) : draft ? (
              <BlockInspector draft={draft} setDraft={setDraft} busy={busy} onSubmit={saveBlock} onUpload={uploadImage} />
            ) : (
              <div className={styles.inspectorEmpty}>
                <span>PROPIEDADES</span>
                <strong>Selecciona un bloque</strong>
                <p>Las herramientas de edición aparecerán aquí.</p>
              </div>
            )}
          </aside>
        </div>
        {previewOpen && <CoursePreviewModal course={editingCourse} blocks={blocks} draft={draft?.id ? null : draft} onClose={() => setPreviewOpen(false)} />}
      </section>
    );
  }

  return (
    <section className={styles.catalog}>
      <div className={styles.catalogToolbar}>
        <label><span>⌕</span><input placeholder="Buscar cursos" /></label>
        <div><button type="button">Todos</button><button type="button">Publicados</button><button type="button">Borradores</button></div>
        <button className={styles.createButton} type="button" onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Cerrar" : "+ Crear curso"}</button>
      </div>

      {showCreate && (
        <form className={styles.createPanel} onSubmit={createCourse}>
          <div className={styles.createHeading}><div><span>NUEVO CURSO</span><h2>Información inicial</h2><p>Empieza con lo esencial; luego podrás diseñar cada lección en el editor.</p></div><button type="button" onClick={() => setShowCreate(false)}>×</button></div>
          <div className={styles.createGrid}>
            <label className={styles.wide}>Nombre del curso<input value={newCourse.title} onChange={(event) => setNewCourse((current) => ({ ...current, title: event.target.value }))} placeholder="Ej. Business English B1" required /></label>
            <label>Nivel<select value={newCourse.level} onChange={(event) => setNewCourse((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label>
            <label>Color de portada<div className={styles.colorInput}><input type="color" value={newCourse.color} onChange={(event) => setNewCourse((current) => ({ ...current, color: event.target.value }))} /><span>{newCourse.color.toUpperCase()}</span></div></label>
            <label>Plantilla inicial<select value={newCourse.template} onChange={(event) => setNewCourse((current) => ({ ...current, template: event.target.value as "blank" | "guided" | "single" }))}><option value="guided">Estructura guiada</option><option value="single">Una lección inicial</option><option value="blank">Curso en blanco</option></select></label>
            <label>Nota mínima<input type="number" min="0" max="100" value={newCourse.passingScore} onChange={(event) => setNewCourse((current) => ({ ...current, passingScore: Number(event.target.value) }))} /></label>
            <label className={styles.full}>Descripción<textarea value={newCourse.description} onChange={(event) => setNewCourse((current) => ({ ...current, description: event.target.value }))} placeholder="¿Qué aprenderá el estudiante?" /></label>
            <label className={styles.full}>Video inicial de YouTube <small>(opcional)</small><input type="url" value={newCourse.youtubeUrl} onChange={(event) => setNewCourse((current) => ({ ...current, youtubeUrl: event.target.value }))} placeholder="https://www.youtube.com/watch?v=..." /></label>
          </div>
          <div className={styles.createActions}><button type="button" onClick={() => setShowCreate(false)}>Cancelar</button><button className={styles.createButton} disabled={busy} type="submit">{busy ? "Creando…" : "Crear y abrir editor"}</button></div>
        </form>
      )}

      <div className={styles.courseGrid}>
        {courses.map((course) => (
          <article className={styles.courseCard} key={course.id}>
            <button className={styles.courseCover} style={{ background: `linear-gradient(135deg, ${course.color}, #111827)` }} type="button" onClick={() => void openCourse(course)}>
              <span>{course.level.split(" · ")[0]}</span><i>▤</i><small>{course.published ? "PUBLICADO" : "BORRADOR"}</small>
            </button>
            <div className={styles.courseBody}>
              <span className={course.published ? styles.published : styles.draftStatus}>{course.published ? "Publicado" : "Borrador"}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className={styles.courseMeta}><span>{course.lessons} contenidos</span><span>{course.students} estudiantes</span></div>
              <div className={styles.courseActions}><button type="button" onClick={() => void openCourse(course)}>Abrir editor</button><button type="button" disabled={busy} onClick={() => void togglePublished(course)}>{course.published ? "Ocultar" : "Publicar"}</button></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CourseSettingsForm({ settings, setSettings, busy, onSubmit }: {
  settings: { title: string; level: string; description: string; color: string };
  setSettings: React.Dispatch<React.SetStateAction<{ title: string; level: string; description: string; color: string }>>;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
}) {
  return <form className={styles.inspectorForm} onSubmit={onSubmit}><div className={styles.inspectorTitle}><span>CONFIGURACIÓN</span><strong>Datos del curso</strong></div><label>Nombre<input value={settings.title} onChange={(event) => setSettings((current) => ({ ...current, title: event.target.value }))} required /></label><label>Nivel<select value={settings.level} onChange={(event) => setSettings((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label><label>Descripción<textarea value={settings.description} onChange={(event) => setSettings((current) => ({ ...current, description: event.target.value }))} /></label><label>Color de portada<div className={styles.colorInput}><input type="color" value={settings.color} onChange={(event) => setSettings((current) => ({ ...current, color: event.target.value }))} /><span>{settings.color.toUpperCase()}</span></div></label><button className={styles.saveButton} disabled={busy} type="submit">{busy ? "Guardando…" : "Guardar cambios"}</button></form>;
}

function BlockInspector({ draft, setDraft, busy, onSubmit, onUpload }: {
  draft: DraftBlock;
  setDraft: React.Dispatch<React.SetStateAction<DraftBlock | null>>;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  onUpload: (file?: File) => void | Promise<void>;
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
    <div className={styles.inspectorTitle}><span>{kindLabel(draft.kind).toUpperCase()}</span><strong>{draft.id ? "Editar bloque" : "Nuevo bloque"}</strong></div>
    <label>Título<input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} required /></label>
    {draft.kind === "text" && <>
      <label>Estilo de texto<select aria-label="Estilo de texto" value={draft.config.textStyle} onChange={(event) => updateConfig("textStyle", event.target.value as LmsCourseBlockConfig["textStyle"])}><option value="paragraph">Párrafo</option><option value="heading1">Título principal</option><option value="heading2">Título de sección</option><option value="heading3">Subtítulo</option><option value="quote">Cita</option><option value="callout">Destacado</option></select></label>
      <div className={styles.formatToolbar}>
        <select aria-label="Fuente" value={draft.config.fontFamily} onChange={(event) => updateConfig("fontFamily", event.target.value as LmsCourseBlockConfig["fontFamily"])}>{fontOptions.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select>
        <select aria-label="Tamaño" value={draft.config.fontSize} onChange={(event) => updateConfig("fontSize", event.target.value as LmsCourseBlockConfig["fontSize"])}><option value="xs">Extra pequeño</option><option value="small">Pequeño</option><option value="normal">Normal</option><option value="large">Grande</option><option value="xl">Extra grande</option><option value="title">Título</option><option value="display">Display</option></select>
        <button title="Negrita" className={draft.config.bold ? styles.formatActive : ""} type="button" onClick={() => updateConfig("bold", !draft.config.bold)}><b>B</b></button>
        <button title="Cursiva" className={draft.config.italic ? styles.formatActive : ""} type="button" onClick={() => updateConfig("italic", !draft.config.italic)}><i>I</i></button>
        <button title="Subrayado" className={draft.config.underline ? styles.formatActive : ""} type="button" onClick={() => updateConfig("underline", !draft.config.underline)}><u>U</u></button>
      </div>
      <div className={styles.extendedToolbar}><button title="Tachado" className={draft.config.strikethrough ? styles.formatActive : ""} type="button" onClick={() => updateConfig("strikethrough", !draft.config.strikethrough)}>S̶</button><button title="Mayúsculas" className={draft.config.uppercase ? styles.formatActive : ""} type="button" onClick={() => updateConfig("uppercase", !draft.config.uppercase)}>AA</button><button type="button" onClick={() => toggleList(false)}>• Lista</button><button type="button" onClick={() => toggleList(true)}>1. Lista</button><button type="button" onClick={() => updateBody(`${draft.body}${draft.body ? "\n" : ""}[Texto del enlace](https://)`)}>Enlace</button></div>
      <div className={styles.alignmentToolbar}><span>Alinear</span>{(["left", "center", "right", "justify"] as const).map((align) => <button title={align} className={draft.config.align === align ? styles.formatActive : ""} key={align} type="button" onClick={() => updateConfig("align", align)}>{align === "left" ? "≡" : align === "center" ? "≣" : align === "right" ? "☰" : "▤"}</button>)}</div>
      <label>Contenido<textarea className={styles.contentTextarea} value={draft.body} onChange={(event) => updateBody(event.target.value)} placeholder="Escribe el contenido de la lección…" /></label>
      <div className={styles.liveSample} style={blockVisualStyle({ ...draft, id: draft.id ?? "draft" })}><small>VISTA EN VIVO</small><strong>{draft.title || "Título del bloque"}</strong><p>{draft.body || "El formato seleccionado se mostrará aquí."}</p></div>
    </>}
    {draft.kind === "image" && <><label className={styles.uploadBox}>Cargar imagen<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void onUpload(event.target.files?.[0])} /><span>PNG, JPG o WEBP · máximo 2 MB</span></label><label>O usar enlace<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://..." /></label><label>Texto alternativo<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} placeholder="Describe la imagen" /></label></>}
    {draft.kind === "youtube" && <><label>Enlace de YouTube<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://www.youtube.com/watch?v=..." required /></label><label>Instrucciones<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} /></label></>}
    {draft.kind === "document" && <><label>Enlace del archivo<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://..." required /></label><label>Descripción<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} /></label></>}
    {draft.kind === "audio" && <><label>Enlace del audio<input type="url" value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} placeholder="https://..." required /></label><label>Descripción o transcripción<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} /></label></>}
    {assessment && <><label>Instrucciones<textarea value={draft.body} onChange={(event) => updateBody(event.target.value)} placeholder="Indicaciones para el estudiante" /></label><label>Pregunta<textarea value={draft.question ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, question: event.target.value } : current)} required /></label><fieldset className={styles.optionsField}><legend>Opciones de respuesta</legend>{(draft.options ?? []).map((option, index) => <label key={index}><span>{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => setDraft((current) => { if (!current) return current; const options = [...(current.options ?? [])]; options[index] = event.target.value; return { ...current, options }; })} required={index < 2} /></label>)}{(draft.options?.length ?? 0) < 6 && <button type="button" onClick={() => setDraft((current) => current ? { ...current, options: [...(current.options ?? []), ""] } : current)}>+ Agregar opción</button>}</fieldset><label>Respuesta correcta<select value={draft.correctAnswer ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, correctAnswer: event.target.value } : current)} required><option value="">Seleccionar</option>{(draft.options ?? []).filter(Boolean).map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}</select></label><div className={styles.twoFields}><label>Nota mínima<input type="number" min="0" max="100" value={draft.passingScore ?? 80} onChange={(event) => setDraft((current) => current ? { ...current, passingScore: Number(event.target.value) } : current)} /></label><label>Intentos<input type="number" min="1" max="20" value={draft.maxAttempts ?? 3} onChange={(event) => setDraft((current) => current ? { ...current, maxAttempts: Number(event.target.value) } : current)} /></label></div></>}
    <div className={styles.designSection}><span>DISEÑO DEL BLOQUE</span><label>Ancho<select value={draft.config.width} onChange={(event) => updateConfig("width", event.target.value as LmsCourseBlockConfig["width"])}><option value="full">Ancho completo</option><option value="half">Mitad</option><option value="third">Un tercio</option></select></label><div className={styles.twoFields}><label>Interlineado<select value={draft.config.lineHeight} onChange={(event) => updateConfig("lineHeight", event.target.value as LmsCourseBlockConfig["lineHeight"])}><option value="compact">Compacto</option><option value="normal">Normal</option><option value="relaxed">Relajado</option><option value="spacious">Amplio</option></select></label><label>Espaciado<select value={draft.config.letterSpacing} onChange={(event) => updateConfig("letterSpacing", event.target.value as LmsCourseBlockConfig["letterSpacing"])}><option value="tight">Cerrado</option><option value="normal">Normal</option><option value="wide">Amplio</option></select></label><label>Relleno<select value={draft.config.padding} onChange={(event) => updateConfig("padding", event.target.value as LmsCourseBlockConfig["padding"])}><option value="none">Sin relleno</option><option value="compact">Compacto</option><option value="normal">Normal</option><option value="roomy">Amplio</option></select></label><label>Esquinas<select value={draft.config.radius} onChange={(event) => updateConfig("radius", event.target.value as LmsCourseBlockConfig["radius"])}><option value="none">Rectas</option><option value="small">Pequeñas</option><option value="medium">Medianas</option><option value="large">Grandes</option></select></label><label>Borde<select value={draft.config.borderStyle} onChange={(event) => updateConfig("borderStyle", event.target.value as LmsCourseBlockConfig["borderStyle"])}><option value="none">Sin borde</option><option value="solid">Sólido</option><option value="dashed">Discontinuo</option></select></label></div><div className={styles.threeFields}><label>Texto<input type="color" value={draft.config.textColor} onChange={(event) => updateConfig("textColor", event.target.value)} /></label><label>Fondo<input type="color" value={draft.config.backgroundColor} onChange={(event) => updateConfig("backgroundColor", event.target.value)} /></label><label>Borde<input type="color" value={draft.config.borderColor} onChange={(event) => updateConfig("borderColor", event.target.value)} /></label></div></div>
    <button className={styles.saveButton} disabled={busy} type="submit">{busy ? "Guardando…" : draft.id ? "Guardar cambios" : `Agregar ${kindLabel(draft.kind).toLowerCase()}`}</button>
  </form>;
}

function blockVisualStyle(block: LmsCourseBlock): React.CSSProperties {
  const decoration = [block.config.underline && "underline", block.config.strikethrough && "line-through"].filter(Boolean).join(" ") || "none";
  return {
    color: block.config.textColor,
    backgroundColor: block.config.backgroundColor,
    border: block.config.borderStyle === "none" ? "none" : `1px ${block.config.borderStyle} ${block.config.borderColor}`,
    borderRadius: { none: 0, small: 5, medium: 10, large: 18 }[block.config.radius],
    padding: { none: 0, compact: 12, normal: 18, roomy: 28 }[block.config.padding],
    textAlign: block.config.align,
    fontFamily: fontStack(block.config.fontFamily),
    fontSize: { xs: "11px", small: "13px", normal: "15px", large: "19px", xl: "23px", title: "29px", display: "38px" }[block.config.fontSize],
    fontWeight: block.config.bold || block.config.textStyle.startsWith("heading") ? 800 : 500,
    fontStyle: block.config.italic || block.config.textStyle === "quote" ? "italic" : "normal",
    textDecoration: decoration,
    textTransform: block.config.uppercase ? "uppercase" : "none",
    lineHeight: { compact: 1.25, normal: 1.55, relaxed: 1.75, spacious: 2 }[block.config.lineHeight],
    letterSpacing: { tight: "-.02em", normal: "normal", wide: ".08em" }[block.config.letterSpacing],
    boxShadow: block.config.textStyle === "callout" ? `inset 4px 0 ${block.config.borderColor}` : undefined,
  };
}

function CourseBlockPreview({ block, selected, onEdit, onDelete }: { block: LmsCourseBlock; selected: boolean; onEdit: () => void; onDelete: () => void }) {
  const widthClass = block.config.width === "half" ? styles.blockHalf : block.config.width === "third" ? styles.blockThird : styles.blockFull;
  return <article className={`${styles.canvasBlock} ${widthClass} ${selected ? styles.canvasBlockSelected : ""}`} onClick={onEdit}><div className={styles.blockTop}><span>{kindLabel(block.kind)}</span><div><button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }}>Editar</button><button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }}>Eliminar</button></div></div><BlockContent block={block} /></article>;
}

function BlockContent({ block }: { block: LmsCourseBlock }) {
  return <div className={`${styles.blockVisual} ${block.config.textStyle === "quote" ? styles.quoteBlock : ""}`} style={blockVisualStyle(block)}><strong>{block.title}</strong>{block.kind === "text" && <p>{block.body || "Agrega contenido desde el panel de propiedades."}</p>}{block.kind === "image" && (block.url ? <Image src={block.url} alt={block.body || block.title} width={900} height={500} unoptimized /> : <div className={styles.mediaPlaceholder}>Imagen</div>)}{block.kind === "youtube" && <div className={styles.videoPreview}><i>▶</i><span>{block.url ? "Video de YouTube" : "Agrega el enlace del video"}</span></div>}{block.kind === "document" && <div className={styles.resourcePreview}><i>DOC</i><span>{block.body || "Documento descargable"}</span></div>}{block.kind === "audio" && <div className={styles.resourcePreview}><i>♪</i><span>{block.body || "Recurso de audio"}</span></div>}{(block.kind === "quiz" || block.kind === "exam") && <div className={styles.assessmentPreview}><span>{block.kind === "exam" ? "EVALUACIÓN FINAL" : "COMPROBACIÓN"}</span><p>{block.question || "Agrega la pregunta en el panel de propiedades."}</p>{(block.options ?? []).filter(Boolean).slice(0, 6).map((option, index) => <small key={`${option}-${index}`}>{String.fromCharCode(65 + index)}. {option}</small>)}</div>}</div>;
}

function CoursePreviewModal({ course, blocks, draft, onClose }: { course: LmsCourse; blocks: LmsCourseBlock[]; draft: DraftBlock | null; onClose: () => void }) {
  const previewBlocks = draft ? [...blocks, { ...draft, id: "preview-draft" } as LmsCourseBlock] : blocks;
  return <div className={styles.previewOverlay} role="dialog" aria-modal="true" aria-label="Vista previa del curso"><div className={styles.previewShell}><header><div><span>VISTA DEL ESTUDIANTE</span><h2>{course.title}</h2><p>{course.description}</p></div><button type="button" onClick={onClose} aria-label="Cerrar vista previa">×</button></header><div className={styles.previewMeta}><span>{course.level.split(" · ")[0]}</span><span>{previewBlocks.length} contenidos</span><span>{course.published ? "Publicado" : "Borrador"}</span></div><main className={styles.studentPreviewGrid}>{previewBlocks.length ? previewBlocks.map((block) => <article className={block.config.width === "half" ? styles.blockHalf : block.config.width === "third" ? styles.blockThird : styles.blockFull} key={block.id}><BlockContent block={block} /></article>) : <div className={styles.previewEmpty}>Este curso todavía no tiene contenido.</div>}</main><footer><button type="button" onClick={onClose}>Volver al editor</button></footer></div></div>;
}

function kindLabel(kind: LmsCourseBlockKind) {
  return { text: "Texto", image: "Imagen", youtube: "Video", document: "Documento", audio: "Audio", quiz: "Quiz", exam: "Examen" }[kind];
}
