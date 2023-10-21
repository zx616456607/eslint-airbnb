import { useMemo } from 'react';

const useTableCommon = (selectedIndex: number, data: unknown[]) => {
  // 是否有已选中模块
  const hasSelected = useMemo(() => selectedIndex > -1, [selectedIndex]);
  // 是否可以“上移”
  const canMoveAbleUp = useMemo(() => {
    if (hasSelected && selectedIndex > 0) {
      return true;
    }
    return false;
  }, [hasSelected, selectedIndex]);
  // 是否可以“下移”
  const canMoveAbleDown = useMemo(() => {
    if (hasSelected && selectedIndex < data.length - 1) {
      return true;
    }
    return false;
  }, [hasSelected, data]);
  // “上移”按钮的type
  const moveUpType = useMemo(() => (canMoveAbleUp ? { type: 'primary' } : {}), [canMoveAbleUp]);
  // “下移”按钮的type
  const moveDownType = useMemo(() => (canMoveAbleDown ? { type: 'primary' } : {}), [canMoveAbleDown]);
  // “删除”按钮的type
  const deleteType = useMemo(() => (hasSelected ? { type: 'primary' } : {}), [hasSelected]);
  return {
    hasSelected,
    canMoveAbleUp,
    canMoveAbleDown,
    moveUpType,
    moveDownType,
    deleteType,
  };
};

export default useTableCommon;
