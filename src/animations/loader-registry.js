/**
 * Boot progress, tracked outside React.
 *
 * The preloader must report real work, not a scripted timer — so every
 * subsystem that must be ready before the hero is revealed registers a task
 * here and completes it when it genuinely finishes. The WebGL stage, the
 * fonts and the hero's critical imagery all report through the same channel.
 */

const tasks = new Map();
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

export function addTask(name, weight = 1) {
  if (tasks.has(name)) return;
  tasks.set(name, { weight, done: false });
  notify();
}

export function completeTask(name) {
  const task = tasks.get(name);
  if (!task || task.done) return;
  task.done = true;
  notify();
}

/** 0 → 1. An empty registry reads as complete, never as stuck at zero. */
export function getProgress() {
  if (tasks.size === 0) return 1;
  let total = 0;
  let done = 0;
  tasks.forEach((task) => {
    total += task.weight;
    if (task.done) done += task.weight;
  });
  return total === 0 ? 1 : done / total;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Registers the tasks that exist before any component mounts. */
export function registerBootTasks(criticalImages = []) {
  addTask('document', 2);
  addTask('fonts', 2);
  criticalImages.forEach((src) => addTask(`image:${src}`, 1));

  if (document.readyState === 'complete') {
    completeTask('document');
  } else {
    window.addEventListener('load', () => completeTask('document'), { once: true });
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => completeTask('fonts'));
  } else {
    completeTask('fonts');
  }

  criticalImages.forEach((src) => {
    const image = new Image();
    const finish = () => completeTask(`image:${src}`);
    image.onload = finish;
    image.onerror = finish; // A missing asset must never stall the site.
    image.src = src;
  });
}
