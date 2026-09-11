// Export a Study Pack PDF (Summary, Key Points, Q&A, Flashcards, Notes).
// Multi-language + RTL via html2canvas (browser-rendered) + jsPDF.
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphs(text) {
  return esc(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

function sectionHtml(sections, content, t, lang) {
  const parts = [];
  if (sections.summary && content.summary?.text) {
    parts.push(`<h2>${esc(t('study.ws.summary'))}</h2>${paragraphs(content.summary.text)}`);
  }
  if (sections.keyPoints && content.keyPoints?.length) {
    parts.push(`<h2>${esc(t('study.ws.keyPoints'))}</h2><ul>${content.keyPoints.map((k) => `<li>${esc(k.text)}</li>`).join('')}</ul>`);
  }
  if (sections.questions && content.questions?.length) {
    parts.push(`<h2>${esc(t('study.ws.questions'))}</h2>` + content.questions.map((q, i) =>
      `<div class="qa"><p class="qq"><b>Q${i + 1}.</b> ${esc(q.question)}</p><p class="aa"><b>${esc(t('study.quiz.reference'))}:</b> ${esc(q.answer)}</p></div>`
    ).join(''));
  }
  if (sections.flashcards && content.flashcards?.length) {
    parts.push(`<h2>${esc(t('study.ws.flashcards'))}</h2>` + content.flashcards.map((c, i) =>
      `<div class="qa"><p class="qq"><b>${esc(t('study.fc.front'))} ${i + 1}.</b> ${esc(c.front)}</p><p class="aa"><b>${esc(t('study.fc.back'))}:</b> ${esc(c.back)}</p></div>`
    ).join(''));
  }
  if (sections.notes && content.notes) {
    // notes is html already
    parts.push(`<h2>${esc(t('study.ws.notes'))}</h2><div class="notes">${content.notes}</div>`);
  }
  return parts.join('');
}

// Print-friendly view: opens the rendered HTML in a new window and triggers print.
export async function printStudyPack(project, opts, t) {
  const { sections, cover, studentName, subject, date } = opts;
  const content = project.content;
  const lang = content.outLang === 'same' ? null : content.outLang;
  const rtl = lang === 'ku' || lang === 'ar';
  const html = await buildHtml(project, { sections, cover, studentName, subject, date }, t, rtl);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<html dir="${rtl ? 'rtl' : 'ltr'}"><head><title>${project.name}</title><style>
    body{font-family:${rtl ? '"Noto Naskh Arabic","Vazirmatn",sans-serif' : 'Inter,sans-serif'};padding:32px;color:#0f172a;line-height:1.6;}
    h2{border-bottom:2px solid #6366f1;padding-bottom:6px;color:#4338ca;}
    .qa{border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin:8px 0;}
    ul{padding-inline-start:20px;}
  </style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

async function buildHtml(project, opts, t, rtl) {
  const { sections, cover, studentName, subject, date } = opts;
  const content = project.content;
  let html = '';
  if (cover) {
    html += `<div style="text-align:center;padding:60px 0;">
      <h1>${esc(project.name)}</h1>
      ${studentName ? `<p>${esc(studentName)}</p>` : ''}
      ${subject ? `<p>${esc(subject)}</p>` : ''}
      ${date ? `<p>${esc(date)}</p>` : ''}
    </div>`;
  }
  html += sectionHtml(sections, content, t, rtl ? content.outLang : null);
  return html;
}

export async function exportStudyPack(project, opts, t) {
  const { sections, cover, studentName, subject, date } = opts;
  const content = project.content;
  const lang = content.outLang === 'same' ? null : content.outLang;
  const rtl = lang === 'ku' || lang === 'ar';

  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:794px;background:#fff;padding:48px 56px;box-sizing:border-box;font-family:${rtl ? '"Noto Naskh Arabic","Vazirmatn",sans-serif' : 'Inter,sans-serif'};color:#0f172a;direction:${rtl ? 'rtl' : 'ltr'};line-height:1.6;`;

  let html = '';
  if (cover) {
    html += `<div style="text-align:center;padding:80px 0 40px;">
      <h1 style="font-size:30px;margin:0 0 12px;">${esc(project.name)}</h1>
      ${studentName ? `<p style="font-size:16px;color:#475569;margin:4px 0;">${esc(studentName)}</p>` : ''}
      ${subject ? `<p style="font-size:14px;color:#64748b;margin:4px 0;">${esc(subject)}</p>` : ''}
      ${date ? `<p style="font-size:14px;color:#64748b;margin:4px 0;">${esc(date)}</p>` : ''}
    </div><div style="page-break-after:always;height:0;"></div>`;
  }
  html += `<style>
    h2 { font-size:20px; border-bottom:2px solid #6366f1; padding-bottom:6px; margin:24px 0 12px; color:#4338ca; }
    p { margin:0 0 8px; }
    ul { padding-inline-start:20px; } li { margin:4px 0; }
    .qa { border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin:8px 0; }
    .qq { font-weight:600; margin:0 0 6px; }
    .aa { color:#334155; margin:0; }
    .notes { white-space:pre-wrap; }
  </style>`;
  html += sectionHtml(sections, content, t, lang);

  container.innerHTML = html || '<p>No content selected.</p>';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    const name = `${project.name.replace(/[^\w\u0600-\u06FF-]+/g, '_')}_studypack.pdf`;
    pdf.save(name);
  } finally {
    document.body.removeChild(container);
  }
}