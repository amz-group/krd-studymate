import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProject } from '@/lib/db';
import { normalizeReportContent } from '@/lib/reportModel';
import ReportStart from '@/components/report/ReportStart';
import ReportEditor from '@/components/report/ReportEditor';

export default function ReportAssignment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    let alive = true;
    if (!id) { setProject(null); setLoading(false); return; }
    setLoading(true);
    getProject(id).then((p) => {
      if (!alive) return;
      if (!p || p.type !== 'report') { navigate('/report-assignment'); return; }
      setProject({ ...p, content: normalizeReportContent(p.content) });
      setLoading(false);
    }).catch(() => { if (alive) navigate('/report-assignment'); });
    return () => { alive = false; };
  }, [id, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!id || !project) return <ReportStart />;

  return <ReportEditor project={project} onExit={() => navigate('/report-assignment')} />;
}