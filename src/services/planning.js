import { workspace } from './workspace';
import { getActiveProfileId, generateId, notifyDataUpdated, getAccounts } from './storage';
export function getPlanning() {
  return JSON.parse(
    workspace.getItem(`planning_${getActiveProfileId()}`) ||
      '{"goals":[],"recurring":[],"completedLessons":[]}'
  );
}
function write(data) {
  workspace.setItem(`planning_${getActiveProfileId()}`, JSON.stringify(data));
  notifyDataUpdated();
}
export function saveGoal(goal) {
  const data = getPlanning(),
    account = getAccounts().find(
      (a) => a.id === goal.accountId && ['savings', 'current', 'cash'].includes(a.type)
    );
  if (!account) throw new Error('Choose a bank or cash account.');
  if (
    !goal.name?.trim() ||
    !Number.isFinite(goal.target) ||
    goal.target <= 0 ||
    !Number.isFinite(goal.allocated) ||
    goal.allocated < 0 ||
    goal.allocated > goal.target
  )
    throw new Error('Check the goal name, target and allocation.');
  const reserved = data.goals
    .filter((g) => g.id !== goal.id && g.accountId === goal.accountId)
    .reduce((s, g) => s + g.allocated, 0);
  if (reserved + goal.allocated > account.balance)
    throw new Error('Your goals would allocate more than this account holds.');
  const next = { ...goal, id: goal.id || generateId('goal') };
  data.goals = [...data.goals.filter((g) => g.id !== next.id), next];
  write(data);
  return next;
}
export function saveRecurring(item) {
  if (
    !item.name?.trim() ||
    !Number.isFinite(item.amount) ||
    item.amount <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(item.nextDue) ||
    !['weekly', 'monthly', 'yearly'].includes(item.frequency)
  )
    throw new Error('Check the commitment details.');
  const data = getPlanning(),
    next = { ...item, id: item.id || generateId('rec') };
  data.recurring = [...data.recurring.filter((r) => r.id !== next.id), next];
  write(data);
}
export function removePlanItem(kind, id) {
  const data = getPlanning();
  data[kind] = data[kind].filter((x) => x.id !== id);
  write(data);
}
export function completeLesson(id) {
  const data = getPlanning();
  data.completedLessons = [...new Set([...data.completedLessons, id])];
  write(data);
}
