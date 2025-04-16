-- 为categories表添加image_url字段
ALTER TABLE IF EXISTS categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 更新现有分类添加默认图像URL (可选)
UPDATE categories
SET image_url = 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=' || name
WHERE image_url IS NULL;

-- 创建或替换用于获取每个分类下笔刷数量的函数
CREATE OR REPLACE FUNCTION get_brush_counts_by_category()
RETURNS TABLE(category_id uuid, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT b.category_id, COUNT(b.id)
  FROM brushes b
  GROUP BY b.category_id;
END;
$$ LANGUAGE plpgsql; 