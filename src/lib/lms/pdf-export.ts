import { jsPDF } from "jspdf";
import type { studentCourseAction } from "@/app/(es)/learning/platform/student-actions";

export async function downloadCertificate(value: {
  id: string;
  student_name: string;
  course_title: string;
  score: number | null;
  issued_at: string;
}) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.setDrawColor("#2C55A2");
  pdf.setLineWidth(2);
  pdf.rect(12, 12, 273, 186);
  pdf.setTextColor("#2C55A2");
  pdf.setFontSize(28);
  pdf.text("LEVEL UP ACADEMY", 148.5, 42, { align: "center" });
  pdf.setFontSize(16);
  pdf.text("CERTIFICATE OF COMPLETION", 148.5, 62, { align: "center" });
  pdf.setFontSize(24);
  pdf.text(value.student_name, 148.5, 96, { align: "center" });
  pdf.setFontSize(14);
  pdf.text("has successfully completed", 148.5, 113, { align: "center" });
  pdf.setFontSize(18);
  pdf.text(pdf.splitTextToSize(value.course_title, 240), 148.5, 132, {
    align: "center",
  });
  pdf.setFontSize(11);
  pdf.text(
    `${value.score === null ? "" : `Assessment score: ${Number(value.score).toFixed(1)}% · `}Issued ${new Date(value.issued_at).toLocaleDateString("en-US")}`,
    148.5,
    162,
    { align: "center" },
  );
  pdf.setFontSize(8);
  pdf.text(`Credential ${value.id}`, 148.5, 183, { align: "center" });
  pdf.save(`level-up-certificate-${value.id}.pdf`);
}

export async function downloadTheory(
  course: Awaited<ReturnType<typeof studentCourseAction>>,
  student: string,
) {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1280, 720],
  });
  let count = 0;
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PDF export is unavailable.");
  const loadImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image unavailable"));
      image.src = url;
    });
  const logo = await loadImage("/brand/level-up/mark-transparent.png").catch(
    () => null,
  );
  let y = 0;
  function start(title: string) {
    ctx!.fillStyle = "#ffffff";
    ctx!.fillRect(0, 0, 1280, 720);
    ctx!.save();
    ctx!.translate(640, 360);
    ctx!.rotate(-0.35);
    ctx!.fillStyle = "rgba(44,85,162,.09)";
    ctx!.font = "bold 48px Arial";
    ctx!.textAlign = "center";
    ctx!.fillText(`LEVEL UP · ${student}`, 0, 0);
    ctx!.restore();
    ctx!.fillStyle = "#2C55A2";
    ctx!.font = "bold 30px Arial";
    ctx!.fillText(title.slice(0, 78), 60, 70);
    ctx!.fillStyle = "#17243c";
    ctx!.font = "22px Arial";
    y = 120;
  }
  function flush() {
    if (count++) pdf.addPage([1280, 720], "landscape");
    ctx!.save();
    ctx!.globalAlpha = 0.07;
    if (logo) ctx!.drawImage(logo, 520, 250, 240, 180);
    ctx!.translate(640, 440);
    ctx!.rotate(-0.35);
    ctx!.fillStyle = "#2c55a2";
    ctx!.font = "bold 30px Arial";
    ctx!.textAlign = "center";
    ctx!.fillText(student, 0, 0);
    ctx!.restore();
    ctx!.fillStyle = "#7b8490";
    ctx!.font = "14px Arial";
    ctx!.fillText(
      `${student} · Personal study copy · ${course.course.title}`,
      60,
      690,
    );
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 1280, 720);
  }
  function line(text: string, title: string) {
    if (y > 640) {
      flush();
      start(title + " · continued");
    }
    ctx!.fillStyle = "#17243c";
    ctx!.font = "22px Arial";
    ctx!.fillText(text, 60, y);
    y += 32;
  }
  for (const lesson of course.lessons) {
    start(lesson.title);
    const body = lesson.body || lesson.description || "";
    for (const paragraph of body.split("\n")) {
      let current = "";
      for (const word of paragraph.split(/\s+/)) {
        if (ctx.measureText(current + word).width > 1150) {
          line(current, lesson.title);
          current = "";
        }
        current += word + " ";
      }
      line(current, lesson.title);
    }
    const picture =
      lesson.content_type === "image"
        ? lesson.resource_url
        : lesson.content_config?.imageUrl;
    if (picture) {
      const image = await loadImage(String(picture)).catch(() => null);
      if (image) {
        const ratio = Math.min(1150 / image.width, 430 / image.height),
          height = image.height * ratio;
        if (y + height > 645) {
          flush();
          start(lesson.title);
        }
        ctx.drawImage(
          image,
          (1280 - image.width * ratio) / 2,
          y,
          image.width * ratio,
          height,
        );
        y += height + 15;
      } else line("An image is available in your online unit.", lesson.title);
    } else if (lesson.content_type !== "text")
      line("Additional media is available in your online unit.", lesson.title);
    flush();
  }
  if (!count) throw new Error("No theory content is available.");
  pdf.save(`level-up-study-${course.course.id}.pdf`);
}
