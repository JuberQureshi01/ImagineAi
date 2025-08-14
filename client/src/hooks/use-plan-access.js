
import { useAuth } from '@/context/AuthContext';

export function usePlanAccess() {
  const { user } = useAuth();
  const isPro = user?.plan === 'pro';
  const isFree = !isPro;

  const planAccess = {
    resize: true,
    crop: true,
    filters: true,
    adjust: true,
    text: true,
    generative_edit: isPro,  
    background: isPro,
    ai_extender: isPro,
    ai_edit: isPro,
  };

  const hasAccess = (toolId) => {
    if (!toolId || planAccess[toolId] === undefined) {
      return false;
    }
    return planAccess[toolId] === true;
  };

  const getRestrictedTools = () => {
    return Object.entries(planAccess)
      .filter(([_, hasAccess]) => !hasAccess)
      .map(([toolId]) => toolId);
  };

  const canCreateProject = (currentProjectCount) => {
    if (isPro) return true;
    if (!user) return false;
    return currentProjectCount < 3;
  };

  const canExport = (currentExportsThisMonth) => {
    if (isPro) return true;
    if (!user) return false;
    return currentExportsThisMonth < 20;
  };

  return {
    userPlan: isPro ? 'pro' : 'free',
    isPro,
    isFree,
    hasAccess,
    planAccess,
    getRestrictedTools,
    canCreateProject,
    canExport,
  };
}