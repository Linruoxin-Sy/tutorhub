/**
 * 根据字符串生成确定性的舒适渐变色，用于头像背景。
 *
 * 算法思路：
 * 1. 对字符串做 DJB2 哈希，得到确定性整数
 * 2. 用哈希值决定主色相 (0-360)
 * 3. 副色相在主色相附近偏移 30-60°，保证相邻色和谐
 * 4. 饱和度、明度限制在舒适范围（避免刺眼）
 * 5. 返回 CSS `background` 值（135° 对角线渐变）
 *
 * @param input 任意字符串（通常是用户名）
 * @returns CSS background 属性值，例如 "linear-gradient(135deg, hsl(220, 65%, 50%), hsl(260, 55%, 45%))"
 */
export function getAvatarGradient(input: string): string {
  // 1. DJB2 哈希
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
  }
  hash = Math.abs(hash);

  // 2. 主色相 (0-360)
  const hue1 = hash % 360;
  // 副色相偏移 30-60°，保证和谐
  const hue2 = (hue1 + 30 + (hash % 31)) % 360;

  // 3. 饱和度和明度控制在舒适范围
  const sat1 = 55 + (hash % 20); // 55-75
  const light1 = 45 + (hash % 15); // 45-60
  const sat2 = 50 + (hash % 20); // 50-70
  const light2 = 40 + (hash % 20); // 40-60

  return `linear-gradient(135deg, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%))`;
}

/**
 * 获取与渐变背景协调的文字颜色（黑色或白色），确保可读性。
 *
 * 根据主色相的亮度判断：亮度 ≥ 50 返回深色文字，否则返回白色。
 *
 * @param input 任意字符串（与 getAvatarGradient 使用相同输入）
 * @returns CSS 颜色值 "white" | "#1f2937"（gray-900）
 */
export function getAvatarTextColor(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
  }
  hash = Math.abs(hash);

  const light1 = 45 + (hash % 15);

  // 根据 HSL 亮度判断：亮度 >= 50 用深色文字，否则用白色
  return light1 >= 50 ? '#1f2937' : 'white';
}
