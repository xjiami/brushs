-- 创建用于获取每个分类下笔刷数量的函数
CREATE OR REPLACE FUNCTION get_brush_counts_by_category()
RETURNS TABLE(category_id uuid, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT b.category_id, COUNT(b.id)
  FROM brushes b
  GROUP BY b.category_id;
END;
$$ LANGUAGE plpgsql; 