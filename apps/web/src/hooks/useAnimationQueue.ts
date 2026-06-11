/**
 * 全局动画队列 —— 让所有 useElementInView 实例共享同一个队列，
 * 实现错峰播放：多个元素同时进入视口时按入队顺序依次执行，每两个间隔 staggerDelay ms。
 */
const queue: (() => void)[] = [];
let isFlushing = false;
const STAGGER_DELAY = 120;

function flush() {
  if (isFlushing || queue.length === 0) return;
  isFlushing = true;
  const task = queue.shift()!;
  task();
  setTimeout(() => {
    isFlushing = false;
    flush();
  }, STAGGER_DELAY);
}

export function enqueue(task: () => void) {
  queue.push(task);
  flush();
}
