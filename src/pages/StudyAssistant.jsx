import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProject } from '@/lib/db';
import { normalizeStudyProject } from '@/lib/studyModel';
import StudyStart from '@/components/study/StudyStart';
import StudyWorkspace from '@/components/study/StudyWorkspace';

export default function StudyAssistant() {
  const [params, setParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const id = params.get('id');

  const loadProject = useCallback(async (pid) => {
    setLoading(true);
    try {
      const p = await getProject(pid);
      if (p && p.type === 'study') {
        setProject(normalizeStudyProject(p));
      } else {
        setProject(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) loadProject(id);
    else { setProject(null); setLoading(false); }
  }, [id, loadProject]);

  const handleCreated = useCallback((proj) => {
    setParams({ id: proj.id }, { replace: true });
    setProject(normalizeStudyProject(proj));
  }, [setParams]);

  const handleExit = useCallback(() => {
    setParams({}, { replace: true });
    setProject(null);
  }, [setParams]);

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground">Loading…</div>;
  }

  if (project) {
    return <StudyWorkspace project={project} onExit={handleExit} onChange={setProject} />;
  }

  return <StudyStart onCreated={handleCreated} />;
}